(function () {
    var navButton = document.querySelector('[data-nav-toggle]');
    var navLinks = document.querySelector('[data-nav-links]');

    if (navButton && navLinks) {
        navButton.addEventListener('click', function () {
            navLinks.classList.toggle('is-open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');
    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
            });
        });

        showSlide(0);
        setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var filterRoot = document.querySelector('[data-filter-root]');
    if (filterRoot) {
        var searchInput = filterRoot.querySelector('[data-search-input]');
        var yearSelect = filterRoot.querySelector('[data-year-filter]');
        var typeSelect = filterRoot.querySelector('[data-type-filter]');
        var resetButton = filterRoot.querySelector('[data-filter-reset]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        var emptyState = document.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query && searchInput) {
            searchInput.value = query;
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            var keyword = normalize(searchInput ? searchInput.value : '');
            var year = yearSelect ? yearSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                var cardYear = card.getAttribute('data-year') || '';
                var cardType = card.getAttribute('data-type') || '';
                var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchedYear = !year || cardYear === year;
                var matchedType = !type || cardType === type;
                var matched = matchedKeyword && matchedYear && matchedType;

                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.style.display = visible ? 'none' : 'block';
            }
        }

        if (searchInput) {
            searchInput.addEventListener('input', applyFilter);
        }
        if (yearSelect) {
            yearSelect.addEventListener('change', applyFilter);
        }
        if (typeSelect) {
            typeSelect.addEventListener('change', applyFilter);
        }
        if (resetButton) {
            resetButton.addEventListener('click', function () {
                if (searchInput) {
                    searchInput.value = '';
                }
                if (yearSelect) {
                    yearSelect.value = '';
                }
                if (typeSelect) {
                    typeSelect.value = '';
                }
                applyFilter();
            });
        }

        applyFilter();
    }
}());
