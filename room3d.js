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
    camera.position.set(5.1, 1.27, 8.84);
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
    controls.target.set(0, 1, 0);
    controls.update();

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
    createHumans();

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

    // Colorful ceiling with decorative pattern
    const ceilingGeometry = new THREE.PlaneGeometry(roomSize.width, roomSize.depth);
    const ceilingMaterial = new THREE.MeshLambertMaterial({
        color: 0xf0f8ff,  // Alice blue ceiling
        emissive: 0x222222,
        emissiveIntensity: 0.1,
        side: THREE.DoubleSide
    });
    room.ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    room.ceiling.rotation.x = Math.PI / 2;
    room.ceiling.position.y = roomSize.height;
    scene.add(room.ceiling);

    // Ceiling Fan
    const fanGroup = new THREE.Group();
    fanGroup.position.set(0, roomSize.height - 0.1, 0);

    // Fan base
    const fanBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16),
        new THREE.MeshPhongMaterial({ color: 0x444444 })
    );
    fanGroup.add(fanBase);

    // Fan motor housing
    const fanMotor = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 16, 8),
        new THREE.MeshPhongMaterial({ color: 0x666666, metalness: 0.5 })
    );
    fanMotor.position.y = -0.1;
    fanGroup.add(fanMotor);

    // Fan blades container
    const bladesGroup = new THREE.Group();
    bladesGroup.position.y = -0.15;

    // Create 4 fan blades
    const bladeGeometry = new THREE.BoxGeometry(1.5, 0.02, 0.2);
    const bladeMaterial = new THREE.MeshPhongMaterial({
        color: 0x8b4513,  // Wooden brown blades
        metalness: 0.1,
        roughness: 0.8
    });

    for (let i = 0; i < 4; i++) {
        const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
        blade.position.x = Math.cos((i * Math.PI) / 2) * 0.75;
        blade.position.z = Math.sin((i * Math.PI) / 2) * 0.75;
        blade.rotation.y = (i * Math.PI) / 2;
        bladesGroup.add(blade);
    }

    fanGroup.add(bladesGroup);
    scene.add(fanGroup);

    // Store fan reference for animation and start it on by default
    room.ceilingFan = bladesGroup;
    room.fanOn = true; // Start with fan ON by default

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

    // Colorful walls with gradient effect
    const wallMaterial = new THREE.MeshStandardMaterial({
        map: wallTexture,
        roughness: 0.9,
        metalness: 0.05,
        color: 0xe8f4f8,  // Light blue tint
        side: THREE.DoubleSide
    });

    const accentWallMaterial = new THREE.MeshStandardMaterial({
        map: wallTexture,
        roughness: 0.9,
        metalness: 0.05,
        color: 0xfff0e6,  // Warm peach accent wall
        side: THREE.DoubleSide
    });

    // Back wall - accent color
    const backWallGeometry = new THREE.PlaneGeometry(roomSize.width, roomSize.height);
    room.backWall = new THREE.Mesh(backWallGeometry, accentWallMaterial);
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

// Animated humans
let humans = [];

