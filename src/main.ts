import * as THREE from 'three/webgpu';
import Stats from "three/addons/libs/stats.module.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import GUI from "three/addons/libs/lil-gui.module.min.js";
{
    const renderDiv = document.getElementById('threejs') as HTMLDivElement;


    // once everything is loaded, we run our Three.js stuff.
    async function init() {
        initStats()

        let scene = new THREE.Scene()
        const renderer = new THREE.WebGPURenderer({ antialias: true });
        renderer.setClearColor(new THREE.Color(0x444444));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;

        renderDiv.appendChild(renderer.domElement);

        let camera = new THREE.PerspectiveCamera( 80, window.innerWidth / window.innerHeight, 1, 1000 );
        scene.add(camera);

        const controls = new OrbitControls(camera, renderer.domElement);
        const timer = new THREE.Timer()

        let light = new THREE.SpotLight(0xccffcc);
        light.position.set(0, 4, 0);
        light.intensity = 10;
        scene.add(light);

        const ambiColor = "#0c0c0c";
        const ambientLight = new THREE.AmbientLight(ambiColor);
        scene.add(ambientLight);

        const pyramidGeometry = new THREE.BufferGeometry();
        const vertices = new Float32Array( [ // pyramide med kvadrat under
            // bunnkvadrat del1
             1.0, 0.0,  1.0,
            -1.0, 0.0,  1.0,
             1.0, 0.0, -1.0,
            // bunnkvadrat del2
             1.0, 0.0, -1.0,
            -1.0, 0.0,  1.0,
            -1.0, 0.0, -1.0,
            // vegg 1
            1.0, 0.0,  1.0,
            1.0, 0.0, -1.0,
            0.0, 2.0,  0.0,
            // vegg 2
            -1.0, 0.0, 1.0,
             1.0, 0.0, 1.0,
             0.0, 2.0, 0.0,
            // vegg 3
            -1.0, 0.0, -1.0,
            -1.0, 0.0,  1.0,
             0.0, 2.0,  0.0,
            // vegg 4
             1.0, 0.0, -1.0,
            -1.0, 0.0, -1.0,
             0.0, 2.0,  0.0,
        ] );
        pyramidGeometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) ); // itemsize 3 fordi xyz 3 akser
        pyramidGeometry.computeVertexNormals()
        const pyramidMaterial = new THREE.MeshLambertMaterial({color: 0x44ffcc})
        const pyramid = new THREE.Mesh(pyramidGeometry, pyramidMaterial);
        scene.add(pyramid);

        const axes = new THREE.AxesHelper(5);
        scene.add(axes);

        const grid = new THREE.GridHelper(10, 4)
        scene.add(grid);

        light.castShadow = true;
        pyramid.castShadow = true;
        grid.receiveShadow = true;

        camera.position.set(1, 4, 3);
        camera.lookAt(0, 0, 0);

        const rotationControls = {
            ωX: 0.0,
            ωY: 0.0,
            ωZ: 0.0,
        };

        const gui = new GUI();
        gui.add(rotationControls, 'ωX', 0, 2*Math.PI);
        gui.add(rotationControls, 'ωY', 0, 2*Math.PI);
        gui.add(rotationControls, 'ωZ', 0, 2*Math.PI);

        const xaxis = new THREE.Vector3(1, 0, 0)
        const yaxis = new THREE.Vector3(0, 1, 0)
        const zaxis = new THREE.Vector3(0, 0, 1)

        const stats = initStats()

        await renderer.setAnimationLoop((time) => {
            timer.update(time);
            stats.update()
            controls.update(timer.getDelta());

            pyramid.rotateOnWorldAxis(xaxis, rotationControls.ωX * timer.getDelta())
            pyramid.rotateOnWorldAxis(yaxis, rotationControls.ωY * timer.getDelta())
            pyramid.rotateOnWorldAxis(zaxis, rotationControls.ωZ * timer.getDelta())

            renderer.render(scene, camera)
        });
    }

    function initStats() {
        const stats = new Stats();
        stats.setMode(0);
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';
        document.getElementById("Stats-output")!!.appendChild(stats.domElement);
        return stats
    }

    window.onload = init;
}