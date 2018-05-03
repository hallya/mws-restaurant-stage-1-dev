const launch = {
  lazyLoading:() => {
    var lazyImages = [].slice.call(document.querySelectorAll('.lazy'));

    if ('IntersectionObserver' in window) {
      let lazyImageObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            let lazyImage = entry.target;
            if (lazyImage.localName === 'source') {
              lazyImage.srcset = lazyImage.dataset.srcset;
            } else {
              lazyImage.src = lazyImage.dataset.src;
            }

            lazyImage.classList.remove('lazy');
            lazyImageObserver.unobserve(lazyImage);
          }
        });
      });

      lazyImages.forEach(function (lazyImage) {
        lazyImageObserver.observe(lazyImage);
      });
    } else {
      // Possibly fall back to a more compatible method here
      let lazyImages = [].slice.call(document.querySelectorAll('.lazy'));
      let active = false;
      const lazyLoad = function () {
        if (active === false) {
          active = true;

          setTimeout(function () {
            lazyImages.forEach(function (lazyImage) {
              if ((lazyImage.getBoundingClientRect().top <= (window.innerHeight + 50)
                && lazyImage.getBoundingClientRect().bottom >= 0)
                && getComputedStyle(lazyImage).display !== 'none') {
                lazyImage.src = lazyImage.dataset.src;
                lazyImage.srcset = lazyImage.dataset.srcset;
                lazyImage.classList.remove('lazy');

                lazyImages = lazyImages.filter(function (image) {
                  return image !== lazyImage;
                });

                if (lazyImages.length === 0) {
                  document.removeEventListener('scroll', lazyLoad);
                  window.removeEventListener('resize', lazyLoad);
                  window.removeEventListener('orientationchange', lazyLoad);
                }
              }
            });

            active = false;
          }, 200);
        }
      };
      document.addEventListener('scroll', lazyLoad);
      window.addEventListener('resize', lazyLoad);
      window.addEventListener('orientationchange', lazyLoad);
      if (window.document.readyState === 'complete') {
        lazyLoad();
      }
    }
  },
  switchLoaderToMap:() => {
    if (document.getElementById('map').classList.contains('hidden')) {
      document.getElementById('map').classList.remove('hidden');
      document.getElementById('map-loader').classList.add('hidden');
    }
  }
};
export default launch;