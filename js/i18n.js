/* ============================================================
   拾季 SHIJI · 中英双语
   设计原则：
   1. 不引入任何外部库，纯原生，零请求依赖。
   2. 静态文案的英文写在 HTML 的 data-en 里（翻译就在原文旁边，便于校对）。
   3. JS 生成的文案走 T('中文模板', 参数...)，占位符用 {0} {1}。
   4. 词典缺失时原样返回中文——宁可显示中文，也不显示空白或报错。
   ============================================================ */

(function () {
  'use strict';

  const KEY = 'shiji.lang';
  const DEFAULT = 'zh';

  /* ---------------- JS 侧文案词典 ---------------- */
  const DICT = {
    /* 通用 */
    '登录': 'Log in',
    '当季': 'In season',
    '霜降 · 第二十一期': 'Frost Descent · Issue 21',
    '显示密码': 'Show password',
    '隐藏密码': 'Hide password',

    /* 计算器 */
    '未选': 'Not picked',
    '已配齐': 'All set',
    '差 {0} 样': '{0} missing',
    '{0} 样': '{0} items',
    '每周': 'Weekly',
    '选一道菜，这里会列出需要的食材': 'Pick a dish and its ingredients appear here',
    '还没选菜': 'No dishes yet',
    '选一道菜，我们开始算': 'Pick a dish and we will do the maths',
    '全都齐了': 'Everything is covered',
    '{0} 道菜，{1} 样食材，一样不缺': '{0} dishes, {1} ingredients, nothing missing',
    '还差 {0} 样': '{0} still missing',
    '能做出 {0} 道 · 共 {1} 道': 'Can make {0} of {1} dishes',
    '先选一道菜': 'Pick a dish first',
    '已配齐，无需下单': 'All set — nothing to order',
    '加入本周箱': "Add to this week's box",
    '已加入本周箱': "Added to this week's box",
    '登录后保存这一箱': 'Log in to save this box',
    '已保存到 {0} 的账号': 'Saved to {0}',
    '当季食材': 'In season',
    '厨房常备': 'Pantry staples',
    '{0} 道菜 · 缺 {1} 样 · ¥{2}': '{0} dishes · {1} missing · ¥{2}',

    /* 订阅区 */
    '按每周配送，四箱一季，到期自动暂停': 'Weekly delivery · four boxes a season · auto-pauses at the end',
    '按每两周配送，一季两箱，可随时跳过': 'Every two weeks · two boxes a season · skip anytime',
    '按每月配送，单箱现结，无长期绑定': 'Monthly · pay per box · no long-term lock-in',
    '开始订阅': 'Start subscribing',
    '结算本周箱 · ¥{0}': "Checkout this week's box · ¥{0}",
    '{0} 道菜 · 缺 {1} 样，一周内送达': '{0} dishes · {1} missing · delivered within a week',
    '已下单 · 霜降期': 'Ordered · Frost Descent',
    '{0}，已登记。开箱前三天短信确认，随时可以跳过。': '{0}, you are on the list. We text three days before the box ships — skip anytime.',
    '已下单': 'Order placed',
    '{0}，霜降期这一箱已经记下。开箱前三天短信确认，随时可以跳过。': '{0}, this Frost Descent box is saved. We text three days before it ships — skip anytime.',
    '完成': 'Done',
    '本季订阅 · {0} · ¥{1}/箱': 'This season · {0} · ¥{1}/box',
    '将以 {0} 的账号同步这一单。': 'This order will sync to the account {0}.',
    '还没登录。这一单先记在本次会话里，想跨设备同步可以用右上角登录。': 'Not signed in. This order stays in the current session — log in at the top right to sync across devices.',
    '收货人不能为空。': 'Recipient name is required.',
    '手机号要 11 位、1 开头。': 'Phone number must be 11 digits starting with 1.',

    /* 年龄确认 */
    '已登记。酒精搭配与生食建议已解锁。': 'Noted. Pairings with alcohol and raw-food notes are unlocked.',
    '已记录。根据规定，酒精搭配与刺身类生食建议将不向你展示。': 'Noted. Under our content rules, alcohol pairings and raw-seafood notes stay hidden.',

    /* 账号 */
    '拾季 · 账号': 'Shiji · Account',
    '拾季 · 订单': 'Shiji · Order',
    '拾季 · 已登录': 'Shiji · Signed in',
    '回到你的那一箱': 'Back to your box',
    '留一个收货的名': 'A name for your deliveries',
    '确认这一箱': 'Confirm this box',
    '你好，{0}': 'Hello, {0}',
    '已登录为 {0}，点击管理账号': 'Signed in as {0} — click to manage',
    '{0} 岁': '{0} years old',
    '这台浏览器共 {0} 个账号 · 用同一个用户名登录即可切换': '{0} accounts on this browser · log in with a username to switch',
    '这台浏览器只有你一个账号': 'This browser holds one account — yours',
    '登录状态已失效，请重新登录。': 'Your session expired. Please log in again.',
    '当前密码不对。': 'Current password is not correct.',
    '两次输入的新密码不一致。': 'The two new passwords do not match.',
    '新密码至少 8 位，且要同时含字母、数字和特殊字符 !@#$%&*。': 'New password needs at least 8 characters, with letters, digits and one of !@#$%&*.',
    '密码已更新。': 'Password updated.',
    '密码已更新（仅本次会话）。': 'Password updated (this session only).',
    '用户名和密码都要填。': 'Enter both username and password.',
    '账号或密码不对。': 'Wrong username or password.',
    '用户名还没符合要求。': 'Username does not meet the rules yet.',
    '密码还没符合要求。': 'Password does not meet the rules yet.',
    '年龄填得不对。': 'Age is not valid.',
    '这个用户名已经被注册了，换一个，或者直接登录。': 'That username is taken — pick another, or log in.',
    '账号已创建': 'Account created',
    '账号已创建 · 仅本次会话': 'Account created · this session only',
    '{0}，欢迎。按你填的年龄，酒精搭配与刺身类生食建议会保持隐藏，其余内容照常。': '{0}, welcome. Given the age you entered, alcohol pairings and raw-seafood notes stay hidden; everything else works as usual.',
    '{0}，欢迎。每期开箱前三天，我们会发短信通知你这一箱的内容。': '{0}, welcome. Three days before each box ships we text you what is inside.',
    '继续挑选': 'Keep picking',
    '欢迎回来': 'Welcome back',
    '这一箱还给你留着。': 'Your box is still here.',
    '{0} 道菜和 {1} 样食材存进你账号了，换台设备登录也在。': '{0} dishes and {1} ingredients saved to your account — they follow you to any device.',
    '上次勾的 {0} 道菜和 {1} 样食材已经恢复了。': 'Restored the {0} dishes and {1} ingredients you ticked last time.',
    '{0}，{1}': '{0}, {1}'
  };

  /* ---------------- 状态 ---------------- */
  let lang = DEFAULT;
  // 显式链接优先：?lang=en 可以直接把英文版发给别人，不受对方浏览器记住的语言影响
  try {
    const q = new URLSearchParams(location.search).get('lang');
    if (q === 'en' || q === 'zh') lang = q;
  } catch (e) {}
  try {
    const saved = localStorage.getItem(KEY);
    if ((lang === DEFAULT) && (saved === 'en' || saved === 'zh')) lang = saved;
  } catch (e) {}

  const listeners = [];

  /* ---------------- 取词 ---------------- */
  function fill(tpl, args) {
    return tpl.replace(/\{(\d)\}/g, (m, i) => (args[i] === undefined ? m : args[i]));
  }

  function t(zh, ...args) {
    const en = DICT[zh];
    const tpl = (lang === 'en' && en) ? en : zh;
    return args.length ? fill(tpl, args) : tpl;
  }

  /* ---------------- 静态文案：data-en ---------------- */
  const staticNodes = [...document.querySelectorAll('[data-en]')];
  const zhHTML = new Map();
  staticNodes.forEach(el => zhHTML.set(el, el.innerHTML));

  const TITLE = { zh: document.title, en: 'SHIJI — Eat with the season' };
  const DESC = { zh: '', en: '' };
  const descEl = document.querySelector('meta[name="description"]');
  if (descEl) {
    DESC.zh = descEl.getAttribute('content');
    DESC.en = 'SHIJI is a premium seasonal-produce subscription. Twelve flavours a season, 48 hours from farm to table. We send only what you are missing — nothing more.';
  }

  function applyStatic() {
    staticNodes.forEach(el => {
      el.innerHTML = lang === 'en' ? el.getAttribute('data-en') : zhHTML.get(el);
    });

    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
    document.title = TITLE[lang] || TITLE.zh;
    if (descEl && DESC[lang]) descEl.setAttribute('content', DESC[lang]);
  }

  /* ---------------- 切换按钮 ---------------- */
  function paintSwitch() {
    const btn = document.getElementById('langSwitch');
    if (!btn) return;
    btn.textContent = lang === 'en' ? '中' : 'EN';
    btn.setAttribute('aria-label', lang === 'en' ? '切换到中文' : 'Switch to English');
    btn.setAttribute('title', lang === 'en' ? '切换到中文' : 'Switch to English');
    btn.setAttribute('aria-pressed', lang === 'en' ? 'true' : 'false');
  }

  function setLang(next) {
    lang = next === 'en' ? 'en' : 'zh';
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    applyStatic();
    paintSwitch();
    listeners.forEach(fn => { try { fn(lang); } catch (e) {} });
  }

  /* ---------------- 对外接口 ---------------- */
  window.SHIJI = {
    t,
    get lang() { return lang; },
    setLang,
    onLang(fn) { if (typeof fn === 'function') listeners.push(fn); },
    toggle() { setLang(lang === 'en' ? 'zh' : 'en'); }
  };

  /* ---------------- 初始化 ---------------- */
  applyStatic();
  paintSwitch();

  document.addEventListener('click', e => {
    if (e.target.closest('#langSwitch')) {
      e.preventDefault();
      setLang(lang === 'en' ? 'zh' : 'en');
    }
  });

  // 其他标签页切换语言，这一页跟着变
  window.addEventListener('storage', e => {
    if (e.key === KEY && (e.newValue === 'en' || e.newValue === 'zh') && e.newValue !== lang) {
      setLang(e.newValue);
    }
  });
})();
