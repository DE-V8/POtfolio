/* ═══════════════════════════════════════════════════════════════
   loader.js — Reads content.json and renders all cards + about info
   To add new work: edit content.json, add your image to assets/images/
═══════════════════════════════════════════════════════════════ */

const PLACEHOLDER = 'data:image/svg+xml,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="280" height="210" viewBox="0 0 280 210">
  <rect width="280" height="210" fill="#dde"/>
  <text x="140" y="100" text-anchor="middle" font-family="Arial" font-size="32" fill="#aab">🖼</text>
  <text x="140" y="135" text-anchor="middle" font-family="Arial" font-size="12" fill="#99a">Add your image</text>
</svg>`);

async function loadPortfolio() {
  let data;
  try {
    const res = await fetch('content.json?t=' + Date.now());
    data = await res.json();
  } catch (e) {
    console.error('Could not load content.json:', e);
    return;
  }

  populateAbout(data.owner);
  populateLatest(data.latestWork || [], data.works || {});
  populateDiscipline('photoshop',    (data.works || {}).photoshop    || []);
  populateDiscipline('video',        (data.works || {}).video        || []);
  populateDiscipline('3d',           (data.works || {})['3d']        || []);
  populateDiscipline('uiux',         (data.works || {}).uiux         || []);
  populateDiscipline('dev',          (data.works || {}).dev          || [], 'dev');
  populateDiscipline('illustrations',(data.works || {}).illustrations || []);
  populateTray(data.owner?.socials);
  populateStartMenuSocials(data.owner?.socials);
  runBootScreen(data.owner?.name || 'Portfolio OS');
}

/* ── Boot Screen ────────────────────────────────────────────── */
function runBootScreen(name) {
  // Update name
  const nameEl = document.getElementById('boot-name');
  if (nameEl) nameEl.textContent = name;
  const smName = document.getElementById('sm-username');
  if (smName) smName.textContent = name;

  if (sessionStorage.getItem('booted')) {
    // Skip boot on refresh within same session
    hideBoot();
    return;
  }

  const fill   = document.getElementById('boot-fill');
  const status = document.getElementById('boot-status');
  const steps  = [
    [10,  'Loading creative assets...'],
    [30,  'Starting Snorlax OS...'],
    [55,  'Initialising portfolio modules...'],
    [75,  'Rendering your imagination...'],
    [90,  'Almost there... Zzz...'],
    [100, 'Welcome!'],
  ];
  let i = 0;
  const tick = setInterval(() => {
    if (i >= steps.length) {
      clearInterval(tick);
      setTimeout(hideBoot, 600);
      return;
    }
    fill.style.width   = steps[i][0] + '%';
    status.textContent = steps[i][1];
    i++;
  }, 380);

  sessionStorage.setItem('booted', '1');
}

function hideBoot() {
  const bs = document.getElementById('boot-screen');
  bs.classList.add('fade-out');
  setTimeout(() => { bs.style.display = 'none'; }, 850);
}

/* ── About Window ────────────────────────────────────────────── */
function populateAbout(owner) {
  if (!owner) return;
  setTextIfExists('about-name',    owner.name);
  setTextIfExists('about-tagline', owner.tagline);
  setTextIfExists('about-bio',     owner.bio);

  const socials = document.getElementById('about-socials');
  if (socials && owner.socials) {
    socials.innerHTML = buildSocialLinks(owner.socials, '24px');
  }
}

function buildSocialLinks(socials, size) {
  const icons = {
    instagram: { emoji: '📸', label: 'Instagram' },
    twitter:   { emoji: '🐦', label: 'Twitter / X' },
    github:    { emoji: '💻', label: 'GitHub' },
    linkedin:  { emoji: '🔗', label: 'LinkedIn' },
  };
  return Object.entries(socials).filter(([,v]) => v)
    .map(([k, url]) => {
      const ic = icons[k] || { emoji: '🔗', label: k };
      return `<a href="${url}" target="_blank" rel="noopener" class="social-link" title="${ic.label}" style="font-size:${size}">${ic.emoji}</a>`;
    }).join('');
}

/* ── System Tray + Start Menu Socials ────────────────────────── */
function populateTray(socials) {
  const tray = document.getElementById('tray-socials');
  if (!tray || !socials) return;
  const icons = { instagram:'📸', twitter:'🐦', github:'💻', linkedin:'🔗' };
  tray.innerHTML = Object.entries(socials).filter(([,v])=>v)
    .map(([k,url]) => `<a href="${url}" target="_blank" rel="noopener" class="tray-social" title="${k}">${icons[k]||'🔗'}</a>`)
    .join('');
}
function populateStartMenuSocials(socials) {
  const el = document.getElementById('sm-socials');
  if (!el || !socials) return;
  const icons = { instagram:'📸', twitter:'🐦', github:'💻', linkedin:'🔗' };
  el.innerHTML = Object.entries(socials).filter(([,v])=>v)
    .map(([k,url]) => `<a href="${url}" target="_blank" rel="noopener" style="font-size:20px;margin-right:6px;text-decoration:none">${icons[k]||'🔗'}</a>`)
    .join('');
}

/* ── Discipline Grid (Photoshop / Video / 3D / UI / Dev / Illus) ─── */
function populateDiscipline(key, items, type) {
  const grid = document.getElementById('grid-' + key);
  if (!grid) return;

  if (!items || items.length === 0) {
    grid.innerHTML = emptyState('No works added yet', 'Edit content.json to add your ' + key + ' projects!');
    return;
  }

  // Collect images for lightbox
  const lbImgs = items.map(item => ({ src: item.image || PLACEHOLDER, title: item.title }));

  if (type === 'dev') {
    grid.innerHTML = items.map((item, idx) => devCard(item, idx, lbImgs)).join('');
  } else if (key === 'video') {
    const wrap = document.createElement('div');
    wrap.className = 'gallery-grid';
    wrap.innerHTML = items.map((item, idx) => videoCard(item, idx, lbImgs)).join('');
    grid.appendChild(wrap);
    return;
  } else {
    const wrap = document.createElement('div');
    wrap.className = 'gallery-grid';
    wrap.innerHTML = items.map((item, idx) => galleryCard(item, idx, lbImgs)).join('');
    grid.appendChild(wrap);
    return;
  }
}

/* ── Latest Work Grid ────────────────────────────────────────── */
function populateLatest(latestItems, allWorks) {
  const grid = document.getElementById('latest-grid');
  if (!grid) return;

  // Merge latest + all works with category tag, sort by date desc
  let combined = [...latestItems];
  // Also pull from each discipline
  Object.entries(allWorks).forEach(([cat, items]) => {
    (items || []).forEach(item => {
      if (!combined.find(l => l.id === item.id)) {
        combined.push({ ...item, category: cat });
      }
    });
  });
  combined.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  if (combined.length === 0) {
    grid.innerHTML = emptyState('No works yet', 'Add your first project in content.json!');
    return;
  }

  const lbImgs = combined.map(i => ({ src: i.image || PLACEHOLDER, title: i.title }));
  const wrap = document.createElement('div');
  wrap.className = 'gallery-grid';
  wrap.style.padding = '8px';
  wrap.innerHTML = combined.map((item, idx) => galleryCard(item, idx, lbImgs, true)).join('');
  grid.appendChild(wrap);
}

/* ── Card Builders ───────────────────────────────────────────── */
function galleryCard(item, idx, lbImgs, showCat) {
  const catBadge = showCat && item.category
    ? `<span class="tag">${item.category}</span>`
    : (item.tags || []).map(t => `<span class="tag">${t}</span>`).join('');

  return `<div class="gallery-card" data-category="${item.category||''}"
    onclick="openLightbox(${JSON.stringify(lbImgs).replace(/"/g,'&quot;')}, ${idx})">
    <img src="${item.image || PLACEHOLDER}" alt="${item.title||''}"
         onerror="this.src='${PLACEHOLDER.replace(/'/g,"\\'")}'" loading="lazy"/>
    <div class="card-info">
      <div class="card-title">${item.title || 'Untitled'}</div>
      <div class="card-date">${formatDate(item.date)}</div>
      <div class="card-tags">${catBadge}</div>
    </div>
  </div>`;
}

function devCard(item, idx, lbImgs) {
  const link = item.link ? `<a href="${item.link}" target="_blank" rel="noopener" class="dev-card-link" onclick="event.stopPropagation()">🔗 View Project</a>` : '';
  return `<div class="dev-card" data-category="dev">
    <div class="dev-card-icon">💾</div>
    <div class="dev-card-body">
      <div class="dev-card-title">${item.title || 'Untitled'}</div>
      <div class="dev-card-desc">${item.description || ''}</div>
      <div class="card-tags">${(item.tags||[]).map(t=>`<span class="tag">${t}</span>`).join('')}</div>
      ${link}
    </div>
  </div>`;
}

function videoCard(item, idx, lbImgs) {
  const clickAction = item.link
    ? `onclick="window.open('${item.link}','_blank')"`
    : `onclick="openLightbox(${JSON.stringify(lbImgs).replace(/"/g,'&quot;')}, ${idx})"`;
  return `<div class="video-card gallery-card" data-category="video" ${clickAction}>
    <img src="${item.image || PLACEHOLDER}" alt="${item.title||''}"
         onerror="this.src='${PLACEHOLDER.replace(/'/g,"\\'")}'" loading="lazy"/>
    <div class="video-title">${item.title || 'Untitled'}</div>
  </div>`;
}

