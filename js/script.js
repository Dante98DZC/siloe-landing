$(document).ready(function () {
  let images = $(".gallery img");
  let currentIndex = 0;

  function showImage(index) {
    images.removeClass("active");
    $(images[index]).addClass("active");
    localStorage.setItem("currentIndex", index);
  }

  function saveImagesToLocalStorage() {
    images.each(function (index, img) {
      let imgSrc = $(img).attr("src");
      fetch(imgSrc)
        .then((response) => response.blob())
        .then((blob) => {
          let reader = new FileReader();
          reader.onloadend = function () {
            localStorage.setItem("image" + index, reader.result);
          };
          reader.readAsDataURL(blob);
        });
    });
  }

  function loadImagesFromLocalStorage() {
    images.each(function (index, img) {
      let storedImage = localStorage.getItem("image" + index);
      if (storedImage) {
        $(img).attr("src", storedImage);
      }
    });
  }

  // Save images to localStorage if not already saved
  if (!localStorage.getItem("imagesSaved")) {
    saveImagesToLocalStorage();
    localStorage.setItem("imagesSaved", "true");
  } else {
    loadImagesFromLocalStorage();
  }

  let cachedIndex = localStorage.getItem("currentIndex");
  if (cachedIndex) {
    currentIndex = parseInt(cachedIndex);
  }
  showImage(currentIndex);

  $(".prev").click(function () {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    showImage(currentIndex);
  });

  $(".next").click(function () {
    currentIndex = (currentIndex + 1) % images.length;
    showImage(currentIndex);
  });
});

function abrirModal() {
  document.getElementById("modalCesto").style.display = "block";
}

function cerrarModal() {
  document.getElementById("modalCesto").style.display = "none";
}

// Cierra el modal al hacer clic fuera de la imagen
window.onclick = function (event) {
  const modal = document.getElementById("modalCesto");
  if (event.target == modal) {
    modal.style.display = "none";
  }
};
