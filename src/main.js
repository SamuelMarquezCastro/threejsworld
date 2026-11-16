import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2( 0x24263f, 0.014 );

const camera = new THREE.PerspectiveCamera( 48, window.innerWidth / window.innerHeight, 0.1, 200 );
const renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );
renderer.setSize( window.innerWidth, window.innerHeight );
document.querySelector( '#world' ).appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 10;
controls.maxDistance = 90;
controls.maxPolarAngle = Math.PI / 2 - 0.04;
controls.target.set( 0, 6, 0 );
camera.position.set( 15, 11, 23 );
controls.update();

scene.add( new THREE.HemisphereLight( 0xc5d8ff, 0x60526c, 2.0 ) );
const sunset = new THREE.DirectionalLight( 0xffd0a0, 2.0 );
sunset.position.set( -15, 20, 12 );
scene.add( sunset );

function makeTexture( width, height, draw ) {
  const canvas = document.createElement( 'canvas' );
  canvas.width = width;
  canvas.height = height;
  draw( canvas.getContext( '2d' ) );

  const texture = new THREE.CanvasTexture( canvas );
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min( 8, renderer.capabilities.getMaxAnisotropy() );
  return texture;
}

function addBox( group, material, width, height, depth, x, y, z ) {
  const box = new THREE.Mesh( new THREE.BoxGeometry( width, height, depth ), material );
  box.position.set( x, y, z );
  group.add( box );
  return box;
}

const skyscraper = new THREE.Group();
const width = 4;
const depth = 4;
const height = 12;
const thickness = 0.2;

const facade = makeTexture( 256, 512, ( context ) => {
  context.fillStyle = '#183941';
  context.fillRect( 0, 0, 256, 512 );

  for ( let row = 0; row < 12; row++ ) {
    for ( let column = 0; column < 5; column++ ) {
      const x = column * 50 + 13;
      const y = row * 42 + 8;
      const lit = ( row * 7 + column * 3 ) % 11 < 7;
      const glass = context.createLinearGradient( x, y, x, y + 32 );
      glass.addColorStop( 0, lit ? '#ffe1a6' : '#417c83' );
      glass.addColorStop( 1, lit ? '#a65b38' : '#173f50' );
      context.fillStyle = '#0b252f';
      context.fillRect( x - 3, y - 3, 36, 36 );
      context.fillStyle = glass;
      context.fillRect( x, y, 30, 30 );
      context.fillStyle = '#12303b';
      context.fillRect( x + 14, y, 2, 30 );
    }
  }
} );

const wallMaterial = new THREE.MeshStandardMaterial( { color: 0xd4eee6, map: facade } );
const stone = new THREE.MeshStandardMaterial( { color: 0x263e49, metalness: 0.15 } );
const gold = new THREE.MeshStandardMaterial( { color: 0xc4975e, metalness: 0.35 } );
const glow = new THREE.MeshBasicMaterial( { color: 0xffc686 } );

function addWall( wallWidth, wallDepth, x, y, z ) {
  addBox( skyscraper, wallMaterial, wallWidth, height, wallDepth, x, y, z );
}

addWall( width, thickness, 0, height / 2, depth / 2 );
addWall( width, thickness, 0, height / 2, -depth / 2 );
addWall( thickness, depth, width / 2, height / 2, 0 );
addWall( thickness, depth, -width / 2, height / 2, 0 );

addBox( skyscraper, stone, 4.55, 0.5, 4.55, 0, 0.25, 0 );
for ( const x of [ -2.07, 2.07 ] ) {
  for ( const z of [ -2.07, 2.07 ] ) {
    addBox( skyscraper, gold, 0.16, height, 0.16, x, height / 2, z );
  }
}

// Verspringend dak met een verlichte kroon.
for ( let level = 0; level < 4; level++ ) {
  const size = 4.42 - level * 0.84;
  const y = height + level * 0.66;
  addBox( skyscraper, stone, size, 0.66, size, 0, y + 0.32, 0 );
  addBox( skyscraper, glow, size + 0.04, 0.045, size + 0.04, 0, y + 0.56, 0 );
}
addBox( skyscraper, gold, 0.12, 1.75, 0.12, 0, 15.35, 0 );
const beacon = new THREE.Mesh( new THREE.SphereGeometry( 0.12, 12, 8 ), glow );
beacon.position.y = 16.25;
skyscraper.add( beacon );

addBox( skyscraper, stone, 1.4, 2.25, 0.21, 0, 1.13, 2.14 );
for ( const x of [ -0.31, 0.31 ] ) {
  addBox( skyscraper, gold, 0.56, 1.71, 0.07, x, 0.98, 2.27 );
  addBox( skyscraper, glow, 0.45, 1.18, 0.04, x, 1.13, 2.31 );
}

const nameTexture = makeTexture( 512, 128, ( context ) => {
  context.fillStyle = '#ffffff';
  context.fillRect( 0, 0, 512, 128 );
  context.fillStyle = '#152d38';
  context.textAlign = 'center';
  context.font = 'bold 39px Arial';
  context.fillText( 'Samuel Marquez Castro', 256, 79 );
} );
const nameCard = new THREE.Mesh(
  new THREE.PlaneGeometry( 2.75, 0.6875 ),
  new THREE.MeshBasicMaterial( { map: nameTexture } )
);
nameCard.position.set( 0, 2.75, 2.13 );
skyscraper.add( nameCard );
scene.add( skyscraper );

window.addEventListener( 'resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
} );

renderer.setAnimationLoop( animate );

function animate() {
  controls.update();
  renderer.render( scene, camera );
}
