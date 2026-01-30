// Consolidated site script: nav, smooth scroll, filters, chips, booking, responsive socials
(function () {
  'use strict';

  function debounce(fn, wait) {
    if (wait === void 0) { wait = 180; }
    var t;
    return function () {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) { args[_i] = arguments[_i]; }
      clearTimeout(t);
      t = setTimeout(function () { return fn.apply(void 0, args); }, wait);
    };
  }

  function parseDurationFilter(v) {
    if (!v) return null;
    v = String(v).trim();
    if (v.indexOf('-') !== -1) {
      var parts = v.split('-');
      var a = Number(parts[0]) || 0;
      var b = Number(parts[1]) || 0;
      return { min: a, max: b };
    }
    if (v.endsWith('+')) {
      var n = Number(v.slice(0, -1)) || 0;
      return { min: n, max: Infinity };
    }
    var n = Number(v);
    if (!isNaN(n) && n > 0) return { min: n, max: n };
    return null;
  }

  document.addEventListener('DOMContentLoaded', function () {
    // nav toggle
    var toggle = document.querySelector('.nav-toggle');
    var links = document.getElementById('main-nav');
    if (toggle && links) {
      toggle.addEventListener('click', function () {
        var expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));
        links.classList.toggle('open');
        links.setAttribute('aria-hidden', String(!links.classList.contains('open')));
      });
      links.setAttribute('aria-hidden', String(!links.classList.contains('open')));
    }

    // smooth scroll
    Array.prototype.slice.call(document.querySelectorAll('a[href^="#"]')).forEach(function (a) {
      a.addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (href && href.length > 1) {
          var target = document.querySelector(href);
          if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
        }
      });
    });

    // filters/search
    var input = document.getElementById('dest-search');
    var clearBtn = document.getElementById('clear-search');
    var destSelect = document.getElementById('filter-destination');
    var activitySelect = document.getElementById('filter-activity');
    var durationSelect = document.getElementById('filter-duration');
    var minInput = document.getElementById('filter-min');
    var maxInput = document.getElementById('filter-max');
    var applyBtn = document.getElementById('apply-filters');
    var resetBtn = document.getElementById('reset-filters');
    var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.destination-card'));

    var noResults = document.querySelector('.no-results');
    if (!noResults) {
      var destContainer = document.querySelector('.destinations .container') || document.querySelector('main') || document.body;
      noResults = document.createElement('div');
      noResults.className = 'no-results';
      noResults.textContent = 'No destinations match your filters. Try expanding your search or reset filters.';
      destContainer.appendChild(noResults);
    }

    function matchesFilters(card) {
      var q = (input && input.value ? input.value : '').trim().toLowerCase();
      var titleEl = card.querySelector('h3');
      var title = titleEl ? (titleEl.textContent || '').toLowerCase() : '';
      if (q && title.indexOf(q) === -1) return false;
      var key = card.dataset.key || '';
      if (destSelect && destSelect.value && destSelect.value !== key) return false;
      var activity = card.dataset.activity || '';
      if (activitySelect && activitySelect.value && activitySelect.value !== activity) return false;
      var dur = Number(card.dataset.duration || 0);
      var dFilter = parseDurationFilter(durationSelect ? durationSelect.value : null);
      if (dFilter) { if (dur < dFilter.min || dur > dFilter.max) return false; }
      var price = Number(card.dataset.price || 0);
      var min = Number(minInput && minInput.value ? minInput.value : 0);
      var max = Number(maxInput && maxInput.value ? maxInput.value : 0);
      if (min && price < min) return false;
      if (max && max > 0 && price > max) return false;
      return true;
    }

    function runFilter() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = matchesFilters(card);
        card.style.display = ok ? '' : 'none';
        if (ok) visible++;
      });
      if (visible === 0) noResults.classList.add('show'); else noResults.classList.remove('show');
    }

    var debouncedRun = debounce(runFilter, 180);
    if (input) { input.addEventListener('input', debouncedRun); }
    if (clearBtn) { clearBtn.addEventListener('click', function () { if (input) input.value = ''; runFilter(); }); }
    if (applyBtn) applyBtn.addEventListener('click', runFilter);
    if (resetBtn) resetBtn.addEventListener('click', function () {
      if (destSelect) destSelect.value = '';
      if (activitySelect) activitySelect.value = '';
      if (durationSelect) durationSelect.value = '';
      if (minInput) minInput.value = '';
      if (maxInput) maxInput.value = '';
      if (input) input.value = '';
      chips.forEach(function (ch) { ch.classList.remove('chip-active'); ch.setAttribute('aria-pressed', 'false'); });
      runFilter();
    });

    chips.forEach(function (ch) {
      ch.setAttribute('role', 'button'); ch.setAttribute('tabindex', '0'); ch.setAttribute('aria-pressed', 'false');
      ch.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ch.click(); } });
      ch.addEventListener('click', function () {
        var wasActive = ch.classList.contains('chip-active');
        chips.forEach(function (c) { c.classList.remove('chip-active'); c.setAttribute('aria-pressed', 'false'); });
        if (!wasActive) {
          ch.classList.add('chip-active'); ch.setAttribute('aria-pressed', 'true');
          var fk = ch.dataset.filterKey; var fv = ch.dataset.filterValue;
          if (fk && fv) {
            if (fk === 'destination' && destSelect) destSelect.value = fv;
            else if (fk === 'activity' && activitySelect) activitySelect.value = fv;
            else if (fk === 'duration' && durationSelect) durationSelect.value = fv;
            else if (fk === 'max' && maxInput) maxInput.value = fv;
            else if (fk === 'min' && minInput) minInput.value = fv;
          } else {
            var t = (ch.textContent || '').toLowerCase();
            if (t.indexOf('gorilla') !== -1 && activitySelect) activitySelect.value = 'gorilla';
            else if (/\d+[-–]\d+/.test(t) && durationSelect) durationSelect.value = t.match(/(\d+[-–]\d+)/)[0];
            else if (/\d+\+/.test(t) && durationSelect) durationSelect.value = t.match(/(\d+\+)/)[0];
            else if (/\$?\d+/.test(t) && maxInput) maxInput.value = t.match(/(\d+)/)[0];
          }
        } else {
          if (destSelect) destSelect.value = '';
          if (activitySelect) activitySelect.value = '';
          if (durationSelect) durationSelect.value = '';
          if (minInput) minInput.value = '';
          if (maxInput) maxInput.value = '';
        }
        runFilter();
      });
    });

    runFilter();

    var topbarSocial = document.querySelector('.topbar-social');
    function syncSocials() {
      if (!topbarSocial || !links) return;
      var mobileBreakpoint = 800;
      var existing = links.querySelector('.nav-socials');
      if (window.innerWidth <= mobileBreakpoint) {
        topbarSocial.style.display = 'none';
        if (!existing) {
          var wrapper = document.createElement('div');
          wrapper.className = 'nav-socials';
          wrapper.setAttribute('aria-hidden', 'false');
          wrapper.style.display = 'flex'; wrapper.style.gap = '8px'; wrapper.style.marginTop = '8px';
          topbarSocial.querySelectorAll('.social-link').forEach(function (a) {
            var clone = a.cloneNode(true);
            clone.classList.add('nav-social-link');
            wrapper.appendChild(clone);
          });
          links.appendChild(wrapper);
        }
      } else {
        topbarSocial.style.display = '';
        if (existing) existing.remove();
      }
    }

    var onResize = debounce(function () {
      syncSocials();
      if (links) links.setAttribute('aria-hidden', String(!links.classList.contains('open')));
    }, 200);
    window.addEventListener('resize', onResize);
    syncSocials();

    var form = document.getElementById('booking-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        var isNetlify = form.dataset.netlify === 'true' || form.getAttribute('data-netlify') === 'true';
        var data = new FormData(form);
        var name = (data.get('name') || '').toString().trim();
        var email = (data.get('email') || '').toString().trim();
        var destination = (data.get('destination') || '').toString().trim();
        if (!name || !email || !destination) {
          e.preventDefault(); showBookingMessage('Please fill name, email and choose a destination.', 'error'); return;
        }
        if (isNetlify) return;
        e.preventDefault();
        var date = data.get('start_date') || '';
        var message = data.get('message') || '';
        var subject = encodeURIComponent('Booking request: ' + destination);
        var body = encodeURIComponent('Name: ' + name + '%0AEmail: ' + email + '%0ADestination: ' + destination + '%0AStart date: ' + date + '%0A%0A' + message);
        var mailto = 'mailto:info@jangleadventures.ug?subject=' + subject + '&body=' + body;
        showBookingMessage('Your booking request is ready. Open your email client to send it, or close this message.', 'success', mailto);
      });
    }

    function showBookingMessage(text, type, mailto) {
      if (type === void 0) { type = 'info'; }
      var formEl = document.getElementById('booking-form'); if (!formEl) return;
      var existing = formEl.querySelector('.booking-msg'); if (existing) existing.remove();
      var div = document.createElement('div'); div.className = 'booking-msg card';
      div.setAttribute('role', 'status'); div.setAttribute('aria-live', 'polite');
      div.style.display = 'flex'; div.style.alignItems = 'center'; div.style.gap = '8px'; div.style.marginTop = '10px';
      var textEl = document.createElement('div'); textEl.textContent = text; div.appendChild(textEl);
      var actions = document.createElement('div'); actions.style.marginLeft = 'auto';
      if (mailto) { var openBtn = document.createElement('button'); openBtn.type = 'button'; openBtn.className = 'btn'; openBtn.textContent = 'Open Mail'; openBtn.addEventListener('click', function () { window.location.href = mailto; }); actions.appendChild(openBtn); }
      var closeBtn = document.createElement('button'); closeBtn.type = 'button'; closeBtn.className = 'btn small'; closeBtn.textContent = 'Close'; closeBtn.addEventListener('click', function () { div.remove(); }); actions.appendChild(closeBtn);
      div.appendChild(actions); formEl.appendChild(div);
      if (type === 'success') setTimeout(function () { div.remove(); }, 9000);
    }

    // --- callback mini-form handler (static, opens email client) ---
    var callbackForm = document.getElementById('callback-form');
    if (callbackForm) {
      callbackForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var f = new FormData(callbackForm);
        var name = (f.get('cb_name') || '').toString().trim();
        var phone = (f.get('cb_phone') || '').toString().trim();
        if (!name || !phone) {
          // minimal accessible inline feedback
          alert('Please provide your name and phone number.');
          return;
        }
        var subject = encodeURIComponent('Callback request from website');
        var body = encodeURIComponent('Name: ' + name + '\nPhone: ' + phone + '\n\nPlease call back at your earliest convenience.');
        var mailto = 'mailto:info@jangleadventures.ug?subject=' + subject + '&body=' + body;
        // open user's mail client
        window.location.href = mailto;
      });
    }

    var searchForm = document.getElementById('dest-search-form');
    if (searchForm && input) { searchForm.addEventListener('submit', function (e) { e.preventDefault(); runFilter(); input.focus(); }); }

  });

})();

