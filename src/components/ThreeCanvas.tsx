import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VillageState, ModuleId, MODULE_DEFINITIONS } from '../types/village';
import { sound } from '../utils/audio';

interface ThreeCanvasProps {
  state: VillageState;
  onSelectModule: (id: ModuleId | null) => void;
  onTimeChange: (hour: number) => void;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  state,
  onSelectModule,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Dynamic mesh and light references
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const moonLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const starsRef = useRef<THREE.Points | null>(null);

  // Module specific mesh references for animation
  const windmillBlades1Ref = useRef<THREE.Group | null>(null);
  const windmillBlades2Ref = useRef<THREE.Group | null>(null);
  const soilMeshRef = useRef<THREE.Mesh | null>(null);
  const sprinklerHeadsRef = useRef<THREE.Group[]>([]);
  const sprinklerParticlesRef = useRef<THREE.Points | null>(null);
  const streetSpotlightsRef = useRef<THREE.SpotLight[]>([]);
  const streetLightConesRef = useRef<THREE.Mesh[]>([]);
  const windowGlowMeshesRef = useRef<THREE.Mesh[]>([]);

  // Moving Traffic Vehicles
  const villageCarRef = useRef<THREE.Group | null>(null);
  const farmTractorRef = useRef<THREE.Group | null>(null);
  const carHeadlightsRef = useRef<THREE.SpotLight[]>([]);

  // Flying Birds
  const birdsGroupRef = useRef<THREE.Group | null>(null);
  const birdWingsRef = useRef<{ left: THREE.Mesh; right: THREE.Mesh }[]>([]);

  // Walking Villager
  const villagerRef = useRef<THREE.Group | null>(null);
  const villagerLimbsRef = useRef<{ leftLeg: THREE.Mesh; rightLeg: THREE.Mesh; leftArm: THREE.Mesh; rightArm: THREE.Mesh } | null>(null);

