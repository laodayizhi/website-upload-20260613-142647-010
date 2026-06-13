(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      const open = nav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-nav button'));
    let index = 0;
    let timer = null;

    const showSlide = function (next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    };

    const start = function () {
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    };

    const stop = function () {
      if (timer) {
        window.clearInterval(timer);
      }
    };

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        stop();
        showSlide(i);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  const filterForms = Array.from(document.querySelectorAll('.local-filter, .global-search-form'));

  const applyFilter = function (form) {
    const input = form.querySelector('input[type="search"]');
    const select = form.querySelector('select');
    const query = input ? input.value.trim().toLowerCase() : '';
    const year = select ? select.value.trim() : '';
    const cards = Array.from(document.querySelectorAll('.filter-target .movie-card'));
    let visible = 0;

    cards.forEach(function (card) {
      const haystack = [
        card.dataset.title || '',
        card.dataset.tags || '',
        card.dataset.region || '',
        card.dataset.type || '',
        card.dataset.year || ''
      ].join(' ').toLowerCase();
      const byQuery = !query || haystack.includes(query);
      const byYear = !year || (card.dataset.year || '') === year;
      const show = byQuery && byYear;
      card.hidden = !show;
      if (show) {
        visible += 1;
      }
    });

    const empty = document.querySelector('.empty-state');
    if (empty) {
      empty.hidden = visible !== 0;
    }
  };

  filterForms.forEach(function (form) {
    const input = form.querySelector('input[type="search"]');
    const select = form.querySelector('select');
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');

    if (q && input) {
      input.value = q;
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter(form);
    });

    if (input) {
      input.addEventListener('input', function () {
        applyFilter(form);
      });
    }

    if (select) {
      select.addEventListener('change', function () {
        applyFilter(form);
      });
    }

    applyFilter(form);
  });
})();

function initMoviePlayer(source) {
  const video = document.getElementById('movie-video');
  const cover = document.getElementById('player-cover');
  const shell = document.querySelector('.player-shell');
  let attached = false;
  let hlsInstance = null;

  if (!video || !source) {
    return;
  }

  const attachSource = function () {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = source;
  };

  const play = function () {
    attachSource();
    if (shell) {
      shell.classList.add('is-playing');
    }
    if (cover) {
      cover.hidden = true;
    }
    video.controls = true;
    const promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        if (cover) {
          cover.hidden = false;
        }
        if (shell) {
          shell.classList.remove('is-playing');
        }
      });
    }
  };

  if (cover) {
    cover.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (!attached || video.paused) {
      play();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