function createHumans() {
    // Human 1 - sitting on sofa
    const human1Group = new THREE.Group();

    // Body
    const bodyGeometry = new THREE.CylinderGeometry(0.15, 0.18, 0.5, 8);
    const bodyMaterial1 = new THREE.MeshPhongMaterial({
        color: 0x4A90E2,
        emissive: 0x2A5082,
        emissiveIntensity: 0.1
    });
    const body1 = new THREE.Mesh(bodyGeometry, bodyMaterial1);
    body1.position.y = 0.85;
    body1.castShadow = true;
    human1Group.add(body1);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const headMaterial = new THREE.MeshPhongMaterial({
        color: 0xffdbac,
        emissive: 0x8b6f55,
        emissiveIntensity: 0.1
    });
    const head1 = new THREE.Mesh(headGeometry, headMaterial);
    head1.position.y = 1.25;
    head1.castShadow = true;
    human1Group.add(head1);

    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.35, 6);
    const armMaterial = new THREE.MeshPhongMaterial({ color: 0xffdbac });

    const leftArm1 = new THREE.Mesh(armGeometry, armMaterial);
    leftArm1.position.set(-0.2, 0.85, 0.1);
    leftArm1.rotation.z = 0.6;
    leftArm1.rotation.x = -0.3;
    leftArm1.castShadow = true;
    human1Group.add(leftArm1);

    const rightArm1 = new THREE.Mesh(armGeometry, armMaterial);
    rightArm1.position.set(0.2, 0.85, 0.1);
    rightArm1.rotation.z = -0.6;
    rightArm1.rotation.x = -0.3;
    rightArm1.castShadow = true;
    human1Group.add(rightArm1);

    // Upper legs (horizontal for sitting)
    const upperLegGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.4, 6);
    const legMaterial = new THREE.MeshPhongMaterial({ color: 0x2c3e50 });

    const leftUpperLeg1 = new THREE.Mesh(upperLegGeometry, legMaterial);
    leftUpperLeg1.position.set(-0.1, 0.45, 0.2);
    leftUpperLeg1.rotation.x = Math.PI / 2;
    leftUpperLeg1.castShadow = true;
    human1Group.add(leftUpperLeg1);

    const rightUpperLeg1 = new THREE.Mesh(upperLegGeometry, legMaterial);
    rightUpperLeg1.position.set(0.1, 0.45, 0.2);
    rightUpperLeg1.rotation.x = Math.PI / 2;
    rightUpperLeg1.castShadow = true;
    human1Group.add(rightUpperLeg1);

    // Lower legs (vertical)
    const lowerLegGeometry = new THREE.CylinderGeometry(0.07, 0.07, 0.35, 6);

    const leftLowerLeg1 = new THREE.Mesh(lowerLegGeometry, legMaterial);
    leftLowerLeg1.position.set(-0.1, 0.15, 0.4);
    leftLowerLeg1.castShadow = true;
    human1Group.add(leftLowerLeg1);

    const rightLowerLeg1 = new THREE.Mesh(lowerLegGeometry, legMaterial);
    rightLowerLeg1.position.set(0.1, 0.15, 0.4);
    rightLowerLeg1.castShadow = true;
    human1Group.add(rightLowerLeg1);

    // Position on sofa
    human1Group.position.set(-0.5, 0.2, -1.5);
    human1Group.userData = {
        arms: { left: leftArm1, right: rightArm1 },
        head: head1,
        animationType: 'relaxing',
        animationTime: 0
    };

    humans.push(human1Group);
    scene.add(human1Group);

    // Human 2 - sitting at desk
    const human2Group = new THREE.Group();

    const bodyMaterial2 = new THREE.MeshPhongMaterial({
        color: 0xE24A90,
        emissive: 0x823050,
        emissiveIntensity: 0.1
    });
    const body2 = new THREE.Mesh(bodyGeometry, bodyMaterial2);
    body2.position.y = 0.85;
    body2.castShadow = true;
    human2Group.add(body2);

    const head2 = new THREE.Mesh(headGeometry, headMaterial);
    head2.position.y = 1.25;
    head2.castShadow = true;
    human2Group.add(head2);

    // Arms positioned for typing
    const leftArm2 = new THREE.Mesh(armGeometry, armMaterial);
    leftArm2.position.set(-0.2, 0.7, -0.15);
    leftArm2.rotation.z = 0.3;
    leftArm2.rotation.x = -1.2;
    leftArm2.castShadow = true;
    human2Group.add(leftArm2);

    const rightArm2 = new THREE.Mesh(armGeometry, armMaterial);
    rightArm2.position.set(0.2, 0.7, -0.15);
    rightArm2.rotation.z = -0.3;
    rightArm2.rotation.x = -1.2;
    rightArm2.castShadow = true;
    human2Group.add(rightArm2);

    // Upper legs
    const leftUpperLeg2 = new THREE.Mesh(upperLegGeometry, legMaterial);
    leftUpperLeg2.position.set(-0.1, 0.45, 0.2);
    leftUpperLeg2.rotation.x = Math.PI / 2;
    leftUpperLeg2.castShadow = true;
    human2Group.add(leftUpperLeg2);

    const rightUpperLeg2 = new THREE.Mesh(upperLegGeometry, legMaterial);
    rightUpperLeg2.position.set(0.1, 0.45, 0.2);
    rightUpperLeg2.rotation.x = Math.PI / 2;
    rightUpperLeg2.castShadow = true;
    human2Group.add(rightUpperLeg2);

    // Lower legs
    const leftLowerLeg2 = new THREE.Mesh(lowerLegGeometry, legMaterial);
    leftLowerLeg2.position.set(-0.1, 0.15, 0.4);
    leftLowerLeg2.castShadow = true;
    human2Group.add(leftLowerLeg2);

    const rightLowerLeg2 = new THREE.Mesh(lowerLegGeometry, legMaterial);
    rightLowerLeg2.position.set(0.1, 0.15, 0.4);
    rightLowerLeg2.castShadow = true;
    human2Group.add(rightLowerLeg2);

    // Position at desk
    human2Group.position.set(2.2, 0.2, 0.5);
    human2Group.rotation.y = -Math.PI / 2;
    human2Group.userData = {
        arms: { left: leftArm2, right: rightArm2 },
        head: head2,
        animationType: 'typing',
        animationTime: 0
    };

    humans.push(human2Group);
    scene.add(human2Group);
}

