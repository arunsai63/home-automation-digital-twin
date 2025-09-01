let scene, camera, renderer, controls;
let room = {};
let lights = {};

function initThreeJS() {
    // Scene
    scene = new THREE.Scene();
    
    // Create gradient background
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 512;
    
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#e8f4fd');
    gradient.addColorStop(1, '#f8fbff');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    const texture = new THREE.CanvasTexture(canvas);
    scene.background = texture;
    scene.fog = new THREE.Fog(0xe8f4fd, 15, 60);

    // Camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(8, 6, 8);
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2;
    controls.minDistance = 3;
    controls.maxDistance = 20;

    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Main Directional Light (Sun)
    lights.sun = new THREE.DirectionalLight(0xffffff, 0.6);
    lights.sun.position.set(5, 10, 5);
    lights.sun.castShadow = true;
    lights.sun.shadow.camera.near = 0.1;
    lights.sun.shadow.camera.far = 20;
    lights.sun.shadow.camera.left = -10;
    lights.sun.shadow.camera.right = 10;
    lights.sun.shadow.camera.top = 10;
    lights.sun.shadow.camera.bottom = -10;
    lights.sun.shadow.mapSize.width = 2048;
    lights.sun.shadow.mapSize.height = 2048;
    scene.add(lights.sun);

    createRoom();
    createFurniture();
    
    // Window resize handler
    window.addEventListener('resize', onWindowResize, false);
}

function createRoom() {
    const roomSize = { width: 8, height: 3, depth: 8 };
    
    // Create procedural floor texture
    const floorCanvas = document.createElement('canvas');
    const floorContext = floorCanvas.getContext('2d');
    floorCanvas.width = 512;
    floorCanvas.height = 512;
    
    // Create wood-like pattern
    floorContext.fillStyle = '#f5f0e8';
    floorContext.fillRect(0, 0, floorCanvas.width, floorCanvas.height);
    
    // Add wood grain effect
    for (let i = 0; i < 20; i++) {
        floorContext.strokeStyle = `rgba(139, 69, 19, ${0.1 + Math.random() * 0.1})`;
        floorContext.lineWidth = 1 + Math.random() * 2;
        floorContext.beginPath();
        floorContext.moveTo(0, i * 25);
        floorContext.quadraticCurveTo(256, i * 25 + Math.random() * 10 - 5, 512, i * 25);
        floorContext.stroke();
    }
    
    const floorTexture = new THREE.CanvasTexture(floorCanvas);
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(4, 4);
    
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(roomSize.width, roomSize.depth);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
        map: floorTexture,
        roughness: 0.8,
        metalness: 0.1,
        side: THREE.DoubleSide
    });
    room.floor = new THREE.Mesh(floorGeometry, floorMaterial);
    room.floor.rotation.x = -Math.PI / 2;
    room.floor.position.y = 0;
    room.floor.receiveShadow = true;
    scene.add(room.floor);

    // Ceiling
    const ceilingGeometry = new THREE.PlaneGeometry(roomSize.width, roomSize.depth);
    const ceilingMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xffffff,
        side: THREE.DoubleSide 
    });
    room.ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    room.ceiling.rotation.x = Math.PI / 2;
    room.ceiling.position.y = roomSize.height;
    scene.add(room.ceiling);

    // Create wall texture
    const wallCanvas = document.createElement('canvas');
    const wallContext = wallCanvas.getContext('2d');
    wallCanvas.width = 256;
    wallCanvas.height = 256;
    
    // Create subtle wall texture
    wallContext.fillStyle = '#fafafa';
    wallContext.fillRect(0, 0, wallCanvas.width, wallCanvas.height);
    
    // Add subtle noise
    for (let i = 0; i < 100; i++) {
        wallContext.fillStyle = `rgba(240, 240, 240, ${Math.random() * 0.3})`;
        wallContext.fillRect(
            Math.random() * wallCanvas.width,
            Math.random() * wallCanvas.height,
            2, 2
        );
    }
    
    const wallTexture = new THREE.CanvasTexture(wallCanvas);
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(2, 2);

    // Walls
    const wallMaterial = new THREE.MeshStandardMaterial({ 
        map: wallTexture,
        roughness: 0.9,
        metalness: 0.05,
        side: THREE.DoubleSide
    });

    // Back wall
    const backWallGeometry = new THREE.PlaneGeometry(roomSize.width, roomSize.height);
    room.backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    room.backWall.position.z = -roomSize.depth / 2;
    room.backWall.position.y = roomSize.height / 2;
    room.backWall.receiveShadow = true;
    scene.add(room.backWall);

    // Front wall (with transparent section for viewing)
    const frontWallGeometry = new THREE.PlaneGeometry(roomSize.width, roomSize.height);
    const frontWallMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xf5f5f5,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.1
    });
    room.frontWall = new THREE.Mesh(frontWallGeometry, frontWallMaterial);
    room.frontWall.position.z = roomSize.depth / 2;
    room.frontWall.position.y = roomSize.height / 2;
    scene.add(room.frontWall);

    // Left wall
    const leftWallGeometry = new THREE.PlaneGeometry(roomSize.depth, roomSize.height);
    room.leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    room.leftWall.rotation.y = Math.PI / 2;
    room.leftWall.position.x = -roomSize.width / 2;
    room.leftWall.position.y = roomSize.height / 2;
    room.leftWall.receiveShadow = true;
    scene.add(room.leftWall);

    // Right wall (with window)
    room.rightWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    room.rightWall.rotation.y = -Math.PI / 2;
    room.rightWall.position.x = roomSize.width / 2;
    room.rightWall.position.y = roomSize.height / 2;
    room.rightWall.receiveShadow = true;
    scene.add(room.rightWall);

    // Window
    createWindow();
}

