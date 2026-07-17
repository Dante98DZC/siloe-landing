/**
 * ServiceGallery - Galería optimizada para móviles y desktop
 * Características:
 * - Pantalla completa (fullscreen) moderna e intuitiva
 * - Navegación por gestos touch/swipe
 * - Auto-play configurable
 * - Navegación por dots, teclado y botones
 * - Optimización para móviles con interfaz táctil
 * - Indicador de progreso y contador
 * - Sin dependencias externas
 */
class ServiceGallery {
  constructor(element, images, options = {}) {
    if (!element || !images?.length) {
      console.error('ServiceGallery: elemento o imágenes inválidas');
      return;
    }

    this.container = element;
    this.images = images;
    this.options = Object.assign({
      autoPlay: true,
      autoPlayDuration: 6000,
      enableKeyboard: true,
      enableDots: true,
      enableButtons: true,
      enableFullscreen: true,
      enableSwipe: true,
      swipeThreshold: 50,
    }, options);

    this.currentIndex = 0;
    this.interval = null;

    // Cached DOM nodes (populated after render)
    this.nodes = {
      imagesWrapper: null,
      images: [],
      dotsContainer: null,
      prevBtn: null,
      nextBtn: null,
      fullscreenBtn: null,
      progress: null,
      counterCurrent: null,
    };

    // Bound handlers so we can add/remove listeners cleanly
    this.onMouseEnter = this.pauseAutoPlay.bind(this);
    this.onMouseLeave = this._maybeStartAutoPlay.bind(this);
    this.onPrev = this.showPrevious.bind(this);
    this.onNext = this.showNext.bind(this);
    this.onDotClick = this._onDotClick.bind(this);
    this.onKeydown = this._onKeydown.bind(this);
    this.onImagesClick = this._onImagesClick.bind(this);
    this.onTouchStart = this._onTouchStart.bind(this);
    this.onTouchEnd = this._onTouchEnd.bind(this);

    this._touch = { startX: 0, startY: 0 };

    this._render();
    this._cache();
    this._bind();
    this._maybeStartAutoPlay();
  }

