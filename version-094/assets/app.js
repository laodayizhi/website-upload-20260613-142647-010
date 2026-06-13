(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupBackTop() {
        var button = document.querySelector("[data-back-top]");
        if (!button) {
            return;
        }
        function sync() {
            button.classList.toggle("is-visible", window.scrollY > 360);
        }
        window.addEventListener("scroll", sync, { passive: true });
        button.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
        sync();
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }
        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        show(0);
        restart();
    }

    function fillSelect(select, values) {
        values.forEach(function (value) {
            var option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function setupFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var input = document.querySelector("[data-filter-input]");
        var empty = document.querySelector("[data-empty-state]");
        var selects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-select]"));
        if (!cards.length || (!input && !selects.length)) {
            return;
        }
        selects.forEach(function (select) {
            var field = select.getAttribute("data-filter-select");
            var values = cards.map(function (card) {
                return card.getAttribute("data-" + field) || "";
            }).filter(Boolean).filter(function (value, index, array) {
                return array.indexOf(value) === index;
            }).sort(function (a, b) {
                return b.localeCompare(a, "zh-Hans-CN", { numeric: true });
            });
            fillSelect(select, values);
        });
        function apply() {
            var query = normalize(input ? input.value : "");
            var selected = {};
            selects.forEach(function (select) {
                selected[select.getAttribute("data-filter-select")] = select.value;
            });
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags")
                ].join(" "));
                var matchedQuery = !query || haystack.indexOf(query) !== -1;
                var matchedSelects = Object.keys(selected).every(function (field) {
                    return !selected[field] || card.getAttribute("data-" + field) === selected[field];
                });
                var visibleNow = matchedQuery && matchedSelects;
                card.style.display = visibleNow ? "" : "none";
                if (visibleNow) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }
        if (input) {
            input.addEventListener("input", apply);
        }
        selects.forEach(function (select) {
            select.addEventListener("change", apply);
        });
        apply();
    }

    function makeResultCard(item) {
        var tags = String(item.tags || item.genre || "").split(/[、,，/\\s]+/).filter(Boolean).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<a class=\"movie-card\" href=\"" + escapeHtml(item.url) + "\">" +
            "<div class=\"poster-wrap\"><img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\"><span class=\"year-badge\">" + escapeHtml(item.year) + "</span><span class=\"play-badge\">▶</span></div>" +
            "<div class=\"card-body\"><div class=\"meta-line\">" + escapeHtml(item.region) + " · " + escapeHtml(item.type) + "</div><h3 class=\"card-title\">" + escapeHtml(item.title) + "</h3><p class=\"card-desc\">" + escapeHtml(item.oneLine || "") + "</p><div class=\"tag-row\">" + tags + "</div></div>" +
            "</a>";
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>\"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;",
                "'": "&#39;"
            }[char];
        });
    }

    function setupSiteSearch() {
        var input = document.querySelector("[data-site-search]");
        var button = document.querySelector("[data-site-search-button]");
        var results = document.querySelector("[data-site-search-results]");
        var list = window.SEARCH_MOVIES || [];
        if (!input || !results || !list.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;
        function render() {
            var query = normalize(input.value);
            var matches = list.filter(function (item) {
                var haystack = normalize([item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(" "));
                return !query || haystack.indexOf(query) !== -1;
            }).slice(0, 80);
            results.innerHTML = matches.map(makeResultCard).join("");
        }
        input.addEventListener("input", render);
        if (button) {
            button.addEventListener("click", render);
        }
        render();
    }

    window.setupMoviePlayer = function (settings) {
        var video = document.getElementById(settings.videoId);
        var overlay = document.getElementById(settings.overlayId);
        if (!video || !settings.src) {
            return;
        }
        var initialized = false;
        function init() {
            if (initialized) {
                return;
            }
            initialized = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = settings.src;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
                hls.loadSource(settings.src);
                hls.attachMedia(video);
            } else {
                video.src = settings.src;
            }
        }
        function start() {
            init();
            video.controls = true;
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }
        if (overlay) {
            overlay.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        video.addEventListener("pause", function () {
            if (video.currentTime === 0 && overlay) {
                overlay.classList.remove("is-hidden");
            }
        });
    };

    ready(function () {
        setupMenu();
        setupBackTop();
        setupHero();
        setupFilters();
        setupSiteSearch();
    });
})();
