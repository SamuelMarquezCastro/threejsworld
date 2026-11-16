import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

//add orbit controls
const controls = new OrbitControls( camera, renderer.domElement );

const skyscraper = new THREE.Group();
const wallMaterial = new THREE.MeshBasicMaterial( {
  color: 0x4aa8d8,
  transparent: true,
  opacity: 0.65,
  side: THREE.DoubleSide
} );


const width = 4;
const depth = 4;
const height = 8;
const thickness = 0.2;

function addWall( wallWidth, wallDepth, x, y, z ) {
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry( wallWidth, height, wallDepth ),
    wallMaterial
  );
  wall.position.set( x, y, z );
  skyscraper.add( wall );
}

addWall( width, thickness, 0, height / 2, depth / 2 );
addWall( width, thickness, 0, height / 2, -depth / 2 );
addWall( thickness, depth, width / 2, height / 2, 0 );
addWall( thickness, depth, -width / 2, height / 2, 0 );
scene.add( skyscraper );

camera.position.set( 8, 6, 12 );
camera.lookAt( 0, height / 2, 0 );

function animate( time ) {



  renderer.render( scene, camera );

}
