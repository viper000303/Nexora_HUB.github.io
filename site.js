
var B44 = {};
B44.FULL = 'width:100%;height:100%;box-sizing:border-box;';
B44.hexToRgb = function (h) {
  h = String(h || '#000000').replace('#', '');
  if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
  var n = parseInt(h.slice(0, 6), 16);
  if (isNaN(n)) n = 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
B44.rgbToHex = function (c) {
  return '#' + c.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join('').toUpperCase();
};
B44.isColor = function (v) { return typeof v === 'string' && v.charAt(0) === '#'; };
B44.lerpColor = function (a, b, t) {
  var A = B44.hexToRgb(a), B = B44.hexToRgb(b);
  return B44.rgbToHex([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]);
};
B44.ease = function (name, t) {
  if (name === 'ease-in') return t * t * t;
  if (name === 'ease-out') return 1 - Math.pow(1 - t, 3);
  if (name === 'ease-in-out') return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  return t;
};
B44.sample = function (kfs, t) {
  if (!kfs || !kfs.length) return undefined;
  var k = kfs.slice().sort(function (a, b) { return a.t - b.t; });
  if (t <= k[0].t) return k[0].v;
  var last = k[k.length - 1];
  if (t >= last.t) return last.v;
  for (var i = 0; i < k.length - 1; i++) {
    var a = k[i], b = k[i + 1];
    if (t >= a.t && t <= b.t) {
      if (a.ease === 'step') return a.v;
      var p = b.t === a.t ? 1 : (t - a.t) / (b.t - a.t);
      var e = B44.ease(a.ease, p);
      if (B44.isColor(a.v) && B44.isColor(b.v)) return B44.lerpColor(a.v, b.v, e);
      return Number(a.v) + (Number(b.v) - Number(a.v)) * e;
    }
  }
  return last.v;
};
B44.resolve = function (obj, t) {
  var out = {}, k;
  for (k in obj) out[k] = obj[k];
  var kf = obj.keyframes || {};
  for (k in kf) { var v = B44.sample(kf[k], t); if (v !== undefined) out[k] = v; }
  return out;
};
B44.rgba = function (hex, a) { var c = B44.hexToRgb(hex); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; };
B44.luminance = function (hex) {
  var c = B44.hexToRgb(hex).map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
B44.muteIconColor = function (m) {
  if (m.autoContrast === false) return m.iconColor || '#FFFFFF';
  return B44.luminance(m.bgColor || '#111111') > 0.35 ? '#111111' : '#FFFFFF';
};
B44.css = function (o) {
  var s = '';
  for (var k in o) { if (o[k] == null || o[k] === '') continue; s += k.replace(/[A-Z]/g, function (m) { return '-' + m.toLowerCase(); }) + ':' + o[k] + ';'; }
  return s;
};
B44.esc = function (s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
};
B44.justify = function (a) { return a === 'left' ? 'flex-start' : a === 'right' ? 'flex-end' : 'center'; };
B44.outer = function (e) {
  return { left: e.x + 'px', top: e.y + 'px', width: e.w + 'px', height: e.h + 'px', transform: 'rotate(' + (e.rotation || 0) + 'deg) scale(' + (e.scale == null ? 1 : e.scale) + ')', opacity: e.opacity == null ? 1 : e.opacity };
};
B44.text = function (e) {
  return { color: e.color, fontFamily: e.fontFamily, fontSize: (e.fontSize || 16) + 'px', fontWeight: e.bold ? '700' : '400', fontStyle: e.italic ? 'italic' : 'normal', textAlign: e.align || 'left', letterSpacing: (e.letterSpacing || 0) + 'px', lineHeight: String(e.lineHeight || 1.2), whiteSpace: 'pre-wrap', wordBreak: 'break-word' };
};
B44.box = function (e) {
  return { background: e.filled === false ? 'transparent' : e.fill, border: e.borderWidth > 0 ? e.borderWidth + 'px solid ' + e.borderColor : 'none', borderRadius: e.shape === 'circle' ? '50%' : (e.borderRadius || 0) + 'px' };
};
B44.label = function (e) {
  if (!e.text) return '';
  return '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:' + B44.justify(e.align) + ';padding:8px;box-sizing:border-box;' + B44.css(B44.text(e)) + '">' + B44.esc(e.text) + '</div>';
};
B44.shape = function (e) {
  var s = e.shape || 'rectangle', bw = Number(e.borderWidth) || 0, body;
  if (s === 'triangle' || s === 'line') {
    var w = Math.max(1, e.w), h = Math.max(1, e.h), g;
    if (s === 'line') g = '<line x1="0" y1="' + h / 2 + '" x2="' + w + '" y2="' + h / 2 + '" stroke="' + e.borderColor + '" stroke-width="' + Math.max(1, bw) + '" stroke-linecap="round"/>';
    else g = '<polygon points="' + w / 2 + ',' + bw + ' ' + (w - bw) + ',' + (h - bw) + ' ' + bw + ',' + (h - bw) + '" fill="' + (e.filled === false ? 'none' : e.fill) + '" stroke="' + (bw > 0 ? e.borderColor : 'none') + '" stroke-width="' + bw + '" stroke-linejoin="round"/>';
    body = '<svg width="100%" height="100%" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" style="display:block;overflow:visible">' + g + '</svg>';
  } else body = '<div style="' + B44.FULL + B44.css(B44.box(e)) + '"></div>';
  return '<div style="position:relative;' + B44.FULL + '">' + body + B44.label(e) + '</div>';
};
B44.FS_ICON = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>';
B44.game = function (e, ctx) {
  var src = ctx.gameSrc ? ctx.gameSrc(e) : '';
  var name = ctx.gameName ? ctx.gameName(e) : 'Game';
  var rad = 'border-radius:' + (e.borderRadius || 0) + 'px;';
  if (!src) return '<div class="b44-game" style="' + B44.FULL + rad + 'background:#000;color:#8E96A4;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;font:600 18px Inter,sans-serif"><svg width="56" height="56" viewBox="0 0 24 24" fill="#6E56CF"><polygon points="6 3 20 12 6 21 6 3"/></svg>' + B44.esc(name) + '</div>';
  return '<div class="b44-game" style="position:relative;' + B44.FULL + rad + 'overflow:hidden;background:#000"><iframe class="b44-game-frame" src="' + B44.esc(src) + '" title="' + B44.esc(name) + '" allow="autoplay; fullscreen; gamepad" allowfullscreen style="border:0;width:100%;height:100%;display:block"></iframe>' + (e.showFullscreen === false ? '' : '<button type="button" class="b44-fs" aria-label="Toggle fullscreen">' + B44.FS_ICON + '</button>') + '</div>';
};
B44.inner = function (e, ctx) {
  if (e.type === 'text') return '<div style="' + B44.FULL + B44.css(B44.text(e)) + '">' + B44.esc(e.text) + '</div>';
  if (e.type === 'image') {
    var src = ctx.asset(e.src), r = 'border-radius:' + (e.borderRadius || 0) + 'px;';
    if (src) return '<img src="' + B44.esc(src) + '" alt="' + B44.esc(e.alt || '') + '" draggable="false" style="' + B44.FULL + r + 'display:block;object-fit:' + (e.fit || 'cover') + '">';
    return '<div style="' + B44.FULL + r + 'display:flex;align-items:center;justify-content:center;background:#2A2E37;color:#8E96A4;font:14px Inter,sans-serif">No image selected</div>';
  }
  if (e.type === 'button') return '<button type="button" class="b44-btn" style="' + B44.FULL + B44.css(B44.box(e)) + B44.css(B44.text(e)) + 'display:flex;align-items:center;justify-content:' + B44.justify(e.align) + ';padding:0 12px;margin:0;cursor:pointer">' + B44.esc(e.text) + '</button>';
  if (e.type === 'shape') return B44.shape(e);
  if (e.type === 'game') return B44.game(e, ctx);
  return '';
};
B44.bg = function (p, assetUrl) {
  var img = p.bgImage ? assetUrl(p.bgImage) : '';
  return { backgroundColor: p.bgColor || '#FFFFFF', backgroundImage: img ? 'url("' + img + '")' : 'none', backgroundSize: p.bgSize || 'cover', backgroundPosition: p.bgPosition || 'center', backgroundRepeat: p.bgSize === 'auto' ? 'repeat' : 'no-repeat' };
};
B44.overlay = function (p) { return { backgroundColor: B44.rgba(p.overlayColor || '#000000', p.overlayOpacity || 0) }; };
B44.mute = function (m, W, H) {
  var o = {}, k;
  for (k in m) o[k] = m[k];
  o.size = Math.max(24, Math.min(Number(m.size) || 56, W, H));
  var r = (Number(m.rotation) || 0) * Math.PI / 180;
  var ext = (m.radius == null || m.radius >= 50) ? o.size / 2 : o.size * (Math.abs(Math.cos(r)) + Math.abs(Math.sin(r))) / 2;
  var cx = Math.max(ext, Math.min(W - ext, (Number(m.x) || 0) + o.size / 2));
  var cy = Math.max(ext, Math.min(H - ext, (Number(m.y) || 0) + o.size / 2));
  o.x = cx - o.size / 2; o.y = cy - o.size / 2;
  return o;
};
B44.muteOuter = function (m) { return { left: m.x + 'px', top: m.y + 'px', width: m.size + 'px', height: m.size + 'px', transform: 'rotate(' + (m.rotation || 0) + 'deg)' }; };
B44.muteInner = function (m, muted) {
  var ic = B44.muteIconColor(m);
  var bg = '<span style="position:absolute;inset:0;border-radius:' + (m.radius == null ? 50 : m.radius) + '%;background:' + B44.rgba(m.bgColor || '#111111', m.bgOpacity == null ? 1 : m.bgOpacity) + '"></span>';
  var waves = muted ? '<line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/>' : '<path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>';
  return bg + '<svg viewBox="0 0 24 24" width="56%" height="56%" fill="none" stroke="' + ic + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position:relative;display:block;opacity:1"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="' + ic + '"/>' + waves + '</svg>';
};

(function () {
  var S = window.B44_SITE, CFG = window.B44_CFG || {}, ROOT = window.B44_ROOT || '';
  if (!S) return;
  var W = S.canvas.width, H = S.canvas.height, assets = {}, games = {};
  S.assets.forEach(function (a) { assets[a.id] = a; });
  S.games.forEach(function (g) { games[g.id] = g; });
  var branchMap = {};
  (S.branches || []).forEach(function (b) { if (!branchMap[b.sourceId]) branchMap[b.sourceId] = []; branchMap[b.sourceId].push(b); });
  function res(p) { if (!p) return ''; return /^(https?:|blob:|data:)/.test(p) ? p : ROOT + p; }
  function assetUrl(id) { var a = assets[id]; return a ? res(a.src) : ''; }
  var ctx = {
    asset: assetUrl,
    gameSrc: function (e) { var g = games[e.gameId]; if (!g) return ''; if (CFG.gameSrc && CFG.gameSrc[g.id]) return CFG.gameSrc[g.id]; return g.externalUrl || res(g.src); },
    gameName: function (e) { var g = games[e.gameId]; return g ? g.name : 'Game unavailable'; }
  };

  var muted = false, live = [], music = null, dirty = true;
  try { muted = localStorage.getItem('b44-muted') === '1'; } catch (err) {}
  function track(a) { a.muted = muted; live.push(a); return a; }
  function untrack(a) { live = live.filter(function (x) { return x !== a; }); }
  function playSound(id, vol) {
    var a = assets[id]; if (!a || S.soundsEnabled === false) return;
    var el = track(new Audio(res(a.src)));
    el.volume = vol != null ? vol : (a.volume == null ? 1 : a.volume);
    el.addEventListener('ended', function () { untrack(el); });
    var p = el.play(); if (p && p.catch) p.catch(function () {});
  }
  function setMusic(pg) {
    var id = S.soundsEnabled === false ? null : pg.music;
    if (music && music.__id === id) { music.volume = pg.musicVolume == null ? 0.6 : pg.musicVolume; return; }
    if (music) { music.pause(); untrack(music); music = null; }
    if (!id || !assets[id]) return;
    music = track(new Audio(res(assets[id].src)));
    music.__id = id; music.loop = true;
    music.volume = pg.musicVolume == null ? 0.6 : pg.musicVolume;
    var p = music.play();
    if (p && p.catch) p.catch(function () {
      var go = function () { window.removeEventListener('pointerdown', go, true); if (music) music.play().catch(function () {}); };
      window.addEventListener('pointerdown', go, true);
    });
  }
  function muteFrame(fr) {
    try {
      var w = fr.contentWindow, d = fr.contentDocument; if (!w || !d) return;
      if (!w.__b44) {
        w.__b44 = { ctx: [], m: null };
        var MP = w.HTMLMediaElement && w.HTMLMediaElement.prototype;
        if (MP) { var op = MP.play; MP.play = function () { if (muted) this.muted = true; return op.apply(this, arguments); }; }
        var AC = w.AudioContext || w.webkitAudioContext;
        if (AC) {
          var Wr = function (o) { var c = new AC(o); w.__b44.ctx.push(c); if (muted) c.suspend(); return c; };
          Wr.prototype = AC.prototype; w.AudioContext = Wr; w.webkitAudioContext = Wr;
        }
      }
      var changed = w.__b44.m !== muted; w.__b44.m = muted;
      if (muted || changed) { var ms = d.querySelectorAll('audio,video'); for (var i = 0; i < ms.length; i++) ms[i].muted = muted; }
      if (changed) w.__b44.ctx.forEach(function (c) { if (muted) { if (c.state === 'running') c.suspend(); } else if (c.state === 'suspended') c.resume(); });
      if (changed) w.postMessage({ type: 'b44-mute', muted: muted }, '*');
    } catch (err) { try { fr.contentWindow.postMessage({ type: 'b44-mute', muted: muted }, '*'); } catch (e2) {} }
  }
  function syncGames() { var f = document.querySelectorAll('iframe.b44-game-frame'); for (var i = 0; i < f.length; i++) muteFrame(f[i]); }
  setInterval(syncGames, 1000);
  function setMuted(v) {
    muted = v;
    try { localStorage.setItem('b44-muted', v ? '1' : '0'); } catch (err) {}
    live.forEach(function (a) { a.muted = v; });
    syncGames(); dirty = true;
  }

  var root = document.getElementById('b44-root');
  var page, stage, bgEl, ovEl, muteEl, muteHtml = '', nodes = [], raf = 0, t = 0, start = null, playing = true;
  function byId(id) { for (var i = 0; i < S.pages.length; i++) if (S.pages[i].id === id) return S.pages[i]; return null; }
  function setStyle(n, o) { for (var k in o) n.style[k] = o[k]; }
  function layer(cls) { var d = document.createElement('div'); d.className = cls; stage.appendChild(d); return d; }
  function press(w) { w.classList.remove('b44-press'); void w.offsetWidth; w.classList.add('b44-press'); }
  function fullscreen(el) {
    var d = document;
    if (d.fullscreenElement || d.webkitFullscreenElement) { (d.exitFullscreen || d.webkitExitFullscreen).call(d); return; }
    var f = el.requestFullscreen || el.webkitRequestFullscreen; if (f) f.call(el);
  }
  function go(id, tr, dur, ease) {
    var p = byId(id); if (!p) return;
    if (CFG.spa) {
      if (tr && tr !== 'none' && dur > 0) {
        stage.style.transition = 'opacity ' + dur + 's ' + (ease || 'ease');
        stage.style.opacity = '0';
        setTimeout(function () { mount(id); requestAnimationFrame(function () { stage.style.opacity = '1'; }); }, dur * 1000);
      } else mount(id);
    } else window.location.href = res(p.path);
  }
  function execActions(b) {
    (b.actions || []).forEach(function (a) {
      if (a.type === 'page' && a.pageId) go(a.pageId, b.transition, b.transitionDuration, b.transitionEasing);
      else if ((a.type === 'url' || a.type === 'urlNewTab') && a.url) {
        var u = /^[a-z]+:|^\/\//i.test(a.url) ? a.url : 'https://' + a.url;
        window.open(u, '_blank', 'noopener');
      } else if (a.type === 'sound' && a.soundId) playSound(a.soundId);
      else if (a.type === 'back') history.back();
      else if (a.type === 'forward') history.forward();
      else if (a.type === 'togglePlay') { playing = !playing; start = null; dirty = true; }
      else if (a.type === 'restart') { t = 0; start = null; playing = true; dirty = true; }
      else if (a.type === 'showElement' || a.type === 'hideElement' || a.type === 'toggleElement') {
        var node = nodes.find(function (n) { return n.e.id === a.elementId; });
        if (node) { if (a.type === 'showElement') node.n.style.display = ''; else if (a.type === 'hideElement') node.n.style.display = 'none'; else node.n.style.display = node.n.style.display === 'none' ? '' : 'none'; }
      } else if (a.type === 'scrollElement') {
        var n2 = nodes.find(function (n) { return n.e.id === a.elementId; });
        if (n2) n2.n.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }
  function fireBranch(b, w) {
    if (!b.enabled || b.locked) return;
    if (b.sound) playSound(b.sound, b.soundVolume);
    var d = (b.delay || 0) * 1000;
    if (d > 0) setTimeout(function () { execActions(b); }, d); else execActions(b);
  }
  function act(e) {
    if (e.clickSound) playSound(e.clickSound);
    var a = e.action || {};
    if (a.type === 'url' && a.url) {
      var u = /^[a-z]+:|^\/\//i.test(a.url) ? a.url : 'https://' + a.url;
      if (a.newTab || CFG.spa) window.open(u, '_blank', 'noopener'); else window.location.href = u;
    } else if (a.type === 'page' && a.pageId) go(a.pageId);
    else if (a.type === 'sound' && a.soundId) playSound(a.soundId);
    else if (a.type === 'restart') { t = 0; start = null; playing = true; dirty = true; }
    else if (a.type === 'toggle') { playing = !playing; start = null; }
  }
  function fit() {
    if (!stage) return;
    var s = Math.min(window.innerWidth / W, window.innerHeight / H);
    stage.style.transform = 'scale(' + s + ')';
    stage.style.left = (window.innerWidth - W * s) / 2 + 'px';
    stage.style.top = (window.innerHeight - H * s) / 2 + 'px';
  }
  window.addEventListener('resize', fit);
  function mount(id) {
    page = byId(id) || S.pages[0];
    document.title = page.name + (S.name ? ' · ' + S.name : '');
    cancelAnimationFrame(raf);
    root.innerHTML = '';
    stage = document.createElement('div'); stage.className = 'b44-stage';
    stage.style.width = W + 'px'; stage.style.height = H + 'px';
    bgEl = layer('b44-bg'); ovEl = layer('b44-overlay');
    nodes = page.elements.map(function (e) {
      var n = layer('b44-el'), w = document.createElement('div');
      w.className = 'b44-wrap' + (e.type === 'button' ? ' b44-hv-' + (e.hover || 'darken') : '');
      n.appendChild(w);
      if (e.type === 'button') w.addEventListener('click', function () { press(w); act(e); });
      var bs = branchMap[e.id] || [];
      if (e.type !== 'button' && bs.some(function (b) { return b.trigger === 'click' || b.trigger === 'dblclick'; })) w.style.cursor = 'pointer';
      bs.forEach(function (b) {
        var fire = function () { if (e.type === 'button') press(w); fireBranch(b, w); };
        if (b.trigger === 'click') w.addEventListener('click', fire);
        else if (b.trigger === 'dblclick') w.addEventListener('dblclick', fire);
        else if (b.trigger === 'mouseenter') w.addEventListener('mouseenter', fire);
        else if (b.trigger === 'mouseleave') w.addEventListener('mouseleave', fire);
      });
      return { e: e, n: n, w: w, html: '' };
    });
    muteEl = document.createElement('button'); muteEl.type = 'button'; muteEl.className = 'b44-mute'; muteHtml = '';
    muteEl.addEventListener('click', function (ev) { ev.stopPropagation(); setMuted(!muted); });
    stage.appendChild(muteEl);
    stage.addEventListener('click', function (ev) { var b = ev.target.closest && ev.target.closest('.b44-fs'); if (b) fullscreen(b.parentNode); });
    root.appendChild(stage);
    t = 0; start = null; playing = true; dirty = true;
    fit(); setMusic(page);
    raf = requestAnimationFrame(loop);
  }
  function apply() {
    var pb = B44.resolve(page, t);
    setStyle(bgEl, B44.bg(pb, assetUrl)); setStyle(ovEl, B44.overlay(pb));
    document.body.style.background = pb.bgColor || '#000';
    nodes.forEach(function (o) {
      var r = B44.resolve(o.e, t);
      setStyle(o.n, B44.outer(r));
      var h = B44.inner(r, ctx);
      if (h !== o.html) {
        o.html = h; o.w.innerHTML = h;
        var fr = o.w.querySelector('iframe');
        if (fr) fr.addEventListener('load', function () { muteFrame(fr); });
      }
    });
    var m = B44.mute(B44.resolve(S.mute, t), W, H);
    setStyle(muteEl, B44.muteOuter(m));
    var mh = B44.muteInner(m, muted);
    if (mh !== muteHtml) { muteHtml = mh; muteEl.innerHTML = mh; }
    muteEl.setAttribute('aria-label', muted ? 'Unmute website audio' : 'Mute website audio');
  }
  function loop(ts) {
    var d = page.duration || 5;
    if (playing) {
      if (start === null) start = ts - t * 1000;
      t = (ts - start) / 1000;
      if (t >= d) { if (page.loop) { t = t % d; start = ts - t * 1000; } else { t = d; playing = false; } }
      dirty = true;
    }
    if (dirty) { apply(); dirty = false; }
    raf = requestAnimationFrame(loop);
  }
  mount(window.B44_PAGE || (S.pages[0] && S.pages[0].id));
})();