function createWindow() {
    // Window frame
    const windowGroup = new THREE.Group();
    
    // Window glass
    const glassGeometry = new THREE.PlaneGeometry(2, 1.5);
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x88ccff,
        metalness: 0.1,
        roughness: 0.1,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    room.windowGlass = new THREE.Mesh(glassGeometry, glassMaterial);
    windowGroup.add(room.windowGlass);

    // Window frame
    const frameThickness = 0.05;
    const frameMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
    
    // Frame parts
    const frameTop = new THREE.Mesh(
        new THREE.BoxGeometry(2.1, frameThickness, 0.1),
        frameMaterial
    );
    frameTop.position.y = 0.75;
    windowGroup.add(frameTop);

    const frameBottom = new THREE.Mesh(
        new THREE.BoxGeometry(2.1, frameThickness, 0.1),
        frameMaterial
    );
    frameBottom.position.y = -0.75;
    windowGroup.add(frameBottom);

    const frameLeft = new THREE.Mesh(
        new THREE.BoxGeometry(frameThickness, 1.5, 0.1),
        frameMaterial
    );
    frameLeft.position.x = -1;
    windowGroup.add(frameLeft);

    const frameRight = new THREE.Mesh(
        new THREE.BoxGeometry(frameThickness, 1.5, 0.1),
        frameMaterial
    );
    frameRight.position.x = 1;
    windowGroup.add(frameRight);

    // Blinds
    room.blinds = new THREE.Group();
    const blindMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });
    for (let i = 0; i < 10; i++) {
        const blind = new THREE.Mesh(
            new THREE.BoxGeometry(1.9, 0.15, 0.02),
            blindMaterial
        );
        blind.position.y = 0.65 - i * 0.15;
        blind.castShadow = true;
        room.blinds.add(blind);
    }
    room.blinds.position.z = 0.05;
    room.blinds.visible = false;
    windowGroup.add(room.blinds);

    windowGroup.rotation.y = -Math.PI / 2;
    windowGroup.position.set(3.95, 1.5, 0);
    scene.add(windowGroup);
}

