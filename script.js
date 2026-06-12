/* ============================================================
   LinkFlow - Main JavaScript
   Handles: 3D particle system, card rendering, search,
   category filtering, 3D flip transitions, and navigation.
   ============================================================ */

// ============================================================
// SECTION 1: Simplex Noise Implementation (Inline)
// A lightweight 3D simplex noise for the particle flow field.
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
// SECTION 2: Three.js 3D Flow-Field Particle System (Hero)
// ============================================================

let scene, camera, renderer, particles, particleMaterial;
let particleCount = 10000;
let noise = new SimplexNoise();
let velX, velY, velZ;
let mouse = { x: 0, y: 0, clientX: 0, clientY: 0 };
let mouseWorld = new THREE.Vector3(0, 0, 0);
let animationId;
let isHeroVisible = true;

/**
 * Initialize the Three.js 3D particle system for the hero background.
 * Creates 10,000 particles that flow along curved noise-field paths.
 */
function initParticleSystem() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return; // Not on homepage

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    particleCount = 3000;
  }

  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0B0F1A);

  // Camera
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 40);

  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Particle geometry
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  // Base color for particles (#4A90D9)
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

  // Velocity arrays for particle movement
  velX = new Float32Array(particleCount).fill(0);
  velY = new Float32Array(particleCount).fill(0);
  velZ = new Float32Array(particleCount).fill(0);

  // Material with vertex colors
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

  // Mouse move handler
  document.addEventListener('mousemove', onMouseMove);

  // Resize handler
  window.addEventListener('resize', onWindowResize);

  // Visibility check (pause when hero is not visible)
  setupVisibilityObserver();

  // Start animation loop
  animate();
}

/**
 * Handle mouse movement for particle interaction.
 * Updates mouse coordinates for raycasting.
 */
function onMouseMove(event) {
  mouse.clientX = event.clientX;
  mouse.clientY = event.clientY;
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

/**
 * Update mouseWorld position by raycasting mouse onto the z=0 plane.
 */
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

/**
 * Main animation loop - updates particle positions based on flow field.
 */
function animate() {
  animationId = requestAnimationFrame(animate);

  if (!isHeroVisible) return;

  const time = performance.now() * 0.001;

  // Update mouse world position
  updateMouseWorld();

  // Camera gentle float
  camera.position.x += (mouse.x * 2 - camera.position.x) * 0.02;
  camera.position.y += (mouse.y * 1 - camera.position.y) * 0.02;
  camera.position.z = 40;
  camera.lookAt(0, 0, 0);

  // Update particles
  updateParticles(time);

  // Update particle colors based on mouse proximity
  updateParticleColors();

  // Render
  renderer.render(scene, camera);
}

/**
 * Update particle positions based on 3D simplex noise flow field.
 */
function updateParticles(time) {
  const positions = particles.geometry.attributes.position.array;

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    const px = positions[i3];
    const py = positions[i3 + 1];
    const pz = positions[i3 + 2];

    // Sample noise at particle position
    const nx = noise.noise3D(px * 0.05, py * 0.05, time * 0.1);
    const ny = noise.noise3D(px * 0.05 + 100, py * 0.05 + 100, time * 0.1);
    const nz = noise.noise3D(px * 0.05 + 200, py * 0.05 + 200, time * 0.1);

    // Convert noise to acceleration
    const ax = nx * 0.02;
    const ay = ny * 0.02;
    const az = nz * 0.01;

    // Integrate velocity with damping
    velX[i] = (velX[i] + ax) * 0.98;
    velY[i] = (velY[i] + ay) * 0.98;
    velZ[i] = (velZ[i] + az) * 0.98;

    // Update position
    positions[i3] += velX[i];
    positions[i3 + 1] += velY[i];
    positions[i3 + 2] += velZ[i];

    // Wrap particles back into bounds
    if (Math.abs(positions[i3]) > 30) {
      positions[i3] = (Math.random() - 0.5) * 60;
    }
    if (Math.abs(positions[i3 + 1]) > 30) {
      positions[i3 + 1] = (Math.random() - 0.5) * 60;
    }
    if (Math.abs(positions[i3 + 2]) > 5) {
      positions[i3 + 2] = (Math.random() - 0.5) * 10;
    }
  }

  particles.geometry.attributes.position.needsUpdate = true;
}

/**
 * Update particle colors based on distance to mouse cursor.
 * Particles near the mouse brighten and glow.
 */
