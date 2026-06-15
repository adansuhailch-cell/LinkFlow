/* ============================================================
   LinkFlow - Main JavaScript
   Handles: 3D particle system, card rendering, search,
   category filtering, custom links, and navigation.
   ============================================================ */

// ============================================================
// SECTION 1: Simplex Noise Implementation
// ============================================================

class SimplexNoise {
  constructor() {
    this.grad3 = [
      [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
      [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
      [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
    ];
    this.p = [];
    for (let i = 0; i < 256; i++) {
      this.p[i] = Math.floor(Math.random() * 256);
    }
    this.perm = [];
    for (let i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
    }
  }

  dot3(g, x, y, z) {
    return g[0] * x + g[1] * y + g[2] * z;
  }

  noise3D(xin, yin, zin) {
    const F3 = 1.0 / 3.0;
    const G3 = 1.0 / 6.0;
    const s = (xin + yin + zin) * F3;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const k = Math.floor(zin + s);
    const t = (i + j + k) * G3;
    const X0 = i - t;
    const Y0 = j - t;
    const Z0 = k - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;
    const z0 = zin - Z0;
    let i1, j1, k1, i2, j2, k2;
    if (x0 >= y0) {
      if (y0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=1; k2=0; }
      else if (x0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=0; k2=1; }
      else { i1=0; j1=0; k1=1; i2=1; j2=0; k2=1; }
    } else {
      if (y0 < z0) { i1=0; j1=0; k1=1; i2=0; j2=1; k2=1; }
      else if (x0 < z0) { i1=0; j1=1; k1=0; i2=0; j2=1; k2=1; }
      else { i1=0; j1=1; k1=0; i2=1; j2=1; k2=0; }
    }
    const x1 = x0 - i1 + G3;
    const y1 = y0 - j1 + G3;
    const z1 = z0 - k1 + G3;
    const x2 = x0 - i2 + 2.0 * G3;
    const y2 = y0 - j2 + 2.0 * G3;
    const z2 = z0 - k2 + 2.0 * G3;
    const x3 = x0 - 1.0 + 3.0 * G3;
    const y3 = y0 - 1.0 + 3.0 * G3;
    const z3 = z0 - 1.0 + 3.0 * G3;
    const ii = i & 255;
    const jj = j & 255;
    const kk = k & 255;
    const gi0 = this.perm[ii + this.perm[jj + this.perm[kk]]] % 12;
    const gi1 = this.perm[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]] % 12;
    const gi2 = this.perm[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]] % 12;
    const gi3 = this.perm[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]] % 12;
    let n0, n1, n2, n3;
    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (t0 < 0) n0 = 0.0;
    else { t0 *= t0; n0 = t0 * t0 * this.dot3(this.grad3[gi0], x0, y0, z0); }
    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (t1 < 0) n1 = 0.0;
    else { t1 *= t1; n1 = t1 * t1 * this.dot3(this.grad3[gi1], x1, y1, z1); }
    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (t2 < 0) n2 = 0.0;
    else { t2 *= t2; n2 = t2 * t2 * this.dot3(this.grad3[gi2], x2, y2, z2); }
    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (t3 < 0) n3 = 0.0;
    else { t3 *= t3; n3 = t3 * t3 * this.dot3(this.grad3[gi3], x3, y3, z3); }
    return 32.0 * (n0 + n1 + n2 + n3);
  }
}

// ============================================================
// SECTION 2: 3D Particle System (Hero)
// ============================================================

let scene, camera, renderer, particles, particleMaterial;
let particleCount = 10000;
let noise = new SimplexNoise();
let velX, velY, velZ;
let mouse = { x: 0, y: 0, clientX: 0, clientY: 0 };
let mouseWorld = new THREE.Vector3(0, 0, 0);
let animationId;
let isHeroVisible = true;