  // Water Animation & Tank Filling
  const riverMeshRef = useRef<THREE.Mesh | null>(null);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);
  const pipeWaterParticlesRef = useRef<THREE.Points | null>(null);
  const ultrasonicRingsRef = useRef<THREE.Mesh[]>([]);
  const waterPourStreamRef = useRef<THREE.Mesh | null>(null);
  const waterSplashParticlesRef = useRef<THREE.Points | null>(null);
  const waterSplashVelocitiesRef = useRef<{ x: number; y: number; z: number; life: number; maxLife: number }[]>([]);
  const waterBubblesRef = useRef<THREE.Points | null>(null);
  const surfaceFoamDiscRef = useRef<THREE.Mesh | null>(null);
  const waterSurfaceMeshRef = useRef<THREE.Mesh | null>(null);
  const waterPumpGroupRef = useRef<THREE.Group | null>(null);


  // Dustbin & Biogas
  const dustbinLidRef = useRef<THREE.Group | null>(null);
  const dustbinAlertBeaconRef = useRef<THREE.Mesh | null>(null);
  const dustbinFillMeshRef = useRef<THREE.Mesh | null>(null);
  const biogasNeedleRef = useRef<THREE.Mesh | null>(null);
  const chimneySmokeParticlesRef = useRef<THREE.Points | null>(null);

  // EV Station
  const evCableParticlesRef = useRef<THREE.Points | null>(null);
  const evCarHeadlightsRef = useRef<THREE.SpotLight[]>([]);

  // Hotspot interaction pins
  const interactiveObjectsRef = useRef<{ mesh: THREE.Object3D; moduleId: ModuleId }[]>([]);

  // Smooth camera transition state
  const cameraTargetRef = useRef<{
    pos: THREE.Vector3;
    lookAt: THREE.Vector3;
    active: boolean;
  }>({
    pos: new THREE.Vector3(22, 18, 22),
    lookAt: new THREE.Vector3(0, 0, 0),
    active: false,
  });

  // 2D screen positions for minimal unobtrusive beacon nodes
  const [screenBeacons, setScreenBeacons] = React.useState<
    { moduleId: ModuleId; x: number; y: number; visible: boolean; number: number }[]
  >([]);

  // Handle module camera transition
  const flyCameraTo = useCallback((pos: [number, number, number], target: [number, number, number]) => {
    cameraTargetRef.current = {
      pos: new THREE.Vector3(...pos),
      lookAt: new THREE.Vector3(...target),
      active: true,
    };
  }, []);

  // Update target when selected module changes
  useEffect(() => {
    if (state.selectedModule) {
      const def = MODULE_DEFINITIONS[state.selectedModule];
      flyCameraTo(def.cameraPos, def.cameraTarget);
    } else {
      flyCameraTo([22, 18, 22], [0, 1, 0]);
    }
  }, [state.selectedModule, flyCameraTo]);

  // Main Three.js Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x7ec0ee);
    scene.fog = new THREE.FogExp2(0xcfe4f7, 0.012);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      300
    );
    camera.position.set(22, 18, 22);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2.05; // Prevent going underground
    controls.minDistance = 4;
    controls.maxDistance = 75;
    controls.target.set(0, 1, 0);
    controlsRef.current = controls;

    // Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x3d5a2d, 0.75);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.4);
    sunLight.position.set(22, 32, 16);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 90;
    const shadowD = 28;
    sunLight.shadow.camera.left = -shadowD;
    sunLight.shadow.camera.right = shadowD;
    sunLight.shadow.camera.top = shadowD;
    sunLight.shadow.camera.bottom = -shadowD;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    const moonLight = new THREE.DirectionalLight(0x7da4d9, 0.0);
    moonLight.position.set(-22, 28, -16);
    scene.add(moonLight);
    moonLightRef.current = moonLight;

    // Starfield for Night
    const starsCount = 750;
    const starsGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i += 3) {
      const radius = 100 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      starPositions[i] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = Math.abs(radius * Math.cos(phi)) + 8;
      starPositions[i + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.2,
      transparent: true,
      opacity: 0.0,
    });
    const stars = new THREE.Points(starsGeo, starsMat);
    scene.add(stars);
    starsRef.current = stars;

    // =========================================================================
    // BASE VILLAGE ENVIRONMENT & LIVE WATER RIVER
    // =========================================================================
    // Terrain Ground Plane
    const groundGeo = new THREE.PlaneGeometry(75, 75, 48, 48);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x478d38,
      roughness: 0.88,
      metalness: 0.04,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    ground.receiveShadow = true;
    scene.add(ground);

    // Live Flowing River / Canal (Subdivided plane for vertex wave oscillation)
    const riverGeo = new THREE.PlaneGeometry(75, 5, 48, 12);
    const riverMat = new THREE.MeshStandardMaterial({
      color: 0x0288d1,
      roughness: 0.1,
      metalness: 0.45,
      transparent: true,
      opacity: 0.88,
    });
    const river = new THREE.Mesh(riverGeo, riverMat);
    river.rotation.x = -Math.PI / 2;
    river.rotation.z = Math.PI / 9;
    river.position.set(0, 0.02, -15);
    river.receiveShadow = true;
    scene.add(river);
    riverMeshRef.current = river;

    // Asphalt Road with Bridge
    const roadGeo = new THREE.PlaneGeometry(6.4, 60);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x2b2e33,
      roughness: 0.9,
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.03, 2);
    road.receiveShadow = true;
    scene.add(road);

    // White dashed road lines
    for (let rz = -26; rz <= 28; rz += 4.5) {
      const dashGeo = new THREE.PlaneGeometry(0.24, 2.2);
      const dashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const dash = new THREE.Mesh(dashGeo, dashMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(0, 0.04, rz + 2);
      scene.add(dash);
    }

    // Bridge with Stone Railings
    const bridge = new THREE.Group();
    const bridgeDeck = new THREE.Mesh(
      new THREE.BoxGeometry(7.0, 0.45, 6.8),
      new THREE.MeshStandardMaterial({ color: 0x7d7265, roughness: 0.8 })
    );
    bridgeDeck.position.set(0, 0.38, -13.5);
    bridgeDeck.castShadow = true;
    bridgeDeck.receiveShadow = true;
    bridge.add(bridgeDeck);

    [-3.3, 3.3].forEach((rx) => {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.8, 6.8),
        new THREE.MeshStandardMaterial({ color: 0x4a433c })
      );
      rail.position.set(rx, 0.85, -13.5);
      rail.castShadow = true;
      bridge.add(rail);
    });
    scene.add(bridge);

    // Trees & Greenery
    const treePositions = [
      [-19, 0, 18], [-15, 0, 22], [-20, 0, 3],
      [18, 0, 19], [21, 0, 11], [18, 0, -18],
      [-18, 0, -19], [13, 0, 22], [-7, 0, 23],
      [12, 0, -22], [-14, 0, 12]
    ];
    treePositions.forEach(([tx, ty, tz]) => {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.38, 2.2, 6),
        new THREE.MeshStandardMaterial({ color: 0x543d2b, roughness: 0.9 })
      );
      trunk.position.y = 1.1;
      trunk.castShadow = true;
      tree.add(trunk);

      const foliageMat = new THREE.MeshStandardMaterial({
        color: 0x2e7d32,
        roughness: 0.8,
        flatShading: true,
      });
      const topFoliage = new THREE.Mesh(new THREE.DodecahedronGeometry(1.5, 0), foliageMat);
      topFoliage.position.y = 2.8;
      topFoliage.castShadow = true;
      tree.add(topFoliage);

      const sideFoliage = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1, 0), foliageMat);
      sideFoliage.position.set(0.65, 2.2, 0.3);
      sideFoliage.castShadow = true;
      tree.add(sideFoliage);

      tree.position.set(tx, ty, tz);
      scene.add(tree);
    });

    // 2 Live Wind Turbines on the green hills
    const createWindTurbine = (x: number, z: number, scale: number) => {
      const turbine = new THREE.Group();
      turbine.position.set(x, 0, z);
      turbine.scale.set(scale, scale, scale);

      const mast = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.75, 14, 12),
        new THREE.MeshStandardMaterial({ color: 0xe0e6ed, roughness: 0.4 })
      );
      mast.position.y = 7;
      mast.castShadow = true;
      turbine.add(mast);

      const nacelle = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 1, 2.6),
        new THREE.MeshStandardMaterial({ color: 0xd0d7de })
      );
      nacelle.position.set(0, 14, 0);
      nacelle.castShadow = true;
      turbine.add(nacelle);

      const blades = new THREE.Group();
      blades.position.set(0, 14, 1.4);
      for (let b = 0; b < 3; b++) {
        const blade = new THREE.Mesh(
          new THREE.ConeGeometry(0.32, 6.2, 4),
          new THREE.MeshStandardMaterial({ color: 0xffffff })
        );
        blade.position.y = 3.1;
        blade.castShadow = true;
        const bladePivot = new THREE.Group();
        bladePivot.rotation.z = (b * Math.PI * 2) / 3;
        bladePivot.add(blade);
        blades.add(bladePivot);
      }
      turbine.add(blades);
      scene.add(turbine);
      return blades;
    };

    windmillBlades1Ref.current = createWindTurbine(24, -20, 1.0);
    windmillBlades2Ref.current = createWindTurbine(19, -24, 0.8);

    // =========================================================================
    // LIVE TRAFFIC: CAR & FARM TRACTOR CRUISING CONTINUOUSLY
    // =========================================================================
    // 1. Village Modern Blue Car
    const blueCar = new THREE.Group();
    const chassis = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 0.65, 3.4),
      new THREE.MeshStandardMaterial({ color: 0x1565c0, roughness: 0.35 })
    );
    chassis.position.y = 0.45;
    chassis.castShadow = true;
    blueCar.add(chassis);

    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(1.45, 0.6, 1.9),
      new THREE.MeshStandardMaterial({ color: 0x90caf9, roughness: 0.2, transparent: true, opacity: 0.85 })
    );
    cabin.position.set(0, 0.95, -0.2);
    blueCar.add(cabin);

    // Car Wheels
    [[-0.9, 0.3, 1.0], [0.9, 0.3, 1.0], [-0.9, 0.3, -1.0], [0.9, 0.3, -1.0]].forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 0.22, 12),
        new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.9 })
      );
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, wy, wz);
      blueCar.add(wheel);
    });

    // Car Headlights
    carHeadlightsRef.current = [];
    [-0.55, 0.55].forEach((hx) => {
      const headGlow = new THREE.Mesh(
        new THREE.CircleGeometry(0.12, 12),
        new THREE.MeshBasicMaterial({ color: 0xfffaed })
      );
      headGlow.position.set(hx, 0.45, 1.71);
      blueCar.add(headGlow);

      const spot = new THREE.SpotLight(0xfffaed, 0, 18, Math.PI / 4, 0.4);
      spot.position.set(hx, 0.45, 1.75);
      spot.target.position.set(hx, 0, 10);
      scene.add(spot.target);
      scene.add(spot);
      carHeadlightsRef.current.push(spot);
    });

    blueCar.position.set(1.4, 0.1, 20);
    scene.add(blueCar);
    villageCarRef.current = blueCar;

    // 2. Village Eco Tractor / Green Delivery Truck in opposite lane
    const tractor = new THREE.Group();
    const tracBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.9, 2.8),
      new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.4 })
    );
    tracBody.position.y = 0.65;
    tracBody.castShadow = true;
    tractor.add(tracBody);

    const tracCab = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1.0, 1.4),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
    );
    tracCab.position.set(0, 1.45, -0.4);
    tractor.add(tracCab);

    // Large rear wheels
    [[-1.0, 0.5, -0.6], [1.0, 0.5, -0.6]].forEach(([wx, wy, wz]) => {
      const rw = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 0.35, 16),
        new THREE.MeshStandardMaterial({ color: 0x111111 })
      );
      rw.rotation.z = Math.PI / 2;
      rw.position.set(wx, wy, wz);
      tractor.add(rw);
    });

    // Smaller front wheels
    [[-0.95, 0.32, 0.8], [0.95, 0.32, 0.8]].forEach(([wx, wy, wz]) => {
      const fw = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.32, 0.25, 14),
        new THREE.MeshStandardMaterial({ color: 0x111111 })
      );
      fw.rotation.z = Math.PI / 2;
      fw.position.set(wx, wy, wz);
      tractor.add(fw);
    });

    tractor.position.set(-1.4, 0.1, -18);
    tractor.rotation.y = Math.PI; // Heading opposite direction
    scene.add(tractor);
    farmTractorRef.current = tractor;

    // =========================================================================
    // LIVE BIRDS CIRCLING IN THE SKY
    // =========================================================================
    const birdsGroup = new THREE.Group();
    birdsGroup.position.set(0, 22, 0);
    birdWingsRef.current = [];

    for (let bi = 0; bi < 5; bi++) {
      const bird = new THREE.Group();
      const birdBody = new THREE.Mesh(
        new THREE.ConeGeometry(0.12, 0.6, 4),
        new THREE.MeshStandardMaterial({ color: 0x37474f })
      );
      birdBody.rotation.x = Math.PI / 2;
      bird.add(birdBody);

      // Left wing
      const leftWing = new THREE.Mesh(
        new THREE.PlaneGeometry(0.6, 0.25),
        new THREE.MeshStandardMaterial({ color: 0x263238, side: THREE.DoubleSide })
      );
      leftWing.position.set(-0.35, 0, 0);
      bird.add(leftWing);

      // Right wing
      const rightWing = new THREE.Mesh(
        new THREE.PlaneGeometry(0.6, 0.25),
        new THREE.MeshStandardMaterial({ color: 0x263238, side: THREE.DoubleSide })
      );
      rightWing.position.set(0.35, 0, 0);
      bird.add(rightWing);

      // Position along an offset radius
      const angle = (bi / 5) * Math.PI * 2;
      bird.position.set(Math.cos(angle) * (14 + bi * 1.5), bi * 0.8, Math.sin(angle) * (14 + bi * 1.5));
      bird.rotation.y = -angle + Math.PI / 2;

      birdsGroup.add(bird);
      birdWingsRef.current.push({ left: leftWing, right: rightWing });
    }
    scene.add(birdsGroup);
    birdsGroupRef.current = birdsGroup;

    // =========================================================================
    // LIVE WALKING VILLAGER CHARACTER ON THE PATH
    // =========================================================================
    const villager = new THREE.Group();
    villager.position.set(4.5, 0, 6);

    const vTorso = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.55, 0.22),
      new THREE.MeshStandardMaterial({ color: 0xe65100 })
    );
    vTorso.position.y = 0.95;
    villager.add(vTorso);

    const vHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xd7ccc8 })
    );
    vHead.position.y = 1.35;
    villager.add(vHead);

    const legMat = new THREE.MeshStandardMaterial({ color: 0x1a237e });
    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.55, 0.12), legMat);
    leftLeg.position.set(-0.1, 0.35, 0);
    villager.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.55, 0.12), legMat);
    rightLeg.position.set(0.1, 0.35, 0);
    villager.add(rightLeg);

    const armMat = new THREE.MeshStandardMaterial({ color: 0xffb74d });
    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.45, 0.09), armMat);
    leftArm.position.set(-0.24, 0.9, 0);
    villager.add(leftArm);

    const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.45, 0.09), armMat);
    rightArm.position.set(0.24, 0.9, 0);
    villager.add(rightArm);

    scene.add(villager);
    villagerRef.current = villager;
    villagerLimbsRef.current = { leftLeg, rightLeg, leftArm, rightArm };

    // =========================================================================
    // MODULE 1: સોલાર શાળા અને ઘર (Solar School & Eco-Home)
    // =========================================================================
    const solarModuleGroup = new THREE.Group();
    solarModuleGroup.position.set(10, 0, 8);

    // School Building Base
    const schoolBuilding = new THREE.Mesh(
      new THREE.BoxGeometry(7.2, 3.8, 5.6),
      new THREE.MeshStandardMaterial({ color: 0xf4eedb, roughness: 0.7 })
    );
    schoolBuilding.position.set(0, 1.9, 0);
    schoolBuilding.castShadow = true;
    schoolBuilding.receiveShadow = true;
    solarModuleGroup.add(schoolBuilding);

    // Windows with warm glowing night light
    windowGlowMeshesRef.current = [];
    [[-2.2, 1.8, 2.82], [0, 1.8, 2.82], [2.2, 1.8, 2.82]].forEach(([wx, wy, wz]) => {
      const win = new THREE.Mesh(
        new THREE.PlaneGeometry(1.2, 1.1),
        new THREE.MeshBasicMaterial({ color: 0xffea00, transparent: true, opacity: 0.0 })
      );
      win.position.set(wx, wy, wz);
      solarModuleGroup.add(win);
      windowGlowMeshesRef.current.push(win);
    });

    // Indian Flag Pole in courtyard
    const flagPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 6),
      new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.8, roughness: 0.2 })
    );
    flagPole.position.set(-4.5, 3, 2.5);
    flagPole.castShadow = true;
    solarModuleGroup.add(flagPole);

    const flagMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.4, 0.8),
      new THREE.MeshStandardMaterial({ color: 0xff9933, side: THREE.DoubleSide })
    );
    flagMesh.position.set(-3.8, 5.4, 2.5);
    solarModuleGroup.add(flagMesh);

    // School Rooftop Solar Array
    const solarArrayGroup = new THREE.Group();
    solarArrayGroup.position.set(0, 3.85, 0);
    solarArrayGroup.rotation.x = 0.22;

    for (let px = -2.2; px <= 2.2; px += 2.2) {
      for (let pz = -1.2; pz <= 1.2; pz += 1.3) {
        const frame = new THREE.Mesh(
          new THREE.BoxGeometry(1.9, 0.1, 1.1),
          new THREE.MeshStandardMaterial({ color: 0x9e9e9e, metalness: 0.9, roughness: 0.2 })
        );
        frame.position.set(px, 0.05, pz);
        solarArrayGroup.add(frame);

        const cell = new THREE.Mesh(
          new THREE.PlaneGeometry(1.8, 1.0),
          new THREE.MeshStandardMaterial({
            color: 0x0a223a,
            roughness: 0.15,
            metalness: 0.88,
          })
        );
        cell.rotation.x = -Math.PI / 2;
        cell.position.set(px, 0.11, pz);
        solarArrayGroup.add(cell);
      }
    }
    solarModuleGroup.add(solarArrayGroup);

    // Inverter box
    const inverterBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 1.4, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.4 })
    );
    inverterBox.position.set(3.8, 1.8, 1.2);
    solarModuleGroup.add(inverterBox);

    const inverterLed = new THREE.Mesh(
      new THREE.SphereGeometry(0.08),
      new THREE.MeshBasicMaterial({ color: 0x00e676 })
    );
    inverterLed.position.set(3.8, 2.2, 1.45);
    solarModuleGroup.add(inverterLed);

    // Adjacent Eco-House
    const ecoHouse = new THREE.Group();
    ecoHouse.position.set(-6.5, 0, -2);
    const houseBody = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 2.8, 4.2),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 })
    );
    houseBody.position.y = 1.4;
    houseBody.castShadow = true;
    houseBody.receiveShadow = true;
    ecoHouse.add(houseBody);

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(3.6, 1.8, 4),
      new THREE.MeshStandardMaterial({ color: 0xb23b23, roughness: 0.85 })
    );
    roof.position.y = 3.7;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    ecoHouse.add(roof);

    const housePanel = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.08, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x102a45, metalness: 0.85, roughness: 0.2 })
    );
    housePanel.position.set(0, 3.4, 1.2);
    housePanel.rotation.x = 0.55;
    ecoHouse.add(housePanel);
    solarModuleGroup.add(ecoHouse);

    scene.add(solarModuleGroup);
    interactiveObjectsRef.current.push({ mesh: solarModuleGroup, moduleId: 'solar' });

    // =========================================================================
    // MODULE 2: AI સ્માર્ટ ખેતી (AI Smart Agriculture & Rotating Sprinklers)
    // =========================================================================
    const agriGroup = new THREE.Group();
    agriGroup.position.set(-10, 0, 8);

    const soilGeo = new THREE.BoxGeometry(9.2, 0.35, 7.6);
    const soilMat = new THREE.MeshStandardMaterial({
      color: 0x5a3d24,
      roughness: 0.95,
    });
    const soilMesh = new THREE.Mesh(soilGeo, soilMat);
    soilMesh.position.y = 0.15;
    soilMesh.receiveShadow = true;
    agriGroup.add(soilMesh);
    soilMeshRef.current = soilMesh;

    // Crop Rows
    for (let rowZ = -2.6; rowZ <= 2.6; rowZ += 1.3) {
      for (let plantX = -3.8; plantX <= 3.8; plantX += 0.9) {
        const crop = new THREE.Group();
        const stalk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.05, 0.5, 5),
          new THREE.MeshStandardMaterial({ color: 0x33691e })
        );
        stalk.position.y = 0.25;
        crop.add(stalk);

        const leafCluster = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.24, 0),
          new THREE.MeshStandardMaterial({ color: 0x558b2f, roughness: 0.7 })
        );
        leafCluster.position.y = 0.55;
        crop.add(leafCluster);

        crop.position.set(plantX, 0.3, rowZ);
        agriGroup.add(crop);
      }
    }

    // IoT Soil Probe
    const probeBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x212121, metalness: 0.8 })
    );
    probeBody.position.set(-3.2, 0.5, 2.5);
    agriGroup.add(probeBody);

    const probeLed = new THREE.Mesh(
      new THREE.SphereGeometry(0.06),
      new THREE.MeshBasicMaterial({ color: 0x00e676 })
    );
    probeLed.position.set(-3.2, 1.0, 2.67);
    agriGroup.add(probeLed);

    // 2 Live Rotating Water Sprinklers
    const sprinklerPositions = [[-2.2, 0, 0], [2.2, 0, 0]];
    sprinklerHeadsRef.current = [];

    sprinklerPositions.forEach(([sx, sy, sz]) => {
      const riserPipe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.9),
        new THREE.MeshStandardMaterial({ color: 0x455a64, metalness: 0.8 })
      );
      riserPipe.position.set(sx, 0.45, sz);
      agriGroup.add(riserPipe);

      const sprinklerHead = new THREE.Group();
      sprinklerHead.position.set(sx, 0.9, sz);

      const nozzleTee = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.15, 0.15),
        new THREE.MeshStandardMaterial({ color: 0xb0bec5, metalness: 0.9 })
      );
      sprinklerHead.add(nozzleTee);

      const nozzleArm1 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.4),
        new THREE.MeshStandardMaterial({ color: 0x263238 })
      );
      nozzleArm1.rotation.z = Math.PI / 3;
      nozzleArm1.position.set(0.18, 0.1, 0);
      sprinklerHead.add(nozzleArm1);

      const nozzleArm2 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.4),
        new THREE.MeshStandardMaterial({ color: 0x263238 })
      );
      nozzleArm2.rotation.z = -Math.PI / 3;
      nozzleArm2.position.set(-0.18, 0.1, 0);
      sprinklerHead.add(nozzleArm2);

      agriGroup.add(sprinklerHead);
      sprinklerHeadsRef.current.push(sprinklerHead);
    });

    // Shimmering Water Spray Particles
    const particleCount = 450;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities: { x: number; y: number; z: number; life: number; maxLife: number; origin: number }[] = [];

    for (let p = 0; p < particleCount; p++) {
      const origin = p % 2;
      const basePos = sprinklerPositions[origin];
      particlePositions[p * 3] = basePos[0] - 10;
      particlePositions[p * 3 + 1] = 0.9;
      particlePositions[p * 3 + 2] = basePos[2] + 8;

      const angle = Math.random() * Math.PI * 2;
      const speed = 1.9 + Math.random() * 2.2;
      particleVelocities.push({
        x: Math.cos(angle) * speed,
        y: 1.3 + Math.random() * 1.5,
        z: Math.sin(angle) * speed,
        life: Math.random(),
        maxLife: 0.9 + Math.random() * 0.5,
        origin,
      });
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x64b5f6,
      size: 0.15,
      transparent: true,
      opacity: 0.85,
    });
    const sprinklerParticles = new THREE.Points(particleGeo, particleMat);
    scene.add(sprinklerParticles);
    sprinklerParticlesRef.current = sprinklerParticles;

    scene.add(agriGroup);
    interactiveObjectsRef.current.push({ mesh: agriGroup, moduleId: 'agriculture' });

    // =========================================================================
    // MODULE 3: સ્માર્ટ સ્ટ્રીટ લાઈટ્સ (Smart Street Lights)
    // =========================================================================
    const streetLightGroup = new THREE.Group();
    streetSpotlightsRef.current = [];
    streetLightConesRef.current = [];

    const poleZPositions = [-16, -6, 4, 14];
    poleZPositions.forEach((pz, idx) => {
      const sideX = idx % 2 === 0 ? 3.6 : -3.6;
      const lampArmDir = idx % 2 === 0 ? -1 : 1;

      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.16, 5.5, 8),
        new THREE.MeshStandardMaterial({ color: 0x455a64, metalness: 0.7, roughness: 0.3 })
      );
      pole.position.set(sideX, 2.75, pz);
      pole.castShadow = true;
      streetLightGroup.add(pole);

      const solarCap = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.08, 0.6),
        new THREE.MeshStandardMaterial({ color: 0x102030, metalness: 0.8 })
      );
      solarCap.position.set(sideX, 5.6, pz);
      solarCap.rotation.z = lampArmDir * 0.2;
      streetLightGroup.add(solarCap);

      const arm = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.1, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x455a64, metalness: 0.7 })
      );
      arm.position.set(sideX + (lampArmDir * 0.7), 5.3, pz);
      streetLightGroup.add(arm);

      const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.14, 0.35),
        new THREE.MeshStandardMaterial({ color: 0x263238, roughness: 0.4 })
      );
      head.position.set(sideX + (lampArmDir * 1.3), 5.2, pz);
      streetLightGroup.add(head);

      const bulb = new THREE.Mesh(
        new THREE.PlaneGeometry(0.5, 0.28),
        new THREE.MeshBasicMaterial({ color: 0xfffaed })
      );
      bulb.rotation.x = Math.PI / 2;
      bulb.position.set(sideX + (lampArmDir * 1.3), 5.12, pz);
      streetLightGroup.add(bulb);

      // Real SpotLight
      const spotLight = new THREE.SpotLight(0xfffaed, 0, 16, Math.PI / 4, 0.4, 1.2);
      spotLight.position.set(sideX + (lampArmDir * 1.3), 5.1, pz);
      spotLight.target.position.set(0, 0, pz);
      spotLight.castShadow = true;
      scene.add(spotLight.target);
      scene.add(spotLight);
      streetSpotlightsRef.current.push(spotLight);

      // Volumetric light cone
      const coneGeo = new THREE.ConeGeometry(2.4, 5.1, 16, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: 0xfff2a6,
        transparent: true,
        opacity: 0.0,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const lightCone = new THREE.Mesh(coneGeo, coneMat);
      lightCone.position.set(sideX + (lampArmDir * 1.3), 2.55, pz);
      scene.add(lightCone);
      streetLightConesRef.current.push(lightCone);
    });

    scene.add(streetLightGroup);
    interactiveObjectsRef.current.push({ mesh: streetLightGroup, moduleId: 'streetlights' });

    // =========================================================================
    // MODULE 4: સ્માર્ટ પાણી વ્યવસ્થા (Smart Transparent Overhead Water Tank)
    // =========================================================================
    const waterModuleGroup = new THREE.Group();
    waterModuleGroup.position.set(-10, 0, -4);

    const towerHeight = 5.2;
    [[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.12, towerHeight),
        new THREE.MeshStandardMaterial({ color: 0x546e7a, metalness: 0.8, roughness: 0.3 })
      );
      leg.position.set(lx, towerHeight / 2, lz);
      leg.castShadow = true;
      waterModuleGroup.add(leg);
    });

    const platform = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.25, 3.2),
      new THREE.MeshStandardMaterial({ color: 0x37474f, metalness: 0.6 })
    );
    platform.position.y = towerHeight;
    waterModuleGroup.add(platform);

    const tankRadius = 1.4;
    const tankHeight = 3.6;

    // Clear Acrylic Transparent Cylinder with depthWrite: false so inner water is 100% visible
    const tankOuterGeo = new THREE.CylinderGeometry(tankRadius, tankRadius, tankHeight, 32, 1, true);
    const tankOuterMat = new THREE.MeshStandardMaterial({
      color: 0xebf8ff,
      transparent: true,
      opacity: 0.22,
      roughness: 0.05,
      metalness: 0.05,
      depthWrite: false, // CRITICAL: NEVER occlude the inner water!
      side: THREE.DoubleSide,
    });
    const tankOuter = new THREE.Mesh(tankOuterGeo, tankOuterMat);
    tankOuter.position.y = towerHeight + tankHeight / 2 + 0.12;
    waterModuleGroup.add(tankOuter);

    // Measurement Level Rings on the glass (25%, 50%, 75%, 90%)
    [0.25, 0.5, 0.75, 0.9].forEach((markFrac) => {
      const ringMark = new THREE.Mesh(
        new THREE.RingGeometry(tankRadius - 0.02, tankRadius + 0.02, 32),
        new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.55 })
      );
      ringMark.rotation.x = Math.PI / 2;
      ringMark.position.y = towerHeight + 0.12 + (tankHeight * markFrac);
      waterModuleGroup.add(ringMark);
    });

    const tankLid = new THREE.Mesh(
      new THREE.CylinderGeometry(tankRadius + 0.08, tankRadius + 0.08, 0.18, 24),
      new THREE.MeshStandardMaterial({ color: 0x0288d1 })
    );
    tankLid.position.y = towerHeight + tankHeight + 0.2;
    waterModuleGroup.add(tankLid);

    // VIBRANT GLOWING BLUE WATER CYLINDER (Default height 1, scaled dynamically by currentWaterHeight)
    const waterGeo = new THREE.CylinderGeometry(tankRadius - 0.04, tankRadius - 0.04, 1, 32);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0080ff,
      emissive: 0x0048ba,
      emissiveIntensity: 0.45,
      roughness: 0.06,
      metalness: 0.15,
      transparent: true,
      opacity: 0.92,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.y = towerHeight + 0.12 + 0.5;
    waterModuleGroup.add(waterMesh);
    waterMeshRef.current = waterMesh;

    // GLOWING TOP WATER SURFACE DISC
    const surfaceGeo = new THREE.CircleGeometry(tankRadius - 0.04, 32);
    const surfaceMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.6,
      roughness: 0.05,
      metalness: 0.25,
      side: THREE.DoubleSide,
    });
    const waterSurface = new THREE.Mesh(surfaceGeo, surfaceMat);
    waterSurface.rotation.x = -Math.PI / 2;
    waterSurface.position.y = towerHeight + 0.12 + 1.0;
    waterModuleGroup.add(waterSurface);
    waterSurfaceMeshRef.current = waterSurface;


    // Ultrasonic Radar Wave Rings
    ultrasonicRingsRef.current = [];
    for (let r = 0; r < 3; r++) {
      const ringGeo = new THREE.RingGeometry(0.2, 0.32, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00e5ff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, towerHeight + tankHeight - (r * 0.8), 0);
      waterModuleGroup.add(ring);
      ultrasonicRingsRef.current.push(ring);
    }

    // Submersible Base Pump Unit with Live Motor LED
    const pumpGroup = new THREE.Group();
    pumpGroup.position.set(0.9, 0.45, 0);

    const pumpBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.9, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x00695c, roughness: 0.35, metalness: 0.4 })
    );
    pumpBase.castShadow = true;
    pumpGroup.add(pumpBase);

    const pumpMotorCyl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 0.6, 16),
      new THREE.MeshStandardMaterial({ color: 0x004d40, metalness: 0.7 })
    );
    pumpMotorCyl.position.set(0, 0.55, 0);
    pumpGroup.add(pumpMotorCyl);

    const pumpLed = new THREE.Mesh(
      new THREE.SphereGeometry(0.06),
      new THREE.MeshBasicMaterial({ color: 0x00e676 })
    );
    pumpLed.position.set(0, 0.3, 0.46);
    pumpGroup.add(pumpLed);

    waterModuleGroup.add(pumpGroup);
    waterPumpGroupRef.current = pumpGroup;

    // Solid Inflow Pipe rising from pump up to tank rim
    const pipeOuter = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, towerHeight + tankHeight, 16),
      new THREE.MeshStandardMaterial({ color: 0x0277bd, metalness: 0.6, roughness: 0.3 })
    );
    pipeOuter.position.set(1.15, (towerHeight + tankHeight) / 2, 0);
    pipeOuter.castShadow = true;
    waterModuleGroup.add(pipeOuter);

    // Top Inflow Spout (Elbow bending inward towards tank center)
    const spoutArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.7, 16),
      new THREE.MeshStandardMaterial({ color: 0x0277bd, metalness: 0.6 })
    );
    spoutArm.rotation.z = Math.PI / 2;
    spoutArm.position.set(0.8, towerHeight + tankHeight + 0.08, 0);
    waterModuleGroup.add(spoutArm);

    // Downward Nozzle where water pours out
    const spoutNozzle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.1, 0.25, 16),
      new THREE.MeshStandardMaterial({ color: 0x01579b, metalness: 0.8 })
    );
    spoutNozzle.position.set(0.5, towerHeight + tankHeight - 0.02, 0);
    waterModuleGroup.add(spoutNozzle);

    // Live Flowing Water Inflow Particles in Pipe (speeding upwards into the tank)
    const pipeCount = 28;
    const pipeGeo = new THREE.BufferGeometry();
    const pipePos = new Float32Array(pipeCount * 3);
    for (let pi = 0; pi < pipeCount; pi++) {
      pipePos[pi * 3] = -10 + 1.15;
      pipePos[pi * 3 + 1] = (pi / pipeCount) * (towerHeight + tankHeight);
      pipePos[pi * 3 + 2] = -4;
    }
    pipeGeo.setAttribute('position', new THREE.BufferAttribute(pipePos, 3));
    const pipeMat = new THREE.PointsMaterial({
      color: 0x40c4ff,
      size: 0.2,
      transparent: true,
      opacity: 0.9,
    });
    const pipeParticles = new THREE.Points(pipeGeo, pipeMat);
    scene.add(pipeParticles);
    pipeWaterParticlesRef.current = pipeParticles;

    // =========================================================================
    // REALISTIC CASCADING WATER POUR STREAM (Waterfall into the tank)
    // =========================================================================
    const pourGeo = new THREE.CylinderGeometry(0.18, 0.26, 1, 16);
    const pourMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00b4d8,
      emissiveIntensity: 0.85,
      roughness: 0.05,
      metalness: 0.2,
      transparent: true,
      opacity: 0.96,
    });
    const pourStream = new THREE.Mesh(pourGeo, pourMat);
    pourStream.position.set(0.5, towerHeight + tankHeight / 2, 0);
    pourStream.visible = false;
    waterModuleGroup.add(pourStream);
    waterPourStreamRef.current = pourStream;

    // Splashing Droplets Particle System at the stream impact point
    const splashCount = 70;
    const splashGeo = new THREE.BufferGeometry();
    const splashPos = new Float32Array(splashCount * 3);
    const splashVel: { x: number; y: number; z: number; life: number; maxLife: number }[] = [];

    for (let sp = 0; sp < splashCount; sp++) {
      splashPos[sp * 3] = 0.5;
      splashPos[sp * 3 + 1] = towerHeight + 1.5;
      splashPos[sp * 3 + 2] = 0;

      const angle = Math.random() * Math.PI * 2;
      const speed = 0.7 + Math.random() * 1.5;
      splashVel.push({
        x: Math.cos(angle) * speed,
        y: 1.0 + Math.random() * 1.8,
        z: Math.sin(angle) * speed,
        life: Math.random(),
        maxLife: 0.45 + Math.random() * 0.4,
      });
    }
    splashGeo.setAttribute('position', new THREE.BufferAttribute(splashPos, 3));
    const splashMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.22,
      transparent: true,
      opacity: 0.95,
    });
    const splashPoints = new THREE.Points(splashGeo, splashMat);
    splashPoints.visible = false;
    waterModuleGroup.add(splashPoints);
    waterSplashParticlesRef.current = splashPoints;
    waterSplashVelocitiesRef.current = splashVel;


    // Expanding Surface Foam Ring at impact point
    const foamGeo = new THREE.RingGeometry(0.04, 0.45, 24);
    const foamMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
    });
    const foamRing = new THREE.Mesh(foamGeo, foamMat);
    foamRing.rotation.x = Math.PI / 2;
    foamRing.position.set(0.5, towerHeight + 1.5, 0);
    foamRing.visible = false;
    waterModuleGroup.add(foamRing);
    surfaceFoamDiscRef.current = foamRing;

    // Rising Air Bubbles inside the Water Cylinder
    const bubbleCount = 35;
    const bubbleGeo = new THREE.BufferGeometry();
    const bubblePos = new Float32Array(bubbleCount * 3);
    for (let bi = 0; bi < bubbleCount; bi++) {
      bubblePos[bi * 3] = (Math.random() - 0.5) * (tankRadius * 1.4);
      bubblePos[bi * 3 + 1] = towerHeight + 0.2 + Math.random() * (tankHeight * 0.7);
      bubblePos[bi * 3 + 2] = (Math.random() - 0.5) * (tankRadius * 1.4);
    }
    bubbleGeo.setAttribute('position', new THREE.BufferAttribute(bubblePos, 3));
    const bubbleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.65,
    });
    const bubblePoints = new THREE.Points(bubbleGeo, bubbleMat);
    bubblePoints.visible = false;
    waterModuleGroup.add(bubblePoints);
    waterBubblesRef.current = bubblePoints;

    scene.add(waterModuleGroup);
    interactiveObjectsRef.current.push({ mesh: waterModuleGroup, moduleId: 'watertank' });


    // =========================================================================
    // MODULE 5: સ્માર્ટ કચરાપેટી (Smart Ultrasonic Dustbin)
    // =========================================================================
    const dustbinGroup = new THREE.Group();
    dustbinGroup.position.set(3.2, 0, 4.2);

    const binPlat = new THREE.Mesh(
      new THREE.CylinderGeometry(1.0, 1.1, 0.15, 16),
      new THREE.MeshStandardMaterial({ color: 0x9e9e9e })
    );
    binPlat.position.y = 0.07;
    dustbinGroup.add(binPlat);

    const binBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.55, 1.5, 18, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.5 })
    );
    binBody.position.y = 0.85;
    binBody.castShadow = true;
    dustbinGroup.add(binBody);

    const fillMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.52, 1.35, 16),
      new THREE.MeshStandardMaterial({ color: 0x795548, roughness: 0.9 })
    );
    fillMesh.position.y = 0.8;
    dustbinGroup.add(fillMesh);
    dustbinFillMeshRef.current = fillMesh;

    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, 1.6, -0.6);

    const lidCover = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.7, 0.15, 18),
      new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.4 })
    );
    lidCover.position.set(0, 0.08, 0.6);
    lidGroup.add(lidCover);

    const beacon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.22, 12),
      new THREE.MeshBasicMaterial({ color: 0xff1744 })
    );
    beacon.position.set(0, 0.26, 0.6);
    beacon.visible = false;
    lidGroup.add(beacon);
    dustbinAlertBeaconRef.current = beacon;

    dustbinGroup.add(lidGroup);
    dustbinLidRef.current = lidGroup;

    scene.add(dustbinGroup);
    interactiveObjectsRef.current.push({ mesh: dustbinGroup, moduleId: 'dustbin' });

    // =========================================================================
    // MODULE 6: બાયોગેસ પ્લાન્ટ (Biogas Plant & Pressure Needle)
    // =========================================================================
    const biogasGroup = new THREE.Group();
    biogasGroup.position.set(9.5, 0, -6.5);

    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(2.4, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.85 })
    );
    dome.position.y = 0.0;
    dome.castShadow = true;
    dome.receiveShadow = true;
    biogasGroup.add(dome);

    const inletTank = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.7, 1.2, 16),
      new THREE.MeshStandardMaterial({ color: 0x6d4c41 })
    );
    inletTank.position.set(-2.8, 0.6, 0);
    inletTank.castShadow = true;
    biogasGroup.add(inletTank);

    const slurryPit = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.6, 1.6),
      new THREE.MeshStandardMaterial({ color: 0x3e2723 })
    );
    slurryPit.position.set(2.6, 0.3, 0);
    biogasGroup.add(slurryPit);

    const gaugeDial = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 0.12, 24),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
    );
    gaugeDial.rotation.x = Math.PI / 2;
    gaugeDial.position.set(0, 3.3, 0.3);
    biogasGroup.add(gaugeDial);

    const needleGroup = new THREE.Group();
    needleGroup.position.set(0, 3.3, 0.38);

    const needle = new THREE.Mesh(
      new THREE.ConeGeometry(0.04, 0.32, 4),
      new THREE.MeshBasicMaterial({ color: 0xd50000 })
    );
    needle.position.y = 0.16;
    needleGroup.add(needle);
    biogasGroup.add(needleGroup);
    biogasNeedleRef.current = needle as unknown as THREE.Mesh;
    (biogasNeedleRef.current as unknown as { pivot: THREE.Group }).pivot = needleGroup;

    // Gentle Chimney / Digester Steam Particles
    const smokeCount = 35;
    const smokeGeo = new THREE.BufferGeometry();
    const smokePos = new Float32Array(smokeCount * 3);
    for (let sm = 0; sm < smokeCount; sm++) {
      smokePos[sm * 3] = 9.5;
      smokePos[sm * 3 + 1] = 2.8 + (sm / smokeCount) * 2.5;
      smokePos[sm * 3 + 2] = -6.5;
    }
    smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePos, 3));
    const smokeMat = new THREE.PointsMaterial({
      color: 0xeeeeee,
      size: 0.35,
      transparent: true,
      opacity: 0.35,
    });
    const smokePoints = new THREE.Points(smokeGeo, smokeMat);
    scene.add(smokePoints);
    chimneySmokeParticlesRef.current = smokePoints;

    scene.add(biogasGroup);
    interactiveObjectsRef.current.push({ mesh: biogasGroup, moduleId: 'biogas' });

    // =========================================================================
    // MODULE 7: ગાડી - EV ચાર્જિંગ સ્ટેશન (EV Fast Charging Station)
    // =========================================================================
    const evGroup = new THREE.Group();
    evGroup.position.set(-4.5, 0, -9.5);

    const canopyRoof = new THREE.Mesh(
      new THREE.BoxGeometry(4.8, 0.15, 3.6),
      new THREE.MeshStandardMaterial({ color: 0x1a237e, metalness: 0.85, roughness: 0.25 })
    );
    canopyRoof.position.set(0, 3.4, 0);
    canopyRoof.rotation.x = -0.15;
    canopyRoof.castShadow = true;
    evGroup.add(canopyRoof);

    [[-2.1, -1.5], [2.1, -1.5], [-2.1, 1.5], [2.1, 1.5]].forEach(([cx, cz]) => {
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 3.4),
        new THREE.MeshStandardMaterial({ color: 0xe0e0e0, metalness: 0.6 })
      );
      col.position.set(cx, 1.7, cz);
      col.castShadow = true;
      evGroup.add(col);
    });

    const chargerPillar = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 1.8, 0.45),
      new THREE.MeshStandardMaterial({ color: 0x263238, roughness: 0.3 })
    );
    chargerPillar.position.set(1.6, 0.9, -0.6);
    evGroup.add(chargerPillar);

    const parkedCar = new THREE.Group();
    parkedCar.position.set(-0.4, 0, 0);

    const pCarBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 0.65, 3.4),
      new THREE.MeshStandardMaterial({ color: 0x00c853, roughness: 0.3, metalness: 0.2 })
    );
    pCarBody.position.y = 0.55;
    pCarBody.castShadow = true;
    parkedCar.add(pCarBody);

    const pCabin = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.6, 1.9),
      new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.1, transparent: true, opacity: 0.85 })
    );
    pCabin.position.set(0, 1.05, -0.15);
    parkedCar.add(pCabin);

    [[-1.0, 0.35, 1.0], [1.0, 0.35, 1.0], [-1.0, 0.35, -1.0], [1.0, 0.35, -1.0]].forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 0.22, 16),
        new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 })
      );
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, wy, wz);
      parkedCar.add(wheel);
    });

    evCarHeadlightsRef.current = [];
    [-0.6, 0.6].forEach((hx) => {
      const spot = new THREE.SpotLight(0x00e5ff, 0.0, 8, Math.PI / 4);
      spot.position.set(hx - 4.5, 0.55, 1.75 - 9.5);
      spot.target.position.set(hx - 4.5, 0, 8 - 9.5);
      scene.add(spot.target);
      scene.add(spot);
      evCarHeadlightsRef.current.push(spot);
    });

    evGroup.add(parkedCar);

    // Glowing Charging Cable
    const cableCurve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(1.6, 0.8, -0.4),
      new THREE.Vector3(1.1, 0.2, -0.4),
      new THREE.Vector3(0.8, 0.2, -0.2),
      new THREE.Vector3(0.55, 0.65, -0.2)
    );
    const cableGeo = new THREE.TubeGeometry(cableCurve, 16, 0.035, 6, false);
    const cableMat = new THREE.MeshStandardMaterial({ color: 0x00e676, roughness: 0.4, emissive: 0x00e676, emissiveIntensity: 0.5 });
    const cableMesh = new THREE.Mesh(cableGeo, cableMat);
    evGroup.add(cableMesh);

    // Charging Pulse Particles
    const cableParticlesCount = 30;
    const cablePartGeo = new THREE.BufferGeometry();
    const cablePartPos = new Float32Array(cableParticlesCount * 3);
    for (let cp = 0; cp < cableParticlesCount; cp++) {
      const pt = cableCurve.getPoint(cp / cableParticlesCount);
      cablePartPos[cp * 3] = pt.x - 4.5;
      cablePartPos[cp * 3 + 1] = pt.y;
      cablePartPos[cp * 3 + 2] = pt.z - 9.5;
    }
    cablePartGeo.setAttribute('position', new THREE.BufferAttribute(cablePartPos, 3));
    const cablePartMat = new THREE.PointsMaterial({
      color: 0x00e5ff,
      size: 0.18,
      transparent: true,
      opacity: 0.95,
    });
    const evCableParticles = new THREE.Points(cablePartGeo, cablePartMat);
    scene.add(evCableParticles);
    evCableParticlesRef.current = evCableParticles;

    scene.add(evGroup);
    interactiveObjectsRef.current.push({ mesh: evGroup, moduleId: 'evstation' });

    // =========================================================================
    // Click & Raycaster Hotspot Detection on 3D Canvas
    // =========================================================================
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      for (const item of interactiveObjectsRef.current) {
        const intersects = raycaster.intersectObject(item.mesh, true);
        if (intersects.length > 0) {
          sound.playClick();
          onSelectModule(item.moduleId);
          return;
        }
      }
    };

    renderer.domElement.addEventListener('click', handleClick);

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // =========================================================================
    // MAIN LIVE ANIMATION LOOP
    // =========================================================================
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();
      const currState = stateRef.current;

      // 1. Rotate Live Wind Turbines
      if (windmillBlades1Ref.current) windmillBlades1Ref.current.rotation.z += delta * 1.6;
      if (windmillBlades2Ref.current) windmillBlades2Ref.current.rotation.z += delta * 1.3;

      // 2. Animate Live Flowing River Wave Vertices
      if (riverMeshRef.current) {
        const riverGeo = riverMeshRef.current.geometry;
        const posAttr = riverGeo.attributes.position;
        const vertex = new THREE.Vector3();
        for (let i = 0; i < posAttr.count; i++) {
          vertex.fromBufferAttribute(posAttr, i);
          // Wave displacement along canal
          const wave = Math.sin(vertex.x * 0.4 + elapsedTime * 2.5) * 0.06;
          posAttr.setZ(i, wave);
        }
        posAttr.needsUpdate = true;
      }

      // 3. Animate Live Traffic Cars Along Road
      if (villageCarRef.current) {
        villageCarRef.current.position.z -= delta * 4.5;
        if (villageCarRef.current.position.z < -26) {
          villageCarRef.current.position.z = 28;
        }
      }
      if (farmTractorRef.current) {
        farmTractorRef.current.position.z += delta * 3.2;
        if (farmTractorRef.current.position.z > 28) {
          farmTractorRef.current.position.z = -26;
        }
      }

      // 4. Animate Live Birds Circling in Sky
      if (birdsGroupRef.current) {
        birdsGroupRef.current.rotation.y += delta * 0.35;
        // Flap wings with sine oscillation
        birdWingsRef.current.forEach(({ left, right }) => {
          const flap = Math.sin(elapsedTime * 9) * 0.45;
          left.rotation.z = flap;
          right.rotation.z = -flap;
        });
      }

      // 5. Animate Walking Villager
      if (villagerRef.current && villagerLimbsRef.current) {
        // Move gently along the footpath
        villagerRef.current.position.z += Math.sin(elapsedTime * 0.5) * delta * 0.8;
        const walkSwing = Math.sin(elapsedTime * 4.5) * 0.45;
        villagerLimbsRef.current.leftLeg.rotation.x = walkSwing;
        villagerLimbsRef.current.rightLeg.rotation.x = -walkSwing;
        villagerLimbsRef.current.leftArm.rotation.x = -walkSwing;
        villagerLimbsRef.current.rightArm.rotation.x = walkSwing;
      }

      // 6. Day / Night Lighting, Shadows & Sky Colors
      const time = currState.timeOfDay;
      const sunAngle = ((time - 6) / 24) * Math.PI * 2;
      const sunY = Math.sin(sunAngle) * 35;
      const sunX = Math.cos(sunAngle) * 35;
      const isDay = sunY > 0;

      if (sunLightRef.current && moonLightRef.current && hemiLightRef.current && sceneRef.current) {
        sunLightRef.current.position.set(sunX, Math.max(sunY, -5), 16);
        moonLightRef.current.position.set(-sunX, Math.max(-sunY, -5), -16);

        if (isDay) {
          const noonFactor = Math.sin((time / 24) * Math.PI);
          sunLightRef.current.intensity = Math.max(0.2, noonFactor * 1.55);
          moonLightRef.current.intensity = 0.0;
          hemiLightRef.current.intensity = 0.5 + noonFactor * 0.45;

          if (time >= 6 && time <= 8) {
            sceneRef.current.background = new THREE.Color(0xfb8c00);
          } else if (time >= 17 && time <= 19) {
            sceneRef.current.background = new THREE.Color(0xf4511e);
          } else {
            sceneRef.current.background = new THREE.Color(0x7ec0ee);
          }
          if (starsRef.current) {
            (starsRef.current.material as THREE.PointsMaterial).opacity = 0.0;
          }
          windowGlowMeshesRef.current.forEach((w) => {
            (w.material as THREE.MeshBasicMaterial).opacity = 0.0;
          });
        } else {
          // Night time
          sunLightRef.current.intensity = 0.0;
          moonLightRef.current.intensity = 0.5;
          hemiLightRef.current.intensity = 0.18;
          sceneRef.current.background = new THREE.Color(0x0a1128);

          if (starsRef.current) {
            (starsRef.current.material as THREE.PointsMaterial).opacity = 0.88;
            starsRef.current.rotation.y += delta * 0.02;
          }
          windowGlowMeshesRef.current.forEach((w) => {
            (w.material as THREE.MeshBasicMaterial).opacity = 0.75;
          });
        }
      }

      // 7. Live Sprinklers & Water Droplets
      if (soilMeshRef.current) {
        const moist = currState.agriculture.soilMoisturePct / 100;
        const dryColor = new THREE.Color(0xb89060);
        const wetColor = new THREE.Color(0x4a2e18);
        (soilMeshRef.current.material as THREE.MeshStandardMaterial).color.lerpColors(dryColor, wetColor, moist);
      }

      // Sprinklers rotate actively
      const headAngle = Math.sin(elapsedTime * 4.5) * 0.7;
      sprinklerHeadsRef.current.forEach((head) => {
        head.rotation.y = headAngle;
      });

      // Shimmering Water particles
      if (sprinklerParticlesRef.current) {
        const isSpraying = currState.agriculture.sprinklersActive;
        sprinklerParticlesRef.current.visible = isSpraying;

        if (isSpraying) {
          const posAttr = sprinklerParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
          const posArray = posAttr.array as Float32Array;

          for (let p = 0; p < particleCount; p++) {
            const v = particleVelocities[p];
            v.life += delta;
            if (v.life > v.maxLife) {
              v.life = 0;
              const originX = sprinklerPositions[v.origin][0] - 10;
              const originZ = sprinklerPositions[v.origin][2] + 8;
              posArray[p * 3] = originX;
              posArray[p * 3 + 1] = 0.9;
              posArray[p * 3 + 2] = originZ;
            } else {
              posArray[p * 3] += v.x * delta;
              posArray[p * 3 + 1] += (v.y - 2.8 * v.life) * delta;
              posArray[p * 3 + 2] += v.z * delta;
            }
          }
          posAttr.needsUpdate = true;
        }
      }

      // 8. Live Streetlights & Car Headlights
      const streetLightsOn = currState.streetlights.lightsActive;
      const streetBrightness = currState.streetlights.brightnessPct / 100;

      streetSpotlightsRef.current.forEach((spot) => {
        spot.intensity = streetLightsOn ? 2.5 * streetBrightness : 0;
      });
      streetLightConesRef.current.forEach((cone) => {
        (cone.material as THREE.MeshBasicMaterial).opacity = streetLightsOn ? 0.35 * streetBrightness : 0;
      });

      carHeadlightsRef.current.forEach((spot) => {
        spot.intensity = !isDay ? 2.2 : 0;
      });

      // 9. Water Tank Dynamic Level & Cascading Inflow Waterfall Animation
      const isFilling = currState.watertank.pumpActive;
      const level = Math.max(0.06, Math.min(0.96, currState.watertank.waterLevelPct / 100));
      const currentWaterHeight = Math.max(0.15, tankHeight * level);
      const tankBottomY = towerHeight + 0.12;
      const surfaceY = tankBottomY + currentWaterHeight;
      const spoutY = towerHeight + tankHeight - 0.05;

      if (waterMeshRef.current) {
        // Water cylinder fills from bottom plate up to surfaceY
        waterMeshRef.current.scale.set(1, currentWaterHeight, 1);
        waterMeshRef.current.position.y = tankBottomY + currentWaterHeight / 2;
      }

      if (waterSurfaceMeshRef.current) {
        // Glowing water surface disc sits exactly at the water level
        waterSurfaceMeshRef.current.position.y = surfaceY;
        const waveFreq = isFilling ? 7.5 : 2.2;
        const waveAmp = isFilling ? 0.035 : 0.012;
        const waveS = 1.0 + Math.sin(elapsedTime * waveFreq) * waveAmp;
        waterSurfaceMeshRef.current.scale.set(waveS, waveS, 1);
      }


      // Ultrasonic radar rings pulsing downwards onto the rising water surface
      ultrasonicRingsRef.current.forEach((ring, i) => {
        const pulse = (elapsedTime * 1.8 + i * 0.4) % 1.5;
        const ringY = Math.max(surfaceY + 0.1, (towerHeight + tankHeight) - pulse * (towerHeight + tankHeight - surfaceY));
        ring.position.y = ringY;
        ring.scale.set(1 + pulse * 0.5, 1 + pulse * 0.5, 1);
        (ring.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.75 - pulse * 0.5);
      });

      // Flowing water pulses up through the vertical inflow pipe
      if (pipeWaterParticlesRef.current) {
        pipeWaterParticlesRef.current.visible = isFilling;
        if (isFilling) {
          const posAttr = pipeWaterParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
          const posArray = posAttr.array as Float32Array;
          for (let pi = 0; pi < 28; pi++) {
            const yProgress = ((pi / 28) + (elapsedTime * 1.6)) % 1.0;
            posArray[pi * 3 + 1] = yProgress * (towerHeight + tankHeight);
          }
          posAttr.needsUpdate = true;
        }
      }

      // Live Cascading Waterfall Pouring Stream into the Tank
      if (waterPourStreamRef.current) {
        waterPourStreamRef.current.visible = isFilling;
        if (isFilling) {
          const streamLength = Math.max(0.12, spoutY - surfaceY);
          waterPourStreamRef.current.scale.set(1, streamLength, 1);
          waterPourStreamRef.current.position.set(0.5, spoutY - streamLength / 2, 0);
          waterPourStreamRef.current.rotation.y += delta * 7.5; // Swirling rush
        }
      }

      // Impact Splashing Droplets Jumping at the Water Surface
      if (waterSplashParticlesRef.current) {
        waterSplashParticlesRef.current.visible = isFilling;
        if (isFilling) {
          const posAttr = waterSplashParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
          const posArray = posAttr.array as Float32Array;
          const vels = waterSplashVelocitiesRef.current;

          for (let sp = 0; sp < 60; sp++) {
            const v = vels[sp];
            v.life += delta;
            if (v.life > v.maxLife) {
              v.life = 0;
              posArray[sp * 3] = 0.5;
              posArray[sp * 3 + 1] = surfaceY;
              posArray[sp * 3 + 2] = 0;
            } else {
              posArray[sp * 3] += v.x * delta;
              posArray[sp * 3 + 1] += (v.y - 4.5 * v.life) * delta;
              posArray[sp * 3 + 2] += v.z * delta;
            }
          }
          posAttr.needsUpdate = true;
        }
      }

      // Foaming Impact Ring on the water surface
      if (surfaceFoamDiscRef.current) {
        surfaceFoamDiscRef.current.visible = isFilling;
        if (isFilling) {
          surfaceFoamDiscRef.current.position.set(0.5, surfaceY + 0.02, 0);
          const foamScale = 1.0 + Math.sin(elapsedTime * 9) * 0.35;
          surfaceFoamDiscRef.current.scale.set(foamScale, foamScale, 1);
        }
      }

      // Rising Air Bubbles Inside the Water Tank
      if (waterBubblesRef.current) {
        waterBubblesRef.current.visible = isFilling;
        if (isFilling) {
          const posAttr = waterBubblesRef.current.geometry.attributes.position as THREE.BufferAttribute;
          const posArray = posAttr.array as Float32Array;
          for (let bi = 0; bi < 35; bi++) {
            posArray[bi * 3 + 1] += delta * (1.8 + (bi % 4) * 0.4);
            if (posArray[bi * 3 + 1] >= surfaceY) {
              posArray[bi * 3 + 1] = towerHeight + 0.15; // Reset to tank bottom
            }
          }
          posAttr.needsUpdate = true;
        }
      }

      // Mechanical Submersible Pump Vibration
      if (waterPumpGroupRef.current) {
        if (isFilling) {
          waterPumpGroupRef.current.position.x = 0.9 + (Math.random() - 0.5) * 0.035;
          waterPumpGroupRef.current.position.z = (Math.random() - 0.5) * 0.035;
        } else {
          waterPumpGroupRef.current.position.set(0.9, 0.45, 0);
        }
      }


      // 10. Dustbin Lid Rotation & 85% Siren
      if (dustbinLidRef.current) {
        const targetLidAngle = currState.dustbin.lidOpen ? -1.1 : 0;
        dustbinLidRef.current.rotation.x = THREE.MathUtils.lerp(
          dustbinLidRef.current.rotation.x,
          targetLidAngle,
          delta * 8
        );
      }
      if (dustbinAlertBeaconRef.current) {
        dustbinAlertBeaconRef.current.visible = currState.dustbin.alertTriggered && Math.floor(elapsedTime * 6) % 2 === 0;
      }
      if (dustbinFillMeshRef.current) {
        const fillScale = Math.max(0.08, currState.dustbin.fillLevelPct / 100);
        dustbinFillMeshRef.current.scale.y = fillScale;
        dustbinFillMeshRef.current.position.y = 0.15 + (1.35 * fillScale) / 2;
      }

      // 11. Biogas Needle & Gentle Steam Puff
      if (biogasNeedleRef.current) {
        const pivot = (biogasNeedleRef.current as unknown as { pivot: THREE.Group }).pivot;
        if (pivot) {
          const psiFraction = currState.biogas.pressurePsi / 100;
          const targetNeedleAngle = -2.1 + psiFraction * 4.2;
          pivot.rotation.z = THREE.MathUtils.lerp(pivot.rotation.z, targetNeedleAngle, delta * 5);
        }
      }

      if (chimneySmokeParticlesRef.current) {
        const posAttr = chimneySmokeParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const posArray = posAttr.array as Float32Array;
        for (let sm = 0; sm < smokeCount; sm++) {
          const yProg = ((sm / smokeCount) + (elapsedTime * 0.3)) % 1.0;
          posArray[sm * 3 + 1] = 2.8 + yProg * 2.8;
          posArray[sm * 3] = 9.5 + Math.sin(elapsedTime + sm) * 0.15;
        }
        posAttr.needsUpdate = true;
      }

      // 12. EV Charging Cable Energy Pulse
      if (evCableParticlesRef.current) {
        evCableParticlesRef.current.visible = currState.evstation.chargingActive;
        if (currState.evstation.chargingActive) {
          const posAttr = evCableParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
          const posArray = posAttr.array as Float32Array;

          for (let cp = 0; cp < cableParticlesCount; cp++) {
            const t = ((cp / cableParticlesCount) + (elapsedTime * 0.8)) % 1.0;
            const pt = cableCurve.getPoint(t);
            posArray[cp * 3] = pt.x - 4.5;
            posArray[cp * 3 + 1] = pt.y;
            posArray[cp * 3 + 2] = pt.z - 9.5;
          }
          posAttr.needsUpdate = true;
        }
      }

      // 13. Smooth Camera Interpolation
      if (cameraTargetRef.current.active && controlsRef.current && cameraRef.current) {
        const { pos, lookAt } = cameraTargetRef.current;
        cameraRef.current.position.lerp(pos, delta * 2.8);
        controlsRef.current.target.lerp(lookAt, delta * 3.2);

        if (cameraRef.current.position.distanceTo(pos) < 0.2) {
          cameraTargetRef.current.active = false;
        }
      }

      controlsRef.current?.update();

      // Project minimal unobtrusive beacon positions
      if (container && cameraRef.current && !currState.cleanLiveMode) {
        const beacons = (Object.keys(MODULE_DEFINITIONS) as ModuleId[]).map((id) => {
          const def = MODULE_DEFINITIONS[id];
          const v3 = new THREE.Vector3(...def.cameraTarget);
          v3.y += 2.0;
          v3.project(cameraRef.current!);

          const x = (v3.x * 0.5 + 0.5) * container.clientWidth;
          const y = (-(v3.y * 0.5) + 0.5) * container.clientHeight;
          const visible = v3.z < 1.0;

          return { moduleId: id, x, y, visible, number: def.number };
        });
        setScreenBeacons(beacons);
      } else {
        setScreenBeacons([]);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onSelectModule]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Minimal, Non-Intrusive 3D Glowing Beacon Dots (NO TEXT BLOCKING THE VIEW!) */}
      {!state.cleanLiveMode && (
        <div className="absolute inset-0 pointer-events-none">
          {screenBeacons.map(({ moduleId, x, y, visible, number }) => {
            if (!visible || x < 0 || y < 0) return null;
            const isSelected = state.selectedModule === moduleId;

            return (
              <div
                key={moduleId}
                style={{
                  transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
                }}
                className="absolute pointer-events-auto"
              >
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onSelectModule(moduleId);
                  }}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shadow-lg transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-400/40 scale-125'
                      : 'bg-slate-900/85 text-emerald-300 border border-emerald-400/50 hover:scale-125 hover:bg-emerald-600 hover:text-white'
                  }`}
                  title={`મોડ્યુલ ${number} જુઓ`}
                >
                  {number}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