function animateHumans() {
    humans.forEach((human, index) => {
        const data = human.userData;
        data.animationTime = (data.animationTime || 0) + 0.02;
        const time = data.animationTime;

        if (data.animationType === 'relaxing') {
            // Person on sofa - gentle arm movements
            const breathe = Math.sin(time * 0.5) * 0.1;
            const gesture = Math.sin(time * 0.3) * 0.2;

            // Subtle arm movements - like gesturing while talking
            if (data.arms) {
                data.arms.left.rotation.z = 0.6 + gesture;
                data.arms.left.rotation.x = -0.3 + breathe;
                data.arms.right.rotation.z = -0.6 - gesture * 0.7;
                data.arms.right.rotation.x = -0.3 + breathe;
            }

            // Natural head movement
            if (data.head) {
                data.head.rotation.y = Math.sin(time * 0.2) * 0.1;
                data.head.rotation.x = Math.sin(time * 0.3) * 0.05;
            }
        } else if (data.animationType === 'typing') {
            // Person at desk - typing movements
            const typeLeft = Math.sin(time * 4) * 0.1;
            const typeRight = Math.sin(time * 4 + Math.PI / 2) * 0.1;

            // Typing hand movements
            if (data.arms) {
                data.arms.left.rotation.x = -1.2 + typeLeft;
                data.arms.left.position.y = 0.7 + Math.abs(typeLeft) * 0.02;
                data.arms.right.rotation.x = -1.2 + typeRight;
                data.arms.right.position.y = 0.7 + Math.abs(typeRight) * 0.02;
            }

            // Occasional head movement while working
            if (data.head) {
                data.head.rotation.x = Math.sin(time * 0.1) * 0.05 - 0.1;
                data.head.rotation.y = Math.sin(time * 0.15) * 0.05;
            }
        }
    });
}

