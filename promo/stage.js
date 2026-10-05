// Promo timeline. seek(t) puts every layer, and the real app's state, at time t (seconds).
// Deterministic: the renderer calls seek() once per frame and screenshots.
(() => {
const DUR = 42;
const W = 390, H = 812;               // phone size from the prototype's .device
const $q = (s, r=document) => r.querySelector(s);
const clamp = x => Math.max(0, Math.min(1, x));
const io = x => { x = clamp(x); return x < .5 ? 4*x*x*x : 1 - Math.pow(-2*x + 2, 3)/2; };
const out = x => 1 - Math.pow(1 - clamp(x), 3);
const inn = x => Math.pow(clamp(x), 3);
const lerp = (a, b, p) => a + (b - a) * p;

// Keyframes: [[t, value], ...], eased between neighbours, held outside.
function kf(frames, t, ease = io){
  if (t <= frames[0][0]) return val(frames[0][1]);
  for (let i = 1; i < frames.length; i++){
    const [t1, v1] = frames[i];
    if (t <= t1){ const [t0, v0] = frames[i-1]; return lerp(val(v0), val(v1), ease((t - t0)/(t1 - t0 || 1))); }
  }
  return val(frames[frames.length-1][1]);
}
const val = v => typeof v === 'function' ? v() : v;

// ---------- Build the stage ----------
const P = document.createElement('div'); P.id = 'P';
P.innerHTML = `<div id="bg"><i class="b1"></i><i class="b2"></i><i class="b3"></i></div>
  <div id="chaos"></div><div id="chaosScrim"></div><div id="words"></div>
  <div id="title" class="center"></div>
  <div id="cap"></div>
  <div class="device phone phoneB" id="phoneB"><div class="screen" id="screenB"></div><div id="dockB"></div><div id="toastB"></div></div>
  <div class="plabel" id="labA">Alex · organizer</div><div class="plabel" id="labB">Riley · from the group chat</div>
  <div id="end" class="center"></div>
  <div class="touch" id="touch"></div><div class="ripple" id="ripple"></div>
  <div id="vig"></div>`;
document.body.appendChild(P);
const A = $q('#device'); A.classList.add('phone'); P.insertBefore(A, $q('#phoneB'));
const scrA = $q('#screen'), B = $q('#phoneB'), scrB = $q('#screenB');

const logo = `<div class="biglogo">traveler<span class="md">.md</span></div>`;

// ---------- Cold open ----------
const tab = (logoKey, url) => `<div class="tab"><span class="fav"><img src="${IMG[logoKey]}"></span>${url}<span class="x">×</span></div>`;
const shot = (img, name, price, q) => `<div class="shot"><img src="${IMG[img]}"><div>${name}<span class="${q?'q':''}">${price}</span></div></div>`;
const bub = (av, who, text) => `<div class="bub"><img src="${IMG[av]}"><p><b>${who}</b>${text}</p></div>`;
const CHAOS = [
  [tab('logoAirbnb','airbnb.com/rooms/48213377'), 420, 150, -4, .05],
  [tab('logoBooking','booking.com/hotel/pt/central-residence…'), 1480, 130, 3, .3],
  [shot('imgGarden','Garden','€1,080'), 230, 470, -7, .5],
  [bub('av3','Sam','this one??'), 700, 260, 0, .8],
  [tab('logoExpedia','expedia.com/Lisbon-Hotels-Riverside-Flat…'), 1420, 930, -2, .95],
  [shot('imgCentral','Central','€1,170'), 1660, 470, 6, 1.15],
  [`<div class="file"><i></i>Lisbon_options_v3_FINAL.xlsx</div>`, 1180, 250, -3, 1.35],
  [bub('av2','Jordan','too noisy for me'), 1330, 760, 0, 1.55],
  [shot('imgRiverside','Riverside','€990 + ?', true), 640, 850, 5, 1.7],
  [tab('logoAirbnb','airbnb.com/rooms/51990284'), 330, 980, 2, 1.95],
  [bub('av4','Riley','any is fine'), 470, 700, 0, 2.15],
  [`<div class="file"><i class="png"></i>IMG_4471.PNG</div>`, 1700, 300, 4, 2.3],
  [bub('av1','Alex','did anyone check the fee?'), 1210, 1010, 0, 2.5],
  [tab('logoBooking','booking.com/searchresults.html?city=…'), 1560, 640, -5, 2.65],
];
$q('#chaos').innerHTML = CHAOS.map(c => `<div class="ci">${c[0]}</div>`).join('');
const chaosEls = [...document.querySelectorAll('#chaos .ci')];
const WORDS = [['12 tabs.', .25], ['3 sites.', 1.05], ['1 group chat.', 1.85], ['0 decisions.', 2.65, 'c']];
$q('#words').innerHTML = WORDS.map(w => `<div class="${w[2]||''}">${w[0]}</div>`).join('');
const wordEls = [...document.querySelectorAll('#words div')];

// ---------- Title and end card ----------
const titleWords = ['Pick', 'a', 'stay', '<span class="grad">together.</span>'];
$q('#title').innerHTML = `<div class="ln">${logo}</div><div class="title">${titleWords.map(w => `<span>${w}</span>`).join(' ')}</div><div class="ln tsub">Group wishlists, inside trip.md</div>`;
$q('#end').innerHTML = `<div class="ln">${logo}</div><div class="ln title" style="font-size:132px">Pick a stay <span class="grad">together.</span></div><div class="ln endsub">One list from every site. One decision. Remembered in trip.md.</div>`;

// ---------- Captions ----------
const L = s => `<div class="ln">${s}</div>`;
const CAPS = [
  [6.6, 11.0, L(`<div class="kicker">01 · trip.md</div>`) + L(`<div class="hl">Start from what matters.</div>`) + L(`<div class="sb">Alex's saved preferences show up as suggestions. Keep them, or skip them for this trip.</div>`)],
  [11.0, 16.6, L(`<div class="kicker">02 · Save</div>`) + L(`<div class="hl">Paste from any site.</div>`) + L(`<div class="sb">One list, priced for your dates.</div>`) + L(`<div class="logos"><span><img src="${IMG.logoAirbnb}"></span><span><img src="${IMG.logoBooking}"></span><span><img src="${IMG.logoExpedia}"></span></div>`)],
  [16.6, 21.2, L(`<div class="kicker">03 · Review</div>`) + L(`<div class="hl">Honest prices.</div>`) + L(`<div class="sb">An unknown fee is never “cheapest”. Riverside fits only if the fee is €210 or less.</div>`)],
  [21.2, 26.0, L(`<div class="kicker">04 · Memory</div>`) + L(`<div class="hl">Memory that informs, never decides.</div>`) + L(`<div class="sb">“Quiet at night” flags Central's street noise. Only Alex sees it.</div>`)],
  [26.0, 33.0, L(`<div class="kicker">05 · Decide</div>`) + L(`<div class="hl">Tap every stay you'd be happy with.</div>`) + L(`<div class="sb">No app, no account. The overlap wins.</div>`)],
  [33.0, 37.7, L(`<div class="kicker">06 · Done</div>`) + L(`<div class="hl">Decided. And remembered.</div>`) + `<div class="ln" data-at="35.0"><div class="code"><div class="fh"><b>trip.md</b><span>Lisbon</span></div><pre id="code"></pre><div class="tools" id="tools">Read by <span>Claude</span><span>ChatGPT</span><span>Codex</span></div></div></div>`],
];
const CODE = [['## Status','h2'],['- Booking','hi'],['## Accommodation','h2'],['- Chosen: Garden Apartment (Airbnb)',''],['  €1,080 incl. fees · 3 of 4 happy','']];

// ---------- App state beats ----------
// State at time t = fresh() plus every beat with beat.t <= t. Rebuilt only when that count changes.
const share = (who, key, text) => S.shares.push({who, key, text, src: who==='jordan' ? 'shared from Jordan’s traveler.md' : 'added while voting'});
const BEATS = [
  [8.75, () => { S.prefs.walk.paused = true; S.startSeen = true; }],
  [11.3, () => { S.sheet = {type:'add', value:''}; }],
  [13.15, () => { S.sheet = {type:'import', id:'central', step:0}; }],
  [13.5, () => { S.sheet.step = 1; }], [13.85, () => { S.sheet.step = 2; }], [14.2, () => { S.sheet.step = 3; }], [14.55, () => { S.sheet.step = 4; }],
  [15.3, () => { S.sheet = null; S.saved.push('central'); }],
  [15.95, () => { S.saved.push('riverside'); }],
  [22.1, () => { S.sheet = {type:'memory', id:'central'}; }],
  [26.0, () => { S.sheet = null; }],
  [26.1, () => { S.sheet = {type:'share'}; }],
  [27.65, () => { S.sheet = null; S.shared = true; S.seen.jordan = S.seen.sam = S.seen.riley = true; }],
  [30.05, () => { S.votes.riley = ['garden']; }],
  [30.6, () => { S.votes.jordan = ['garden']; S.notes.jordan = {id:'garden', text:'Quiet street, we’ll actually sleep'}; share('jordan','quiet','Quiet at night'); }],
  [31.4, () => { S.votes.sam = ['central','garden']; S.notes.sam = {id:'central', text:'Central is my favourite, but Garden works too'}; share('sam','walk','Close to everything'); }],
  [32.25, () => { S.rileyDone = true; }],
  [34.0, () => { S.sheet = {type:'choose', id:'garden'}; }],
  [35.25, () => { S.sheet = null; S.decided = 'garden'; S.screen = 'decided'; }],
];
// Bottom sheet motion: [t, 'in' | 'out'].
const SHEET = [[11.3,'in'],[15.0,'out'],[22.1,'in'],[25.7,'out'],[26.1,'in'],[27.35,'out'],[34.0,'in'],[34.95,'out']];
// Taps: [t, selector, phone]. The touch shows just before and ripples on t.
const TAPS = [
  [8.7, '#screen [data-act=relevance][data-k=walk][data-v=off]'],
  [13.05, '#sheet .field .btn'],
  [14.95, '#sheet [data-act=confirmImport]'],
  [22.0, '#screen [data-card=central] .foryou'],
  [27.3, '#sheet [data-act=doShare]'],
  [30.0, '#screenB [data-card=garden] .in-btn'],
  [32.15, '#dockB .btn'],
  [33.9, '#screen .banner [data-act=askChoose]'],
  [34.9, '#sheet [data-act=decide]'],
];
const TYPING = [[11.8, 12.85, '#linkInput', 'https://www.booking.com/hotel/pt/central-residence-lisboa.html']];
const toastHtml = (who, html) => `<div class="toast"><img src="${IMG[PEOPLE_INFO[who].av]}" alt=""><span>${html}</span></div>`;
const TOASTS = [
  [15.95, 17.2, `<div class="toast"><img src="${IMG.imgRiverside}" alt=""><span><b>Riverside Flat</b> added from Expedia</span></div>`],
  [30.6, 31.35, toastHtml('jordan', '<b>Jordan</b> is happy with Garden Apartment')],
  [31.4, 32.6, toastHtml('sam', '<b>Sam</b> is happy with Central and Garden')],
  [35.5, 37.3, `<div class="toast"><span>Result posted to the group chat</span></div>`],
];

// Scroll targets inside a phone screen, measured from the live DOM.
function yOf(scr, sel, pad){
  const el = $q(sel, scr); if (!el) return scr.scrollTop;
  const s = scr.getBoundingClientRect().height / scr.offsetHeight;
  return Math.max(0, Math.min(scr.scrollHeight - scr.clientHeight, (el.getBoundingClientRect().top - scr.getBoundingClientRect().top)/s + scr.scrollTop - pad));
}
const SCROLL_A = [
  [15.3, 0], [16.3, () => yOf(scrA, '.sechead', 14)],
  [16.6, () => yOf(scrA, '.sechead', 14)], [17.5, () => yOf(scrA, '[data-card=riverside]', 40)],
  [20.6, () => yOf(scrA, '[data-card=riverside]', 40)], [21.5, () => yOf(scrA, '[data-card=central]', 150)],
  [27.65, () => yOf(scrA, '[data-card=central]', 150)], [28.5, () => yOf(scrA, '.banner', 64)],
];
const SCROLL_B = [[29.0, () => yOf(scrB, '[data-card=garden]', 70)]];

let applied = -1, scrollYA = 0, scrollYB = 0;
function applyState(t){
  const n = BEATS.filter(b => b[0] <= t).length;
  if (n === applied) return false;
  applied = n;
  S = fresh();
  BEATS.slice(0, n).forEach(b => b[1]());
  render();
  const v = S.view; S.view = 'riley';
  scrB.innerHTML = rileyScreen(); $q('#dockB').innerHTML = dock();
  S.view = v;
  return true;
}

// Phone transform: centre (cx, cy), scale s, focus point (fx, fy) relative to the phone centre.
function place(el, cx, cy, s, fx=0, fy=0, o=1){
  el.style.transform = `translate(${cx - W/2}px,${cy - H/2}px) scale(${s}) translate(${-fx}px,${-fy}px)`;
  el.style.opacity = o;
}
function localCenter(phone, el){
  const pr = phone.getBoundingClientRect(), er = el.getBoundingClientRect(), s = pr.width / W;
  return [((er.left + er.width/2) - (pr.left + pr.width/2))/s, ((er.top + er.height/2) - (pr.top + pr.height/2))/s];
}

const tapCache = {};
function seek(t){
  // Background drift
  const [b1, b2, b3] = document.querySelectorAll('#bg i');
  b1.style.transform = `translate(${-200 + Math.sin(t*.25)*120}px,${-260 + Math.cos(t*.2)*80}px)`;
  b2.style.transform = `translate(${1100 + Math.cos(t*.18)*140}px,${420 + Math.sin(t*.22)*90}px)`;
  b3.style.transform = `translate(${700 + Math.sin(t*.3)*200}px,${-200 + Math.cos(t*.27)*60}px)`;

  // Cold open
  const collapse = io((t - 3.55)/0.6);
  chaosEls.forEach((el, i) => {
    const [, x, y, r, at] = CHAOS[i];
    const p = out((t - at)/0.4);
    const dx = Math.sin(t*.9 + i)*7, dy = Math.cos(t*.7 + i*1.3)*6;
    const X = lerp(x + dx, 960, collapse), Y = lerp(y + dy, 540, collapse);
    el.style.transform = `translate(${X}px,${Y}px) translate(-50%,-50%) rotate(${r*(1-collapse)}deg) scale(${(0.7 + 0.3*p)*(1 - 0.85*collapse)})`;
    el.style.opacity = p * (1 - inn((t - 3.75)/0.4));
  });
  $q('#chaosScrim').style.opacity = clamp(t/0.4) * (1 - clamp((t - 3.7)/0.4));
  wordEls.forEach((el, i) => {
    const at = WORDS[i][1], next = WORDS[i+1] ? WORDS[i+1][1] : 3.6;
    const p = out((t - at)/0.3), q = i < 3 ? clamp((t - next)/0.12) : io((t - 3.55)/0.45);
    el.style.opacity = t < at ? 0 : p * (1 - q);
    el.style.transform = `scale(${(1.18 - 0.18*p) * (i < 3 ? 1 : 1 - 0.7*q)})`;
  });

  // Title
  const tt = $q('#title'), tOut = io((t - 6.0)/0.45);
  tt.style.opacity = t < 4.1 || t > 6.6 ? 0 : 1 - tOut;
  tt.style.transform = `translateY(${-40*tOut}px) scale(${1 + .03*tOut})`;
  [...tt.querySelectorAll('.title span:not(.grad)')].forEach((sp, i) => {
    const p = out((t - 4.3 - i*0.1)/0.55);
    sp.style.transform = `translateY(${(1-p)*70}px)`; sp.style.opacity = p;
  });
  const lns = tt.querySelectorAll(':scope > .ln');
  lns[0].style.opacity = out((t - 4.2)/0.5);
  lns[1].style.opacity = out((t - 4.9)/0.5); lns[1].style.transform = `translateY(${(1 - out((t - 4.9)/0.5))*20}px)`;

  // App state
  applyState(t);

  // Phone labels in the two-phone shot
  const lab = out((t - 29.3)/0.5) * (1 - io((t - 32.7)/0.3));
  const lx = kf([[28.4, 1300], [29.2, 1065], [33.0, 1065], [33.7, 1300]], t), lbx = kf([[28.6, 2420], [29.4, 1575], [33.0, 1575], [33.6, 2420]], t);
  $q('#labA').style.cssText = `opacity:${lab};transform:translate(${lx}px,968px) translateX(-50%)`;
  $q('#labB').style.cssText = `opacity:${lab};transform:translate(${lbx}px,968px) translateX(-50%)`;

  // Scrolling
  scrA.scrollTop = S.screen === 'decided' ? 0 : kf(SCROLL_A, t);
  scrB.scrollTop = S.rileyDone ? 0 : kf(SCROLL_B, t);

  // Phone A
  let ax = 1300, ay = kf([[6.15, 1560], [7.0, 540], [37.6, 540], [38.3, 620]], t), as = kf([[28.4, 1.12], [29.2, 1.0], [33.0, 1.0], [33.7, 1.12], [37.6, 1.12], [38.3, 1.0]], t);
  ax = kf([[28.4, 1300], [29.2, 1065], [33.0, 1065], [33.7, 1300]], t);
  const ao = 1 - io((t - 37.7)/0.5);
  // Honest-prices zoom onto Riverside's budget line
  const z = kf([[17.6, 0], [18.5, 1], [20.3, 1], [21.0, 0]], t);
  let fx = 0, fy = 0;
  if (z > 0){ const el = $q('#screen [data-card=riverside] .budget'); if (el){ place(A, ax, ay, as); const c = localCenter(A, el); fx = c[0]*z; fy = c[1]*z; } }
  place(A, ax, ay, as * (1 + 0.8*z), fx, fy, ao);
  A.style.visibility = t < 6.1 || t > 38.3 ? 'hidden' : 'visible';

  // Phone B (Riley)
  const bx = kf([[28.6, 2420], [29.4, 1575], [33.0, 1575], [33.6, 2420]], t);
  place(B, bx, 540, 1.0);
  B.style.visibility = t < 28.5 || t > 33.7 ? 'hidden' : 'visible';


  // Sheet motion
  const last = SHEET.filter(s => s[0] <= t).pop();
  const scrim = $q('#sheet .scrim'), sheet = $q('#sheet .sheet');
  if (scrim && sheet && last){
    const p = last[1] === 'in' ? out((t - last[0])/0.32) : 1 - io((t - last[0])/0.3);
    sheet.style.transform = `translateY(${(1 - p)*105}%)`;
    scrim.style.background = `rgba(0,0,0,${.55*p})`;
  }

  // Typing
  TYPING.forEach(([t0, t1, sel, text]) => {
    const el = $q(sel); if (!el || t < t0 - 1 || t > t1 + 2) return;
    el.value = text.slice(0, Math.round(text.length * clamp((t - t0)/(t1 - t0))));
    el.scrollLeft = 1e5;
  });

  // Toasts (phone A)
  const tst = TOASTS.find(x => t >= x[0] && t < x[1]);
  const tEl = $q('#toast');
  if (tst){
    if (tEl.dataset.k !== String(tst[0])){ tEl.innerHTML = tst[2]; tEl.dataset.k = tst[0]; }
    const p = out((t - tst[0])/0.25) * (1 - clamp((t - (tst[1] - 0.2))/0.2));
    const node = tEl.firstElementChild; node.style.opacity = p; node.style.transform = `translateY(${(1-p)*-14}px)`;
  } else { tEl.innerHTML = ''; tEl.dataset.k = ''; }

  // Touch indicator
  const touch = $q('#touch'), rip = $q('#ripple');
  touch.style.opacity = 0; rip.style.opacity = 0;
  const tap = TAPS.find(([tt]) => t >= tt - 0.4 && t <= tt + 0.5);
  if (tap){
    const [tt, sel] = tap, el = $q(sel);
    if (el){ const r = el.getBoundingClientRect(); tapCache[tt] = [r.left + r.width/2, r.top + r.height/2]; }
    const pos = tapCache[tt];
    if (pos){
      const pre = out((t - (tt - 0.4))/0.25), post = clamp((t - tt)/0.35);
      const press = t >= tt - 0.06 && t < tt + 0.1 ? 0.82 : 1;
      touch.style.opacity = pre * (1 - post);
      touch.style.transform = `translate(${pos[0]}px,${pos[1]}px) scale(${(1.25 - 0.25*pre) * press})`;
      if (t >= tt){ const rp = out((t - tt)/0.45); rip.style.opacity = 0.7*(1 - rp); rip.style.transform = `translate(${pos[0]}px,${pos[1]}px) scale(${0.6 + 1.8*rp})`; }
    }
  }

  // Captions
  const cap = $q('#cap'), c = CAPS.find(x => t >= x[0] && t < x[1]);
  if (!c){ cap.innerHTML = ''; cap.dataset.k = ''; }
  else {
    if (cap.dataset.k !== String(c[0])){ cap.innerHTML = c[2]; cap.dataset.k = c[0]; }
    cap.style.transform = `translateY(-50%)`;
    const q = io((t - (c[1] - 0.4))/0.35);
    [...cap.children].forEach((ln, i) => {
      const at = ln.dataset.at ? +ln.dataset.at : c[0] + 0.2 + i*0.12;
      const p = out((t - at)/0.55);
      ln.style.opacity = p * (1 - q);
      ln.style.transform = `translateY(${(1 - p)*30 - q*16}px)`;
    });
  }
  const code = $q('#code');
  if (code){
    const total = CODE.reduce((n, l) => n + l[0].length + 1, 0);
    let left = Math.round(total * clamp((t - 35.4)/1.4));
    code.innerHTML = CODE.map(([s, cls]) => { const k = Math.max(0, Math.min(s.length, left)); left -= s.length + 1; return k ? `<span class="${cls}">${s.slice(0, k)}</span>` : ''; }).filter(Boolean).join('\n');
    $q('#tools').style.opacity = out((t - 36.8)/0.4);
  }

  // End card
  const end = $q('#end');
  end.style.opacity = t < 38.0 ? 0 : 1;
  [...end.children].forEach((ln, i) => {
    const p = out((t - 38.1 - i*0.18)/0.7);
    ln.style.opacity = p; ln.style.transform = `translateY(${(1-p)*36}px)`;
  });
}

window.seek = seek;
window.PROMO = {DUR};
seek(0);
})();
