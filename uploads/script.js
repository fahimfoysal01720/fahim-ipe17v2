document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- theme ---------- */
  const root = document.documentElement, themeBtn = $('#themeBtn');
  const saved = (() => { try { return localStorage.getItem('theme'); } catch (e) { return null; } })();
  const setTheme = t => {
    root.dataset.theme = t;
    themeBtn.innerHTML = t === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    try { localStorage.setItem('theme', t); } catch (e) {}
  };
  setTheme(saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  themeBtn.addEventListener('click', () => { setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'); drawDiagrams(); });

  /* ---------- nav, progress, back to top ---------- */
  const nav = $('#nav'), bar = $('#progress'), toTop = $('#toTop');
  const links = $$('#menu a'), burger = $('#burger'), menu = $('#menu');
  const onScroll = () => {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (max > 0 ? y / max * 100 : 0) + '%';
    nav.classList.toggle('scrolled', y > 40);
    toTop.classList.toggle('show', y > 600);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  links.forEach(a => a.addEventListener('click', () => { menu.classList.remove('open'); burger.setAttribute('aria-expanded', false); }));

  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));

  /* ---------- reveal, skill bars, counters ---------- */
  const countUp = el => {
    const end = parseFloat(el.dataset.count), dec = +el.dataset.dec || 0, t0 = performance.now(), dur = 1400;
    const tick = t => {
      const p = Math.min((t - t0) / dur, 1), v = end * (1 - Math.pow(1 - p, 3));
      el.textContent = dec ? v.toFixed(dec) : Math.round(v);
      if (p < 1) requestAnimationFrame(tick);
    };
    reduce ? el.textContent = end.toFixed(dec) : requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target; el.classList.add('in');
    $$('.level-bar', el).forEach(b => b.style.width = b.dataset.level + '%');
    $$('[data-count]', el).forEach(countUp);
    io.unobserve(el);
  }), { threshold: .15 });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---------- typed roles ---------- */
  const roles = ['supply chain optimization', 'Arduino-based automation', 'lean & quality systems', 'data-driven decisions'];
  const typed = $('#typed');
  if (reduce) typed.textContent = roles[0];
  else {
    let r = 0, c = 0, del = false;
    (function type() {
      const w = roles[r];
      typed.textContent = w.slice(0, c += del ? -1 : 1);
      let wait = del ? 35 : 70;
      if (!del && c === w.length) { del = true; wait = 1600; }
      else if (del && c === 0) { del = false; r = (r + 1) % roles.length; wait = 350; }
      setTimeout(type, wait);
    })();
  }

  /* ---------- hero network canvas (a supply chain in motion) ---------- */
  const cv = $('#network'), ctx = cv.getContext('2d');
  let W, H, nodes, edges, packets, raf;
  function build() {
    const dpr = Math.min(devicePixelRatio || 1, 2), r = cv.getBoundingClientRect();
    W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const layers = 5, per = W < 700 ? 3 : 4; nodes = []; edges = []; packets = [];
    for (let l = 0; l < layers; l++) {
      for (let i = 0; i < per; i++) {
        nodes.push({ l, x: W * (.08 + .84 * l / (layers - 1)) + (Math.random() - .5) * 30,
          y: H * (.15 + .7 * (i + .5) / per) + (Math.random() - .5) * 40, r: 2.5 + Math.random() * 2 });
      }
    }
    nodes.forEach(a => nodes.filter(b => b.l === a.l + 1).forEach(b => { if (Math.random() < .55) edges.push([a, b]); }));
    for (let i = 0; i < 26; i++) packets.push({ e: edges[i % edges.length], t: Math.random(), s: .002 + Math.random() * .003 });
  }
  function frame() {
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(120,170,255,.16)';
    edges.forEach(([a, b]) => { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); });
    nodes.forEach(n => { ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, 7); ctx.fillStyle = 'rgba(160,200,255,.55)'; ctx.fill(); });
    packets.forEach(p => {
      p.t += p.s;
      if (p.t >= 1) { const next = edges.filter(e => e[0] === p.e[1]); p.e = next.length ? next[Math.floor(Math.random() * next.length)] : edges[Math.floor(Math.random() * edges.length)]; p.t = 0; }
      const [a, b] = p.e, x = a.x + (b.x - a.x) * p.t, y = a.y + (b.y - a.y) * p.t;
      ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fillStyle = '#ff9f1c'; ctx.shadowColor = '#ff9f1c'; ctx.shadowBlur = 12; ctx.fill(); ctx.shadowBlur = 0;
    });
    if (!reduce) raf = requestAnimationFrame(frame);
  }
  build(); frame();
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { cancelAnimationFrame(raf); build(); frame(); }, 200); });
  new IntersectionObserver(([e]) => { if (reduce) return; cancelAnimationFrame(raf); if (e.isIntersecting) frame(); }).observe($('.hero'));

  /* ---------- project filter + 3D tilt ---------- */
  $$('.chip').forEach(ch => ch.addEventListener('click', () => {
    $$('.chip').forEach(c => c.classList.toggle('active', c === ch));
    $$('.project-card').forEach(card => card.classList.toggle('hide', ch.dataset.filter !== 'all' && card.dataset.cat !== ch.dataset.filter));
  }));
  if (!reduce && matchMedia('(hover:hover)').matches) {
    $$('.project-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const b = card.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - .5, y = (e.clientY - b.top) / b.height - .5;
        card.style.transform = `perspective(800px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => card.style.transform = '');
    });
  }

  /* ---------- contact form (opens the visitor's email app) ---------- */
  const toast = $('#toast');
  const say = msg => { toast.textContent = msg; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 4000); };
  const form = $('#contactForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const n = $('#name').value.trim(), em = $('#email').value.trim(), m = $('#message').value.trim();
    const body = encodeURIComponent(`${m}\n\nFrom: ${n} (${em})`);
    location.href = `mailto:fahim.ruet.ipe17@gmail.com?subject=${encodeURIComponent('Portfolio message from ' + n)}&body=${body}`;
    say('Opening your email app. Your message is ready to send.');
    form.reset();
  });
  $('#year').textContent = new Date().getFullYear();

  /* ---------- D3 diagrams ---------- */
  function drawDiagrams() { if (window.d3) { createLeanTree(); createFishboneDiagram(); } }
  window.addEventListener('load', drawDiagrams);
  if (window.d3) drawDiagrams();
});

function createLeanTree() {
  const data = { name: 'Lean Manufacturing', children: [
    { name: 'Principles', children: ['Value', 'Value Stream', 'Flow', 'Pull', 'Perfection'].map(name => ({ name })) },
    { name: 'Tools', children: ['5S', 'Kanban', 'Kaizen', 'Poka-Yoke', 'VSM'].map(name => ({ name })) },
    { name: 'Benefits', children: ['Reduced Waste', 'Improved Quality', 'Lower Costs', 'Shorter Lead Times'].map(name => ({ name })) }
  ] };
  const W = 640, H = 330, host = d3.select('#lean-tree');
  host.selectAll('svg').remove();
  const svg = host.append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('role', 'img').attr('aria-label', 'Lean manufacturing tree: principles, tools, benefits')
    .append('g').attr('transform', 'translate(110,10)');
  const root = d3.hierarchy(data);
  d3.tree().size([H - 20, W - 260])(root);
  const colors = ['#ff9f1c', '#0a7cff', '#16a34a'];
  const col = d => d.depth === 0 ? '#e11d48' : colors[root.children.indexOf(d.depth === 1 ? d : d.parent)];
  svg.selectAll('.link').data(root.links()).enter().append('path').attr('class', 'link')
    .attr('d', d3.linkHorizontal().x(d => d.y).y(d => d.x))
    .style('stroke', d => col(d.target))
    .attr('stroke-dasharray', function () { return this.getTotalLength(); })
    .attr('stroke-dashoffset', function () { return this.getTotalLength(); })
    .transition().delay((d, i) => i * 50).duration(900).attr('stroke-dashoffset', 0);
  const node = svg.selectAll('.node').data(root.descendants()).enter().append('g').attr('transform', d => `translate(${d.y},${d.x})`);
  node.append('circle').attr('r', d => d.depth === 0 ? 8 : d.children ? 6 : 4).style('fill', col);
  node.append('text').attr('class', d => 'dg-text' + (d.children ? ' dg-bold' : ''))
    .attr('x', d => d.depth === 0 ? -14 : d.children ? 0 : 10).attr('y', d => d.children && d.depth ? -12 : 4)
    .attr('text-anchor', d => d.depth === 0 ? 'end' : d.children ? 'middle' : 'start').text(d => d.data.name);
}

function createFishboneDiagram() {
  const W = 560, H = 320, host = d3.select('#tqm-fishbone');
  host.selectAll('svg').remove();
  const svg = host.append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('role', 'img').attr('aria-label', 'Fishbone (Ishikawa) diagram with six cause categories');
  const cy = H / 2, line = (x1, y1, x2, y2, c, w) => svg.append('line').attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2).attr('stroke', c).attr('stroke-width', w).attr('stroke-linecap', 'round');
  line(20, cy, 440, cy, '#0a7cff', 3);
  svg.append('rect').attr('x', 440).attr('y', cy - 22).attr('width', 112).attr('height', 44).attr('rx', 10).attr('fill', '#e11d48');
  svg.append('text').attr('x', 496).attr('y', cy + 5).attr('text-anchor', 'middle').attr('fill', '#fff').style('font', '700 13px Inter,sans-serif').text('Quality Issue');
  const top = ['Methods', 'Materials', 'Machines'], bot = ['Manpower', 'Environment', 'Management'];
  [[top, 1], [bot, -1]].forEach(([names, dir]) => names.forEach((n, i) => {
    const x0 = 70 + i * 135, y0 = cy - dir * 110, x1 = x0 + 55;
    line(x0, y0, x1, cy, '#ff9f1c', 2.5);
    [.35, .65].forEach(t => line(x0 + (x1 - x0) * t, y0 + (cy - y0) * t, x0 + (x1 - x0) * t - 32, y0 + (cy - y0) * t, '#ff9f1c', 1.2));
    svg.append('text').attr('x', x0).attr('y', y0 - dir * 14 + (dir > 0 ? 0 : 6)).attr('text-anchor', 'middle').attr('class', 'dg-text dg-bold').style('font-size', '13px').text(n);
  }));
}