function createFurniture() {
    // Enhanced room with more furniture and decorations

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

    // Add more colorful furniture and decorations

    // Sofa
    const sofaGroup = new THREE.Group();
    const sofaMaterial = new THREE.MeshPhongMaterial({
        color: 0xFF6B6B,
        emissive: 0x8B3636,
        emissiveIntensity: 0.05
    });

    // Sofa base
    const sofaBase = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.4, 0.8),
        sofaMaterial
    );
    sofaBase.position.y = 0.3;
    sofaBase.castShadow = true;
    sofaBase.receiveShadow = true;
    sofaGroup.add(sofaBase);

    // Sofa back
    const sofaBack = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.6, 0.2),
        sofaMaterial
    );
    sofaBack.position.set(0, 0.6, -0.3);
    sofaBack.castShadow = true;
    sofaGroup.add(sofaBack);

    // Sofa arms
    const armGeometry = new THREE.BoxGeometry(0.2, 0.4, 0.8);
    const leftArm = new THREE.Mesh(armGeometry, sofaMaterial);
    leftArm.position.set(-0.9, 0.4, 0);
    leftArm.castShadow = true;
    sofaGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, sofaMaterial);
    rightArm.position.set(0.9, 0.4, 0);
    rightArm.castShadow = true;
    sofaGroup.add(rightArm);

    // Add cushions
    const cushionMaterial = new THREE.MeshPhongMaterial({
        color: 0xFFE66D,
        emissive: 0x8B7638,
        emissiveIntensity: 0.05
    });

    for (let i = 0; i < 2; i++) {
        const cushion = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.3, 0.3),
            cushionMaterial
        );
        cushion.position.set(-0.4 + i * 0.8, 0.5, -0.1);
        cushion.rotation.z = Math.random() * 0.1 - 0.05;
        cushion.castShadow = true;
        sofaGroup.add(cushion);
    }

    sofaGroup.position.set(2, 0, 2);
    sofaGroup.rotation.y = -Math.PI / 4;
    scene.add(sofaGroup);
    room.sofa = sofaGroup;

    // Coffee Table
    const coffeeTableGroup = new THREE.Group();

    // Glass top with texture
    const glassGeometry = new THREE.BoxGeometry(1.2, 0.03, 0.6);
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x88CCFF,
        metalness: 0.1,
        roughness: 0.1,
        transparent: true,
        opacity: 0.7,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
    });
    const glassTop = new THREE.Mesh(glassGeometry, glassMaterial);
    glassTop.position.y = 0.4;
    glassTop.castShadow = true;
    glassTop.receiveShadow = true;
    coffeeTableGroup.add(glassTop);

    // Modern metal legs
    const legMaterial = new THREE.MeshStandardMaterial({
        color: 0x444444,
        metalness: 0.8,
        roughness: 0.2
    });
    const tableLegGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.4);

    const tableLegPositions = [
        { x: -0.5, z: -0.25 },
        { x: 0.5, z: -0.25 },
        { x: -0.5, z: 0.25 },
        { x: 0.5, z: 0.25 }
    ];

    tableLegPositions.forEach(pos => {
        const leg = new THREE.Mesh(tableLegGeometry, legMaterial);
        leg.position.set(pos.x, 0.2, pos.z);
        leg.castShadow = true;
        coffeeTableGroup.add(leg);
    });

    coffeeTableGroup.position.set(1.5, 0, 1);
    scene.add(coffeeTableGroup);
    room.coffeeTable = coffeeTableGroup;

    // Bookshelf
    const bookshelfGroup = new THREE.Group();
    const shelfMaterial = new THREE.MeshPhongMaterial({
        color: 0x8B4513,
        emissive: 0x4B2509,
        emissiveIntensity: 0.05
    });

    // Shelf frame
    const shelfFrame = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 1.8, 0.3),
        shelfMaterial
    );
    shelfFrame.position.y = 0.9;
    bookshelfGroup.add(shelfFrame);

    // Shelves
    for (let i = 0; i < 4; i++) {
        const shelf = new THREE.Mesh(
            new THREE.BoxGeometry(0.75, 0.03, 0.28),
            shelfMaterial
        );
        shelf.position.y = 0.3 + i * 0.4;
        bookshelfGroup.add(shelf);
    }

    // Add colorful books
    const bookColors = [0xFF5733, 0x33FF57, 0x3357FF, 0xFFFF33, 0xFF33FF, 0x33FFFF];
    for (let shelf = 0; shelf < 3; shelf++) {
        for (let book = 0; book < 5; book++) {
            const bookGeometry = new THREE.BoxGeometry(0.1, 0.25, 0.2);
            const bookMaterial = new THREE.MeshPhongMaterial({
                color: bookColors[Math.floor(Math.random() * bookColors.length)],
                emissive: 0x222222,
                emissiveIntensity: 0.1
            });
            const bookMesh = new THREE.Mesh(bookGeometry, bookMaterial);
            bookMesh.position.set(
                -0.3 + book * 0.15,
                0.45 + shelf * 0.4,
                0
            );
            bookMesh.rotation.z = Math.random() * 0.1 - 0.05;
            bookMesh.castShadow = true;
            bookshelfGroup.add(bookMesh);
        }
    }

    bookshelfGroup.position.set(-3.5, 0, 0);
    scene.add(bookshelfGroup);
    room.bookshelf = bookshelfGroup;

    // Rug
    const rugGeometry = new THREE.PlaneGeometry(3, 2);
    const rugCanvas = document.createElement('canvas');
    const rugContext = rugCanvas.getContext('2d');
    rugCanvas.width = 512;
    rugCanvas.height = 342;

    // Create colorful pattern
    const gradient = rugContext.createRadialGradient(256, 171, 0, 256, 171, 300);
    gradient.addColorStop(0, '#FF6B6B');
    gradient.addColorStop(0.3, '#4ECDC4');
    gradient.addColorStop(0.6, '#45B7D1');
    gradient.addColorStop(1, '#FFA07A');
    rugContext.fillStyle = gradient;
    rugContext.fillRect(0, 0, rugCanvas.width, rugCanvas.height);

    // Add pattern
    rugContext.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    rugContext.lineWidth = 3;
    for (let i = 0; i < 10; i++) {
        rugContext.beginPath();
        rugContext.arc(256, 171, 30 + i * 30, 0, Math.PI * 2);
        rugContext.stroke();
    }

    const rugTexture = new THREE.CanvasTexture(rugCanvas);
    const rugMaterial = new THREE.MeshStandardMaterial({
        map: rugTexture,
        roughness: 0.8,
        metalness: 0,
        side: THREE.DoubleSide
    });
    const rug = new THREE.Mesh(rugGeometry, rugMaterial);
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(1, 0.01, 0.5);
    rug.receiveShadow = true;
    scene.add(rug);
    room.rug = rug;

    // Wall Art
    for (let i = 0; i < 3; i++) {
        const artGroup = new THREE.Group();

        // Frame
        const frameGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.05);
        const frameMaterial = new THREE.MeshPhongMaterial({
            color: 0x222222,
            emissive: 0x111111,
            emissiveIntensity: 0.1
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.castShadow = true;
        artGroup.add(frame);

        // Art canvas
        const artCanvas = document.createElement('canvas');
        const artContext = artCanvas.getContext('2d');
        artCanvas.width = 256;
        artCanvas.height = 256;

        // Create abstract art
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#95E1D3'];
        artContext.fillStyle = colors[i % colors.length];
        artContext.fillRect(0, 0, 256, 256);

        // Add random shapes
        for (let j = 0; j < 5; j++) {
            artContext.fillStyle = colors[(i + j + 1) % colors.length];
            artContext.beginPath();
            artContext.arc(
                Math.random() * 256,
                Math.random() * 256,
                20 + Math.random() * 40,
                0,
                Math.PI * 2
            );
            artContext.fill();
        }

        const artTexture = new THREE.CanvasTexture(artCanvas);
        const artMaterial = new THREE.MeshBasicMaterial({ map: artTexture });
        const art = new THREE.Mesh(
            new THREE.PlaneGeometry(0.5, 0.5),
            artMaterial
        );
        art.position.z = 0.026;
        artGroup.add(art);

        artGroup.position.set(-3.97, 1.8, -2 + i * 1.5);
        artGroup.rotation.y = Math.PI / 2;
        scene.add(artGroup);
    }

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

    // Update camera position display
    updateCameraInfo();

    // Animate humans walking around
    animateHumans();

    // Rotate plant slightly
    if (room.plant) {
        scene.children.forEach(child => {
            if (child.position.x === 2 && child.position.z === -3) {
                child.rotation.y += 0.002;
            }
        });
    }

    // Animate ceiling fan if on
    if (room.ceilingFan && room.fanOn) {
        room.ceilingFan.rotation.y += 0.15;
    }

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Update camera position display
function updateCameraInfo() {
    const cameraPos = document.getElementById('camera-pos');
    const targetPos = document.getElementById('target-pos');

    if (camera && cameraPos) {
        cameraPos.textContent = `(${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)})`;
    }

    if (controls && targetPos) {
        targetPos.textContent = `(${controls.target.x.toFixed(2)}, ${controls.target.y.toFixed(2)}, ${controls.target.z.toFixed(2)})`;
    }
}