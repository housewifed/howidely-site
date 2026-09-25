(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rand = function (min, max) { return Math.random() * (max - min) + min; };
  var pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };

  /* ---------------------------------------------------- Year */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------------------------------------------------- Mobile menu */
  var menuBtn  = document.getElementById('menu-btn');
  var menu     = document.getElementById('mobile-menu');
  var iconOpen = document.getElementById('icon-open');
  var iconClose= document.getElementById('icon-close');

  function setMenu(open) {
    menu.classList.toggle('hidden', !open);
    iconOpen.classList.toggle('hidden', open);
    iconClose.classList.toggle('hidden', !open);
    menuBtn.setAttribute('aria-expanded', String(open));
  }
  menuBtn.addEventListener('click', function () {
    setMenu(menu.classList.contains('hidden'));
  });
  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  /* ---------------------------------------------------- Navbar shrink on scroll */
  var navbar = document.getElementById('navbar');
  var navScrolled = null, navTicking = false;
  function onScroll() {
    if (navTicking) return;
    navTicking = true;
    requestAnimationFrame(function () {
      var s = window.scrollY > 20;
      if (s !== navScrolled) {            // only touch the DOM when it actually changes
        navScrolled = s;
        navbar.classList.toggle('shadow-lg', s);
        navbar.classList.toggle('shadow-black/40', s);
      }
      navTicking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------- Scroll reveal */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.style.transitionDelay = Math.min(i * 70, 350) + 'ms';
        el.classList.add('is-visible');
        el.addEventListener('transitionend', function onEnd() {
          el.classList.add('is-done');
          el.style.transitionDelay = '';
          el.removeEventListener('transitionend', onEnd);
        });
        revObs.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function (el) { revObs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------------------------------------------- Scroll spy */
  var sections = ['about','history','abox','tak','roadmap','projects','leadership','contact'];
  var navLinks = {};
  document.querySelectorAll('.nav-link').forEach(function (link) {
    navLinks[link.getAttribute('href').slice(1)] = link;
  });
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        Object.keys(navLinks).forEach(function (k) { navLinks[k].classList.remove('active'); });
        var active = navLinks[entry.target.id];
        if (active) active.classList.add('active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) spy.observe(el);
    });
  }

  /* ---------------------------------------------------- Count-up stats */
  var counters = document.querySelectorAll('[data-count]');
  function runCounter(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1400, start = performance.now();
    function step(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(step);
    }
    if (reduceMotion) { el.textContent = target + suffix; return; }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var cObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCounter(e.target); cObs.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cObs.observe(el); });
  } else {
    counters.forEach(runCounter);
  }

  /* ---------------------------------------------------- Skill bars */
  var bars = document.querySelectorAll('.skill-bar');
  if ('IntersectionObserver' in window) {
    var bObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        el.style.width = '100%';
        el.style.transformOrigin = 'left';
        el.style.transform = 'scaleX(0)';
        el.style.transition = 'transform 1.2s cubic-bezier(.2,.7,.3,1)';
        requestAnimationFrame(function () {
          el.style.transform = 'scaleX(' + (parseFloat(el.getAttribute('data-width')) / 100) + ')';
        });
        bObs.unobserve(el);
      });
    }, { threshold: 0.6 });
    bars.forEach(function (el) { bObs.observe(el); });
  } else {
    bars.forEach(function (el) { el.style.width = el.getAttribute('data-width'); });
  }

  /* ---------------------------------------------------- Clocks */
  function pad(n) { return String(n).padStart(2, '0'); }
  function tickClocks() {
    var d = new Date();
    var utc = pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds());
    var sarClock = document.getElementById('sar-clock');
    if (sarClock) sarClock.textContent = utc + 'Z';
    var navClock = document.getElementById('status-clock');
    if (navClock) navClock.textContent = utc + ' UTC';
  }
  tickClocks();
  setInterval(tickClocks, 1000);

  /* ---------------------------------------------------- Hero telemetry */
  var heroLogs = [
    'bonding: LTE-A + Ka-band link established',
    'a-box/edge-01: thermal nominal, 41.2 °C',
    'tak: federation peer HANDSHAKE ok',
    'uav-03: downlink locked, 1080p30 stable',
    'fleet: 42/42 nodes reporting heartbeat',
    'failover drill: primary → secondary in 340 ms',
    'cert rotation complete, 0 clients dropped'
  ];
  var heroLogEl = document.getElementById('hero-log');
  var heroLatency = document.getElementById('hero-latency');
  var heroUplink = document.getElementById('hero-uplink');
  var heroNodes = document.getElementById('hero-nodes');

  var heroTimers = [], heroOn = false;
  function heroTick() {
    if (heroLatency) heroLatency.textContent = Math.round(rand(18, 44));
    if (heroUplink)  heroUplink.textContent  = rand(12.4, 24.8).toFixed(1);
    if (heroNodes)   heroNodes.textContent   = Math.round(rand(38, 46));
  }
  function heroLog() { if (heroLogEl) heroLogEl.textContent = pick(heroLogs); }
  function heroStart() {
    if (heroOn || reduceMotion) return;
    heroOn = true;
    heroTimers.push(setInterval(heroTick, 2600), setInterval(heroLog, 3800));
  }
  function heroStop() { heroOn = false; heroTimers.forEach(clearInterval); heroTimers = []; }
  var heroEl = document.getElementById('hero');
  if ('IntersectionObserver' in window && heroEl) {
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { (e.isIntersecting && !document.hidden) ? heroStart() : heroStop(); });
    }, { threshold: 0.05 }).observe(heroEl);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) heroStop();
      else if (heroEl.getBoundingClientRect().bottom > 0) heroStart();
    });
  } else { heroStart(); }

  /* ==================================================================
     Shared geography: real map tiles over a random large US metro
     ================================================================== */
  var US_METROS = [
    { name: 'New York, NY',     lat: 40.7128, lon: -74.0060 },
    { name: 'Los Angeles, CA',  lat: 34.0522, lon: -118.2437 },
    { name: 'Chicago, IL',      lat: 41.8781, lon: -87.6298 },
    { name: 'Houston, TX',      lat: 29.7604, lon: -95.3698 },
    { name: 'Phoenix, AZ',      lat: 33.4484, lon: -112.0740 },
    { name: 'Philadelphia, PA', lat: 39.9526, lon: -75.1652 },
    { name: 'San Diego, CA',    lat: 32.7157, lon: -117.1611 },
    { name: 'Dallas, TX',       lat: 32.7767, lon: -96.7970 },
    { name: 'Denver, CO',       lat: 39.7392, lon: -104.9903 },
    { name: 'Seattle, WA',      lat: 47.6062, lon: -122.3321 },
    { name: 'Miami, FL',        lat: 25.7617, lon: -80.1918 },
    { name: 'Atlanta, GA',      lat: 33.7490, lon: -84.3880 },
    { name: 'Boston, MA',       lat: 42.3601, lon: -71.0589 },
    { name: 'Detroit, MI',      lat: 42.3314, lon: -83.0458 },
    { name: 'Minneapolis, MN',  lat: 44.9778, lon: -93.2650 }
  ];
  var METRO = pick(US_METROS);

  /* Esri's dark canvas, not CARTO's. CARTO began requiring an API key for its
     basemaps and now answers every request with HTTP 200 and a 2,513-byte
     "API KEY REQUIRED" watermark - the same bytes for every tile on earth. A
     watermark is not an error, so `img.onerror` never fired and the fallback
     grid never showed: the map simply read as broken. Esri is keyless, is
     already the source of the satellite imagery below, and its Dark Gray
     Canvas is the same cartography this design was built around.

     Note the {z}/{y}/{x} order, which is Esri's; tileLayer() substitutes each
     placeholder by name, so the order in the template does not matter. */
  var TILE_BASE = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
  var TILE_SAT  = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

  function lon2px(lon, z) { return (lon + 180) / 360 * Math.pow(2, z) * 256; }
  function lat2px(lat, z) {
    var s = Math.sin(lat * Math.PI / 180);
    return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * Math.pow(2, z) * 256;
  }

  /* Lays real map tiles into `host` and returns a projector from lat/lon to
     pixels inside it. If the tiles cannot be reached the images remove
     themselves and the styled fallback background shows through. */
  function tileLayer(host, tpl, lat, lon, z, opacity, cls) {
    var w = host.clientWidth || 800, h = host.clientHeight || 480;
    var ox = lon2px(lon, z) - w / 2, oy = lat2px(lat, z) - h / 2;
    var n = Math.pow(2, z), loaded = 0, tried = 0;
    var wrap = document.createElement('div');
    wrap.className = 'pointer-events-none absolute inset-0 overflow-hidden ' + (cls || '');
    wrap.setAttribute('aria-hidden', 'true');

    for (var x = Math.floor(ox / 256); x <= Math.floor((ox + w) / 256); x++) {
      for (var y = Math.floor(oy / 256); y <= Math.floor((oy + h) / 256); y++) {
        if (y < 0 || y >= n) continue;
        tried++;
        var img = new Image();
        img.alt = ''; img.decoding = 'async';
        img.style.cssText = 'position:absolute;width:256px;height:256px;opacity:0;' +
          'transition:opacity .6s ease;left:' + (x * 256 - ox) + 'px;top:' + (y * 256 - oy) + 'px';
        img.onload = function () { loaded++; this.style.opacity = opacity; };
        img.onerror = function () { if (this.parentNode) this.parentNode.removeChild(this); };
        img.src = tpl.replace('{z}', z).replace('{x}', ((x % n) + n) % n).replace('{y}', y);
        wrap.appendChild(img);
      }
    }
    if (host.__tileWrap && host.__tileWrap.parentNode) host.__tileWrap.parentNode.removeChild(host.__tileWrap);
    host.__tileWrap = wrap;
    host.insertBefore(wrap, host.firstChild);
    return {
      el: wrap, z: z, ox: ox, oy: oy,
      tilesTried: function () { return tried; },
      tilesLoaded: function () { return loaded; },
      project: function (la, lo) { return { x: lon2px(lo, z) - ox, y: lat2px(la, z) - oy }; }
    };
  }

  /* Move a pin without touching layout - transform only, so the browser
     composites it instead of repainting the map. */
  function placePin(el, pt) {
    el.style.transform = 'translate3d(' + pt.x.toFixed(1) + 'px,' + pt.y.toFixed(1) + 'px,0) translate(-50%,-50%)';
  }

  /* ---------------------------------------------------- TAK Revamp preview */
  var DEVICES = [
    { name: 'Andy',        role: 'Team Member', online: true, dLat:  0.0042, dLon: -0.0060 },
    { name: 'Andy iphone', role: 'Team Member', online: true, dLat: -0.0018, dLon:  0.0051 },
    { name: 'Andy-iOS',    role: 'Team Member', online: true, dLat: -0.0055, dLon: -0.0022 }
  ];
  DEVICES.forEach(function (d) { d.lat = METRO.lat + d.dLat; d.lon = METRO.lon + d.dLon; });

  var rosterEl  = document.getElementById('tak-roster');
  var takMap    = document.getElementById('tak-map');
  var chatList  = document.getElementById('tak-chat');
  var takState  = { selected: null, panel: null, playing: false };
  var takGeo    = tileLayer(takMap, TILE_BASE, METRO.lat, METRO.lon, 13, '0.9');

  var takLoc = document.getElementById('tak-location');
  if (takLoc) takLoc.textContent = METRO.name;

  /* --- roster: built once, then mutated in place --- */
  DEVICES.forEach(function (d) {
    var li = document.createElement('li');
    var b  = document.createElement('button');
    b.type = 'button';
    b.className = 'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition hover:bg-white/5';
    b.innerHTML =
      '<span class="h-2 w-2 shrink-0 rounded-full ' + (d.online ? 'bg-emerald-400' : 'bg-slate-600') + '"></span>' +
      '<span class="shrink-0 text-xs">\u{1F4F9}</span>' +
      '<span data-nm class="flex-1 truncate text-sm font-semibold text-white">' + d.name + '</span>' +
      '<span class="shrink-0 font-mono text-[10px] text-muted">' + d.role + '</span>';
    b.addEventListener('click', function () { selectDevice(d.name); });
    li.appendChild(b); rosterEl.appendChild(li);
    d.rowBtn = b; d.rowName = b.querySelector('[data-nm]');
  });
  document.getElementById('tak-devcount').textContent =
    DEVICES.length + ' device' + (DEVICES.length === 1 ? '' : 's');

  /* --- pins: created once, thereafter only transform + class flips --- */
  DEVICES.forEach(function (d) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('data-dev', d.name);
    b.title = d.name + ' · ' + d.role;
    b.setAttribute('aria-label', 'Select ' + d.name + ', ' + d.role);
    b.className = 'hit-target absolute left-0 top-0 opacity-100';
    b.style.transition = reduceMotion ? 'none' : 'transform 2.4s linear, opacity .4s ease';
    b.innerHTML =
      '<span class="relative flex h-3 w-3 items-center justify-center">' +
        '<span data-ring class="absolute h-3 w-3 rounded-full bg-emerald-400 opacity-0"></span>' +
        '<span data-dot class="relative h-3 w-3 rounded-full bg-emerald-400"></span>' +
      '</span>' +
      '<span data-lbl class="absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-ink-950/85 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">' + d.name + '</span>';
    b.addEventListener('click', function () { selectDevice(d.name); });
    takMap.appendChild(b);
    d.pin = b; d.dot = b.querySelector('[data-dot]'); d.lbl = b.querySelector('[data-lbl]');
    placePin(b, takGeo.project(d.lat, d.lon));
  });

  /* Camera tiles show real imagery of where each device actually is. Built
     lazily on first open so these tiles are not requested during page load. */
  var camsBuilt = false;
  function buildCameraTiles() {
    if (camsBuilt) return;
    camsBuilt = true;
    DEVICES.forEach(function (d) {
      var host = document.querySelector('[data-cam="' + d.name + '"]');
      if (!host) return;
      tileLayer(host, TILE_SAT, d.lat, d.lon, 18, '1', 'sar-feed-pan');
      var c = document.createElement('span');
      c.className = 'absolute bottom-2 right-2 z-10 font-mono text-[9px] text-white/80';
      c.textContent = d.lat.toFixed(4) + ', ' + d.lon.toFixed(4);
      host.appendChild(c);
    });
  }

  function paintDeviceSelection() {
    DEVICES.forEach(function (d) {
      var sel = takState.selected === d.name;
      var dim = takState.selected && !sel;
      d.pin.style.opacity = dim ? '0.35' : '1';
      d.pin.style.zIndex  = sel ? '5' : '';
      d.dot.className = 'relative h-3 w-3 rounded-full bg-emerald-400' + (sel ? ' ring-2 ring-white' : '');
      d.lbl.className = 'absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-ink-950/85 px-1.5 py-0.5 font-mono text-[10px] ' +
        (sel ? 'text-cyan-300 ring-1 ring-cyan-400/30' : 'text-slate-300');
      d.rowBtn.className = 'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition ' +
        (sel ? 'bg-cyan-400/10' : 'hover:bg-white/5');
      d.rowName.className = 'flex-1 truncate text-sm font-semibold ' + (sel ? 'text-cyan-300' : 'text-white');
    });
  }

  function selectDevice(name) {
    takState.selected = (takState.selected === name) ? null : name;
    paintDeviceSelection();
  }
  paintDeviceSelection();


  /* Panels */
  var takTabs   = document.querySelectorAll('.tak-tab');
  var takPanels = document.querySelectorAll('.tak-panel');

  function paintTabs() {
    takTabs.forEach(function (t) {
      var on = t.getAttribute('data-panel') === takState.panel;
      t.className = 'tak-tab rounded-lg px-2.5 py-1.5 font-mono text-[11px] transition ' +
        (on ? 'bg-cyan-400 text-ink-950 font-semibold' : 'bg-white/5 text-slate-300 hover:bg-white/10');
      t.setAttribute('aria-selected', String(on));
    });
  }

  function openPanel(name) {
    takState.panel = (takState.panel === name || name === 'map') ? null : name;
    takPanels.forEach(function (p) {
      p.classList.toggle('hidden', p.getAttribute('data-panel-body') !== takState.panel);
    });
    if (takState.panel !== 'playback') stopPlayback();
    if (takState.panel === 'cameras') buildCameraTiles();
    if (name === 'map') { takState.selected = null; paintDeviceSelection(); }
    paintTabs();
  }

  takTabs.forEach(function (t) {
    t.addEventListener('click', function () { openPanel(t.getAttribute('data-panel')); });
  });
  document.querySelectorAll('.tak-close').forEach(function (b) {
    b.addEventListener('click', function () { openPanel(takState.panel); });
  });

  /* Chat */
  var CHAT = [
    { who: 'TAKCORE', msg: 'test',    at: '01:35 PM' },
    { who: 'TAKCORE', msg: 'test2',   at: '01:36 PM' },
    { who: 'TAKCORE', msg: 'test3',   at: '01:37 PM' },
    { who: 'Andy',    msg: 'test4',   at: '01:38 PM' },
    { who: 'TAKCORE', msg: 'Hi Andy', at: '09:17 AM' },
    { who: 'Andy',    msg: 'hi server', at: '09:17 AM' }
  ];

  function renderChat() {
    chatList.innerHTML = '';
    CHAT.forEach(function (c) {
      var mine = c.who === 'TAKCORE';
      var li = document.createElement('li');
      li.className = 'flex flex-col ' + (mine ? 'items-start' : 'items-end');
      li.innerHTML =
        '<div class="max-w-[85%] rounded-lg px-3 py-2 ' +
          (mine ? 'bg-white/5 text-slate-200' : 'bg-cyan-400/15 text-cyan-100') + '">' +
          '<span class="mb-0.5 block font-mono text-[10px] uppercase tracking-wider ' +
            (mine ? 'text-muted' : 'text-cyan-400') + '">' + c.who + '</span>' +
          escapeHtml(c.msg) +
        '</div>' +
        '<span class="mt-1 font-mono text-[9px] text-muted">' + c.at + '</span>';
      chatList.appendChild(li);
    });
    chatList.scrollTop = chatList.scrollHeight;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
    });
  }

  document.getElementById('tak-chat-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var input = document.getElementById('tak-chat-input');
    var v = input.value.trim();
    if (!v) return;
    var d = new Date();
    var h = d.getHours() % 12 || 12;
    CHAT.push({
      who: 'TAKCORE',
      msg: v,
      at: pad(h) + ':' + pad(d.getMinutes()) + ' ' + (d.getHours() < 12 ? 'AM' : 'PM')
    });
    input.value = '';
    renderChat();
  });

  /* Playback */
  var scrub = document.getElementById('tak-scrub');
  var scrubLabel = document.getElementById('tak-scrub-label');
  var playBtn = document.getElementById('tak-play');
  var playTimer = null;

  function paintScrub() {
    var v = parseInt(scrub.value, 10);
    scrubLabel.textContent = v >= 120 ? 'live' : 'T-' + (120 - v) + ' min';
  }
  scrub.addEventListener('input', paintScrub);
  function stopPlayback() {
    takState.playing = false;
    clearInterval(playTimer); playTimer = null;
    playBtn.innerHTML = '&#9654;';
    playBtn.setAttribute('aria-label', 'Play track history');
  }
  playBtn.addEventListener('click', function () {
    takState.playing = !takState.playing;
    playBtn.innerHTML = takState.playing ? '&#10073;&#10073;' : '&#9654;';
    playBtn.setAttribute('aria-label', takState.playing ? 'Pause track history' : 'Play track history');
    clearInterval(playTimer);
    if (takState.playing) {
      playTimer = setInterval(function () {
        var v = parseInt(scrub.value, 10);
        if (v >= 120) { scrub.value = 0; } else { scrub.value = v + 2; }
        paintScrub();
      }, 120);
    }
  });
  paintScrub();

  /* Enrollment QR (decorative pattern) */
  var qr = document.getElementById('tak-qr');
  if (qr) {
    var pattern = [];
    for (var i = 0; i < 64; i++) {
      var r = Math.floor(i / 8), c = i % 8;
      var corner = (r < 3 && c < 3) || (r < 3 && c > 4) || (r > 4 && c < 3);
      pattern.push(corner ? ((r === 0 || r === 7 || c === 0 || c === 7 || (r === 1 && c === 1)) ? 1 : (r % 2 === c % 2 ? 1 : 0)) : (Math.random() < 0.5 ? 1 : 0));
    }
    qr.innerHTML = pattern.map(function (p) {
      return '<span class="' + (p ? 'bg-ink-950' : 'bg-white') + '"></span>';
    }).join('');
  }

  /* Emergency demo */
  var alertBar = document.getElementById('tak-alert');
  document.getElementById('tak-emergency').addEventListener('click', function () {
    alertBar.classList.remove('hidden');
    alertBar.classList.add('flex');
  });
  document.getElementById('tak-alert-x').addEventListener('click', function () {
    alertBar.classList.add('hidden');
    alertBar.classList.remove('flex');
  });

  /* Add IP camera -> opens cameras panel */
  document.getElementById('tak-addcam').addEventListener('click', function () { openPanel('cameras'); });

  /* Gentle position drift while visible */
  function driftDevices() {
    DEVICES.forEach(function (d) {
      d.lat += rand(-0.0009, 0.0009);
      d.lon += rand(-0.0012, 0.0012);
      placePin(d.pin, takGeo.project(d.lat, d.lon));
    });
  }

  renderChat();
  paintTabs();

  var driftTimer = null, takInView = false, takVisible = !document.hidden;
  function syncDrift() {
    var run = takInView && takVisible && !reduceMotion;
    if (run && !driftTimer) driftTimer = setInterval(driftDevices, 2600);
    if (!run && driftTimer) { clearInterval(driftTimer); driftTimer = null; }
  }
  function startDrift() { takInView = true;  syncDrift(); }
  function stopDrift()  { takInView = false; syncDrift(); }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.isIntersecting ? startDrift() : stopDrift(); });
    }, { threshold: 0.05 }).observe(document.getElementById('tak'));
  } else {
    startDrift();
  }
  document.addEventListener('visibilitychange', function () {
    takVisible = !document.hidden; syncDrift();
  });

  /* ==================================================================
     Situational Awareness Room — simulation
     ================================================================== */
  (function sarRoom() {
    var root = document.getElementById('sar-map');
    if (!root) return;

    var KIND = {
      PATROL:  { label: 'Patrol Unit',   platform: 'Android · ATAK', color: '#22d3ee', ring: 'rgba(34,211,238,.45)',  video: false, shape: 'dot' },
      COMMAND: { label: 'Command Unit',  platform: 'iOS · iTAK',     color: '#fcd34d', ring: 'rgba(252,211,77,.45)',  video: false, shape: 'dot' },
      DRONE:   { label: 'Recon Drone',   platform: 'UAV · downlink', color: '#34d399', ring: 'rgba(52,211,153,.45)',  video: true,  shape: 'tri' },
      CAMERA:  { label: 'Perimeter Cam', platform: 'IP · RTSP',      color: '#a78bfa', ring: 'rgba(167,139,250,.45)', video: true,  shape: 'sq'  }
    };

    var uid = 0;
    /* Placement derived from the map's real pixel size at the current zoom, so
       nodes land inside the visible area on every viewport and in every metro.
       The old hard-coded degree offsets predated the Mercator projection. */
    function mapW() { return (mapEl && mapEl.clientWidth)  || 800; }
    function mapH() { return (mapEl && mapEl.clientHeight) || 480; }
    function degPerPxLon() { return 360 / (Math.pow(2, 14) * 256); }
    function degPerPxLat() { return degPerPxLon() * Math.cos(METRO.lat * Math.PI / 180); }
    function clampNode(nd) {
      var lonSpan = degPerPxLon() * (mapW() / 2) * 0.86;
      var latSpan = degPerPxLat() * (mapH() / 2) * 0.86;
      nd.lon = Math.max(METRO.lon - lonSpan, Math.min(METRO.lon + lonSpan, nd.lon));
      nd.lat = Math.max(METRO.lat - latSpan, Math.min(METRO.lat + latSpan, nd.lat));
    }
    function makeNode(kind, name, x, y) {
      var k = KIND[kind];
      return {
        id: ++uid, kind: kind, name: name, x: x, y: y,
        lat: METRO.lat + (50 - y) / 100 * mapH() * degPerPxLat(),
        lon: METRO.lon + (x - 50) / 100 * mapW() * degPerPxLon(),
        batt: kind === 'CAMERA' ? 100 : Math.round(rand(42, 99)),
        sig: Math.round(rand(-92, -54)),
        alt: kind === 'DRONE' ? Math.round(rand(60, 140)) : 0,
        streaming: k.video,
        latency: k.video ? Math.round(rand(9, 34)) : null,
        lastCot: Math.round(rand(1, 20)),
        heading: rand(0, 360),
        enc: 'TLS 1.3 · mutual auth'
      };
    }

    var NODES = [
      makeNode('PATROL',  'PATROL-07', 22, 62),
      makeNode('PATROL',  'PATROL-11', 34, 34),
      makeNode('COMMAND', 'IC-COMMAND', 48, 47),
      makeNode('DRONE',   'RECON-01',  62, 28),
      makeNode('DRONE',   'RECON-02',  71, 58),
      makeNode('CAMERA',  'CAM-04',    14, 20),
      makeNode('CAMERA',  'CAM-09',    86, 76)
    ];

    var state = { filter: 'ALL', selected: null, paused: false, kind: 'PATROL' };
    var inspectorReturn = null;

    var mapEl     = root;
    var logEl     = document.getElementById('sar-log');
    var inspector = document.getElementById('sar-inspector');
    var modal     = document.getElementById('sar-modal');
    var sarGeo    = tileLayer(mapEl, TILE_BASE, METRO.lat, METRO.lon, 14, '0.9');
    var sarLoc    = document.getElementById('sar-location');
    if (sarLoc) sarLoc.textContent = METRO.name;

    /* ---------------------------------------------- feed console */
    var LOG_COLOR = { ok: 'text-emerald-400', warn: 'text-amber-400', info: 'text-cyan-400', crit: 'text-rose-400' };

    function log(kind, msg) {
      var d = new Date();
      var li = document.createElement('li');
      li.className = 'flex gap-2';
      li.innerHTML =
        '<span class="shrink-0 text-muted">' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + '</span>' +
        '<span class="shrink-0 ' + LOG_COLOR[kind] + '">' + (kind === 'warn' || kind === 'crit' ? '!' : '>') + '</span>' +
        '<span class="text-slate-400">' + msg + '</span>';
      logEl.prepend(li);
      while (logEl.childElementCount > 60) logEl.lastElementChild.remove();
    }

    document.getElementById('sar-log-pause').addEventListener('click', function () {
      state.paused = !state.paused;
      this.textContent = state.paused ? 'Resume' : 'Pause';
      this.classList.toggle('text-cyan-300', state.paused);
      this.classList.toggle('border-cyan-400/40', state.paused);
    });
    document.getElementById('sar-log-clear').addEventListener('click', function () { logEl.innerHTML = ''; });

    /* ---------------------------------------------- map rendering */
    function visible() {
      return NODES.filter(function (n) { return state.filter === 'ALL' || n.kind === state.filter; });
    }

    function pinInner(n) {
      var k = KIND[n.kind];
      if (k.shape === 'tri') {
        return '<svg viewBox="0 0 16 16" class="h-4 w-4" style="filter:drop-shadow(0 0 6px ' + k.ring + ')"><path d="M8 1l6.5 13H1.5z" fill="' + k.color + '"/></svg>';
      }
      if (k.shape === 'sq') {
        return '<span class="block h-3 w-3 rounded-[2px]" style="background:' + k.color + ';box-shadow:0 0 8px ' + k.ring + '"></span>';
      }
      return '<span class="block h-3 w-3 rounded-full" style="background:' + k.color + ';box-shadow:0 0 8px ' + k.ring + '"></span>';
    }

    /* Pin elements are created once per node and then only moved and
       restyled - never removed and rebuilt - so the map never flickers. */
    function ensurePin(n) {
      if (n.pin) return n.pin;
      var k = KIND[n.kind];
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('data-node', n.id);
      b.className = 'hit-target absolute left-0 top-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400';
      b.style.transition = reduceMotion ? 'none' : 'transform 2.8s linear, opacity .4s ease';
      b.title = n.name + ' · ' + k.label;
      b.setAttribute('aria-label', 'Inspect ' + n.name + ', ' + k.label);
      b.innerHTML =
        '<span class="relative flex items-center justify-center">' +
          '<span data-sel class="absolute h-7 w-7 rounded-full ring-2 ring-white opacity-0"></span>' +
          pinInner(n) +
        '</span>' +
        '<span data-lbl class="absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-ink-950/85 px-1.5 py-0.5 font-mono text-[9px] text-slate-300">' +
          n.name + (n.streaming ? '<span class="ml-1" style="color:' + k.color + '">&#9679;</span>' : '') +
        '</span>';
      b.addEventListener('click', function () { openInspector(n.id); });
      mapEl.appendChild(b);
      n.pin = b; n.selRing = b.querySelector('[data-sel]'); n.lbl = b.querySelector('[data-lbl]');
      return b;
    }

    function renderMap() {
      var showing = {};
      visible().forEach(function (n) { showing[n.id] = true; ensurePin(n); });
      NODES.forEach(function (n) {
        if (!n.pin) return;
        var on  = !!showing[n.id];
        var sel = state.selected === n.id;
        var disp = on ? '' : 'none';
        if (n.pin.style.display !== disp) n.pin.style.display = disp;
        if (!on) return;
        placePin(n.pin, sarGeo.project(n.lat, n.lon));
        var op = (state.selected && !sel) ? '0.3' : '1';
        if (n.pin.style.opacity !== op) n.pin.style.opacity = op;
        var zi = sel ? '5' : '';
        if (n.pin.style.zIndex !== zi) n.pin.style.zIndex = zi;
        n.selRing.style.opacity = sel ? '1' : '0';
        n.lbl.className = 'absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-ink-950/85 px-1.5 py-0.5 font-mono text-[9px] ' +
          (sel ? 'text-white ring-1 ring-white/30' : 'text-slate-300');
      });
      document.getElementById('sar-count').textContent = NODES.length;
      var streams = NODES.filter(function (n) { return n.streaming; });
      document.getElementById('sar-kpi-streams').textContent = streams.length;
      document.getElementById('sar-kpi-lat').textContent = streams.length
        ? Math.round(streams.reduce(function (a, n) { return a + n.latency; }, 0) / streams.length) + 'ms'
        : '--';
    }

    /* filters */
    var chips = document.querySelectorAll('.sar-chip');
    function paintChips() {
      chips.forEach(function (c) {
        var on = c.getAttribute('data-kind') === state.filter;
        c.className = 'sar-chip' + (on ? ' is-on' : '');
        c.setAttribute('aria-pressed', String(on));
      });
    }
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        state.filter = c.getAttribute('data-kind');
        if (state.selected && !visible().some(function (v) { return v.id === state.selected; })) closeInspector();
        paintChips(); renderMap();
      });
    });

    /* ---------------------------------------------- inspector */

    /* Built once; ticks only flip classes. Rebuilding these every 3s was the same
       destroy-and-recreate pattern that caused the map flicker. */
    var sigBarEls = null;
    function paintSigBars(sig) {
      var host = document.getElementById('sar-sig-bars');
      if (!host) return;
      if (!sigBarEls) {
        host.innerHTML = ''; sigBarEls = [];
        for (var i = 1; i <= 4; i++) {
          var b = document.createElement('span');
          b.className = 'w-1 rounded-sm bg-white/15';
          b.style.height = (i * 3 + 2) + 'px';
          host.appendChild(b); sigBarEls.push(b);
        }
      }
      var lvl = sig > -60 ? 4 : sig > -72 ? 3 : sig > -84 ? 2 : 1;
      for (var k = 0; k < 4; k++) {
        var want = 'w-1 rounded-sm ' + (k < lvl ? 'bg-emerald-400' : 'bg-white/15');
        if (sigBarEls[k].className !== want) sigBarEls[k].className = want;
      }
    }

    function paintInspector() {
      var n = NODES.find(function (x) { return x.id === state.selected; });
      if (!n) return;
      var k = KIND[n.kind];
      document.getElementById('sar-insp-title').textContent = n.name;
      document.getElementById('sar-insp-kind').textContent = k.label + ' · ' + k.platform;
      document.getElementById('sar-insp-dot').style.background = k.color;
      document.getElementById('sar-batt').textContent = n.batt + '%';
      var bar = document.getElementById('sar-batt-bar');
      bar.style.width = '100%';
      bar.style.transformOrigin = 'left';
      bar.style.transition = 'transform .5s ease';
      bar.style.transform = 'scaleX(' + (n.batt / 100) + ')';
      var bcls = 'block h-full rounded-full ' +
        (n.batt < 25 ? 'bg-rose-400' : n.batt < 55 ? 'bg-amber-400' : 'bg-emerald-400');
      if (bar.className !== bcls) bar.className = bcls;
      document.getElementById('sar-sig').textContent = n.sig + ' dBm';
      paintSigBars(n.sig);
      document.getElementById('sar-coords').textContent = n.lat.toFixed(5) + ', ' + n.lon.toFixed(5);
      document.getElementById('sar-enc').innerHTML = '<span class="text-emerald-400">&#128274;</span> ' + n.enc;
      document.getElementById('sar-transport').textContent = n.kind === 'CAMERA' ? 'RTSP over TLS' : (n.kind === 'DRONE' ? 'Bonded LTE + RF' : 'LTE / Wi-Fi');
      document.getElementById('sar-lastcot').textContent = n.lastCot + 's ago';
      document.getElementById('sar-feed-state').textContent = n.streaming ? 'live · ' + n.latency + 'ms' : 'no payload';
      document.getElementById('sar-feed-state').className = 'font-mono text-[10px] uppercase tracking-wider ' + (n.streaming ? 'text-emerald-300' : 'text-muted');
      document.getElementById('sar-nofeed').classList.toggle('hidden', n.streaming);
      document.getElementById('sar-nofeed').classList.toggle('flex', !n.streaming);
      document.getElementById('sar-insp-note').textContent = n.kind === 'DRONE'
        ? 'Altitude ' + n.alt + ' m AGL · heading ' + Math.round(n.heading) + '°'
        : (n.kind === 'CAMERA' ? 'Fixed asset · motion detection armed' : 'Handheld · position reported via CoT');
    }

    function openInspector(id) {
      state.selected = id;
      inspectorReturn = document.activeElement;
      inspector.classList.remove('hidden');
      mapEl.setAttribute('inert', '');
      inspector.setAttribute('tabindex', '-1');
      inspector.focus();
      paintInspector();
      renderMap();
      buildFeed(NODES.find(function (x) { return x.id === id; }));
      var n = NODES.find(function (x) { return x.id === id; });
      log('info', n.name + ' inspector opened');
    }

    function closeInspector() {
      inspector.classList.add('hidden');
      mapEl.removeAttribute('inert');
      if (inspectorReturn && inspectorReturn.focus) inspectorReturn.focus();
      inspectorReturn = null;
      state.selected = null;
      stopFeed();
      if (feedHost) feedHost.innerHTML = '';
      renderMap();
    }
    document.getElementById('sar-insp-close').addEventListener('click', closeInspector);

    /* ---------------------------------------------- live feed: real imagery */
    /* Drone and camera feeds show genuine satellite imagery of the node's
       own coordinates, so what you watch matches where the pin sits. */
    var feedHost = document.getElementById('sar-feed');
    var feedTimer = null, offlineTimer = null;

    function buildFeed(n) {
      stopFeed();
      feedHost.innerHTML = '';
      if (!n || !n.streaming) return;

      var z = n.kind === 'DRONE' ? 17 : 18;
      var layer = tileLayer(feedHost, TILE_SAT, n.lat, n.lon, z, '1', 'sar-feed-pan');

      var hud = document.createElement('div');
      hud.className = 'pointer-events-none absolute inset-0 font-mono text-[10px] text-white/85';
      hud.innerHTML =
        '<span class="absolute left-2 top-2 font-bold tracking-wide">' + escapeHtml(n.name) + '</span>' +
        '<span data-rec class="absolute right-2 top-2 flex items-center gap-1 text-rose-300">' +
          '<span class="h-1.5 w-1.5 rounded-full bg-rose-500"></span>REC</span>' +
        '<span class="absolute left-1/2 top-1/2 h-6 w-px -translate-x-1/2 -translate-y-1/2 bg-white/40"></span>' +
        '<span class="absolute left-1/2 top-1/2 h-px w-6 -translate-x-1/2 -translate-y-1/2 bg-white/40"></span>' +
        '<span class="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-sm ring-1 ring-emerald-300/70"></span>' +
        '<span data-coord class="absolute bottom-2 left-2"></span>' +
        '<span data-alt class="absolute bottom-2 right-2"></span>' +
        '<span class="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/60 to-transparent"></span>';
      feedHost.appendChild(hud);

      var scan = document.createElement('div');
      scan.className = 'pointer-events-none absolute inset-0 sar-scanlines';
      feedHost.appendChild(scan);

      n.feedHud = hud;
      paintFeedHud(n);

      /* if every tile failed (offline / blocked), say so instead of showing a void */
      offlineTimer = setTimeout(function () {
        if (layer.tilesLoaded() === 0 && layer.tilesTried() > 0) {
          var m = document.createElement('div');
          m.className = 'absolute inset-0 flex items-center justify-center px-4 text-center font-mono text-[10px] leading-relaxed text-muted';
          m.textContent = 'satellite imagery unavailable — offline';
          feedHost.appendChild(m);
        }
      }, 6000);

      if (!reduceMotion) {
        feedTimer = setInterval(function () {
          var rec = hud.querySelector('[data-rec]');
          if (rec) rec.style.visibility = rec.style.visibility === 'hidden' ? 'visible' : 'hidden';
        }, 1000);
      }
    }

    function paintFeedHud(n) {
      if (!n || !n.feedHud) return;
      var c = n.feedHud.querySelector('[data-coord]');
      var a = n.feedHud.querySelector('[data-alt]');
      if (c) c.textContent = n.lat.toFixed(5) + ', ' + n.lon.toFixed(5);
      if (a) a.textContent = n.kind === 'DRONE'
        ? 'ALT ' + n.alt + 'm  HDG ' + pad(Math.round(n.heading))
        : n.latency + 'ms';
    }

    function stopFeed() {
      if (feedTimer) { clearInterval(feedTimer); feedTimer = null; }
      if (offlineTimer) { clearTimeout(offlineTimer); offlineTimer = null; }
    }

    /* ---------------------------------------------- enrollment modal */
    var modalOpen = false, lastFocus = null;

    function setModal(open) {
      modalOpen = open;
      modal.classList.toggle('hidden', !open);
      modal.classList.toggle('flex', open);
      if (open) {
        lastFocus = document.activeElement;
        document.getElementById('sar-step-form').classList.remove('hidden');
        document.getElementById('sar-step-run').classList.add('hidden');
        document.getElementById('sar-callsign').value = '';
        document.getElementById('sar-callsign-err').classList.add('hidden');
        document.getElementById('sar-run-done').classList.add('hidden');
        setKind('PATROL');
        setTimeout(function () { document.getElementById('sar-callsign').focus(); }, 40);
      } else {
        enrollRun++;
        if (enrollTimer) { clearTimeout(enrollTimer); enrollTimer = null; }
        if (lastFocus) lastFocus.focus();
      }
    }

    document.getElementById('sar-enroll-open').addEventListener('click', function () { setModal(true); });
    document.getElementById('sar-modal-close').addEventListener('click', function () { setModal(false); });
    modal.addEventListener('click', function (e) { if (e.target === modal) setModal(false); });
    modal.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !modalOpen) return;
      var f = Array.prototype.filter.call(
        modal.querySelectorAll('button, input, select, textarea, [href]'),
        function (el) { return el.offsetParent !== null && !el.disabled; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (modalOpen) setModal(false);
      else if (!inspector.classList.contains('hidden')) closeInspector();
    });

    var kindBtns = document.querySelectorAll('.sar-kind');
    var PLACEHOLDER = { PATROL: 'PATROL-12', COMMAND: 'IC-BRAVO', DRONE: 'RECON-03', CAMERA: 'CAM-11' };
    function setKind(k) {
      state.kind = k;
      kindBtns.forEach(function (b) {
        var on = b.getAttribute('data-kind') === k;
        b.className = 'sar-kind' + (on ? ' is-on' : '');
        b.setAttribute('aria-checked', String(on));
      });
      document.getElementById('sar-callsign').placeholder = PLACEHOLDER[k];
    }
    kindBtns.forEach(function (b) {
      b.setAttribute('role', 'radio');
      b.addEventListener('click', function () { setKind(b.getAttribute('data-kind')); });
    });

    var STEPS = [
      'Generating key pair on device',
      'Submitting certificate signing request',
      'Validating certificate chain against CA',
      'Checking device posture &amp; attestation',
      'Issuing client certificate',
      'Registering node with TAK server'
    ];

    document.getElementById('sar-begin').addEventListener('click', function () {
      var input = document.getElementById('sar-callsign');
      var name = input.value.trim().toUpperCase() || input.placeholder;
      if (!/^[A-Z0-9\-]{3,14}$/.test(name)) {
        document.getElementById('sar-callsign-err').classList.remove('hidden');
        input.focus();
        return;
      }
      document.getElementById('sar-callsign-err').classList.add('hidden');
      runEnrollment(name, state.kind);
    });

    var enrollTimer = null, enrollRun = 0;
    function runEnrollment(name, kind) {
      var myRun = ++enrollRun;
      if (enrollTimer) { clearTimeout(enrollTimer); enrollTimer = null; }
      document.getElementById('sar-step-form').classList.add('hidden');
      document.getElementById('sar-step-run').classList.remove('hidden');
      document.getElementById('sar-run-name').textContent = name;
      var listEl = document.getElementById('sar-run-steps');
      var barEl  = document.getElementById('sar-run-bar');
      var pctEl  = document.getElementById('sar-run-pct');
      listEl.innerHTML = '';
      barEl.style.width = '0%';
      pctEl.textContent = '0%';

      STEPS.forEach(function (s, i) {
        var li = document.createElement('li');
        li.className = 'flex items-center gap-2.5 text-muted';
        li.innerHTML = '<span class="sar-step-icon inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white/15"></span><span>' + s + '</span>';
        li.setAttribute('data-step', String(i));
        listEl.appendChild(li);
      });

      var i = 0;
      (function next() {
        if (myRun !== enrollRun) return;
        if (i >= STEPS.length) {
          var node = makeNode(kind, name, rand(18, 82), rand(18, 82));
          clampNode(node);
          NODES.push(node);
          renderMap();
          log('ok', name + ' enrolled via ' + (kind === 'COMMAND' ? 'iTAK' : kind === 'PATROL' ? 'ATAK' : KIND[kind].label) + ' — certificate valid');
          if (KIND[kind].video) log('info', name + ' stream negotiated — latency ' + node.latency + 'ms');
          document.getElementById('sar-run-done').classList.remove('hidden');
          return;
        }
        var li = listEl.querySelector('[data-step="' + i + '"]');
        li.className = 'flex items-center gap-2.5 text-cyan-300';
        li.querySelector('.sar-step-icon').innerHTML =
          '<span class="h-1.5 w-1.5 animate-ping rounded-full bg-cyan-400"></span>';

        enrollTimer = setTimeout(function () {
          if (myRun !== enrollRun) return;
          li.className = 'flex items-center gap-2.5 text-slate-400';
          li.querySelector('.sar-step-icon').outerHTML =
            '<span class="sar-step-icon inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-[9px] text-emerald-300 ring-1 ring-emerald-400/40">&#10003;</span>';
          i++;
          var pct = Math.round((i / STEPS.length) * 100);
          barEl.style.width = pct + '%';
          pctEl.textContent = pct + '%';
          next();
        }, reduceMotion ? 90 : rand(340, 720));
      })();
    }

    document.getElementById('sar-run-done').addEventListener('click', function () { setModal(false); });

    /* ---------------------------------------------- ambient simulation */
    var AMBIENT = [
      ['ok',   'Federation peer EOC-NORTH synced'],
      ['info', 'Data package "IC-BRIEF-08" published'],
      ['ok',   'Geofence SECTOR-3 boundary confirmed'],
      ['info', 'Mission checkpoint saved'],
      ['ok',   'Certificate revocation list refreshed'],
      ['warn', 'Uplink jitter elevated on bonded carrier 2'],
      ['info', 'Track history buffer rotated']
    ];

    function tick() {
      if (state.paused) return;

      NODES.forEach(function (n) {
        if (n.kind !== 'CAMERA') {
          n.lat += rand(-0.00055, 0.00055);
          n.lon += rand(-0.00080, 0.00080);
          clampNode(n);
          n.heading = (n.heading + rand(-14, 14) + 360) % 360;
          if (Math.random() < 0.3) n.batt = Math.max(6, n.batt - 1);
        }
        n.sig = Math.max(-98, Math.min(-48, n.sig + Math.round(rand(-4, 4))));
        n.lastCot = Math.round(rand(1, 22));
        if (n.streaming) n.latency = Math.max(7, Math.min(48, n.latency + Math.round(rand(-4, 4))));
        if (n.kind === 'DRONE') n.alt = Math.max(40, Math.min(160, n.alt + Math.round(rand(-6, 6))));
      });

      renderMap();
      if (state.selected) {
        paintInspector();
        paintFeedHud(NODES.find(function (x) { return x.id === state.selected; }));
      }

      var r = Math.random();
      if (r < 0.32) {
        var streams = NODES.filter(function (n) { return n.streaming; });
        if (streams.length) {
          var s = pick(streams);
          log('ok', s.name + ' stream latency &lt;' + s.latency + 'ms');
        }
      } else if (r < 0.5) {
        var low = NODES.filter(function (n) { return n.batt < 25 && n.kind !== 'CAMERA'; });
        if (low.length) log('warn', pick(low).name + ' battery below 25% threshold');
        else log('info', pick(NODES).name + ' position update received');
      } else if (r < 0.78) {
        var a = pick(AMBIENT);
        log(a[0], a[1]);
      }
    }

    /* ---------------------------------------------- boot */
    paintChips();
    renderMap();
    setKind('PATROL');
    log('ok',   'Situational Awareness Room online');
    log('info', NODES.length + ' nodes restored from last session');
    log('ok',   'RECON-01 downlink established — 1080p30');
    log('info', 'CAM-04 stream latency &lt;12ms');

    var simTimer = null, sarInView = false, sarVisible = !document.hidden;
    function syncSim() {
      var run = sarInView && sarVisible;
      if (run && !simTimer) simTimer = setInterval(tick, 3000);
      if (!run && simTimer) { clearInterval(simTimer); simTimer = null; }
    }
    function start() { sarInView = true;  syncSim(); }
    function stop()  { sarInView = false; syncSim(); stopFeed(); }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { e.isIntersecting ? start() : stop(); });
      }, { threshold: 0.05 }).observe(document.getElementById('roadmap'));
    } else {
      start();
    }
    document.addEventListener('visibilitychange', function () { sarVisible = !document.hidden; syncSim(); });
  })();

  /* ---------------------------------------------------- Nav status indicator flavor */
  /* status label is static by design - no rotation, no repaint */

  /* ---------------------------------------------------- Contact form */
  var form = document.getElementById('contact-form');
  var success = document.getElementById('cf-success');
  var CONTACT_EMAIL = 'info@howidely.com';

  function showError(id, show) {
    var msg = document.querySelector('[data-error-for="' + id + '"]');
    var input = document.getElementById(id);
    if (msg) msg.classList.toggle('hidden', !show);
    if (input) {
      input.classList.toggle('border-rose-500/60', show);
      input.classList.toggle('border-white/10', !show);
      input.setAttribute('aria-invalid', String(show));
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('cf-name');
    var email = document.getElementById('cf-email');
    var msg = document.getElementById('cf-msg');

    var nameBad  = name.value.trim().length < 2;
    var emailBad = !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
    var msgBad   = msg.value.trim().length < 10;

    showError('cf-name', nameBad);
    showError('cf-email', emailBad);
    showError('cf-msg', msgBad);

    if (nameBad || emailBad || msgBad) {
      var first = nameBad ? name : (emailBad ? email : msg);
      first.focus();
      success.classList.add('hidden');
      return;
    }

    // No backend on a static page: hand the composed message to the sender's mail client.
    var org   = document.getElementById('cf-org').value.trim();
    var topic = document.getElementById('cf-topic').value;
    var subject = 'Howidely enquiry — ' + topic + (org ? ' — ' + org : '');
    var body =
      'Name: ' + name.value.trim() + '\n' +
      'Email: ' + email.value.trim() + '\n' +
      'Organization: ' + (org || '—') + '\n' +
      'Area of interest: ' + topic + '\n\n' +
      'Mission brief:\n' + msg.value.trim() + '\n';

    window.location.href = 'mailto:' + CONTACT_EMAIL +
      '?subject=' + encodeURIComponent(subject) +
      '&body='    + encodeURIComponent(body);

    success.classList.remove('hidden');
    success.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  });

  ['cf-name','cf-email','cf-msg'].forEach(function (id) {
    var el = document.getElementById(id);
    el.addEventListener('input', function () {
      if (el.getAttribute('aria-invalid') === 'true') showError(id, false);
    });
  });

})();
