/* ==========================================================================
   Ghost IDE download site — Three.js backdrop
   Custom GLSL: noise-displaced fresnel core + spirit particle field
   ========================================================================== */

import * as THREE from 'three';

const COLOR_A = new THREE.Color('#8fa3ff');
const COLOR_B = new THREE.Color('#7fe7c4');
const BG_COLOR = new THREE.Color('#0b0e14');

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const COARSE = window.matchMedia('(pointer: coarse)').matches;

/* Ashima Arts / Stefan Gustavson simplex noise (MIT) */
const SNOISE = /* glsl */`
vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 mod289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

const CORE_VERT = /* glsl */`
uniform float uTime;
varying vec3 vNormal;
varying vec3 vView;
${SNOISE}
void main(){
  vec3 dir = normalize(position);
  float n  = snoise(dir * 1.7 + vec3(0.0, uTime * 0.22, 0.0));
  n += 0.45 * snoise(dir * 4.3 - vec3(uTime * 0.16, 0.0, uTime * 0.1));
  vec3 displaced = position + normal * n * 0.30;
  vec4 mv = modelViewMatrix * vec4(displaced, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;

const CORE_FRAG = /* glsl */`
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uTime;
varying vec3 vNormal;
varying vec3 vView;
void main(){
  float fres = pow(1.0 - abs(dot(vNormal, vView)), 1.7);
  float band = 0.5 + 0.5 * sin(vNormal.y * 5.0 + vNormal.x * 2.0 + uTime * 0.55);
  vec3 col = mix(uColorA, uColorB, band);
  col += fres * 0.35;
  gl_FragColor = vec4(col, fres * 0.85);
}
`;

const PARTICLE_VERT = /* glsl */`
attribute float aSize;
attribute float aPhase;
attribute float aSpeed;
attribute float aMix;
uniform float uTime;
uniform float uHeight;
uniform float uPixelRatio;
varying float vAlpha;
varying float vMix;
void main(){
  vec3 p = position;
  p.y = mod(p.y + uTime * aSpeed, uHeight) - uHeight * 0.5;
  p.x += sin(uTime * 0.25 + aPhase) * 0.55;
  p.z += cos(uTime * 0.21 + aPhase * 1.7) * 0.55;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float twinkle = 0.62 + 0.38 * sin(uTime * (0.9 + aSpeed * 0.35) + aPhase * 6.2831);
  vAlpha = twinkle * smoothstep(uHeight * 0.52, uHeight * 0.34, abs(p.y));
  vMix = aMix;
  gl_PointSize = aSize * uPixelRatio * (130.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`;

const PARTICLE_FRAG = /* glsl */`
uniform vec3 uColorA;
uniform vec3 uColorB;
varying float vAlpha;
varying float vMix;
void main(){
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float disc = smoothstep(0.5, 0.06, d);
  vec3 col = mix(uColorA, uColorB, vMix);
  gl_FragColor = vec4(col, disc * vAlpha * 0.85);
}
`;

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) {
    return false;
  }
}

function fallbackBackdrop() {
  const div = document.createElement('div');
  div.className = 'backdrop-fallback';
  document.body.prepend(div);
  document.getElementById('bg3d').remove();
}

if (!webglAvailable()) {
  fallbackBackdrop();
} else {
  init();
}