function createFurniture() {
    // Desk
    const deskGroup = new THREE.Group();
    
    // Create desk texture
    const deskCanvas = document.createElement('canvas');
    const deskContext = deskCanvas.getContext('2d');
    deskCanvas.width = 128;
    deskCanvas.height = 128;
    
    // Create wood texture
    deskContext.fillStyle = '#8b4513';
    deskContext.fillRect(0, 0, deskCanvas.width, deskCanvas.height);
    
    // Add wood grain
    for (let i = 0; i < 10; i++) {
        deskContext.strokeStyle = `rgba(101, 67, 33, ${0.3 + Math.random() * 0.3})`;
        deskContext.lineWidth = 1;
        deskContext.beginPath();
        deskContext.moveTo(0, i * 12);
        deskContext.quadraticCurveTo(64, i * 12 + Math.random() * 4 - 2, 128, i * 12);
        deskContext.stroke();
    }
    
    const deskTexture = new THREE.CanvasTexture(deskCanvas);

    // Desk top
    const deskTopGeometry = new THREE.BoxGeometry(2, 0.05, 1);
    const deskMaterial = new THREE.MeshStandardMaterial({ 
        map: deskTexture,
        roughness: 0.7,
        metalness: 0.1
    });
    const deskTop = new THREE.Mesh(deskTopGeometry, deskMaterial);
    deskTop.position.y = 0.75;
    deskTop.castShadow = true;
    deskTop.receiveShadow = true;
    deskGroup.add(deskTop);

    // Desk legs
    const legGeometry = new THREE.BoxGeometry(0.05, 0.75, 0.05);
    const legPositions = [
        { x: -0.9, z: -0.4 },
        { x: 0.9, z: -0.4 },
        { x: -0.9, z: 0.4 },
        { x: 0.9, z: 0.4 }
    ];
    
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, deskMaterial);
        leg.position.set(pos.x, 0.375, pos.z);
        leg.castShadow = true;
        deskGroup.add(leg);
    });

    deskGroup.position.set(-1, 0, -2);
    scene.add(deskGroup);
    room.desk = deskGroup;

    // Chair
    const chairGroup = new THREE.Group();
    const chairMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    
    // Seat
    const seatGeometry = new THREE.BoxGeometry(0.5, 0.05, 0.5);
    const seat = new THREE.Mesh(seatGeometry, chairMaterial);
    seat.position.y = 0.5;
    seat.castShadow = true;
    chairGroup.add(seat);

    // Backrest
    const backrestGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.05);
    const backrest = new THREE.Mesh(backrestGeometry, chairMaterial);
    backrest.position.set(0, 0.75, -0.225);
    backrest.castShadow = true;
    chairGroup.add(backrest);

    // Chair legs
    const chairLegGeometry = new THREE.BoxGeometry(0.04, 0.5, 0.04);
    const chairLegPositions = [
        { x: -0.2, z: -0.2 },
        { x: 0.2, z: -0.2 },
        { x: -0.2, z: 0.2 },
        { x: 0.2, z: 0.2 }
    ];
    
    chairLegPositions.forEach(pos => {
        const leg = new THREE.Mesh(chairLegGeometry, chairMaterial);
        leg.position.set(pos.x, 0.25, pos.z);
        leg.castShadow = true;
        chairGroup.add(leg);
    });

    chairGroup.position.set(-1, 0, -1);
    scene.add(chairGroup);
    room.chair = chairGroup;

    // Computer Monitor
    const monitorGroup = new THREE.Group();
    
    // Screen
    const screenGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.02);
    const screenMaterial = new THREE.MeshLambertMaterial({ color: 0x111111 });
    room.screen = new THREE.Mesh(screenGeometry, screenMaterial);
    room.screen.position.y = 0.2;
    room.screen.castShadow = true;
    monitorGroup.add(room.screen);

    // Monitor stand
    const standGeometry = new THREE.BoxGeometry(0.15, 0.2, 0.15);
    const stand = new THREE.Mesh(standGeometry, screenMaterial);
    stand.position.y = -0.1;
    monitorGroup.add(stand);

    // Base
    const baseGeometry = new THREE.BoxGeometry(0.3, 0.02, 0.2);
    const base = new THREE.Mesh(baseGeometry, screenMaterial);
    base.position.y = -0.2;
    monitorGroup.add(base);

    monitorGroup.position.set(-1, 0.98, -2);
    scene.add(monitorGroup);
    room.monitor = monitorGroup;

    // Lamp
    const lampGroup = new THREE.Group();
    
    // Lamp base
    const lampBaseGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.02);
    const lampMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
    const lampBase = new THREE.Mesh(lampBaseGeometry, lampMaterial);
    lampGroup.add(lampBase);

    // Lamp pole
    const poleGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3);
    const pole = new THREE.Mesh(poleGeometry, lampMaterial);
    pole.position.y = 0.15;
    lampGroup.add(pole);

    // Lamp shade
    const shadeGeometry = new THREE.ConeGeometry(0.15, 0.2, 6);
    const shadeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffcc });
    room.lampShade = new THREE.Mesh(shadeGeometry, shadeMaterial);
    room.lampShade.position.y = 0.35;
    lampGroup.add(room.lampShade);

    // Lamp light
    lights.lamp = new THREE.PointLight(0xffff99, 0, 3);
    lights.lamp.position.y = 0.3;
    lights.lamp.castShadow = true;
    lampGroup.add(lights.lamp);

    lampGroup.position.set(-2, 0.78, -2.2);
    scene.add(lampGroup);
    room.lamp = lampGroup;

    // AC Unit
    const acGroup = new THREE.Group();
    
    const acGeometry = new THREE.BoxGeometry(1.2, 0.3, 0.2);
    const acMaterial = new THREE.MeshLambertMaterial({ color: 0xf0f0f0 });
    room.acUnit = new THREE.Mesh(acGeometry, acMaterial);
    room.acUnit.castShadow = true;
    acGroup.add(room.acUnit);

    // AC vents
    const ventMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    for (let i = 0; i < 5; i++) {
        const vent = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 0.02, 0.18),
            ventMaterial
        );
        vent.position.set(-0.4 + i * 0.2, -0.1, 0.01);
        acGroup.add(vent);
    }

    // AC indicator light
    const indicatorGeometry = new THREE.SphereGeometry(0.02);
    const indicatorMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    room.acIndicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
    room.acIndicator.position.set(0.5, 0, 0.11);
    room.acIndicator.visible = false;
    acGroup.add(room.acIndicator);

    acGroup.position.set(0, 2.5, -3.8);
    scene.add(acGroup);
    room.ac = acGroup;

    // Plant
    const plantGroup = new THREE.Group();
    
    // Pot
    const potGeometry = new THREE.CylinderGeometry(0.15, 0.12, 0.2);
    const potMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
    const pot = new THREE.Mesh(potGeometry, potMaterial);
    pot.castShadow = true;
    plantGroup.add(pot);

    // Plant
    const plantGeometry = new THREE.SphereGeometry(0.2, 8, 6);
    const plantMaterial = new THREE.MeshLambertMaterial({ color: 0x228b22 });
    const plant = new THREE.Mesh(plantGeometry, plantMaterial);
    plant.position.y = 0.25;
    plant.castShadow = true;
    plantGroup.add(plant);

    plantGroup.position.set(2, 0.1, -3);
    scene.add(plantGroup);

    // Ceiling Light
    const ceilingLightGroup = new THREE.Group();
    
    const ceilingLightGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.05);
    const ceilingLightMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    room.ceilingLight = new THREE.Mesh(ceilingLightGeometry, ceilingLightMaterial);
    ceilingLightGroup.add(room.ceilingLight);

    // Ceiling point light
    lights.ceiling = new THREE.PointLight(0xffffff, 0, 8);
    lights.ceiling.position.y = -0.1;
    lights.ceiling.castShadow = true;
    ceilingLightGroup.add(lights.ceiling);

    ceilingLightGroup.position.set(0, 2.95, 0);
    scene.add(ceilingLightGroup);
    room.ceilingLightGroup = ceilingLightGroup;
}

