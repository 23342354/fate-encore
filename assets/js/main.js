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
  const seal = src => `<img class="seal" src="${src}" alt="" loading="lazy" decoding="async">`;
  const GLYPH_SEALED =
    '<svg viewBox="0 0 64 64" fill="currentColor" stroke="none"><path d="M32 13a10 10 0 1 1 0 20 10 10 0 0 1 0-20z"/><path d="M13 55c0-11 8.5-17 19-17s19 6 19 17z"/></svg>';

  const ROSTER = [
    { cls: 'SABER' },
    { cls: 'ARCHER', name: '도로시', master: '이치노세 류가',
      line: '저를 기다린 사람은 없었어도 제가 기다린 사람들은 있었으니까요.',
      glyph: svg('<path d="M18 12 q22 20 0 40"/><path d="M18 12 L18 52"/><path d="M22 32 L50 32"/><path d="M44 26 l6 6 -6 6"/>') },
    { cls: 'LANCER' },
    { cls: 'RIDER' },
    { cls: 'CASTER', name: '오스카 조로아스터', master: '마키오카 모쿠렌',
      masterGlyph: seal('assets/img/seal-mokuren.png'),
      line: '어서 와. 먼 길을 걸어온 사람에게는 그만한 기적이 필요한 법이지.',
      glyph: svg('<path d="M20 52 L44 20"/><circle cx="46" cy="16" r="5"/><path d="M14 30 l6 -6 6 6 -6 6 z"/><path d="M40 46 l4 -4 4 4 -4 4 z"/>') },
    { cls: 'ASSASSIN', name: '로드', master: '릴리안 루스텔리아',
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
  let fadeTimer = null;
  try { bgmOn = window.localStorage.getItem('fe-bgm') !== 'off'; } catch (e) { /* 저장소를 못 쓰는 환경 */ }

  function paintBgm() {
    btnBgm.setAttribute('aria-pressed', String(bgmOn));
    btnBgm.setAttribute('aria-label', bgmOn ? '배경음악 끄기' : '배경음악 켜기');
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
    if (p && p.then) p.then(() => fadeTo(BGM_VOLUME)).catch(() => {});
    else fadeTo(BGM_VOLUME);
  }
  function stopBgm() { fadeTo(0, () => bgm.pause()); }

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

  function start() {
    if (started) return;
    started = true;
    playBgm();      // 타이틀을 누른 그 순간이라야 브라우저가 소리를 허락한다
    title.classList.add('is-gone');
    game.hidden = false;
    // 한 박자 뒤에 켜야 페이드가 걸린다
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => game.classList.add('is-on')));
    go(location.hash.slice(1), false);
    window.setTimeout(() => feature(opening), reduce ? 50 : 500);
    const first = $('.dock__btn[aria-current="page"]');
    first && first.focus({ preventScroll: true });
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
    if (typer) { window.clearInterval(typer); typer = null; }
  }
  function finishLine(text) {
    stopTyping();
    speechText.textContent = text;
    speechText.classList.add('is-done');
  }
  function type(text) {
    stopTyping();
    speechText.classList.remove('is-done');
    if (reduce) { finishLine(text); return; }
    speechText.textContent = '';
    let i = 0;
    typer = window.setInterval(() => {
      speechText.textContent = text.slice(0, ++i);
      if (i >= text.length) finishLine(text);
    }, SPEED);
  }

  function feature(index) {
    const item = lines[index];
    if (!item) return;
    const changed = index !== current;
    current = index;
    $('#standGlyph').innerHTML    = item.glyph;
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
    if (typer) { finishLine(lines[current].line); return; }
    feature((current + 1) % lines.length);
  }
  $('#speech').addEventListener('click', advance);
  arch.addEventListener('click', advance);
  $('#standProfile').addEventListener('click', () => openProfile(current));
  $('#standMaster').addEventListener('click', () => openProfile(current, 'master'));

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
  function masterCardHTML(r) {
    if (!r.name) {
      return `<div class="card card--master card--sealed">
        <span class="card__art">
          <span class="card__class">${r.cls}</span>
          <span class="card__glyph" aria-hidden="true">${GLYPH_SEALED}</span>
          <span class="card__plate"><span class="card__name">마스터 미공개</span><span class="card__master">SERVANT 미공개</span></span>
        </span>
      </div>`;
    }
    return `<button class="card card--master" type="button" data-master="${lines.indexOf(r)}" aria-label="${esc(r.master)} 프로필 열기">
      <span class="card__art">
        <span class="card__class">${r.cls}</span>
        <span class="card__glyph" aria-hidden="true">${masterGlyph(r)}</span>
        <span class="card__plate"><span class="card__name">${esc(r.master)}</span><span class="card__master">SERVANT ${esc(r.name)}</span></span>
      </span>
    </button>`;
  }
  $('#cardList').innerHTML   = ROSTER.map(r => `<li>${cardHTML(r)}</li>`).join('');
  $('#masterList').innerHTML = ROSTER.map(r => `<li>${masterCardHTML(r)}</li>`).join('');

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

  document.addEventListener('click', e => {
    const card = e.target.closest('button.card');
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

  /* ── 7. 서곡 읽기 ───────────────────────────────────── */
  const reader = $('#reader');
  let rdFocus = null;
  function openReader() {
    rdFocus = document.activeElement;
    reader.hidden = false;
    $('.reader__panel').scrollTop = 0;
    $('#rdClose').focus();
  }
  function closeReader() {
    reader.hidden = true;
    if (rdFocus && rdFocus.focus) rdFocus.focus();
  }
  $('#bannerPrologue').addEventListener('click', openReader);
  $('#chapterPrologue').addEventListener('click', openReader);
  $('#rdClose').addEventListener('click', closeReader);
  $('#rdScrim').addEventListener('click', closeReader);

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

  function setMode(mode) {
    pfMode = mode;
    const m = mode === 'master';
    $('#tabStatus').textContent = m ? '프로필' : '스테이터스';
    $('#tabSkill').hidden = m;
    $('#tabNp').hidden = m;
    $('#pfStats').hidden = m;
    $('#pfArch').classList.toggle('profile__arch--master', m);
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
      `<li><span class="profile__stat-label">${label}</span>` +
      `<span class="profile__stat-rank">${esc(dash(s[key]))}</span></li>`
    ).join('');

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
  }

  function fillProfile(index, mode = pfMode) {
    if (!lines[index]) return;
    pfIndex = index;
    mode === 'master' ? fillMaster(index) : fillServant(index);
    $('#pfCount').textContent = `${index + 1} / ${lines.length}`;
    showTab(0);
    pfPanel.scrollTop = 0;
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
    // 위에 뜬 창부터 닫는다: 프로필 → 서곡 → 소환 연출
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
    if (!reader.hidden) closeReader();
    else if (!fx.hidden) closeFx();
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
