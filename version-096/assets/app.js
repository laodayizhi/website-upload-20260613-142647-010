(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                var opened = mobileNav.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", opened ? "true" : "false");
            });
        }

        document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
            var prev = carousel.querySelector("[data-carousel-prev]");
            var next = carousel.querySelector("[data-carousel-next]");
            var index = 0;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                slides[index].classList.remove("is-active");
                index = (nextIndex + slides.length) % slides.length;
                slides[index].classList.add("is-active");
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                });
            }

            if (slides.length > 1) {
                window.setInterval(function () {
                    show(index + 1);
                }, 6200);
            }
        });

        var searchInput = document.querySelector("#content-search");
        var movieGrid = document.querySelector("#movie-grid");
        var emptyState = document.querySelector("[data-empty-state]");
        var activeFilter = "all";

        function applyFilter() {
            if (!movieGrid) {
                return;
            }
            var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
            var cards = Array.prototype.slice.call(movieGrid.querySelectorAll(".movie-card"));
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = card.getAttribute("data-search") || "";
                var category = card.getAttribute("data-category") || "";
                var matchedText = !query || haystack.indexOf(query) !== -1;
                var matchedCategory = activeFilter === "all" || category === activeFilter;
                var matched = matchedText && matchedCategory;
                card.classList.toggle("is-hidden", !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", visible === 0);
            }
        }

        if (searchInput && movieGrid) {
            var params = new URLSearchParams(window.location.search);
            var queryValue = params.get("q") || "";
            if (queryValue) {
                searchInput.value = queryValue;
            }
            searchInput.addEventListener("input", applyFilter);
            applyFilter();
        }

        document.querySelectorAll("[data-filter]").forEach(function (button) {
            button.addEventListener("click", function () {
                activeFilter = button.getAttribute("data-filter") || "all";
                document.querySelectorAll("[data-filter]").forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                applyFilter();
            });
        });

        document.querySelectorAll(".player-widget").forEach(function (widget) {
            var video = widget.querySelector("video");
            var cover = widget.querySelector(".player-cover");
            var stream = widget.getAttribute("data-stream");
            var attached = false;

            function attachStream() {
                if (!video || !stream || attached) {
                    return;
                }
                attached = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls();
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    widget.videoEngine = hls;
                } else {
                    video.src = stream;
                }
            }

            function startVideo() {
                if (!video) {
                    return;
                }
                attachStream();
                if (cover) {
                    cover.classList.add("is-hidden");
                }
                video.controls = true;
                var playTask = video.play();
                if (playTask && playTask.catch) {
                    playTask.catch(function () {});
                }
            }

            if (cover) {
                cover.addEventListener("click", startVideo);
            }

            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        startVideo();
                    }
                });
            }
        });
    });
})();
