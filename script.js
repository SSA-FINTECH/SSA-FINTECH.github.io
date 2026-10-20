/* ==========================================================================
   Portfolio — script.js  (vanilla JavaScript, no dependencies)
   Sections: MOBILE MENU · TYPING EFFECT · SCROLL REVEAL · ACTIVE NAVIGATION ·
   PROJECT FILTER · CONTACT VALIDATION · GITHUB API · SCROLL PROGRESS ·
   BACK TO TOP · CUSTOM CURSOR · EXTRAS (magnetic, spotlight, parallax,
   particles, placeholder links)
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var root = document.documentElement;
  root.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Toast helper ---------- */
  var toastEl = $('#toast');
  var toastTimer;
  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-visible'); }, 3200);
  }

  /* ==========================================================================
     MOBILE MENU
     ========================================================================== */
  var navbar = $('#navbar');
  var navToggle = $('#navToggle');
  var mobileMenu = $('#mobileMenu');

  function setMenu(open) {
    if (!navToggle || !mobileMenu) return;
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('menu-open', open);
    if (navbar) navbar.classList.toggle('menu-open', open);
  }

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', function () {
      setMenu(navToggle.getAttribute('aria-expanded') !== 'true');
    });
    $$('a', mobileMenu).forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        navToggle.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) setMenu(false);
    });
  }

  /* ==========================================================================
     TYPING EFFECT
     ========================================================================== */
  var typedEl = $('#typed');
  if (typedEl && !reduceMotion) {
    var roles = (typedEl.getAttribute('data-roles') || '')
      .split('|')
      .map(function (s) { return s.trim(); })
      .filter(Boolean);

    if (roles.length > 1) {
      var roleIndex = 0;
      var charIndex = roles[0].length;
      var deleting = false;

      var tick = function () {
        var word = roles[roleIndex];
        var delay;
        if (!deleting) {
          if (charIndex < word.length) {
            charIndex++;
            typedEl.textContent = word.slice(0, charIndex);
            delay = 70 + Math.random() * 40;
          } else {
            deleting = true;
            delay = 1900;
          }
        } else if (charIndex > 0) {
          charIndex--;
          typedEl.textContent = word.slice(0, charIndex);
          delay = 38;
        } else {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
          delay = 320;
        }
        setTimeout(tick, delay);
      };
      setTimeout(tick, 2200);
    }
  }

  /* ==========================================================================
     SCROLL REVEAL
     ========================================================================== */
  var revealEls = $$('.reveal');

  $$('[data-stagger]').forEach(function (parent) {
    var kids = Array.prototype.filter.call(parent.children, function (el) {
      return el.classList.contains('reveal');
    });
    kids.forEach(function (el, i) {
      el.setAttribute('data-delay', String(i * 80));
    });
  });
  revealEls.forEach(function (el) {
    var d = el.getAttribute('data-delay');
    if (d) el.style.transitionDelay = d + 'ms';
  });

  // Once an element has revealed, drop the reveal classes so hover transitions behave normally.
  function finishReveal(el) {
    el.classList.remove('reveal', 'is-visible');
    el.style.transitionDelay = '';
  }

  var revealObserver = null;
  if ('IntersectionObserver' in window && !reduceMotion) {
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('is-visible');
        revealObserver.unobserve(el);
        var extra = parseInt(el.getAttribute('data-delay'), 10) || 0;
        setTimeout(function () { finishReveal(el); }, 1100 + extra);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(finishReveal);
  }

  function forceReveal(el) {
    if (revealObserver) revealObserver.unobserve(el);
    finishReveal(el);
  }

  /* ==========================================================================
     ACTIVE NAVIGATION
     ========================================================================== */
  var navAnchors = $$('.nav-link').concat($$('.mobile-link'));
  var sectionMap = { github: 'projects', why: 'services' };

  function setActive(id) {
    var target = sectionMap[id] || id;
    navAnchors.forEach(function (a) {
      var on = a.getAttribute('href') === '#' + target;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }

  var sections = $$('main section[id]');
  if ('IntersectionObserver' in window && sections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { navObserver.observe(s); });
  }
  setActive('home');

  /* ==========================================================================
     PROJECT FILTER
     ========================================================================== */
  var filterWrap = $('#projectFilters');
  var cells = $$('#projectsGrid .project-cell');
  var filterStatus = $('#filterStatus');

  function applyFilter(filter) {
    var count = 0;
    cells.forEach(function (cell) {
      var cats = (cell.getAttribute('data-category') || '').split(/\s+/);
      var match = filter === 'all' || cats.indexOf(filter) !== -1;
      clearTimeout(cell._hideTimer);
      forceReveal(cell);

      if (match) {
        count++;
        if (cell.hidden) {
          cell.hidden = false;
          void cell.offsetWidth; // reflow so the fade-in transition runs
        }
        cell.classList.remove('is-filtered-out');
      } else {
        cell.classList.add('is-filtered-out');
        cell._hideTimer = setTimeout(function () { cell.hidden = true; }, 360);
      }
    });
    if (filterStatus) {
      filterStatus.textContent = 'Showing ' + count + ' project' + (count === 1 ? '' : 's');
    }
  }

  if (filterWrap) {
    var filterBtns = $$('.filter-btn', filterWrap);
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', String(on));
        });
        applyFilter(btn.getAttribute('data-filter'));
      });
    });
  }

  /* ==========================================================================
     CONTACT VALIDATION
     ========================================================================== */
  var form = $('#contactForm');
  if (form) {
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var rules = [
      { id: 'cf-name', test: function (v) { return v.trim().length >= 2; }, msg: 'Please enter your name (at least 2 characters).' },
      { id: 'cf-email', test: function (v) { return emailRe.test(v.trim()); }, msg: 'Please enter a valid email address.' },
      { id: 'cf-subject', test: function (v) { return v.trim().length >= 3; }, msg: 'Please add a short subject (at least 3 characters).' },
      { id: 'cf-message', test: function (v) { return v.trim().length >= 10; }, msg: 'Please write a message of at least 10 characters.' }
    ];
    var statusBox = $('#formStatus');
    var statusText = $('#formStatusText');
    var statusIcon = $('#formStatusIcon');
    var submitBtn = $('#formSubmit');

    var setFieldError = function (rule, message) {
      var input = document.getElementById(rule.id);
      var wrap = input.closest('.field');
      var err = document.getElementById(rule.id + '-error');
      wrap.classList.toggle('has-error', !!message);
      err.textContent = message || '';
      if (message) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    };

    var validateRule = function (rule) {
      var input = document.getElementById(rule.id);
      var ok = rule.test(input.value);
      setFieldError(rule, ok ? '' : rule.msg);
      return ok;
    };

    var showStatus = function (type, message) {
      statusBox.classList.remove('is-shown', 'success', 'error');
      void statusBox.offsetWidth;
      statusBox.classList.add(type, 'is-shown');
      statusText.textContent = message;
      statusIcon.setAttribute('href', type === 'success' ? '#i-check' : '#i-alert');
    };

    rules.forEach(function (rule) {
      var input = document.getElementById(rule.id);
      input.addEventListener('blur', function () {
        if (input.value.length) validateRule(rule);
      });
      input.addEventListener('input', function () {
        if (input.closest('.field').classList.contains('has-error')) validateRule(rule);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var firstInvalid = null;
      rules.forEach(function (rule) {
        if (!validateRule(rule) && !firstInvalid) firstInvalid = document.getElementById(rule.id);
      });
      if (firstInvalid) {
        showStatus('error', 'Please fix the highlighted fields and try again.');
        firstInvalid.focus();
        return;
      }

      var data = {
        name: $('#cf-name').value.trim(),
        email: $('#cf-email').value.trim(),
        subject: $('#cf-subject').value.trim(),
        message: $('#cf-message').value.trim()
      };
      var endpoint = (form.getAttribute('data-endpoint') || '').trim();

      submitBtn.disabled = true;

      if (endpoint) {
        // Formspree / any JSON endpoint
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(data)
        }).then(function (res) {
          if (!res.ok) throw new Error('Request failed');
          showStatus('success', "Thanks! Your message has been sent. I'll get back to you soon.");
          form.reset();
        }).catch(function () {
          showStatus('error', 'Something went wrong while sending. Please try again or email me directly.');
        }).then(function () {
          submitBtn.disabled = false;
        });
      } else {
        // No backend: open the visitor's email app with a prefilled draft
        var to = form.getAttribute('data-mailto') || '';
        var body = 'Hi,\n\n' + data.message + '\n\n— ' + data.name + '\n' + data.email;
        var href = 'mailto:' + to + '?subject=' + encodeURIComponent(data.subject) + '&body=' + encodeURIComponent(body);
        showStatus('success', 'Your email app should open with a draft ready to send. Nothing is sent until you press Send there.');
        form.reset();
        submitBtn.disabled = false;
        window.location.href = href;
      }
    });

    // "Send Me a Message" button focuses the first field after scrolling
    var ctaMessage = $('#ctaMessage');
    if (ctaMessage) {
      ctaMessage.addEventListener('click', function () {
        setTimeout(function () {
          var first = $('#cf-name');
          if (first) first.focus({ preventScroll: true });
        }, reduceMotion ? 0 : 700);
      });
    }
  }

  /* ==========================================================================
     GITHUB API
     ========================================================================== */
  var ghSection = $('#github');
  var repoGrid = $('#repoGrid');
  var ghStatus = $('#githubStatus');
  var contribGrid = $('#contribGrid');

  // Decorative activity grid (deterministic pseudo-random, clearly labelled as decorative in the HTML)
  if (contribGrid) {
    var seed = 20260;
    var rand = function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    var frag = document.createDocumentFragment();
    for (var w = 0; w < 52; w++) {
      for (var d = 0; d < 7; d++) {
        var r = rand();
        var weekend = d === 0 || d === 6;
        var boost = w > 30 ? 0.12 : 0;
        var level = 0;
        if (r > (weekend ? 0.78 : 0.45) - boost) level = 1;
        if (r > (weekend ? 0.9 : 0.62) - boost) level = 2;
        if (r > (weekend ? 0.96 : 0.8) - boost) level = 3;
        if (r > (weekend ? 0.99 : 0.92) - boost) level = 4;
        var cell = document.createElement('span');
        cell.className = 'l' + level;
        frag.appendChild(cell);
      }
    }
    contribGrid.appendChild(frag);
  }

  if (ghSection) {
    var ghUser = (ghSection.getAttribute('data-github-user') || '').trim();
    var langColors = {
      JavaScript: '#f1e05a', HTML: '#e34c26', CSS: '#ff3b4a', Python: '#3572a5',
      TypeScript: '#3178c6', Java: '#b07219', 'C++': '#f34b7d', C: '#8b8b99', Shell: '#89e051'
    };

    var animateCount = function (el, to) {
      if (reduceMotion || to < 1) { el.textContent = String(to); return; }
      var dur = 1100;
      var start = performance.now();
      var step = function (now) {
        var p = Math.min((now - start) / dur, 1);
        el.textContent = String(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    var setStatus = function (msg) { if (ghStatus) ghStatus.textContent = msg; };

    var fetchJSON = function (url) {
      var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 8000);
      return fetch(url, {
        headers: { 'Accept': 'application/vnd.github+json' },
        signal: ctrl ? ctrl.signal : undefined
      }).then(function (res) {
        clearTimeout(timer);
        if (!res.ok) throw new Error('GitHub API ' + res.status);
        return res.json();
      }, function (err) {
        clearTimeout(timer);
        throw err;
      });
    };

    var makeEl = function (tag, cls, text) {
      var el = document.createElement(tag);
      if (cls) el.className = cls;
      if (text !== undefined) el.textContent = text;
      return el;
    };

    var iconSvg = function (id, cls) {
      var ns = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('class', cls || 'icon');
      svg.setAttribute('aria-hidden', 'true');
      var use = document.createElementNS(ns, 'use');
      use.setAttribute('href', '#' + id);
      svg.appendChild(use);
      return svg;
    };

    var renderProfile = function (profile) {
      $$('[data-stat]', ghSection).forEach(function (el) {
        var key = el.getAttribute('data-stat');
        var map = { repos: 'public_repos', followers: 'followers', following: 'following' };
        var value = Number(profile[map[key]]);
        if (!isNaN(value)) animateCount(el, value);
      });

      var bio = $('#ghBio');
      if (bio && profile.bio) bio.textContent = profile.bio;

      var avatar = $('#ghAvatar');
      var fallback = $('#ghAvatarFallback');
      if (avatar && profile.avatar_url) {
        avatar.addEventListener('load', function () {
          avatar.hidden = false;
          if (fallback) fallback.hidden = true;
        });
        avatar.addEventListener('error', function () { avatar.hidden = true; });
        avatar.src = profile.avatar_url + (profile.avatar_url.indexOf('?') === -1 ? '?s=144' : '&s=144');
      }
    };

    var renderRepos = function (repos) {
      if (!repoGrid) return;
      repoGrid.textContent = '';
      repos.forEach(function (repo) {
        var card = makeEl('a', 'card repo-card spotlight');
        card.href = repo.html_url;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';

        var head = makeEl('div', 'repo-head');
        head.appendChild(iconSvg('i-book'));
        head.appendChild(makeEl('strong', '', repo.name));
        card.appendChild(head);

        card.appendChild(makeEl('p', '', repo.description || 'No description provided yet.'));

        var meta = makeEl('div', 'repo-meta');
        if (repo.language) {
          var lang = makeEl('span');
          var dot = makeEl('i', 'lang-dot');
          dot.style.backgroundColor = langColors[repo.language] || '#8b8b99';
          lang.appendChild(dot);
          lang.appendChild(document.createTextNode(repo.language));
          meta.appendChild(lang);
        }
        var stars = makeEl('span');
        stars.appendChild(iconSvg('i-star'));
        stars.appendChild(document.createTextNode(String(repo.stargazers_count || 0)));
        meta.appendChild(stars);
        var forks = makeEl('span');
        forks.appendChild(iconSvg('i-fork'));
        forks.appendChild(document.createTextNode(String(repo.forks_count || 0)));
        meta.appendChild(forks);
        card.appendChild(meta);

        repoGrid.appendChild(card);
      });

      if (finePointer) bindSpotlight($$('.spotlight', repoGrid));
    };

    var loadGitHub = function () {
      if (!ghUser || ghUser === 'YOUR_GITHUB_USERNAME') {
        setStatus('Add your GitHub username in index.html to show live data — showing sample cards for now.');
        return;
      }

      var cacheKey = 'gh-cache:' + ghUser;
      var cached = null;
      try {
        var raw = sessionStorage.getItem(cacheKey);
        if (raw) {
          var parsed = JSON.parse(raw);
          if (parsed && Date.now() - parsed.t < 10 * 60 * 1000) cached = parsed;
        }
      } catch (err) { cached = null; }

      var apply = function (profile, repos) {
        renderProfile(profile);
        var own = (repos || []).filter(function (r) { return !r.fork; }).slice(0, 6);
        if (own.length) {
          renderRepos(own);
          setStatus('Live data from the GitHub public API.');
        } else {
          setStatus('No public repositories to show yet — showing sample cards.');
        }
      };

      if (cached) { apply(cached.profile, cached.repos); return; }

      var base = 'https://api.github.com/users/' + encodeURIComponent(ghUser);
      Promise.all([
        fetchJSON(base),
        fetchJSON(base + '/repos?sort=updated&per_page=12')
      ]).then(function (results) {
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify({ t: Date.now(), profile: results[0], repos: results[1] }));
        } catch (err) { /* storage unavailable — ignore */ }
        apply(results[0], results[1]);
      }).catch(function () {
        setStatus("Couldn't reach GitHub right now — showing sample cards. Visit my profile for the full list.");
      });
    };

    loadGitHub();
  }

  /* ==========================================================================
     SCROLL PROGRESS  +  BACK TO TOP  (+ navbar state)
     ========================================================================== */
  var progressBar = $('#scrollProgress');
  var backTop = $('#backToTop');
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.pageYOffset || root.scrollTop;
      var max = root.scrollHeight - window.innerHeight;
      if (progressBar) progressBar.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
      if (navbar) navbar.classList.toggle('scrolled', y > 20);
      if (backTop) backTop.classList.toggle('visible', y > 700);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  if (backTop) {
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ==========================================================================
     CUSTOM CURSOR  (desktop / fine pointer only)
     ========================================================================== */
  var dot = $('#cursorDot');
  var ring = $('#cursorRing');

  if (finePointer && !reduceMotion && dot && ring) {
    root.classList.add('has-cursor');

    var mx = -100, my = -100, rx = -100, ry = -100;
    var shown = false;
    var running = false;

    var loop = function () {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)';
      if (Math.abs(mx - rx) > 0.1 || Math.abs(my - ry) > 0.1) {
        requestAnimationFrame(loop);
      } else {
        running = false;
      }
    };

    window.addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;
      if (!shown) {
        shown = true;
        rx = mx; ry = my;
        dot.classList.add('is-visible');
        ring.classList.add('is-visible');
      }
      dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      if (!running) { running = true; requestAnimationFrame(loop); }
    }, { passive: true });

    document.addEventListener('mouseover', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var isText = !!t.closest('input, textarea');
      ring.classList.toggle('is-hover', !isText && !!t.closest('a, button, label, [data-cursor]'));
      ring.classList.toggle('is-text', isText);
      dot.classList.toggle('is-text', isText);
    });
    document.addEventListener('mousedown', function () { ring.classList.add('is-down'); });
    document.addEventListener('mouseup', function () { ring.classList.remove('is-down'); });
    document.documentElement.addEventListener('mouseleave', function () {
      dot.classList.remove('is-visible');
      ring.classList.remove('is-visible');
      shown = false;
    });
  }

  /* ==========================================================================
     EXTRAS — magnetic buttons, card spotlight, hero parallax, particles,
     placeholder links
     ========================================================================== */

  // Magnetic buttons (subtle)
  if (finePointer && !reduceMotion) {
    $$('.magnetic').forEach(function (el) {
      var rect = null;
      el.addEventListener('pointerenter', function () {
        el.style.translate = '';
        rect = el.getBoundingClientRect();
      });
      el.addEventListener('pointermove', function (e) {
        if (!rect) rect = el.getBoundingClientRect();
        var x = (e.clientX - (rect.left + rect.width / 2)) * 0.28;
        var y = (e.clientY - (rect.top + rect.height / 2)) * 0.28;
        el.style.translate = x.toFixed(1) + 'px ' + y.toFixed(1) + 'px';
      });
      el.addEventListener('pointerleave', function () {
        el.style.translate = '';
        rect = null;
      });
    });
  }

  // Mouse-follow spotlight on cards
  function bindSpotlight(list) {
    list.forEach(function (el) {
      if (el._spot) return;
      el._spot = true;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--gx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--gy', (e.clientY - r.top) + 'px');
      });
    });
  }
  if (finePointer) bindSpotlight($$('.spotlight'));

  // Hero parallax
  var hero = $('#home');
  if (hero && finePointer && !reduceMotion) {
    var depthEls = $$('[data-depth]', hero);
    hero.addEventListener('pointermove', function (e) {
      var nx = e.clientX / window.innerWidth - 0.5;
      var ny = e.clientY / window.innerHeight - 0.5;
      depthEls.forEach(function (el) {
        var depth = parseFloat(el.getAttribute('data-depth')) || 0;
        el.style.translate = (nx * depth).toFixed(1) + 'px ' + (ny * depth).toFixed(1) + 'px';
      });
    });
    hero.addEventListener('pointerleave', function () {
      depthEls.forEach(function (el) { el.style.translate = ''; });
    });
  }

  // Tiny background particles
  var particleWrap = $('#particles');
  if (particleWrap && !reduceMotion) {
    var count = window.innerWidth < 600 ? 14 : 28;
    for (var i = 0; i < count; i++) {
      var p = document.createElement('span');
      var size = (Math.random() * 2 + 1).toFixed(1);
      p.style.left = (Math.random() * 100).toFixed(1) + '%';
      p.style.top = (Math.random() * 100).toFixed(1) + '%';
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.animationDuration = (14 + Math.random() * 18).toFixed(1) + 's';
      p.style.animationDelay = '-' + (Math.random() * 20).toFixed(1) + 's';
      particleWrap.appendChild(p);
    }
  }

  // Placeholder links (href="#") show a friendly hint instead of jumping to the top
  document.addEventListener('click', function (e) {
    var link = e.target.closest ? e.target.closest('a[href="#"]') : null;
    if (!link) return;
    e.preventDefault();
    showToast('This link is a placeholder — add your URL in index.html.');
  });
})();
