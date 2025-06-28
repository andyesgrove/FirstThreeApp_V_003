// 
// IMPORTS 
// 
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';


// 
// TEXTURES 
// 
let textureLoader = new THREE.TextureLoader();

let particleTexture = textureLoader.load('./static/star_01.png')

let shadowTexture = textureLoader.load('./static/simpleShadow.jpg')

// 
// UTILS 
// 
let sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
}
let aspectRatio = sizes.width / sizes.height;
const canvas = document.querySelector('canvas.webgl');

// 
// SCENE 
// 
const scene = new THREE.Scene();

// 
// OBJECTS 
// 
let innerObjectGeometry = new THREE.IcosahedronGeometry(1, 1);
let innerObjectMaterial = new THREE.MeshStandardMaterial({
    color: 'white',
    flatShading: true,
    side: THREE.DoubleSide
})

let innerObject = new THREE.Mesh(innerObjectGeometry, innerObjectMaterial);

let outerObjectGeometry = new THREE.IcosahedronGeometry(1, 1);
let outerObjectMaterial = new THREE.MeshStandardMaterial({
    color: 'white',
    wireframe: true,
})

let outerObject = new THREE.Mesh(outerObjectGeometry, outerObjectMaterial);
outerObject.scale.set(1.25, 1.25, 1.25);

let mainObject = new THREE.Group();

mainObject.add(innerObject, outerObject);
scene.add(mainObject);



// 
// PLANE
// 
const planeGeometry = new THREE.PlaneGeometry(100, 50);
const planeMaterial = new THREE.MeshBasicMaterial({
    color: '#222',
    side: THREE.DoubleSide
})

const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.rotation.x = Math.PI / 2;
planeMesh.position.y = -1.5;
scene.add(planeMesh);


// 
// SHADOW 
// 
let mainObjectShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 1.5),
    new THREE.MeshBasicMaterial({
        color: 'black',
        transparent: true,
        alphaMap: shadowTexture,
        opacity: 1
    })
)

mainObjectShadow.position.y = planeMesh.position.y + 0.01;
mainObjectShadow.rotation.x = - Math.PI / 2;

scene.add(mainObjectShadow)


// 
// PROCEDURAL CLOUDS
// 
let makeCloudsMesh = () => {
    let cloudsMesh = new THREE.Group();
    let cloudPositions = [
        { x: -15, y: 7, z: 0 },
        { x: -15, y: 7, z: -15 },
        { x: 5, y: 5, z: -14 },
        { x: 15, y: 7, z: 0 }
    ]

    for (let j = 0; j < 4; j++) {
        let cloud = new THREE.Group();

        let cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
        let cubeMaterial = new THREE.MeshBasicMaterial();

        for (let i = 0; i < 8; i++) {
            let cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
            cubeMesh.rotation.x = (Math.random() * Math.PI) / 2;
            cubeMesh.rotation.y = (Math.random() * Math.PI) / 2;
            cubeMesh.rotation.z = (Math.random() * Math.PI) / 2;

            cubeMesh.position.x += i - Math.random() * 0.1;

            let scaleRandom = Math.random();
            cubeMesh.scale.set(scaleRandom, scaleRandom, scaleRandom);

            cloud.add(cubeMesh)
        }

        cloud.position.set(cloudPositions[j].x, cloudPositions[j].y, cloudPositions[j].z);

        cloudsMesh.add(cloud);
    }

    return cloudsMesh;
}
let cloudsMesh = makeCloudsMesh();
scene.add(cloudsMesh);

// 
// PARTICLES
// 
let backgroundParticlesGeometry = new THREE.BufferGeometry();
let particlesCount = 1500;

let particlesPositionsArr = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i++) {
    particlesPositionsArr[i] = (Math.random() - 0.5) * 10;
    // [-5 to 5]
}

backgroundParticlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlesPositionsArr, 3));


let backgroundParticlesMaterial = new THREE.PointsMaterial();
backgroundParticlesMaterial.size = 0.15;
backgroundParticlesMaterial.transparent = true;
backgroundParticlesMaterial.depthWrite = false;
backgroundParticlesMaterial.alphaMap = particleTexture;

let backgroundParticles = new THREE.Points(
    backgroundParticlesGeometry,
    backgroundParticlesMaterial
);

scene.add(backgroundParticles)


// 
// LIGHTS 
// 
let ambientLight = new THREE.AmbientLight('white', 1);
scene.add(ambientLight);

let directionalLight = new THREE.DirectionalLight('red', 3);
directionalLight.position.x = -5;
scene.add(directionalLight);

let hemisphereLight = new THREE.HemisphereLight('blue', '#00ff00', 3);
scene.add(hemisphereLight);

// 
// CAMERA 
// 
let camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 100);
camera.position.z = 10;
camera.position.y = 2;
camera.position.x = 3;
scene.add(camera);

// 
// RENDERER 
// 
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);

// 
// CONTROLS 
// 
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// 
// RESIZE HANDLE 
// 
window.addEventListener('resize', () => {
    sizes.height = window.innerHeight;
    sizes.width = window.innerWidth;

    renderer.setSize(sizes.width, sizes.height);
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
})

// 
// HANDLING MOUSE MOVE
// 
let mouseX = 0;
let mouseY = 0;

let onDocumentMouseMove = (event) => {
    mouseX = event.clientX - (sizes.width / 2);
    mouseY = event.clientY - (sizes.height / 2);
}

document.addEventListener('mousemove', onDocumentMouseMove)


// 
// ANIMATION 
// 
let clock = new THREE.Clock();


let mainObjectRotationToggleFlag = true;