function updateParticleColors() {
  const positions = particles.geometry.attributes.position.array;
  const colors = particles.geometry.attributes.color.array;

  // Bright color (#7EB8F4) and base color (#4A90D9)
  const brightR = 0.49, brightG = 0.72, brightB = 0.96;
  const baseR = 0.29, baseG = 0.56, baseB = 0.85;

  const influenceRadius = 12;
  const maxDist = 6;

  // Mouse attraction
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    const dx = positions[i3] - mouseWorld.x;
    const dy = positions[i3 + 1] - mouseWorld.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < influenceRadius) {
      let t = 1 - (dist / influenceRadius);
      t = t * t;
      // Attract toward mouse
      velX[i] -= (dx / (dist + 0.1)) * t * 0.015;
      velY[i] -= (dy / (dist + 0.1)) * t * 0.015;
    }

    // Brighten particles near mouse
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

/**
 * Handle window resize for the Three.js renderer.
 */
function onWindowResize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Use IntersectionObserver to pause animation when hero is not visible.
 * Improves performance when user scrolls past the hero.
 */
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

/**
 * Render resource cards into the cards grid.
 * @param {Array} cards - Array of resource objects to render
 */
function renderCards(cards) {
  const grid = document.getElementById('cards-grid');
  const noResults = document.getElementById('no-results');

  if (!grid) return;

  // Clear existing cards
  grid.innerHTML = '';

  // Show/hide no results message
  if (cards.length === 0) {
    if (noResults) noResults.style.display = 'block';
    return;
  } else {
    if (noResults) noResults.style.display = 'none';
  }

  // Create and append each card
  cards.forEach((resource, index) => {
    const card = createCardElement(resource, index);
    grid.appendChild(card);
  });

  // Trigger entrance animations with stagger
  requestAnimationFrame(() => {
    const cardElements = grid.querySelectorAll('.resource-card');
    cardElements.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('visible');
      }, index * 80);
    });
  });
}

/**
 * Create a single resource card DOM element.
 * @param {Object} resource - The resource data object
 * @param {number} index - Index for animation staggering
 * @returns {HTMLElement} The card element
 */
function createCardElement(resource, index) {
  const card = document.createElement('div');
  card.className = 'resource-card';
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `View ${resource.title}`);

  // Platform badge class
  const platformClass = resource.platform.toLowerCase();

  // Category color
  const catColor = categoryColors[resource.category] || '#4A90D9';
  const catBg = hexToRgba(catColor, 0.1);

  card.innerHTML = `
    <div class="platform-badge ${platformClass}">${resource.platform.charAt(0)}</div>
    <span class="category-tag" style="background: ${catBg}; color: ${catColor};">${resource.category}</span>
    <h3 class="card-title">${escapeHtml(resource.title)}</h3>
    <p class="card-description">${escapeHtml(resource.description)}</p>
    <div class="card-action">
      <span class="card-action-link">
        View Resource
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </span>
      <svg class="card-external-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
        <polyline points="15 3 21 3 21 9"></polyline>
        <line x1="10" y1="14" x2="21" y2="3"></line>
      </svg>
    </div>
  `;

  // Click handler for 3D flip
  card.addEventListener('click', () => {
    openFlipCard(card, resource);
  });

  // Keyboard handler for accessibility
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openFlipCard(card, resource);
    }
  });

  return card;
}

/**
 * Convert hex color to rgba string.
 * @param {string} hex - Hex color code
 * @param {number} alpha - Alpha value (0-1)
 * @returns {string} rgba color string
 */
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Escape HTML to prevent XSS.
 * @param {string} text - Raw text
 * @returns {string} Escaped HTML
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================================
// SECTION 4: Category Chips
// ============================================================

let activeCategory = 'All';

/**
 * Render category filter chips.
 */
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
      // Update active state
      activeCategory = cat.name;

      // Update chip visual states
      container.querySelectorAll('.chip').forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('active');
      chip.setAttribute('aria-pressed', 'true');

      // Filter and re-render cards
      filterAndRenderCards();
    });

    container.appendChild(chip);
  });
}

// ============================================================
// SECTION 5: Search Functionality
// ============================================================

let searchQuery = '';

/**
 * Setup the search input event listener.
 */
function setupSearch() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    filterAndRenderCards();
  });
}

