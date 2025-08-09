// Configuration
const CONFIG = {
  ROTATION_INTERVAL: 4000,
  GALLERY_AUTO_PLAY: 6000,
};

let currentSlide = 0;
let rotatingTextIndex = 0;
let galleryInterval;
let textRotationInterval;

// Initialize everything when DOM loads
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
});

function initializeApp() {
  // Hide loading overlay
  setTimeout(() => {
    document.getElementById("loadingOverlay").classList.add("hidden");
  }, 1000);

  // Initialize components
  initScrollAnimations();
  initNavbarScroll();
  initTextRotation();
  initGalleryAutoPlay();
  initSmoothScroll();

  // Setup event listeners
  setupEventListeners();
}

// Scroll animations
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, observerOptions);

  // Observe all elements with animation classes
  document
    .querySelectorAll(".fade-in, .slide-in-left, .slide-in-right")
    .forEach((el) => {
      observer.observe(el);
    });
}

// Navbar scroll effect
function initNavbarScroll() {
  window.addEventListener("scroll", () => {
    const navbar = document.getElementById("navbar");
    if (window.scrollY > 100) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });
}

// Text rotation in hero section
function initTextRotation() {
  const texts = document.querySelectorAll(".rotating-text");

  if (texts.length === 0) return;

  textRotationInterval = setInterval(() => {
    texts[rotatingTextIndex].classList.remove("active");
    rotatingTextIndex = (rotatingTextIndex + 1) % texts.length;
    texts[rotatingTextIndex].classList.add("active");
  }, CONFIG.ROTATION_INTERVAL);
}

// Service cards functionality
function toggleCard(card) {
  // Cerrar otras tarjetas
  document.querySelectorAll(".service-card").forEach((otherCard) => {
    if (otherCard !== card) otherCard.classList.remove("flipped");
  });

  // Toggle tarjeta actual
  card.classList.toggle("flipped");
}

// Cerrar tarjetas al hacer click fuera
document.addEventListener("click", (e) => {
  if (!e.target.closest(".service-card")) {
    document.querySelectorAll(".service-card").forEach((card) => {
      card.classList.remove("flipped");
    });
  }
});

// Gallery functionality
function initGalleryAutoPlay() {
  const images = document.querySelectorAll(".gallery-image");
  const dots = document.querySelectorAll(".gallery-dot");

  if (images.length === 0) return;

  galleryInterval = setInterval(() => {
    nextImage();
  }, CONFIG.GALLERY_AUTO_PLAY);

  // Pause auto-play on hover
  const galleryContainer = document.querySelector(".gallery-container");
  if (galleryContainer) {
    galleryContainer.addEventListener("mouseenter", () => {
      clearInterval(galleryInterval);
    });

    galleryContainer.addEventListener("mouseleave", () => {
      galleryInterval = setInterval(() => {
        nextImage();
      }, CONFIG.GALLERY_AUTO_PLAY);
    });
  }
}

function nextImage() {
  const images = document.querySelectorAll(".gallery-image");
  const dots = document.querySelectorAll(".gallery-dot");

  if (images.length === 0) return;

  images[currentSlide].classList.remove("active");
  dots[currentSlide].classList.remove("active");

  currentSlide = (currentSlide + 1) % images.length;

  images[currentSlide].classList.add("active");
  dots[currentSlide].classList.add("active");
}

function previousImage() {
  const images = document.querySelectorAll(".gallery-image");
  const dots = document.querySelectorAll(".gallery-dot");

  if (images.length === 0) return;

  images[currentSlide].classList.remove("active");
  dots[currentSlide].classList.remove("active");

  currentSlide = (currentSlide - 1 + images.length) % images.length;

  images[currentSlide].classList.add("active");
  dots[currentSlide].classList.add("active");
}

function currentImage(n) {
  const images = document.querySelectorAll(".gallery-image");
  const dots = document.querySelectorAll(".gallery-dot");

  if (images.length === 0) return;

  images[currentSlide].classList.remove("active");
  dots[currentSlide].classList.remove("active");

  currentSlide = n - 1;

  images[currentSlide].classList.add("active");
  dots[currentSlide].classList.add("active");
}

// FAQ functionality
function toggleFAQ(button) {
  const answer = button.nextElementSibling;
  const isOpen = button.classList.contains("active");

  // Close all other FAQs
  document.querySelectorAll(".faq-question").forEach((q) => {
    q.classList.remove("active");
    q.nextElementSibling.classList.remove("open");
  });

  // Toggle current FAQ
  if (!isOpen) {
    button.classList.add("active");
    answer.classList.add("open");
  }
}

// Smooth scroll for anchor links
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        const offsetTop = target.offsetTop - 100; // Account for fixed navbar
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });
      }
    });
  });
}

// Modal functionality
function openModal(imageSrc) {
  const modal = document.getElementById("imageModal");
  const modalImage = document.getElementById("modalImage");
  modal.style.display = "block";
  modalImage.src = imageSrc;
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const modal = document.getElementById("imageModal");
  modal.style.display = "none";
  document.body.style.overflow = "";
}

// Setup additional event listeners
function setupEventListeners() {
  // Close modal on click outside
  document.getElementById("imageModal").addEventListener("click", function (e) {
    if (e.target === this) {
      closeModal();
    }
  });

  // Close modal on ESC key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeModal();
    }
  });

  // Keyboard navigation for gallery
  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") {
      previousImage();
    } else if (e.key === "ArrowRight") {
      nextImage();
    }
  });
}

// Performance optimization - cleanup intervals on page unload
window.addEventListener("beforeunload", function () {
  if (galleryInterval) clearInterval(galleryInterval);
  if (textRotationInterval) clearInterval(textRotationInterval);
});

// Add click handlers for gallery images to open modal
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".gallery-image").forEach((img) => {
    img.addEventListener("click", function () {
      openModal(this.src);
    });
    img.style.cursor = "pointer";
  });
});
