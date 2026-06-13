(function() {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function() {
      panel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    var showSlide = function(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    var start = function() {
      timer = window.setInterval(function() {
        showSlide(current + 1);
      }, 5000);
    };

    var restart = function() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    };

    if (prev) {
      prev.addEventListener('click', function() {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        showSlide(current + 1);
        restart();
      });
    }

    dots.forEach(function(dot, index) {
      dot.addEventListener('click', function() {
        showSlide(index);
        restart();
      });
    });

    start();
  }

  var filterInput = document.querySelector('[data-page-filter]');
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-type]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
  var selectedType = 'all';

  var getCardText = function(card) {
    return ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '')).toLowerCase();
  };

  var applyFilter = function() {
    var query = filterInput ? filterInput.value.trim().toLowerCase() : '';

    cards.forEach(function(card) {
      var meta = card.getAttribute('data-meta') || '';
      var matchesQuery = !query || getCardText(card).indexOf(query) !== -1;
      var matchesType = selectedType === 'all' || meta.indexOf(selectedType) !== -1;
      card.classList.toggle('is-hidden-by-filter', !(matchesQuery && matchesType));
    });
  };

  if (filterInput) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      filterInput.value = query;
    }
    filterInput.addEventListener('input', applyFilter);
    applyFilter();
  }

  filterButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      selectedType = button.getAttribute('data-filter-type') || 'all';
      filterButtons.forEach(function(item) {
        item.classList.toggle('is-active', item === button);
      });
      applyFilter();
    });
  });
})();

function initMoviePlayer(source, videoId, buttonId) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var hls = null;
  var loaded = false;

  if (!video || !button || !source) {
    return;
  }

  var begin = function() {
    if (!loaded) {
      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          backBufferLength: 30
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    button.classList.add('is-hidden');
    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function() {
        button.classList.remove('is-hidden');
      });
    }
  };

  button.addEventListener('click', begin);

  video.addEventListener('click', function() {
    if (video.paused) {
      begin();
    }
  });

  video.addEventListener('play', function() {
    button.classList.add('is-hidden');
  });

  video.addEventListener('ended', function() {
    button.classList.remove('is-hidden');
  });
}
