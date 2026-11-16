import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

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
const flight = new THREE.QuadraticBezierCurve3(
  new THREE.Vector3( 11, 26, 46 ),
  new THREE.Vector3( -1, 9, 25 ),
  new THREE.Vector3( 0.65, 3.4, 11 )
);
const overviewTarget = new THREE.Vector3( 0, 7, 0 );
const entranceTarget = new THREE.Vector3( 0, 2.7, 1 );
const reducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' );
let flightStart = reducedMotion.matches ? null : performance.now();
camera.position.copy( flight.v0 );
controls.target.copy( overviewTarget );
controls.update();

controls.addEventListener( 'start', () => {
  flightStart = null;
} );
document.querySelector( '#replay' ).addEventListener( 'click', () => {
  flightStart = performance.now();
} );

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

const city = new THREE.Group();
const ground = new THREE.MeshStandardMaterial( { color: 0x252939, roughness: 0.95 } );
const pavement = new THREE.MeshStandardMaterial( { color: 0x49515b } );
const roof = new THREE.MeshStandardMaterial( { color: 0x293345 } );
addBox( city, ground, 140, 0.2, 140, 0, -0.22, 0 );
addBox( city, pavement, 10.8, 0.12, 10.8, 0, -0.06, 0 );

const cityFacades = [];
for ( const [ wallColor, windowColor ] of [
  [ '#343b54', '#9ab1d5' ],
  [ '#374452', '#91b9bb' ],
  [ '#483a52', '#cab5d1' ],
] ) {
  const windows = makeTexture( 128, 32, ( context ) => {
    context.fillStyle = wallColor;
    context.fillRect( 0, 0, 128, 32 );
    for ( let column = 0; column < 5; column++ ) {
      context.fillStyle = Math.random() < 0.55 ? windowColor : '#202937';
      context.fillRect( 6 + column * 24, 7, 13, 16 );
    }
  } );
  windows.wrapT = THREE.RepeatWrapping;
  cityFacades.push( windows );
}

// Het middelste blok is het plein. De straat voor de ingang blijft vrij.
for ( let row = -3; row <= 2; row++ ) {
  for ( let column = -3; column <= 3; column++ ) {
    if ( column === 0 && row >= 0 ) continue;

    const x = column * 8;
    const z = row * 8;
    const floors = 3 + Math.floor( Math.random() * 8 );
    const towerHeight = floors * 0.84;
    const towerWidth = 3 + Math.random() * 2;
    const towerDepth = 3 + Math.random() * 2;
    const windows = cityFacades[ Math.floor( Math.random() * cityFacades.length ) ].clone();
    windows.repeat.y = floors;
    const facadeMaterial = new THREE.MeshStandardMaterial( { map: windows } );

    addBox( city, pavement, 5.9, 0.12, 5.9, x, -0.06, z );
    addBox( city, facadeMaterial, towerWidth, towerHeight, towerDepth, x, towerHeight / 2, z );
    addBox( city, roof, towerWidth + 0.16, 0.22, towerDepth + 0.16, x, towerHeight + 0.11, z );
    addBox( city, roof, towerWidth * 0.38, 0.5, towerDepth * 0.38, x, towerHeight + 0.47, z );
  }
}
scene.add( city );

const sculpture = new THREE.Group();
sculpture.position.set( -3.6, 0, 3.6 );
sculpture.rotation.y = -0.28;
addBox( sculpture, stone, 1.7, 0.3, 0.8, 0, 0.15, 0 );
addBox( sculpture, glow, 1.45, 0.035, 0.6, 0, 0.3, 0 );
scene.add( sculpture );

const sculptureMaterial = new THREE.MeshStandardMaterial( {
  color: 0xf3be72,
  emissive: 0x502517,
  roughness: 0.4,
  metalness: 0.35,
  flatShading: true,
} );

const objLoader = new OBJLoader();
objLoader.load( `${import.meta.env.BASE_URL}models/aura.obj`, ( model ) => {
  model.traverse( ( object ) => {
    if ( object.isMesh ) object.material = sculptureMaterial;
  } );
  model.position.y = 0.325;
  sculpture.add( model );
}, undefined, ( error ) => {
  console.error( 'De sculptuur kon niet worden geladen.', error );
} );

window.addEventListener( 'resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
} );

renderer.setAnimationLoop( animate );

function animate( time ) {
  if ( flightStart !== null ) {
    const progress = THREE.MathUtils.clamp( ( time - flightStart ) / 6500, 0, 1 );
    const eased = THREE.MathUtils.smoothstep( progress, 0, 1 );
    camera.position.copy( flight.getPoint( eased ) );
    controls.target.lerpVectors( overviewTarget, entranceTarget, eased );
    if ( progress === 1 ) flightStart = null;
  }

  controls.update();
  renderer.render( scene, camera );
}
