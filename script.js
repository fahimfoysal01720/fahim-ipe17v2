/* ==========================================================================
   Fahim Foysal — portfolio script
   1. helpers · 2. theme · 3. nav · 4. scroll ui · 5. reveals · 6. hero
   7. projects · 8. diagrams · 9. PDF reader (core) · 10. contact · 11. misc
   ========================================================================== */
(() => {
  'use strict';

  /* ------------------------------- 1. helpers ------------------------------ */
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer  = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const doc = document;
  const esc = str => String(str == null ? '' : str).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  const icon = (name, cls = '') => `<svg class="ic ${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const SVGNS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs = {}) => {
    const el = doc.createElementNS(SVGNS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  };

  /* -------------------------------- 2. theme ------------------------------- */
  const root = doc.documentElement;
  const themeBtn = $('#themeBtn');
  const readTheme = () => { try { return localStorage.getItem('theme'); } catch { return null; } };
  const applyTheme = t => {
    root.dataset.theme = t;
    themeBtn?.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    themeBtn?.setAttribute('title', t === 'dark' ? 'Light mode' : 'Dark mode');
    doc.querySelector('meta[name="theme-color"]')?.setAttribute('content', t === 'dark' ? '#070b14' : '#f5f8fc');
    try { localStorage.setItem('theme', t); } catch {}
    if (typeof drawDiagrams === 'function') drawDiagrams();
  };
  applyTheme(readTheme() || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
  themeBtn?.addEventListener('click', () => applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));

  /* --------------------------------- 3. nav -------------------------------- */
  const nav = $('#nav'), menu = $('#menu'), burger = $('#burger'), scrim = $('#menuScrim'), pill = $('#navPill');
  const navLinks = $$('#menu a');

  const closeMenu = () => {
    menu.classList.remove('open');
    nav.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false');
    scrim.classList.remove('show');
    setTimeout(() => { if (!menu.classList.contains('open')) scrim.hidden = true; }, 360);
    doc.body.classList.remove('no-scroll');
  };
  const openMenu = () => {
    scrim.hidden = false;
    requestAnimationFrame(() => scrim.classList.add('show'));
    menu.classList.add('open');
    nav.classList.add('menu-open');
    burger.setAttribute('aria-expanded', 'true');
    doc.body.classList.add('no-scroll');
  };
  burger?.addEventListener('click', () => menu.classList.contains('open') ? closeMenu() : openMenu());
  scrim?.addEventListener('click', closeMenu);
  navLinks.forEach(a => a.addEventListener('click', closeMenu));

  const movePill = link => {
    if (!pill || !link || innerWidth <= 900) return;
    const r = link.getBoundingClientRect(), p = menu.getBoundingClientRect();
    pill.style.width = r.width + 'px';
    pill.style.transform = `translateX(${r.left - p.left}px)`;
    nav.classList.add('has-pill');
  };

  /* ----------------------------- 4. scroll UI ------------------------------ */
  const bar = $('#progressBar'), toTop = $('#toTop'), ringFg = $('#ringFg');
  let lastY = 0, ticking = false;

  const onScroll = () => {
    const y = scrollY;
    const max = doc.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? clamp(y / max, 0, 1) : 0;
    if (bar) bar.style.width = (p * 100).toFixed(2) + '%';
    if (ringFg) ringFg.style.strokeDashoffset = String(132 - 132 * p);
    nav.classList.toggle('scrolled', y > 40);
    toTop.classList.toggle('show', y > 640);
    if (y < 160) { navLinks.forEach(l => l.classList.remove('active')); nav.classList.remove('has-pill'); }
    lastY = y; ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  toTop?.addEventListener('click', () => scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  /* scroll spy */
  const sections = $$('main section[id]');
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const link = navLinks.find(l => l.getAttribute('href') === '#' + e.target.id);
        navLinks.forEach(l => l.classList.toggle('active', l === link));
        movePill(link);
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(s => spy.observe(s));
  }
  addEventListener('resize', () => {
    const active = navLinks.find(l => l.classList.contains('active'));
    if (active) movePill(active);
  });

  /* ------------------------------ 5. reveals ------------------------------- */
  const counters = el => {
    const end = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), t0 = performance.now(), dur = 1500;
    if (reduceMotion) { el.textContent = dec ? end.toFixed(dec) : String(Math.round(end)); return; }
    const tick = t => {
      const p = clamp((t - t0) / dur, 0, 1), v = end * (1 - Math.pow(1 - p, 3));
      el.textContent = dec ? v.toFixed(dec) : String(Math.round(v));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const groups = new Map();
  $$('.reveal').forEach(el => {
    const parent = el.parentElement;
    if (!groups.has(parent)) groups.set(parent, 0);
    const i = groups.get(parent);
    groups.set(parent, i + 1);
    el.style.transitionDelay = Math.min(i, 6) * 65 + 'ms';
  });

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        el.classList.add('in');
        $$('.level-bar', el).forEach((b, i) => setTimeout(() => { b.style.width = b.dataset.level + '%'; }, 120 + i * 90));
        $$('[data-count]', el).forEach(counters);
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach(el => io.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('in'));
  }

  /* --------------------------- 6. hero (canvas) ---------------------------- */
  const cv = $('#network');
  if (cv) {
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, nodes = [], edges = [], packets = [], raf = 0, visible = true;
    const pointer = { x: -999, y: -999, active: false };

    const build = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const rect = cv.getBoundingClientRect();
      W = Math.max(rect.width, 1); H = Math.max(rect.height, 1);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const layers = W < 720 ? 4 : 5, per = W < 720 ? 3 : 4;
      nodes = []; edges = []; packets = [];
      for (let l = 0; l < layers; l++) {
        for (let i = 0; i < per; i++) {
          nodes.push({
            l,
            x: W * (0.07 + 0.86 * l / (layers - 1)) + (Math.random() - 0.5) * 26,
            y: H * (0.14 + 0.72 * (i + 0.5) / per) + (Math.random() - 0.5) * 36,
            r: 2.2 + Math.random() * 2.1,
            ph: Math.random() * Math.PI * 2
          });
        }
      }
      nodes.forEach(a => nodes.filter(b => b.l === a.l + 1).forEach(b => { if (Math.random() < 0.6) edges.push([a, b]); }));
      for (let i = 0; i < 24 && edges.length; i++) {
        packets.push({ e: edges[i % edges.length], t: Math.random(), s: 0.0018 + Math.random() * 0.0028 });
      }
    };

    const frame = t => {
      ctx.clearRect(0, 0, W, H);

      /* links */
      ctx.lineWidth = 1;
      for (const [a, b] of edges) {
        ctx.strokeStyle = 'rgba(125,170,255,.14)';
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }

      /* nodes */
      for (const n of nodes) {
        const hover = pointer.active && Math.hypot(n.x - pointer.x, n.y - pointer.y) < 130;
        const bob = reduceMotion ? 0 : Math.sin(t / 1800 + n.ph) * 2.2;
        if (hover) {
          ctx.beginPath(); ctx.arc(n.x, n.y + bob, n.r + 5, 0, 7);
          ctx.fillStyle = 'rgba(255,159,28,.16)'; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(n.x, n.y + bob, n.r, 0, 7);
        ctx.fillStyle = hover ? 'rgba(255,214,150,.95)' : 'rgba(168,203,255,.6)';
        ctx.fill();
      }

      /* moving packets */
      for (const p of packets) {
        p.t += p.s;
        if (p.t >= 1) {
          const next = edges.filter(e => e[0] === p.e[1]);
          p.e = next.length ? next[Math.floor(Math.random() * next.length)] : edges[Math.floor(Math.random() * edges.length)];
          p.t = 0;
        }
        const [a, b] = p.e;
        const x = a.x + (b.x - a.x) * p.t, y = a.y + (b.y - a.y) * p.t;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 8);
        g.addColorStop(0, 'rgba(255,159,28,.55)'); g.addColorStop(1, 'rgba(255,159,28,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 8, 0, 7); ctx.fill();
        ctx.fillStyle = '#ffc56b'; ctx.beginPath(); ctx.arc(x, y, 2.4, 0, 7); ctx.fill();
      }

      if (!reduceMotion && visible) raf = requestAnimationFrame(frame);
    };

    build(); frame(0);

    let rt;
    addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => { cancelAnimationFrame(raf); build(); frame(performance.now()); }, 180);
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        cancelAnimationFrame(raf);
        if (visible && !reduceMotion) frame(performance.now());
      }, { threshold: 0.05 }).observe($('.hero'));
    }
    if (finePointer && !reduceMotion) {
      $('.hero')?.addEventListener('pointermove', e => {
        const r = cv.getBoundingClientRect();
        pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; pointer.active = true;
      });
      $('.hero')?.addEventListener('pointerleave', () => { pointer.active = false; });
    }
  }

  /* cursor glow */
  if (finePointer && !reduceMotion) {
    const glow = $('#cursorGlow');
    let gx = 0, gy = 0, tx = 0, ty = 0, run = false;
    const loop = () => {
      gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
      glow.style.transform = `translate(${gx}px,${gy}px) translate(-50%,-50%)`;
      if (Math.abs(tx - gx) + Math.abs(ty - gy) > 0.5) requestAnimationFrame(loop); else run = false;
    };
    addEventListener('pointermove', e => {
      tx = e.clientX; ty = e.clientY;
      doc.body.classList.add('cursor-on');
      if (!run) { run = true; requestAnimationFrame(loop); }
    }, { passive: true });
  }

  /* ripple */
  doc.addEventListener('pointerdown', e => {
    const btn = e.target.closest('.btn');
    if (!btn || reduceMotion) return;
    const r = btn.getBoundingClientRect(), size = Math.max(r.width, r.height);
    const s = doc.createElement('span');
    s.className = 'ripple';
    s.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
    btn.appendChild(s);
    setTimeout(() => s.remove(), 700);
  });

  /* ----------------------------- 7. projects ------------------------------- */
  const grid = $('#projectsGrid');
  const cards = $$('.project-card');
  const chips = $$('.chip');
  const searchInput = $('#projectSearch');
  const searchClear = $('#searchClear');
  const resultsLine = $('#resultsLine');
  const emptyState = $('#emptyState');
  let activeFilter = 'all';
  let query = '';

  const applyFilters = (animate = true) => {
    let visible = 0;
    cards.forEach((card, i) => {
      const matchCat = activeFilter === 'all' || card.dataset.cat === activeFilter;
      const hay = ((card.dataset.search || '') + ' ' + card.textContent).toLowerCase();
      const matchQ = !query || hay.includes(query);
      const show = matchCat && matchQ;
      if (show) visible++;

      if (show) {
        if (card.classList.contains('is-hidden')) {
          card.classList.remove('is-hidden', 'is-leaving');
          if (animate && !reduceMotion) {
            card.style.animationDelay = Math.min(i, 5) * 45 + 'ms';
            card.classList.add('is-entering');
            setTimeout(() => card.classList.remove('is-entering'), 700);
          }
        }
      } else if (!card.classList.contains('is-hidden')) {
        if (animate && !reduceMotion) {
          card.classList.add('is-leaving');
          setTimeout(() => { card.classList.add('is-hidden'); card.classList.remove('is-leaving'); }, 180);
        } else {
          card.classList.add('is-hidden');
        }
      }
    });
    if (emptyState) emptyState.hidden = visible !== 0;
    if (resultsLine) {
      const total = cards.length;
      resultsLine.innerHTML = visible === total
        ? `Showing all <b>${total}</b> projects — open any document right here.`
        : `<b>${visible}</b> of ${total} projects match${query ? ` “${esc(query)}”` : ''}.`;
    }
  };

  chips.forEach(chip => chip.addEventListener('click', () => {
    chips.forEach(c => c.classList.toggle('active', c === chip));
    activeFilter = chip.dataset.filter;
    applyFilters();
  }));

  searchInput?.addEventListener('input', () => {
    query = searchInput.value.trim().toLowerCase();
    if (searchClear) searchClear.hidden = !searchInput.value;
    applyFilters();
  });
  searchClear?.addEventListener('click', () => {
    searchInput.value = ''; query = ''; searchClear.hidden = true; searchInput.focus(); applyFilters();
  });
  $('#resetFilters')?.addEventListener('click', () => {
    chips.forEach(c => c.classList.toggle('active', c.dataset.filter === 'all'));
    activeFilter = 'all'; query = ''; if (searchInput) searchInput.value = '';
    if (searchClear) searchClear.hidden = true;
    applyFilters();
  });
  /* "/" focuses search */
  addEventListener('keydown', e => {
    if (e.key === '/' && doc.activeElement !== searchInput && !/input|textarea|select/i.test(doc.activeElement.tagName) && !modal.classList.contains('open')) {
      e.preventDefault(); searchInput?.focus();
    }
  });
  /* keep the filter counters honest */
  chips.forEach(chip => {
    const n = chip.dataset.filter === 'all' ? cards.length : cards.filter(c2 => c2.dataset.cat === chip.dataset.filter).length;
    const em = chip.querySelector('em');
    if (em) em.textContent = String(n);
  });

  applyFilters(false);

  /* card spotlight + tilt */
  if (finePointer && !reduceMotion) {
    cards.forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${(-py * 3.2).toFixed(2)}deg) rotateY(${(px * 3.2).toFixed(2)}deg) translateY(-6px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  /* ----------------------------- 8. diagrams ------------------------------- */
  function createLeanTree() {
    const host = $('#leanTree');
    if (!host) return;
    host.innerHTML = '';
    const data = [
      { name: 'Principles', color: '#ff9f1c', items: ['Value', 'Value stream', 'Flow', 'Pull', 'Perfection'] },
      { name: 'Tools', color: '#2b7fff', items: ['5S', 'Kanban', 'Kaizen', 'Poka-yoke', 'VSM'] },
      { name: 'Benefits', color: '#22c55e', items: ['Less waste', 'Better quality', 'Lower cost', 'Shorter lead time'] }
    ];
    const W = 620, H = 340, rootX = 64, branchX = 206, leafX = 330;
    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img' });
    const rootY = H / 2;

    data.forEach((branch, bi) => {
      const g = svgEl('g', { class: 'branch-group' });
      g.dataset.branch = bi;
      const by = 46 + bi * ((H - 92) / 2);
      const n = branch.items.length;
      const step = Math.min(26, (H - 120) / n);
      const startY = by - ((n - 1) * step) / 2;

      /* branch link */
      const bl = svgEl('path', {
        class: 'link', d: `M${rootX} ${rootY} C ${(rootX + branchX) / 2} ${rootY}, ${(rootX + branchX) / 2} ${by}, ${branchX} ${by}`,
        stroke: branch.color, pathLength: 1
      });
      bl.style.strokeDasharray = 1; bl.style.strokeDashoffset = 1;
      g.appendChild(bl);

      branch.items.forEach((item, ii) => {
        const ly = startY + ii * step;
        const p = svgEl('path', {
          class: 'link', d: `M${branchX} ${by} C ${(branchX + leafX) / 2} ${by}, ${(branchX + leafX) / 2} ${ly}, ${leafX} ${ly}`,
          stroke: branch.color, pathLength: 1
        });
        p.style.strokeDasharray = 1; p.style.strokeDashoffset = 1;
        p.style.transitionDelay = (ii * 45 + 220) + 'ms';
        g.appendChild(p);

        const dot = svgEl('circle', { cx: leafX, cy: ly, r: 3.4, fill: branch.color });
        g.appendChild(dot);
        const txt = svgEl('text', { x: leafX + 10, y: ly + 3.6 });
        txt.textContent = item;
        g.appendChild(txt);
      });

      const node = svgEl('circle', { cx: branchX, cy: by, r: 6, fill: branch.color, stroke: 'var(--surface)', 'stroke-width': 2 });
      g.appendChild(node);
      const label = svgEl('text', { x: branchX, y: by - 13, 'text-anchor': 'middle' });
      label.setAttribute('class', 'bold');
      label.textContent = branch.name;
      g.appendChild(label);

      g.addEventListener('pointerenter', () => {
        $$('.branch-group', svg).forEach(o => o.classList.toggle('dim', o !== g));
      });
      g.addEventListener('pointerleave', () => $$('.branch-group', svg).forEach(o => o.classList.remove('dim')));
      svg.appendChild(g);
    });

    /* root */
    const rootG = svgEl('g', { class: 'node' });
    rootG.appendChild(svgEl('circle', { cx: rootX, cy: rootY, r: 9, fill: '#e11d48', stroke: 'var(--surface)', 'stroke-width': 2.5 }));
    const rt = svgEl('text', { x: rootX - 16, y: rootY + 4, 'text-anchor': 'end' });
    rt.setAttribute('class', 'bold');
    rt.textContent = 'Lean';
    rootG.appendChild(rt);
    svg.appendChild(rootG);
    host.appendChild(svg);
  }

  function createFishbone() {
    const host = $('#tqmFishbone');
    if (!host) return;
    host.innerHTML = '';
    const W = 620, H = 320, spineY = 168, spineEnd = 452;
    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img' });

    /* spine */
    svg.appendChild(svgEl('line', { x1: 16, y1: spineY, x2: spineEnd, y2: spineY, stroke: '#2b7fff', 'stroke-width': 2.6, 'stroke-linecap': 'round' }));
    const head = svgEl('rect', { x: spineEnd, y: spineY - 24, width: 152, height: 48, rx: 10, fill: '#e11d48' });
    svg.appendChild(head);
    const ht = svgEl('text', { x: spineEnd + 76, y: spineY + 4.5, 'text-anchor': 'middle', fill: '#fff' });
    ht.setAttribute('style', 'font:700 12px Sora,Inter,sans-serif');
    ht.textContent = 'Quality issue';
    svg.appendChild(ht);
    const arrow = svgEl('path', { d: `M${spineEnd - 12} ${spineY - 6} l8 6 -8 6`, fill: 'none', stroke: '#2b7fff', 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    svg.appendChild(arrow);

    const cats = [
      { name: 'Methods', causes: ['No SOP', 'Late inspection'], dir: 1, x: 92 },
      { name: 'Materials', causes: ['Vendor variation', 'No incoming QC'], dir: 1, x: 246 },
      { name: 'Machines', causes: ['Worn tooling', 'No maintenance'], dir: 1, x: 400 },
      { name: 'Manpower', causes: ['Low training', 'High turnover'], dir: -1, x: 92 },
      { name: 'Environment', causes: ['Dust / humidity', 'Poor layout'], dir: -1, x: 246 },
      { name: 'Management', causes: ['Unclear targets', 'Weak feedback'], dir: -1, x: 400 }
    ];

    cats.forEach(cat => {
      const g = svgEl('g', { class: 'fb-cat', tabindex: '0', role: 'button' });
      g.setAttribute('aria-label', `${cat.name}: ${cat.causes.join(', ')}`);
      const topY = cat.dir === 1 ? 34 : H - 34;
      const junctionX = cat.x + 74;

      const bone = svgEl('line', { x1: cat.x, y1: topY, x2: junctionX, y2: spineY, stroke: '#ff9f1c', 'stroke-width': 2.2, 'stroke-linecap': 'round' });
      g.appendChild(bone);

      cat.causes.forEach((cause, i) => {
        const t = 0.36 + i * 0.3;
        const cx = cat.x + (junctionX - cat.x) * t;
        const cy = topY + (spineY - topY) * t;
        const causeG = svgEl('g', { class: 'fb-cause' });
        causeG.appendChild(svgEl('line', { x1: cx, y1: cy, x2: cx - 40, y2: cy, stroke: '#ff9f1c', 'stroke-width': 1.1, opacity: '.8' }));
        const ct = svgEl('text', { x: cx - 44, y: cy + 3, 'text-anchor': 'end' });
        ct.textContent = cause;
        causeG.appendChild(ct);
        g.appendChild(causeG);
      });

      const label = svgEl('text', { x: cat.x, y: cat.dir === 1 ? topY - 10 : topY + 18, 'text-anchor': 'middle' });
      label.textContent = cat.name;
      g.appendChild(label);

      const toggle = () => {
        const on = g.classList.toggle('open');
        $$('.fb-cause', g).forEach((c, i) => setTimeout(() => c.classList.toggle('show', on), i * 70));
        $$('.fb-cat', svg).forEach(o => o.classList.toggle('dim', on && o !== g));
      };
      g.addEventListener('pointerenter', () => {
        if (g.classList.contains('open')) return;
        $$('.fb-cause', g).forEach(c => c.classList.add('show'));
        $$('.fb-cat', svg).forEach(o => o.classList.toggle('dim', o !== g));
      });
      g.addEventListener('pointerleave', () => {
        if (g.classList.contains('open')) return;
        $$('.fb-cause', g).forEach(c => c.classList.remove('show'));
        $$('.fb-cat', svg).forEach(o => o.classList.remove('dim'));
      });
      g.addEventListener('click', toggle);
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
      g.addEventListener('focus', () => $$('.fb-cause', g).forEach(c => c.classList.add('show')));
      g.addEventListener('blur', () => { if (!g.classList.contains('open')) $$('.fb-cause', g).forEach(c => c.classList.remove('show')); });

      svg.appendChild(g);
    });

    host.appendChild(svg);
  }

  function drawDiagrams() {
    try { createLeanTree(); createFishbone(); } catch (e) { console.warn('diagram error', e); }
  }
  drawDiagrams();

  /* animate the tree when its card is revealed */
  if ('IntersectionObserver' in window) {
    const tio = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      $$('.tree-diagram .link').forEach((p, i) => { p.style.strokeDashoffset = 0; });
      tio.unobserve(e.target);
    }), { threshold: 0.3 });
    const tree = $('.tree-diagram');
    if (tree) tio.observe(tree);
  }

  /* ======================================================================== */
  /*                        9. PDF DOCUMENT READER                            */
  /* ======================================================================== */

  const DOCS = {
    washing: {
      id: 'washing',
      title: 'Pedal Powered Washing Machine',
      kind: 'Project documentation',
      cat: 'Design project',
      site: 'pdfd/documentation.pdf',
      fileName: 'Pedal-Powered-Washing-Machine-Documentation.pdf',
      page: 'pdfd/index.html',
      files: ['pdfd/documentation.pdf', 'pdfd/Project Documentation.pdf', 'pdfd/pedal-powered-washing-machine.pdf'],
      summary: 'A human-powered washing machine designed for off-grid and low-income households. The report follows the full product cycle: concept generation, need analysis with QFD, CAD modelling in SolidWorks, cost breakdown and a working prototype.',
      sections: ['Introduction & problem statement', 'Concept selection & QFD', 'Design & SolidWorks modelling', 'Cost analysis & bill of materials', 'Prototype build & testing'],
      tags: ['SolidWorks', 'QFD', 'Cost analysis', 'Prototyping']
    },
    fan: {
      id: 'fan',
      title: 'Automatic Fan Control',
      kind: 'Project documentation',
      cat: 'Automation project',
      site: 'pdfp/documentation.pdf',
      fileName: 'Automatic-Fan-Control-Documentation.pdf',
      page: 'pdfp/index.html',
      files: ['pdfp/documentation.pdf', 'pdfp/Project Documentation.pdf', 'pdfp/automatic-fan-control.pdf'],
      summary: 'An Arduino-based controller that reads temperature and humidity from a DHT11 sensor and switches a fan automatically. The document includes the bill of materials, circuit diagram, program logic and test results.',
      sections: ['Objective & scope', 'Components (bill of materials)', 'Circuit design', 'Arduino program logic', 'Testing & results'],
      tags: ['Arduino', 'DHT11', 'Circuit design', 'Embedded systems']
    },
    nirr: {
      id: 'nirr',
      title: 'Nirr: E-Accommodation (MIS)',
      kind: 'Project documentation',
      cat: 'Research · IOEM 2024',
      site: 'pdfm/documentation.pdf',
      fileName: 'Nirr-E-Accommodation-Documentation.pdf',
      page: 'pdfm/index.html',
      files: ['pdfm/documentation.pdf', 'pdfm/Project Documentation.pdf', 'pdfm/nirr.pdf'],
      summary: 'A management information system concept for student and bachelor accommodation, delivered with a working demo website in HTML, CSS and JavaScript together with a break-even analysis and an MIS framework.',
      sections: ['Background & market need', 'MIS framework', 'System & website design', 'Break-even analysis', 'Findings & recommendation'],
      tags: ['MIS', 'HTML / CSS / JS', 'Break-even', 'IOEM 2024']
    },
    thesis: {
      id: 'thesis',
      title: 'Undergraduate thesis',
      kind: 'Thesis documentation',
      cat: 'Research',
      site: 'pdft/documentation.pdf',
      fileName: 'Undergraduate-Thesis-Documentation.pdf',
      page: 'pdft/index.html',
      files: ['pdft/documentation.pdf', 'pdft/Thesis Documentation.pdf', 'pdft/thesis.pdf'],
      summary: 'Multi-objective optimization of a multi-stage supply chain distribution network using nature-inspired algorithms — PSO, GA and a hybrid GA-PSO — with a green-supply objective and a full comparison of the algorithms.',
      sections: ['Introduction & literature review', 'Problem formulation', 'Model & constraints', 'PSO / GA / GA-PSO implementation', 'Results, comparison & conclusion'],
      tags: ['PSO', 'GA', 'GA-PSO', 'Green supply chain']
    },
    network: {
      id: 'network',
      title: 'Distribution network — additional documentation',
      kind: 'Supporting documentation',
      cat: 'Research',
      site: 'pdcn/documentation.pdf',
      fileName: 'Distribution-Network-Documentation.pdf',
      page: 'pdcn/index.html',
      files: ['pdcn/documentation.pdf', 'pdcn/Additional Documentation.pdf', 'pdcn/network.pdf'],
      summary: 'Supporting material for the thesis: the distribution-network model, collected data, assumptions, algorithm parameters and the extended result tables behind the analysis.',
      sections: ['Network structure', 'Data collection & assumptions', 'Algorithm parameters', 'Extended result tables', 'Appendices'],
      tags: ['Network design', 'Data analysis', 'Appendices']
    },
    covid: {
      id: 'covid',
      title: 'Covid-19 and FMCG stocks',
      kind: 'Project documentation',
      cat: 'Research · ICMIME 2022',
      site: 'pdfc/documentation.pdf',
      fileName: 'Covid-19-FMCG-Stocks-Case-Study.pdf',
      page: 'pdfc/index.html',
      files: ['pdfc/documentation.pdf', 'pdfc/Project Documentation.pdf', 'pdfc/covid.pdf'],
      summary: 'A case study on how Covid-19 moved the FMCG industry on the Bangladesh stock market, using time-series analysis, RSI and the Augmented Dickey-Fuller test in MS Excel. Published in ICMIME, 2022.',
      sections: ['Introduction', 'Data & methodology', 'RSI & ADF analysis', 'Results & discussion', 'Conclusion'],
      tags: ['Time series', 'RSI', 'ADF test', 'ICMIME 2022']
    }
  };
  const DOC_ORDER = ['washing', 'fan', 'nirr', 'thesis', 'network', 'covid'];

  const modal = $('#docModal'), panel = $('#docPanel'), bodyHost = $('#docBody');
  const elTitle = $('#docTitle'), elKind = $('#docKind'), elCat = $('#docCat'), elCounter = $('#docCounter');
  const elSize = $('#docSize'), elPath = $('#docPath');
  const btnClose = $('#docClose'), btnPrev = $('#docPrev'), btnNext = $('#docNext');
  const btnNewTab = $('#docNewTab'), btnCopy = $('#docCopy'), btnExpand = $('#docExpand');
  const btnDl = $('#docDownload'), dlLabel = btnDl ? btnDl.querySelector('.dl-label') : null;
  const prevName = $('#docPrevName'), nextName = $('#docNextName');

  let currentId = null, lastFocus = null, activeResult = null, openToken = 0;
  const resolvedCache = new Map();

  /* ---- toasts ---- */
  const toastWrap = $('#toastWrap');
  function toast(msg, type = 'info', ms = 3600) {
    if (!toastWrap) return;
    const t = doc.createElement('div');
    t.className = 'toast ' + type;
    const ico = type === 'ok' ? 'check' : type === 'err' ? 'alert' : 'info';
    t.innerHTML = `<span class="t-ico">${icon(ico)}</span><span class="t-msg">${esc(msg)}</span>`;
    toastWrap.appendChild(t);
    const kill = () => { t.classList.add('out'); setTimeout(() => t.remove(), 380); };
    const timer = setTimeout(kill, ms);
    t.addEventListener('click', () => { clearTimeout(timer); kill(); });
  }

  /* ---- network helpers ---- */
  const isFile = location.protocol === 'file:';

  const probe = async url => {
    if (isFile) return { ok: true, size: 0, status: 200, unknown: true };
    try {
      let res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
      if (!res.ok) res = await fetch(url, { method: 'GET', cache: 'no-store', headers: { Range: 'bytes=0-0' } });
      const len = Number(res.headers.get('content-length')) || 0;
      return { ok: res.ok, size: len, status: res.status };
    } catch { return { ok: false, status: 0 }; }
  };

  const absolute = (u, base) => { try { return new URL(u, base).href; } catch { return null; } };

  const srcKey = id => 'doc-src:' + id;
  const getSavedSrc = id => { try { return localStorage.getItem(srcKey(id)); } catch { return null; } };
  const setSavedSrc = (id, url) => { try { url ? localStorage.setItem(srcKey(id), url) : localStorage.removeItem(srcKey(id)); } catch {} };

  /* reads the old pdfX/index.html page and extracts whatever PDF it points at */
  const inspectLegacyPage = async page => {
    if (isFile) return null;
    try {
      const res = await fetch(page, { cache: 'no-store' });
      if (!res.ok) return null;
      const html = await res.text();
      const base = page;

      const pdfs = [];
      const re = /(?:src|href|data|content)\s*=\s*["']([^"']+?\.pdf(?:[?#][^"']*)?)["']/gi;
      let m;
      while ((m = re.exec(html))) {
        const u = absolute(m[1], base);
        if (u && !pdfs.includes(u)) pdfs.push(u);
      }
      if (pdfs.length) return { file: pdfs[0] };

      const drive = html.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([A-Za-z0-9_-]{15,})/);
      if (drive) return { driveId: drive[1] };

      const frame = html.match(/<(?:iframe|embed|object)[^>]+(?:src|data)\s*=\s*["']([^"']+)["']/i);
      if (frame) {
        const u = absolute(decodeURIComponent(frame[1]), base);
        if (u && /^https?:/.test(u)) return { embed: u };
      }
      return null;
    } catch { return null; }
  };

  const prettyPath = url => {
    try {
      const u = new URL(url, location.href);
      let p = decodeURIComponent(u.pathname);
      if (u.origin === location.origin) p = p.replace(location.pathname.replace(/[^/]*$/, ''), '').replace(/^\//, '');
      return p.length > 46 ? '…' + p.slice(-44) : p;
    } catch { return url; }
  };

  const fmtSize = bytes => {
    if (!bytes) return 'PDF';
    const mb = bytes / 1048576;
    return mb >= 1 ? mb.toFixed(1) + ' MB' : Math.max(1, Math.round(bytes / 1024)) + ' KB';
  };

  /* resolves a doc to something viewable */
  async function resolveDoc(d) {
    if (resolvedCache.has(d.id)) return resolvedCache.get(d.id);
    const job = (async () => {
      /* 0. a location you pinned yourself wins */
      const saved = getSavedSrc(d.id);
      if (saved) {
        const r = await probe(saved);
        if (r.ok) return { kind: 'pdf', url: saved, size: r.size, embed: saved, verified: true, custom: true };
        setSavedSrc(d.id, null);
      }

      /* 1. the expected file — no 404 spam when it is there */
      const primary = await probe(d.files[0]);
      if (primary.ok) return { kind: 'pdf', url: d.files[0], size: primary.size, embed: d.files[0], verified: true };

      /* 2. whatever the old pdfX/index.html page pointed at */
      const pageInfo = d.page ? await inspectLegacyPage(d.page) : null;
      if (pageInfo?.file) return { kind: 'pdf', url: pageInfo.file, size: 0, embed: pageInfo.file, viaPage: true };
      if (pageInfo?.driveId) {
        const id = pageInfo.driveId;
        return {
          kind: 'drive', size: 0, viaPage: true,
          embed: `https://drive.google.com/file/d/${id}/preview`,
          url: `https://drive.google.com/file/d/${id}/view`,
          download: `https://drive.google.com/uc?export=download&id=${id}`
        };
      }
      if (pageInfo?.embed) return { kind: 'embed', url: pageInfo.embed, embed: pageInfo.embed, size: 0, viaPage: true };

      /* 3. alternative file names people commonly use */
      for (const alt of d.files.slice(1)) {
        const r = await probe(alt);
        if (r.ok) return { kind: 'pdf', url: alt, size: r.size, embed: alt, verified: true };
      }

      if (isFile) return { kind: 'pdf', url: d.files[0], size: 0, embed: d.files[0], unverified: true };

      /* if the host refused the check (CORS, 403, offline) we still try to show the file */
      const blocked = primary.status !== 404 && primary.status !== 410;
      if (blocked) return { kind: 'pdf', url: d.files[0], size: 0, embed: d.files[0], unverified: true };

      return { kind: 'missing' };
    })();
    resolvedCache.set(d.id, job);
    return job;
  }

  /* can this browser render a PDF inside an iframe? */
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(ua);
  const canInlinePDF = !isIOS && !isAndroid;

  const viewerURL = url => url + (url.includes('#') ? '' : '#view=FitH&toolbar=1&navpanes=0');

  /* ---- state renderers ---- */
  const setHTML = (html, state) => {
    bodyHost.innerHTML = html;
    bodyHost.querySelectorAll('.doc-state').forEach(s => {
      s.classList.toggle('active', s.dataset.state === state);
      s.setAttribute('aria-hidden', s.dataset.state === state ? 'false' : 'true');
    });
  };

  const loadingHTML = () => `
    <div class="doc-state state-loading" data-state="loading">
      <div class="loader-sheet" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
      <div class="loader-text">
        <b>Locating your document…</b>
        <span id="loaderStep">Checking the usual file locations</span>
      </div>
      <div class="loader-bar" aria-hidden="true"><i></i></div>
    </div>`;

  const sheetHTML = d => `
    <article class="doc-sheet">
      <div class="sheet-top">
        <div>
          <p class="sheet-kicker">${esc(d.kind)}</p>
          <h3 class="sheet-title">${esc(d.title)}</h3>
          <p class="sheet-sub">Fahim Foysal · Industrial &amp; Production Engineering</p>
        </div>
        <span class="sheet-stamp">${icon('file')}PDF</span>
      </div>
      <div class="sheet-sec">
        <h4>Abstract</h4>
        <p>${esc(d.summary)}</p>
      </div>
      <div class="sheet-sec">
        <h4>Inside this document</h4>
        <ol class="sheet-list">${d.sections.map(s => `<li><span>${esc(s)}</span></li>`).join('')}</ol>
      </div>
      <div class="sheet-sec">
        <h4>Topics</h4>
        <div class="sheet-tags">${d.tags.map(t => `<span>${esc(t)}</span>`).join('')}</div>
      </div>
      <div class="sheet-foot">
        <span>Summary preview</span>
        <span>${esc(d.cat)}</span>
      </div>
      <span class="sheet-watermark" aria-hidden="true">SUMMARY</span>
    </article>`;

  const fallbackHTML = (d, reason, res) => {
    const map = {
      missing: {
        cls: 'err', ico: 'alert', title: 'The PDF file was not found',
        text: 'Nothing is broken — this page simply could not find the document at its expected location. The summary below is a preview; use the buttons to reach the full file.'
      },
      device: {
        cls: '', ico: 'info', title: 'Open the PDF in your device viewer',
        text: 'Inline preview is not supported by every mobile browser, so the PDF opens in your phone’s own reader instead. The summary below shows what is inside.'
      },
      blocked: {
        cls: '', ico: 'info', title: 'Inline preview did not start',
        text: 'Your browser may be blocking embedded PDFs. Open the document in a new tab or download it — both work everywhere.'
      },
      timeout: {
        cls: '', ico: 'info', title: 'This PDF is taking a while',
        text: 'Large files can be slow on mobile data. You can keep waiting, or open it in a new tab to read it there.'
      }
    }[reason] || {};
    const openHref = res?.url || d.page || d.files[0];
    const dlHref = res?.download || res?.url || d.files[0];
    return `
      <div class="doc-state state-fallback" data-state="fallback">
        <div class="fallback-banner ${map.cls}">${icon(map.ico)}
          <div><b>${esc(map.title)}</b><span>${esc(map.text)}</span></div>
        </div>
        ${sheetHTML(d)}
        <div class="fallback-actions">
          <a class="btn primary" href="${esc(openHref)}" target="_blank" rel="noopener">${icon('external')} Open PDF</a>
          <a class="btn ghost" href="${esc(dlHref)}" download target="_blank" rel="noopener">${icon('download')} Download</a>
          ${reason !== 'device' && canInlinePDF ? `<button class="btn ghost" type="button" data-retry>${icon('file')} Try inline preview</button>` : ''}
          ${d.page ? `<a class="btn ghost" href="${esc(d.page)}" target="_blank" rel="noopener">${icon('link')} Original page</a>` : ''}
        </div>
        <div class="fallback-help">
          <form class="doc-url-form" data-url-form novalidate>
            <label for="customUrl">Point this document at any PDF file</label>
            <div class="doc-url-row">
              <input id="customUrl" type="text" inputmode="url" placeholder="e.g. pdfd/report.pdf or a full https:// link"
                     value="${esc(getSavedSrc(d.id) || '')}" autocomplete="off" spellcheck="false">
              <button class="btn small primary" type="submit">${icon('link')} Load</button>
            </div>
            <p class="doc-url-note">The link is saved in this browser, so this document opens instantly next time.</p>
          </form>
          <details>
            <summary>What was checked, and what to do</summary>
            <ul>
              <li>Files tried: ${d.files.map(f => `<code>${esc(f)}</code>`).join(' · ')}</li>
              <li>The old page <code>${esc(d.page || 'pdfX/index.html')}</code> was read too, and any PDF link inside it is followed automatically.</li>
              <li>If the site is opened as a local file (<code>file://</code>), run <code>python3 -m http.server</code> in the site folder so the PDF can load.</li>
            </ul>
          </details>
        </div>
      </div>`;
  };

  /* ---------- mode A: our own PDF renderer (PDF.js, vendored locally) ---------- */
  const PDFJS_URL = new URL('vendor/pdfjs/pdf.min.mjs', document.baseURI).href;
  const PDFJS_WORKER = new URL('vendor/pdfjs/pdf.worker.min.mjs', document.baseURI).href;
  let pdfjsPromise = null;
  const loadPDFJS = () => {
    if (pdfjsPromise) return pdfjsPromise;
    pdfjsPromise = import(PDFJS_URL).then(mod => {
      const lib = (mod && mod.GlobalWorkerOptions) ? mod : (globalThis.pdfjsLib || (mod && mod.default) || mod);
      if (!lib || !lib.GlobalWorkerOptions) throw new Error('pdfjs shape');
      lib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
      return lib;
    }).catch(() => null);
    return pdfjsPromise;
  };

  const canvasViewerHTML = d => `
    <div class="doc-state state-viewer is-canvas" data-state="viewer">
      <div class="viewer-bar">
        <span class="vb-status ok" id="vbStatus">
          <i class="vb-dot"></i>
          <span id="vbLabel">Loading pages…</span>
        </span>
        <div class="pdf-tools">
          <div class="zoom-group" role="group" aria-label="Zoom">
            <button class="vb-btn icon-only" type="button" data-zoom="out" aria-label="Zoom out">${icon('x')}</button>
            <button class="vb-btn zoom-val" type="button" data-zoom="reset" title="Reset zoom"><span id="zoomLabel">100%</span></button>
            <button class="vb-btn icon-only" type="button" data-zoom="in" aria-label="Zoom in">${icon('expand')}</button>
          </div>
          <button class="vb-btn" type="button" data-fit title="Fit page width">${icon('scroll')} <span class="lbl">Fit</span></button>
          <span class="pv-sep" aria-hidden="true"></span>
          <button class="vb-btn" type="button" data-download title="Download PDF">${icon('download')} <span class="lbl">Download</span></button>
          <button class="vb-btn" type="button" data-open-tab title="Open in a new tab">${icon('external')} <span class="lbl">New tab</span></button>
        </div>
      </div>
      <div class="pdf-scroll" id="pdfScroll" tabindex="0" aria-label="${esc(d.title)} pages">
        <div class="pdf-pages" id="pdfPages"></div>
      </div>
      <div class="pdf-pager">
        <button class="pager-btn" type="button" data-page-prev aria-label="Previous page">${icon('chevron-left')}</button>
        <span class="pager-mid">
          <input id="pageInput" class="page-input" type="number" min="1" value="1" aria-label="Page number">
          <span class="pager-of">/ <span id="pageCount">–</span></span>
        </span>
        <button class="pager-btn" type="button" data-page-next aria-label="Next page">${icon('chevron-right')}</button>
        <span class="pager-progress" aria-hidden="true"><i id="pagerBar"></i></span>
      </div>
    </div>`;

  async function mountCanvasViewer(d, res, token) {
    setHTML(canvasViewerHTML(d), 'viewer');
    const scroll = $('#pdfScroll'), pagesEl = $('#pdfPages'), label = $('#vbLabel');
    const urls = new Set();
    const freeUrls = () => { urls.forEach(u => URL.revokeObjectURL(u)); urls.clear(); };

    const bail = () => {
      if (token !== openToken) return;
      setHTML(loadingHTML(), 'loading');
      setTimeout(() => { if (token === openToken) mountViewer(d, res, false); }, 260);
    };
    if (!res.url || res.kind === 'drive' || res.kind === 'embed') return bail();

    const lib = await loadPDFJS();
    if (token !== openToken) return;
    if (!lib) return bail();

    let pdf;
    try { pdf = await lib.getDocument({ url: res.url, isEvalSupported: false }).promise; }
    catch { return bail(); }
    if (token !== openToken) return;

    const total = pdf.numPages;
    if (label) label.textContent = `${total} page${total > 1 ? 's' : ''} · rendered right here`;
    $('#pageCount').textContent = total;
    const sizeTxt = fmtSize(res.size);
    elSize.textContent = sizeTxt === 'PDF' ? `${total} page${total > 1 ? 's' : ''}` : `${sizeTxt} · ${total} page${total > 1 ? 's' : ''}`;

    /* page shells keep an accurate aspect ratio before the page is painted */
    const first = await pdf.getPage(1);
    const base = first.getViewport({ scale: 1 });
    let zoom = 1;

    const shells = [];
    for (let i = 1; i <= total; i++) {
      const shell = doc.createElement('div');
      shell.className = 'pdf-page';
      shell.dataset.page = String(i);
      shell.innerHTML = '<span class="page-skeleton" aria-hidden="true"></span>';
      pagesEl.appendChild(shell);
      shells.push({ el: shell, num: i, rendered: false, scale: 0 });
    }

    const fitScale = () => {
      const pad = innerWidth < 700 ? 22 : 56;
      const w = Math.max(scroll.clientWidth - pad, 240);
      return Math.min(2.4, Math.max(0.35, w / base.width));
    };

    const layout = () => {
      const sc = fitScale() * zoom;
      shells.forEach(sh => {
        sh.el.style.width = Math.round(base.width * sc) + 'px';
        sh.el.style.height = Math.round(base.height * sc) + 'px';
      });
      return sc;
    };
    let scale = layout();

    /* pages are painted to a bitmap and shown as <img>: immune to canvas compositing quirks */
    const renderPage = async sh => {
      if (sh.rendered && Math.abs(sh.scale - scale) < 0.001) return;
      sh.busy = true;
      try {
        const page = await pdf.getPage(sh.num);
        const dpr = Math.min(devicePixelRatio || 1, 2);
        const vp = page.getViewport({ scale: scale * dpr });
        const cw = Math.round(base.width * scale), chh = Math.round(base.height * scale);

        const canvas = doc.createElement('canvas');
        canvas.width = Math.floor(vp.width);
        canvas.height = Math.floor(vp.height);
        await page.render({ canvasContext: canvas.getContext('2d', { alpha: false }), viewport: vp }).promise;

        const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
        canvas.width = canvas.height = 0;
        if (!blob) throw new Error('encode');
        const url = URL.createObjectURL(blob);
        urls.add(url);

        let img = sh.el.querySelector('.pdf-img');
        if (!img) {
          img = doc.createElement('img');
          img.className = 'pdf-img';
          img.alt = `${d.title} — page ${sh.num} of ${total}`;
          img.draggable = false;
          sh.el.appendChild(img);
        }
        const old = img.getAttribute('src');
        if (old && old.startsWith('blob:')) { URL.revokeObjectURL(old); urls.delete(old); }
        img.src = url;
        img.style.width = cw + 'px';
        img.style.height = chh + 'px';
        sh.el.style.width = cw + 'px';
        sh.el.style.height = chh + 'px';
        sh.el.querySelector('.page-skeleton')?.remove();
        sh.el.classList.add('is-rendered');
        sh.rendered = true;
        sh.scale = scale;
      } catch { /* ignore a single page */ }
      sh.busy = false;
    };

    const pio = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) renderPage(shells[+en.target.dataset.page - 1]); });
    }, { root: scroll, rootMargin: '640px 0px' });
    shells.forEach(sh => pio.observe(sh.el));
    renderPage(shells[0]);

    /* current page tracking */
    const pageInput = $('#pageInput'), pagerBar = $('#pagerBar');
    let current = 1;
    const setCurrent = (n, scrollToIt) => {
      current = clamp(n, 1, total);
      pageInput.value = String(current);
      if (pagerBar) pagerBar.style.width = (current / total * 100) + '%';
      if (scrollToIt) shells[current - 1].el.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
    };
    let scrollTick = false;
    scroll.addEventListener('scroll', () => {
      if (scrollTick) return;
      scrollTick = true;
      requestAnimationFrame(() => {
        const mid = scroll.scrollTop + scroll.clientHeight * 0.35;
        let n = 1;
        for (const sh of shells) { if (sh.el.offsetTop <= mid) n = sh.num; else break; }
        if (n !== current) setCurrent(n, false);
        scrollTick = false;
      });
    }, { passive: true });
    setCurrent(1, false);

    /* re-layout every page at the current zoom */
    const relayout = keep => {
      scale = layout();
      $('#zoomLabel').textContent = Math.round(zoom * 100) + '%';
      freeUrls();
      shells.forEach(sh => {
        pio.unobserve(sh.el);
        sh.el.querySelector('.pdf-img')?.remove();
        if (!sh.el.querySelector('.page-skeleton')) {
          const sk = doc.createElement('span');
          sk.className = 'page-skeleton'; sk.setAttribute('aria-hidden', 'true');
          sh.el.prepend(sk);
        }
        sh.el.classList.remove('is-rendered');
        sh.rendered = false; sh.scale = 0;
        pio.observe(sh.el);
      });
      requestAnimationFrame(() => {
        shells[keep - 1]?.el.scrollIntoView({ block: 'start' });
        renderPage(shells[keep - 1]);
      });
    };

    const applyZoom = next => {
      const keep = current;
      zoom = clamp(next, 0.5, 3);
      relayout(keep);
    };

    bodyHost.querySelectorAll('[data-zoom]').forEach(b => b.addEventListener('click', () => {
      const k = b.dataset.zoom;
      if (k === 'in') applyZoom(zoom * 1.2);
      else if (k === 'out') applyZoom(zoom / 1.2);
      else { zoom = 1; relayout(current); }
    }));
    bodyHost.querySelector('[data-fit]')?.addEventListener('click', () => { zoom = 1; relayout(current); });
    bodyHost.querySelector('[data-page-prev]')?.addEventListener('click', () => setCurrent(current - 1, true));
    bodyHost.querySelector('[data-page-next]')?.addEventListener('click', () => setCurrent(current + 1, true));
    pageInput?.addEventListener('change', () => setCurrent(parseInt(pageInput.value, 10) || 1, true));
    pageInput?.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.stopPropagation(); setCurrent(parseInt(pageInput.value, 10) || 1, true); pageInput.blur(); }
    });

    $('[data-open-tab]', bodyHost)?.addEventListener('click', () => window.open(res.url, '_blank', 'noopener'));
    $('[data-download]', bodyHost)?.addEventListener('click', () => downloadDoc(d, res, { btn: btnDl, label: dlLabel }));

    /* keyboard: PageUp/PageDown & j/k scroll, +/- zoom */
    const keyNav = e => {
      if (token !== openToken) { removeEventListener('keydown', keyNav); return; }
      if (e.target.matches('input, textarea')) return;
      if (e.key === 'PageDown' || e.key === 'j') { e.preventDefault(); scroll.scrollBy({ top: scroll.clientHeight * 0.9, behavior: reduceMotion ? 'auto' : 'smooth' }); }
      else if (e.key === 'PageUp' || e.key === 'k') { e.preventDefault(); scroll.scrollBy({ top: -scroll.clientHeight * 0.9, behavior: reduceMotion ? 'auto' : 'smooth' }); }
      else if (e.key === '+' || e.key === '=') { e.preventDefault(); applyZoom(zoom * 1.2); }
      else if (e.key === '-') { e.preventDefault(); applyZoom(zoom / 1.2); }
    };
    addEventListener('keydown', keyNav);

    /* refit on resize / orientation change */
    let rz;
    const onResize = () => {
      clearTimeout(rz);
      rz = setTimeout(() => {
        if (token !== openToken) { removeEventListener('resize', onResize); freeUrls(); return; }
        relayout(current);
      }, 260);
    };
    addEventListener('resize', onResize);
  }

  /* ---------- mode B: the browser's own PDF viewer ---------- */
  const viewerHTML = (d, url) => `
    <div class="doc-state state-viewer" data-state="viewer">
      <div class="viewer-bar">
        <span class="vb-status" id="vbStatus"><i class="vb-dot"></i><span id="vbLabel">Loading PDF preview…</span></span>
        <span class="vb-actions">
          <button class="vb-btn" type="button" data-open-tab>${icon('external')} Open in new tab</button>
          <button class="vb-btn" type="button" data-download>${icon('download')} Download</button>
        </span>
      </div>
      <div class="viewer-stage">
        <iframe class="pdf-frame" title="${esc(d.title)} — PDF document" src="${esc(viewerURL(url))}" allow="fullscreen"></iframe>
        <div class="viewer-tip" id="viewerTip">
          ${icon('alert')} Preview didn’t appear — use Open in new tab or Download above.
        </div>
      </div>
    </div>`;


  /* ---------- header / footer chrome ---------- */
  function paintChrome(d) {
    const i = DOC_ORDER.indexOf(d.id);
    elTitle.textContent = d.title;
    elKind.textContent = d.kind;
    elCat.textContent = d.cat;
    elCounter.textContent = `${i + 1} of ${DOC_ORDER.length}`;
    elPath.textContent = d.page || 'document.pdf';
    elSize.textContent = 'PDF';
    document.title = `${d.title} · Fahim Foysal`;

    const prevId = DOC_ORDER[(i - 1 + DOC_ORDER.length) % DOC_ORDER.length];
    const nextId = DOC_ORDER[(i + 1) % DOC_ORDER.length];
    prevName.textContent = DOCS[prevId].title;
    nextName.textContent = DOCS[nextId].title;
    btnPrev.disabled = DOC_ORDER.length < 2;
    btnNext.disabled = DOC_ORDER.length < 2;
    btnDl.classList.remove('done', 'loading');
    if (dlLabel) dlLabel.textContent = 'Download';
  }

  function wireActions(d, res) {
    const openUrl = res?.url || d.page || d.files[0];
    const dlUrl = res?.download || res?.url || d.files[0];
    btnNewTab.onclick = () => {
      if (!openUrl) return toast('No document URL available.', 'err');
      window.open(openUrl, '_blank', 'noopener');
    };
    btnDl.setAttribute('href', dlUrl || '#');
    btnDl.setAttribute('download', d.fileName || 'document.pdf');
    btnDl.onclick = e => { e.preventDefault(); downloadDoc(d, res, { btn: btnDl, label: dlLabel }); };
    elSize.textContent = fmtSize(res?.size);
    elPath.textContent = res?.url ? prettyPath(res.url) : (res?.kind === 'missing' ? 'not found' : d.page || '—');
  }

  /* ---------- download (with progress, blob first, new tab as a safety net) ---------- */
  async function downloadDoc(d, res, ui) {
    const dbtn = ui ? ui.btn : null;
    const dlabel = ui ? ui.label : null;
    res = res || await resolveDoc(d);
    if (!res || res.kind === 'missing') {
      toast('The PDF could not be found on the server. Opening the original page instead.', 'err', 5000);
      if (d.page) window.open(d.page, '_blank', 'noopener');
      return;
    }
    const url = res.download || res.url;
    dbtn?.classList.add('loading');
    if (dlabel) dlabel.textContent = 'Saving…';
    try {
      if (res.kind === 'drive') throw new Error('cross-origin');
      const resp = await fetch(url, { cache: 'no-store' });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const total = Number(resp.headers.get('content-length')) || 0;
      let blob;
      if (resp.body && total > 0 && resp.body.getReader && dlabel) {
        const reader = resp.body.getReader();
        const chunks = [];
        let got = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value); got += value.length;
          dlabel.textContent = Math.min(99, Math.round(got / total * 100)) + '%';
        }
        blob = new Blob(chunks, { type: 'application/pdf' });
      } else {
        blob = await resp.blob();
      }
      const objUrl = URL.createObjectURL(blob);
      const a = doc.createElement('a');
      a.href = objUrl;
      a.download = d.fileName || 'document.pdf';
      doc.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(objUrl), 5000);
      dbtn?.classList.remove('loading'); dbtn?.classList.add('done');
      if (dlabel) dlabel.textContent = 'Saved';
      toast('Download started — check your downloads folder.', 'ok');
      setTimeout(() => { dbtn?.classList.remove('done'); if (dlabel) dlabel.textContent = 'Download'; }, 2800);
    } catch {
      dbtn?.classList.remove('loading');
      if (dlabel) dlabel.textContent = 'Download';
      if (/^https?:/.test(url)) {
        window.open(url, '_blank', 'noopener');
        toast('Direct saving was blocked — the PDF is open in a new tab, use your browser’s save button.', 'info', 5200);
      } else {
        toast('Sorry, this file could not be downloaded.', 'err');
      }
    }
  }

  /* ---------- open / close ---------- */
  async function openDoc(id, opts = {}) {
    const d = DOCS[id];
    if (!d) return;
    const token = ++openToken;
    currentId = id;

    if (!modal.classList.contains('open')) {
      lastFocus = doc.activeElement;
      lastHash = location.hash.startsWith('#doc=') ? '' : location.hash;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      doc.body.classList.add('no-scroll', 'reader-open');
      panel.style.transformOrigin = opts.origin ? `${opts.origin.x}px ${opts.origin.y}px` : '50% 40%';
      requestAnimationFrame(() => btnClose.focus({ preventScroll: true }));
    }

    paintChrome(d);
    setHTML(loadingHTML(), 'loading');
    updateHash(id);
    restoreButtons();

    const started = performance.now();
    const res = await resolveDoc(d);
    const step = $('#loaderStep');
    if (step) step.textContent = res.kind === 'missing'
      ? 'No file found — preparing a summary preview'
      : 'Preparing the preview…';

    const wait = Math.max(0, 380 - (performance.now() - started));
    setTimeout(() => {
      if (token !== openToken) return;
      activeResult = res;
      wireActions(d, res);

      if (res.kind === 'missing') return setHTML(fallbackHTML(d, 'missing', res), 'fallback');
      mountCanvasViewer(d, res, token);
    }, reduceMotion ? 0 : wait);
  }

  /* ---------- mode B fallback: hand over to the browser's own PDF viewer ---------- */
  function mountViewer(d, res, isRetry) {
    setHTML(viewerHTML(d, res.embed || res.url), 'viewer');
    const frame = $('.pdf-frame', bodyHost);
    const tip = $('#viewerTip');
    const status = $('#vbStatus');
    const label = $('#vbLabel');
    const openUrl = res.url || res.embed;

    $('[data-open-tab]', bodyHost)?.addEventListener('click', () => window.open(openUrl, '_blank', 'noopener'));
    $('[data-download]', bodyHost)?.addEventListener('click', () => downloadDoc(d, res, { btn: btnDl, label: dlLabel }));
    tip?.addEventListener('click', () => window.open(openUrl, '_blank', 'noopener'));

    let loaded = false;
    const done = () => {
      loaded = true;
      frame.classList.add('ready');
      status?.classList.add('ok');
      if (label) label.textContent = 'PDF ready — scroll inside the frame to read';
      tip?.classList.remove('show');
    };
    frame.addEventListener('load', done);
    if (frame.contentDocument && frame.contentDocument.readyState === 'complete') setTimeout(done, 400);

    setTimeout(() => {
      if (loaded) return;
      if (label) label.textContent = 'Preview is slow or blocked by this browser';
      status?.classList.add('warn');
      tip?.classList.add('show');
    }, isRetry ? 5000 : 9000);
  }

  function restoreButtons() {
    btnNewTab.onclick = null;
    btnDl.onclick = null;
    btnDl.setAttribute('href', '#');
  }

  let lastHash = '';
  const updateHash = id => {
    try { history.replaceState(null, '', `${location.pathname}${location.search}#doc=${id}`); } catch {}
  };
  const clearHash = () => {
    try { history.replaceState(null, '', `${location.pathname}${location.search}${lastHash || ''}`); } catch {}
  };

  function closeDoc() {
    if (!modal.classList.contains('open')) return;
    openToken++;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    doc.body.classList.remove('no-scroll', 'reader-open');
    panel.classList.remove('max');
    updateExpandIcon(false);
    setTimeout(() => { if (!modal.classList.contains('open')) { bodyHost.innerHTML = ''; currentId = null; } }, 380);
    clearHash();
    document.title = 'Fahim Foysal | Industrial & Production Engineer';
    lastFocus?.focus?.({ preventScroll: true });
  }

  const goto = dir => {
    if (!currentId) return;
    const i = DOC_ORDER.indexOf(currentId);
    const next = DOC_ORDER[(i + dir + DOC_ORDER.length) % DOC_ORDER.length];
    openDoc(next);
  };

  const updateExpandIcon = on => {
    btnExpand.innerHTML = `<svg class="ic" aria-hidden="true"><use href="#i-${on ? 'shrink' : 'expand'}"/></svg>`;
    btnExpand.setAttribute('aria-label', on ? 'Restore reader' : 'Expand reader');
  };

  /* ---- events ---- */
  modal.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) closeDoc();
    const urlForm = e.target.closest('[data-url-form]');
    if (urlForm) {
      /* handled by the submit listener below */
    }
    if (e.target.closest('[data-retry]') && currentId) {
      const d = DOCS[currentId];
      if (activeResult) { setHTML(loadingHTML(), 'loading'); setTimeout(() => mountViewer(d, activeResult, true), 500); }
    }
  });
  /* "pin a file" form inside the fallback state */
  modal.addEventListener('submit', async e => {
    const form = e.target.closest('[data-url-form]');
    if (!form) return;
    e.preventDefault();
    const input = form.querySelector('input');
    const d = DOCS[currentId];
    if (!d || !input) return;
    const raw = input.value.trim();
    if (!raw) return toast('Paste a PDF link first.', 'err');
    const url = absolute(raw, document.baseURI) || raw;
    if (!/\.pdf(\?|#|$)/i.test(url)) return toast('That link does not look like a PDF file.', 'err');
    const btn = form.querySelector('button');
    btn.disabled = true;
    const r = await probe(url);
    btn.disabled = false;
    if (!r.ok && !isFile) return toast('That file could not be opened. Check the path and try again.', 'err', 5000);
    setSavedSrc(d.id, url);
    resolvedCache.delete(d.id);
    toast('Saved — opening that file for this document.', 'ok');
    openDoc(d.id);
  });

  btnClose?.addEventListener('click', closeDoc);
  btnPrev?.addEventListener('click', () => goto(-1));
  btnNext?.addEventListener('click', () => goto(1));
  btnExpand?.addEventListener('click', () => {
    const on = panel.classList.toggle('max');
    updateExpandIcon(on);
  });
  btnCopy?.addEventListener('click', async () => {
    if (!currentId) return;
    const url = `${location.origin}${location.pathname}${location.search}#doc=${currentId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast('Link copied — it opens this exact document.', 'ok');
    } catch {
      const ta = doc.createElement('textarea');
      ta.value = url; ta.style.position = 'fixed'; ta.style.opacity = '0';
      doc.body.appendChild(ta); ta.select();
      try { doc.execCommand('copy'); toast('Link copied.', 'ok'); } catch { toast('Copy failed — the link is in your address bar.', 'err'); }
      ta.remove();
    }
  });

  doc.addEventListener('keydown', e => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') { e.preventDefault(); closeDoc(); return; }
    const typing = /input|textarea|select/i.test(e.target.tagName) || e.target.isContentEditable;
    if (!typing && e.key === 'ArrowRight') { e.preventDefault(); goto(1); return; }
    if (!typing && e.key === 'ArrowLeft') { e.preventDefault(); goto(-1); return; }
    if (e.key === 'Tab') {
      const f = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', panel)
        .filter(el => el.offsetParent !== null && !el.disabled);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* swipe-down to close on phones */
  if (panel) {
    let sy = null, dy = 0;
    const handle = $('.drag-handle');
    const start = e => { sy = e.clientY; dy = 0; panel.style.transition = 'none'; };
    const move = e => {
      if (sy === null) return;
      dy = Math.max(0, e.clientY - sy);
      panel.style.transform = `translateY(${dy}px)`;
    };
    const end = () => {
      if (sy === null) return;
      panel.style.transition = '';
      panel.style.transform = '';
      if (dy > 110) closeDoc();
      sy = null; dy = 0;
    };
    handle?.addEventListener('pointerdown', e => { start(e); handle.setPointerCapture?.(e.pointerId); });
    handle?.addEventListener('pointermove', move);
    handle?.addEventListener('pointerup', end);
    handle?.addEventListener('pointercancel', end);
  }

  /* ---- wire project buttons ---- */
  $$('[data-doc]').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = btn.dataset.doc;
      const r = panel.getBoundingClientRect();
      openDoc(id, { origin: { x: e.clientX - r.left, y: e.clientY - r.top } });
    });
    btn.addEventListener('pointerenter', () => { if (DOCS[btn.dataset.doc]) resolveDoc(DOCS[btn.dataset.doc]); });
  });
  $$('[data-doc-download]').forEach(a => a.addEventListener('click', async e => {
    const d = DOCS[a.dataset.docDownload];
    if (!d) return;
    e.preventDefault();
    const res = await resolveDoc(d);
    if (!res || res.kind === 'missing') {
      toast('The PDF could not be found. Opening the original page instead.', 'err', 5000);
      if (d.page) window.open(d.page, '_blank', 'noopener');
      return;
    }
    const label = a.querySelector('.dl-note');
    toast('Preparing your download…', 'info', 2200);
    downloadDoc(d, res, label ? { btn: a, label } : null);
  }));
  $$('[data-doc-href]').forEach(a => {
    a.addEventListener('pointerenter', async () => {
      const d = DOCS[a.dataset.docHref];
      if (!d) return;
      const res = await resolveDoc(d);
      if (res && (res.url || res.embed)) a.href = res.url || res.embed;
    });
  });

  /* deep link + hash changes */
  const openFromHash = () => {
    const m = location.hash.match(/doc=([\w-]+)/);
    if (m && DOCS[m[1]]) openDoc(m[1]);
  };
  addEventListener('load', openFromHash);
  addEventListener('hashchange', () => {
    const m = location.hash.match(/doc=([\w-]+)/);
    if (m && DOCS[m[1]] && m[1] !== currentId) openDoc(m[1]);
  });

  /* ----------------------------- 10. contact ------------------------------- */
  /*  Where messages go. Nothing to install: FormSubmit relays the message to your
      inbox with no signup — it only needs ONE activation click on the first
      submission (it emails you a confirm link). Swap `endpoint` for Formspree,
      Web3Forms or a Google Apps Script URL at any time; the code adapts.         */
  const CONTACT = {
    endpoint: 'https://formsubmit.co/ajax/fahim.ruet.ipe17@gmail.com',
    accessKey: '',                 /* Web3Forms only */
    inbox: 'fahim.ruet.ipe17@gmail.com'
  };

  const form = $('#contactForm');
  if (form) {
    const fields = { name: $('#name'), email: $('#email'), message: $('#message') };
    const honey = form.querySelector('input[name="_honey"]');
    const submitBtn = form.querySelector('.submit');
    const btnLabel = form.querySelector('.btn-label');
    const statusEl = $('#formStatus');
    const successEl = $('#formSuccess');
    const noteEl = $('#formNote');
    const charCount = $('#charCount');
    const emailRe = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
    const DRAFT_KEY = 'contact-draft';
    const SENT_KEY = 'contact-last-sent';
    const btnHTML = btnLabel ? btnLabel.innerHTML : '';

    const kind = (() => {
      const u = CONTACT.endpoint || '';
      if (/formsubmit\.co/.test(u)) return 'formsubmit';
      if (/formspree\.io/.test(u)) return 'formspree';
      if (/web3forms\.com/.test(u)) return 'web3forms';
      if (/script\.google\.com/.test(u)) return 'gas';
      if (/^https?:/.test(u)) return 'json';
      return 'none';
    })();

    const setError = (key, msg) => {
      const wrap = fields[key].closest('.field');
      const errEl = wrap?.querySelector('.field-err');
      wrap?.classList.toggle('invalid', !!msg);
      if (errEl) errEl.textContent = msg || '';
      fields[key].setAttribute('aria-invalid', msg ? 'true' : 'false');
    };

    const validate = () => {
      let ok = true;
      const name = fields.name.value.trim();
      const email = fields.email.value.trim();
      const msg = fields.message.value.trim();

      if (name.length < 2) { setError('name', 'Please tell me your name (2+ characters).'); ok = false; }
      else setError('name', '');
      if (email && !emailRe.test(email)) { setError('email', 'That email looks off — or just leave it empty.'); ok = false; }
      else setError('email', '');
      if (msg.length < 8) { setError('message', 'A little more detail, please (8+ characters).'); ok = false; }
      else setError('message', '');
      return ok;
    };

    /* ---- status helpers ---- */
    const showStatus = (kindName, html) => {
      if (!statusEl) return;
      statusEl.className = 'form-status ' + kindName;
      statusEl.innerHTML = html;
      statusEl.hidden = false;
      statusEl.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
    };
    const clearStatus = () => { if (statusEl) { statusEl.hidden = true; statusEl.innerHTML = ''; } };

    const setSending = on => {
      form.classList.toggle('sending', on);
      if (!submitBtn) return;
      submitBtn.disabled = on;
      ['name', 'email', 'message'].forEach(k => { fields[k].disabled = on; });
      if (btnLabel) btnLabel.innerHTML = on ? 'Sending…' : btnHTML;
    };

    /* ---- draft: never lose what the visitor typed ---- */
    let draftTimer;
    const saveDraft = () => {
      clearTimeout(draftTimer);
      draftTimer = setTimeout(() => {
        try {
          const d = { name: fields.name.value, email: fields.email.value, message: fields.message.value };
          if (d.name || d.email || d.message) localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
          else localStorage.removeItem(DRAFT_KEY);
        } catch {}
      }, 400);
    };
    const clearDraft = () => { try { localStorage.removeItem(DRAFT_KEY); } catch {} };
    const readDraft = () => { try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null'); } catch { return null; } };

    const draft = readDraft();
    if (draft) {
      fields.name.value = draft.name || '';
      fields.email.value = draft.email || '';
      fields.message.value = draft.message || '';
    }
    const updateCount = () => {
      if (charCount) charCount.textContent = `${fields.message.value.length} / 3000`;
    };
    updateCount();

    ['name', 'email', 'message'].forEach(k => {
      fields[k].addEventListener('input', () => {
        updateCount();
        saveDraft();
        if (fields[k].closest('.field')?.classList.contains('invalid')) validate();
      });
    });

    /* ---- payload builders ---- */
    const payload = () => {
      const name = fields.name.value.trim();
      const email = fields.email.value.trim();
      const message = fields.message.value.trim();
      return { name, email, message };
    };

    const buildBody = p => {
      const base = {
        name: p.name,
        email: p.email || '(not provided)',
        message: p.message,
        _subject: `Portfolio message from ${p.name}`,
        _template: 'table',
        _captcha: 'false',
        submitted_from: location.href,
        sent_at: new Date().toLocaleString()
      };
      /* only include reply-to when the visitor actually left an address */
      if (p.email && kind !== 'web3forms') base._replyto = p.email;
      if (kind === 'web3forms') return { access_key: CONTACT.accessKey, subject: base._subject, from_name: 'Portfolio contact form', ...base };
      return base;
    };

    const mailtoHref = p => {
      const subject = `Portfolio message from ${p.name || 'a visitor'}`;
      const body = `${p.message}\n\n— ${p.name}${p.email ? ` (${p.email})` : ''}\n\nSent from ${location.href}`;
      return `mailto:${CONTACT.inbox}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    async function deliver(p) {
      if (kind === 'none') return { ok: false, reason: 'not-configured' };

      /* Google Apps Script: fire-and-forget (opaque response) */
      if (kind === 'gas') {
        await fetch(CONTACT.endpoint, {
          method: 'POST', mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ name: p.name, email: p.email, message: p.message, page: location.href })
        });
        return { ok: true, opaque: true };
      }

      const res = await fetch(CONTACT.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(buildBody(p))
      });

      let data = null;
      try { data = await res.json(); } catch {}

      const flag = data && typeof data.success !== 'undefined' ? String(data.success).toLowerCase() : '';
      const msg = (data && (data.message || data.error || data.msg)) || '';

      if (/activat/i.test(msg)) return { ok: false, reason: 'activation', detail: msg };
      if (!res.ok) return { ok: false, reason: 'http', detail: msg || `HTTP ${res.status}` };
      if (flag === 'false' || flag === 'error') return { ok: false, reason: 'rejected', detail: msg };
      return { ok: true, detail: msg };
    }

    /* ---- success / failure UI ---- */
    const showSuccess = p => {
      const fsText = $('#fsText');
      if (fsText) {
        fsText.textContent = p.email
          ? `Thanks, ${p.name.split(' ')[0]} — your message is in my inbox and I’ll reply to ${p.email} soon.`
          : `Thanks, ${p.name.split(' ')[0]} — your message is in my inbox. I’ll get back to you soon.`;
      }
      form.classList.add('is-sent');
      if (successEl) {
        successEl.hidden = false;
        requestAnimationFrame(() => successEl.classList.add('show'));
        successEl.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
        successEl.querySelector('.fs-badge')?.animate?.(
          [{ transform: 'scale(.4)', opacity: 0 }, { transform: 'scale(1.12)', opacity: 1 }, { transform: 'scale(1)' }],
          { duration: 620, easing: 'cubic-bezier(.22,1,.36,1)' }
        );
      }
      clearStatus();
      clearDraft();
      try { localStorage.setItem(SENT_KEY, String(Date.now())); } catch {}
      toast('Message sent — thank you!', 'ok');
    };

    const showFallback = (p, reason, detail) => {
      const map = {
        'not-configured': ['Delivery is not set up yet', 'No form service is configured, so use one of the options below — they all work.'],
        activation: ['One activation step left', 'The mail service just sent an activation link to the site owner. The message below can be sent right now instead.'],
        http: ['The mail service did not accept it', 'You can send the exact same message directly — nothing is lost.'],
        rejected: ['The mail service did not accept it', 'You can send the exact same message directly — nothing is lost.'],
        network: ['You appear to be offline', 'Your message is saved in this browser. Reconnect and press Send again, or use a button below.']
      }[reason] || ['Something went wrong', 'Your message is saved — try one of these instead.'];

      showStatus('warn', `
        <div class="st-head">${icon('alert')}<b>${esc(map[0])}</b></div>
        <p class="st-text">${esc(map[1])}${detail ? ` <span class="st-detail">(${esc(String(detail).slice(0, 120))})</span>` : ''}</p>
        <div class="st-actions">
          <a class="btn small primary" href="${esc(mailtoHref(p))}">${icon('mail')} Open mail app</a>
          <button class="btn small ghost" type="button" data-copy-msg>${icon('copy')} Copy message</button>
          <button class="btn small ghost" type="button" data-retry-send>${icon('send')} Try again</button>
        </div>`);
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(p)); } catch {}
    };

    /* ---- submit ---- */
    form.addEventListener('submit', async e => {
      e.preventDefault();
      clearStatus();

      /* honeypot: silently accept and drop bot submissions */
      if (honey && honey.value.trim()) {
        showSuccess(payload());
        return;
      }
      if (!validate()) {
        toast('Please fix the highlighted fields.', 'err');
        form.querySelector('.field.invalid input, .field.invalid textarea')?.focus();
        return;
      }

      const p = payload();
      setSending(true);
      const started = performance.now();

      try {
        const result = await deliver(p);
        const wait = Math.max(0, 650 - (performance.now() - started));
        await new Promise(r => setTimeout(r, reduceMotion ? 0 : wait));
        setSending(false);

        if (result.ok) return showSuccess(p);
        showFallback(p, result.reason, result.detail);
      } catch (err) {
        setSending(false);
        showFallback(p, 'network', err && err.message);
      }
    });

    /* fallback + success buttons */
    form.addEventListener('click', async e => {
      if (e.target.closest('[data-retry-send]')) {
        const d = readDraft() || payload();
        fields.name.value = d.name || fields.name.value;
        fields.email.value = d.email || fields.email.value;
        fields.message.value = d.message || fields.message.value;
        updateCount();
        form.requestSubmit();
        return;
      }
      if (e.target.closest('[data-copy-msg]')) {
        const p = readDraft() || payload();
        const text = `${p.message}\n\n— ${p.name}${p.email ? ` (${p.email})` : ''}`;
        try {
          await navigator.clipboard.writeText(text);
          toast('Message copied — paste it into any email or chat.', 'ok');
        } catch {
          toast('Copy failed — select the message text and copy manually.', 'err');
        }
      }
    });

    $('#sendAnother')?.addEventListener('click', () => {
      form.classList.remove('is-sent');
      if (successEl) { successEl.classList.remove('show'); successEl.hidden = true; }
      form.reset();
      updateCount();
      ['name', 'email', 'message'].forEach(k => { setError(k, ''); fields[k].disabled = false; });
      clearStatus();
      fields.name.focus();
    });

    /* a small, honest hint under the button */
    if (noteEl) {
      noteEl.innerHTML = kind === 'none'
        ? `${icon('info')} Direct delivery is not configured — the form will offer email instead.`
        : `${icon('info')} Delivered to <b>${esc(CONTACT.inbox)}</b> · no account needed`;
    }
  }


  /* ------------------------------ 11. misc --------------------------------- */
  const yr = $('#year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* graceful image fallbacks (photo + QR) */
  $$('img').forEach(img => {
    const mark = () => {
      if (img.id === 'profileImg') img.closest('.photo')?.classList.add('is-missing');
      else if (img.classList.contains('whatsapp-qr')) img.closest('.wa-qr')?.classList.add('is-missing');
      img.style.display = 'none';
    };
    if (img.complete && img.naturalWidth === 0) mark();
    img.addEventListener('error', mark, { once: true });
  });

  /* smooth anchor offset (safety net for browsers without scroll-padding) */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (!id || id === '#' || id.startsWith('#doc=')) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + scrollY - (nav.offsetHeight + 14);
      scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });
})();
