/* ═══════════════════════════════════════════════════════════════
   windows.js — XP Window drag, z-index, minimize, maximize, taskbar
═══════════════════════════════════════════════════════════════ */

let topZ = 200;
const openWins = {}; // { winId: { title, icon, minimized } }
let maximizedWin = null;
let lbImages = [];
let lbIndex = 0;

/* ── Window Management ─────────────────────────────────────── */
function openWindow(id) {
  const winId = 'win-' + id;
  const el = document.getElementById(winId);
  if (!el) return;

  el.style.display = 'flex';
  el.classList.remove('minimized');
  bringToFront(el);
  addToTaskbar(winId);

  // Animate skill bars when about opens
  if (id === 'about') {
    setTimeout(() => {
      document.querySelectorAll('.skill-fill').forEach(bar => {
        bar.style.width = bar.getAttribute('data-width') || bar.style.width;
      });
    }, 100);
  }
}

function closeWindow(winId) {
  const el = document.getElementById(winId);
  if (!el) return;
  el.style.display = 'none';
  el.classList.remove('maximized');
  if (maximizedWin === winId) maximizedWin = null;
  removeFromTaskbar(winId);
}

function minimizeWindow(winId) {
  const el = document.getElementById(winId);
  if (!el) return;
  el.classList.add('minimized');
  el.classList.remove('active');
  updateTaskbarBtn(winId, false);
}

function maximizeWindow(winId) {
  const el = document.getElementById(winId);
  if (!el) return;
  if (maximizedWin === winId) {
    el.classList.remove('maximized');
    maximizedWin = null;
  } else {
    if (maximizedWin) {
      document.getElementById(maximizedWin)?.classList.remove('maximized');
    }
    el.classList.add('maximized');
    maximizedWin = winId;
  }
  bringToFront(el);
}

function bringToFront(el) {
  topZ++;
  el.style.zIndex = topZ;
  document.querySelectorAll('.xp-window').forEach(w => w.classList.remove('active'));
  el.classList.add('active');
}

/* ── Taskbar ────────────────────────────────────────────────── */
function addToTaskbar(winId) {
  if (openWins[winId]) {
    updateTaskbarBtn(winId, true);
    return;
  }
  const el = document.getElementById(winId);
  const titleEl = el?.querySelector('.win-title');
  const iconEl  = el?.querySelector('.win-icon');
  const label = (iconEl?.textContent || '') + ' ' + (titleEl?.textContent || winId);
  openWins[winId] = { label };

  const btn = document.createElement('button');
  btn.className = 'taskbar-win-btn active-win';
  btn.id = 'tbtn-' + winId;
  btn.textContent = label;
  btn.onclick = () => toggleMinimize(winId);
  document.getElementById('taskbar-windows').appendChild(btn);
}

function removeFromTaskbar(winId) {
  delete openWins[winId];
  document.getElementById('tbtn-' + winId)?.remove();
}

function updateTaskbarBtn(winId, active) {
  const btn = document.getElementById('tbtn-' + winId);
  if (btn) btn.classList.toggle('active-win', active);
}

function toggleMinimize(winId) {
  const el = document.getElementById(winId);
  if (!el) return;
  if (el.classList.contains('minimized')) {
    el.classList.remove('minimized');
    el.style.display = 'flex';
    bringToFront(el);
    updateTaskbarBtn(winId, true);
  } else {
    minimizeWindow(winId);
  }
}

