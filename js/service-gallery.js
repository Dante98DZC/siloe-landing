// Service Gallery Component
class ServiceGallery {
  constructor(element, images) {
    this.container = element;
    this.images = images;
    this.currentIndex = 0;
    this.interval = null;
    this.autoPlayDuration = 6000;

    this.init();
  }

  init() {
    this.renderGallery();
    // this.setupControls();
    this.startAutoPlay();
  }

  renderGallery() {
    // Crear contenedor de la galería
    const galleryContainer = document.createElement('div');
    galleryContainer.className = 'service-gallery-container';
    
    // Agregar imágenes
    this.images.forEach((src, index) => {
      const img = document.createElement('img');
      img.src = src;
      img.className = `gallery-image ${index === 0 ? 'active' : ''}`;
      img.alt = `Imagen ${index + 1} de la galería`;
      galleryContainer.appendChild(img);
    });

    // Agregar controles de navegación
    galleryContainer.innerHTML += `
      <div class="gallery-dots">
        ${this.images.map((_, i) => `
          <span class="gallery-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>
        `).join('')}
      </div>
    `;

    this.container.appendChild(galleryContainer);
  }

  setupControls() {
    // Botones de navegación
    this.container.querySelector('.prev').addEventListener('click', () => this.showPrevious());
    this.container.querySelector('.next').addEventListener('click', () => this.showNext());

    // Puntos indicadores
    this.container.querySelectorAll('.gallery-dot').forEach((dot, index) => {
      dot.addEventListener('click', () => this.showSlide(index));
    });

    // Pausar autoplay al hover
    this.container.addEventListener('mouseenter', () => this.pauseAutoPlay());
    this.container.addEventListener('mouseleave', () => this.startAutoPlay());
  }

  showSlide(index) {
    const images = this.container.querySelectorAll('.gallery-image');
    const dots = this.container.querySelectorAll('.gallery-dot');

    // Ocultar slide actual
    images[this.currentIndex].classList.remove('active');
    dots[this.currentIndex].classList.remove('active');

    // Mostrar nuevo slide
    this.currentIndex = index;
    images[this.currentIndex].classList.add('active');
    dots[this.currentIndex].classList.add('active');
  }

  showNext() {
    const nextIndex = (this.currentIndex + 1) % this.images.length;
    this.showSlide(nextIndex);
  }

  showPrevious() {
    const prevIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.showSlide(prevIndex);
  }

  startAutoPlay() {
    this.interval = setInterval(() => this.showNext(), this.autoPlayDuration);
  }

  pauseAutoPlay() {
    clearInterval(this.interval);
  }
}

// Función auxiliar para inicializar todas las galerías de servicio
function initServiceGalleries() {
  document.querySelectorAll('.service-gallery').forEach(gallery => {
    const images = Array.from(gallery.dataset.images.split(','));
    new ServiceGallery(gallery, images);
  });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initServiceGalleries);