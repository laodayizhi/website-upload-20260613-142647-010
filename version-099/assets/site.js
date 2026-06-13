(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-global-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var target = "search.html";
        if (value) {
          target += "?q=" + encodeURIComponent(value);
        }
        window.location.href = target;
      });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function play() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
          play();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(current - 1);
          play();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          showSlide(current + 1);
          play();
        });
      }

      showSlide(0);
      play();
    }

    document.querySelectorAll("[data-filter-list]").forEach(function (list) {
      var section = list.closest("section") || document;
      var input = section.querySelector("[data-filter-input]");
      var typeSelect = section.querySelector("[data-filter-type]");
      var yearSelect = section.querySelector("[data-filter-year]");
      var emptyState = section.querySelector("[data-empty-state]");
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

      function applyFilter() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var type = typeSelect ? typeSelect.value : "";
        var year = yearSelect ? yearSelect.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var search = (card.getAttribute("data-search") || "").toLowerCase();
          var cardType = card.getAttribute("data-type") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var matchQuery = !query || search.indexOf(query) !== -1;
          var matchType = !type || cardType.indexOf(type) !== -1;
          var matchYear = !year || cardYear === year;
          var matched = matchQuery && matchType && matchYear;
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });

        if (emptyState) {
          emptyState.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilter);
          control.addEventListener("change", applyFilter);
        }
      });
    });

    document.querySelectorAll("[data-video-player]").forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector(".player-start");
      var stream = shell.getAttribute("data-stream") || "";
      var hlsInstance = null;
      var prepared = false;

      function prepareVideo() {
        if (!video || !stream || prepared) {
          return;
        }
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function startVideo() {
        prepareVideo();
        if (button) {
          button.classList.add("is-hidden");
        }
        if (video) {
          video.controls = true;
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
          }
        }
      }

      if (button) {
        button.addEventListener("click", startVideo);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            startVideo();
          }
        });
      }
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });

    var searchResults = document.getElementById("searchResults");
    if (searchResults && window.SEARCH_MOVIES) {
      var input = document.querySelector("[data-search-page-input]");
      var button = document.querySelector("[data-search-page-button]");
      var empty = document.querySelector("[data-search-empty]");
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";
      if (input) {
        input.value = initialQuery;
      }

      function renderCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
          return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\">" +
          "<a class=\"movie-poster\" href=\"" + escapeHtml(movie.file) + "\">" +
          "<img class=\"poster-image\" src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
          "<span class=\"poster-play\">播放</span>" +
          "</a>" +
          "<div class=\"movie-card-body\">" +
          "<h2><a href=\"" + escapeHtml(movie.file) + "\">" + escapeHtml(movie.title) + "</a></h2>" +
          "<p class=\"movie-line\">" + escapeHtml(movie.oneLine) + "</p>" +
          "<div class=\"movie-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
          "<div class=\"tag-row\">" + tags + "</div>" +
          "</div>" +
          "</article>";
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

      function runSearch() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var matches = [];
        if (query) {
          matches = window.SEARCH_MOVIES.filter(function (movie) {
            return movie.search.indexOf(query) !== -1;
          }).slice(0, 120);
        }
        searchResults.innerHTML = matches.map(renderCard).join("");
        if (empty) {
          empty.textContent = query ? "没有找到匹配的影片。" : "输入关键词后即可查看匹配影片。";
          empty.classList.toggle("is-visible", matches.length === 0);
        }
      }

      if (button) {
        button.addEventListener("click", runSearch);
      }
      if (input) {
        input.addEventListener("input", runSearch);
        input.addEventListener("keydown", function (event) {
          if (event.key === "Enter") {
            event.preventDefault();
            runSearch();
          }
        });
      }
      runSearch();
    }
  });
})();