/**
 * Filter resources based on active category and search query,
 * then render the filtered cards.
 */
function filterAndRenderCards() {
  let filtered = resources;

  // Filter by category
  if (activeCategory !== 'All') {
    filtered = filtered.filter(r => r.category === activeCategory);
  }

  // Filter by search query
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
// SECTION 6: 3D Flip Card Transition
// ============================================================

/**
 * Open a resource card with a 3D flip animation that reveals
 * an expanded detail panel.
 * @param {HTMLElement} card - The clicked card element
 * @param {Object} resource - The resource data
 */
function openFlipCard(card, resource) {
  // Respect reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // Simple modal for reduced motion
    openSimpleModal(resource);
    return;
  }

  // Step 1: Capture card position
  const rect = card.getBoundingClientRect();
  const startTop = rect.top;
  const startLeft = rect.left;
  const startWidth = rect.width;
  const startHeight = rect.height;

  // Step 2: Create the expanding clone
  const clone = card.cloneNode(true);
  clone.className = 'resource-card flip-card-clone';
  clone.style.cssText = `
    position: fixed;
    top: ${startTop}px;
    left: ${startLeft}px;
    width: ${startWidth}px;
    height: ${startHeight}px;
    z-index: 999;
    margin: 0;
    transform-style: preserve-3d;
    transition: none;
    transform: perspective(1000px) rotateY(0deg);
  `;

  // Add card-front wrapper
  const frontFace = document.createElement('div');
  frontFace.className = 'card-front';
  frontFace.innerHTML = clone.innerHTML;
  clone.innerHTML = '';
  clone.appendChild(frontFace);

  // Hide original card
  card.style.opacity = '0';

  // Step 3: Create back face with expanded content
  const backFace = document.createElement('div');
  backFace.className = 'card-back';

  const catColor = categoryColors[resource.category] || '#4A90D9';

  backFace.innerHTML = `
    <button class="flip-card-close" aria-label="Close">&#10005;</button>
    <span class="category-tag" style="background: ${hexToRgba(catColor, 0.1)}; color: ${catColor}; margin-bottom: 16px;">${resource.category}</span>
    <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 600; color: #1A1D29; margin-bottom: 12px;">${escapeHtml(resource.title)}</h3>
    <p style="font-size: 15px; line-height: 1.6; color: rgba(26,29,41,0.7); margin-bottom: 24px; max-width: 400px;">${escapeHtml(resource.description)}</p>
    <a href="${resource.link}" target="_blank" rel="noopener noreferrer" 
       style="display: inline-block; background: #E8A838; color: #1A1D29; padding: 12px 32px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 14px; transition: background 0.25s;">
      Open Resource
    </a>
    <p style="font-size: 12px; color: rgba(26,29,41,0.4); margin-top: 16px;">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; vertical-align: middle; margin-right: 4px;">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
        <polyline points="15 3 21 3 21 9"></polyline>
        <line x1="10" y1="14" x2="21" y2="3"></line>
      </svg>
      Opens in new tab
    </p>
  `;

  clone.appendChild(backFace);
  document.body.appendChild(clone);

  // Force reflow
  void clone.offsetWidth;

  // Step 4: Calculate target position (center of viewport)
  const targetWidth = Math.min(520, window.innerWidth * 0.9);
  const targetHeight = Math.min(400, window.innerHeight * 0.7);
  const targetTop = (window.innerHeight - targetHeight) / 2;
  const targetLeft = (window.innerWidth - targetWidth) / 2;

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'flip-overlay';
  document.body.appendChild(overlay);

  // Force reflow and fade in overlay
  void overlay.offsetWidth;
  overlay.style.opacity = '1';

  // Animate clone to center and flip
  clone.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
  clone.style.top = `${targetTop}px`;
  clone.style.left = `${targetLeft}px`;
  clone.style.width = `${targetWidth}px`;
  clone.style.height = `${targetHeight}px`;
  clone.style.transform = 'perspective(1000px) rotateY(180deg)';
  clone.style.boxShadow = '0 24px 80px rgba(0,0,0,0.2)';

  // Step 5: Close handlers
  const closeBtn = backFace.querySelector('.flip-card-close');

  function closeFlip() {
    // Animate back to original position
    clone.style.top = `${startTop}px`;
    clone.style.left = `${startLeft}px`;
    clone.style.width = `${startWidth}px`;
    clone.style.height = `${startHeight}px`;
    clone.style.transform = 'perspective(1000px) rotateY(0deg)';
    clone.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
    overlay.style.opacity = '0';

    // Wait for transition, then cleanup
    setTimeout(() => {
      clone.remove();
      overlay.remove();
      card.style.opacity = '1';
    }, 600);
  }

  closeBtn.addEventListener('click', closeFlip);
  overlay.addEventListener('click', closeFlip);

  // Escape key to close
  function handleEscape(e) {
    if (e.key === 'Escape') {
      closeFlip();
      document.removeEventListener('keydown', handleEscape);
    }
  }
  document.addEventListener('keydown', handleEscape);
}

