$(document).ready(function () {
    let images = $('.gallery img');
    let currentIndex = 0;

    function showImage(index) {
        images.removeClass('active');
        $(images[index]).addClass('active');
        localStorage.setItem('currentIndex', index);
    }

    let cachedIndex = localStorage.getItem('currentIndex');
    if (cachedIndex) {
        currentIndex = parseInt(cachedIndex);
    }
    showImage(currentIndex);

    $('.prev').click(function () {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        showImage(currentIndex);
    });

    $('.next').click(function () {
        currentIndex = (currentIndex + 1) % images.length;
        showImage(currentIndex);
    });
});