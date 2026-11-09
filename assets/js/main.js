/* ===========================================================
   Fate / Encore — 무대 진행
   =========================================================== */
(() => {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ── 1. 마법진 눈금 ─────────────────────────────────── */
  (function drawTicks() {
    const g = $('.hero__sigil-ticks');
    if (!g) return;
    const ns = 'http://www.w3.org/2000/svg';
    const cx = 300, cy = 300;
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      const long = i % 6 === 0;
      const r1 = 252, r2 = long ? 232 : 243;
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', (cx + Math.cos(a) * r1).toFixed(2));
      line.setAttribute('y1', (cy + Math.sin(a) * r1).toFixed(2));
      line.setAttribute('x2', (cx + Math.cos(a) * r2).toFixed(2));
      line.setAttribute('y2', (cy + Math.sin(a) * r2).toFixed(2));
      line.setAttribute('opacity', long ? '.95' : '.45');
      g.appendChild(line);
    }
  })();

  /* ── 2. 막 오름 ─────────────────────────────────────── */
  const curtain = $('#curtain');
  const hero    = $('#hero');

  function raiseCurtain() {
    if (!curtain) return;
    hero && hero.classList.add('is-lit');
    curtain.classList.add('is-open');
    window.setTimeout(() => curtain.classList.add('is-done'), reduce ? 50 : 1700);
  }

  if (reduce) {
    raiseCurtain();
    document.documentElement.classList.add('no-motion');
  } else {
    window.setTimeout(raiseCurtain, 420);
  }

  /* ── 3. 대화창 ──────────────────────────────────────── */
  const vn       = $('#vn');
  const vnName   = $('#vnName');
  const vnText   = $('#vnText');
  const vnBox    = $('.vn__box');
  const vnLog    = $('#vnLog');
  const logList  = $('#vnLogList');
  const btnAuto  = $('#btnAuto');
  const btnSkip  = $('#btnSkip');
  const btnLog   = $('#btnLog');
  const btnHide  = $('#btnHide');
  const btnShow  = $('#btnShow');
  const portraits = $$('button.portrait');

  const SPEED = 42;          // 글자당 ms
  const AUTO_WAIT = 3400;    // AUTO 모드 대기

  let typer = null;
  let autoTimer = null;
  let autoOn = false;
  let current = -1;
  const history = [];

  const lines = portraits.map(p => ({
    name: p.dataset.name,
    cls:  p.dataset.class,
    line: p.dataset.line,
    el:   p
  }));

  // 첫 대사: 프로스페로(CASTER)가 막을 열어준다
  const opening = Math.max(0, lines.findIndex(l => l.cls === 'CASTER'));

  function stopTyping() {
    if (typer) { window.clearInterval(typer); typer = null; }
  }

  function finishLine(text) {
    stopTyping();
    vnText.textContent = text;
    vnText.classList.add('is-done');
  }

  function type(text) {
    stopTyping();
    vnText.classList.remove('is-done');
    if (reduce) { finishLine(text); return; }
    vnText.textContent = '';
    let i = 0;
    typer = window.setInterval(() => {
      vnText.textContent = text.slice(0, ++i);
      if (i >= text.length) finishLine(text);
    }, SPEED);
  }

  function pushLog(entry) {
    history.push(entry);
    if (history.length > 40) history.shift();
    if (!logList) return;
    logList.innerHTML = history
      .map(h => `<li><b>${h.name}</b> — ${h.line}</li>`)
      .join('');
    logList.scrollTop = logList.scrollHeight;
  }

  function speak(index, { log = true } = {}) {
    const item = lines[index];
    if (!item) return;
    current = index;
    portraits.forEach(p => p.setAttribute('aria-pressed', String(p === item.el)));
    vnName.textContent = item.name;
    type(item.line);
    if (log) pushLog(item);
    if (vn.classList.contains('is-hidden')) showBox();
  }

  function advance() {
    // 타이핑 중이면 먼저 끝까지 출력, 아니면 다음 대사
    if (typer) { finishLine(lines[current].line); return; }
    speak((current + 1) % lines.length);
  }

  function showBox() {
    vn.classList.remove('is-hidden');
    btnShow.hidden = true;
  }
  function hideBox() {
    vn.classList.add('is-hidden');
    btnShow.hidden = false;
    setAuto(false);
  }

  function setAuto(on) {
    autoOn = on;
    btnAuto.setAttribute('aria-pressed', String(on));
    window.clearInterval(autoTimer);
    if (on) {
      autoTimer = window.setInterval(() => {
        if (document.hidden) return;
        speak((current + 1) % lines.length);
      }, AUTO_WAIT);
    }
  }

  portraits.forEach((p, i) => {
    p.addEventListener('click', () => { setAuto(false); speak(i); });
  });

  vnBox && vnBox.addEventListener('click', e => {
    if (e.target.closest('.vn__btn')) return;   // 조작 버튼은 제외
    setAuto(false);
    advance();
  });

  btnSkip && btnSkip.addEventListener('click', () => {
    if (typer) finishLine(lines[current].line);
    else advance();
  });

  btnAuto && btnAuto.addEventListener('click', () => setAuto(!autoOn));

  btnLog && btnLog.addEventListener('click', () => {
    const open = vnLog.hidden;
    vnLog.hidden = !open;
    btnLog.setAttribute('aria-expanded', String(open));
  });

  btnHide && btnHide.addEventListener('click', hideBox);
  btnShow && btnShow.addEventListener('click', showBox);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !vnLog.hidden) {
      vnLog.hidden = true;
      btnLog.setAttribute('aria-expanded', 'false');
      btnLog.focus();
    }
  });

  // 막이 오른 뒤 첫 대사
  window.setTimeout(() => speak(opening), reduce ? 100 : 1500);

  /* ── 4. 상단 바 ─────────────────────────────────────── */
  const topbar = $('#topbar');
  const onScroll = () => {
    topbar.classList.toggle('is-stuck', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── 5. 현재 섹션 표시 ──────────────────────────────── */
  const navLinks = $$('.topbar__nav a');
  const sections = navLinks
    .map(a => document.getElementById(a.getAttribute('href').slice(1)))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        navLinks.forEach(a =>
          a.classList.toggle('is-current', a.getAttribute('href') === '#' + en.target.id)
        );
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => io.observe(s));
  }

  /* ── 6. 소식지 ──────────────────────────────────────── */
  const form = $('#notifyForm');
  const msg  = $('#notifyMsg');
  form && form.addEventListener('submit', e => {
    e.preventDefault();
    const input = $('#notifyEmail');
    const value = input.value.trim();
    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      msg.textContent = '메일 주소 형식을 확인해 주세요. 예: name@example.com';
      input.focus();
      return;
    }
    // 아직 받는 곳이 없다. 연결되면 이 자리에 보내는 처리를 넣는다.
    msg.textContent = '아직 소식지 서버가 연결되지 않았습니다. 공개 전에 이 자리에서 접수가 시작됩니다.';
    input.value = '';
  });
})();
