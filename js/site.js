/* ============================================================
   拾季 SHIJI · 站点交互
   模块：Hero 视频 / 滚动进度 / 导航 / 入场揭示 / 数字滚动
        配齐计算器 / 菜单手风琴 / 订阅切换 / 年龄确认
   ============================================================ */

(function () {
  'use strict';

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- 双语 ----------
     静态文案由 i18n.js 处理（HTML 里的 data-en）；
     这里只管 JS 生成的文案。词典缺词时返回中文，不会出现空字符串。 */
  const I18N = window.SHIJI;
  const T = (s, ...args) => (I18N ? I18N.t(s, ...args) : s);
  const isEN = () => !!(I18N && I18N.lang === 'en');
  const nm = o => (isEN() && o.en) ? o.en : o.n;
  const onLang = fn => { if (I18N) I18N.onLang(fn); };

  /* ============ 1. Hero 视频 ============ */
  (function heroVideo() {
    const v = $('#heroVideo');
    if (!v) return;

    // 移动端 / 减弱动效：不加载视频，直接走静帧，省流量也绕开 iOS 自动播放限制
    if (reduceMotion || innerWidth <= 860) return;

    // 先挂监听再赋 src：事件务必在赋值前绑定，否则可能错过首个 loadeddata
    v.addEventListener('loadeddata', () => {
      v.classList.add('ready');
      v.play().catch(() => {});
    }, { once: true });

    // 兜底：某些浏览器（含 Edge/Chrome 的 preload="none" 场景）不会因为赋值 src
    // 而主动取数据，loadeddata 永远不触发。必须显式 load() 才会开始加载。
    v.src = v.dataset.src;
    try { v.load(); } catch (e) {}
    v.play().catch(() => {});

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) v.pause();
      else v.play().catch(() => {});
    });
  })();

  /* ============ 2. 滚动：进度条 + 导航态 + Hero 视差 ============ */
  (function scrollFx() {
    const bar  = $('#progress');
    const nav  = $('#nav');
    const hero = $('.hero');
    const media = $('#heroMedia');
    let ticking = false;

    function update() {
      const y = scrollY;
      const h = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';

      nav.classList.toggle('solid', y > 60);

      if (!reduceMotion && innerWidth > 860 && media) {
        const heroH = hero.offsetHeight;
        if (y < heroH * 1.2) {
          media.style.transform = 'translate3d(0,' + (y * 0.12) + 'px,0)';
        }
      }
      ticking = false;
    }

    addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });

    update();
  })();

  /* ============ 3. 入场揭示 ============ */
  (function reveal() {
    // 内部错峰
    $$('.hero [data-mask] > span').forEach((el, i) => {
      el.style.transitionDelay = (260 + i * 150) + 'ms';
    });
    $$('.statement-line > span').forEach((el, i) => {
      el.style.transitionDelay = (i * 130) + 'ms';
    });

    const targets = $$('[data-reveal], [data-mask], [data-line]');
    if (!('IntersectionObserver' in window)) {
      targets.forEach(el => el.classList.add('in'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });

    targets.forEach(el => io.observe(el));
  })();

  /* ============ 4. 数字滚动 ============ */
  (function counters() {
    const nums = $$('[data-count]');
    if (!nums.length) return;

    function run(el) {
      const to = +el.dataset.count;
      const suffix = el.dataset.suffix || '';
      if (reduceMotion) { el.textContent = to + suffix; return; }

      const t0 = performance.now(), dur = 1400;
      (function step(t) {
        const k = Math.min((t - t0) / dur, 1);
        const e = 1 - Math.pow(1 - k, 4);
        el.textContent = Math.round(to * e) + suffix;
        if (k < 1) requestAnimationFrame(step);
      })(t0);
    }

    if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        run(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.6 });

    nums.forEach(el => io.observe(el));
  })();

  /* ============ 5. 配齐计算器 ============ */
  (function calculator() {
    const box = $('#dishes');
    if (!box) return;

    const ING = {
      tomato:   { n: '番茄',     en: 'Tomato',        p: 8,  o: '云南元谋',    oe: 'Yuánmóu, Yunnan',    cat: 'season' },
      basil:    { n: '罗勒',     en: 'Basil',         p: 5,  o: '广东湛江',    oe: 'Zhànjiāng, Guangdong', cat: 'season' },
      fig:      { n: '无花果',   en: 'Fig',           p: 16, o: '山东威海',    oe: 'Wēihǎi, Shandong',   cat: 'season' },
      chestnut: { n: '栗子',     en: 'Chestnut',      p: 18, o: '河北迁西',    oe: 'Qiānxī, Hebei',      cat: 'season' },
      pumpkin:  { n: '南瓜',     en: 'Pumpkin',       p: 12, o: '黑龙江双城',  oe: 'Shuāngchéng, Heilongjiang', cat: 'season' },
      cabbage:  { n: '紫甘蓝',   en: 'Red cabbage',   p: 9,  o: '甘肃张掖',    oe: 'Zhāngyè, Gansu',     cat: 'season' },
      shiitake: { n: '香菇',     en: 'Shiitake',      p: 14, o: '福建古田',    oe: 'Gǔtián, Fujian',     cat: 'season' },
      lemon:    { n: '柠檬',     en: 'Lemon',         p: 6,  o: '四川安岳',    oe: 'Ānyuè, Sichuan',     cat: 'season' },
      parsley:  { n: '欧芹',     en: 'Parsley',       p: 5,  o: '云南昆明',    oe: 'Kūnmíng, Yunnan',    cat: 'season' },
      onion:    { n: '洋葱',     en: 'Onion',         p: 3,  o: '内蒙乌兰察布', oe: 'Ulanqab, Inner Mongolia', cat: 'season' },
      carrot:   { n: '胡萝卜',   en: 'Carrot',        p: 4,  o: '山东潍坊',    oe: 'Wéifāng, Shandong',  cat: 'season' },
      grape:    { n: '葡萄',     en: 'Grape',         p: 22, o: '新疆吐鲁番',  oe: 'Turpan, Xinjiang',   cat: 'season' },

      olive:    { n: '橄榄油',   en: 'Olive oil',     p: 28, o: '常备', oe: 'pantry', cat: 'pantry' },
      mozz:     { n: '马苏里拉', en: 'Mozzarella',    p: 22, o: '常备', oe: 'pantry', cat: 'pantry' },
      butter:   { n: '黄油',     en: 'Butter',        p: 15, o: '常备', oe: 'pantry', cat: 'pantry' },
      rice:     { n: '米饭',     en: 'Rice',          p: 4,  o: '常备', oe: 'pantry', cat: 'pantry' },
      chicken:  { n: '鸡胸',     en: 'Chicken breast',p: 26, o: '常备', oe: 'pantry', cat: 'pantry' },
      bread:    { n: '面包',     en: 'Bread',         p: 10, o: '常备', oe: 'pantry', cat: 'pantry' }
    };

    const DISHES = [
      { id: 'd1', n: '番茄罗勒沙拉',   en: 'Tomato & basil salad',   t: '8 分钟',  te: '8 min',  ing: ['tomato', 'basil', 'olive'] },
      { id: 'd2', n: '无花果芝士拼',   en: 'Fig & cheese plate',     t: '5 分钟',  te: '5 min',  ing: ['fig', 'mozz', 'basil'] },
      { id: 'd3', n: '栗子南瓜浓汤',   en: 'Chestnut & pumpkin soup', t: '25 分钟', te: '25 min', ing: ['chestnut', 'pumpkin', 'butter', 'onion'] },
      { id: 'd4', n: '香菇甘蓝烩饭',   en: 'Shiitake & cabbage rice', t: '20 分钟', te: '20 min', ing: ['shiitake', 'cabbage', 'rice', 'butter'] },
      { id: 'd5', n: '柠檬香草烤鸡',   en: 'Lemon herb chicken',     t: '35 分钟', te: '35 min', ing: ['lemon', 'parsley', 'chicken', 'olive'] },
      { id: 'd6', n: '番茄芝士烤面包', en: 'Tomato cheese toast',    t: '12 分钟', te: '12 min', ing: ['bread', 'tomato', 'mozz', 'basil'] }
    ];

    const MAX_DISH = 3;
    const selected = new Set(['d1', 'd3']);
    const have     = new Set(['olive', 'butter', 'onion']);

    /* --- 草稿：选菜与库存自动存，刷新、关页、换标签都还在 --- */
    const DRAFT = 'shiji.draft';

    function loadDraft() {
      try {
        const d = JSON.parse(localStorage.getItem(DRAFT) || 'null');
        if (!d) return;
        if (Array.isArray(d.dishes)) {
          selected.clear();
          d.dishes.filter(id => DISHES.some(x => x.id === id)).slice(0, MAX_DISH).forEach(id => selected.add(id));
        }
        if (Array.isArray(d.have)) {
          have.clear();
          d.have.filter(k => ING[k]).forEach(k => have.add(k));
        }
      } catch (e) {}
    }

    function saveDraft() {
      try {
        localStorage.setItem(DRAFT, JSON.stringify({ dishes: [...selected], have: [...have] }));
      } catch (e) {}
    }

    const elDishes = $('#dishes');
    const elPantry = $('#pantry');
    const elNeed   = $('#need');
    const elArc    = $('#arc');
    const elPct    = $('#pct');
    const elPrice  = $('#price');
    const elNDish  = $('#nDish');
    const elNNeed  = $('#nNeed');
    const elNMiss  = $('#nMiss');
    const elRingT  = $('#ringTitle');
    const elRingS  = $('#ringSub');
    const elCta    = $('#cta');
    const elBox    = $('#ctaBox');
    const elBoxMeta  = $('#boxMeta');
    const elBoxItems = $('#boxItems');

    let inBox = false;
    let signedName = null;   // 由 auth 模块通过事件同步，不直接读存储

    const CIRC = 2 * Math.PI * 39;
    const pad = i => String(i + 1).padStart(2, '0');

    /* --- 建卡 --- */
    const dishEls = new Map();
    DISHES.forEach((d, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'dish';
      b.dataset.id = d.id;
      b.setAttribute('aria-pressed', 'false');
      b.innerHTML =
        '<span class="num">' + pad(i) + '</span>' +
        '<span class="dname">' + nm(d) + '</span>' +
        '<span class="meta">' + (isEN() ? d.te : d.t) + ' · ' + T('{0} 样', d.ing.length) + '</span>' +
        '<span class="state">' + T('未选') + '</span>';
      b.addEventListener('click', () => toggleDish(d.id, b));
      elDishes.appendChild(b);
      dishEls.set(d.id, b);
    });

    const itemEls = new Map();
    const groupLabels = [];
    ['season', 'pantry'].forEach(cat => {
      const label = document.createElement('p');
      label.className = 'group-label';
      label.textContent = T(cat === 'season' ? '当季食材' : '厨房常备');
      groupLabels.push(label);
      elPantry.appendChild(label);

      const wrap = document.createElement('div');
      wrap.className = 'pantry';

      Object.keys(ING).filter(k => ING[k].cat === cat).forEach(k => {
        const it = ING[k];
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'item';
        b.dataset.id = k;
        b.setAttribute('aria-pressed', 'false');
        b.innerHTML =
          '<span class="box"><svg viewBox="0 0 16 16">' +
          '<polyline points="3.2,8.4 6.4,11.6 12.8,4.8"></polyline></svg></span>' +
          '<span class="nlabel">' + nm(it) + '</span>' +
          '<span class="price">¥' + it.p + '</span>';
        b.addEventListener('click', () => toggleHave(k, b));
        wrap.appendChild(b);
        itemEls.set(k, b);
      });

      elPantry.appendChild(wrap);
    });

    /* --- 交互 --- */
    function toggleDish(id, btn) {
      if (selected.has(id)) {
        selected.delete(id);
      } else {
        if (selected.size >= MAX_DISH) {
          btn.classList.remove('shake');
          void btn.offsetWidth;
          btn.classList.add('shake');
          return;
        }
        selected.add(id);
      }
      btn.setAttribute('aria-pressed', selected.has(id) ? 'true' : 'false');
      update();
    }

    function toggleHave(k, btn) {
      have.has(k) ? have.delete(k) : have.add(k);
      btn.setAttribute('aria-pressed', have.has(k) ? 'true' : 'false');
      update();
    }

    $('#clear').addEventListener('click', () => {
      selected.clear();
      have.clear();
      dishEls.forEach(b => b.setAttribute('aria-pressed', 'false'));
      itemEls.forEach(b => b.setAttribute('aria-pressed', 'false'));
      update();
    });

    /* --- 加入本周箱：不要求登录，随时可加；保存到账号是可选项 --- */
    function updateSaveState() {
      const el = $('#boxSave');
      if (!el) return;
      if (signedName) {
        el.textContent = T('已保存到 {0} 的账号', signedName);
        el.disabled = true;
      } else {
        el.textContent = T('登录后保存这一箱');
        el.disabled = false;
      }
    }

    function addToBox() {
      const sel = DISHES.filter(d => selected.has(d.id));
      const need = new Set();
      sel.forEach(d => d.ing.forEach(k => need.add(k)));

      const miss  = [...need].filter(k => !have.has(k));
      const price = miss.reduce((s, k) => s + ING[k].p, 0);
      if (!miss.length) return;

      elBoxMeta.textContent = T('{0} 道菜 · 缺 {1} 样 · ¥{2}', sel.length, miss.length, price);
      elBoxItems.innerHTML = '';
      miss.forEach(k => {
        const s = document.createElement('span');
        s.textContent = nm(ING[k]);
        elBoxItems.appendChild(s);
      });

      elBox.hidden = false;
      inBox = true;
      elCta.disabled = true;
      elCta.firstChild.nodeValue = T('已加入本周箱');
      updateSaveState();

      // 把这一箱交给订阅区
      document.dispatchEvent(new CustomEvent('shiji:box', {
        detail: {
          dishes: sel.map(d => nm(d)),
          items: miss.map(k => nm(ING[k])),
          count: miss.length,
          price: price
        }
      }));
    }

    elCta.addEventListener('click', addToBox);

    // 「登录后保存」是用户主动点的，这时才拉起注册
    // reason 会一路带到登录成功之后：明确是「来存这一箱」的，就以眼前这箱为准
    document.addEventListener('click', e => {
      if (e.target.closest('#boxSave') && !signedName) {
        document.dispatchEvent(new CustomEvent('shiji:need-auth', { detail: { reason: 'save-box' } }));
      }
    });

    // 注册/登录/退出后：同步登录名，并刷新保存按钮状态
    document.addEventListener('shiji:auth-changed', e => {
      signedName = e.detail && e.detail.user ? e.detail.user : null;
      if (inBox) updateSaveState();
    });

    /* --- 价格滚动 --- */
    let shown = 0;

    /* --- 需求清单：集合不变时只改 class，不重建 DOM（否则每次勾选都闪一下） --- */
    let needSig = '';
    let chipRefs = [];

    function countTo(el, to) {
      const from = shown;
      shown = to;
      if (reduceMotion || from === to) { el.textContent = to; return; }
      const t0 = performance.now(), dur = 520;
      (function step(t) {
        const k = Math.min((t - t0) / dur, 1);
        const e = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(from + (to - from) * e);
        if (k < 1) requestAnimationFrame(step);
      })(t0);
    }

    /* --- 主计算：差集 --- */
    function update() {
      // 箱子内容一变，之前的「已加入」就作废——否则用户以为加进去的是新组合
      if (inBox) { inBox = false; elBox.hidden = true; }

      const sel = DISHES.filter(d => selected.has(d.id));

      const need = new Set();
      sel.forEach(d => d.ing.forEach(k => need.add(k)));

      // 这一行就是原 Python 里的 food_required - food_have
      const miss = [...need].filter(k => !have.has(k));
      const price = miss.reduce((s, k) => s + ING[k].p, 0);
      const pct = need.size ? Math.round((need.size - miss.length) / need.size * 100) : 0;

      DISHES.forEach(d => {
        const b = dishEls.get(d.id);
        const state = b.querySelector('.state');
        if (!selected.has(d.id)) {
          b.classList.remove('ready');
          state.textContent = T('未选');
          return;
        }
        const lack = d.ing.filter(k => !have.has(k)).length;
        b.classList.toggle('ready', lack === 0);
        state.textContent = lack === 0 ? T('已配齐') : T('差 {0} 样', lack);
      });

      const needArr = [...need];
      const sig = needArr.join('|');

      if (sig !== needSig) {
        needSig = sig;
        elNeed.innerHTML = '';
        chipRefs = [];

        if (!needArr.length) {
          const s = document.createElement('span');
          s.className = 'chip ok';
          s.style.textDecoration = 'none';
          s.textContent = T('选一道菜，这里会列出需要的食材');
          elNeed.appendChild(s);
        } else {
          needArr.forEach((k, i) => {
            const c = document.createElement('span');
            c.className = 'chip ' + (have.has(k) ? 'ok' : 'miss');
            c.style.animationDelay = (i * 28) + 'ms';
            c.textContent = nm(ING[k]);
            elNeed.appendChild(c);
            chipRefs.push({ el: c, key: k });
          });
        }
      } else {
        chipRefs.forEach(o => {
          o.el.className = 'chip ' + (have.has(o.key) ? 'ok' : 'miss');
        });
      }

      countTo(elPrice, price);
      elNDish.textContent = sel.length;
      elNNeed.textContent = need.size;
      elNMiss.textContent = miss.length;

      elArc.style.strokeDashoffset = CIRC * (1 - pct / 100);
      elPct.textContent = pct;

      const made = sel.filter(d => d.ing.every(k => have.has(k))).length;

      if (sel.length === 0) {
        elRingT.textContent = T('还没选菜');
        elRingS.textContent = T('选一道菜，我们开始算');
      } else if (miss.length === 0) {
        elRingT.textContent = T('全都齐了');
        elRingS.textContent = T('{0} 道菜，{1} 样食材，一样不缺', sel.length, need.size);
      } else {
        elRingT.textContent = T('还差 {0} 样', miss.length);
        elRingS.textContent = T('能做出 {0} 道 · 共 {1} 道', made, sel.length);
      }

      if (sel.length === 0) {
        elCta.disabled = true;
        elCta.firstChild.nodeValue = T('先选一道菜');
      } else if (miss.length === 0) {
        elCta.disabled = true;
        elCta.firstChild.nodeValue = T('已配齐，无需下单');
      } else {
        elCta.disabled = false;
        elCta.firstChild.nodeValue = T('加入本周箱');
      }

      // 同步给 3D 组件（可选联动，没有也不报错）
      document.dispatchEvent(new CustomEvent('shiji:need', {
        detail: { need: [...need], have: [...have] }
      }));

      saveDraft();

      document.dispatchEvent(new CustomEvent('shiji:draft', {
        detail: { dishes: [...selected], have: [...have] }
      }));
    }

    // 登录后由账号草稿恢复
    document.addEventListener('shiji:restore-draft', e => {
      const d = e.detail || {};
      if (!Array.isArray(d.dishes) && !Array.isArray(d.have)) return;

      if (Array.isArray(d.dishes)) {
        selected.clear();
        d.dishes.filter(id => DISHES.some(x => x.id === id))
                .slice(0, MAX_DISH)
                .forEach(id => selected.add(id));
      }
      if (Array.isArray(d.have)) {
        have.clear();
        d.have.filter(k => ING[k]).forEach(k => have.add(k));
      }

      dishEls.forEach((b, id) => b.setAttribute('aria-pressed', selected.has(id) ? 'true' : 'false'));
      itemEls.forEach((b, id) => b.setAttribute('aria-pressed', have.has(id) ? 'true' : 'false'));
      update();
    });

    /* --- 切换语言：重建所有由 JS 生成的文案 --- */
    function relabel() {
      DISHES.forEach(d => {
        const b = dishEls.get(d.id);
        b.querySelector('.dname').textContent = nm(d);
        b.querySelector('.meta').textContent =
          (isEN() ? d.te : d.t) + ' · ' + T('{0} 样', d.ing.length);
      });

      if (groupLabels[0]) groupLabels[0].textContent = T('当季食材');
      if (groupLabels[1]) groupLabels[1].textContent = T('厨房常备');
      itemEls.forEach((b, k) => {
        const lab = b.querySelector('.nlabel');
        if (lab) lab.textContent = nm(ING[k]);
      });

      const wasBox = inBox;
      needSig = '';      // 强制重建需求清单，否则旧的食材名会留在页面上
      update();          // update 会关掉「已加入」，所以下面再还原一次
      if (wasBox) addToBox();
      updateSaveState();
    }
    onLang(relabel);

    loadDraft();
    dishEls.forEach((b, id) => b.setAttribute('aria-pressed', selected.has(id) ? 'true' : 'false'));
    itemEls.forEach((b, id) => b.setAttribute('aria-pressed', have.has(id) ? 'true' : 'false'));
    update();
    updateSaveState();   // 英文直开时把「登录后保存这一箱」也规范成当前语言
  })();

  /* ============ 6. 菜单手风琴 ============ */
  (function menu() {
    const rows = $$('.menu-row');
    if (!rows.length) return;

    rows.forEach(row => {
      const head = row.querySelector('.menu-head');
      head.addEventListener('click', () => {
        const wasOpen = row.classList.contains('open');
        rows.forEach(r => {
          r.classList.remove('open');
          r.querySelector('.menu-head').setAttribute('aria-expanded', 'false');
        });
        if (!wasOpen) {
          row.classList.add('open');
          head.setAttribute('aria-expanded', 'true');
        }
      });
    });
  })();

  /* ============ 7. 订阅周期切换 ============ */
  (function plan() {
    const seg = $('#segmented');
    if (!seg) return;

    const PLANS = {
      '1': { p: 68, m: '按每周配送，四箱一季，到期自动暂停' },
      '2': { p: 72, m: '按每两周配送，一季两箱，可随时跳过' },
      '4': { p: 76, m: '按每月配送，单箱现结，无长期绑定' }
    };

    const priceEl = $('#planPrice');
    const metaEl  = $('#planMeta');
    let cur = 68;
    let cycle = '1';

    seg.addEventListener('click', e => {
      const btn = e.target.closest('button[data-cycle]');
      if (!btn) return;

      $$('button[data-cycle]', seg).forEach(b =>
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));

      cycle = btn.dataset.cycle;
      const cfg = PLANS[cycle];
      metaEl.textContent = T(cfg.m);

      if (reduceMotion) { priceEl.textContent = cfg.p; cur = cfg.p; return; }

      const from = cur, to = cfg.p;
      cur = to;
      const t0 = performance.now(), dur = 500;
      (function step(t) {
        const k = Math.min((t - t0) / dur, 1);
        const e = 1 - Math.pow(1 - k, 3);
        priceEl.textContent = Math.round(from + (to - from) * e);
        if (k < 1) requestAnimationFrame(step);
      })(t0);
    });

    // 语言切换：重写周期说明（若这一箱已进入结算，说明由 auth 模块接管，这里不动）
    onLang(() => {
      const cta = $('#planCta');
      if (cta && cta.dataset.box === '1') return;
      metaEl.textContent = T(PLANS[cycle].m);
    });

    // 英文直开时把静态初始文案规范成当前语言
    metaEl.textContent = T(PLANS[cycle].m);
  })();

  /* ============ 8. 年龄确认 ============ */
  (function ageGate() {
    const gate = $('#ageGate');
    if (!gate) return;
    const msg = $('#ageMsg');

    gate.addEventListener('click', e => {
      const btn = e.target.closest('button[data-age]');
      if (!btn) return;

      $$('button[data-age]', gate).forEach(b =>
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));

      if (btn.dataset.age === 'adult') {
        msg.classList.remove('restrict');
        msg.dataset.key = '已登记。酒精搭配与生食建议已解锁。';
        msg.textContent = T(msg.dataset.key);
      } else {
        msg.classList.add('restrict');
        msg.dataset.key = '已记录。根据规定，酒精搭配与刺身类生食建议将不向你展示。';
        msg.textContent = T(msg.dataset.key);
      }
    });

    onLang(() => { if (msg.dataset.key) msg.textContent = T(msg.dataset.key); });
  })();

  /* ============ 9. 账号：登录 / 注册 ============
     注册校验沿用原始 Python 的三段规则（用户名 / 密码 / 年龄），
     但把「一次只报一个错」的 elif 链改成了规则清单实时反馈。
     ============================================ */
  (function auth() {
    const modal = $('#authModal');
    if (!modal) return;

    const openBtn    = $('#authOpen');
    const openLbl    = $('#authLabel');
    const tabBar     = $('.auth-tabs', modal);
    const tabs       = $$('.auth-tabs button', modal);
    const loginForm  = $('#loginForm');
    const signupForm = $('#signupForm');
    const orderForm  = $('#orderForm');
    const accountPane = $('#accountPane');
    const donePane   = $('#authDone');
    const doneTitle  = $('#doneTitle');
    const doneText   = $('#doneText');
    const doneBtn    = $('#doneBtn');
    const authTitle  = $('#authTitle');
    const authKicker = $('#authKicker');

    const KEY  = 'shiji.accounts';   // { [用户名]: { u, h, age, at } }
    const SKEY = 'shiji.session';    // 当前登录的用户名
    let lastFocus = null;
    let doneAction = null;

    /* ---------- 存储 ---------- */
    // localStorage 一旦写入失败（file:// 打开、隐私模式、跨域 iframe），
    // 就退回内存保存；否则每次点订阅都会重新弹注册，用户填过的密码看起来像凭空消失。
    let memUsers = null;      // { u: rec }
    let memSession = null;    // 用户名
    let storageOk = true;

    const readUsers = () => {
      if (storageOk) {
        try {
          const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
          return raw && typeof raw === 'object' ? raw : {};
        } catch (e) { storageOk = false; }
      }
      return memUsers || {};
    };

    const writeUsers = users => {
      memUsers = users;
      try { localStorage.setItem(KEY, JSON.stringify(users)); storageOk = true; return true; }
      catch (e) { storageOk = false; return false; }
    };

    const readSession = () => {
      if (storageOk) {
        try {
          const s = localStorage.getItem(SKEY);
          if (s) return s;
        } catch (e) { storageOk = false; }
      }
      return memSession;
    };

    const writeSession = name => {
      memSession = name;
      try {
        if (name) localStorage.setItem(SKEY, name);
        else localStorage.removeItem(SKEY);
      } catch (e) { storageOk = false; }
    };

    // 当前登录的账号记录（会话名 + 查表）；会话名对应的记录被删时视为未登录
    const currentUser = () => {
      const name = readSession();
      if (!name) return null;
      return readUsers()[name] || null;
    };

    // 密码不落明文：先加固定盐再 SHA-256；无 SubtleCrypto 时退到 FNV-1a
    async function digest(str) {
      const s = 'shiji::' + str;
      try {
        if (window.crypto && crypto.subtle && window.TextEncoder) {
          const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
          return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
        }
      } catch (e) { /* 落到下面的降级实现 */ }
      let h = 2166136261;
      for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
      return 'fnv1a-' + (h >>> 0).toString(16);
    }

    /* ---------- 校验规则 ---------- */
    // 长度按「字」算而不是按 UTF-16 单元：中文名常见两个字（"陈三"），
    // 若按 UTF-16 计 "陈三" 只有 2 → 被 3 位下限拦下，对中文用户不友好。
    const charLen = v => [...v].length;

    const RULES = {
      user: {
        'user-empty': v => charLen(v) > 0,
        'user-len':   v => charLen(v) >= 2 && charLen(v) <= 20,
        'user-num':   v => charLen(v) > 0 && !/^\d+$/.test(v)
      },
      pass: {
        'pass-empty':   v => v.length > 0,
        'pass-len':     v => v.length >= 8,
        'pass-alpha':   v => /[A-Za-z]/.test(v),
        'pass-digit':   v => /\d/.test(v),
        'pass-special': v => /[!@#$%&*]/.test(v)
      },
      age: {
        'age-num':   v => /^\d+$/.test(v),
        'age-range': v => /^\d+$/.test(v) && Number(v) >= 0 && Number(v) <= 120
      }
    };

    const FIELDS = {
      user: { input: $('#su-user'), list: $('#rulesUser') },
      pass: { input: $('#su-pass'), list: $('#rulesPass') },
      age:  { input: $('#su-age'),  list: $('#rulesAge')  }
    };
    const touched = { user: false, pass: false, age: false };

    // 未失焦前只显示「已达成」，不显示红叉——避免边打字边被指责
    // 用户名先去掉首尾空格再校验：否则「  123  」能绕过「不能全是数字」，
    // 存进去的却是 "123"，校验和落库用两套值迟早出事
    const norm = (key, v) => (key === 'user' ? v.trim() : v);

    function paint(key) {
      const { input, list } = FIELDS[key];
      const v = norm(key, input.value);
      $$('li', list).forEach(li => {
        li.classList.remove('ok', 'bad');
        if (!v.length) return;
        if (RULES[key][li.dataset.rule](v)) li.classList.add('ok');
        else if (touched[key]) li.classList.add('bad');
      });
    }

    const fieldOk = key => {
      const v = norm(key, FIELDS[key].input.value);
      return v.length > 0 && Object.keys(RULES[key]).every(k => RULES[key][k](v));
    };

    Object.keys(FIELDS).forEach(key => {
      const { input } = FIELDS[key];
      input.addEventListener('input', () => paint(key));
      input.addEventListener('blur', () => { touched[key] = true; paint(key); });
    });

    /* ---------- 密码显隐（小眼睛） ---------- */
    function resetEyes() {
      $$('.eye', modal).forEach(btn => {
        const input = document.getElementById(btn.dataset.eye);
        if (input) input.type = 'password';
        btn.setAttribute('aria-pressed', 'false');
        btn.setAttribute('aria-label', T('显示密码'));
        btn.title = T('显示密码');
      });
    }

    $$('.eye', modal).forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const input = document.getElementById(btn.dataset.eye);
        if (!input) return;

        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.setAttribute('aria-pressed', show ? 'true' : 'false');
        btn.setAttribute('aria-label', show ? T('隐藏密码') : T('显示密码'));
        btn.title = show ? T('隐藏密码') : T('显示密码');

        input.focus({ preventScroll: true });
        // 改 type 会把光标甩到开头，重新放到末尾
        const n = input.value.length;
        try { input.setSelectionRange(n, n); } catch (err) {}
      });
    });

    /* ---------- 面板切换 ---------- */
    function showPane(name) {
      resetEyes();
      tabBar.hidden = name === 'done' || name === 'order' || name === 'account';
      loginForm.hidden = name !== 'login';
      signupForm.hidden = name !== 'signup';
      orderForm.hidden = name !== 'order';
      accountPane.hidden = name !== 'account';
      donePane.hidden = name !== 'done';
      tabs.forEach(b => b.setAttribute('aria-selected', b.dataset.tab === name ? 'true' : 'false'));
      if (name === 'login') {
        authKicker.textContent = T('拾季 · 账号');
        authTitle.textContent = T('回到你的那一箱');
      } else if (name === 'signup') {
        authKicker.textContent = T('拾季 · 账号');
        authTitle.textContent = T('留一个收货的名');
      } else if (name === 'order') {
        authKicker.textContent = T('拾季 · 订单');
        authTitle.textContent = T('确认这一箱');
      }
      $('#loginMsg').textContent = '';
      $('#signupMsg').textContent = '';
      $('#orderMsg').textContent = '';
    }

    function focusFirst(pane) {
      const form = pane === 'login' ? loginForm
                 : pane === 'signup' ? signupForm
                 : pane === 'order' ? orderForm : null;
      if (!form) return;
      const first = $('input', form);
      if (first) setTimeout(() => first.focus(), 130);
    }

    function openShell() {
      lastFocus = document.activeElement;
      modal.hidden = false;
      document.body.classList.add('locked');
      requestAnimationFrame(() => modal.classList.add('in'));
    }

    function openModal(pane) {
      openShell();
      showPane(pane);
      focusFirst(pane);
    }

    function close() {
      modal.classList.remove('in');
      document.body.classList.remove('locked');
      setTimeout(() => { modal.hidden = true; }, 380);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
      doneAction = null;
    }

    function showDone(title, text, btnText, action) {
      showPane('done');
      $('#doneNote').hidden = true;
      authKicker.textContent = T('拾季 · 账号');
      authTitle.textContent = title;
      doneTitle.textContent = title;
      doneText.textContent = text;
      doneBtn.innerHTML = btnText + '<span class="arrow">→</span>';
      doneAction = action || close;
    }

    /* ---------- 登录态 ---------- */
    function setSigned(name) {
      openLbl.textContent = name;
      openBtn.classList.add('signed');
      openBtn.setAttribute('aria-label', T('已登录为 {0}，点击管理账号', name));
    }
    function clearSigned() {
      openLbl.textContent = T('登录');
      openBtn.classList.remove('signed');
      openBtn.removeAttribute('aria-label');
    }
    function signOut() {
      writeSession(null);
      clearSigned();
      document.dispatchEvent(new CustomEvent('shiji:auth-changed', { detail: { user: null } }));
      close();
    }

    /* ---------- 账号面板 ---------- */
    function renderAccount(rec) {
      showPane('account');
      authKicker.textContent = T('拾季 · 已登录');
      authTitle.textContent = T('你好，{0}', rec.u);

      $('#accName').textContent = rec.u;
      $('#accAge').textContent  = T('{0} 岁', rec.age);
      $('#accSince').textContent = new Date(rec.at).toLocaleDateString(
        isEN() ? 'en-GB' : 'zh-CN',
        { year: 'numeric', month: 'long', day: 'numeric' });

      const total = Object.keys(readUsers()).length;
      $('#accCount').textContent = total > 1
        ? T('这台浏览器共 {0} 个账号 · 用同一个用户名登录即可切换', total)
        : T('这台浏览器只有你一个账号');
      $('#pwForm').hidden = true;
      $('#pwMsg').textContent = '';
    }

    $('#accLogout').addEventListener('click', signOut);

    $('#accPwToggle').addEventListener('click', () => {
      const f = $('#pwForm');
      f.hidden = !f.hidden;
      if (!f.hidden) setTimeout(() => $('#pw-cur').focus(), 80);
    });

    $('#pwCancel').addEventListener('click', () => {
      $('#pwForm').hidden = true;
      $('#pwMsg').textContent = '';
    });

    $('#pwForm').addEventListener('submit', async e => {
      e.preventDefault();
      const msg = $('#pwMsg');
      const rec = currentUser();
      if (!rec) { msg.textContent = T('登录状态已失效，请重新登录。'); return; }

      const cur = $('#pw-cur').value;
      const next = $('#pw-new').value;
      const again = $('#pw-again').value;

      if ((await digest(cur)) !== rec.h) { msg.textContent = T('当前密码不对。'); $('#pw-cur').focus(); return; }
      if (next !== again) { msg.textContent = T('两次输入的新密码不一致。'); $('#pw-again').focus(); return; }

      // 新密码沿用注册时的同一套规则，只是不再要求同时含字母和数字之外的额外条件
      const okPw = next.length >= 8 && /[A-Za-z]/.test(next) && /\d/.test(next) && /[!@#$%&*]/.test(next);
      if (!okPw) { msg.textContent = T('新密码至少 8 位，且要同时含字母、数字和特殊字符 !@#$%&*。'); return; }

      const users = readUsers();
      users[rec.u] = Object.assign({}, rec, { h: await digest(next), at: rec.at });
      const saved = writeUsers(users);

      $('#pw-cur').value = $('#pw-new').value = $('#pw-again').value = '';
      $('#pwForm').hidden = true;
      msg.classList.add('ok');
      msg.textContent = saved ? T('密码已更新。') : T('密码已更新（仅本次会话）。');
    });

    /* ---------- 事件 ---------- */
    openBtn.addEventListener('click', () => {
      const rec = currentUser();
      if (!rec) { openModal('login'); return; }
      openShell();
      renderAccount(rec);
    });

    modal.addEventListener('click', e => {
      if (e.target.closest('[data-close]')) close();
    });

    // 别的标签页登录或退出，这一页跟着变，避免「这边显示已登录、那边其实已退出」
    window.addEventListener('storage', e => {
      if (e.key !== SKEY && e.key !== KEY) return;
      const rec = currentUser();
      if (rec) setSigned(rec.u); else clearSigned();
    });

    /* ---------- 草稿与账号的关联 ---------- */
    // 登录后：如果账号里有草稿，用它恢复计算器
    function pushDraftToCalculator(draft) {
      if (!draft) return;
      document.dispatchEvent(new CustomEvent('shiji:restore-draft', { detail: draft }));
    }

    // 计算器当前这一箱（存在 shiji.draft 里），用于「登录后保存这一箱」
    function readLocalDraft() {
      try {
        const d = JSON.parse(localStorage.getItem('shiji.draft') || 'null');
        if (!d) return null;
        const dishes = Array.isArray(d.dishes) ? d.dishes : [];
        const have   = Array.isArray(d.have)   ? d.have   : [];
        return (dishes.length || have.length) ? { dishes, have } : null;
      } catch (e) { return null; }
    }

    function saveDraftToUser(name, draft) {
      const users = readUsers();
      if (!users[name]) return;
      users[name] = Object.assign({}, users[name], { draft });
      writeUsers(users);
    }

    const draftHasContent = d => !!(d && ((d.dishes && d.dishes.length) || (d.have && d.have.length)));

    // 计算器每次变动都会派发 shiji:draft，这里把它写到当前账号名下
    document.addEventListener('shiji:draft', e => {
      const rec = currentUser();
      if (!rec) return;
      const users = readUsers();
      users[rec.u] = Object.assign({}, rec, { draft: e.detail });
      writeUsers(users);
    });

    tabs.forEach(b => b.addEventListener('click', () => {
      showPane(b.dataset.tab);
      focusFirst(b.dataset.tab);
    }));

    $$('[data-switch]', modal).forEach(b => b.addEventListener('click', () => {
      showPane(b.dataset.switch);
      focusFirst(b.dataset.switch);
    }));

    doneBtn.addEventListener('click', () => { if (doneAction) doneAction(); });

    document.addEventListener('keydown', e => {
      if (modal.hidden) return;

      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;

      const f = $$('button:not([disabled]),input:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])', modal)
        .filter(el => el.offsetParent !== null);
      if (!f.length) return;

      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    /* ---------- 提交 ---------- */
    signupForm.addEventListener('submit', async e => {
      e.preventDefault();
      const msg = $('#signupMsg');

      ['user', 'pass', 'age'].forEach(k => { touched[k] = true; paint(k); });

      const bad = ['user', 'pass', 'age'].find(k => !fieldOk(k));
      if (bad) {
        FIELDS[bad].input.focus();
        msg.textContent = bad === 'user' ? T('用户名还没符合要求。')
                        : bad === 'pass' ? T('密码还没符合要求。')
                        : T('年龄填得不对。');
        return;
      }

      const name = FIELDS.user.input.value.trim();
      const age  = Number(FIELDS.age.input.value);

      // 多账号：已存在同名账号时不静默覆盖，否则前一个人的密码就再也登不进去了
      const users = readUsers();
      if (users[name]) {
        msg.textContent = T('这个用户名已经被注册了，换一个，或者直接登录。');
        FIELDS.user.input.focus();
        return;
      }

      users[name] = { u: name, h: await digest(FIELDS.pass.input.value), age, at: Date.now() };
      // 注册前挑好的这一箱，直接归到新账号名下——否则「登录后保存这一箱」等于没保存
      const seed = readLocalDraft();
      if (seed) users[name].draft = seed;
      const saved = writeUsers(users);
      writeSession(name);
      authIntent = null;

      // 未满 18 岁：不拦注册，而是把页脚的分级开关自动拨到未成年那档
      if (age < 18) {
        const minor = $('#ageGate button[data-age="minor"]');
        if (minor && minor.getAttribute('aria-pressed') !== 'true') minor.click();
      }

      setSigned(name);
      FIELDS.pass.input.value = '';
      touched.pass = false;
      paint('pass');
      document.dispatchEvent(new CustomEvent('shiji:auth-changed', { detail: { user: name } }));
      // 存不进 localStorage 的提示改到标题和页面上的小字，不塞进欢迎语正文
      // —— 正常成功时那句警告永远不会出现（saved 为 true），但结构上不该混在一起
      showDone(
        saved ? T('账号已创建') : T('账号已创建 · 仅本次会话'),
        age < 18
          ? T('{0}，欢迎。按你填的年龄，酒精搭配与刺身类生食建议会保持隐藏，其余内容照常。', name)
          : T('{0}，欢迎。每期开箱前三天，我们会发短信通知你这一箱的内容。', name),
        T('继续挑选'), close
      );

      if (!saved) $('#doneNote').hidden = false;
    });

    loginForm.addEventListener('submit', async e => {
      e.preventDefault();
      const msg = $('#loginMsg');
      msg.classList.remove('ok');

      const u = $('#li-user').value.trim();
      const p = $('#li-pass').value;
      if (!u || !p) { msg.textContent = T('用户名和密码都要填。'); return; }

      const users = readUsers();
      const rec = users[u];
      const hit = rec && rec.h === await digest(p);

      // 不区分「用户不存在」和「密码错」，避免泄露账号是否注册过
      if (!hit) { msg.textContent = T('账号或密码不对。'); return; }

      writeSession(rec.u);
      setSigned(rec.u);
      $('#li-pass').value = '';
      document.dispatchEvent(new CustomEvent('shiji:auth-changed', { detail: { user: rec.u } }));

      // 「这一箱还给你留着」必须有依据：真的从账号里恢复草稿
      // 规则：明确点了「登录后保存这一箱」的，以眼前这箱为准写进账号；
      //       其余情况（比如从右上角登录）以账号里的旧草稿为准，不覆盖它
      const local  = readLocalDraft();
      const stored = draftHasContent(rec.draft) ? rec.draft : null;
      const preferLocal = authIntent === 'save-box';
      let restored = false;

      if (local && (preferLocal || !stored)) {
        saveDraftToUser(rec.u, local);
      } else if (stored) {
        pushDraftToCalculator(stored);
        restored = true;
      }
      authIntent = null;

      const boxText = (local && (preferLocal || !stored))
        ? T('{0} 道菜和 {1} 样食材存进你账号了，换台设备登录也在。', local.dishes.length, local.have.length)
        : restored
          ? T('上次勾的 {0} 道菜和 {1} 样食材已经恢复了。', stored.dishes.length, (stored.have || []).length)
          : T('这一箱还给你留着。');

      showDone(T('欢迎回来'), T('{0}，{1}', rec.u, boxText), T('继续挑选'), close);
    });

    /* ---------- 订单：点结算直接看订单，不再要求先登录 ---------- */
    // 「登录后保存这一箱」是用户主动选择登录的入口，仍然拉起注册
    let authIntent = null;
    document.addEventListener('shiji:need-auth', e => {
      authIntent = (e.detail && e.detail.reason) || 'generic';
      openModal('signup');
    });

    let lastBox = null;

    // 箱子内容一变，之前算出的结算数据立刻作废。
    // 否则改完菜再点「结算」，会拿旧价格、旧菜品去下单——账对不上。
    document.addEventListener('shiji:need', () => {
      if (!lastBox) return;
      lastBox = null;
      const planCta = $('#planCta');
      const meta = $('#planMeta');
      if (!planCta) return;
      planCta.disabled = false;
      planCta.dataset.box = '';
      planCta.innerHTML = T('开始订阅') + '<span class="arrow">→</span>';
      if (meta) meta.textContent = T('按每周配送，四箱一季，到期自动暂停');
    });

    document.addEventListener('shiji:box', e => {
      lastBox = e.detail;
      const planCta = $('#planCta');
      const meta = $('#planMeta');
      if (!planCta) return;
      planCta.disabled = false;
      planCta.dataset.box = '1';
      planCta.innerHTML = T('结算本周箱 · ¥{0}', lastBox.price) + '<span class="arrow">→</span>';
      if (meta) meta.textContent = T('{0} 道菜 · 缺 {1} 样，一周内送达', lastBox.dishes.length, lastBox.count);
    });

    function openOrder() {
      openShell();
      showPane('order');

      const sum = $('#orderSum');
      const items = $('#orderItems');
      if (lastBox) {
        sum.textContent = T('{0} 道菜 · 缺 {1} 样 · ¥{2}', lastBox.dishes.length, lastBox.count, lastBox.price);
        items.innerHTML = '';
        lastBox.items.forEach(n => {
          const s = document.createElement('span');
          s.textContent = n;
          items.appendChild(s);
        });
      } else {
        const cyc = $('#segmented button[aria-pressed="true"]');
        sum.textContent = T('本季订阅 · {0} · ¥{1}/箱',
          cyc ? cyc.textContent.trim() : T('每周'), $('#planPrice').textContent);
        items.innerHTML = '';
      }

      const rec = currentUser();
      if (rec) $('#ord-name').value = rec.u;
      $('#orderNote').textContent = rec
        ? T('将以 {0} 的账号同步这一单。', rec.u)
        : T('还没登录。这一单先记在本次会话里，想跨设备同步可以用右上角登录。');

      focusFirst('order');
    }

    const planCta = $('#planCta');
    if (planCta) planCta.addEventListener('click', openOrder);

    orderForm.addEventListener('submit', e => {
      e.preventDefault();
      const msg = $('#orderMsg');

      const name  = $('#ord-name').value.trim();
      const phone = $('#ord-phone').value.trim();

      if (!name) { $('#ord-name').focus(); msg.textContent = T('收货人不能为空。'); return; }
      if (!/^1\d{10}$/.test(phone)) { $('#ord-phone').focus(); msg.textContent = T('手机号要 11 位、1 开头。'); return; }

      planCta.disabled = true;
      planCta.dataset.box = '1';
      planCta.innerHTML = T('已下单 · 霜降期') + '<span class="arrow">✓</span>';
      const meta = $('#planMeta');
      if (meta) meta.textContent = T('{0}，已登记。开箱前三天短信确认，随时可以跳过。', name);

      showDone(T('已下单'),
        T('{0}，霜降期这一箱已经记下。开箱前三天短信确认，随时可以跳过。', name),
        T('完成'), close);
    });

    /* ---------- 语言切换：账号入口与订阅按钮跟着换 ---------- */
    onLang(() => {
      const rec = currentUser();
      if (rec) setSigned(rec.u); else clearSigned();

      if (lastBox) {
        const planCtaEl = $('#planCta');
        if (planCtaEl) {
          planCtaEl.dataset.box = '1';
          planCtaEl.disabled = false;
          planCtaEl.innerHTML = T('结算本周箱 · ¥{0}', lastBox.price) + '<span class="arrow">→</span>';
        }
        const metaEl = $('#planMeta');
        if (metaEl) metaEl.textContent = T('{0} 道菜 · 缺 {1} 样，一周内送达', lastBox.dishes.length, lastBox.count);
      }

      // 弹窗正开着时，标题也要跟着换
      if (!modal.hidden) {
        const pane = !loginForm.hidden ? 'login'
                   : !signupForm.hidden ? 'signup'
                   : !orderForm.hidden ? 'order' : '';
        if (pane) showPane(pane);
        else if (!accountPane.hidden) { const r = currentUser(); if (r) renderAccount(r); }
      }
    });

    /* ---------- 初始化 ---------- */
    // 英文直开：把几个 JS 管的初始文案规范成当前语言
    if (isEN()) {
      authKicker.textContent = T('拾季 · 账号');
      authTitle.textContent = T('回到你的那一箱');
      $('#doneTitle').textContent = T('账号已创建');
      doneBtn.innerHTML = T('继续挑选') + '<span class="arrow">→</span>';
      const ctaEl = $('#planCta');
      if (ctaEl && ctaEl.dataset.box !== '1') {
        ctaEl.innerHTML = T('开始订阅') + '<span class="arrow">→</span>';
      }
    }

    // 刷新后恢复登录态时必须广播一次：否则计算器不知道已登录，
    // 加箱后仍会显示「登录后保存这一箱」，点一下又让你重新注册
    const existing = currentUser();
    if (existing) {
      setSigned(existing.u);
      document.dispatchEvent(new CustomEvent('shiji:auth-changed', { detail: { user: existing.u } }));
    } else {
      clearSigned();   // 未登录也要走一遍：英文环境下把「登录」规范成 "Log in"
    }
  })();

})();
