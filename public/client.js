/**
 * Work based on the Three JS Ocean examples at 
 * https://threejs.org/examples/?q=water#webgl_shaders_ocean
 */
import * as THREE from 'three';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import Stats from './jsm/libs/stats.module.js';
import { GUI } from './jsm/libs/lil-gui.module.min.js';
import { Water } from './jsm/objects/Water.js';
import { Sky } from './jsm/objects/Sky.js';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(30, 30, 100);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI * 0.495;
controls.target.set(0, 10, 0);
controls.minDistance = 40.0;
controls.maxDistance = 200.0;

const sun = new THREE.Vector3();
const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
const water = new Water(
    waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load('textures/waternormals.jpg', function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    }),
    alpha: 1.0,
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    distortionScale: 3.7,
    fog: scene.fog !== undefined
}
);
water.rotation.x = -Math.PI / 2;

scene.add(water);

const sky = new Sky();
sky.scale.setScalar(10000);
scene.add(sky);

let uniforms = sky.material.uniforms;
uniforms['turbidity'].value = 10;
uniforms['rayleigh'].value = 2;
uniforms['mieCoefficient'].value = 0.005;
uniforms['mieDirectionalG'].value = 0.8;

const parameters = {
    inclination: 0.49,
    azimuth: 0.205
};

const pmremGenerator = new THREE.PMREMGenerator(renderer);

function updateSun() {

    var theta = Math.PI * (parameters.inclination - 0.5);
    var phi = 2 * Math.PI * (parameters.azimuth - 0.5);

    sun.x = Math.cos(phi);
    sun.y = Math.sin(phi) * Math.sin(theta);
    sun.z = Math.sin(phi) * Math.cos(theta);

    sky.material.uniforms['sunPosition'].value.copy(sun);
    water.material.uniforms['sunDirection'].value.copy(sun).normalize();

    scene.environment = pmremGenerator.fromScene(sky).texture;
}

updateSun();

const geometry = new THREE.BoxGeometry(30, 30, 30);
const material = new THREE.MeshStandardMaterial({
    roughness: 0
});

const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}, false);

const stats = Stats();
document.body.appendChild(stats.dom);

const gui = new GUI();

const skyFolder = gui.addFolder('Sky');
skyFolder.add(parameters, 'inclination', 0, 0.5, 0.0001).onChange(updateSun);
skyFolder.add(parameters, 'azimuth', 0, 1, 0.0001).onChange(updateSun);
skyFolder.open();

const waterFolder = gui.addFolder('Water');
waterFolder.add(water.material.uniforms.distortionScale, 'value', 0, 8, 0.1).name('distortionScale');
waterFolder.add(water.material.uniforms.size, 'value', 0.1, 10, 0.1).name('size');
waterFolder.open();

function animate() {

    requestAnimationFrame(animate);
    render();
    stats.update();
}

function render() {
    var time = performance.now() * 0.001;

    cube.position.y = Math.sin(time) * 20 + 5;
    cube.rotation.x = time * 0.5;
    cube.rotation.z = time * 0.51;

    water.material.uniforms['time'].value += 1.0 / 60.0;

    renderer.render(scene, camera);
}

animate();