/* ── Helpers ─────────────────────────────────────────────────── */
function emptyState(title, sub) {
  return `<div class="empty-state">
    <div class="empty-icon">📂</div>
    <strong>${title}</strong>
    <p>${sub}</p>
  </div>`;
}

function setTextIfExists(id, val) {
  const el = document.getElementById(id);
  if (el && val) el.textContent = val;
}

function formatDate(d) {
  if (!d) return '';
  const [y, m] = d.split('-');
  const months = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return (months[parseInt(m)] || '') + ' ' + y;
}

/* ── Contact Form ────────────────────────────────────────────── */
window.sendContact = function() {
  const name  = document.getElementById('c-name')?.value.trim();
  const email = document.getElementById('c-email')?.value.trim();
  const msg   = document.getElementById('c-msg')?.value.trim();
  if (!name || !email || !msg) {
    showDialog('⚠️ Oops!', 'Please fill in all fields before sending.');
    return;
  }
  // Build mailto link (simple, no server needed)
  const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${msg}`;
  window.open(`mailto:?subject=Portfolio Contact from ${name}&body=${encodeURIComponent(body)}`);
  showDialog('✅ Message Ready!', 'Your email client should open. If not, copy the message manually.');
};

function showDialog(title, text) {
  // Simple XP-style alert replacement
  const existing = document.getElementById('xp-alert');
  if (existing) existing.remove();

  const dlg = document.createElement('div');
  dlg.id = 'xp-alert';
  dlg.className = 'xp-window';
  dlg.style.cssText = 'left:50%;top:40%;transform:translate(-50%,-50%);width:320px;z-index:9000;display:flex;';
  dlg.innerHTML = `
    <div class="win-titlebar">
      <div class="win-titlebar-left"><span class="win-icon">💬</span><span class="win-title">${title}</span></div>
      <div class="win-chrome"><button class="chrome-btn close-btn" onclick="document.getElementById('xp-alert').remove()">✕</button></div>
    </div>
    <div class="win-content contact-content" style="padding:16px">
      <p style="font-size:12px;margin-bottom:12px">${text}</p>
      <div class="dialog-buttons"><button class="xp-btn xp-btn-primary" onclick="document.getElementById('xp-alert').remove()">OK</button></div>
    </div>`;
  document.getElementById('desktop').appendChild(dlg);
}

/* ── Init ────────────────────────────────────────────────────── */
loadPortfolio();
