let scene, camera, renderer, controls;
let worldSize = 20; // حجم العالم (عدد المكعبات)
let cubeSize = 1;
let cubes = {};

function init() {
    // المشهد والكاميرا
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

    // الإضاءة
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 20, 10);
    light.castShadow = true;
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    // الأرضية
    let groundGeo = new THREE.BoxGeometry(worldSize, 1, worldSize);
    let groundMat = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    let ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    scene.add(ground);

    // توليد عالم من المكعبات
    generateWorld();

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.getElementById('gameContainer').appendChild(renderer.domElement);

    // تحكم الكاميرا
    controls = new THREE.PointerLockControls(camera, document.body);
    camera.position.set(0, 2, 5);

    document.addEventListener('click', () => {
        controls.lock();
    });

    // حركة اللاعب
    const velocity = new THREE.Vector3();
    const direction = new THREE.Vector3();
    const move = { forward: false, backward: false, left: false, right: false, jump: false };
    let canJump = false;

    document.addEventListener('keydown', (e) => {
        switch(e.code) {
            case 'KeyW': move.forward = true; break;
            case 'KeyS': move.backward = true; break;
            case 'KeyA': move.left = true; break;
            case 'KeyD': move.right = true; break;
            case 'Space':
                if (canJump) {
                    velocity.y = 5;
                    canJump = false;
                }
                break;
        }
    });
    document.addEventListener('keyup', (e) => {
        switch(e.code) {
            case 'KeyW': move.forward = false; break;
            case 'KeyS': move.backward = false; break;
            case 'KeyA': move.left = false; break;
            case 'KeyD': move.right = false; break;
        }
    });

    // بناء/تكسير المكعبات
    document.addEventListener('mousedown', (e) => {
        let raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
        let intersects = raycaster.intersectObjects(Object.values(cubes));

        if (intersects.length > 0) {
            let target = intersects[0].object;
            if (e.button === 0) { // تكسير
                scene.remove(target);
                delete cubes[target.uuid];
            } else if (e.button === 2) { // إضافة
                let pos = target.position.clone().add(intersects[0].face.normal);
                addCube(Math.round(pos.x), Math.round(pos.y), Math.round(pos.z));
            }
        }
    });

    // تحديث اللعبة
    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        velocity.y -= 9.8 * delta;

        direction.z = Number(move.forward) - Number(move.backward);
        direction.x = Number(move.right) - Number(move.left);
        direction.normalize();

        if (move.forward || move.backward) velocity.z -= direction.z * 50.0 * delta;
        if (move.left || move.right) velocity.x -= direction.x * 50.0 * delta;

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);
        camera.position.y += velocity.y * delta;

        if (camera.position.y < 2) {
            velocity.y = 0;
            camera.position.y = 2;
            canJump = true;
        }

        renderer.render(scene, camera);
    }
    animate();
}

function generateWorld() {
    for (let x = -5; x < 5; x++) {
        for (let z = -5; z < 5; z++) {
            addCube(x, 0, z);
        }
    }
}

function addCube(x, y, z) {
    let geo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    let mat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    let cube = new THREE.Mesh(geo, mat);
    cube.position.set(x, y + 0.5, z);
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add(cube);
    cubes[cube.uuid] = cube;
}

document.getElementById('startBtn').addEventListener('click', () => {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    init();
});
