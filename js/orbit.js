/* ============================================================
   拾季 SHIJI · 3D 组件「当季十二味」
   纯程序化几何，无模型无贴图。离屏暂停，缺 WebGL 静默降级。
   ============================================================ */

(function () {
  'use strict';

  const stage  = document.getElementById('orbitStage');
  const canvas = document.getElementById('orbitCanvas');
  if (!stage || !canvas) return;

  // 依赖缺失 / 不支持直接退出，页面其余部分不受影响
  if (typeof THREE === 'undefined') { stage.style.display = 'none'; return; }

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- 数据 ---------------- */
  const ITEMS = [
    { n: '番茄',   r: '云南 · 元谋',     c: '#B4462F', s: 0.31 },
    { n: '罗勒',   r: '广东 · 湛江',     c: '#6E7A5E', s: 0.19 },
    { n: '无花果', r: '山东 · 威海',     c: '#7A4A5A', s: 0.25 },
    { n: '栗子',   r: '河北 · 迁西',     c: '#7B4A2E', s: 0.22 },
    { n: '南瓜',   r: '黑龙江 · 双城',   c: '#C08A3E', s: 0.28 },
    { n: '紫甘蓝', r: '甘肃 · 张掖',     c: '#6B5B7B', s: 0.26 },
    { n: '香菇',   r: '福建 · 古田',     c: '#8A7A62', s: 0.21 },
    { n: '柠檬',   r: '四川 · 安岳',     c: '#C0AF4A', s: 0.23 },
    { n: '欧芹',   r: '云南 · 昆明',     c: '#5F7350', s: 0.17 },
    { n: '洋葱',   r: '内蒙 · 乌兰察布', c: '#B9A8B4', s: 0.24 },
    { n: '胡萝卜', r: '山东 · 潍坊',     c: '#C97B3A', s: 0.21 },
    { n: '葡萄',   r: '新疆 · 吐鲁番',   c: '#5A4A6B', s: 0.19 }
  ];

  const pad = i => String(i + 1).padStart(2, '0');

  /* ---------------- 名录 ---------------- */
  const legend = document.getElementById('legend');
  const rows = [];
  if (legend) {
    ITEMS.forEach((it, i) => {
      const li = document.createElement('li');
      li.innerHTML = '<b>' + pad(i) + '</b><span>' + it.n + '</span>';
      legend.appendChild(li);
      rows.push(li);
    });
  }

  /* ---------------- 渲染器 ---------------- */
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas, antialias: true, alpha: true, powerPreference: 'high-performance'
    });
  } catch (err) {
    stage.style.display = 'none';
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 1.7, 8.6);
  camera.lookAt(0, 0, 0);

  /* ---------------- 光：主光左上，与整站一致 ---------------- */
  scene.add(new THREE.HemisphereLight(0xfff8ec, 0x8a8577, 0.82));

  const key = new THREE.DirectionalLight(0xfff2dd, 2.5);
  key.position.set(-5, 7, 5.5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 22;
  key.shadow.bias = -0.0006;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xdce6ff, 0.55);
  fill.position.set(6, 2.5, -4);
  scene.add(fill);

  const spark = new THREE.PointLight(0xffffff, 14, 18, 2);
  spark.position.set(0.5, 3.2, 3.4);
  scene.add(spark);

  /* ---------------- 世界 ---------------- */
  const world = new THREE.Group();
  scene.add(world);

  const R = 2.62;
  const spheres = [];
  const geoCache = {};

  ITEMS.forEach((it, i) => {
    const a = (i / ITEMS.length) * Math.PI * 2;
    const k = it.s.toFixed(2);
    if (!geoCache[k]) geoCache[k] = new THREE.SphereGeometry(it.s, 44, 44);

    const m = new THREE.Mesh(
      geoCache[k],
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(it.c),
        roughness: 0.44,
        metalness: 0.04
      })
    );
    m.position.set(Math.cos(a) * R, Math.sin(a * 2) * 0.16, Math.sin(a) * R);
    m.castShadow = true;
    m.receiveShadow = true;
    m.userData.index = i;
    m.userData.scale = 1;
    world.add(m);
    spheres.push(m);
  });

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(R, 0.013, 16, 260),
    new THREE.MeshStandardMaterial({ color: 0xA06B3E, roughness: 0.3, metalness: 1 })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.castShadow = true;
  world.add(ring);

  const outer = new THREE.Mesh(
    new THREE.TorusGeometry(R * 1.34, 0.004, 12, 260),
    new THREE.MeshStandardMaterial({
      color: 0x8C8577, roughness: 0.9, metalness: 0,
      transparent: true, opacity: 0.4
    })
  );
  outer.rotation.x = -Math.PI / 2 + 0.46;
  outer.rotation.y = 0.58;
  world.add(outer);

  /* ---------------- 交互 ---------------- */
  let rotY = 0.34, rotX = -0.17;
  let tgtY = 0.34, tgtX = -0.17;
  let dragging = false, lastX = 0, lastY = 0;

  const pointer = new THREE.Vector2(-10, -10);
  const ray = new THREE.Raycaster();
  let hovered = -1;

  const readout = document.getElementById('readout');
  const elName  = document.getElementById('pickName');
  const elOrig  = document.getElementById('pickOrigin');
  const elIdx   = document.getElementById('pickIdx');

  function setHover(i) {
    if (i === hovered) return;
    hovered = i;

    rows.forEach(li => li.classList.remove('on'));

    if (i < 0) {
      readout.classList.remove('on');
      elName.textContent = '当季';
      elOrig.textContent = '霜降 · 第二十一期';
      elIdx.textContent = '';
    } else {
      readout.classList.add('on');
      elIdx.textContent = pad(i);
      elName.textContent = ITEMS[i].n;
      elOrig.textContent = ITEMS[i].r;
      if (rows[i]) rows[i].classList.add('on');
    }
  }

  canvas.addEventListener('pointerdown', e => {
    dragging = true;
    lastX = e.clientX; lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });

  canvas.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;

    if (dragging) {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      tgtY += dx * 0.0062;
      tgtX = Math.max(-0.62, Math.min(0.5, tgtX + dy * 0.0042));
    }
  });

  function endDrag(e) {
    dragging = false;
    try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
  }
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('pointerleave', () => {
    if (!dragging) setHover(-1);
    pointer.set(-10, -10);
  });

  /* ---------------- 尺寸 ---------------- */
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.position.z = w / h < 1 ? 11.2 : 8.6;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  addEventListener('resize', resize);
  resize();

  /* ---------------- 循环 ---------------- */
  let visible = false;
  let last = performance.now();

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => { visible = es[0].isIntersecting; },
      { threshold: 0.08 }).observe(stage);
  } else {
    visible = true;
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) { last = performance.now(); requestAnimationFrame(loop); }
  });

  function loop(now) {
    const dt = Math.min(now - last, 50);
    last = now;

    if (!document.hidden && visible) {
      rotY += (tgtY - rotY) * 0.075;
      rotX += (tgtX - rotX) * 0.075;

      if (!dragging && !reduceMotion) {
        tgtY += 0.0016 * (dt / 16.7);
        tgtX += (-0.17 - tgtX) * 0.012;
      }

      world.rotation.y = rotY;
      world.rotation.x = rotX;
      world.position.y = reduceMotion ? 0 : Math.sin(now * 0.00055) * 0.07;

      ray.setFromCamera(pointer, camera);
      const hit = ray.intersectObjects(spheres, false);
      setHover(hit.length ? hit[0].object.userData.index : -1);

      for (const m of spheres) {
        const goal = (m.userData.index === hovered) ? 1.22 : 1;
        m.userData.scale += (goal - m.userData.scale) * 0.14;
        m.scale.setScalar(m.userData.scale);
      }

      renderer.render(scene, camera);
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();