// Back-to-top button behavior: show when scrolled and smooth-scroll to top
document.addEventListener('DOMContentLoaded', function () {
  try {
    var bt = document.querySelector('.back-to-top');
    if (!bt) return;
    var showAfter = 240;
    function checkShown() {
      if (window.pageYOffset > showAfter) bt.classList.add('show'); else bt.classList.remove('show');
    }
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () { checkShown(); ticking = false; });
        ticking = true;
      }
    });
    checkShown();
    bt.addEventListener('click', function (e) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); bt.blur(); });
  } catch (err) { console.warn('back-to-top init error', err); }
});
// Simple hero slideshow (fades between images)
document.addEventListener('DOMContentLoaded', function () {
  try {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slideshow img'));
    if (!slides || slides.length === 0) return;
    var idx = 0;
    slides.forEach(function(s, i){ s.classList.remove('active'); s.style.opacity = '0'; });
    slides[0].classList.add('active'); slides[0].style.opacity = '1';
    var interval = 5000;
    var timer = setInterval(function(){
      slides[idx].classList.remove('active'); slides[idx].style.opacity = '0';
      idx = (idx + 1) % slides.length;
      slides[idx].classList.add('active'); slides[idx].style.opacity = '1';
    }, interval);
    // Pause on hover of hero
    var hero = document.querySelector('.hero');
    if (hero) {
      hero.addEventListener('mouseenter', function(){ clearInterval(timer); });
      hero.addEventListener('mouseleave', function(){ timer = setInterval(function(){ slides[idx].classList.remove('active'); slides[idx].style.opacity = '0'; idx = (idx + 1) % slides.length; slides[idx].classList.add('active'); slides[idx].style.opacity = '1'; }, interval); });
    }
  } catch (e) { console.warn('Hero slideshow init error', e); }
});
// Consolidated site script: nav, smooth scroll, filters, chips, booking, responsive socials
(function () {
  'use strict';

  function debounce(fn, wait = 180) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function parseDurationFilter(v) {
    if (!v) return null;
    v = String(v).trim();
    if (v.includes('-')) {
      const [a, b] = v.split('-').map(n => Number(n) || 0);
      return { min: a, max: b };
    }
    if (v.endsWith('+')) {
      const n = Number(v.slice(0, -1)) || 0;
      return { min: n, max: Infinity };
    }
    const n = Number(v);
    if (!isNaN(n) && n > 0) return { min: n, max: n };
    return null;
  }

  document.addEventListener('DOMContentLoaded', function () {
    // --- nav toggle ---
    var toggle = document.querySelector('.nav-toggle');
    var links = document.getElementById('main-nav');
    if (toggle && links) {
      toggle.addEventListener('click', function () {
        var expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));
        links.classList.toggle('open');
        links.setAttribute('aria-hidden', String(!links.classList.contains('open')));
      });
      links.setAttribute('aria-hidden', String(!links.classList.contains('open')));
    }

    // --- smooth scroll for in-page anchors ---
    Array.prototype.slice.call(document.querySelectorAll('a[href^="#"]')).forEach(function (a) {
      a.addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (href && href.length > 1) {
          var target = document.querySelector(href);
          if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
        }
      });
    });

    // --- filters / search ---
    var input = document.getElementById('dest-search');
    var clearBtn = document.getElementById('clear-search');
    var destSelect = document.getElementById('filter-destination');
    var activitySelect = document.getElementById('filter-activity');
    var durationSelect = document.getElementById('filter-duration');
    var minInput = document.getElementById('filter-min');
    var maxInput = document.getElementById('filter-max');
    var applyBtn = document.getElementById('apply-filters');
    var resetBtn = document.getElementById('reset-filters');
    var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.destination-card'));

    var noResults = document.querySelector('.no-results');
    if (!noResults) {
      var destContainer = document.querySelector('.destinations .container') || document.querySelector('main') || document.body;
      noResults = document.createElement('div');
      noResults.className = 'no-results';
      noResults.textContent = 'No destinations match your filters. Try expanding your search or reset filters.';
      destContainer.appendChild(noResults);
    }

    function matchesFilters(card) {
      var q = (input && input.value ? input.value : '').trim().toLowerCase();
      var titleEl = card.querySelector('h3');
      var title = titleEl ? (titleEl.textContent || '').toLowerCase() : '';
      if (q && title.indexOf(q) === -1) return false;
      var key = card.dataset.key || '';
      if (destSelect && destSelect.value && destSelect.value !== key) return false;
      var activity = card.dataset.activity || '';
      if (activitySelect && activitySelect.value && activitySelect.value !== activity) return false;
      var dur = Number(card.dataset.duration || 0);
      var dFilter = parseDurationFilter(durationSelect ? durationSelect.value : null);
      if (dFilter) { if (dur < dFilter.min || dur > dFilter.max) return false; }
      var price = Number(card.dataset.price || 0);
      var min = Number(minInput && minInput.value ? minInput.value : 0);
      var max = Number(maxInput && maxInput.value ? maxInput.value : 0);
      if (min && price < min) return false;
      if (max && max > 0 && price > max) return false;
      return true;
    }

    function runFilter() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = matchesFilters(card);
        card.style.display = ok ? '' : 'none';
        if (ok) visible++;
      });
      if (visible === 0) noResults.classList.add('show'); else noResults.classList.remove('show');
    }

    var debouncedRun = debounce(runFilter, 180);
    if (input) { input.addEventListener('input', debouncedRun); }
    if (clearBtn) { clearBtn.addEventListener('click', function () { if (input) input.value = ''; runFilter(); }); }
    if (applyBtn) applyBtn.addEventListener('click', runFilter);
    if (resetBtn) resetBtn.addEventListener('click', function () {
      if (destSelect) destSelect.value = '';
      if (activitySelect) activitySelect.value = '';
      if (durationSelect) durationSelect.value = '';
      if (minInput) minInput.value = '';
      if (maxInput) maxInput.value = '';
      if (input) input.value = '';
      chips.forEach(function (ch) { ch.classList.remove('chip-active'); ch.setAttribute('aria-pressed', 'false'); });
      runFilter();
    });

    chips.forEach(function (ch) {
      ch.setAttribute('role', 'button'); ch.setAttribute('tabindex', '0'); ch.setAttribute('aria-pressed', 'false');
      ch.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ch.click(); } });
      ch.addEventListener('click', function () {
        var wasActive = ch.classList.contains('chip-active');
        chips.forEach(function (c) { c.classList.remove('chip-active'); c.setAttribute('aria-pressed', 'false'); });
        if (!wasActive) {
          ch.classList.add('chip-active'); ch.setAttribute('aria-pressed', 'true');
          var fk = ch.dataset.filterKey; var fv = ch.dataset.filterValue;
          if (fk && fv) {
            if (fk === 'destination' && destSelect) destSelect.value = fv;
            else if (fk === 'activity' && activitySelect) activitySelect.value = fv;
            else if (fk === 'duration' && durationSelect) durationSelect.value = fv;
            else if (fk === 'max' && maxInput) maxInput.value = fv;
            else if (fk === 'min' && minInput) minInput.value = fv;
          } else {
            var t = (ch.textContent || '').toLowerCase();
            if (t.indexOf('gorilla') !== -1 && activitySelect) activitySelect.value = 'gorilla';
            else if (/\d+[-–]\d+/.test(t) && durationSelect) durationSelect.value = t.match(/(\d+[-–]\d+)/)[0];
            else if (/\d+\+/.test(t) && durationSelect) durationSelect.value = t.match(/(\d+\+)/)[0];
            else if (/\$?\d+/.test(t) && maxInput) maxInput.value = t.match(/(\d+)/)[0];
          }
        } else {
          if (destSelect) destSelect.value = '';
          if (activitySelect) activitySelect.value = '';
          if (durationSelect) durationSelect.value = '';
          if (minInput) minInput.value = '';
          if (maxInput) maxInput.value = '';
        }
        runFilter();
      });
    });

    runFilter();

    var topbarSocial = document.querySelector('.topbar-social');
    function syncSocials() {
      if (!topbarSocial || !links) return;
      var mobileBreakpoint = 800;
      var existing = links.querySelector('.nav-socials');
      if (window.innerWidth <= mobileBreakpoint) {
        topbarSocial.style.display = 'none';
        if (!existing) {
          var wrapper = document.createElement('div');
          wrapper.className = 'nav-socials';
          wrapper.setAttribute('aria-hidden', 'false');
          wrapper.style.display = 'flex'; wrapper.style.gap = '8px'; wrapper.style.marginTop = '8px';
          topbarSocial.querySelectorAll('.social-link').forEach(function (a) {
            var clone = a.cloneNode(true);
            clone.classList.add('nav-social-link');
            wrapper.appendChild(clone);
          });
          links.appendChild(wrapper);
        }
      } else {
        topbarSocial.style.display = '';
        if (existing) existing.remove();
      }
    }

    var onResize = debounce(function () {
      syncSocials();
      if (links) links.setAttribute('aria-hidden', String(!links.classList.contains('open')));
    }, 200);
    window.addEventListener('resize', onResize);
    syncSocials();

    var form = document.getElementById('booking-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        var isNetlify = form.dataset.netlify === 'true' || form.getAttribute('data-netlify') === 'true';
        var data = new FormData(form);
        var name = (data.get('name') || '').toString().trim();
        var email = (data.get('email') || '').toString().trim();
        var destination = (data.get('destination') || '').toString().trim();
        if (!name || !email || !destination) {
          e.preventDefault(); showBookingMessage('Please fill name, email and choose a destination.', 'error'); return;
        }
        if (isNetlify) return;
        e.preventDefault();
        var date = data.get('start_date') || '';
        var message = data.get('message') || '';
        var subject = encodeURIComponent('Booking request: ' + destination);
        var body = encodeURIComponent('Name: ' + name + '%0AEmail: ' + email + '%0ADestination: ' + destination + '%0AStart date: ' + date + '%0A%0A' + message);
        var mailto = 'mailto:info@jangleadventures.ug?subject=' + subject + '&body=' + body;
        showBookingMessage('Your booking request is ready. Open your email client to send it, or close this message.', 'success', mailto);
      });
    }

    function showBookingMessage(text, type, mailto) {
      if (type === void 0) { type = 'info'; }
      var formEl = document.getElementById('booking-form'); if (!formEl) return;
      var existing = formEl.querySelector('.booking-msg'); if (existing) existing.remove();
      var div = document.createElement('div'); div.className = 'booking-msg card';
      div.setAttribute('role', 'status'); div.setAttribute('aria-live', 'polite');
      div.style.display = 'flex'; div.style.alignItems = 'center'; div.style.gap = '8px'; div.style.marginTop = '10px';
      var textEl = document.createElement('div'); textEl.textContent = text; div.appendChild(textEl);
      var actions = document.createElement('div'); actions.style.marginLeft = 'auto';
      if (mailto) { var openBtn = document.createElement('button'); openBtn.type = 'button'; openBtn.className = 'btn'; openBtn.textContent = 'Open Mail'; openBtn.addEventListener('click', function () { window.location.href = mailto; }); actions.appendChild(openBtn); }
      var closeBtn = document.createElement('button'); closeBtn.type = 'button'; closeBtn.className = 'btn small'; closeBtn.textContent = 'Close'; closeBtn.addEventListener('click', function () { div.remove(); }); actions.appendChild(closeBtn);
      div.appendChild(actions); formEl.appendChild(div);
      if (type === 'success') setTimeout(function () { div.remove(); }, 9000);
    }

    var searchForm = document.getElementById('dest-search-form');
    if (searchForm && input) { searchForm.addEventListener('submit', function (e) { e.preventDefault(); runFilter(); input.focus(); }); }

  });

})();

