import * as THREE from 'three/webgpu';
import Stats from "three/addons/libs/stats.module.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import GUI from "three/addons/libs/lil-gui.module.min.js";
import { GLTFLoader, type GLTF } from "three/addons/loaders/GLTFLoader.js";
import { Vector3 } from 'three';
{
    const speed = 8

    class BelteSeksjon {
        private progress: number = 0;
        private factor = 1.4

        constructor(public belte: THREE.Object3D<THREE.Object3DEventMap>, progress: number = 0) {
            this.progress = progress;
        }

        tick(addedProgress: number) {
            this.progress += addedProgress;
            if (this.progress < 0) {
                this.progress += 2 * this.factor*Math.PI + 32
            } else if (this.progress <= 16) {
                this.belte.position.x = this.progress - 8;
            } else if (this.progress <= 16 + this.factor*Math.PI) {
                this.belte.position.x = 8;
                this.belte.rotation.z = -(this.progress - 16)/this.factor
            } else if (this.progress <= 32 + this.factor*Math.PI) {
                this.belte.rotation.z = -Math.PI;
                this.belte.position.x = 24 + this.factor*Math.PI - this.progress;
            } else if (this.progress <= 32 + 2*this.factor*Math.PI) {
                this.belte.position.x = -8;
                this.belte.rotation.z = (this.factor*2*Math.PI - (this.progress - 32))/this.factor;
            } else if (this.progress > 0) {
                this.progress -= 2 * this.factor*Math.PI + 32
            }
        }
    }

    class Belter {
        constructor(
            private leftBelts: BelteSeksjon[],
            private rightBelts: BelteSeksjon[],
            private timer: THREE.Timer
        ) {}

        setMovement(left: number, right: number) {
            this.leftBelts.forEach((seksjon) =>
                seksjon.tick(left * this.timer.getDelta() * speed),
            );
            this.rightBelts.forEach((seksjon) =>
                seksjon.tick(right * this.timer.getDelta() * speed),
            );
        }
    }


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

        let gravemaskin: THREE.Group = new THREE.Group();
        let motorboks: THREE.Object3D | undefined;
        let venstreBelter: BelteSeksjon[] = [];
        let høyreBelter: BelteSeksjon[] = [];
        let rotasjon = Math.PI/2;
        let belts: Belter

        const keys = new Set<string>();
        window.addEventListener('keydown', (e) =>
          keys.add(e.key.toLowerCase()),
        );
        window.addEventListener('keyup', (e) =>
          keys.delete(e.key.toLowerCase()),
        );
        window.addEventListener('blur', () => keys.clear()); // if you alttab out, it will release the keys

        const loader = new GLTFLoader();

        loader.load("gravemaskin.glb",
            // called when the resource is loaded
            (gltf: GLTF) => {
                gravemaskin.add(gltf.scene);
                scene.add(gravemaskin);
                gltf.scene.castShadow = true;
                const colors: Record<string, number> = { belte: 0x555555, kjøring: 0xeeeedd, motorboks: 0x8b5a2b, ledd1: 0x555555, ledd2: 0x8b2222, ledd3: 0xddccaa, spade: 0xddccaa };
                gltf.scene.traverse(obj => {
                    if (obj instanceof THREE.Mesh) {
                        obj.material = new THREE.MeshStandardMaterial({ color: colors[obj.name] })
                        obj.castShadow = true
                        obj.receiveShadow = true
                    }
                });
                let belte = gltf.scene.getObjectByName("belte")
                if (belte) belte.visible = false;
                for (let j = 0; j < 2; j++) {
                    for (let i = 0; i < 20; i++) {
                        let belte1 = belte?.clone()
                        if (belte1) {
                            belte1.visible = true;
                            gravemaskin.add(belte1);
                            if (j==1) {
                                belte1.position.z *= -1
                                venstreBelter.push(new BelteSeksjon(belte1, 2*i*(21/20)))
                            } else høyreBelter.push(new BelteSeksjon(belte1, 2*i*(21/20)))
                        }
                    }
                }
                belts = new Belter(venstreBelter, høyreBelter, timer)
                motorboks = gltf.scene.getObjectByName("motorboks")
            },
            // called while loading is progressing
            (xhr: ProgressEvent) => {
                console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
            }
        );

        const axes = new THREE.AxesHelper(5);
        scene.add(axes);

        const grid = new THREE.GridHelper(10, 4)
        scene.add(grid);

        const ground = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial({ color: 0x2e8a45 }));
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

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
            motorboks?.rotateY(-rotationControls.bladeω * timer.getDelta())

            let rightSpeed = 0;
            let leftSpeed = 0;
            let forwardSpeed = 0

            if (keys.has("w")) {
                rightSpeed += 1;
                leftSpeed += 1;
                forwardSpeed = 1;
            }
            if (keys.has('a')) {
                rightSpeed += 1;
                leftSpeed -= 1;
                rotasjon += 4/3 * timer.getDelta();
                gravemaskin.rotateY(4/3 * timer.getDelta());
            }
            if (keys.has('s')) {
                rightSpeed -= 1;
                leftSpeed -= 1;
                forwardSpeed = -1;
            }
            if (keys.has('d')) {
                rightSpeed -= 1;
                leftSpeed += 1;
                rotasjon -= 4/3 * timer.getDelta();
                gravemaskin.rotateY(-4/3 * timer.getDelta());
            }
            belts.setMovement(leftSpeed, rightSpeed);
            gravemaskin.position.add(
                new Vector3(
                    forwardSpeed * speed * Math.sin(rotasjon) * timer.getDelta(),
                    0,
                    forwardSpeed * speed * Math.cos(rotasjon) * timer.getDelta(),
                ),
            );

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