function initParticleSystem() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    particleCount = 3000;
  }

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0B0F1A);
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 40);
  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const baseR = 0.29, baseG = 0.56, baseB = 0.85;

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 60;
    positions[i3 + 1] = (Math.random() - 0.5) * 60;
    positions[i3 + 2] = (Math.random() - 0.5) * 10;
    colors[i3] = baseR;
    colors[i3 + 1] = baseG;
    colors[i3 + 2] = baseB;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  velX = new Float32Array(particleCount).fill(0);
  velY = new Float32Array(particleCount).fill(0);
  velZ = new Float32Array(particleCount).fill(0);

  particleMaterial = new THREE.PointsMaterial({
    size: 0.08,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexColors: true
  });

  particles = new THREE.Points(geometry, particleMaterial);
  scene.add(particles);

  document.addEventListener('mousemove', onMouseMove);
  window.addEventListener('resize', onWindowResize);
  setupVisibilityObserver();
  animate();
}

function onMouseMove(event) {
  mouse.clientX = event.clientX;
  mouse.clientY = event.clientY;
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function updateMouseWorld() {
  const raycaster = new THREE.Raycaster();
  const mouseVector = new THREE.Vector2(mouse.x, mouse.y);
  raycaster.setFromCamera(mouseVector, camera);
  const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const intersectPoint = new THREE.Vector3();
  raycaster.ray.intersectPlane(planeZ, intersectPoint);
  if (intersectPoint) {
    mouseWorld.copy(intersectPoint);
  }
}

function animate() {
  animationId = requestAnimationFrame(animate);
  if (!isHeroVisible) return;

  const time = performance.now() * 0.001;
  updateMouseWorld();

  camera.position.x += (mouse.x * 2 - camera.position.x) * 0.02;
  camera.position.y += (mouse.y * 1 - camera.position.y) * 0.02;
  camera.position.z = 40;
  camera.lookAt(0, 0, 0);

  updateParticles(time);
  updateParticleColors();
  renderer.render(scene, camera);
}

function updateParticles(time) {
  const positions = particles.geometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    const px = positions[i3];
    const py = positions[i3 + 1];
    const pz = positions[i3 + 2];

    const nx = noise.noise3D(px * 0.05, py * 0.05, time * 0.1);
    const ny = noise.noise3D(px * 0.05 + 100, py * 0.05 + 100, time * 0.1);
    const nz = noise.noise3D(px * 0.05 + 200, py * 0.05 + 200, time * 0.1);

    const ax = nx * 0.02;
    const ay = ny * 0.02;
    const az = nz * 0.01;

    velX[i] = (velX[i] + ax) * 0.98;
    velY[i] = (velY[i] + ay) * 0.98;
    velZ[i] = (velZ[i] + az) * 0.98;

    positions[i3] += velX[i];
    positions[i3 + 1] += velY[i];
    positions[i3 + 2] += velZ[i];

    if (Math.abs(positions[i3]) > 30) positions[i3] = (Math.random() - 0.5) * 60;
    if (Math.abs(positions[i3 + 1]) > 30) positions[i3 + 1] = (Math.random() - 0.5) * 60;
    if (Math.abs(positions[i3 + 2]) > 5) positions[i3 + 2] = (Math.random() - 0.5) * 10;
  }
  particles.geometry.attributes.position.needsUpdate = true;
}

function updateParticleColors() {
  const positions = particles.geometry.attributes.position.array;
  const colors = particles.geometry.attributes.color.array;
  const brightR = 0.49, brightG = 0.72, brightB = 0.96;
  const baseR = 0.29, baseG = 0.56, baseB = 0.85;
  const influenceRadius = 12;
  const maxDist = 6;

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    const dx = positions[i3] - mouseWorld.x;
    const dy = positions[i3 + 1] - mouseWorld.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < influenceRadius) {
      let t = 1 - (dist / influenceRadius);
      t = t * t;
      velX[i] -= (dx / (dist + 0.1)) * t * 0.015;
      velY[i] -= (dy / (dist + 0.1)) * t * 0.015;
    }

    if (dist < maxDist) {
      let t = 1 - (dist / maxDist);
      t = t * t;
      colors[i3] = baseR + (brightR - baseR) * t;
      colors[i3 + 1] = baseG + (brightG - baseG) * t;
      colors[i3 + 2] = baseB + (brightB - baseB) * t;
    } else {
      colors[i3] = baseR;
      colors[i3 + 1] = baseG;
      colors[i3 + 2] = baseB;
    }
  }
  particles.geometry.attributes.color.needsUpdate = true;
}