let animation = () => {
    let elapsedTime = clock.getElapsedTime();

    mainObject.position.y = (1 + Math.sin(elapsedTime)) * 0.25;

    mainObjectShadow.material.opacity = 0.7 - mainObject.position.y;

    let factor = mainObject.position.y / 2;

    if (mainObject.position.y > 0.5) {
        factor = factor + 0.1;
    }


    if (mainObject.position.y <= 0.000004) {
        mainObjectRotationToggleFlag = !mainObjectRotationToggleFlag;
    }

    if (mainObjectRotationToggleFlag) {
        innerObject.rotation.y += factor * 0.25;
        outerObject.rotation.z += -1 * factor * 0.1;
        outerObject.rotation.y += -1 * factor * 0.1;
    }
    else {
        innerObject.rotation.y -= factor * 0.25;
        outerObject.rotation.z -= -1 * factor * 0.1;
        outerObject.rotation.y -= -1 * factor * 0.1;
    }

    backgroundParticles.rotation.z += 0.002;
    backgroundParticles.rotation.x += 0.002;

    backgroundParticles.rotation.y += 0.25 * (mouseX * 0.001 - backgroundParticles.rotation.y);
    backgroundParticles.rotation.x += 0.25 * (mouseY * 0.001 - backgroundParticles.rotation.x);


    cloudsMesh.position.x = Math.sin(elapsedTime * 0.5);
    cloudsMesh.position.z = Math.cos(elapsedTime * 0.1);

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animation);
}

animation()

//
// GSAP
//

let animateView0 = () => {
    console.log('Animatng view ' + viewNum);
    gsap.to(camera.position, { y: 1, x: 0, z: 7, duration: 0.8 });

    gsap.to(innerObject.scale, { y: 0, x: 0, z: 0, duration: 1 });

    setTimeout(() => {
        innerObject.geometry = new THREE.IcosahedronGeometry(1, 1);

        gsap.to(innerObject.scale, { y: 1, x: 1, z: 1, duration: 1 });

        gsap.to(camera.position, { y: 1, x: -2, z: 7, duration: 1 });
    }, 1000)
}

let animateView1 = () => {
    console.log('Animatng view ' + viewNum);
    gsap.to(camera.position, { y: 8, x: 1, z: 0, duration: 0.8 });
    gsap.to(innerObject.scale, { y: 0, x: 0, z: 0, duration: 1 });

    setTimeout(() => {
        innerObject.geometry = new THREE.TorusGeometry(0.75, 0.2, 16, 100);
        gsap.to(innerObject.scale, { y: 1, x: 1, z: 1, duration: 1 });

        gsap.to(camera.position, { y: 5, x: 0, z: 3, duration: 1 });
    }, 1000)
}

let animateView2 = () => {
    console.log('Animatng view ' + viewNum);

    gsap.to(camera.position, { y: 5, x: 0, z: -6, duration: 0.8 });

    gsap.to(innerObject.scale, { y: 0, x: 0, z: 0, duration: 1 });

    setTimeout(() => {
        innerObject.geometry = new THREE.SphereGeometry(
            1,
            4,
            9,
            0,
            Math.PI * 2,
            Math.PI * 2,
            Math.PI * 2,
        );
        gsap.to(innerObject.scale, { y: 1, x: 1, z: 1, duration: 1 });

        gsap.to(camera.position, { y: 1, x: 0, z: -3, duration: 1 });
    }, 1000)

}

let animateView3 = () => {
    console.log('Animatng view ' + viewNum);
    gsap.to(camera.position, { y: 2, x: -1.3, z: 2, duration: 0.8 });

    gsap.to(innerObject.scale, { y: 0, x: 0, z: 0, duration: 1 });

    setTimeout(() => {
        innerObject.geometry = new THREE.OctahedronGeometry(1, 1);

        gsap.to(innerObject.scale, { y: 1, x: 1, z: 1, duration: 1 });

        gsap.to(camera.position, { y: 1, x: -2, z: 5, duration: 1 });
    }, 1000)
}

let animateView4 = () => {
    console.log('Animatng view ' + viewNum);
    gsap.to(camera.position, { y: 1, x: 0, z: 7, duration: 0.8 });

    gsap.to(innerObject.scale, { y: 0, x: 0, z: 0, duration: 1 });

    setTimeout(() => {
        innerObject.geometry = new THREE.IcosahedronGeometry(1, 1);

        gsap.to(innerObject.scale, { y: 1, x: 1, z: 1, duration: 1 });

        gsap.to(camera.position, { y: 1, x: 2, z: 7, duration: 1 });
    }, 1000)
}

let switchAnimation = () => {
    console.log('Requesting animation for ', viewNum);
    if (viewNum == 0) {
        animateView0()
    }
    else if (viewNum == 1) {
        animateView1()
    }
    else if (viewNum == 2) {
        animateView2()
    }
    else if (viewNum == 3) {
        animateView3()
    }
    else if (viewNum == 4) {
        animateView4()
    }
}


let viewNum = 0;

document.getElementById('next-view').addEventListener("click", () => {
    if (viewNum === 4) return;
    viewNum += 1;

    switchAnimation()
})


document.getElementById('prev-view').addEventListener("click", () => {
    if (viewNum === 0) return;
    viewNum -= 1;

    switchAnimation()
})

// gsap.to(camera.position, { y: 5, x: 0, z: -6, duration: 1 })
// gsap.to(mainObject.scale, { y: 2, x: 2, z: 2, duration: 1, delay: 1 })
// gsap.to(camera.position, { y: 3, x: 2, z: 10, duration: 1, delay: 2 })
// setTimeout(() => {
//     gsap.to(mainObject.scale, { y: 1, x: 1, z: 1, duration: 1})
// }, 3000)





