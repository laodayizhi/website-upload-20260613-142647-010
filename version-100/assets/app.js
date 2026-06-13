(function () {
    var menuToggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    var backTop = document.querySelector("[data-back-top]");

    if (backTop) {
        window.addEventListener("scroll", function () {
            if (window.scrollY > 320) {
                backTop.classList.add("is-visible");
            } else {
                backTop.classList.remove("is-visible");
            }
        });

        backTop.addEventListener("click", function () {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

    var carousel = document.querySelector("[data-hero-carousel]");

    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var prev = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        startTimer();
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var searchItems = Array.prototype.slice.call(document.querySelectorAll("[data-search-item]"));

    if (filterInput && searchItems.length) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";

        if (query) {
            filterInput.value = query;
        }

        function applyFilter() {
            var value = filterInput.value.trim().toLowerCase();

            searchItems.forEach(function (item) {
                var haystack = (item.getAttribute("data-search-text") || "").toLowerCase();
                item.hidden = value && haystack.indexOf(value) === -1;
            });
        }

        filterInput.addEventListener("input", applyFilter);
        applyFilter();
    }
}());
