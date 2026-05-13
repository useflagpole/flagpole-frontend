<script lang="ts">
  import { onMount } from 'svelte';
  import * as THREE from 'three';

  let container: HTMLDivElement;

  const FLAG_COLORS = [0xE55A01, 0xE07030, 0xCC5001, 0xF06020];
  const POLE_COLOR = 0xededef;

  function latLongToVec3(lat: number, lon: number, radius: number): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }

  interface FlagPole {
    group: THREE.Group;
    lat: number;
    lon: number;
  }

  onMount(() => {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(1.2, 0.65, 3.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    sunLight.position.set(5, 4, 3);
    scene.add(sunLight);

    const earthGeo = new THREE.IcosahedronGeometry(1.2, 2);
    const earthMat = new THREE.MeshPhongMaterial({
      color: 0x262626,
      flatShading: true,
      specular: 0x44445a,
      shininess: 25,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earth);

    const FLAG_ARC = 0xE55A01;

    function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    function greatCircleArc(lat1: number, lon1: number, lat2: number, lon2: number, radius: number, numSegments: number): THREE.Vector3[] {
      const phi1 = (90 - lat1) * Math.PI / 180;
      const theta1 = (lon1 + 180) * Math.PI / 180;
      const phi2 = (90 - lat2) * Math.PI / 180;
      const theta2 = (lon2 + 180) * Math.PI / 180;
      const v1 = new THREE.Vector3(-radius * Math.sin(phi1) * Math.cos(theta1), radius * Math.cos(phi1), radius * Math.sin(phi1) * Math.sin(theta1));
      const v2 = new THREE.Vector3(-radius * Math.sin(phi2) * Math.cos(theta2), radius * Math.cos(phi2), radius * Math.sin(phi2) * Math.sin(theta2));
      const axis = v1.clone().cross(v2).normalize();
      const angle = v1.clone().angleTo(v2);
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= numSegments; i++) {
        const a = angle * i / numSegments;
        const q = new THREE.Quaternion().setFromAxisAngle(axis, a);
        points.push(v1.clone().applyQuaternion(q));
      }
      return points;
    }

    function fibonacciSphere(numPoints: number): { lat: number; lon: number }[] {
      const points: { lat: number; lon: number }[] = [];
      const golden = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < numPoints; i++) {
        const y = 1 - (i / (numPoints - 1)) * 2;
        const r = Math.sqrt(1 - y * y);
        const theta = golden * i;
        const lat = Math.asin(y) * 180 / Math.PI;
        const lon = Math.atan2(r * Math.cos(theta), r * Math.sin(theta)) * 180 / Math.PI;
        points.push({ lat, lon });
      }
      return points;
    }
    const flagDefs = fibonacciSphere(12);
    for (let i = 0; i < flagDefs.length; i++) {
      const fd = flagDefs[i];
      const poleRadius = 0.009;
      const poleHeight = 0.4125;
      const flagW = 0.21;
      const flagH = 0.135;
      const surfOffset = 1.22;

      const pos = latLongToVec3(fd.lat, fd.lon, surfOffset);
      const earthCenter = new THREE.Vector3(0, 0, 0);
      const normal = pos.clone().sub(earthCenter).normalize();

      const poleGeo = new THREE.CylinderGeometry(poleRadius, poleRadius * 0.7, poleHeight, 8);
      const poleMat = new THREE.MeshPhongMaterial({
        color: POLE_COLOR,
        flatShading: true,
        specular: 0xaaaaaa,
        shininess: 80,
      });
      const poleMesh = new THREE.Mesh(poleGeo, poleMat);

      const flagGeo = new THREE.PlaneGeometry(flagW, flagH);
      flagGeo.translate(flagW / 2, 0, 0);
      const flagColor = new THREE.Color(FLAG_COLORS[i % FLAG_COLORS.length]).multiplyScalar(0.7);
      const flagMat = new THREE.MeshPhongMaterial({
        color: flagColor,
        emissive: flagColor.clone().multiplyScalar(0.25),
        shininess: 25,
        side: THREE.DoubleSide,
      });
      const flagMesh = new THREE.Mesh(flagGeo, flagMat);
      flagMesh.position.set(0, poleHeight / 2 - flagH / 2, 0);

      const group = new THREE.Group();
      group.add(poleMesh);
      group.add(flagMesh);

      const worldUp = new THREE.Vector3(0, 1, 0);
      const quaternion = new THREE.Quaternion().setFromUnitVectors(worldUp, normal);
      group.quaternion.copy(quaternion);

      group.position.copy(pos.clone().add(normal.clone().multiplyScalar(poleHeight / 2)));

      earth.add(group);
    }

    const pairs: [number, number][] = [];
    const SURF_OFFSET = 1.22;
    for (let i = 0; i < flagDefs.length; i++) {
      const dists: { j: number; d: number }[] = [];
      for (let j = 0; j < flagDefs.length; j++) {
        if (i === j) continue;
        dists.push({ j, d: haversineDistance(flagDefs[i].lat, flagDefs[i].lon, flagDefs[j].lat, flagDefs[j].lon) });
      }
      dists.sort((a, b) => a.d - b.d);
      for (let k = 0; k < 3 && k < dists.length; k++) {
        const ni = Math.min(i, dists[k].j);
        const nj = Math.max(i, dists[k].j);
        if (!pairs.some(p => p[0] === ni && p[1] === nj)) {
          pairs.push([ni, nj]);
        }
      }
    }

    const arcObjects: { mat: THREE.ShaderMaterial }[] = [];
    const arcVert = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    const arcFrag = `
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uSpeed;
      varying vec2 vUv;
      void main() {
        float pos = fract(vUv.x - uTime * uSpeed);
        float intensity = 0.12 + 0.88 * smoothstep(0.0, 0.12, pos) * (1.0 - smoothstep(0.35, 0.55, pos));
        gl_FragColor = vec4(uColor * intensity * 1.8, intensity);
      }
    `;
    const haloFrag = `
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uSpeed;
      varying vec2 vUv;
      void main() {
        float pos = fract(vUv.x - uTime * uSpeed);
        float intensity = 0.06 + 0.4 * smoothstep(0.0, 0.12, pos) * (1.0 - smoothstep(0.35, 0.55, pos));
        gl_FragColor = vec4(uColor * 0.5, intensity);
      }
    `;
    for (const [i, j] of pairs) {
      const p1 = latLongToVec3(flagDefs[i].lat, flagDefs[i].lon, SURF_OFFSET);
      const p2 = latLongToVec3(flagDefs[j].lat, flagDefs[j].lon, SURF_OFFSET);
      const midR = (p1.length() + p2.length()) / 2;
      const arcPts = greatCircleArc(flagDefs[i].lat, flagDefs[i].lon, flagDefs[j].lat, flagDefs[j].lon, midR, 32);
      const curve = new THREE.CatmullRomCurve3(arcPts, false, 'catmullrom', 0.3);
      const tubeGeo = new THREE.TubeGeometry(curve, 15, 0.004, 6, false);
      const tubeHaloGeo = new THREE.TubeGeometry(curve, 15, 0.018, 6, false);

      const mat = new THREE.ShaderMaterial({
        vertexShader: arcVert,
        fragmentShader: arcFrag,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(FLAG_ARC) },
          uSpeed: { value: 0.70 },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });

      const tube = new THREE.Mesh(tubeGeo, mat);
      earth.add(tube);
      arcObjects.push({ mat });
    }

    const sharedHaloMat = new THREE.ShaderMaterial({
      vertexShader: arcVert,
      fragmentShader: haloFrag,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(FLAG_ARC) },
        uSpeed: { value: 0.70 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    for (const [i, j] of pairs) {
      const p1 = latLongToVec3(flagDefs[i].lat, flagDefs[i].lon, SURF_OFFSET);
      const p2 = latLongToVec3(flagDefs[j].lat, flagDefs[j].lon, SURF_OFFSET);
      const midR = (p1.length() + p2.length()) / 2;
      const arcPts = greatCircleArc(flagDefs[i].lat, flagDefs[i].lon, flagDefs[j].lat, flagDefs[j].lon, midR, 32);
      const curve = new THREE.CatmullRomCurve3(arcPts, false, 'catmullrom', 0.3);
      const tubeHaloGeo = new THREE.TubeGeometry(curve, 15, 0.018, 6, false);
      const halo = new THREE.Mesh(tubeHaloGeo, sharedHaloMat);
      earth.add(halo);
      arcObjects.push({ mat: sharedHaloMat });
    }

    let animId: number;
    let t = 0;

    function animate() {
      animId = requestAnimationFrame(animate);
      t += 0.002;
      earth.rotation.y = t;
      sharedHaloMat.uniforms.uTime.value = t;
      for (const { mat } of arcObjects) {
        mat.uniforms.uTime.value = t;
      }

      renderer.render(scene, camera);
    }

    animate();

    const ro = new ResizeObserver(() => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  });
</script>

<div class="hero-scene" bind:this={container}></div>

<style>
  .hero-scene {
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    width: 50%;
    pointer-events: none;
    mask-image: linear-gradient(to right, transparent 0%, black 30%);
    -webkit-mask-image: linear-gradient(to right, transparent 0%, black 30%);
  }
</style>