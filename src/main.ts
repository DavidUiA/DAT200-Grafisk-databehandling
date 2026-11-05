import * as THREE from 'three/webgpu';
import Stats from "three/addons/libs/stats.module.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import GUI from "three/addons/libs/lil-gui.module.min.js";
import { GLTFLoader, type GLTF } from "three/addons/loaders/GLTFLoader.js";
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

        let spotLight = new THREE.SpotLight(0xccffcc);
        spotLight.position.set(0, 4, 0);
        spotLight.intensity = 10;
        spotLight.castShadow = true;
        scene.add(spotLight);

        const ambiColor = "#0c0c0c";
        const ambientLight = new THREE.AmbientLight(ambiColor);
        scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 2);
        sunLight.position.set(-10, 20, 10); // direction = vec(this, origo)
        sunLight.castShadow = true;
        scene.add(sunLight);

        let aksling: THREE.Object3D | undefined;
        let blader: (THREE.Object3D | undefined)[] = [];
        let seiler: (THREE.Object3D | undefined)[] = [];
        let bladeAngle = 0;

        const loader = new GLTFLoader();

        loader.load("vindmølle.glb",
            // called when the resource is loaded
            (gltf: GLTF) => {
                scene.add(gltf.scene);
                let blad = gltf.scene.getObjectByName("blad")
                blader.push(blad)
                let blad1 = blad?.clone()
                blad1?.rotateX(2*Math.PI/3);
                let blad2 = blad?.clone()
                blad2?.rotateX(4*Math.PI/3);
                blader.push(blad1, blad2)

                let seil = gltf.scene.getObjectByName("seil")
                seiler.push(seil, blad1?.getObjectByName("seil"), blad2?.getObjectByName("seil"))
                if (blad1) scene.add(blad1)
                if (blad2) scene.add(blad2)
                aksling = gltf.scene.getObjectByName("aksling")
            },
            // called while loading is progressing
            (xhr: ProgressEvent) => {
                console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
            },
            // called when loading has errors
            (error: unknown) => {
                console.error("An error happened", error);
            }
        );

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

        spotLight.castShadow = true;
        pyramid.castShadow = true;
        grid.receiveShadow = true;

        camera.position.set(1, 4, 3);
        camera.lookAt(0, 0, 0);

        const rotationControls = {
            bladeω: 0.0,
            tilt: 0.0,
        };

        const gui = new GUI();
        gui.add(rotationControls, 'bladeω', 0, 2*Math.PI);
        gui.add(rotationControls, 'tilt', -90, 90);


        const stats = initStats()

        await renderer.setAnimationLoop((time) => {
            timer.update(time);
            stats.update()
            controls.update(timer.getDelta());

            let radianTilt = THREE.MathUtils.degToRad(rotationControls.tilt);
            if (bladeAngle + 0.01 < radianTilt) {
                bladeAngle += 5 * timer.getDelta();
                seiler.forEach(it => it?.rotateX(5 * timer.getDelta()))
            } else if (bladeAngle - 0.01 > radianTilt) {
                bladeAngle -= 5 * timer.getDelta();
                seiler.forEach(it => it?.rotateX(-5 * timer.getDelta()))
            }
            blader.forEach(it => it?.rotateX(-rotationControls.bladeω * timer.getDelta()))
            aksling?.rotateY(-rotationControls.bladeω * timer.getDelta())

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