function init() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById('bg3d'),
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
  } catch (e) {
    fallbackBackdrop();
    return;
  }

  renderer.setClearColor(BG_COLOR, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 13.5);

  const uniformsBase = {
    uTime: { value: 0 },
    uColorA: { value: COLOR_A },
    uColorB: { value: COLOR_B }
  };

  /* ---------- core ---------- */

  const coreGroup = new THREE.Group();
  coreGroup.position.set(0, 0.4, 0);
  scene.add(coreGroup);

  // dark inner sphere: occludes back faces of the additive shell -> solid silhouette
  const occluder = new THREE.Mesh(
    new THREE.SphereGeometry(1.92, 48, 48),
    new THREE.MeshBasicMaterial({ color: BG_COLOR })
  );
  occluder.renderOrder = 0;
  coreGroup.add(occluder);

  const coreMat = new THREE.ShaderMaterial({
    uniforms: {
      ...uniformsBase
    },
    vertexShader: CORE_VERT,
    fragmentShader: CORE_FRAG,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(2.15, 24), coreMat);
  core.renderOrder = 1;
  coreGroup.add(core);

  const cage = new THREE.Mesh(
    new THREE.IcosahedronGeometry(3.4, 1),
    new THREE.MeshBasicMaterial({
      color: COLOR_A,
      wireframe: true,
      transparent: true,
      opacity: 0.07,
      depthWrite: false
    })
  );
  coreGroup.add(cage);

  /* ---------- particle field ---------- */

  const COUNT = COARSE ? 750 : 1600;
  const HEIGHT = 26;
  const RADIUS = 11;

  const positions = new Float32Array(COUNT * 3);
  const sizes = new Float32Array(COUNT);
  const phases = new Float32Array(COUNT);
  const speeds = new Float32Array(COUNT);
  const mixes = new Float32Array(COUNT);

  for (let i = 0; i < COUNT; i++) {
    const r = Math.sqrt(Math.random()) * RADIUS + 2.2;
    const th = Math.random() * Math.PI * 2;
    positions[i * 3] = Math.cos(th) * r;
    positions[i * 3 + 1] = (Math.random() - 0.5) * HEIGHT;
    positions[i * 3 + 2] = Math.sin(th) * r;
    sizes[i] = 0.6 + Math.random() * 1.9;
    phases[i] = Math.random() * Math.PI * 2;
    speeds[i] = 0.25 + Math.random() * 0.65;
    mixes[i] = Math.random();
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  pGeo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  pGeo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
  pGeo.setAttribute('aMix', new THREE.BufferAttribute(mixes, 1));

  const pMat = new THREE.ShaderMaterial({
    uniforms: {
      ...uniformsBase,
      uHeight: { value: HEIGHT },
      uPixelRatio: { value: 1 }
    },
    vertexShader: PARTICLE_VERT,
    fragmentShader: PARTICLE_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  /* ---------- sizing ---------- */

  function applySize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, COARSE ? 1.75 : 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    pMat.uniforms.uPixelRatio.value = dpr;
  }
  applySize();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(applySize, 120);
  });

  /* ---------- interaction ---------- */

  const pointer = { x: 0, y: 0 };
  if (!COARSE) {
    window.addEventListener('pointermove', (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
  }

  let hidden = false;
  document.addEventListener('visibilitychange', () => {
    hidden = document.hidden;
    if (!hidden && !REDUCED) clock.getDelta();
  });

  /* ---------- loop ---------- */

  const clock = new THREE.Clock();
  let elapsed = 0;
  let rotY = 0;
  let camX = 0, camY = 0;

  function tick() {
    requestAnimationFrame(tick);
    if (hidden) return;

    const dt = Math.min(clock.getDelta(), 0.05);
    elapsed += dt;

    coreMat.uniforms.uTime.value = elapsed;
    pMat.uniforms.uTime.value = elapsed;

    rotY += dt * 0.12;
    core.rotation.y = rotY;
    core.rotation.z = Math.sin(elapsed * 0.16) * 0.14;
    cage.rotation.y = -rotY * 0.55;
    cage.rotation.x = Math.sin(elapsed * 0.1) * 0.2;

    // parallax + scroll reaction
    const scroll = window.scrollY || 0;
    const tx = pointer.x * 1.1;
    const ty = -pointer.y * 0.75;
    camX += (tx - camX) * Math.min(dt * 3.2, 1);
    camY += (ty - camY) * Math.min(dt * 3.2, 1);
    camera.position.x = camX;
    camera.position.y = camY + scroll * 0.0012;
    camera.lookAt(coreGroup.position);

    coreGroup.rotation.x = THREE.MathUtils.lerp(coreGroup.rotation.x, scroll * 0.00045, Math.min(dt * 4, 1));

    renderer.render(scene, camera);
  }

  if (REDUCED) {
    // static single frame, no animation loop
    elapsed = 4;
    coreMat.uniforms.uTime.value = elapsed;
    pMat.uniforms.uTime.value = elapsed;
    renderer.render(scene, camera);
  } else {
    clock.getDelta();
    tick();
  }
}