/* ── Drag ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.win-titlebar').forEach(titlebar => {
    const winId = titlebar.dataset.win;
    const win   = document.getElementById(winId);
    if (!win) return;
    let ox = 0, oy = 0, sx = 0, sy = 0;

    titlebar.addEventListener('mousedown', e => {
      if (e.target.classList.contains('chrome-btn')) return;
      if (win.classList.contains('maximized')) return;
      bringToFront(win);
      sx = e.clientX - win.getBoundingClientRect().left;
      sy = e.clientY - win.getBoundingClientRect().top;

      const onMove = mv => {
        let nx = mv.clientX - sx;
        let ny = mv.clientY - sy;
        nx = Math.max(0, Math.min(nx, window.innerWidth - win.offsetWidth));
        ny = Math.max(0, Math.min(ny, window.innerHeight - 36 - win.offsetHeight));
        win.style.left = nx + 'px';
        win.style.top  = ny + 'px';
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  });

  // Click desktop to deselect icons
  document.getElementById('desktop')?.addEventListener('click', e => {
    if (!e.target.closest('.d-icon')) {
      document.querySelectorAll('.d-icon').forEach(i => i.classList.remove('selected'));
    }
    if (!e.target.closest('#start-btn') && !e.target.closest('#start-menu')) {
      closeStartMenu();
    }
  });

  // Single click selects icon
  document.querySelectorAll('.d-icon').forEach(icon => {
    icon.addEventListener('click', e => {
      document.querySelectorAll('.d-icon').forEach(i => i.classList.remove('selected'));
      icon.classList.add('selected');
      e.stopPropagation();
    });
    // Keyboard support: Enter opens
    icon.addEventListener('keydown', e => {
      if (e.key === 'Enter') icon.dispatchEvent(new MouseEvent('dblclick'));
    });
  });

  // Clock
  updateClock();
  setInterval(updateClock, 1000);

  // ZZZ float decorations on desktop
  spawnZZZ();
});

/* ── Clock ──────────────────────────────────────────────────── */
function updateClock() {
  const now = new Date();
  let h = now.getHours(), m = now.getMinutes();
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  m = m < 10 ? '0' + m : m;
  const el = document.getElementById('clock');
  if (el) el.textContent = h + ':' + m + ' ' + ap;
}

/* ── Start Menu ─────────────────────────────────────────────── */
function toggleStartMenu() {
  const sm = document.getElementById('start-menu');
  sm.classList.toggle('open');
}
function closeStartMenu() {
  document.getElementById('start-menu')?.classList.remove('open');
}

/* ── Lightbox ───────────────────────────────────────────────── */
function openLightbox(images, idx) {
  lbImages = images;
  lbIndex  = idx;
  renderLB();
  document.getElementById('lightbox').classList.add('open');
}
function closeLightbox() { document.getElementById('lightbox').classList.remove('open'); }
function lbNav(dir) {
  lbIndex = (lbIndex + dir + lbImages.length) % lbImages.length;
  renderLB();
}
function renderLB() {
  const img = lbImages[lbIndex];
  document.getElementById('lb-img').src   = img.src;
  document.getElementById('lb-title').textContent = img.title || '';
}
// Keyboard lightbox nav
document.addEventListener('keydown', e => {
  const lb = document.getElementById('lightbox');
  if (!lb.classList.contains('open')) return;
  if (e.key === 'ArrowLeft')  lbNav(-1);
  if (e.key === 'ArrowRight') lbNav(1);
  if (e.key === 'Escape')     closeLightbox();
});

/* ── ZZZ Animation ──────────────────────────────────────────── */
function spawnZZZ() {
  const desktop = document.getElementById('desktop-bg');
  if (!desktop) return;
  const texts = ['Z', 'z', 'Zz', 'zzz'];
  let i = 0;
  setInterval(() => {
    const span = document.createElement('span');
    span.className = 'zzz-float';
    span.textContent = texts[i % texts.length];
    span.style.left = (60 + Math.random() * 120) + 'px';
    span.style.bottom = (36 + Math.random() * 40) + 'px';
    span.style.animationDelay = (Math.random() * 0.5) + 's';
    desktop.appendChild(span);
    setTimeout(() => span.remove(), 3200);
    i++;
  }, 1800);
}

/* ── Filter for Latest Work ─────────────────────────────────── */
function filterLatest(cat, btn) {
  document.querySelectorAll('#win-latest .tool-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('#latest-grid .gallery-card, #latest-grid .dev-card, #latest-grid .video-card').forEach(card => {
    const show = cat === 'all' || card.dataset.category === cat;
    card.style.display = show ? '' : 'none';
  });
}
