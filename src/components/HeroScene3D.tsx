import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export type EvolutionStage = 0 | 1 | 2 | 3;

const STAGE_LABELS: { stage: EvolutionStage; label: string; caption: string }[] = [
  { stage: 0, label: 'IDEA', caption: 'Singular architectural nucleus' },
  { stage: 1, label: 'CONNECTION', caption: 'Linked harmonic conduits' },
  { stage: 2, label: 'SYSTEM', caption: 'Interlocking structural lattice' },
  { stage: 3, label: 'PRODUCT', caption: 'Precision unified monolith' },
];

// Pre-allocated scratch math objects (zero GC in render loop)
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _scale = new THREE.Vector3(1, 1, 1);
const _mat4 = new THREE.Matrix4();
const _euler = new THREE.Euler();

function createArchitecturalDatumTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.clearRect(0, 0, size, size);
    const cx = size / 2;
    const cy = size / 2;

    ctx.strokeStyle = 'rgba(229, 169, 60, 0.24)';
    ctx.lineWidth = 1.5;
    [160, 275, 385, 472].forEach((r, idx) => {
      ctx.beginPath();
      if (idx === 1) ctx.setLineDash([6, 10]);
      else ctx.setLineDash([]);
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    for (let i = 0; i < 72; i++) {
      const angle = (i / 72) * Math.PI * 2;
      const major = i % 6 === 0;
      const inner = major ? 450 : 462;
      const outer = 472;
      ctx.strokeStyle = major ? 'rgba(229, 169, 60, 0.48)' : 'rgba(255, 255, 255, 0.14)';
      ctx.lineWidth = major ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
      ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 488, cy);
    ctx.lineTo(cx + 488, cy);
    ctx.moveTo(cx, cy - 488);
    ctx.lineTo(cx, cy + 488);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(
      size / 2,
      size / 2,
      10,
      size / 2,
      size / 2,
      size / 2,
    );
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.28)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

interface HeroScene3DProps {
  onReady: () => void;
}

export function HeroScene3D({ onReady }: HeroScene3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglFallback, setWebglFallback] = useState(false);
  const [activeStage, setActiveStage] = useState<EvolutionStage>(0);
  const [dockCollapsed, setDockCollapsed] = useState(false);

  const manualStageRef = useRef<EvolutionStage | null>(null);
  const targetStageProgressRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const dragVelocityRef = useRef(0);
  const scrollNormRef = useRef(0);

  const handleSelectStage = (stage: EvolutionStage) => {
    manualStageRef.current = stage;
    targetStageProgressRef.current = stage;
    setActiveStage(stage);
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setWebglFallback(true);
      onReady();
      return;
    }

    let isSoftwareGl = false;
    try {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
      if (!gl) {
        setWebglFallback(true);
        onReady();
        return;
      }
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    } catch {
      setWebglFallback(true);
      onReady();
      return;
    }

    const isMobile = window.innerWidth < 768;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch {
      setWebglFallback(true);
      onReady();
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.14;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x08080a, 1);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    renderer.setSize(width, height);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x08080a);
    scene.fog = new THREE.FogExp2(0x08080a, 0.036);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(isMobile ? 0 : 2.15, isMobile ? 0.4 : 0.72, isMobile ? 9.2 : 7.5);
    camera.lookAt(isMobile ? 0 : 0.65, isMobile ? 0.25 : 0.05, 0);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    // Studio 3-point warm/cool lighting rig
    const hemiLight = new THREE.HemisphereLight(0x7c97b8, 0x101015, 0.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffe4bc, 2.5);
    keyLight.position.set(5, 7, 5);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 22;
      keyLight.shadow.camera.left = -5;
      keyLight.shadow.camera.right = 5;
      keyLight.shadow.camera.top = 5;
      keyLight.shadow.camera.bottom = -5;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xe5a93c, 1.95);
    rimLight.position.set(-5, 3, -4);
    scene.add(rimLight);

    const sculptureRoot = new THREE.Group();
    sculptureRoot.position.set(isMobile ? 0.35 : 1.5, isMobile ? 0.75 : 0.05, 0);
    sculptureRoot.scale.setScalar(isMobile ? 0.74 : 1);
    scene.add(sculptureRoot);

    // Calibrated PBR material family
    const obsidianMat = new THREE.MeshPhysicalMaterial({
      color: 0x141418,
      metalness: 0.84,
      roughness: 0.34,
      clearcoat: 0.5,
      clearcoatRoughness: 0.22,
    });

    const brushedTitaniumMat = new THREE.MeshPhysicalMaterial({
      color: 0x6a6d77,
      metalness: 0.94,
      roughness: 0.17,
      anisotropy: 0.85,
      anisotropyRotation: 0.3,
    });

    const amberAlloyMat = new THREE.MeshPhysicalMaterial({
      color: 0xe5a93c,
      metalness: 0.88,
      roughness: 0.22,
      emissive: 0x452a04,
      emissiveIntensity: 0.38,
    });

    const crystalCoreMat = new THREE.MeshPhysicalMaterial({
      color: 0xf7cf86,
      metalness: 0.05,
      roughness: 0.08,
      ior: 1.85,
      clearcoat: 1.0,
      transmission: isSoftwareGl ? 0 : 0.78,
      transparent: true,
      opacity: isSoftwareGl ? 0.58 : 1.0,
      thickness: 1.4,
      attenuationColor: new THREE.Color(0xe5a93c),
      attenuationDistance: 1.2,
    });

    // Part 1: Core Idea Nucleus + Machined Collar
    const coreGeo = new THREE.OctahedronGeometry(0.64, 0);
    const coreMesh = new THREE.Mesh(coreGeo, crystalCoreMat);
    coreMesh.castShadow = !isSoftwareGl;
    sculptureRoot.add(coreMesh);

    const collarGeo = new THREE.TorusGeometry(0.86, 0.032, 12, 6);
    const collarMesh = new THREE.Mesh(collarGeo, brushedTitaniumMat);
    collarMesh.rotation.x = Math.PI / 2;
    sculptureRoot.add(collarMesh);

    const coreWireGeo = new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.95, 0));
    const coreWireMat = new THREE.LineBasicMaterial({
      color: 0xe5a93c,
      transparent: true,
      opacity: 0.55,
    });
    const coreWire = new THREE.LineSegments(coreWireGeo, coreWireMat);
    sculptureRoot.add(coreWire);

    // Part 2: Connection Gimbal Rings
    const ringConfigs = [
      { radius: 1.38, tube: 0.022, tiltX: Math.PI * 0.22, tiltZ: 0.25, mat: brushedTitaniumMat },
      { radius: 1.66, tube: 0.017, tiltX: -Math.PI * 0.34, tiltZ: -0.45, mat: amberAlloyMat },
      { radius: 1.98, tube: 0.022, tiltX: Math.PI * 0.45, tiltZ: 0.75, mat: obsidianMat },
    ];
    const gimbalRings: THREE.Mesh[] = [];
    const ringGeos: THREE.TorusGeometry[] = [];
    ringConfigs.forEach((cfg) => {
      const geo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 16, 84);
      ringGeos.push(geo);
      const mesh = new THREE.Mesh(geo, cfg.mat);
      mesh.rotation.set(cfg.tiltX, 0, cfg.tiltZ);
      mesh.castShadow = !isSoftwareGl;
      sculptureRoot.add(mesh);
      gimbalRings.push(mesh);
    });

    // Part 3: System Lattice Nodes + Inter-node & Core Conduits
    const NODE_COUNT = 24;
    const nodeGeo = new THREE.SphereGeometry(0.054, 14, 14);
    const nodesInstanced = new THREE.InstancedMesh(nodeGeo, amberAlloyMat, NODE_COUNT);
    const nodeBaseDirs: THREE.Vector3[] = [];
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    for (let i = 0; i < NODE_COUNT; i++) {
      const theta = (2 * Math.PI * i) / goldenRatio;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / NODE_COUNT);
      const dir = new THREE.Vector3(
        Math.cos(theta) * Math.sin(phi),
        Math.sin(theta) * Math.sin(phi),
        Math.cos(phi),
      ).normalize();
      nodeBaseDirs.push(dir);
      _mat4.compose(
        _vec3A.copy(dir).multiplyScalar(1.5),
        _quat.identity(),
        _scale.setScalar(1),
      );
      nodesInstanced.setMatrixAt(i, _mat4);
    }
    nodesInstanced.instanceMatrix.needsUpdate = true;
    nodesInstanced.computeBoundingSphere();
    nodesInstanced.frustumCulled = false;
    sculptureRoot.add(nodesInstanced);

    const linePairs: [number, number][] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        if (nodeBaseDirs[i].distanceTo(nodeBaseDirs[j]) < 1.08) {
          linePairs.push([i, j]);
        }
      }
    }
    const linePositions = new Float32Array(linePairs.length * 6);
    const connectionsGeo = new THREE.BufferGeometry();
    connectionsGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const connectionsMat = new THREE.LineBasicMaterial({
      color: 0xe5a93c,
      transparent: true,
      opacity: 0.36,
    });
    const connectionsMesh = new THREE.LineSegments(connectionsGeo, connectionsMat);
    sculptureRoot.add(connectionsMesh);

    // Radial spokes from core to 8 cardinal lattice nodes
    const radialPositions = new Float32Array(8 * 6);
    const radialGeo = new THREE.BufferGeometry();
    radialGeo.setAttribute('position', new THREE.BufferAttribute(radialPositions, 3));
    const radialMat = new THREE.LineBasicMaterial({
      color: 0xf4f4f0,
      transparent: true,
      opacity: 0.16,
    });
    const radialMesh = new THREE.LineSegments(radialGeo, radialMat);
    sculptureRoot.add(radialMesh);

    // Part 4: Product Monolith Architectural Plates (6 beveled ExtrudeGeometry slabs)
    const plateShape = new THREE.Shape();
    plateShape.moveTo(-0.23, -0.8);
    plateShape.lineTo(0.23, -0.8);
    plateShape.lineTo(0.31, 0.8);
    plateShape.lineTo(-0.31, 0.8);
    plateShape.closePath();

    const plateGeo = new THREE.ExtrudeGeometry(plateShape, {
      depth: 0.065,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
    });
    plateGeo.center();

    const PLATE_COUNT = 6;
    const monolithPlates: THREE.Mesh[] = [];
    for (let i = 0; i < PLATE_COUNT; i++) {
      const plate = new THREE.Mesh(
        plateGeo,
        i % 2 === 0 ? obsidianMat : brushedTitaniumMat,
      );
      plate.castShadow = !isSoftwareGl;
      plate.receiveShadow = !isSoftwareGl;
      sculptureRoot.add(plate);
      monolithPlates.push(plate);
    }

    // Part 5: Grounded Architectural Datum Ring & Radial Contact Shadow
    const datumTex = createArchitecturalDatumTexture();
    datumTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const datumGeo = new THREE.PlaneGeometry(5.6, 5.6);
    const datumMat = new THREE.MeshBasicMaterial({
      map: datumTex,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const datumPlane = new THREE.Mesh(datumGeo, datumMat);
    datumPlane.rotation.x = -Math.PI / 2;
    datumPlane.position.y = -2.18;
    sculptureRoot.add(datumPlane);

    const shadowTex = createContactShadowTexture();
    const shadowGeo = new THREE.PlaneGeometry(4.2, 4.2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = -2.2;
    sculptureRoot.add(contactShadow);

    // Part 6: Controlled Particle Field
    const PARTICLE_COUNT = isMobile ? 20 : 48;
    const moteGeo = new THREE.OctahedronGeometry(0.02, 0);
    const moteMat = new THREE.MeshBasicMaterial({
      color: 0xe5a93c,
      transparent: true,
      opacity: 0.52,
    });
    const motesInstanced = new THREE.InstancedMesh(moteGeo, moteMat, PARTICLE_COUNT);
    const moteSeeds: { angle: number; radius: number; y: number; speed: number }[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const seed = {
        angle: (i / PARTICLE_COUNT) * Math.PI * 2 + (i % 5) * 0.4,
        radius: 2.35 + (i % 7) * 0.34,
        y: ((i % 11) - 5) * 0.38,
        speed: 0.08 + (i % 4) * 0.03,
      };
      moteSeeds.push(seed);
      _mat4.compose(
        _vec3A.set(Math.cos(seed.angle) * seed.radius, seed.y, Math.sin(seed.angle) * seed.radius),
        _quat.identity(),
        _scale.setScalar(1),
      );
      motesInstanced.setMatrixAt(i, _mat4);
    }
    motesInstanced.instanceMatrix.needsUpdate = true;
    motesInstanced.computeBoundingSphere();
    motesInstanced.frustumCulled = false;
    sculptureRoot.add(motesInstanced);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    let isDragging = false;
    let lastDragX = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      isDragging = true;
      lastDragX = e.clientX;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const onPointerMove = (e: PointerEvent) => {
      pointerRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
      if (isDragging) {
        const dx = e.clientX - lastDragX;
        lastDragX = e.clientX;
        dragVelocityRef.current = THREE.MathUtils.clamp(
          dragVelocityRef.current + dx * 0.008,
          -2.4,
          2.4,
        );
      }
    };

    const onScroll = () => {
      const heroEl = container.parentElement;
      if (!heroEl) return;
      const rect = heroEl.getBoundingClientRect();
      const total = Math.max(1, window.innerHeight * 0.9);
      const progress = THREE.MathUtils.clamp(-rect.top / total, 0, 1);
      scrollNormRef.current = progress;
      if (manualStageRef.current === null) {
        targetStageProgressRef.current = progress * 3;
        const discrete = Math.min(3, Math.round(progress * 3)) as EvolutionStage;
        setActiveStage(discrete);
      }
    };

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      const mobileNow = w < 768;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      sculptureRoot.position.set(mobileNow ? 0.35 : 1.5, mobileNow ? 0.75 : 0.05, 0);
      sculptureRoot.scale.setScalar(mobileNow ? 0.74 : 1);
      renderer.setSize(w, h);
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    };

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglFallback(true);
    };
    const onContextRestored = () => {
      setWebglFallback(false);
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    let frameId = 0;
    let disposed = false;
    let lastTime = performance.now();
    let elapsed = 0;
    let currentStageSmooth = 0;
    let smoothPointerX = 0;
    let smoothPointerY = 0;
    let dragAngleOffset = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function updateScene(dt: number) {
      elapsed += dt;

      currentStageSmooth = THREE.MathUtils.damp(
        currentStageSmooth,
        targetStageProgressRef.current,
        3.6,
        dt,
      );
      smoothPointerX = THREE.MathUtils.damp(smoothPointerX, pointerRef.current.x, 4.5, dt);
      smoothPointerY = THREE.MathUtils.damp(smoothPointerY, pointerRef.current.y, 4.5, dt);

      dragAngleOffset += dragVelocityRef.current * dt * 2.2;
      dragVelocityRef.current = THREE.MathUtils.damp(dragVelocityRef.current, 0, 3.2, dt);

      sculptureRoot.rotation.y =
        elapsed * 0.14 + dragAngleOffset + smoothPointerX * 0.28 + currentStageSmooth * 0.34;
      sculptureRoot.rotation.x = smoothPointerY * 0.14 - currentStageSmooth * 0.08;

      const coreScale = 1 + Math.sin(elapsed * 1.4) * 0.035 - currentStageSmooth * 0.06;
      coreMesh.scale.setScalar(coreScale);
      coreMesh.rotation.y = -elapsed * 0.35;
      coreMesh.rotation.z = elapsed * 0.2;

      collarMesh.rotation.z = elapsed * 0.18;
      coreWire.rotation.y = elapsed * 0.22;
      coreWire.scale.setScalar(1 + currentStageSmooth * 0.14);
      coreWireMat.opacity = THREE.MathUtils.clamp(0.65 - currentStageSmooth * 0.12, 0.22, 0.7);

      gimbalRings.forEach((ring, idx) => {
        const speed = (idx % 2 === 0 ? 1 : -1) * (0.2 + idx * 0.07);
        ring.rotation.y += dt * speed;
        const ringExpand = 1 + currentStageSmooth * (0.06 - idx * 0.02);
        ring.scale.setScalar(ringExpand);
      });

      const latticeRadius =
        1.25 + Math.sin(Math.min(1, currentStageSmooth / 2) * Math.PI * 0.5) * 0.55;
      for (let i = 0; i < NODE_COUNT; i++) {
        const dir = nodeBaseDirs[i];
        const pulse = 1 + Math.sin(elapsed * 1.6 + i * 0.5) * 0.04;
        _vec3A.copy(dir).multiplyScalar(latticeRadius * pulse);
        const nodeScale = THREE.MathUtils.clamp(0.55 + currentStageSmooth * 0.28, 0.5, 1.25);
        _mat4.compose(_vec3A, _quat.identity(), _scale.setScalar(nodeScale));
        nodesInstanced.setMatrixAt(i, _mat4);
      }
      nodesInstanced.instanceMatrix.needsUpdate = true;

      const posAttr = connectionsGeo.attributes.position as THREE.BufferAttribute;
      for (let k = 0; k < linePairs.length; k++) {
        const [a, b] = linePairs[k];
        const pulseA = 1 + Math.sin(elapsed * 1.6 + a * 0.5) * 0.04;
        const pulseB = 1 + Math.sin(elapsed * 1.6 + b * 0.5) * 0.04;
        _vec3A.copy(nodeBaseDirs[a]).multiplyScalar(latticeRadius * pulseA);
        _vec3B.copy(nodeBaseDirs[b]).multiplyScalar(latticeRadius * pulseB);
        posAttr.setXYZ(k * 2, _vec3A.x, _vec3A.y, _vec3A.z);
        posAttr.setXYZ(k * 2 + 1, _vec3B.x, _vec3B.y, _vec3B.z);
      }
      posAttr.needsUpdate = true;
      connectionsMat.opacity = THREE.MathUtils.clamp(0.16 + currentStageSmooth * 0.14, 0.14, 0.54);

      const radialAttr = radialGeo.attributes.position as THREE.BufferAttribute;
      for (let r = 0; r < 8; r++) {
        const nodeIdx = (r * 3) % NODE_COUNT;
        const pulse = 1 + Math.sin(elapsed * 1.6 + nodeIdx * 0.5) * 0.04;
        _vec3A.copy(nodeBaseDirs[nodeIdx]).multiplyScalar(latticeRadius * pulse);
        radialAttr.setXYZ(r * 2, 0, 0, 0);
        radialAttr.setXYZ(r * 2 + 1, _vec3A.x, _vec3A.y, _vec3A.z);
      }
      radialAttr.needsUpdate = true;
      radialMat.opacity = THREE.MathUtils.clamp(0.08 + (currentStageSmooth / 3) * 0.18, 0.08, 0.26);

      const productConvergence = THREE.MathUtils.clamp((currentStageSmooth - 1.1) / 1.9, 0, 1);
      const plateOrbitR = THREE.MathUtils.lerp(2.45, 1.46, productConvergence);
      monolithPlates.forEach((plate, idx) => {
        const angle = (idx / PLATE_COUNT) * Math.PI * 2 + elapsed * 0.08;
        plate.position.set(
          Math.cos(angle) * plateOrbitR,
          Math.sin(elapsed * 0.9 + idx) * (0.14 * (1 - productConvergence * 0.72)),
          Math.sin(angle) * plateOrbitR,
        );
        plate.lookAt(0, plate.position.y, 0);
        const s = THREE.MathUtils.lerp(0.65, 1.06, productConvergence);
        plate.scale.setScalar(s);
      });

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const seed = moteSeeds[i];
        const a = seed.angle + elapsed * seed.speed;
        _vec3A.set(
          Math.cos(a) * seed.radius,
          seed.y + Math.sin(elapsed * 0.8 + i) * 0.14,
          Math.sin(a) * seed.radius,
        );
        _euler.set(elapsed * 0.4, elapsed * 0.3, 0);
        _quat.setFromEuler(_euler);
        _mat4.compose(_vec3A, _quat, _scale.setScalar(1));
        motesInstanced.setMatrixAt(i, _mat4);
      }
      motesInstanced.instanceMatrix.needsUpdate = true;

      const mobileNow = window.innerWidth < 768;
      const targetCamZ = (mobileNow ? 9.2 : 7.5) - currentStageSmooth * 0.32;
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 3, dt);
      camera.position.y = THREE.MathUtils.damp(
        camera.position.y,
        (mobileNow ? 0.4 : 0.72) + smoothPointerY * 0.2 - currentStageSmooth * 0.1,
        3,
        dt,
      );
      camera.lookAt(mobileNow ? 0 : 0.65, mobileNow ? 0.25 : 0.05, 0);
    }

    let notifiedReady = false;
    function tick() {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      updateScene(dt);
      renderer.render(scene, camera);

      if (!notifiedReady) {
        notifiedReady = true;
        onReady();
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      window.clearTimeout(frameId);

      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);

      coreGeo.dispose();
      collarGeo.dispose();
      coreWireGeo.dispose();
      coreWireMat.dispose();
      ringGeos.forEach((g) => g.dispose());
      nodeGeo.dispose();
      connectionsGeo.dispose();
      connectionsMat.dispose();
      radialGeo.dispose();
      radialMat.dispose();
      plateGeo.dispose();
      datumGeo.dispose();
      datumMat.dispose();
      datumTex.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      shadowTex.dispose();
      moteGeo.dispose();
      moteMat.dispose();
      obsidianMat.dispose();
      brushedTitaniumMat.dispose();
      amberAlloyMat.dispose();
      crystalCoreMat.dispose();
      envTexture.dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [onReady]);

  const stageMeta = STAGE_LABELS[activeStage];

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#08080a]">
      {!webglFallback ? (
        <div
          ref={mountRef}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing"
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center md:justify-end pr-4 md:pr-24 bg-[#08080a]"
        >
          <svg
            viewBox="0 0 480 480"
            className="h-[58vh] w-[58vh] sm:h-[68vh] sm:w-[68vh] max-w-full opacity-60"
            fill="none"
          >
            <circle cx="240" cy="240" r="210" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <circle
              cx="240"
              cy="240"
              r="156"
              stroke="rgba(229,169,60,0.35)"
              strokeWidth="1"
              strokeDasharray="6 8"
            />
            <polygon
              points="240,70 387,155 387,325 240,410 93,325 93,155"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1.2"
            />
            <polygon
              points="240,128 337,240 240,352 143,240"
              stroke="#e5a93c"
              strokeWidth="1.5"
              fill="rgba(229,169,60,0.08)"
            />
            <line x1="240" y1="30" x2="240" y2="450" stroke="rgba(255,255,255,0.06)" />
            <line x1="30" y1="240" x2="450" y2="240" stroke="rgba(255,255,255,0.06)" />
          </svg>
        </div>
      )}

      {/* Measured contrast scrims for desktop left column and mobile foreground */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#08080a]/92 via-[#08080a]/62 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#08080a] via-[#08080a]/75 to-transparent"
      />

      {/* Compact Collapsible Bottom Evolution Control Dock (solid rgba surface, no backdrop-filter over WebGL) */}
      {!webglFallback && (
        <div className="pointer-events-auto absolute bottom-5 right-5 sm:right-6 md:right-12 z-20 flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2">
            {!dockCollapsed && (
              <span className="hidden md:inline font-mono-tabular text-[11px] tracking-[0.12em] text-[#a1a1aa]">
                {stageMeta.caption}
              </span>
            )}
            <button
              type="button"
              onClick={() => setDockCollapsed((v) => !v)}
              aria-expanded={!dockCollapsed}
              className="border border-white/15 bg-[#111114]/95 px-3 py-1 font-mono-tabular text-[10px] sm:text-[11px] tracking-[0.14em] text-[#a1a1aa] hover:text-[#f4f4f0] transition-colors cursor-pointer whitespace-nowrap"
            >
              {dockCollapsed ? '▴ SYSTEM STAGE' : '▾ HIDE STAGE'}
            </button>
          </div>

          {!dockCollapsed && (
            <div
              role="group"
              aria-label="3D architecture evolution stages"
              className="flex items-center gap-1 border border-white/15 bg-[#111114]/95 p-1 max-w-[calc(100vw-2.5rem)] overflow-x-auto"
            >
              {STAGE_LABELS.map((item) => {
                const active = activeStage === item.stage;
                return (
                  <button
                    key={item.stage}
                    type="button"
                    onClick={() => handleSelectStage(item.stage)}
                    className={`px-2.5 sm:px-3 py-1.5 font-mono-tabular text-[10px] sm:text-[11px] tracking-[0.12em] transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-[#e5a93c] text-[#08080a] font-medium'
                        : 'text-[#a1a1aa] hover:text-[#f4f4f0]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
              {manualStageRef.current !== null && (
                <button
                  type="button"
                  onClick={() => {
                    manualStageRef.current = null;
                    targetStageProgressRef.current = scrollNormRef.current * 3;
                    setActiveStage(
                      Math.min(3, Math.round(scrollNormRef.current * 3)) as EvolutionStage,
                    );
                  }}
                  title="Sync back to scroll position"
                  className="px-2 py-1.5 font-mono-tabular text-[10px] sm:text-[11px] text-[#e5a93c] hover:text-[#f0ba54] cursor-pointer whitespace-nowrap shrink-0"
                >
                  AUTO
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