// Consolidated site script: nav, smooth scroll, filters, chips, booking, responsive socials
(() => {
	'use strict';

	function debounce(fn, wait = 180) {
		let t;
		return function (...args) {
			clearTimeout(t);
			t = setTimeout(() => fn.apply(this, args), wait);
		};
	}

	function parseDurationFilter(v) {
		if (!v) return null;
		v = String(v).trim();
		if (v.includes('-')) {
			const [a, b] = v.split('-').map(n => Number(n) || 0);
			return { min: a, max: b };
		}
		if (v.endsWith('+')) {
			const n = Number(v.slice(0, -1)) || 0;
			return { min: n, max: Infinity };
		}
		const n = Number(v);
		if (!isNaN(n) && n > 0) return { min: n, max: n };
		return null;
	}

	document.addEventListener('DOMContentLoaded', () => {
		// --- nav toggle ---
		const toggle = document.querySelector('.nav-toggle');
		const links = document.getElementById('main-nav');
		if (toggle && links) {
			toggle.addEventListener('click', () => {
				const expanded = toggle.getAttribute('aria-expanded') === 'true';
				toggle.setAttribute('aria-expanded', String(!expanded));
				links.classList.toggle('open');
				links.setAttribute('aria-hidden', String(!links.classList.contains('open')));
			});
			// ensure initial aria-hidden reflects nav visibility
			links.setAttribute('aria-hidden', String(!links.classList.contains('open')));
		}

		// --- smooth scroll for in-page anchors ---
		document.querySelectorAll('a[href^="#"]').forEach(a => {
			a.addEventListener('click', function (e) {
				const href = this.getAttribute('href');
				if (href && href.length > 1) {
					const target = document.querySelector(href);
					if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
				}
			});
		});

		// --- filters / search ---
		const input = document.getElementById('dest-search');
		const clearBtn = document.getElementById('clear-search');
		const destSelect = document.getElementById('filter-destination');
		const activitySelect = document.getElementById('filter-activity');
		const durationSelect = document.getElementById('filter-duration');
		const minInput = document.getElementById('filter-min');
		const maxInput = document.getElementById('filter-max');
		const applyBtn = document.getElementById('apply-filters');
		const resetBtn = document.getElementById('reset-filters');
		const chips = Array.from(document.querySelectorAll('.chip'));
		const cards = Array.from(document.querySelectorAll('.destination-card'));

		// create or find no-results element
		let noResults = document.querySelector('.no-results');
		if (!noResults) {
			const destContainer = document.querySelector('.destinations .container') || document.querySelector('main') || document.body;
			noResults = document.createElement('div');
			noResults.className = 'no-results';
			noResults.textContent = 'No destinations match your filters. Try expanding your search or reset filters.';
			destContainer.appendChild(noResults);
		}

		function matchesFilters(card) {
			const q = (input?.value || '').trim().toLowerCase();
			const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
			if (q && !title.includes(q)) return false;
			const key = card.dataset.key || '';
			if (destSelect && destSelect.value && destSelect.value !== key) return false;
			const activity = card.dataset.activity || '';
			if (activitySelect && activitySelect.value && activitySelect.value !== activity) return false;
			const dur = Number(card.dataset.duration || 0);
			const dFilter = parseDurationFilter(durationSelect?.value);
			if (dFilter) { if (dur < dFilter.min || dur > dFilter.max) return false; }
			const price = Number(card.dataset.price || 0);
			const min = Number(minInput?.value || 0);
			const max = Number(maxInput?.value || 0);
			if (min && price < min) return false;
			if (max && max > 0 && price > max) return false;
			return true;
		}

		function runFilter() {
			let visible = 0;
			cards.forEach(card => {
				const ok = matchesFilters(card);
				card.style.display = ok ? '' : 'none';
				if (ok) visible++;
			});
			if (visible === 0) noResults.classList.add('show'); else noResults.classList.remove('show');
		}

		const debouncedRun = debounce(runFilter, 180);
		if (input) { input.addEventListener('input', debouncedRun); }
		if (clearBtn) { clearBtn.addEventListener('click', () => { if (input) input.value = ''; runFilter(); }); }
		if (applyBtn) applyBtn.addEventListener('click', runFilter);
		if (resetBtn) resetBtn.addEventListener('click', () => {
			if (destSelect) destSelect.value = '';
			if (activitySelect) activitySelect.value = '';
			if (durationSelect) durationSelect.value = '';
			if (minInput) minInput.value = '';
			if (maxInput) maxInput.value = '';
			if (input) input.value = '';
			chips.forEach(ch => { ch.classList.remove('chip-active'); ch.setAttribute('aria-pressed', 'false'); });
			runFilter();
		});

		// accessible chips
		chips.forEach(ch => {
			ch.setAttribute('role', 'button'); ch.setAttribute('tabindex', '0'); ch.setAttribute('aria-pressed', 'false');
			ch.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ch.click(); } });
			ch.addEventListener('click', () => {
				const wasActive = ch.classList.contains('chip-active');
				chips.forEach(c => { c.classList.remove('chip-active'); c.setAttribute('aria-pressed', 'false'); });
				if (!wasActive) {
					ch.classList.add('chip-active'); ch.setAttribute('aria-pressed', 'true');
					const fk = ch.dataset.filterKey; const fv = ch.dataset.filterValue;
					if (fk && fv) {
						if (fk === 'destination' && destSelect) destSelect.value = fv;
						else if (fk === 'activity' && activitySelect) activitySelect.value = fv;
						else if (fk === 'duration' && durationSelect) durationSelect.value = fv;
						else if (fk === 'max' && maxInput) maxInput.value = fv;
						else if (fk === 'min' && minInput) minInput.value = fv;
					} else {
						// fallback parse
						const t = ch.textContent.toLowerCase();
						if (t.includes('gorilla') && activitySelect) activitySelect.value = 'gorilla';
						else if (/\d+[-–]\d+/.test(t) && durationSelect) durationSelect.value = t.match(/(\d+[-–]\d+)/)[0];
						else if (/\d+\+/.test(t) && durationSelect) durationSelect.value = t.match(/(\d+\+)/)[0];
						else if (/\$?\d+/.test(t) && maxInput) maxInput.value = t.match(/(\d+)/)[0];
					}
				} else {
					if (destSelect) destSelect.value = '';
					if (activitySelect) activitySelect.value = '';
					if (durationSelect) durationSelect.value = '';
					if (minInput) minInput.value = '';
					if (maxInput) maxInput.value = '';
				}
				runFilter();
			});
		});

		// initial filter run
		runFilter();

		// --- responsive social sync: clone topbar social links into mobile nav when narrow ---
		const topbarSocial = document.querySelector('.topbar-social');
		function syncSocials() {
			if (!topbarSocial || !links) return;
			const mobileBreakpoint = 800;
			const existing = links.querySelector('.nav-socials');
			if (window.innerWidth <= mobileBreakpoint) {
				topbarSocial.style.display = 'none';
				if (!existing) {
					const wrapper = document.createElement('div');
					wrapper.className = 'nav-socials';
					wrapper.setAttribute('aria-hidden', 'false');
					wrapper.style.display = 'flex'; wrapper.style.gap = '8px'; wrapper.style.marginTop = '8px';
					topbarSocial.querySelectorAll('.social-link').forEach(a => {
						const clone = a.cloneNode(true);
						clone.classList.add('nav-social-link');
						wrapper.appendChild(clone);
					});
					links.appendChild(wrapper);
				}
			} else {
				topbarSocial.style.display = '';
				if (existing) existing.remove();
			}
		}

		const onResize = debounce(() => {
			syncSocials();
			if (links) links.setAttribute('aria-hidden', String(!links.classList.contains('open')));
		}, 200);
		window.addEventListener('resize', onResize);
		syncSocials();

		// --- booking form handling ---
		const form = document.getElementById('booking-form');
		if (form) {
			form.addEventListener('submit', (e) => {
				const isNetlify = form.dataset.netlify === 'true' || form.getAttribute('data-netlify') === 'true';
				const data = new FormData(form);
				const name = (data.get('name') || '').toString().trim();
				const email = (data.get('email') || '').toString().trim();
				const destination = (data.get('destination') || '').toString().trim();
				if (!name || !email || !destination) {
					e.preventDefault(); showBookingMessage('Please fill name, email and choose a destination.', 'error'); return;
				}
				if (isNetlify) return; // let Netlify handle the submit
				e.preventDefault();
				const date = data.get('start_date') || '';
				const message = data.get('message') || '';
				const subject = encodeURIComponent('Booking request: ' + destination);
				const body = encodeURIComponent(`Name: ${name}%0AEmail: ${email}%0ADestination: ${destination}%0AStart date: ${date}%0A%0A${message}`);
				const mailto = `mailto:info@jangleadventures.ug?subject=${subject}&body=${body}`;
				showBookingMessage('Your booking request is ready. Open your email client to send it, or close this message.', 'success', mailto);
			});
		}

		function showBookingMessage(text, type = 'info', mailto) {
			const formEl = document.getElementById('booking-form'); if (!formEl) return;
			const existing = formEl.querySelector('.booking-msg'); if (existing) existing.remove();
			const div = document.createElement('div'); div.className = 'booking-msg card';
			div.setAttribute('role', 'status'); div.setAttribute('aria-live', 'polite');
			div.style.display = 'flex'; div.style.alignItems = 'center'; div.style.gap = '8px'; div.style.marginTop = '10px';
			const textEl = document.createElement('div'); textEl.textContent = text; div.appendChild(textEl);
			const actions = document.createElement('div'); actions.style.marginLeft = 'auto';
			if (mailto) { const openBtn = document.createElement('button'); openBtn.type = 'button'; openBtn.className = 'btn'; openBtn.textContent = 'Open Mail'; openBtn.addEventListener('click', () => { window.location.href = mailto; }); actions.appendChild(openBtn); }
			const closeBtn = document.createElement('button'); closeBtn.type = 'button'; closeBtn.className = 'btn small'; closeBtn.textContent = 'Close'; closeBtn.addEventListener('click', () => { div.remove(); }); actions.appendChild(closeBtn);
			div.appendChild(actions); formEl.appendChild(div);
			if (type === 'success') setTimeout(() => { div.remove(); }, 9000);
		}

		// keep search form submit consistent with input behavior
		const searchForm = document.getElementById('dest-search-form');
		if (searchForm && input) { searchForm.addEventListener('submit', (e) => { e.preventDefault(); runFilter(); input.focus(); }); }

	}); // DOMContentLoaded

})();

