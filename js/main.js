/**
 * DIMES Turkish Beverage Website - Main Interactive Scripts
 */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Header scroll state
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.pageYOffset > 60);
    }, { passive: true });
  }

  // 2. Intersection Observer — fade-in animations with stagger
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const parent = entry.target.parentElement;
        if (parent) {
          const siblings = Array.from(parent.children).filter(el => el.classList.contains('fade-in'));
          const idx = siblings.indexOf(entry.target);
          entry.target.style.transitionDelay = `${idx * 100}ms`;
        }
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

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

  // 5. Hero Video Smooth 60fps Parallax & Pinned Scroll Continuation (Desktop only for 120fps mobile performance)
  const heroBgVideo = document.getElementById('heroBgVideo');
  const heroScrollSection = document.getElementById('hero');
  const heroScrollHint = document.getElementById('heroScrollHint');

  function updateVideoOnScroll() {
    if (!heroScrollSection || window.innerWidth < 900) return;
    const rect = heroScrollSection.getBoundingClientRect();
    const scrollableDistance = heroScrollSection.offsetHeight - window.innerHeight;

    if (scrollableDistance <= 0) return;

    // Calculate progress within hero section (0.0 to 1.0)
    const progress = Math.min(Math.max(-rect.top / scrollableDistance, 0), 1);

    if (heroBgVideo) {
      // Smooth 60fps video zoom and slow parallax movement as user scrolls
      const scale = 1.02 + (progress * 0.18);
      const translateY = progress * 35;
      heroBgVideo.style.transform = `scale(${scale}) translateY(${translateY}px)`;
    }

    // Hide scroll hint once user begins scrolling
    if (heroScrollHint) {
      heroScrollHint.style.opacity = progress > 0.05 ? '0' : '0.9';
    }
  }

  window.addEventListener('scroll', updateVideoOnScroll, { passive: true });
  updateVideoOnScroll();

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

  // Mobile Horizontal Scroll Active Slice Centering Detector for Cool Roster (Strictly 1 Slice Lights Up)
  const coolRoster = document.getElementById('coolRoster');
  if (coolRoster) {
    function updateCenteredSlice() {
      if (window.innerWidth >= 900 || (coolRosterFrame && coolRosterFrame.classList.contains('is-expanded'))) return;

      const maxScroll = coolRoster.scrollWidth - coolRoster.clientWidth;
      let closestSlice = null;

      if (coolRoster.scrollLeft <= 20) {
        closestSlice = coolSlices[0];
      } else if (coolRoster.scrollLeft >= maxScroll - 20) {
        closestSlice = coolSlices[coolSlices.length - 1];
      } else {
        const rosterRect = coolRoster.getBoundingClientRect();
        const rosterCenter = rosterRect.left + rosterRect.width / 2;
        let minDistance = Infinity;

        coolSlices.forEach(slice => {
          const sliceRect = slice.getBoundingClientRect();
          const sliceCenter = sliceRect.left + sliceRect.width / 2;
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

    coolRoster.addEventListener('scroll', updateCenteredSlice, { passive: true });
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

  // Mobile Horizontal Scroll Active Slice Centering Detector for Nektar Roster (Strictly 1 Slice Lights Up)
  const nektarRoster = document.getElementById('nektarRoster');
  if (nektarRoster) {
    function updateCenteredNektarSlice() {
      if (window.innerWidth >= 900 || (nektarRosterFrame && nektarRosterFrame.classList.contains('is-expanded'))) return;

      const maxScroll = nektarRoster.scrollWidth - nektarRoster.clientWidth;
      let closestSlice = null;

      if (nektarRoster.scrollLeft <= 20) {
        closestSlice = nektarSlices[0];
      } else if (nektarRoster.scrollLeft >= maxScroll - 20) {
        closestSlice = nektarSlices[nektarSlices.length - 1];
      } else {
        const rosterRect = nektarRoster.getBoundingClientRect();
        const rosterCenter = rosterRect.left + rosterRect.width / 2;
        let minDistance = Infinity;

        nektarSlices.forEach(slice => {
          const sliceRect = slice.getBoundingClientRect();
          const sliceCenter = sliceRect.left + sliceRect.width / 2;
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

    nektarRoster.addEventListener('scroll', updateCenteredNektarSlice, { passive: true });
    window.addEventListener('resize', updateCenteredNektarSlice, { passive: true });
    updateCenteredNektarSlice();
  }

});