function onWindowResize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function setupVisibilityObserver() {
  const hero = document.getElementById('hero');
  if (!hero) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        isHeroVisible = entry.isIntersecting;
      });
    },
    { threshold: 0.05 }
  );
  observer.observe(hero);
}

// ============================================================
// SECTION 3: Card Rendering
// ============================================================

function renderCards(cards) {
  const grid = document.getElementById('cards-grid');
  const noResults = document.getElementById('no-results');
  if (!grid) return;

  grid.innerHTML = '';

  if (cards.length === 0) {
    if (noResults) noResults.style.display = 'block';
    return;
  } else {
    if (noResults) noResults.style.display = 'none';
  }

  cards.forEach((resource, index) => {
    const card = createCardElement(resource, index);
    grid.appendChild(card);
  });

  requestAnimationFrame(() => {
    const cardElements = grid.querySelectorAll('.resource-card');
    cardElements.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('visible');
      }, index * 80);
    });
  });
}

function createCardElement(resource) {
  const card = document.createElement('div');
  card.className = 'resource-card';
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `View ${resource.title}`);

  const platformClass = resource.platform.toLowerCase();
  const catColor = categoryColors[resource.category] || '#4A90D9';
  const catBg = hexToRgba(catColor, 0.1);

  card.innerHTML = `
    <div class="platform-badge ${platformClass}">${resource.platform.charAt(0)}</div>
    <span class="category-tag" style="background: ${catBg}; color: ${catColor};">${resource.category}</span>
    <h3 class="card-title">${escapeHtml(resource.title)}</h3>
    <p class="card-description">${escapeHtml(resource.description)}</p>
    <div class="card-action">
      <a href="${resource.link}" target="_blank" rel="noopener noreferrer" class="card-action-link">
        View Resource →
      </a>
    </div>
  `;

  return card;
}

// ============================================================
// SECTION 4: Category Chips
// ============================================================

let activeCategory = 'All';

function renderCategoryChips() {
  const container = document.getElementById('category-chips');
  if (!container) return;

  container.innerHTML = '';
  categories.forEach(cat => {
    const chip = document.createElement('button');
    chip.className = 'chip' + (cat.name === activeCategory ? ' active' : '');
    chip.textContent = cat.name;
    chip.setAttribute('aria-pressed', cat.name === activeCategory ? 'true' : 'false');
    chip.setAttribute('type', 'button');

    chip.addEventListener('click', () => {
      activeCategory = cat.name;
      container.querySelectorAll('.chip').forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('active');
      chip.setAttribute('aria-pressed', 'true');
      filterAndRenderCards();
    });

    container.appendChild(chip);
  });
}

// ============================================================
// SECTION 5: Search Functionality
// ============================================================

let searchQuery = '';

function setupSearch() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    filterAndRenderCards();
  });
}

function filterAndRenderCards() {
  let filtered = resources;

  if (activeCategory !== 'All') {
    filtered = filtered.filter(r => r.category === activeCategory);
  }

  if (searchQuery) {
    filtered = filtered.filter(r =>
      r.title.toLowerCase().includes(searchQuery) ||
      r.platform.toLowerCase().includes(searchQuery) ||
      r.category.toLowerCase().includes(searchQuery) ||
      r.description.toLowerCase().includes(searchQuery)
    );
  }

  renderCards(filtered);
}

// ============================================================
// SECTION 6: Custom Links Management
// ============================================================

let customLinks = [];

function setupCustomLinks() {
  customLinks = loadCustomLinks();
  renderCustomLinks();
  setupAddLinkForm();
}

