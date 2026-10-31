/* Suds & Snouts Dog Grooming */
(function () {
  'use strict';

  // ---- Salon details: edit these in one place -------------------------------
  // The phone number and email are placeholders until the salon's real ones exist.
  // Set bookingUrl to your online booking page (for example Goldie or MoeGo);
  // while it is empty, the closing "Book a groom" button calls the salon instead.
  var SITE = {
    phoneDisplay: '045 555 0123',
    phoneTel: '+353455550123',
    email: 'hello@sudsandsnouts.ie',
    bookingUrl: ''
  };

  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function applySiteDetails() {
    $all('[data-phone-link]').forEach(function (a) { a.href = 'tel:' + SITE.phoneTel; });
    $all('[data-phone-text]').forEach(function (a) { a.textContent = SITE.phoneDisplay; });
    $all('[data-email-link]').forEach(function (a) {
      a.href = 'mailto:' + SITE.email;
      if (a.textContent.indexOf('@') !== -1) a.textContent = SITE.email;
    });
    $all('[data-booking-link]').forEach(function (a) {
      a.href = SITE.bookingUrl || 'tel:' + SITE.phoneTel;
      if (SITE.bookingUrl) { a.target = '_blank'; a.rel = 'noopener'; }
    });
    $all('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
  }

  // ---- Header: fill after the hero, active section link ----------------------
  function initHeader() {
    var header = document.querySelector('[data-header]');
    var hero = document.querySelector('.hero');
    if (!header || !hero || !('IntersectionObserver' in window)) { if (header) header.classList.add('is-scrolled'); return; }
    new IntersectionObserver(function (entries) {
      header.classList.toggle('is-scrolled', !entries[0].isIntersecting);
    }, { rootMargin: '-80px 0px 0px 0px' }).observe(hero);

    var links = $all('.primary-nav a');
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    // Every main section is watched so the highlight clears over sections without a menu link.
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('is-active'); a.removeAttribute('aria-current'); });
        var a = map[e.target.id];
        if (a) { a.classList.add('is-active'); a.setAttribute('aria-current', 'true'); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $all('main > section[id]').forEach(function (s) { spy.observe(s); });
  }

  // ---- Mobile menu ------------------------------------------------------------
  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-menu]');
    var header = document.querySelector('[data-header]');
    if (!toggle || !menu) return;

    function focusables() { return [toggle].concat($all('a', menu)); }
    function open() {
      menu.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      header.classList.add('menu-open');
      var first = menu.querySelector('a'); if (first) first.focus();
    }
    function close(returnFocus) {
      if (menu.hidden) return;
      menu.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      header.classList.remove('menu-open');
      if (returnFocus) toggle.focus();
    }
    toggle.addEventListener('click', function () { menu.hidden ? open() : close(true); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) close(false); });
    document.addEventListener('keydown', function (e) {
      if (menu.hidden) return;
      if (e.key === 'Escape') { close(true); return; }
      if (e.key === 'Tab') {
        var f = focusables(), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    matchMedia('(min-width: 1100px)').addEventListener('change', function (m) { if (m.matches) close(false); });
  }

  // ---- Motion -----------------------------------------------------------------
  var reduceQuery = matchMedia('(prefers-reduced-motion: reduce)');
  var canAnimate = !!document.documentElement.animate;
  var owned = new Set();      // animations started by this script
  var prepared = new Set();   // elements given a hidden start state
  var observers = [];
  var SPRING = 'cubic-bezier(0.34, 1.4, 0.64, 1)';
  var EASE = 'cubic-bezier(0.23, 1, 0.32, 1)';

  function motionAllowed() { return canAnimate && !reduceQuery.matches; }

  function clearInline(el) { el.style.opacity = ''; el.style.transform = ''; prepared.delete(el); }

  function run(el, from, opts) {
    var finalT = el.__finalTransform || 'none';
    var start = from + (finalT === 'none' ? '' : ' ' + finalT);
    var anim = el.animate([
      { opacity: 0, transform: start },
      { opacity: 1, transform: finalT }
    ], { duration: opts.duration, delay: opts.delay || 0, easing: opts.easing, fill: 'both' });
    owned.add(anim);
    anim.finished.then(function () {
      clearInline(el);
      anim.cancel();
      owned.delete(anim);
    }).catch(function () { owned.delete(anim); });
    return anim;
  }

  function heroEntrance() {
    var root = document.documentElement;
    if (!motionAllowed()) { root.classList.remove('hero-pending'); return; }
    var texts = $all('[data-hero="text"]');
    var blocks = $all('[data-hero="block"]');
    var rings = $all('[data-hero="ring"]');
    var photo = document.querySelector('[data-hero-photo]');
    texts.forEach(function (el, i) {
      run(el, 'translateY(24px)', { duration: 600, delay: Math.min(i * 80, 240), easing: EASE });
    });
    blocks.forEach(function (el, i) {
      run(el, 'scale(0.92)', { duration: 700, delay: 180 + Math.min(i * 70, 240), easing: SPRING });
    });
    if (photo) run(photo, 'scale(1.06)', { duration: 800, delay: 220, easing: EASE });
    rings.forEach(function (el, i) {
      run(el, 'translateY(24px)', { duration: 650, delay: 420 + Math.min(i * 60, 240), easing: EASE });
    });
    root.classList.remove('hero-pending');
  }

  var REVEALS = {
    rise:    { from: 'translateY(20px)', duration: 500, stagger: 70, easing: EASE },
    slide:   { from: 'translateX(-24px)', duration: 500, stagger: 80, easing: SPRING },
    pop:     { from: 'translateY(16px) scale(0.92)', duration: 500, stagger: 60, easing: SPRING },
    photo:   { from: 'scale(1.06)', duration: 650, stagger: 0, easing: EASE },
    club:    { from: 'translateY(18px)', duration: 600, stagger: 70, easing: EASE },
    cluster: { from: 'scale(0.92)', duration: 600, stagger: 70, easing: SPRING }
  };

  function initReveals() {
    if (!motionAllowed() || !('IntersectionObserver' in window)) return;
    var vh = window.innerHeight;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        playGroup(entry.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px 10% 0px' });
    observers.push(io);

    $all('[data-reveal]').forEach(function (group) {
      // Only hide groups still below the viewport; anything already on screen stays visible.
      if (group.getBoundingClientRect().top < vh) return;
      var items = group.hasAttribute('data-reveal-item') ? [group] : $all('[data-reveal-item]', group);
      items.forEach(function (el) {
        var t = getComputedStyle(el).transform;
        el.__finalTransform = t;
        var cfg = REVEALS[group.getAttribute('data-reveal')] || REVEALS.rise;
        el.style.opacity = '0';
        el.style.transform = cfg.from + (t === 'none' ? '' : ' ' + t);
        prepared.add(el);
      });
      group.__items = items;
      io.observe(group);
    });
  }

  function playGroup(group) {
    var cfg = REVEALS[group.getAttribute('data-reveal')] || REVEALS.rise;
    (group.__items || []).forEach(function (el, i) {
      if (!prepared.has(el)) return;
      var delay = Math.min(i * cfg.stagger, 240);
      run(el, cfg.from, { duration: cfg.duration, delay: delay, easing: cfg.easing });
      if (group.getAttribute('data-reveal') === 'slide') {
        var num = el.querySelector('.step-num');
        if (num) {
          num.__finalTransform = 'none';
          run(num, 'scale(0.85)', { duration: 320, delay: delay + 260, easing: SPRING });
        }
      }
    });
  }

  function stopMotion() {
    owned.forEach(function (a) { a.cancel(); });
    owned.clear();
    Array.from(prepared).forEach(clearInline);
    observers.forEach(function (o) { o.disconnect(); });
    observers = [];
    document.documentElement.classList.remove('hero-pending');
  }

  reduceQuery.addEventListener('change', function (e) { if (e.matches) stopMotion(); });

  // ---- FAQ disclosures --------------------------------------------------------
  function initFaq() {
    $all('.faq-item').forEach(function (details) {
      var summary = details.querySelector('summary');
      var panel = details.querySelector('.faq-answer');
      var anim = null;
      summary.addEventListener('click', function (e) {
        if (!motionAllowed()) return;
        e.preventDefault();
        if (anim) { anim.cancel(); anim = null; }
        if (!details.open) {
          details.open = true;
          details.classList.remove('is-closing');
          var h = panel.scrollHeight;
          anim = panel.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 240, easing: EASE });
          anim.onfinish = function () { anim = null; };
        } else {
          details.classList.add('is-closing');
          var h2 = panel.scrollHeight;
          anim = panel.animate([{ height: h2 + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 220, easing: EASE, fill: 'forwards' });
          anim.onfinish = function () {
            details.open = false;
            details.classList.remove('is-closing');
            if (anim) anim.cancel();
            anim = null;
          };
        }
      });
    });
  }

  // ---- Start ------------------------------------------------------------------
  applySiteDetails();
  initHeader();
  initMenu();
  initFaq();
  heroEntrance();
  initReveals();
})();
