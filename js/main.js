/**
 * DIMES Turkish Beverage Website - Main Interactive Scripts
 */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Header scroll state (lightweight — no video parallax)
  const header = document.getElementById('header');
  const heroBgVideo = document.getElementById('heroBgVideo');

  window.addEventListener('scroll', () => {
    if (header) {
      header.classList.toggle('scrolled', window.pageYOffset > 50);
    }
  }, { passive: true });

  // 2. Intersection Observer — zero-overhead fade-in
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '50px' });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  // 2b. Pause hero video when scrolled off-screen on mobile (saves CPU/GPU decode cycles)
  if (heroBgVideo && 'IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          heroBgVideo.play().catch(() => {});
        } else {
          heroBgVideo.pause();
        }
      });
    }, { threshold: 0 });
    videoObserver.observe(heroBgVideo);
  }

  // 3. Smooth scroll for anchor navigation
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#' || !href) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // 4. Mobile Drawer Open / Close Logic (Left slide drawer, does not cover full screen)
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  const navBackdrop = document.getElementById('navBackdrop');
  const mobileDrawerClose = document.getElementById('mobileDrawerClose');

  function openMobileDrawer() {
    if (mainNav) mainNav.classList.add('is-open');
    if (navBackdrop) navBackdrop.classList.add('is-open');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    if (mainNav) mainNav.classList.remove('is-open');
    if (navBackdrop) navBackdrop.classList.remove('is-open');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (menuToggle) menuToggle.addEventListener('click', openMobileDrawer);
  if (mobileDrawerClose) mobileDrawerClose.addEventListener('click', closeMobileDrawer);
  if (navBackdrop) navBackdrop.addEventListener('click', closeMobileDrawer);

  // Mobile Dropdown Accordion Toggle (İçecek Aileleri only opens when tapped)
  const dropdownToggle = document.getElementById('dropdownToggle');
  const dropdownItem = dropdownToggle ? dropdownToggle.closest('.nav-dropdown-item') : null;

  if (dropdownToggle && dropdownItem) {
    dropdownToggle.addEventListener('click', (e) => {
      if (window.innerWidth < 900) {
        e.preventDefault();
        e.stopPropagation();
        dropdownItem.classList.toggle('is-open');
      }
    });
  }

  // Close drawer on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mainNav && mainNav.classList.contains('is-open')) {
      closeMobileDrawer();
    }
  });

  // Close drawer when clicking regular navigation links
  document.querySelectorAll('.nav-link:not(.nav-link--dropdown), .dropdown-link, .nav-cta').forEach(link => {
    link.addEventListener('click', closeMobileDrawer);
  });

  // 6. Animated Counter Stats ("Sayaç")
  function animateCounters() {
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'), 10);
      if (isNaN(target)) return;
      const duration = 1800; // ms
      const startTime = performance.now();

      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out quadratic function for smooth deceleration
        const easeProgress = 1 - (1 - progress) * (1 - progress);
        const currentValue = Math.floor(easeProgress * target);
        
        counter.textContent = currentValue;

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target;
        }
      }
      requestAnimationFrame(updateCounter);
    });
  }

  // Trigger counter when stats section enters viewport
  const statsContainer = document.querySelector('.hero-stats');
  if (statsContainer) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    statsObserver.observe(statsContainer);
  }

  // 7. Cool Ailesi Character Roster Interactive Click & Back Button Logic
  const coolRosterFrame = document.getElementById('coolRosterFrame');
  const coolRosterBack = document.getElementById('coolRosterBack');
  const coolSlices = document.querySelectorAll('.cool-roster-slice');

  coolSlices.forEach(slice => {
    slice.addEventListener('click', (e) => {
      // On mobile (< 900px), ONLY the currently glowing/centered slice opens details
      if (window.innerWidth < 900) {
        if (!slice.classList.contains('is-centered')) {
          e.preventDefault();
          e.stopPropagation();
          if (coolRoster) {
            const scrollOffset = slice.offsetLeft - (coolRoster.clientWidth / 2) + (slice.clientWidth / 2);
            coolRoster.scrollTo({ left: scrollOffset, behavior: 'smooth' });
          }
          return;
        }
      }

      if (slice.classList.contains('is-active')) return;

      coolSlices.forEach(s => s.classList.remove('is-active'));
      slice.classList.add('is-active');
      if (coolRosterFrame) coolRosterFrame.classList.add('is-expanded');
    });
  });

  if (coolRosterBack) {
    coolRosterBack.addEventListener('click', (e) => {
      e.stopPropagation();
      coolSlices.forEach(s => s.classList.remove('is-active'));
      if (coolRosterFrame) coolRosterFrame.classList.remove('is-expanded');
    });
  }

  // Mobile Horizontal Scroll Active Slice Centering Detector for Cool Roster (Strictly 1 Slice Lights Up - 0ms Layout Overhead)
  const coolRoster = document.getElementById('coolRoster');
  if (coolRoster) {
    let coolTicking = false;
    function updateCenteredSlice() {
      if (window.innerWidth >= 900 || (coolRosterFrame && coolRosterFrame.classList.contains('is-expanded'))) return;

      const maxScroll = coolRoster.scrollWidth - coolRoster.clientWidth;
      let closestSlice = null;

      if (coolRoster.scrollLeft <= 20) {
        closestSlice = coolSlices[0];
      } else if (coolRoster.scrollLeft >= maxScroll - 20) {
        closestSlice = coolSlices[coolSlices.length - 1];
      } else {
        const rosterCenter = coolRoster.scrollLeft + (coolRoster.clientWidth / 2);
        let minDistance = Infinity;

        coolSlices.forEach(slice => {
          const sliceCenter = slice.offsetLeft + (slice.offsetWidth / 2);
          const distance = Math.abs(rosterCenter - sliceCenter);

          if (distance < minDistance) {
            minDistance = distance;
            closestSlice = slice;
          }
        });
      }

      coolSlices.forEach(s => s.classList.remove('is-centered'));
      if (closestSlice) {
        closestSlice.classList.add('is-centered');
      }
    }

    function requestCoolUpdate() {
      if (!coolTicking) {
        requestAnimationFrame(() => {
          updateCenteredSlice();
          coolTicking = false;
        });
        coolTicking = true;
      }
    }

    coolRoster.addEventListener('scroll', requestCoolUpdate, { passive: true });
    coolRoster.addEventListener('touchmove', requestCoolUpdate, { passive: true });
    coolRoster.addEventListener('touchend', requestCoolUpdate, { passive: true });
    window.addEventListener('resize', updateCenteredSlice, { passive: true });
    updateCenteredSlice();
  }

  // 8. Nektar Ailesi Character Roster Interactive Click & Back Button Logic
  const nektarRosterFrame = document.getElementById('nektarRosterFrame');
  const nektarRosterBack = document.getElementById('nektarRosterBack');
  const nektarSlices = document.querySelectorAll('.nektar-roster-slice');

  nektarSlices.forEach(slice => {
    slice.addEventListener('click', (e) => {
      // On mobile (< 900px), ONLY the currently glowing/centered slice opens details
      if (window.innerWidth < 900) {
        if (!slice.classList.contains('is-centered')) {
          e.preventDefault();
          e.stopPropagation();
          if (nektarRoster) {
            const scrollOffset = slice.offsetLeft - (nektarRoster.clientWidth / 2) + (slice.clientWidth / 2);
            nektarRoster.scrollTo({ left: scrollOffset, behavior: 'smooth' });
          }
          return;
        }
      }

      if (slice.classList.contains('is-active')) return;

      nektarSlices.forEach(s => s.classList.remove('is-active'));
      slice.classList.add('is-active');
      if (nektarRosterFrame) nektarRosterFrame.classList.add('is-expanded');
    });
  });

  if (nektarRosterBack) {
    nektarRosterBack.addEventListener('click', (e) => {
      e.stopPropagation();
      nektarSlices.forEach(s => s.classList.remove('is-active'));
      if (nektarRosterFrame) nektarRosterFrame.classList.remove('is-expanded');
    });
  }

  // Mobile Horizontal Scroll Active Slice Centering Detector for Nektar Roster (Strictly 1 Slice Lights Up - 0ms Layout Overhead)
  const nektarRoster = document.getElementById('nektarRoster');
  if (nektarRoster) {
    let nektarTicking = false;
    function updateCenteredNektarSlice() {
      if (window.innerWidth >= 900 || (nektarRosterFrame && nektarRosterFrame.classList.contains('is-expanded'))) return;

      const maxScroll = nektarRoster.scrollWidth - nektarRoster.clientWidth;
      let closestSlice = null;

      if (nektarRoster.scrollLeft <= 20) {
        closestSlice = nektarSlices[0];
      } else if (nektarRoster.scrollLeft >= maxScroll - 20) {
        closestSlice = nektarSlices[nektarSlices.length - 1];
      } else {
        const rosterCenter = nektarRoster.scrollLeft + (nektarRoster.clientWidth / 2);
        let minDistance = Infinity;

        nektarSlices.forEach(slice => {
          const sliceCenter = slice.offsetLeft + (slice.offsetWidth / 2);
          const distance = Math.abs(rosterCenter - sliceCenter);

          if (distance < minDistance) {
            minDistance = distance;
            closestSlice = slice;
          }
        });
      }

      nektarSlices.forEach(s => s.classList.remove('is-centered'));
      if (closestSlice) {
        closestSlice.classList.add('is-centered');
      }
    }

    function requestNektarUpdate() {
      if (!nektarTicking) {
        requestAnimationFrame(() => {
          updateCenteredNektarSlice();
          nektarTicking = false;
        });
        nektarTicking = true;
      }
    }

    nektarRoster.addEventListener('scroll', requestNektarUpdate, { passive: true });
    nektarRoster.addEventListener('touchmove', requestNektarUpdate, { passive: true });
    nektarRoster.addEventListener('touchend', requestNektarUpdate, { passive: true });
    window.addEventListener('resize', updateCenteredNektarSlice, { passive: true });
    updateCenteredNektarSlice();
  }

});
