window.addEventListener('scroll', function() {
    const footer = document.querySelector('header');
    const scrollPosition = window.scrollY || window.pageYOffset;

    if (scrollPosition > 50) {
        footer.classList.add('transparent-header');
    } else {
        footer.classList.remove('transparent-header');
    }
});