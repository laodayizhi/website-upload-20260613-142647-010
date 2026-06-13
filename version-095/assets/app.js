(function() {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const panel = document.querySelector('[data-mobile-panel]');
  if (menuButton && panel) {
    menuButton.addEventListener('click', function() {
      panel.classList.toggle('is-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let current = 0;
  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function(slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach(function(dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }
  dots.forEach(function(dot, index) {
    dot.addEventListener('click', function() {
      showSlide(index);
    });
  });
  if (slides.length > 1) {
    window.setInterval(function() {
      showSlide(current + 1);
    }, 5200);
  }

  const inputs = Array.from(document.querySelectorAll('[data-filter-input]'));
  inputs.forEach(function(input) {
    const cards = Array.from(document.querySelectorAll('[data-card]'));
    input.addEventListener('input', function() {
      const value = input.value.trim().toLowerCase();
      cards.forEach(function(card) {
        const text = (card.getAttribute('data-text') || card.textContent || '').toLowerCase();
        card.classList.toggle('is-hidden', value !== '' && text.indexOf(value) === -1);
      });
    });
  });

  const backTop = document.querySelector('[data-back-top]');
  if (backTop) {
    window.addEventListener('scroll', function() {
      backTop.classList.toggle('is-visible', window.scrollY > 360);
    });
    backTop.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