  /* ---------- Render helpers ---------- */
  _render() {
    const frag = document.createDocumentFragment();

    const imagesWrapper = document.createElement('div');
    imagesWrapper.className = 'gallery-images-wrapper';

    this.images.forEach((src, i) => {
      const img = document.createElement('img');
      img.className = 'gallery-image' + (i === 0 ? ' active' : '');
      img.src = src;
      img.alt = `Imagen ${i + 1}`;
      img.loading = 'lazy';
      imagesWrapper.appendChild(img);
    });

    frag.appendChild(imagesWrapper);

    if (this.options.enableButtons) {
      const prev = document.createElement('button');
      prev.className = 'gallery-nav prev';
      prev.type = 'button';
      prev.setAttribute('aria-label', 'Anterior');
      prev.innerHTML = '&#10094;';
      frag.appendChild(prev);

      const next = document.createElement('button');
      next.className = 'gallery-nav next';
      next.type = 'button';
      next.setAttribute('aria-label', 'Siguiente');
      next.innerHTML = '&#10095;';
      frag.appendChild(next);
    }

    const progress = document.createElement('div');
    progress.className = 'gallery-progress';
    frag.appendChild(progress);

    if (this.options.enableFullscreen) {
      const fs = document.createElement('button');
      fs.className = 'gallery-fullscreen-btn';
      fs.type = 'button';
      fs.setAttribute('aria-label', 'Pantalla completa');
      fs.textContent = '⛶';
      frag.appendChild(fs);
    }

    if (this.options.enableDots) {
      const dots = document.createElement('div');
      dots.className = 'gallery-dots';
      this.images.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
        dot.type = 'button';
        dot.dataset.index = String(i);
        dot.setAttribute('aria-label', `Ir a imagen ${i + 1}`);
        dots.appendChild(dot);
      });
      frag.appendChild(dots);
    }

    const counter = document.createElement('div');
    counter.className = 'gallery-counter';
    counter.innerHTML = `<span class="current">1</span> / <span class="total">${this.images.length}</span>`;
    frag.appendChild(counter);

    let inner = this.container.querySelector('.gallery-inner');
    if (!inner) {
      inner = document.createElement('div');
      inner.className = 'gallery-inner';
      this.container.appendChild(inner);
    }
    inner.appendChild(frag);
  }

  /* ---------- Cache nodes ---------- */
  _cache() {
    this.nodes.imagesWrapper = this.container.querySelector('.gallery-images-wrapper');
    this.nodes.images = Array.from(this.container.querySelectorAll('.gallery-image'));
    this.nodes.dotsContainer = this.container.querySelector('.gallery-dots');
    this.nodes.prevBtn = this.container.querySelector('.gallery-nav.prev');
    this.nodes.nextBtn = this.container.querySelector('.gallery-nav.next');
    this.nodes.fullscreenBtn = this.container.querySelector('.gallery-fullscreen-btn');
    this.nodes.progress = this.container.querySelector('.gallery-progress');
    this.nodes.counterCurrent = this.container.querySelector('.gallery-counter .current');
  }

  /* ---------- Event binding (clean, delegated) ---------- */
  _bind() {
    // Hover pause (desktop)
    this.container.addEventListener('mouseenter', this.onMouseEnter);
    this.container.addEventListener('mouseleave', this.onMouseLeave);

    // Prev/Next buttons
    if (this.nodes.prevBtn) this.nodes.prevBtn.addEventListener('click', this.onPrev);
    if (this.nodes.nextBtn) this.nodes.nextBtn.addEventListener('click', this.onNext);

    // Fullscreen button
    if (this.nodes.fullscreenBtn) this.nodes.fullscreenBtn.addEventListener('click', () => this.openFullscreen());

    // Dots delegation
    if (this.nodes.dotsContainer) this.nodes.dotsContainer.addEventListener('click', this.onDotClick);

    // Click on images (open fullscreen on mobile)
    if (this.nodes.imagesWrapper) this.nodes.imagesWrapper.addEventListener('click', this.onImagesClick);

    // Touch gestures
    if (this.options.enableSwipe && this.nodes.imagesWrapper) {
      this.nodes.imagesWrapper.addEventListener('touchstart', this.onTouchStart, { passive: true });
      this.nodes.imagesWrapper.addEventListener('touchend', this.onTouchEnd, { passive: true });
    }

    // Keyboard navigation
    if (this.options.enableKeyboard) document.addEventListener('keydown', this.onKeydown);
  }

  /* ---------- Simple handlers ---------- */
  _onDotClick(e) {
    const btn = e.target.closest('.gallery-dot');
    if (!btn) return;
    const idx = Number(btn.dataset.index);
    if (!Number.isNaN(idx)) {
      this.showSlide(idx);
      this._maybeStartAutoPlay(true);
    }
  }

  _onImagesClick(e) {
    const img = e.target.closest('.gallery-image');
    if (!img) return;
    // If clicked image is not the active slide, go to it.
    const idx = this.nodes.images.indexOf(img);
    if (idx >= 0 && idx !== this.currentIndex) {
      this.showSlide(idx);
      this._maybeStartAutoPlay(true);
      return;
    }
    // If active and on small screens, open fullscreen
    if (window.innerWidth <= 768 && this.options.enableFullscreen) this.openFullscreen();
  }

  _onKeydown(e) {
    if (e.key === 'ArrowLeft') this.showPrevious();
    if (e.key === 'ArrowRight') this.showNext();
    if (e.key === 'Escape' && this.isFullscreen) this.closeFullscreen();
  }

  _onTouchStart(e) {
    const t = e.changedTouches[0];
    this._touch.startX = t.screenX;
    this._touch.startY = t.screenY;
    this.pauseAutoPlay();
  }

  _onTouchEnd(e) {
    const t = e.changedTouches[0];
    const dx = this._touch.startX - t.screenX;
    const dy = Math.abs(this._touch.startY - t.screenY);
    if (Math.abs(dx) < this.options.swipeThreshold || dy > this.options.swipeThreshold) return;
    if (dx > 0) this.showNext(); else this.showPrevious();
    this._maybeStartAutoPlay(true);
  }

  /* ---------- Core actions ---------- */
  showSlide(index) {
    if (!this.nodes.images.length) return;
    index = Math.max(0, Math.min(index, this.images.length - 1));
    if (index === this.currentIndex) return;

    this.nodes.images[this.currentIndex].classList.remove('active');
    const prevDot = this.nodes.dotsContainer?.querySelector('.gallery-dot.active');
    if (prevDot) prevDot.classList.remove('active');

    this.currentIndex = index;

    this.nodes.images[this.currentIndex].classList.add('active');
    const newDot = this.nodes.dotsContainer?.querySelector(`.gallery-dot:nth-child(${this.currentIndex + 1})`);
    if (newDot) newDot.classList.add('active');

    this._updateCounter();
    this._updateProgress();
  }

  showNext() { this.showSlide((this.currentIndex + 1) % this.images.length); }
  showPrevious() { this.showSlide((this.currentIndex - 1 + this.images.length) % this.images.length); }

  _updateCounter() {
    if (this.nodes.counterCurrent) this.nodes.counterCurrent.textContent = String(this.currentIndex + 1);
  }

  _updateProgress() {
    if (!this.nodes.progress) return;
    const pct = ((this.currentIndex + 1) / this.images.length) * 100;
    // avoid layout thrash
    window.requestAnimationFrame(() => { this.nodes.progress.style.width = pct + '%'; });
  }

  /* ---------- Fullscreen (simple, clean) ---------- */
  openFullscreen() {
    if (this.isFullscreen) return;
    this.pauseAutoPlay();
    this.isFullscreen = true;

    const modal = document.createElement('div');
    modal.className = 'gallery-fullscreen-modal';
    modal.innerHTML = `
      <div class="fullscreen-content">
        <button class="fullscreen-close" aria-label="Cerrar">✕</button>
        <button class="fullscreen-nav prev" aria-label="Anterior">‹</button>
        <button class="fullscreen-nav next" aria-label="Siguiente">›</button>
        <div class="fullscreen-image-container">
          <img class="fullscreen-image" src="${this.nodes.images[this.currentIndex].src}" alt="">
        </div>
        <div class="fullscreen-controls">
          <div class="fullscreen-dots"></div>
          <div class="fullscreen-counter"><span class="current">${this.currentIndex + 1}</span> / <span class="total">${this.images.length}</span></div>
        </div>
      </div>`;

    document.body.appendChild(modal);
    this.fullscreenModal = modal;

    // fill dots
    const dotsWrap = modal.querySelector('.fullscreen-dots');
    this.images.forEach((_, i) => {
      const b = document.createElement('button');
      b.className = i === this.currentIndex ? 'fullscreen-dot active' : 'fullscreen-dot';
      b.type = 'button';
      b.dataset.index = String(i);
      dotsWrap.appendChild(b);
    });

    // handlers
    modal.querySelector('.fullscreen-close').addEventListener('click', () => this.closeFullscreen());
    modal.querySelector('.fullscreen-nav.prev').addEventListener('click', () => { this.showPrevious(); this._fsUpdate(); });
    modal.querySelector('.fullscreen-nav.next').addEventListener('click', () => { this.showNext(); this._fsUpdate(); });

    modal.addEventListener('click', (ev) => { if (ev.target === modal) this.closeFullscreen(); });

    modal.querySelector('.fullscreen-dots').addEventListener('click', (ev) => {
      const btn = ev.target.closest('.fullscreen-dot');
      if (!btn) return;
      const idx = Number(btn.dataset.index);
      if (!Number.isNaN(idx)) { this.showSlide(idx); this._fsUpdate(); }
    });

    modal.querySelector('.fullscreen-image-container').addEventListener('touchstart', (e) => { this._touch.startX = e.changedTouches[0].screenX; this._touch.startY = e.changedTouches[0].screenY; }, { passive: true });
    modal.querySelector('.fullscreen-image-container').addEventListener('touchend', (e) => {
      const dx = this._touch.startX - e.changedTouches[0].screenX;
      const dy = Math.abs(this._touch.startY - e.changedTouches[0].screenY);
      if (Math.abs(dx) > this.options.swipeThreshold && dy < this.options.swipeThreshold) {
        if (dx > 0) this.showNext(); else this.showPrevious();
        this._fsUpdate();
      }
    }, { passive: true });

    document.addEventListener('keydown', this.onKeydown);
    document.body.style.overflow = 'hidden';
  }

  _fsUpdate() {
    if (!this.fullscreenModal) return;
    const img = this.fullscreenModal.querySelector('.fullscreen-image');
    img.src = this.nodes.images[this.currentIndex].src;
    this.fullscreenModal.querySelectorAll('.fullscreen-dot').forEach((d, i) => d.classList.toggle('active', i === this.currentIndex));
    const cur = this.fullscreenModal.querySelector('.fullscreen-counter .current'); if (cur) cur.textContent = String(this.currentIndex + 1);
  }

  closeFullscreen() {
    if (!this.isFullscreen || !this.fullscreenModal) return;
    this.fullscreenModal.remove();
    this.fullscreenModal = null;
    this.isFullscreen = false;
    document.removeEventListener('keydown', this.onKeydown);
    document.body.style.overflow = '';
    this._maybeStartAutoPlay();
  }

  /* ---------- Autoplay helpers ---------- */
  _maybeStartAutoPlay(forceRestart = false) {
    if (!this.options.autoPlay) return;
    this.pauseAutoPlay();
    if (!this.isFullscreen) this.startAutoPlay();
    if (forceRestart) this.startAutoPlay();
  }

  startAutoPlay() {
    if (!this.options.autoPlay || this.interval || this.isFullscreen) return;
    this.interval = setInterval(() => this.showNext(), this.options.autoPlayDuration);
  }

  pauseAutoPlay() { if (this.interval) { clearInterval(this.interval); this.interval = null; } }

  /* ---------- Cleanup ---------- */
  destroy() {
    this.pauseAutoPlay();
    this.container.removeEventListener('mouseenter', this.onMouseEnter);
    this.container.removeEventListener('mouseleave', this.onMouseLeave);
    if (this.nodes.prevBtn) this.nodes.prevBtn.removeEventListener('click', this.onPrev);
    if (this.nodes.nextBtn) this.nodes.nextBtn.removeEventListener('click', this.onNext);
    if (this.nodes.dotsContainer) this.nodes.dotsContainer.removeEventListener('click', this.onDotClick);
    if (this.nodes.imagesWrapper) {
      this.nodes.imagesWrapper.removeEventListener('click', this.onImagesClick);
      this.nodes.imagesWrapper.removeEventListener('touchstart', this.onTouchStart);
      this.nodes.imagesWrapper.removeEventListener('touchend', this.onTouchEnd);
    }
    document.removeEventListener('keydown', this.onKeydown);
    if (this.fullscreenModal) this.closeFullscreen();
    this.nodes = null;
  }
}

/**
 * Inicializar todas las galerías de servicio en la página
 */
function initServiceGalleries() {
  document.querySelectorAll('.service-gallery').forEach((gallery) => {
    if (gallery.dataset.initialized === 'true') return;

    const imagesAttr = gallery.dataset.images?.trim();
    if (!imagesAttr) {
      console.warn('ServiceGallery: No se encontraron imágenes en data-images');
      return;
    }

    const images = imagesAttr.split(',').map((src) => src.trim()).filter(Boolean);

    if (images.length) {
      new ServiceGallery(gallery, images, {
        autoPlay: gallery.dataset.autoplay !== 'false',
        autoPlayDuration: parseInt(gallery.dataset.duration, 10) || 6000,
        enableKeyboard: gallery.dataset.keyboard !== 'false',
        enableDots: gallery.dataset.dots !== 'false',
        enableButtons: gallery.dataset.buttons !== 'false',
        enableFullscreen: gallery.dataset.fullscreen !== 'false',
        enableSwipe: gallery.dataset.swipe !== 'false',
        swipeThreshold: parseInt(gallery.dataset.swipeThreshold, 10) || 50,
      });
      gallery.dataset.initialized = 'true';
    }
  });
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initServiceGalleries);
} else {
  initServiceGalleries();
}