/**
 * Open a simple modal for users with reduced motion preference.
 * @param {Object} resource - The resource data
 */
function openSimpleModal(resource) {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'flip-overlay';
  overlay.style.opacity = '1';
  document.body.appendChild(overlay);

  // Create modal
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 480px;
    background: #FFFFFF;
    border-radius: 16px;
    padding: 32px;
    z-index: 999;
    box-shadow: 0 24px 80px rgba(0,0,0,0.2);
  `;

  const catColor = categoryColors[resource.category] || '#4A90D9';

  modal.innerHTML = `
    <button class="flip-card-close" aria-label="Close" style="position: absolute; top: 16px; right: 16px;">&#10005;</button>
    <span class="category-tag" style="background: ${hexToRgba(catColor, 0.1)}; color: ${catColor}; margin-bottom: 16px;">${resource.category}</span>
    <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 600; color: #1A1D29; margin-bottom: 12px;">${escapeHtml(resource.title)}</h3>
    <p style="font-size: 15px; line-height: 1.6; color: rgba(26,29,41,0.7); margin-bottom: 24px;">${escapeHtml(resource.description)}</p>
    <a href="${resource.link}" target="_blank" rel="noopener noreferrer" 
       style="display: inline-block; background: #E8A838; color: #1A1D29; padding: 12px 32px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 14px;">
      Open Resource
    </a>
  `;

  document.body.appendChild(modal);

  const closeBtn = modal.querySelector('.flip-card-close');

  function closeModal() {
    modal.remove();
    overlay.remove();
  }

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  document.addEventListener('keydown', function handleEscape(e) {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEscape);
    }
  });
}

// ============================================================
// SECTION 7: Navigation Toggle (Mobile)
// ============================================================

/**
 * Setup the mobile navigation hamburger toggle.
 */
function setupNavToggle() {
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  if (!navToggle || !navLinks) return;

  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('nav-links-active');
    navToggle.classList.toggle('nav-toggle-active');
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('nav-links-active');
      navToggle.classList.remove('nav-toggle-active');
    });
  });
}

// ============================================================
// SECTION 8: Scroll Animations (IntersectionObserver)
// ============================================================

/**
 * Setup scroll-triggered entrance animations using IntersectionObserver.
 */
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

  // Observe section headers
  document.querySelectorAll('.section-header').forEach(el => {
    observer.observe(el);
  });

  // Observe feature cards
  document.querySelectorAll('.feature-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    observer.observe(el);
  });

  // Observe about cards
  document.querySelectorAll('.about-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    observer.observe(el);
  });
}

// ============================================================
// SECTION 9: Category Colors (Global)
// ============================================================

const categoryColors = {
  'Education': '#4A90D9',
  'Programming': '#7B68EE',
  'Fitness': '#2ECC71',
  'Entertainment': '#E67E22',
  'Gaming': '#9B59B6'
};

// ============================================================
// SECTION 10: Initialize Everything on DOM Ready
// ============================================================

/**
 * Main initialization function - called when DOM is fully loaded.
 */
function init() {
  // Check if Three.js is available (only on homepage)
  const heroCanvas = document.getElementById('hero-canvas');
  if (heroCanvas && typeof THREE !== 'undefined') {
    initParticleSystem();
  }

  // Setup navigation toggle
  setupNavToggle();

  // Setup scroll animations
  setupScrollAnimations();

  // Check if we're on a page with card functionality
  const cardsGrid = document.getElementById('cards-grid');
  const categoryChips = document.getElementById('category-chips');

  if (cardsGrid && typeof resources !== 'undefined') {
    // Render category chips
    if (categoryChips) {
      renderCategoryChips();
    }

    // Render all cards initially
    renderCards(resources);

    // Setup search
    setupSearch();
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
