import * as THREE from "./assets/three.module.min.js";

const panelDefinitions = [
  { src: "/assets/work/erp-pos.webp", width: 4.4, height: 2.51, position: [0.55, 0.05, -0.25], rotation: [0.01, -0.12, 0.01] },
  { src: "/assets/work/rag-grounded-answer.webp", width: 2.9, height: 1.63, position: [-2.15, 1.45, -1.65], rotation: [0.04, 0.25, -0.04] },
  { src: "/assets/work/faceswap-capture.webp", width: 2.85, height: 1.63, position: [-2.05, -1.35, -1.35], rotation: [-0.04, 0.22, 0.05] },
  { src: "/assets/work/cctv-motion-dashboard.webp", width: 1.62, height: 2.46, position: [3.35, -0.55, -1.7], rotation: [0.02, -0.25, 0.02] }
];

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

export const initProductScene = async (host, { reduceMotion = false } = {}) => {
  const canvas = host?.querySelector("canvas");
  const hero = host?.closest(".hero");
  if (!canvas || !hero) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true
    });
  } catch {
    return;
  }

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0, 11);

  const rig = new THREE.Group();
  scene.add(rig);
  scene.add(new THREE.AmbientLight(0xffffff, 1.8));
  const keyLight = new THREE.DirectionalLight(0x74f0b8, 2.6);
  keyLight.position.set(3, 4, 7);
  scene.add(keyLight);

  const loader = new THREE.TextureLoader();
  const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const panels = [];

  const createPanel = async (definition, index) => {
    const texture = await loader.loadAsync(definition.src);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = anisotropy;

    const panel = new THREE.Group();
    const bezel = new THREE.Mesh(
      new THREE.BoxGeometry(definition.width + 0.16, definition.height + 0.16, 0.12),
      new THREE.MeshStandardMaterial({ color: index === 0 ? 0x17251e : 0x101914, metalness: 0.72, roughness: 0.28 })
    );
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(definition.width, definition.height),
      new THREE.MeshBasicMaterial({ map: texture, toneMapped: false })
    );
    screen.position.z = 0.071;

    const edgeGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(definition.width + 0.17, definition.height + 0.17, 0.13));
    const edges = new THREE.LineSegments(
      edgeGeometry,
      new THREE.LineBasicMaterial({ color: index === 0 ? 0x4cd897 : 0x668276, transparent: true, opacity: index === 0 ? 0.72 : 0.42 })
    );

    panel.add(bezel, screen, edges);
    panel.position.set(...definition.position);
    panel.rotation.set(...definition.rotation);
    panel.userData.baseY = definition.position[1];
    panel.userData.phase = index * 1.45;
    rig.add(panel);
    panels.push(panel);
  };

  try {
    await Promise.all(panelDefinitions.map(createPanel));
  } catch {
    renderer.dispose();
    return;
  }

  const pointer = { x: 0, y: 0 };
  const rotation = { x: 0, y: 0 };
  let visible = true;
  let frame = 0;
  let startTime = performance.now();

  const resize = () => {
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = width < 700 ? 39 : width < 1050 ? 37 : 34;
    camera.updateProjectionMatrix();

    if (width < 700) {
      rig.scale.setScalar(0.68);
      rig.position.set(0.85, 2.15, -0.6);
    } else if (width < 1050) {
      rig.scale.setScalar(0.84);
      rig.position.set(2.35, 0.45, -0.35);
    } else {
      rig.scale.setScalar(1);
      rig.position.set(2.25, 0, 0);
    }

    if (reduceMotion && panels.length) renderer.render(scene, camera);
  };

  const updateScrollPosition = () => {
    const bounds = hero.getBoundingClientRect();
    const progress = clamp(-bounds.top / Math.max(1, bounds.height), 0, 1);
    rig.position.y += ((window.innerWidth < 700 ? 2.15 : 0) + progress * 0.72 - rig.position.y) * 0.08;
  };

  const render = (now = performance.now()) => {
    const elapsed = (now - startTime) / 1000;
    rotation.x += (pointer.y * -0.12 - rotation.x) * 0.055;
    rotation.y += (pointer.x * 0.2 - rotation.y) * 0.055;
    rig.rotation.x = rotation.x;
    rig.rotation.y = rotation.y;

    if (!reduceMotion) {
      panels.forEach((panel) => {
        panel.position.y = panel.userData.baseY + Math.sin(elapsed * 0.72 + panel.userData.phase) * 0.075;
      });
      updateScrollPosition();
    }

    renderer.render(scene, camera);
    if (visible && !reduceMotion) frame = window.requestAnimationFrame(render);
  };

  const onPointerMove = (event) => {
    if (event.pointerType === "touch") return;
    const bounds = hero.getBoundingClientRect();
    pointer.x = clamp((event.clientX - bounds.left) / bounds.width - 0.5, -0.5, 0.5);
    pointer.y = clamp((event.clientY - bounds.top) / bounds.height - 0.5, -0.5, 0.5);
  };

  const onPointerLeave = () => {
    pointer.x = 0;
    pointer.y = 0;
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  hero.addEventListener("pointermove", onPointerMove, { passive: true });
  hero.addEventListener("pointerleave", onPointerLeave);

  if (!reduceMotion && "IntersectionObserver" in window) {
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      window.cancelAnimationFrame(frame);
      if (visible) {
        startTime = performance.now();
        frame = window.requestAnimationFrame(render);
      }
    });
    visibilityObserver.observe(hero);
  }

  resize();
  render();
  host.classList.add("is-webgl-ready");
};
