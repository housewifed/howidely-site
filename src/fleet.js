(function () {
  'use strict';

  /* RTAK Fleet page. Coming soon: the simulation below is a concept and must
     never dial, send or post anything. Constraints from CLAUDE.md apply as on
     the home page: nodes created once and moved with transforms, nothing
     animates while out of view, no backdrop-filter over moving content. */

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
  function pad(n) { return String(n).padStart(2, '0'); }

  /* ---------------------------------------------------- Year, menu, navbar */
  document.getElementById('year').textContent = new Date().getFullYear();

  var menuBtn = document.getElementById('menu-btn');
  var menu = document.getElementById('mobile-menu');
  var iconOpen = document.getElementById('icon-open');
  var iconClose = document.getElementById('icon-close');
  function setMenu(open) {
    menu.classList.toggle('hidden', !open);
    iconOpen.classList.toggle('hidden', open);
    iconClose.classList.toggle('hidden', !open);
    menuBtn.setAttribute('aria-expanded', String(open));
  }
  menuBtn.addEventListener('click', function () { setMenu(menu.classList.contains('hidden')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  var navbar = document.getElementById('navbar');
  var navScrolled = null, navTicking = false;
  function onScroll() {
    if (navTicking) return;
    navTicking = true;
    requestAnimationFrame(function () {
      var s = window.scrollY > 20;
      if (s !== navScrolled) {
        navScrolled = s;
        navbar.classList.toggle('shadow-lg', s);
        navbar.classList.toggle('shadow-black/40', s);
      }
      navTicking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------- Status clock */
  function tickClock() {
    var d = new Date();
    var el = document.getElementById('status-clock');
    if (el) el.textContent = pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + ' UTC';
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* ---------------------------------------------------- Scenarios */
  var SCENARIOS = [
    { t: 'Off route',
      trigger: 'The truck leaves its planned route corridor.',
      auto: 'Cameras start recording; the driver is asked to confirm a detour.',
      op: 'Call the driver, approve the detour, or call police with the location and a live video link.' },
    { t: 'Stopped too long',
      trigger: 'Stopped longer than allowed away from an approved stop.',
      auto: 'Road and cabin cameras start; the driver gets a check-in message.',
      op: 'Call the driver, send roadside assistance, or escalate to police.' },
    { t: 'Driving too long',
      trigger: 'Continuous driving time passes the limit you set. Advisory, alongside your certified ELD.',
      auto: 'The driver is reminded to take a break; the operator is told.',
      op: 'Call the driver and plan the next stop.' },
    { t: 'Crash or harsh event',
      trigger: 'Hard braking, an impact or a rollover.',
      auto: 'Video from before and after is kept; the driver is asked if they are OK.',
      op: 'Confirm a 911 call with exact GPS, or call roadside assistance.' },
    { t: 'Panic button',
      trigger: 'The driver presses the hidden panic button.',
      auto: 'A silent alert; cameras stream to the operator with no sound in the cab.',
      op: 'Call police with exact GPS and a live video link.' },
    { t: 'Power cut or tampering',
      trigger: 'The unit loses vehicle power or is opened.',
      auto: 'It switches to its backup battery, sends its position and keeps recording.',
      op: 'Call the driver, or call police.' },
    { t: 'Unapproved night parking',
      trigger: 'Parked overnight outside your approved yards and truck stops.',
      auto: 'Cameras are armed; the driver is asked to confirm the spot.',
      op: 'Approve the spot, call the driver, or alert local police.' }
  ];
  var grid = document.getElementById('scenario-grid');
  if (grid) {
    SCENARIOS.forEach(function (s, i) {
      var a = document.createElement('article');
      a.className = 'reveal feat-card';
      a.innerHTML =
        '<div class="feat-num" aria-hidden="true">' + pad(i + 1) + '</div>' +
        '<h3 class="feat-title !mt-0">' + s.t + '</h3>' +
        '<dl class="mt-4 space-y-3 text-sm leading-relaxed">' +
          '<div><dt class="font-mono text-[10px] uppercase tracking-wider text-rose-300">Trigger</dt><dd class="mt-0.5 text-slate-300">' + s.trigger + '</dd></div>' +
          '<div><dt class="font-mono text-[10px] uppercase tracking-wider text-emerald-300">Automatically</dt><dd class="mt-0.5 text-slate-300">' + s.auto + '</dd></div>' +
          '<div><dt class="font-mono text-[10px] uppercase tracking-wider text-amber-300">Operator can</dt><dd class="mt-0.5 text-slate-300">' + s.op + '</dd></div>' +
        '</dl>';
      grid.appendChild(a);
    });
  }

  /* ---------------------------------------------------- Scroll reveal (after the
     scenario cards exist, so they reveal too) */
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

  /* ---------------------------------------------------- Concept simulation */
  var mapEl = document.getElementById('fl-map');
  if (mapEl) (function () {
    /* Keyless Esri tiles, as on the home page (see CLAUDE.md: CARTO went
       key-only and served a watermark with HTTP 200). */
    var TILE_BASE = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
    var TILE_SAT = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    var METROS = [
      { name: 'Chicago, IL', lat: 41.8781, lon: -87.6298 },
      { name: 'Dallas, TX', lat: 32.7767, lon: -96.7970 },
      { name: 'Atlanta, GA', lat: 33.7490, lon: -84.3880 },
      { name: 'Los Angeles, CA', lat: 34.0522, lon: -118.2437 },
      { name: 'Toronto, ON', lat: 43.6532, lon: -79.3832 },
      { name: 'Montreal, QC', lat: 45.5019, lon: -73.5674 },
      { name: 'Calgary, AB', lat: 51.0447, lon: -114.0719 },
      { name: 'Memphis, TN', lat: 35.1495, lon: -90.0490 }
    ];
    var METRO = pick(METROS);

    function lon2px(lon, z) { return (lon + 180) / 360 * Math.pow(2, z) * 256; }
    function lat2px(lat, z) {
      var s = Math.sin(lat * Math.PI / 180);
      return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * Math.pow(2, z) * 256;
    }
    /* Copied from the home page on purpose: each page stays one file. */
    function tileLayer(host, tpl, lat, lon, z, opacity, cls) {
      var w = host.clientWidth || 800, h = host.clientHeight || 480;
      var ox = lon2px(lon, z) - w / 2, oy = lat2px(lat, z) - h / 2;
      var n = Math.pow(2, z);
      var wrap = document.createElement('div');
      wrap.className = 'pointer-events-none absolute inset-0 overflow-hidden ' + (cls || '');
      wrap.setAttribute('aria-hidden', 'true');
      for (var x = Math.floor(ox / 256); x <= Math.floor((ox + w) / 256); x++) {
        for (var y = Math.floor(oy / 256); y <= Math.floor((oy + h) / 256); y++) {
          if (y < 0 || y >= n) continue;
          var img = new Image();
          img.alt = ''; img.decoding = 'async';
          img.style.cssText = 'position:absolute;width:256px;height:256px;opacity:0;' +
            'transition:opacity .6s ease;left:' + (x * 256 - ox) + 'px;top:' + (y * 256 - oy) + 'px';
          img.onload = function () { this.style.opacity = opacity; };
          img.onerror = function () { if (this.parentNode) this.parentNode.removeChild(this); };
          img.src = tpl.replace('{z}', z).replace('{x}', ((x % n) + n) % n).replace('{y}', y);
          wrap.appendChild(img);
        }
      }
      host.insertBefore(wrap, host.firstChild);
      return { project: function (la, lo) { return { x: lon2px(lo, z) - ox, y: lat2px(la, z) - oy }; } };
    }

    var Z = mapEl.clientWidth < 640 ? 12 : 13;
    var geo = tileLayer(mapEl, TILE_BASE, METRO.lat, METRO.lon, Z, '0.9');
    document.getElementById('fl-place').textContent = METRO.name;

    /* The planned route: a gentle S across the map. The truck leaves it at
       LEAVE, heading off at right angles. All in degrees around the metro. */
    var SPAN = Z === 12 ? 0.11 : 0.07, LEAVE = 0.55;
    function onRoute(t) {
      return { lat: METRO.lat + (t - 0.5) * SPAN * 0.36 + Math.sin(t * Math.PI * 2) * SPAN * 0.09,
               lon: METRO.lon + (t - 0.5) * SPAN };
    }
    function offRoute(u) {
      var a = onRoute(LEAVE);
      return { lat: a.lat + u * SPAN * 0.2, lon: a.lon + u * SPAN * 0.06 };
    }

    // corridor + centre line, drawn once
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'pointer-events-none absolute inset-0 h-full w-full');
    svg.setAttribute('aria-hidden', 'true');
    var pts = [];
    for (var i = 0; i <= 60; i++) { var p = geo.project(onRoute(i / 60).lat, onRoute(i / 60).lon); pts.push(p.x.toFixed(1) + ',' + p.y.toFixed(1)); }
    [['30', 'rgba(251,191,36,.13)', ''], ['2', 'rgba(251,191,36,.75)', '6 6']].forEach(function (s) {
      var pl = document.createElementNS(NS, 'polyline');
      pl.setAttribute('points', pts.join(' '));
      pl.setAttribute('fill', 'none');
      pl.setAttribute('stroke', s[1]);
      pl.setAttribute('stroke-width', s[0]);
      pl.setAttribute('stroke-linecap', 'round');
      pl.setAttribute('stroke-linejoin', 'round');
      if (s[2]) pl.setAttribute('stroke-dasharray', s[2]);
      svg.appendChild(pl);
    });
    mapEl.appendChild(svg);

    // the truck: created once, moved with translate3d
    var truck = document.createElement('div');
    truck.className = 'pointer-events-none absolute left-0 top-0 z-[5]';
    truck.setAttribute('aria-hidden', 'true');
    truck.innerHTML =
      '<span data-dot class="relative block h-4 w-4 rounded-full border-2 border-white bg-emerald-400 shadow-lg shadow-black/60"></span>' +
      '<span class="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-ink-950/90 px-1.5 py-0.5 font-mono text-[10px] text-slate-200">Unit 214</span>';
    mapEl.appendChild(truck);
    var truckDot = truck.querySelector('[data-dot]');
    function place(pos) {
      var p = geo.project(pos.lat, pos.lon);
      truck.style.transform = 'translate3d(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px,0) translate(-50%,-50%)';
    }

    var logEl = document.getElementById('fl-log');
    var stateEl = document.getElementById('fl-state');
    var alertEl = document.getElementById('fl-alert');
    var gpsEl = document.getElementById('fl-gps');
    var timerEl = document.getElementById('fl-timer');
    var camEl = document.getElementById('fl-cam');
    var actions = document.querySelectorAll('#fl-actions button');
    var camBuilt = false;

    var STATE_STYLE = {
      'On route': 'bg-emerald-400/10 text-emerald-300',
      'Off route': 'bg-rose-500/15 text-rose-200',
      'Waiting for operator': 'bg-amber-400/10 text-amber-200',
      'Escalated': 'bg-amber-400/20 text-amber-100',
      'Resolved': 'bg-cyan-400/10 text-cyan-200'
    };
    function setState(s) {
      stateEl.textContent = s;
      stateEl.className = 'rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ' + STATE_STYLE[s];
    }
    var clock = 0;   // simulated milliseconds, advancing only while visible
    function stamp() {
      var s = Math.floor(clock / 1000);
      return '00:' + pad(Math.floor(s / 60)) + ':' + pad(s % 60);
    }
    function log(text, tone) {
      var li = document.createElement('li');
      li.className = 'flex gap-2 ' + (tone || 'text-slate-300');
      li.innerHTML = '<span class="shrink-0 text-muted">' + stamp() + '</span><span></span>';
      li.lastChild.textContent = text;
      logEl.appendChild(li);
      while (logEl.children.length > 9) logEl.removeChild(logEl.firstChild);
      logEl.scrollTop = logEl.scrollHeight;
    }

    /* State machine on simulated time. Phases: drive -> off -> wait ->
       (decided | escalated) -> reset. `queue` holds timed log lines. */
    var DECIDE_MS = 20000;
    var sim, queue;
    function reset() {
      sim = { phase: 'drive', t: 0, u: 0, alertAt: 0, doneAt: 0 };
      queue = [];
      logEl.textContent = '';
      alertEl.classList.add('hidden');
      actions.forEach(function (b) { b.disabled = false; });
      truckDot.className = 'relative block h-4 w-4 rounded-full border-2 border-white bg-emerald-400 shadow-lg shadow-black/60';
      setState('On route');
      log('Unit 214 departed · following planned route', 'text-slate-400');
      place(onRoute(0));
    }
    function later(ms, fn) { queue.push({ at: clock + ms, fn: fn }); }
    function gpsText(pos) { return pos.lat.toFixed(5) + ', ' + pos.lon.toFixed(5); }

    function raiseAlert() {
      var pos = offRoute(sim.u);
      setState('Off route');
      truckDot.className = 'relative block h-4 w-4 rounded-full border-2 border-white bg-rose-500 shadow-lg shadow-black/60';
      log('Trigger · left the planned route corridor', 'text-rose-200');
      later(700, function () { log('Automatic · road and cabin cameras recording', 'text-emerald-300'); });
      later(1400, function () { log('Automatic · driver asked: "Confirm detour?"', 'text-emerald-300'); });
      later(2100, function () {
        log('Operator alerted · recommended: call the driver', 'text-cyan-200');
        setState('Waiting for operator');
        gpsEl.textContent = 'GPS ' + gpsText(pos);
        alertEl.classList.remove('hidden');
        if (!camBuilt) { camBuilt = true; tileLayer(camEl, TILE_SAT, pos.lat, pos.lon, 17, '1', 'sar-feed-pan'); }
        sim.phase = 'wait'; sim.alertAt = clock;
      });
    }

    function decide(act) {
      if (sim.phase !== 'wait') return;
      sim.phase = 'decided'; sim.doneAt = clock;
      actions.forEach(function (b) { b.disabled = true; });
      var pos = offRoute(sim.u);
      var msg = {
        police: 'Operator · police call started with GPS ' + gpsText(pos) + ' and a live video link',
        driver: 'Operator · calling the driver — "Fuel stop, back on route in 10" — detour approved',
        roadside: 'Operator · roadside assistance requested at ' + gpsText(pos),
        dismiss: 'Operator · dismissed with reason: approved detour'
      }[act];
      log(msg, 'text-cyan-200');
      log('Simulated · nothing was dialed or sent', 'text-muted');
      setState('Resolved');
    }
    actions.forEach(function (b) { b.addEventListener('click', function () { decide(b.getAttribute('data-act')); }); });

    function step(dt) {
      clock += dt;
      for (var i = 0; i < queue.length; i++) {
        if (queue[i].at <= clock) { var q = queue.splice(i, 1)[0]; i--; q.fn(); }
      }
      if (sim.phase === 'drive') {
        sim.t = Math.min(LEAVE, sim.t + dt / 16000);
        place(onRoute(sim.t));
        if (sim.t >= LEAVE) sim.phase = 'off';
      } else if (sim.phase === 'off' || sim.phase === 'wait' || sim.phase === 'decided' || sim.phase === 'escalated') {
        if (sim.u < 1) {
          var was = sim.u;
          sim.u = Math.min(1, sim.u + dt / 7000);
          place(offRoute(sim.u));
          if (was < 0.3 && sim.u >= 0.3) raiseAlert();
          if (sim.u >= 1) log('Unit 214 stopped, off route', 'text-slate-400');
        }
        if (sim.phase === 'wait') {
          var left = Math.max(0, DECIDE_MS - (clock - sim.alertAt));
          timerEl.textContent = 'Backup operator in ' + Math.ceil(left / 1000) + ' s';
          if (left === 0) {
            sim.phase = 'escalated'; sim.doneAt = clock;
            actions.forEach(function (b) { b.disabled = true; });
            timerEl.textContent = 'Escalated';
            log('No response in 20 s · escalated to the backup operator', 'text-amber-200');
            setState('Escalated');
          }
        }
        if ((sim.phase === 'decided' || sim.phase === 'escalated') && clock - sim.doneAt > 6000) reset();
      }
    }

    reset();
    var running = false, inView = false, last = 0, raf = 0;
    function frame(now) {
      var dt = Math.min(100, now - (last || now));
      last = now;
      step(dt);
      raf = requestAnimationFrame(frame);
    }
    function sync() {
      var run = inView && !document.hidden;
      if (run && !running) { running = true; last = 0; raf = requestAnimationFrame(frame); }
      if (!run && running) { running = false; cancelAnimationFrame(raf); }
    }
    if (reduceMotion) {
      // no motion: show the decision point straight away, still interactive
      sim.t = LEAVE; sim.phase = 'off'; sim.u = 0.3;
      place(offRoute(sim.u)); raiseAlert();
      for (var k = 0; k < 4; k++) step(800);
      sim.u = 1;
      return;
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { es.forEach(function (e) { inView = e.isIntersecting; sync(); }); },
        { threshold: 0.15 }).observe(document.getElementById('demo'));
    } else { inView = true; sync(); }
    document.addEventListener('visibilitychange', sync);
  })();

  /* ---------------------------------------------------- Waitlist (no backend) */
  var form = document.getElementById('wl-form');
  var success = document.getElementById('wl-success');
  var EMAIL = 'info@howidely.com';
  function showError(id, show) {
    var msg = document.querySelector('[data-error-for="' + id + '"]');
    var input = document.getElementById(id);
    if (msg) msg.classList.toggle('hidden', !show);
    input.classList.toggle('border-rose-500/60', show);
    input.classList.toggle('border-white/10', !show);
    input.setAttribute('aria-invalid', String(show));
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('wl-name');
    var email = document.getElementById('wl-email');
    var company = document.getElementById('wl-company');
    var bad = {
      'wl-name': name.value.trim().length < 2,
      'wl-email': !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim()),
      'wl-company': company.value.trim().length < 2
    };
    Object.keys(bad).forEach(function (id) { showError(id, bad[id]); });
    var first = Object.keys(bad).filter(function (id) { return bad[id]; })[0];
    if (first) { document.getElementById(first).focus(); success.classList.add('hidden'); return; }
    var size = document.getElementById('wl-size').value;
    var notes = document.getElementById('wl-notes').value.trim();
    var subject = 'RTAK Fleet waitlist — ' + company.value.trim();
    var body =
      'Name: ' + name.value.trim() + '\n' +
      'Email: ' + email.value.trim() + '\n' +
      'Company: ' + company.value.trim() + '\n' +
      'Fleet size: ' + size + '\n\n' +
      'What it should watch for:\n' + (notes || '—') + '\n';
    window.location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    success.classList.remove('hidden');
    success.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  });
  ['wl-name', 'wl-email', 'wl-company'].forEach(function (id) {
    var el = document.getElementById(id);
    el.addEventListener('input', function () { if (el.getAttribute('aria-invalid') === 'true') showError(id, false); });
  });
})();
