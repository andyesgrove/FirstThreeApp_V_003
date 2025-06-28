// 
// Importing Utilities 
// 
import * as THREE from "three";
import {ARButton} from 'three/addons/webxr/ARButton.js';
console.log(ARButton);



let canvas = document.querySelector('.webgl');

// 
// Sizes 
//
let sizes = {
    height: window.innerHeight,
    width: window.innerWidth
}

//
// Scene
// 
let scene = new THREE.Scene();

//
// Object
//
let width = 3;
let height = 3;
let depth = 3;
let cubeGeometry = new THREE.BoxGeometry(width, height, depth);
let cubeMaterial = new THREE.MeshBasicMaterial({color: 'red'});
let cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
cubeMesh.position.z = -8;
scene.add(cubeMesh);

//
// Camera
//
let camera = new THREE.PerspectiveCamera(
    75, // 45 to 75
    sizes.width/sizes.height, // aspectRatio
    0.1, // near => 10 cm
    100); // far => 100 m

camera.position.z = 10;
// camera.position.x = 7;
// camera.position.y = 3;

scene.add(camera);

//
// Renderer
//
let renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height)
renderer.render(scene, camera);
renderer.setAnimationLoop(animation);


// Set up XR
let setUpXR = () => {
    renderer.xr.enabled = true;
let arButton = ARButton.createButton(renderer);
document.body.appendChild(arButton);
}

setUpXR();

function animation(time){
    cubeMesh.rotation.x = time/1000;
    cubeMesh.rotation.y = time/2000;
    renderer.render(scene, camera);
}

// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;