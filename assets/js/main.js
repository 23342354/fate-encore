/* ===========================================================
   Fate / Encore — 게임 화면 진행
   타이틀 → 로비. 하단 메뉴로 화면을 바꾼다.
   =========================================================== */
(() => {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const CAST = window.CAST || {};
  const MASTERS = window.MASTERS || {};

  /* ── 0. 참전 명단 ───────────────────────────────────────
     클래스 순서 그대로. name 이 없는 줄은 미공개 카드가 된다.
     line 은 로비와 프로필에 나오는 한마디.
     스테이터스·스킬 같은 설정은 cast.js 에서 진명으로 찾아온다. */
  const svg = inner =>
    `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">${inner}</svg>`;
  // 영주 그림 — 장식이라 대체 글은 비운다 (이름은 카드와 프로필에 따로 적혀 있다)
  const seal = src => `<img class="seal" src="${src}" alt="" decoding="async">`;
  const GLYPH_SEALED =
    '<svg viewBox="0 0 64 64" fill="currentColor" stroke="none"><path d="M32 13a10 10 0 1 1 0 20 10 10 0 0 1 0-20z"/><path d="M13 55c0-11 8.5-17 19-17s19 6 19 17z"/></svg>';

  const ROSTER = [
    { cls: 'SABER' },
    { cls: 'ARCHER', name: '도로시', master: '이치노세 류가',
      masterGlyph: seal('assets/img/seal-ryuga.png'),
      line: '저를 기다린 사람은 없었어도 제가 기다린 사람들은 있었으니까요.',
      glyph: svg('<path d="M18 12 q22 20 0 40"/><path d="M18 12 L18 52"/><path d="M22 32 L50 32"/><path d="M44 26 l6 6 -6 6"/>') },
    { cls: 'LANCER' },
    { cls: 'RIDER' },
    { cls: 'CASTER', name: '오스카 조로아스터', master: '마키오카 모쿠렌',
      masterGlyph: seal('assets/img/seal-mokuren.png'),
      line: '어서 와. 먼 길을 걸어온 사람에게는 그만한 기적이 필요한 법이지.',
      glyph: svg('<path d="M20 52 L44 20"/><circle cx="46" cy="16" r="5"/><path d="M14 30 l6 -6 6 6 -6 6 z"/><path d="M40 46 l4 -4 4 4 -4 4 z"/>') },
    { cls: 'ASSASSIN', name: '로드', master: '릴리안 루스텔리아',
      masterGlyph: seal('assets/img/seal-lilian.png'),
      line: '움직여도 괜찮아. 나는 살아 있는 너를 그리고 싶으니.',
      glyph: svg('<path d="M32 14 q-14 10 -14 22 a14 14 0 0 0 28 0 q0 -12 -14 -22"/><path d="M26 40 q6 6 12 0"/>') },
    { cls: 'BERSERKER', name: '카르타필루스', master: '오즈 누벨',
      masterGlyph: seal('assets/img/seal-oz.png'), masterGlyphCredit: '@t66rjp_com',
      line: '나는 기도한다. 최후의 날이 오기까지를.',
      glyph: svg('<path d="M16 44 L16 26 l8 8 8 -14 8 14 8 -8 0 18 z"/><path d="M16 48 L48 48"/>') },
  ];
  const lines = ROSTER.filter(r => r.name);   // 공개된 서번트만
  // 마스터 문양 — 영주 그림이 없는 마스터는 령주를 본뜬 기본 표식. 그림은 ROSTER 의 masterGlyph
  const GLYPH_MASTER = svg('<path d="M32 9 C25 19 25 27 32 33 C39 27 39 19 32 9 Z"/><path d="M13 29 C21 35 27 41 32 55 C37 41 43 35 51 29"/><path d="M21 24 q-7 11 4 19"/><path d="M43 24 q7 11 -4 19"/>');
  const masterGlyph = r => r.masterGlyph || GLYPH_MASTER;

  const dash = v => (v && String(v).trim()) ? String(v) : '—';
  const esc  = s => s.replace(/[&<>"]/g, c =>
    ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));

  // **별 두 개** 는 짙은 청록 강조, 줄바꿈은 그대로 줄바꿈
  const rich = s => esc(s)
    .replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');

  function loreTable(t) {
    if (!t || !t.rows || !t.rows.length) return '';
    const head = (t.head || []).map(c => `<th>${esc(c)}</th>`).join('');
    const rows = t.rows.map(r =>
      `<tr>${r.map(c => `<td>${rich(c)}</td>`).join('')}</tr>`).join('');
    return `<table class="lore__table"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`;
  }

  // 「 『 “ 로 시작하는 문단은 대사체로
  const prose = paras => (paras && paras.length)
    ? paras.map(p => {
        // 여는 따옴표로 시작하고 닫는 따옴표로 끝나야 대사체.
        // "잘했어"라는 말은… 처럼 인용으로 시작하는 서술문은 제외된다.
        const t = p.trim();
        const quote = /^[「『“‘"']/.test(t) && /[」』”’"']\.?$/.test(t);
        return `<p class="${quote ? 'is-line' : ''}">${rich(p)}</p>`;
      }).join('')
    : '<p class="is-empty">—</p>';

  /* ── 타자기 ────────────────────────────────────────────
     글자를 하나씩 덧붙이면 줄이 다시 나뉘면서 문장이 흔들린다.
     그래서 문장 전체를 처음부터 투명하게 깔아 두고 한 글자씩 보이게 한다.
     줄바꿈(\n)과 **강조** 도 처음부터 제자리에 있다.
     ▼ 표시는 마지막 글자와 붙여 두어 혼자 다음 줄로 떨어지지 않는다. */
  const MORE = '<span class="more" aria-hidden="true">▼</span>';
  function charsHTML(text) {
    const toks = [];
    let bold = false;
    text.split(/(\*\*|\n)/).forEach(part => {
      if (part === '**') { toks.push({ tag: bold ? '</strong>' : '<strong>' }); bold = !bold; return; }
      if (part === '\n') { toks.push({ tag: '<br>' }); return; }
      for (const c of part) toks.push({ c });
    });
    let last = -1;
    toks.forEach((t, i) => { if (t.c != null && t.c.trim()) last = i; });
    return toks.map((t, i) => {
      if (t.tag) return t.tag;
      const ch = `<span class="ch">${esc(t.c)}</span>`;
      return i === last ? `<span class="nb">${ch}${MORE}</span>` : ch;
    }).join('') + (last < 0 ? MORE : '');
  }
  // el 에 문장을 깔고, 한 글자씩 보이게 하는 함수를 돌려준다
  function typewriter(el, text, ms, onDone) {
    el.innerHTML = charsHTML(text);
    el.classList.remove('is-done');
    const chs = el.querySelectorAll('.ch');
    let i = 0, timer = null;
    const finish = () => {
      if (timer) { window.clearInterval(timer); timer = null; }
      chs.forEach(c => c.classList.add('on'));
      el.classList.add('is-done');
      onDone && onDone();
    };
    if (reduce || ms <= 0 || !chs.length) { finish(); return { finish, stop() {} }; }
    timer = window.setInterval(() => {
      // 공백은 바로 건너뛴다
      while (i < chs.length && !chs[i].textContent.trim()) chs[i++].classList.add('on');
      if (i < chs.length) chs[i++].classList.add('on');
      if (i >= chs.length) finish();
    }, ms);
    return { finish, stop() { if (timer) { window.clearInterval(timer); timer = null; } } };
  }

  /* ── 1. 마법진 눈금 ─────────────────────────────────── */
  (function drawTicks() {
    const g = $('#sigilTicks');
    if (!g) return;
    const ns = 'http://www.w3.org/2000/svg';
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      const long = i % 6 === 0;
      const r1 = 252, r2 = long ? 232 : 243;
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', (300 + Math.cos(a) * r1).toFixed(2));
      line.setAttribute('y1', (300 + Math.sin(a) * r1).toFixed(2));
      line.setAttribute('x2', (300 + Math.cos(a) * r2).toFixed(2));
      line.setAttribute('y2', (300 + Math.sin(a) * r2).toFixed(2));
      line.setAttribute('opacity', long ? '.95' : '.45');
      g.appendChild(line);
    }
  })();

  /* ── 2. 막 오름 → 타이틀 → 로비 ─────────────────────── */
  const curtain = $('#curtain');
  const title   = $('#title');
  const game    = $('#game');
  let started = false;

  function raiseCurtain() {
    curtain.classList.add('is-open');
    window.setTimeout(() => curtain.classList.add('is-done'), reduce ? 50 : 1700);
  }
  if (reduce) raiseCurtain(); else window.setTimeout(raiseCurtain, 420);

  /* ── 2-b. 배경음악 ─────────────────────────────────────
     끄고 켠 상태는 이 브라우저에 기억해 둔다.
     브라우저가 막으면 조용히 넘어가고, 버튼을 누르면 다시 시도한다. */
  const bgm    = $('#bgm');
  const btnBgm = $('#btnBgm');
  const BGM_VOLUME = 0.45;
  let bgmOn = true;
  let bgmTarget = BGM_VOLUME;   // 서곡은 장면마다 음량을 바꾼다
  let fadeTimer = null;
  try { bgmOn = window.localStorage.getItem('fe-bgm') !== 'off'; } catch (e) { /* 저장소를 못 쓰는 환경 */ }

  const playerBtn = $('#playerBtn');
  function paintBgm() {
    [btnBgm, playerBtn].forEach(b => {
      b.setAttribute('aria-pressed', String(bgmOn));
      b.setAttribute('aria-label', bgmOn ? '배경음악 끄기' : '배경음악 켜기');
    });
    document.documentElement.classList.toggle('bgm-off', !bgmOn);
  }
  function fadeTo(target, done) {
    window.clearInterval(fadeTimer);
    if (reduce) { bgm.volume = target; done && done(); return; }
    fadeTimer = window.setInterval(() => {
      const v = bgm.volume + (target > bgm.volume ? .05 : -.05);
      if (Math.abs(target - bgm.volume) <= .05) {
        bgm.volume = target;
        window.clearInterval(fadeTimer);
        done && done();
      } else {
        bgm.volume = Math.min(1, Math.max(0, v));
      }
    }, 60);
  }
  function playBgm() {
    if (!bgmOn) return;
    bgm.volume = 0;
    const p = bgm.play();
    if (p && p.then) p.then(() => fadeTo(bgmTarget)).catch(() => {});
    else fadeTo(bgmTarget);
  }
  // 음량을 v 로 천천히 옮긴다. 0 이면 소리만 줄이고 멈추지는 않는다
  function bgmTo(v) {
    bgmTarget = v;
    if (!bgmOn || !started) return;
    if (bgm.paused && v > 0) { playBgm(); return; }
    fadeTo(v);
  }
  function stopBgm() { fadeTo(0, () => bgm.pause()); }

  playerBtn.addEventListener('click', () => btnBgm.click());
  btnBgm.addEventListener('click', () => {
    bgmOn = !bgmOn;
    try { window.localStorage.setItem('fe-bgm', bgmOn ? 'on' : 'off'); } catch (e) { /* 무시 */ }
    paintBgm();
    bgmOn ? playBgm() : stopBgm();
  });
  // 다른 탭으로 가면 멈추고, 돌아오면 이어서
  document.addEventListener('visibilitychange', () => {
    if (!started || !bgmOn) return;
    if (document.hidden) bgm.pause(); else playBgm();
  });
  paintBgm();

  // 처음 온 사람에게는 TAP TO START 직후 서곡을 한 번 틀어 준다.
  // 한 번 보여 주면(끝까지 보든, 중간에 나가든) 다시는 저절로 틀지 않는다.
  // 주소 끝에 ?intro 를 붙이면 다시 볼 수 있다 (확인용)
  const INTRO_KEY = 'fe-intro';
  function introPending() {
    if (/[?&]intro\b/.test(location.search)) return true;
    try { return window.localStorage.getItem(INTRO_KEY) !== 'played'; } catch (e) { return false; }
  }
  function markIntro() {
    try { window.localStorage.setItem(INTRO_KEY, 'played'); } catch (e) { /* 무시 */ }
  }

  // 하단 메뉴 높이를 재서 CSS 에 알려 준다 — 페이지 아래 여백이 이 값을 쓴다
  const dockEl = $('.dock');
  function measureDock() {
    if (dockEl.offsetHeight) document.documentElement.style.setProperty('--dock-h', dockEl.offsetHeight + 'px');
  }
  window.addEventListener('resize', measureDock);

  function start() {
    if (started) return;
    started = true;
    const intro = introPending();
    if (intro) bgmTarget = 0;   // 서곡은 침묵으로 시작한다 — 소리 허락만 받아 둔다
    playBgm();      // 타이틀을 누른 그 순간이라야 브라우저가 소리를 허락한다
    title.classList.add('is-gone');
    game.hidden = false;
    measureDock();
    // 한 박자 뒤에 켜야 페이드가 걸린다
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => game.classList.add('is-on')));
    go(location.hash.slice(1), false);
    window.setTimeout(() => feature(opening), reduce ? 50 : 500);
    const first = $('.dock__btn[aria-current="page"]');
    first && first.focus({ preventScroll: true });
    if (intro) { markIntro(); openPrologue(); }
  }
  title.addEventListener('click', start);

  /* ── 3. 화면 전환 ───────────────────────────────────── */
  const SCREENS = ['home', 'cast', 'summon', 'story', 'info'];
  const screens = $$('.screen');
  const dockBtns = $$('.dock__btn');

  function go(name, push = true) {
    if (!SCREENS.includes(name)) name = 'home';
    screens.forEach(s => { s.hidden = s.dataset.screen !== name; });
    dockBtns.forEach(b => {
      if (b.dataset.go === name) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });
    if (push && location.hash !== '#' + name) {
      try { window.history.pushState(null, '', '#' + name); } catch (e) { /* 미리보기 틀 안에서는 막힐 수 있다 */ }
    }
  }
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-go]');
    if (el) go(el.dataset.go);
  });
  window.addEventListener('popstate', () => { if (started) go(location.hash.slice(1), false); });

  /* ── 4. 로비 — 대표 서번트와 한마디 ─────────────────── */
  const speechName = $('#speechName');
  const speechText = $('#speechText');
  const arch       = $('#standArch');
  const SPEED = 42;   // 글자당 ms

  let typer = null;
  let current = -1;
  // 첫 대사는 CASTER 가 맡는다 (index.html 의 초기 이름과 맞출 것)
  const opening = Math.max(0, lines.findIndex(l => l.cls === 'CASTER'));

  function stopTyping() {
    if (typer) { typer.stop(); typer = null; }
  }
  function finishLine() {
    if (typer) { const t = typer; typer = null; t.finish(); }
  }
  function type(text) {
    stopTyping();
    const t = typewriter(speechText, text, SPEED, () => { typer = null; });
    if (!speechText.classList.contains('is-done')) typer = t;
  }

  function feature(index) {
    const item = lines[index];
    if (!item) return;
    const changed = index !== current;
    current = index;
    $('#standGlyph').innerHTML    = item.glyph;
    $('#standNo').textContent     = noOf(item);
    $('#standType').textContent   = item.cls;
    $('#talkNo').textContent      = noOf(item);
    $('#standClass').textContent  = item.cls;
    $('#standName').textContent   = item.name;
    $('#standMaster').textContent = item.master;
    speechName.textContent = item.name;
    if (changed && !reduce) {
      arch.classList.remove('is-swap');
      void arch.offsetWidth;            // 애니메이션 다시 걸기
      arch.classList.add('is-swap');
    }
    type(item.line);
  }
  function advance() {
    // 타이핑 중이면 먼저 끝까지 출력, 아니면 다음 서번트
    if (typer) { finishLine(); return; }
    feature((current + 1) % lines.length);
  }
  $('#speech').addEventListener('click', advance);
  arch.addEventListener('click', advance);
  $('#standProfile').addEventListener('click', () => openProfile(current));
  $('#standMaster').addEventListener('click', () => openProfile(current, 'master'));
  // 왼쪽 가장자리 — 장식 숨기기 · 다음 서번트
  const homeEl = $('#s-home');
  $('#lobbyHide').addEventListener('click', e => {
    const bare = !homeEl.classList.contains('is-bare');
    homeEl.classList.toggle('is-bare', bare);
    e.currentTarget.setAttribute('aria-pressed', String(bare));
    e.currentTarget.setAttribute('aria-label', bare ? '화면 장식 보이기' : '화면 장식 숨기기');
  });
  $('#lobbySwap').addEventListener('click', () => { if (typer) finishLine(); feature((current + 1) % lines.length); });

  /* ── 5. 서번트 카드 ─────────────────────────────────── */
  function cardHTML(r) {
    if (!r.name) {
      return `<div class="card card--sealed">
        <span class="card__art">
          <span class="card__class">${r.cls}</span>
          <span class="card__glyph" aria-hidden="true">${GLYPH_SEALED}</span>
          <span class="card__plate"><span class="card__name">진명 미공개</span><span class="card__master">MASTER 미공개</span></span>
        </span>
      </div>`;
    }
    const rank = ((CAST[r.name] || {}).stats || {}).np;
    return `<button class="card" type="button" data-idx="${lines.indexOf(r)}" aria-label="${esc(r.cls)} ${esc(r.name)} 프로필 열기">
      <span class="card__art">
        <span class="card__class">${r.cls}</span>
        ${rank ? `<span class="card__rank"><small>보구</small>${esc(rank)}</span>` : ''}
        <span class="card__glyph" aria-hidden="true">${r.glyph}</span>
        <span class="card__plate"><span class="card__name">${esc(r.name)}</span><span class="card__master">MASTER ${esc(r.master)}</span></span>
      </span>
    </button>`;
  }
  /* 캐스트 — 옛날 컴퓨터 창처럼 생긴 신분증 카드
     제목줄(No.05 — CASTER.exe) · 초상 칸 · 이름과 항목 · 바코드 · 상태줄 */
  const pad2 = n => String(n).padStart(2, '0');
  const noOf = r => pad2(ROSTER.indexOf(r) + 1);
  // 이름으로 정해지는 바코드 — 같은 이름은 늘 같은 줄무늬
  function barcodeSVG(seed) {
    let h = 2166136261;
    for (const c of seed) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
    const r = rng(h >>> 0);
    let x = 0, bars = '';
    while (x < 98) {
      const w = r() < .55 ? 1 : (r() < .7 ? 2 : 3);
      if (r() < .66) bars += `<rect x="${x.toFixed(1)}" width="${(w * .8).toFixed(1)}" height="20"/>`;
      x += w * .8 + (r() < .5 ? .8 : 1.4);
    }
    return `<svg class="barcode" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true">${bars}</svg>`;
  }
  const winCtl = '<span class="win__ctl" aria-hidden="true"><i></i><i></i><i></i></span>';
  const redact = w => `<span class="redact" style="width:${w}em" aria-hidden="true"></span>`;

  /* 캐스트 카드 — 서번트는 창, 마스터는 신분증. 뼈대는 하나라 여백 · 간격이 같다
     제목줄 · [사진 | 머리글 · 라벨 · 이름 · 항목 두 줄 · 바코드] · 상태줄 */
  function winHTML(r, side) {
    const no = noOf(r);
    const master = side === 'master';
    const sealed = !r.name;
    const i = lines.indexOf(r);
    const who = master ? r.master : r.name;
    const tag = sealed ? 'div' : 'button';
    const attrs = sealed ? '' : master
      ? ` type="button" data-master="${i}" aria-label="${esc(r.master)} 프로필 열기"`
      : ` type="button" data-idx="${i}" aria-label="${esc(r.cls)} ${esc(r.name)} 프로필 열기"`;
    const rank = ((CAST[r.name] || {}).stats || {}).np;
    const bar = master
      ? `<span class="win__bar"><span class="win__file">MASTER</span><span class="win__no">No.${no}</span></span>`
      : `<span class="win__bar"><span class="win__file">No.${no} — ${r.cls}</span><span class="note__rings" aria-hidden="true"></span></span>`;
    const art = sealed
      ? `<span class="cwin__art cwin__art--sealed"><span class="frost"></span><span class="frost frost--b"></span>${GLYPH_SEALED}</span>`
      : `<span class="cwin__art">${master ? masterGlyph(r) : r.glyph}</span>`;
    const name = sealed
      ? `${redact(4.4)}${redact(2.3)}<span class="sr">${master ? '마스터 미공개' : '진명 미공개'}</span>`
      : esc(who);
    const pair = sealed ? `${redact(3.6)}<span class="sr">미공개</span>` : esc(master ? r.name : r.master);
    const status = master
      ? [sealed ? '발급 — / —' : '발급 11/2026', `Status : ${sealed ? 'Void' : 'Contracted'}`]
      : [`보구 ${sealed ? '?' : esc(rank || '—')}`, `Status : ${sealed ? 'Sealed' : 'Summoned'}`];
    return `<${tag} class="cwin${master ? ' cwin--master' : ' cwin--note'}${sealed ? ' cwin--sealed' : ''}"${attrs}>
      ${bar}
      <span class="cwin__body">
        <span class="cwin__pic"><span class="cwin__block"></span>${art}<span class="cwin__no">${no}</span></span>
        <span class="cwin__id">
          <span class="cwin__kicker">${sealed && !master ? 'Access Denied' : master ? 'Identification Card' : 'Saint Graph'}</span>
          <span class="cwin__label">${master ? 'Name' : 'True Name'}</span>
          <span class="cwin__name">${name}</span>
          <span class="cwin__rows">
            <span class="cwin__row"><b>Class :</b>${r.cls}</span>
            <span class="cwin__row"><b>${master ? 'Servant :' : 'Master :'}</b>${pair}</span>
          </span>
          <span class="cwin__code">${barcodeSVG((sealed ? 'sealed' : '') + (who || r.cls) + (master ? '-m' : ''))}<small>UKH-6-${no}${master ? '-M' : ''}${sealed ? ' / SEALED' : ''}</small></span>
        </span>
      </span>
      <span class="win__status"><span>${status[0]}</span><span>${status[1]}</span></span>
      ${sealed ? `<span class="idc__stamp" aria-hidden="true">${master ? '미발급' : '미공개'}</span>` : ''}
    </${tag}>`;
  }
  $('#cardList').innerHTML   = ROSTER.map(r => `<li>${winHTML(r, 'servant')}</li>`).join('');
  $('#masterList').innerHTML = ROSTER.map(r => `<li>${winHTML(r, 'master')}</li>`).join('');
  $('#castCount').textContent = `${pad2(ROSTER.length)} object(s)`;

  // 서번트 / 마스터 보기 전환
  const segS = $('#segServant'), segM = $('#segMaster');
  function showSide(side) {
    const m = side === 'master';
    segS.setAttribute('aria-pressed', String(!m));
    segM.setAttribute('aria-pressed', String(m));
    $('#cardList').hidden = m;
    $('#masterList').hidden = !m;
  }
  segS.addEventListener('click', () => showSide('servant'));
  segM.addEventListener('click', () => showSide('master'));
  $('#hudCount').textContent = `${lines.length}/${ROSTER.length}`;
  $('#tileCount').textContent = lines.length;
  $('#rosterCount').textContent = `${lines.length} / ${ROSTER.length}`;
  $('#rosterGrid').innerHTML = ROSTER.map((r, k) =>
    `<span class="roster__cell${r.name ? ' is-on' : ''}"><i aria-hidden="true"></i>${r.cls.slice(0, 3)}</span>`).join('');

  document.addEventListener('click', e => {
    const card = e.target.closest('button.card, button.cwin');
    if (!card) return;
    if (card.dataset.master != null) openProfile(Number(card.dataset.master), 'master');
    else openProfile(Number(card.dataset.idx));
  });

  /* ── 6. 소환 ────────────────────────────────────────── */
  const fx       = $('#fx');
  const fxResult = $('#fxResult');
  const fxTitle  = $('#fxTitle');
  const pullsEl  = $('#pulls');
  let fxTimer = null;
  let fxFocus = null;
  let lastPull = 1;

  function summon(count) {
    lastPull = count;
    // 1회는 공개된 서번트 가운데 하나, 7회는 일곱 클래스 전부
    const picks = count === 1
      ? [lines[Math.floor(Math.random() * lines.length)]]
      : ROSTER.slice();
    pullsEl.className = 'pulls' + (count === 1 ? ' pulls--one' : '');
    pullsEl.innerHTML = picks.map((r, i) =>
      `<li class="pull" style="--i:${i}"><span class="pull__back" aria-hidden="true">✦</span>${cardHTML(r)}</li>`
    ).join('');
    fxTitle.textContent = count === 1
      ? '서번트가 부름에 응했다'
      : `일곱 기 가운데 ${lines.length}기가 부름에 응했다`;
    if (fx.hidden) fxFocus = document.activeElement;
    fxResult.hidden = true;
    fx.hidden = false;
    fx.className = 'fx is-charge';
    window.clearTimeout(fxTimer);
    fxTimer = window.setTimeout(showResult, reduce ? 0 : 1700);
  }
  function showResult() {
    window.clearTimeout(fxTimer);
    fxTimer = null;
    fx.className = 'fx is-result';
    fxResult.hidden = false;
    $('#fxClose').focus({ preventScroll: true });
  }
  function closeFx() {
    window.clearTimeout(fxTimer);
    fxTimer = null;
    fx.hidden = true;
    if (fxFocus && fxFocus.focus) fxFocus.focus();
  }
  $('#pull1').addEventListener('click', () => summon(1));
  $('#pull7').addEventListener('click', () => summon(7));
  $('#fxAgain').addEventListener('click', () => summon(lastPull));
  $('#fxClose').addEventListener('click', closeFx);
  fx.addEventListener('click', () => { if (fxTimer) showResult(); });   // 연출 건너뛰기

  /* ── 7. 서곡 — 스토리 재생 ──────────────────────────
     스크립트는 prologue.js. 위에서부터 한 줄씩 실행한다.
     배경·연출을 기다리는 동안에는 눌러도 넘어가지 않는다. */
  const SCRIPT = window.PROLOGUE || [];
  const ASSETS = Object.assign({ bg: {}, sfx: {}, cg: {} }, window.PROLOGUE_ASSETS || {});
  const vnp      = $('#vnp');
  const vnpPage  = $('#vnpPage');
  const vnpFx    = $('#vnpFx');
  const vnpPlace = $('#vnpPlace');
  const vnpLetter = $('#vnpLetter');
  const vnpCg    = $('#vnpCg');
  const vnpTitle = $('#vnpTitle');
  const vnpLog   = $('#vnpLog');
  const vnpAutoB = $('#vnpAuto');
  const vnpSkipB = $('#vnpSkip');
  const vnpLogB  = $('#vnpLogBtn');
  const bgLayers = [$('#vnpBgA'), $('#vnpBgB')];
  const TYPE_MS = 34;

  let at = -1;              // 지금 실행 중인 줄
  let holding = false;      // 연출을 기다리는 중
  let ready = false;        // 지금 보이는 것을 다 보여 주었는가
  let vTyper = null, vTyped = null;
  let vWait = null, vAuto = null;
  let autoOn2 = false, skipOn = false;
  let bgFront = 0;
  let vnpFocus = null;
  const vLog = [];

  // ── 임시 배경 ── 그림이 들어오면 ASSETS.bg 가 대신한다
  // 같은 모양이 매번 나오게 고정된 난수를 쓴다
  function rng(seed) {
    return () => {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  // 기와지붕 마을 실루엣
  function townSVG(seed, lit) {
    const r = rng(seed);
    let houses = '', wins = '';
    for (let x = -30; x < 1630;) {
      const w = 90 + r() * 90, h = 60 + r() * 70, base = 790 + r() * 30;
      const top = base - h, eave = 14 + r() * 10, peak = 26 + r() * 26;
      houses += `<rect x="${x.toFixed(0)}" y="${top.toFixed(0)}" width="${w.toFixed(0)}" height="${(900 - top).toFixed(0)}"/>`;
      houses += r() < .55
        ? `<path d="M${(x - eave).toFixed(0)} ${top.toFixed(0)} L${(x + w / 2).toFixed(0)} ${(top - peak).toFixed(0)} L${(x + w + eave).toFixed(0)} ${top.toFixed(0)}Z"/>`
        : `<path d="M${(x - eave).toFixed(0)} ${top.toFixed(0)} L${(x + w * .22).toFixed(0)} ${(top - peak * .8).toFixed(0)} L${(x + w * .78).toFixed(0)} ${(top - peak * .8).toFixed(0)} L${(x + w + eave).toFixed(0)} ${top.toFixed(0)}Z"/>`;
      const n = r() < .5 ? 1 : 2;
      for (let k = 0; k < n; k++) {
        if (r() > lit) continue;
        const wx = x + 14 + r() * (w - 44), wy = top + 16 + r() * (h - 44);
        wins += `<rect class="art__win" style="--d:${(1.5 + r() * 9).toFixed(1)}s" x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="${(16 + r() * 10).toFixed(0)}" height="${(14 + r() * 8).toFixed(0)}"/>`;
      }
      x += w + 6 + r() * 26;
    }
    return `<svg class="art__town" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice">
      <path class="art__ridge art__ridge--far" d="M0 520 C200 440 360 470 520 430 C700 380 860 450 1040 410 C1240 360 1400 430 1600 400 L1600 900 L0 900Z"/>
      <path class="art__ridge" d="M0 610 C240 550 420 600 640 570 C860 540 1060 600 1300 565 C1440 545 1520 570 1600 560 V900 H0Z"/>
      <g class="art__houses">${houses}</g><g class="art__wins">${wins}</g></svg>`;
  }
  // 큰 봉투는 실제 봉투처럼 겹을 쌓는다 (아래에서 위로)
  //   안쪽 면 → 열린 덮개 → 편지지 → 앞 주머니 → 금박 이름 → 닫힌 덮개 → 봉인
  // 덮개는 뒤집히는 도중에 편지지 뒤로 넘어가고, 편지지는 주머니 위로 빠져나온다
  const envelopeHTML = (big) => big
    ? `<div class="art__env art__env--big">
        <span class="art__env-back"></span>
        <span class="art__env-flap"></span>
        <span class="art__env-sheet"></span>
        <span class="art__env-front"></span>
        <span class="art__env-name">마스터 귀하</span>
        <span class="art__env-seal"></span>
      </div>`
    : `<div class="art__env"><span class="art__env-flap"></span></div>`;
  const ROOM = () => `<div class="art__roomwin"></div><div class="art__beam"></div><div class="art__table"></div>${envelopeHTML(false)}`;
  const ART = {
    black:    () => '',
    ukiha:    () => `<div class="art__sky"></div>${townSVG(7, .75)}<div class="art__dusk"></div>`,
    room:     ROOM,
    envelope: () => `<div class="art__desk"></div>${envelopeHTML(true)}`,
    montage:  () => `<div class="art__pan">${townSVG(19, .9)}</div>`,
    void:     () => '',
    alley:    () => `<div class="art__wall art__wall--l"></div><div class="art__wall art__wall--r"></div>
                     <div class="art__lamp"></div><div class="art__glass"><span></span></div><div class="art__road"></div>`,
    windows:  () => {
      let w = ''; const r = rng(31);
      for (let i = 0; i < 24; i++) w += `<span class="art__pane${i === 15 ? ' is-dark' : ''}" style="--d:${(r() * 4).toFixed(1)}s"></span>`;
      return `<div class="art__facade">${w}</div><div class="art__focus"></div>`;
    },
    pov:      () => ROOM() + `<div class="art__mark">${GLYPH_MASTER}</div>`,
  };

  // 그림 위에 얹는 연출 — 그림이 들어간 장면에만
  const OVER = {
    // 같은 거리의 밤 그림을 겹쳐 두었다가 nightfall 에서 번지게 한다
    ukiha: () => ASSETS.bg.ukihaNight ? `<div class="art__night" style="background-image:url('${ASSETS.bg.ukihaNight}')"></div>` : '',
    // 흐리게 당긴 탁자 위에 큰 봉투 — 봉투가 열리고 색종이가 떨어지는 연출이 그대로 쓰인다
    envelope: () => envelopeHTML(true),
    // 안내문 뒤로 우키하 곳곳이 차례로 교차한다 — 넘기는 건 montageTick
    montage: () => MONT.map(src => `<div class="art__cross" style="background-image:url('${src}')"></div>`).join(''),
    // 골목 — 유리창에 비치는 형상 (fx: glass)
    alley: () => `<div class="art__reflect"><svg class="art__ghost" viewBox="0 0 100 160" aria-hidden="true">
        <path d="M57 8C73 8 83 21 82 37c0 7-2 12-4 16l3 7c-2 2-5 2-7 3 0 4-1 6-4 7-2 4 0 8 3 10 13 4 25 15 27 36v44H0v-44c2-19 15-31 30-35 6-2 8-7 8-12-6-4-10-11-11-19-4-1-6-4-4-8 2-14 12-34 34-34z"/>
      </svg></div>`,
    // 창문들 — 불 켜진 창 사이의 어두운 창 하나로 시선이 모인다 (그림 기준 위치)
    windows: () => '<div class="art__box43"><span class="art__darkwin" style="left:49.6%;top:44.8%"></span></div>',
    // 당신의 시점 — 탁자 앞, 영주가 새겨진 손등
    pov: () => `<div class="art__mark">${GLYPH_MASTER}</div>`,
  };
  const MONT = (ASSETS.montage && ASSETS.montage.length) ? ASSETS.montage
    : [ASSETS.bg.ukihaNight, ASSETS.bg.ukiha].filter(Boolean);
  // 그림이 있는 장면은 서곡을 열 때 미리 받아 둔다
  function preloadBg() {
    Object.values(ASSETS.bg).concat(MONT).filter(Boolean).forEach(src => { const i = new Image(); i.src = src; });
  }

  // 몽타주 — 방에서 시작해 우키하 곳곳을 5.5초마다 넘긴다.
  // 안내문 장면이 두 번 나오므로, 두 번째에는 보던 곳부터 이어 간다
  const MONT_FIRST = 2600, MONT_EVERY = 5500;
  let montAt = -1, montTimer = null;
  function montageStop() { window.clearTimeout(montTimer); montTimer = null; }
  function montageTick(layer) {
    const cards = $$('.art__cross', layer);
    if (!cards.length) return;
    montAt = (montAt + 1) % cards.length;
    cards.forEach((c, i) => c.classList.toggle('is-on', i === montAt));
    montTimer = window.setTimeout(() => montageTick(layer), MONT_EVERY);
  }

  function setBg(key) {
    const next = bgLayers[1 - bgFront], prev = bgLayers[bgFront];
    const src = ASSETS.bg[key];
    next.className = `vnp__bg is-${key}` + (src ? ' has-img' : '');
    next.style.backgroundImage = src ? `url("${src}")` : '';
    next.innerHTML = src ? (OVER[key] ? OVER[key]() : '') : (ART[key] ? ART[key]() : '');
    next.classList.add('is-front');
    prev.classList.remove('is-front');
    bgFront = 1 - bgFront;
    if (vnpFx.firstChild) {
      const out = document.createElement('div');
      out.className = 'fx-leave';
      while (vnpFx.firstChild) out.appendChild(vnpFx.firstChild);
      vnpFx.appendChild(out);
      window.setTimeout(() => out.remove(), reduce ? 0 : 1500);
    }
    vnp.dataset.scene = key;
    montageStop();
    if (key === 'montage' && !reduce && MONT.length) {
      if (montAt >= 0) { montAt--; montageTick(next); }          // 두 번째 — 보던 곳 다음부터 바로
      else montTimer = window.setTimeout(() => montageTick(next), MONT_FIRST);
    }
  }

  // ── 연출 ──
  function sealMask(src) {
    return `<span class="fx-seal fx-seal--img" style="-webkit-mask-image:url('${src}');mask-image:url('${src}')"></span>`;
  }
  // 그림 위의 한 점을 짚을 수 있게, 화면을 덮는 그림 크기의 틀을 만든다
  // (배경의 background-size:cover 와 같은 자리에 놓인다)
  const SPOT = 'left:50.1%;top:41.2%';    // 창밖 가로등 자리 — 그림 기준
  const photoBox = () => $('.fx-photo', vnpFx) || (vnpFx.insertAdjacentHTML('beforeend', '<div class="fx-photo"></div>'), $('.fx-photo', vnpFx));
  const FX = {
    light:    () => {
      if (!ASSETS.bg.window) return '<span class="fx-light"></span>';
      photoBox().insertAdjacentHTML('beforeend', `<span class="fx-light fx-light--spot" style="${SPOT}"></span>`);
      return null;
    },
    reveal:   () => {
      if (!ASSETS.bg.window) return FX.window();
      const box = photoBox();
      box.insertAdjacentHTML('afterbegin', `<span class="fx-photo__img fx-photo__img--dark" style="background-image:url('${ASSETS.bg.window}')"></span>`);
      box.classList.add('is-revealing');
      return null;
    },
    lighton:  () => {
      if (!ASSETS.bg.windowLit) return null;
      const box = photoBox();
      const spot = $('.fx-light--spot', box);
      spot && spot.remove();
      box.insertAdjacentHTML('beforeend', `<span class="fx-photo__img fx-photo__img--lit" style="background-image:url('${ASSETS.bg.windowLit}')"></span>`);
      return null;
    },
    nightfall: () => { const n = $('.vnp__bg.is-front .art__night', vnp); n && n.classList.add('is-on'); return null; },
    window:   () => '<span class="fx-window"><i></i></span>',
    open:     () => { const e = $('.art__env', vnp); e && e.classList.add('is-open'); return null; },
    confetti: () => '<span class="fx-confetti"></span>',
    // 어둠 속에서 붉은 문양이 하나씩 — 공개된 마스터 넷의 영주
    seals:    () => `<div class="fx-seals">${
      ['seal-ryuga', 'seal-mokuren', 'seal-lilian', 'seal-oz'].map(n => sealMask(`assets/img/${n}.png`)).join('')
    }</div>`,
    glass:    () => {
      const g = $('.vnp__bg.is-front .art__glass, .vnp__bg.is-front .art__reflect', vnp);
      g && g.classList.add('is-seen');
      return null;
    },
    sealdraw: () => `<div class="fx-dim"></div><div class="fx-mark">${GLYPH_MASTER.replace(/<path /g, '<path pathLength="1" ')}</div>`,
    sealfull: () => { const m = $('.fx-mark', vnp); m && m.classList.add('is-full'); return null; },
  };
  function runFx(name) {
    const f = FX[name];
    if (!f) return;
    const html = f();
    if (html) vnpFx.insertAdjacentHTML('beforeend', html);
  }

  function playSfx(key) {
    const src = ASSETS.sfx[key];
    if (!src || !bgmOn) return;
    try { const a = new Audio(src); a.volume = .7; a.play().catch(() => {}); } catch (e) { /* 무시 */ }
  }

  // ── 글 ──
  function clearPage() {
    vnpPage.innerHTML = '';
    vnpPage.classList.remove('is-on');
  }
  function hideCards() {
    vnpLetter.hidden = true;
    vnpCg.hidden = true;
    vnpTitle.hidden = true;
  }
  function pushVLog(text, kind) {
    vLog.push({ text, kind });
    $('#vnpLogList').innerHTML = vLog.map(l =>
      `<li class="${l.kind ? 'is-' + l.kind : ''}">${rich(l.text)}</li>`).join('');
  }
  function finishVType() {
    if (vTyper) { const t = vTyper; vTyper = null; t.finish(); }
  }
  function typeInto(el, text) {
    vTyped = { el, text };
    const t = typewriter(el, text, skipOn ? 0 : TYPE_MS, () => { vTyper = null; vTyped = null; markReady(); });
    if (!el.classList.contains('is-done')) vTyper = t;   // 바로 끝난 경우는 붙잡지 않는다
  }
  function addParagraph(text, kind) {
    hideCards();
    vnpPage.classList.add('is-on');
    $$('.vnp__p', vnpPage).forEach(p => p.classList.remove('is-last'));
    const p = document.createElement('p');
    p.className = 'vnp__p is-last' + (kind ? ' vnp__p--' + kind : '');
    vnpPage.appendChild(p);
    typeInto(p, text);     // 문장 전체가 투명하게 먼저 깔린다
    // 화면이 넘치면 지우고 새로 시작 — 전체 길이로 판단하므로 도중에 넘치지 않는다
    if (vnpPage.scrollHeight > vnpPage.clientHeight + 2 && vnpPage.children.length > 1) {
      $$('.vnp__p', vnpPage).forEach(x => { if (x !== p) x.remove(); });
    }
    pushVLog(text, kind);
  }

  // ── 진행 ──
  function markReady() {
    ready = true;
    window.clearTimeout(vAuto);
    if (skipOn) vAuto = window.setTimeout(next, 140);
    else if (autoOn2) {
      const len = vnpPage.lastElementChild ? vnpPage.lastElementChild.textContent.length : 20;
      vAuto = window.setTimeout(next, 1400 + len * 40);
    }
  }
  function hold(ms) {
    holding = true;
    vnp.classList.add('is-holding');
    vWait = window.setTimeout(() => {
      holding = false;
      vnp.classList.remove('is-holding');
      next();
    }, skipOn || reduce ? Math.min(ms, 120) : ms);
  }

  function next() {
    window.clearTimeout(vAuto);
    ready = false;
    for (;;) {
      at++;
      const s = SCRIPT[at];
      if (!s || s.end) { finishPrologue(); return; }

      if (s.bg)    { clearPage(); hideCards(); vnpPlace.classList.remove('is-on'); setBg(s.bg); continue; }
      if (s.clear) { clearPage(); hideCards(); vnpPlace.classList.remove('is-on'); continue; }
      if (s.fx)    { runFx(s.fx); continue; }
      if (s.sfx)   { playSfx(s.sfx); continue; }
      if (s.bgm != null) { bgmTo(s.bgm); continue; }
      if (s.place) {
        vnpPlace.innerHTML = rich(s.place);
        vnpPlace.classList.add('is-on');
        pushVLog(s.place, 'place');
        continue;
      }
      if (s.wait)  { hold(s.wait); return; }

      if (s.narr)   { addParagraph(s.narr); return; }
      if (s.notice) { addParagraph(s.notice, 'notice'); return; }
      if (s.letter) {
        clearPage(); hideCards();
        $('#vnpLetterText').innerHTML = rich(s.letter);
        vnpLetter.classList.toggle('is-hand', !!s.hand);
        vnpLetter.hidden = false;
        pushVLog(s.letter, 'letter');
        markReady();
        return;
      }
      if (s.cg) {
        clearPage(); hideCards();
        const src = ASSETS.cg[s.cg];
        vnpCg.classList.toggle('has-img', !!src);
        vnpCg.style.backgroundImage = src ? `url("${src}")` : '';
        $('#vnpCgText').textContent = src ? '' : s.text;
        vnpCg.hidden = false;
        pushVLog(s.text, 'cg');
        markReady();
        return;
      }
      if (s.title) {
        clearPage(); hideCards();
        vnpTitle.hidden = false;
        markReady();
        return;
      }
    }
  }

  function vnpAdvance() {
    if (holding) return;
    if (vTyper) { finishVType(); return; }
    if (ready) next();
  }

  function setAuto2(on) {
    autoOn2 = on;
    vnpAutoB.setAttribute('aria-pressed', String(on));
    if (on && skipOn) setSkip(false);
    window.clearTimeout(vAuto);
    if (on && ready) markReady();
  }
  function setSkip(on) {
    skipOn = on;
    vnpSkipB.setAttribute('aria-pressed', String(on));
    if (on && autoOn2) setAuto2(false);
    window.clearTimeout(vAuto);
    if (on) { if (vTyper) finishVType(); else if (ready) markReady(); }
  }
  function toggleVLog(open = vnpLog.hidden) {
    vnpLog.hidden = !open;
    vnpLogB.setAttribute('aria-expanded', String(open));
    if (open) { setAuto2(false); setSkip(false); vnpLog.scrollTop = vnpLog.scrollHeight; }
  }

  function resetPlayer() {
    window.clearTimeout(vWait); window.clearTimeout(vAuto);
    if (vTyper) { vTyper.stop(); vTyper = null; }
    vTyped = null; holding = false; ready = false; at = -1;
    setAuto2(false); setSkip(false);
    vLog.length = 0; $('#vnpLogList').innerHTML = '';
    toggleVLog(false);
    clearPage(); hideCards();
    vnpPlace.classList.remove('is-on');
    bgLayers.forEach(l => { l.className = 'vnp__bg'; l.innerHTML = ''; l.style.backgroundImage = ''; });
    vnpFx.innerHTML = '';
    montageStop(); montAt = -1;
    vnp.classList.remove('is-holding', 'is-leaving');
  }

  function openPrologue() {
    vnpFocus = document.activeElement;
    resetPlayer();
    stopTyping();               // 로비 대사 타이핑은 멈춰 둔다
    vnp.hidden = false;
    vnp.focus({ preventScroll: true });
    bgmTo(0);                   // 스크립트가 침묵으로 시작한다
    preloadBg();
    next();
  }
  function closePrologue() {
    resetPlayer();
    vnp.hidden = true;
    bgmTo(BGM_VOLUME);
    if (vnpFocus && vnpFocus.focus) vnpFocus.focus();
  }

  // 서곡을 끝까지 본 적이 있는지 — 스토리 목록에 표시
  function paintClear() {
    let seen = false;
    try { seen = window.localStorage.getItem('fe-prologue') === 'clear'; } catch (e) { /* 무시 */ }
    $('#chapterPrologue').classList.toggle('is-clear', seen);
    $('#chapterPrologueGo').textContent = seen ? '다시 보기' : '보기';
    $('#storyBadge').textContent = seen ? 'CLEAR' : 'NEW';
    $('#storyBadge').classList.toggle('is-clear', seen);
  }
  function finishPrologue() {
    try { window.localStorage.setItem('fe-prologue', 'clear'); } catch (e) { /* 무시 */ }
    paintClear();
    vnp.classList.add('is-leaving');
    window.setTimeout(() => {
      closePrologue();
      go('summon');             // "소환에 관한 페이지를 펼친다" → 첫 플레이
    }, reduce ? 0 : 900);
  }
  paintClear();

  vnp.addEventListener('click', e => {
    if (e.target.closest('.vnp__bar, .vnp__log')) return;
    vnpAdvance();
  });
  // 막대 버튼을 누른 뒤에도 스페이스·엔터가 이야기를 넘기도록 초점을 되돌린다
  const refocus = () => vnp.focus({ preventScroll: true });
  vnpAutoB.addEventListener('click', () => { setAuto2(!autoOn2); refocus(); });
  vnpSkipB.addEventListener('click', () => { setSkip(!skipOn); refocus(); });
  vnpLogB.addEventListener('click', () => { toggleVLog(); if (vnpLog.hidden) refocus(); });
  $('#vnpClose').addEventListener('click', closePrologue);
  $('#bannerPrologue').addEventListener('click', openPrologue);
  $('#chapterPrologue').addEventListener('click', openPrologue);

  /* ── 8. 프로필 ──────────────────────────────────────── */
  const pf      = $('#profile');
  const pfPanel = $('.profile__panel');
  const pfClose = $('#pfClose');
  const pfScrim = $('#pfScrim');

  const STATS = [
    ['근력','str'], ['내구','end'], ['민첩','agi'],
    ['마력','mgi'], ['행운','lck'], ['보구','np'],
  ];
  const TABS = [
    ['#tabStatus', '#paneStatus'],
    ['#tabLore',   '#paneLore'],
    ['#tabSkill',  '#paneSkill'],
    ['#tabNp',     '#paneNp'],
  ].map(([t, p]) => ({ tab: $(t), pane: $(p) }));

  let pfIndex = -1;
  let pfMode = 'servant';      // 'servant' | 'master'
  let lastFocus = null;

  // 마스터 프로필에는 스킬·보구 탭이 없다. 보이는 탭만 돈다
  const visibleTabs = () => TABS.filter(t => !t.tab.hidden);
  function showTab(i) {
    TABS.forEach((t, n) => {
      const on = n === i;
      t.tab.setAttribute('aria-selected', String(on));
      t.tab.tabIndex = on ? 0 : -1;
      t.pane.hidden = !on;
    });
  }
  function stepTab(delta) {
    const vis = visibleTabs();
    const at = vis.findIndex(t => t.tab.getAttribute('aria-selected') === 'true');
    const next = vis[(at + delta + vis.length) % vis.length];
    showTab(TABS.indexOf(next));
    next.tab.focus();
  }
  TABS.forEach((t, i) => t.tab.addEventListener('click', () => showTab(i)));

  const metaRow = (label, value, id) =>
    `<div><dt>${label}</dt><dd${id ? ` id="${id}"` : ''}>${value}</dd></div>`;
  const linkBtn = (text, attr) =>
    `<button class="pf-link" type="button" ${attr}>${esc(text)}</button>`;

  function loreHTML(lore) {
    return (lore && lore.length)
      ? lore.map(bl => '<section>'
          + (bl.heading ? `<h4 class="lore__heading">${esc(bl.heading)}</h4>` : '')
          + loreTable(bl.table)
          + prose(bl.text)
          + '</section>').join('')
      : '<p class="is-empty">—</p>';
  }

  // 랭크 → 칸 수 (E 1 · D 2 · C 3 · B 4 · A 5 · EX 6). +/- 는 글자로만
  const RANK_LV = { E: 1, D: 2, C: 3, B: 4, A: 5, EX: 6 };
  const rankLevel = r => RANK_LV[String(r || '').replace(/[+\-]/g, '').trim().toUpperCase()] || 0;
  const meter = lv => `<span class="meter" aria-hidden="true">${
    Array.from({ length: 6 }, (_, k) => `<i${k < lv ? ' class="on"' : ''}></i>`).join('')}</span>`;

  // 창 제목줄 · 신분증 칸 · 재생 바
  function setChrome(item, m) {
    const no = noOf(item);
    $('#pfWinTitle').textContent = `No.${no} — ${m ? 'MASTER' : item.cls}`;
    $('#pfFileNo').textContent = `p.${no}`;
    $('#pfKicker').textContent = m ? 'Identification Card' : 'Saint Graph';
    $('#pfNo').textContent = no;
    $('#pfCode').innerHTML = barcodeSVG(m ? item.master : item.name) + `<small>UKH-6-${no}${m ? '-M' : ''}</small>`;
    $('#pfTrack').textContent = `p.${no} · ${m ? item.master : item.name}`;
  }

  function setMode(mode) {
    pfMode = mode;
    const m = mode === 'master';
    $('#tabStatus').textContent = m ? '프로필' : '스테이터스';
    $('#tabSkill').hidden = m;
    $('#tabNp').hidden = m;
    $('#pfStats').hidden = m;
    $('#pfArch').classList.toggle('profile__arch--master', m);
    pf.dataset.mode = mode;
  }

  function fillServant(index) {
    const item = lines[index];
    const c = CAST[item.name] || {};
    const s = c.stats || {};
    setMode('servant');

    $('#pfGlyph').innerHTML    = item.glyph;
    $('#pfCredit').hidden = true;
    $('#pfClass').textContent  = item.cls;
    $('#pfName').textContent   = item.name;
    $('#pfMeta').innerHTML =
        metaRow('마스터', linkBtn(item.master, `data-to-master="${index}"`), 'pfMaster')
      + metaRow('성별', esc(dash(c.gender)), 'pfGender')
      + metaRow('속성', esc(dash(c.alignment)), 'pfAlign')
      + metaRow('신장 / 체중', esc(`${dash(c.height)} / ${dash(c.weight)}`), 'pfSize');
    $('#pfQuoteBox').hidden = false;
    $('#pfQuote').textContent  = `「${item.line}」`;
    $('#pfBio').innerHTML      = prose(c.bio);

    $('#pfStats').innerHTML = STATS.map(([label, key]) =>
      `<li><span class="profile__stat-label">${label}</span>` + meter(rankLevel(s[key])) +
      `<span class="profile__stat-rank">${esc(dash(s[key]))}</span></li>`
    ).join('');
    setChrome(item, false);

    // 이명·종별은 적어 둔 캐릭터에게만 줄이 생긴다
    $('#pfNpMeta').innerHTML = [
      ['보구명', dash(c.npName), 'pfNpName'],
      ['이명',   c.npAlias,      'pfNpAlias'],
      ['종별',   c.npType,       'pfNpType'],
      ['랭크',   dash(s.np),     'pfNpRank'],
      ['렌지',   c.npRange,      'pfNpRange'],
      ['최대포착', c.npTargets,   'pfNpTargets'],
    ].filter(([, v]) => v).map(([k, v, id]) =>
      `<div><dt>${k}</dt><dd id="${id}">${esc(v)}</dd></div>`).join('');
    $('#pfNpText').innerHTML = prose(c.np);

    $('#pfSkills').innerHTML = (c.skills && c.skills.length)
      ? c.skills.map(sk => `<li class="skill">
          <p class="skill__kind">${esc(sk.kind)}</p>
          <p class="skill__name">${esc(sk.name)}<span class="skill__rank">${esc(sk.rank)}</span></p>
          ${sk.title ? `<p class="skill__title">${esc(sk.title)}</p>` : ''}
          <div class="profile__prose">${prose(sk.text)}</div>
        </li>`).join('')
      : '<li class="skill"><p class="is-empty">—</p></li>';

    $('#pfLore').innerHTML = loreHTML(c.lore);
  }

  function fillMaster(index) {
    const item = lines[index];
    const m = MASTERS[item.master] || {};
    setMode('master');

    $('#pfGlyph').innerHTML    = masterGlyph(item);
    $('#pfCredit').hidden = !item.masterGlyphCredit;
    $('#pfCredit').textContent = item.masterGlyphCredit ? `영주 디자인 ${item.masterGlyphCredit}` : '';
    $('#pfClass').textContent  = `${item.cls} · MASTER`;
    $('#pfName').textContent   = item.master;
    $('#pfMeta').innerHTML =
        metaRow('서번트', linkBtn(item.name, `data-to-servant="${index}"`), 'pfServant')
      + metaRow('성별', esc(dash(m.gender)), 'pfGender')
      + metaRow('나이', esc(dash(m.age)), 'pfAge')
      + metaRow('신장 / 체중', esc(`${dash(m.height)} / ${dash(m.weight)}`), 'pfSize')
      + metaRow('소속', esc(dash(m.affiliation)), 'pfAffil')
      + metaRow('마술', esc(dash(m.magic)), 'pfMagic');
    const line = (m.line || '').trim();
    $('#pfQuoteBox').hidden = !line;
    $('#pfQuote').textContent = line ? `「${line}」` : '';
    $('#pfBio').innerHTML  = prose(m.bio);
    $('#pfLore').innerHTML = loreHTML(m.lore);
    setChrome(item, true);
  }

  function fillProfile(index, mode = pfMode) {
    if (!lines[index]) return;
    pfIndex = index;
    mode === 'master' ? fillMaster(index) : fillServant(index);
    $('#pfCount').textContent = `${index + 1} / ${lines.length}`;
    showTab(0);
    $('#pfBody').scrollTop = 0;
  }

  function openProfile(index, mode = 'servant') {
    if (!lines[index]) return;
    if (pf.hidden) lastFocus = document.activeElement;
    fillProfile(index, mode);
    pf.hidden = false;
    pfClose.focus();
  }
  function closeProfile() {
    pf.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function stepProfile(delta) {
    const next = (pfIndex + delta + lines.length) % lines.length;
    fillProfile(next);
    feature(next);     // 로비의 대표 서번트도 같이 바꾼다
  }
  // 서번트 ↔ 마스터 바로 넘어가기
  $('#pfMeta').addEventListener('click', e => {
    const b = e.target.closest('.pf-link');
    if (!b) return;
    if (b.dataset.toMaster  != null) fillProfile(Number(b.dataset.toMaster), 'master');
    if (b.dataset.toServant != null) fillProfile(Number(b.dataset.toServant), 'servant');
    pfClose.focus();
  });

  pfClose.addEventListener('click', closeProfile);
  pfScrim.addEventListener('click', closeProfile);
  $('#pfPrev').addEventListener('click', () => stepProfile(-1));
  $('#pfNext').addEventListener('click', () => stepProfile(1));

  /* ── 9. 키보드 ──────────────────────────────────────── */
  document.addEventListener('keydown', e => {
    // 서곡 재생 중 — 넘기기 · 로그 · 나가기
    if (!vnp.hidden) {
      if (e.key === 'Escape') { if (!vnpLog.hidden) { toggleVLog(false); vnp.focus({ preventScroll: true }); } else closePrologue(); return; }
      if (!vnpLog.hidden) return;
      if (e.target.closest && e.target.closest('.vnp__bar')) return;   // 버튼 위에서는 버튼이 받는다
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault(); vnpAdvance();
      }
      return;
    }
    // 위에 뜬 창부터 닫는다: 프로필 → 소환 연출
    if (!pf.hidden) {
      if (e.key === 'Escape') { closeProfile(); return; }
      const inTabs = e.target.closest && e.target.closest('.profile__tabs');
      if (e.key === 'ArrowLeft')  inTabs ? stepTab(-1) : stepProfile(-1);
      if (e.key === 'ArrowRight') inTabs ? stepTab(1)  : stepProfile(1);
      if (e.key === 'Tab') {
        const f = Array.from(pfPanel.querySelectorAll('button'))
          .filter(b => b.tabIndex !== -1 && !b.hidden && b.offsetParent !== null);
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
      return;
    }
    if (e.key !== 'Escape') return;
    if (!fx.hidden) closeFx();
  });

  /* ── 10. 소식지 ──────────────────────────────────────── */
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
