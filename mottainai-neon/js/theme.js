// ===== Theme Manager (FIXED) =====
const THEMES = {
  cyan:    { accent: '#00f0ff', accent2: '#b537f2', name: 'Cyan Neon' },
  magenta: { accent: '#ff00d4', accent2: '#ff6ec7', name: 'Magenta' },
  lime:    { accent: '#b6ff00', accent2: '#00ff9d', name: 'Lime' },
  sunset:  { accent: '#ff7e00', accent2: '#ff2e63', name: 'Sunset' },
  aurora:  { accent: '#00ffaa', accent2: '#00aaff', name: 'Aurora' }
};

function setTheme(name) {
  if (!THEMES[name]) name = 'cyan';
  const t = THEMES[name];
  
  // Set CSS variables on root
  document.documentElement.style.setProperty('--accent', t.accent);
  document.documentElement.style.setProperty('--accent2', t.accent2);
  document.body.setAttribute('data-theme', name);
  
  // Save
  localStorage.setItem('mn_theme', name);
  
  // Update active swatch
  document.querySelectorAll('.theme-swatch').forEach(s => {
    s.classList.toggle('active', s.getAttribute('data-theme') === name);
  });
}

function loadTheme() {
  setTheme(localStorage.getItem('mn_theme') || 'cyan');
}

// ===== Light/Dark Mode (FIXED) =====
function setMode(mode) {
  if (mode === 'light') {
    document.body.classList.add('light-mode');
  } else {
    document.body.classList.remove('light-mode');
  }
  localStorage.setItem('mn_mode', mode);
  
  // Update buttons
  document.querySelectorAll('.mode-btn').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-mode') === mode);
  });
}

function loadMode() {
  setMode(localStorage.getItem('mn_mode') || 'dark');
}
