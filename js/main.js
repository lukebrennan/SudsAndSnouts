/* Suds & Snouts Dog Grooming */
(function () {
  'use strict';

  // ---- Salon settings: edit in one place -------------------------------------
  var SITE = {
    phoneDisplay: '087 500 4500',
    phoneTel: '+353875004500',
    email: 'hello@sudsandsnouts.com',
    timeZone: 'Europe/Dublin',
    // To send bookings somewhere (Formspree, Make, Zapier, your own API...),
    // put the URL here. Bookings are POSTed as JSON. See README.md.
    bookingEndpoint: ''
  };

  // 0 = Sunday. Times are 24h "HH:MM".
  var HOURS = {
    0: null,
    1: null,
    2: ['08:30', '17:30'],
    3: ['08:30', '17:30'],
    4: ['08:30', '19:30'],
    5: ['08:30', '17:30'],
    6: ['09:00', '16:00']
  };
  var SLOTS = {
    2: ['08:30', '10:00', '11:30', '13:30', '15:00'],
    3: ['08:30', '10:00', '11:30', '13:30', '15:00'],
    4: ['08:30', '10:00', '11:30', '13:30', '15:00'],
    5: ['08:30', '10:00', '11:30', '13:30', '15:00'],
    6: ['09:00', '10:30', '12:00', '13:30']
  };
  var QUIET_DAYS = [2, 3];
  var QUIET_SLOT = '08:30';

  var PRICES = {
    puppy: { small: 30, medium: 30, large: 35, xl: 35 },
    wash:  { small: 35, medium: 45, large: 55, xl: 65 },
    mini:  { small: 42, medium: 50, large: 60, xl: 70 },
    full:  { small: 50, medium: 60, large: 75, xl: 90 },
    strip: null // €40 per hour
  };

  var DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var MON_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Time in Ireland ---------------------------------------------------------
  function dublinNow() {
    var d = new Date();
    try {
      var parts = new Intl.DateTimeFormat('en-GB', { timeZone: SITE.timeZone, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(d);
      var o = {};
      parts.forEach(function (p) { o[p.type] = p.value; });
      var y = +o.year, m = +o.month - 1, day = +o.day;
      var utc = new Date(Date.UTC(y, m, day));
      return { date: utc, dow: utc.getUTCDay(), minutes: (+o.hour % 24) * 60 + (+o.minute) };
    } catch (e) {
      var u = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      return { date: u, dow: d.getDay(), minutes: d.getHours() * 60 + d.getMinutes() };
    }
  }
  function toMin(t) { var p = t.split(':'); return +p[0] * 60 + +p[1]; }
  function prettyTime(t) { var p = t.split(':'); return (+p[0]) + ':' + p[1]; }
  function addDays(date, n) { return new Date(date.getTime() + n * 86400000); }
  function iso(date) { return date.toISOString().slice(0, 10); }

  // ---- Open now status + today's hours -----------------------------------------
  function initOpenStatus() {
    var el = $('[data-open-status]');
    var now = dublinNow();
    $all('[data-hours] [data-day]').forEach(function (row) {
      if (+row.getAttribute('data-day') === now.dow) row.classList.add('is-today');
    });
    if (!el) return;
    var text = $('[data-open-text]', el);
    var h = HOURS[now.dow];
    if (h && now.minutes >= toMin(h[0]) && now.minutes < toMin(h[1])) {
      el.classList.add('is-open');
      text.textContent = 'Open now in Naas until ' + prettyTime(h[1]);
      return;
    }
    // Find next opening
    for (var i = 0; i < 8; i++) {
      var dow = (now.dow + i) % 7;
      var hh = HOURS[dow];
      if (!hh) continue;
      if (i === 0 && now.minutes >= toMin(hh[0])) continue;
      var when = i === 0 ? 'today' : i === 1 ? 'tomorrow' : DAY_NAMES[dow];
      el.classList.add('is-closed');
      text.textContent = 'Closed now · Opens ' + when + ' at ' + prettyTime(hh[0]);
      return;
    }
  }

  // ---- Header -------------------------------------------------------------------
  function initHeader() {
    var header = $('[data-header]');
    var cta = $('[data-mobile-cta]');
    var hero = $('.hero');
    var book = $('#book');
    if (!header) return;
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (!('IntersectionObserver' in window)) return;

    if (cta && hero && book) {
      var heroVisible = true, bookVisible = false;
      var update = function () { cta.classList.toggle('is-visible', !heroVisible && !bookVisible); };
      new IntersectionObserver(function (e) { heroVisible = e[0].isIntersecting; update(); }).observe(hero);
      new IntersectionObserver(function (e) { bookVisible = e[0].isIntersecting; update(); }, { rootMargin: '0px 0px -20% 0px' }).observe(book);
    }

    var links = $all('.primary-nav a');
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('is-active'); a.removeAttribute('aria-current'); });
        var a = map[e.target.id];
        if (a) { a.classList.add('is-active'); a.setAttribute('aria-current', 'true'); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $all('main section[id]').forEach(function (s) { spy.observe(s); });
  }

  // ---- Mobile menu --------------------------------------------------------------
  function initMenu() {
    var toggle = $('[data-menu-toggle]');
    var menu = $('[data-menu]');
    var header = $('[data-header]');
    if (!toggle || !menu) return;
    function focusables() { return [toggle].concat($all('a', menu)); }
    function open() {
      menu.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      header.classList.add('menu-open');
      var first = $('a', menu); if (first) first.focus();
    }
    function close(returnFocus) {
      if (menu.hidden) return;
      menu.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      header.classList.remove('menu-open');
      if (returnFocus) toggle.focus();
    }
    toggle.addEventListener('click', function () { if (menu.hidden) open(); else close(true); });
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
    var mq = matchMedia('(min-width: 1100px)');
    var onChange = function (m) { if (m.matches) close(false); };
    if (mq.addEventListener) mq.addEventListener('change', onChange); else if (mq.addListener) mq.addListener(onChange);
  }

  // ---- Reveal on scroll ------------------------------------------------------------
  function initReveals() {
    var groups = $all('[data-reveal]');
    if (reduceMotion || !('IntersectionObserver' in window)) { groups.forEach(function (g) { g.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    groups.forEach(function (g) { io.observe(g); });
  }

  // ---- FAQ: one open at a time keeps the list tidy ---------------------------------
  function initFaq() {
    var items = $all('.faq-item');
    items.forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (!d.open) return;
        items.forEach(function (o) { if (o !== d) o.open = false; });
      });
    });
  }

  // ---- Booking ---------------------------------------------------------------------
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0) / 4294967295;
  }

  function initBooking() {
    var form = $('[data-booking-form]');
    if (!form) return;
    var strip = $('[data-date-strip]', form);
    var timeGrid = $('[data-time-grid]', form);
    var prevBtn = $('[data-date-prev]', form);
    var nextBtn = $('[data-date-next]', form);
    var monthLabel = $('[data-month-label]', form);
    var quietCheck = $('[data-quiet-check]', form);
    var layout = $('.book-layout');
    var head = $('.book-head');
    var success = $('[data-booking-success]');
    var PER_PAGE = 8;
    var page = 0;
    var selected = { date: null, time: null };

    var now = dublinNow();
    // Open days for the next 6 weeks, starting tomorrow
    function openDays() {
      var out = [];
      for (var i = 1; i <= 42; i++) {
        var d = addDays(now.date, i);
        var dow = d.getUTCDay();
        if (!SLOTS[dow]) continue;
        if (quietCheck.checked && QUIET_DAYS.indexOf(dow) === -1) continue;
        out.push(d);
      }
      return out;
    }

    function isTaken(date, time) {
      // Some slots show as already booked so the diary looks like a real one.
      if (iso(date) === iso(addDays(now.date, 1)) && time < '12:00') return true;
      return hash(iso(date) + time) < 0.32;
    }

    function renderDates() {
      var days = openDays();
      var pages = Math.max(1, Math.ceil(days.length / PER_PAGE));
      if (page > pages - 1) page = pages - 1;
      var slice = days.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);
      strip.innerHTML = '';
      slice.forEach(function (d) {
        var dow = d.getUTCDay();
        var free = SLOTS[dow].filter(function (t) { return !isTaken(d, t); }).length;
        var label = document.createElement('label');
        label.className = 'date-chip' + (QUIET_DAYS.indexOf(dow) !== -1 ? ' has-quiet' : '');
        var input = document.createElement('input');
        input.type = 'radio'; input.name = 'date'; input.value = iso(d);
        input.setAttribute('aria-label', DAY_NAMES[dow] + ' ' + d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()] + ', ' + free + ' times free');
        if (selected.date === iso(d)) input.checked = true;
        var span = document.createElement('span');
        span.innerHTML = '<b>' + DAY_SHORT[dow] + '</b><strong>' + d.getUTCDate() + '</strong><i>' + MON_SHORT[d.getUTCMonth()] + '</i>';
        label.appendChild(input); label.appendChild(span);
        strip.appendChild(label);
      });
      var first = slice[0], last = slice[slice.length - 1];
      if (first) {
        var m1 = MONTHS[first.getUTCMonth()], m2 = MONTHS[last.getUTCMonth()];
        monthLabel.textContent = m1 === m2 ? m1 + ' ' + first.getUTCFullYear() : m1 + ' to ' + m2;
      }
      prevBtn.disabled = page === 0;
      nextBtn.disabled = page >= pages - 1;
    }

    function renderTimes() {
      timeGrid.innerHTML = '';
      if (!selected.date) { timeGrid.innerHTML = '<p class="muted small">Pick a day to see times.</p>'; return; }
      var d = new Date(selected.date + 'T00:00:00Z');
      var dow = d.getUTCDay();
      SLOTS[dow].forEach(function (t) {
        var taken = isTaken(d, t);
        var quiet = QUIET_DAYS.indexOf(dow) !== -1 && t === QUIET_SLOT;
        var label = document.createElement('label');
        label.className = 'time-chip' + (taken ? ' is-taken' : '');
        var input = document.createElement('input');
        input.type = 'radio'; input.name = 'time'; input.value = t; input.disabled = taken;
        input.setAttribute('aria-label', prettyTime(t) + (quiet ? ', Quiet Hour' : '') + (taken ? ', booked' : ''));
        if (selected.time === t && !taken) input.checked = true;
        var span = document.createElement('span');
        span.innerHTML = prettyTime(t) + (quiet ? '<small>Quiet Hour</small>' : '');
        label.appendChild(input); label.appendChild(span);
        timeGrid.appendChild(label);
      });
    }

    function money(n) { return '€' + n; }

    function readState() {
      var service = $('input[name="service"]:checked', form);
      var size = $('input[name="size"]:checked', form);
      var addons = $all('input[name="addons"]:checked', form);
      var addonTotal = addons.reduce(function (s, a) { return s + (+a.getAttribute('data-price')); }, 0);
      var base = PRICES[service.value];
      var priceText;
      if (!base) priceText = '€40/hr' + (addonTotal ? ' + ' + money(addonTotal) : '');
      else priceText = (size.value === 'xl' && service.value !== 'puppy' ? 'from ' : '') + money(base[size.value] + addonTotal);
      var when = 'Pick a day and time';
      if (selected.date) {
        var d = new Date(selected.date + 'T00:00:00Z');
        when = DAY_SHORT[d.getUTCDay()] + ' ' + d.getUTCDate() + ' ' + MON_SHORT[d.getUTCMonth()] + (selected.time ? ', ' + prettyTime(selected.time) : ', pick a time');
      }
      return {
        service: service.getAttribute('data-label'),
        serviceKey: service.value,
        size: size.getAttribute('data-label'),
        addons: addons.map(function (a) { return a.value; }),
        price: priceText,
        when: when,
        date: selected.date,
        time: selected.time
      };
    }

    function updateSummary() {
      var s = readState();
      var set = function (k, v) { $all('[data-sum="' + k + '"]').forEach(function (el) { el.textContent = v; }); };
      set('service', s.service);
      set('size', s.size);
      set('addons', s.addons.length ? s.addons.join(', ') : 'None');
      set('when', s.when);
      set('price', s.price);
    }

    strip.addEventListener('change', function (e) {
      if (e.target.name !== 'date') return;
      selected.date = e.target.value;
      selected.time = null;
      renderTimes();
      var d = new Date(selected.date + 'T00:00:00Z');
      if (quietCheck.checked && QUIET_DAYS.indexOf(d.getUTCDay()) !== -1 && !isTaken(d, QUIET_SLOT)) {
        selected.time = QUIET_SLOT;
        renderTimes();
      }
      clearError('slot');
      updateSummary();
    });
    timeGrid.addEventListener('change', function (e) {
      if (e.target.name !== 'time') return;
      selected.time = e.target.value;
      clearError('slot');
      updateSummary();
    });
    prevBtn.addEventListener('click', function () { page = Math.max(0, page - 1); renderDates(); });
    nextBtn.addEventListener('click', function () { page++; renderDates(); });
    quietCheck.addEventListener('change', function () {
      page = 0;
      if (selected.date) {
        var dow = new Date(selected.date + 'T00:00:00Z').getUTCDay();
        if (quietCheck.checked && QUIET_DAYS.indexOf(dow) === -1) selected.date = null;
      }
      if (quietCheck.checked) {
        selectFirstDay();
        var qd = new Date(selected.date + 'T00:00:00Z');
        selected.time = isTaken(qd, QUIET_SLOT) ? null : QUIET_SLOT;
      }
      renderDates(); renderTimes(); updateSummary();
    });
    form.addEventListener('change', function (e) {
      if (/^(service|size|addons)$/.test(e.target.name)) updateSummary();
    });

    // "Book a Quiet Hour" button pre-ticks the nervous dog option
    $all('[data-quiet-link]').forEach(function (a) {
      a.addEventListener('click', function () {
        if (!quietCheck.checked) { quietCheck.checked = true; quietCheck.dispatchEvent(new Event('change', { bubbles: true })); }
      });
    });

    // Validation
    function showError(name, field) {
      var msg = $('[data-error-for="' + name + '"]', form);
      if (msg) msg.hidden = false;
      if (field) field.setAttribute('aria-invalid', 'true');
    }
    function clearError(name) {
      var msg = $('[data-error-for="' + name + '"]', form);
      if (msg) msg.hidden = true;
      var field = form.elements[name];
      if (field && field.removeAttribute) field.removeAttribute('aria-invalid');
    }
    ['dogName', 'ownerName', 'phone', 'email', 'consent'].forEach(function (n) {
      var f = form.elements[n];
      if (!f) return;
      var msg = $('[data-error-for="' + n + '"]', form);
      if (msg) { msg.id = 'err-' + n; f.setAttribute('aria-describedby', msg.id); }
      f.addEventListener('input', function () { clearError(n); });
      f.addEventListener('change', function () { clearError(n); });
    });

    function validate() {
      var firstBad = null;
      var bad = function (name, el) { showError(name, el); if (!firstBad) firstBad = el; };
      if (!selected.date || !selected.time) bad('slot', strip.querySelector('input') || strip);
      var dog = form.elements.dogName, owner = form.elements.ownerName, phone = form.elements.phone, email = form.elements.email, consent = form.elements.consent;
      if (!dog.value.trim()) bad('dogName', dog);
      if (!owner.value.trim()) bad('ownerName', owner);
      if (phone.value.replace(/\D/g, '').length < 9) bad('phone', phone);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) bad('email', email);
      if (!consent.checked) bad('consent', consent);
      if (firstBad) {
        var target = firstBad.closest('.field, .book-step, .check') || firstBad;
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        try { firstBad.focus({ preventScroll: true }); } catch (e) { firstBad.focus(); }
        return false;
      }
      return true;
    }

    function submitBooking(payload) {
      if (!SITE.bookingEndpoint) return new Promise(function (r) { setTimeout(r, 700); });
      return fetch(SITE.bookingEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (res) { if (!res.ok) throw new Error('Booking failed: ' + res.status); return res; });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) return;
      var s = readState();
      var payload = {
        service: s.service, size: s.size, addons: s.addons, estimatedPrice: s.price,
        date: s.date, time: s.time,
        quietHour: quietCheck.checked,
        dogName: form.elements.dogName.value.trim(),
        breed: form.elements.breed.value.trim(),
        ownerName: form.elements.ownerName.value.trim(),
        phone: form.elements.phone.value.trim(),
        email: form.elements.email.value.trim(),
        notes: form.elements.notes.value.trim(),
        newClient: form.elements.newClient.checked,
        submittedAt: new Date().toISOString()
      };
      var btn = $('button[type="submit"]', form);
      var original = btn.innerHTML;
      btn.disabled = true;
      btn.textContent = 'Sending…';
      submitBooking(payload).then(function () {
        var list = $('[data-success-list]', success);
        var dog = payload.dogName;
        var rows = [['Dog', dog + (payload.breed ? ' (' + payload.breed + ')' : '')], ['Groom', s.service + ', ' + s.size], ['When', s.when], ['Estimate', s.price]];
        if (s.addons.length) rows.splice(2, 0, ['Extras', s.addons.join(', ')]);
        list.innerHTML = '';
        rows.forEach(function (r) {
          var div = document.createElement('div');
          var dt = document.createElement('dt'); dt.textContent = r[0];
          var dd = document.createElement('dd'); dd.textContent = r[1];
          div.appendChild(dt); div.appendChild(dd); list.appendChild(div);
        });
        $('[data-success-text]', success).textContent = 'We can’t wait to meet ' + dog + '! We’ll text ' + payload.phone + ' to confirm your appointment, usually within a few hours during opening times.';
        layout.hidden = true;
        if (head) head.hidden = true;
        success.hidden = false;
        success.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        success.focus({ preventScroll: true });
      }).catch(function () {
        alert('Sorry, something went wrong sending your booking. Please call us on ' + SITE.phoneDisplay + '.');
      }).then(function () {
        btn.disabled = false;
        btn.innerHTML = original;
      });
    });

    $('[data-booking-again]').addEventListener('click', function () {
      ['dogName', 'breed', 'notes'].forEach(function (n) { form.elements[n].value = ''; });
      page = 0;
      selectFirstDay();
      renderDates(); renderTimes(); updateSummary();
      success.hidden = true;
      layout.hidden = false;
      if (head) head.hidden = false;
      $('#book').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    });

    function selectFirstDay() {
      var days = openDays();
      var first = days[0];
      if (quietCheck.checked) {
        // Jump to the first day whose Quiet Hour is still free
        for (var i = 0; i < days.length; i++) { if (!isTaken(days[i], QUIET_SLOT)) { first = days[i]; break; } }
        page = Math.floor(days.indexOf(first) / PER_PAGE);
      }
      selected.date = first ? iso(first) : null;
      selected.time = null;
    }

    selectFirstDay();
    renderDates();
    renderTimes();
    updateSummary();
  }

  // ---- Start --------------------------------------------------------------------
  $all('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
  initOpenStatus();
  initHeader();
  initMenu();
  initReveals();
  initFaq();
  initBooking();
})();
