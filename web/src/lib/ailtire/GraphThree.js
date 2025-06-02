import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {layerNodes} from "../../stores/layerStore.js";

export class GraphThree {
    constructor(container) {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.selectedObject = null;
        this.container = container;
        this.setup3DScene(container);
        this.setupResizeHandler();
        return this;
    }

    setup3DScene(container) {
        const scene = new THREE.Scene();

        // Set up the camera
        const camera = new THREE.PerspectiveCamera(
            20, // Field of view
            container.clientWidth / container.clientHeight, // Aspect ratio
            0.0001, // Near clipping plane
            100000 // Far clipping plane
        );
        camera.position.set(0, 150, 300); // Adjust initial camera position

        // Set up the renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // Set up controls for user interaction
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // Add a light source
        const light = new THREE.PointLight(0xffffff, 1, 100);
        light.position.set(500, 500, 500);
        scene.add(light);
        const light2 = new THREE.PointLight(0xffffff, 1, 100);
        light.position.set(-500, -500, 500);
        scene.add(light);
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }

        animate();
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.setupInteraction()
    }
    add(object) {
        this.scene.add(object);
    }
    remove(object) {
        this.scene.remove(object);
    }
    setupInteraction() {

        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        overlay.style.color = 'white';
        overlay.style.padding = '8px 12px';
        overlay.style.borderRadius = '4px';
        overlay.style.pointerEvents = 'none'; // Prevent interaction with the overlay
        overlay.style.display = 'none'; // Hide the overlay by default
        document.body.appendChild(overlay);

        function getMousePosition(event, canvas) {
            const mouse = new THREE.Vector2(); // To store normalized mouse coordinates.
            const rect = canvas.getBoundingClientRect();
            mouse.x = (event.clientX - rect.left) * canvas.width / rect.width;
            mouse.y = (event.clientY - rect.top) * canvas.height / rect.height;
            mouse.x = (mouse.x / canvas.width) * 2 - 1;
            mouse.y = (mouse.y / canvas.height) * -2 + 1;
            return mouse;
        }
        function projectToScreen(object, canvas, camera) {
            const vector = new THREE.Vector3();
            vector.setFromMatrixPosition(object.matrixWorld);
            camera.updateProjectionMatrix();

            vector.project(camera);
            vector.x = (vector.x + 1) * canvas.width / 2;
            vector.y = (-vector.y + 1) * canvas.height / 2;
            return vector;
        }

        // Listen for click events
        this.renderer.domElement.addEventListener('click', (event) => {

            const raycaster = new THREE.Raycaster(); // Used for detecting intersections.

            let mouse = getMousePosition(event, this.renderer.domElement);

            // Cast ray from camera to mouse
            raycaster.setFromCamera(mouse, this.camera);

            // Get intersections
            const intersects = raycaster.intersectObjects(this.scene.children, true);

            // If there are intersections
            if (intersects.length > 0) {
                const selectedObject = intersects[0].object;

                // Access and handle selected object here
                if (selectedObject.userData.selectedCallback) {
                    selectedObject.userData.selectedCallback(selectedObject.userData);
                }
                selectedObject.userData.oldColor = selectedObject.material.emissive.getHex();
                selectedObject.material.emissive.setHex( 0xffff00 );
                if(this.selectedObject) {
                    this.selectedObject.material.emissive.setHex( this.selectedObject.userData.oldColor );
                }
                this.selectedObject = selectedObject;
            }
        });
        this.renderer.domElement.addEventListener('mousemove', (event) => {

            const raycaster = new THREE.Raycaster(); // Used for detecting intersections.

            let mouse = getMousePosition(event, this.renderer.domElement);

            // Cast ray from camera to mouse
            raycaster.setFromCamera(mouse, this.camera);

            // Get intersections
            const intersects = raycaster.intersectObjects(this.scene.children, true);

            // If there are intersections
            if (intersects.length > 0) {
                const selectedObject = intersects[0].object;

                // Access and handle selected object here
                if (selectedObject.userData.hoverCallback) {
                    selectedObject.userData.hoverCallback(selectedObject.userData);
                }
                const screenPosition = projectToScreen(selectedObject, this.renderer.domElement, this.camera);

                overlay.style.left = `${screenPosition.x}px`;
                overlay.style.top = `${screenPosition.y}px`;
                overlay.style.display = 'block';

                // Update the content of the overlay
                if (selectedObject.userData.layer) {
                    // Customize based on object data
                    overlay.innerHTML = `
                    <strong>${selectedObject.userData.layer.name}</strong><br>
                    ${selectedObject.userData.layer.description || 'No details available.'}
                `;
                } else {
                    overlay.style.display = 'none';
                }
            } else {
                overlay.style.display = 'none';
            }


        });
    }

    fitCameraToScene(duration = 0) {
        // Create a Box3 to hold the bounding box of the scene
        const boundingBox = new THREE.Box3().setFromObject(this.scene);

        // Calculate the center and size of the bounding box
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();
        boundingBox.getCenter(center);
        boundingBox.getSize(size);

        // Update camera position based on bounding box size
        const maxDim = Math.max(size.x, size.y, size.z); // Largest dimension of the box
        const fov = this.camera.fov * (Math.PI / 180); // Convert vertical FOV to radians
        const targetDistance = maxDim / (2 * Math.tan(fov / 2)); // Distance based on FOV

        // Define the target camera position
        const targetPosition = new THREE.Vector3(
            center.x,
            center.y,
            center.z + targetDistance * 1.2 // Add some padding (1.2x)
        );

        // Animate the camera position and update controls' target
        const startPosition = this.camera.position.clone(); // Start position
        const startTime = performance.now(); // Start time
        const endTime = startTime + duration * 1000; // End time (in milliseconds)

        // Define the animation loop
        const animate = () => {
            const currentTime = performance.now();
            const elapsedTime = (currentTime - startTime) / (duration * 1000); // Normalize elapsed time (0 to 1)
            const t = Math.min(elapsedTime, 1); // Clamp 't' to ensure it doesn't exceed 1

            // Lerp the camera position
            this.camera.position.lerpVectors(startPosition, targetPosition, t);

            // Ensure the camera looks at the center of the bounding box
            this.camera.lookAt(center);

            // Update camera matrix if necessary
            this.camera.updateProjectionMatrix();

            // Update controls (if available)
            if (this.controls) {
                this.controls.target.copy(center);
                this.controls.update();
            }

            // Continue the loop until the animation is finished
            if (currentTime < endTime) {
                requestAnimationFrame(animate);
            }
        };

        // Start the animation
        animate();
    }
    setupResizeHandler() {
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.renderer.domElement.addEventListener('resize', (event) => {
            // Ensure the container exists as it may have been destroyed dynamically
            if (!this.container) return;

            const width = this.container.clientWidth;
            const height = this.container.clientHeight;

            // Update the camera aspect ratio and projection matrix
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();

            // Update the renderer size
            this.renderer.setSize(width, height);

            // Optionally adjust the pixel ratio
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio ?? 1, 2));
            this.fitCameraToScene();
        });
    }
}