function setupAddLinkForm() {
  const form = document.getElementById('add-link-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('custom-title').value.trim();
    const url = document.getElementById('custom-url').value.trim();
    const description = document.getElementById('custom-description').value.trim();
    const category = document.getElementById('custom-category').value;

    if (!title || !url) return;

    const newLink = {
      id: generateId(),
      title,
      url,
      description,
      category,
      createdAt: new Date().toISOString()
    };

    customLinks.unshift(newLink);
    saveCustomLinks(customLinks);
    renderCustomLinks();
    form.reset();

    // Show share section if there are custom links
    const shareSection = document.getElementById('share-section');
    if (shareSection && customLinks.length > 0) {
      shareSection.style.display = 'flex';
    }
  });
}

function renderCustomLinks() {
  const grid = document.getElementById('custom-links-grid');
  if (!grid) return;

  grid.innerHTML = '';

  if (customLinks.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999; padding: 40px;">No custom links yet. Add your first link above!</p>';
    return;
  }

  customLinks.forEach(link => {
    const card = document.createElement('div');
    card.className = 'custom-link-card';

    const catColor = categoryColors[link.category] || '#95A5A6';
    const catBg = hexToRgba(catColor, 0.1);

    card.innerHTML = `
      <div class="custom-link-card-header">
        <span class="custom-link-category" style="background: ${catBg}; color: ${catColor};">${link.category}</span>
        <button class="custom-link-delete" onclick="deleteCustomLink('${link.id}')">×</button>
      </div>
      <h3 class="custom-link-title">${escapeHtml(link.title)}</h3>
      ${link.description ? `<p class="custom-link-description">${escapeHtml(link.description)}</p>` : ''}
      <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="custom-link-url" title="${link.url}">${link.url}</a>
      <div class="custom-link-action">
        <button class="btn-open-link" onclick="window.open('${link.url}', '_blank')">Open Link →</button>
      </div>
    `;

    grid.appendChild(card);
  });
}

function deleteCustomLink(id) {
  if (confirm('Delete this link?')) {
    customLinks = customLinks.filter(link => link.id !== id);
    saveCustomLinks(customLinks);
    renderCustomLinks();

    const shareSection = document.getElementById('share-section');
    if (shareSection && customLinks.length === 0) {
      shareSection.style.display = 'none';
    }
  }
}

// ============================================================
// SECTION 7: Export & Share
// ============================================================

function setupExportShare() {
  const exportBtn = document.getElementById('export-links-btn');
  const shareBtn = document.getElementById('share-links-btn');

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      exportAsJSON(customLinks, 'my_linkflow_links.json');
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const shareUrl = generateShareUrl(customLinks);
      copyToClipboard(shareUrl).then(() => {
        alert('Share link copied to clipboard!');
      });
    });
  }
}

// ============================================================
// SECTION 8: Navigation Toggle
// ============================================================

function setupNavToggle() {
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  if (!navToggle || !navLinks) return;

  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('nav-links-active');
    navToggle.classList.toggle('nav-toggle-active');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('nav-links-active');
      navToggle.classList.remove('nav-toggle-active');
    });
  });
}

// ============================================================
// SECTION 9: Scroll Animations
// ============================================================

function setupScrollAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.section-header').forEach(el => {
    observer.observe(el);
  });

  document.querySelectorAll('.feature-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    observer.observe(el);
  });
}

// ============================================================
// SECTION 10: Initialize
// ============================================================

function init() {
  // 3D Particle System
  const heroCanvas = document.getElementById('hero-canvas');
  if (heroCanvas && typeof THREE !== 'undefined') {
    initParticleSystem();
  }

  // Navigation
  setupNavToggle();

  // Scroll Animations
  setupScrollAnimations();

  // Browse Resources
  const cardsGrid = document.getElementById('cards-grid');
  if (cardsGrid && typeof resources !== 'undefined') {
    const categoryChips = document.getElementById('category-chips');
    if (categoryChips) {
      renderCategoryChips();
    }
    renderCards(resources);
    setupSearch();
  }

  // Custom Links
  const customLinksGrid = document.getElementById('custom-links-grid');
  if (customLinksGrid) {
    setupCustomLinks();
    setupExportShare();
  }

  // Update stats
  const statResources = document.getElementById('stat-resources');
  if (statResources) {
    statResources.textContent = resources.length + '+ Resources';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}