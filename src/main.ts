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

        const ambientLight = new THREE.AmbientLight(0xe0f0ff, 0.5);
        scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffeedd, 2);
        sunLight.position.set(-10, 20, 10); // direction = vec(this, origo)
        sunLight.castShadow = true;
        scene.add(sunLight);

        let aksling: THREE.Object3D | undefined;
        let belter: (THREE.Object3D | undefined)[] = [];
        let seiler: (THREE.Object3D | undefined)[] = [];
        let bladeAngle = 0;

        const loader = new GLTFLoader();

        loader.load("gravemaskin.glb",
            // called when the resource is loaded
            (gltf: GLTF) => {
                scene.add(gltf.scene);
                const colors: Record<string, number> = { belte: 0x555555, kjøring: 0xeeeedd, motorboks: 0x8b5a2b, ledd1: 0x555555, ledd2: 0x8b2222, ledd3: 0xddccaa, spade: 0xddccaa };
                gltf.scene.traverse(obj => {
                    if (obj instanceof THREE.Mesh) {
                        obj.material = new THREE.MeshStandardMaterial({ color: colors[obj.name] })
                        obj.castShadow = true
                        obj.receiveShadow = true
                    }
                });
                let belte = gltf.scene.getObjectByName("belte")
                belter.push(belte)
                let belte1 = belte?.clone()
                belte1?.rotateZ(2*Math.PI/3);
                let belte2 = belte?.clone()
                belte2?.rotateZ(4*Math.PI/3);
                belter.push(belte1, belte2)

                if (belte1) scene.add(belte1)
                if (belte2) scene.add(belte2)
                aksling = gltf.scene.getObjectByName("motorboks")
            },
            // called while loading is progressing
            (xhr: ProgressEvent) => {
                console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
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
        const pyramidMaterial = new THREE.MeshLambertMaterial({color: 0x77dd91})
        const pyramid = new THREE.Mesh(pyramidGeometry, pyramidMaterial);
        scene.add(pyramid);

        const axes = new THREE.AxesHelper(5);
        scene.add(axes);

        const grid = new THREE.GridHelper(10, 4)
        scene.add(grid);

        const ground = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial({ color: 0x2e8a45 }));
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

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
            belter.forEach(it => it?.rotateZ(-rotationControls.bladeω * timer.getDelta()))
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