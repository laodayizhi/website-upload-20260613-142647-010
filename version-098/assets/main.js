(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupNavigation() {
        var toggle = document.querySelector(".nav-toggle");
        var menu = document.querySelector(".mobile-menu");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = menu.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupBackTop() {
        var button = document.querySelector(".back-top");
        if (!button) {
            return;
        }
        window.addEventListener("scroll", function () {
            if (window.pageYOffset > 360) {
                button.classList.add("is-visible");
            } else {
                button.classList.remove("is-visible");
            }
        });
        button.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var previous = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide")) || 0);
                start();
            });
        });

        if (previous) {
            previous.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function cardMatches(card, query, filters) {
        var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre")
        ].join(" "));
        if (query && haystack.indexOf(query) === -1) {
            return false;
        }
        return Object.keys(filters).every(function (key) {
            var expected = filters[key];
            if (!expected) {
                return true;
            }
            return normalize(card.getAttribute("data-" + key)) === expected;
        });
    }

    function applyFilters(panel) {
        var scopeSelector = panel.getAttribute("data-filter-scope") || "body";
        var scope = document.querySelector(scopeSelector) || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".searchable-card"));
        var input = panel.querySelector(".filter-input");
        var query = normalize(input ? input.value : "");
        var filters = {};
        Array.prototype.slice.call(panel.querySelectorAll(".filter-select")).forEach(function (select) {
            filters[select.getAttribute("data-filter-key")] = normalize(select.value);
        });
        var visible = 0;
        cards.forEach(function (card) {
            var match = cardMatches(card, query, filters);
            card.classList.toggle("is-hidden", !match);
            if (match) {
                visible += 1;
            }
        });
        var empty = document.querySelector("[data-empty-state]");
        if (empty) {
            empty.classList.toggle("is-visible", visible === 0);
        }
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        if (!panels.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        panels.forEach(function (panel) {
            var input = panel.querySelector(".filter-input");
            if (input && params.get("q")) {
                input.value = params.get("q");
            }
            panel.addEventListener("input", function () {
                applyFilters(panel);
            });
            panel.addEventListener("change", function () {
                applyFilters(panel);
            });
            applyFilters(panel);
        });
    }

    window.setupPlayer = function (streamUrl) {
        var video = document.getElementById("moviePlayer");
        var overlay = document.getElementById("playOverlay");
        if (!video || !streamUrl) {
            return;
        }
        var loaded = false;
        var hlsInstance = null;

        function attachStream() {
            if (loaded) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
            loaded = true;
        }

        function play() {
            attachStream();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        setupNavigation();
        setupBackTop();
        setupHeroSlider();
        setupFilters();
    });
}());
