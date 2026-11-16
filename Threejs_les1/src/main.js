import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GUI from 'lil-gui';

// register scroll trigger
gsap.registerPlugin(ScrollTrigger);



const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

window.addEventListener( 'resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );
  renderer.setSize( width, height );
});


//eventlistener scroll, log scrollY
window.addEventListener('scroll', () => {
  console.log(window.scrollY);
  //lower camera position based on scrollY
  camera.position.y = -window.scrollY * 0.006;
});

const controls = new OrbitControls( camera, renderer.domElement );
controls.enabled = false;

const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

const light = new THREE.AmbientLight( 0xffffff, 0.3 );
scene.add( light );

const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
scene.add( directionalLight );

const directionalLightHelper = new THREE.DirectionalLightHelper( directionalLight, 1 );
scene.add( directionalLightHelper );

const geometry = new THREE.TorusGeometry( 2, 0.8, 16, 60 );
const material = new THREE.MeshToonMaterial( { color: 0xffffff,} );
const torus = new THREE.Mesh( geometry, material );
torus.position.set( 2, 1, 0 );
scene.add( torus );



// cone
const coneGeometry = new THREE.ConeGeometry( 2, 5, 32 ); 
const cone = new THREE.Mesh( coneGeometry, material );
cone.position.set( -6, -4, 0 );
scene.add( cone );


//torusknet
const torusKnotGeometry = new THREE.TorusKnotGeometry( 1.5, 0.5, 100, 16 );
const torusKnot = new THREE.Mesh( torusKnotGeometry, material );
torusKnot.position.set( 6, -9, 0 );
scene.add( torusKnot );


camera.position.z = 5;

// control direction light position xyz with lil gui and panel

//control direction light rotation xyz with lil gui and panel


const gui = new GUI();
const lightFolder = gui.addFolder('Directional Light');
lightFolder.add(directionalLight.position, 'x', -10, 10);
lightFolder.add(directionalLight.position, 'y', -10, 10);
lightFolder.add(directionalLight.position, 'z', -10, 10);
lightFolder.open();

const rotationFolder = gui.addFolder('Directional Light Rotation');
rotationFolder.add(directionalLight.rotation, 'x', -Math.PI, Math.PI);
rotationFolder.add(directionalLight.rotation, 'y', -Math.PI, Math.PI);
rotationFolder.add(directionalLight.rotation, 'z', -Math.PI, Math.PI);
rotationFolder.open();


gsap.to(cone.rotation, {
  x: "+=" + (Math.PI * 2),
  duration: 1.5,
  ease: "power2.inOut",
  scrollTrigger: {
    trigger: ".projects",
    start: "top center",
    toggleActions: "play none reverse none",
    once: false,
  },
});


//pointsmaterial, create 1000 points with random positions, white
const pointsGeometry = new THREE.BufferGeometry();
const pointsMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.025,
  sizeAttenuation: true
});

const positions = new Float32Array(1000 * 3);
const minStarDepth = 3;
const starZMin = -10;
const starZMax = camera.position.z - minStarDepth;

for (let i = 0; i < positions.length; i += 3) {
  positions[i] = Math.random() * 20 - 10;
  positions[i + 1] = Math.random() * 20 - 10;
  positions[i + 2] = starZMin + Math.random() * (starZMax - starZMin);
}

pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const points = new THREE.Points(pointsGeometry, pointsMaterial);
scene.add(points);

function animate( time ) {


  renderer.render( scene, camera );

}