function updateRoomLighting(isOn) {
    if (isOn) {
        lights.ceiling.intensity = 1;
        lights.lamp.intensity = 0.5;
        room.lampShade.material.emissive = new THREE.Color(0xffff99);
        room.lampShade.material.emissiveIntensity = 0.3;
        room.ceilingLight.material.emissive = new THREE.Color(0xffffff);
        room.ceilingLight.material.emissiveIntensity = 0.5;
    } else {
        lights.ceiling.intensity = 0;
        lights.lamp.intensity = 0;
        room.lampShade.material.emissive = new THREE.Color(0x000000);
        room.lampShade.material.emissiveIntensity = 0;
        room.ceilingLight.material.emissive = new THREE.Color(0x000000);
        room.ceilingLight.material.emissiveIntensity = 0;
    }
}

function updateAC(isOn) {
    room.acIndicator.visible = isOn;
    if (isOn) {
        room.acIndicator.material.color = new THREE.Color(0x00ff00);
    }
}

function updateBlinds(isOpen) {
    room.blinds.visible = !isOpen;
}

function updateComputer(isOn) {
    if (isOn) {
        room.screen.material.color = new THREE.Color(0x0066cc);
        room.screen.material.emissive = new THREE.Color(0x0066cc);
        room.screen.material.emissiveIntensity = 0.2;
    } else {
        room.screen.material.color = new THREE.Color(0x111111);
        room.screen.material.emissive = new THREE.Color(0x000000);
        room.screen.material.emissiveIntensity = 0;
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    controls.update();
    
    // Rotate plant slightly
    if (room.plant) {
        scene.children.forEach(child => {
            if (child.position.x === 2 && child.position.z === -3) {
                child.rotation.y += 0.002;
            }
        });
    }
    
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}