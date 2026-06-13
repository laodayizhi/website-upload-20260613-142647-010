(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var navLinks = document.querySelector('.nav-links');

  if (menuButton && navLinks) {
    menuButton.addEventListener('click', function () {
      navLinks.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var activeIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, currentIndex) {
      slide.classList.toggle('is-active', currentIndex === activeIndex);
    });

    dots.forEach(function (dot, currentIndex) {
      dot.classList.toggle('is-active', currentIndex === activeIndex);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var nextIndex = parseInt(dot.getAttribute('data-slide'), 10) || 0;
      showSlide(nextIndex);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  var searchInput = document.querySelector('[data-search-input]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var typeFilter = document.querySelector('[data-type-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card-container] .movie-card, [data-card-container] .ranking-item'));

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters() {
    var query = normalize(searchInput ? searchInput.value : '');
    var year = yearFilter ? yearFilter.value : '';
    var type = typeFilter ? typeFilter.value : '';

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' ').toLowerCase();
      var matchedQuery = !query || haystack.indexOf(query) !== -1;
      var matchedYear = !year || card.getAttribute('data-year') === year;
      var matchedType = !type || card.getAttribute('data-type') === type;
      card.classList.toggle('is-filter-hidden', !(matchedQuery && matchedYear && matchedType));
    });
  }

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q) {
      searchInput.value = q;
    }

    searchInput.addEventListener('input', applyFilters);
  }

  if (yearFilter) {
    yearFilter.addEventListener('change', applyFilters);
  }

  if (typeFilter) {
    typeFilter.addEventListener('change', applyFilters);
  }

  if (cards.length) {
    applyFilters();
  }
})();
