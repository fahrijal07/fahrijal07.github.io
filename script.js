document.addEventListener('DOMContentLoaded', () => {

  /* ============================================
     SPLASH / WELCOME SCREEN
     ============================================ */
  const splashScreen = document.getElementById('splashScreen');
  if (splashScreen){
    document.body.classList.add('no-scroll');
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const showDuration = prefersReduced ? 400 : 2000;

    setTimeout(() => {
      splashScreen.classList.add('is-hiding');
      document.body.classList.remove('no-scroll');
      setTimeout(() => splashScreen.remove(), 850);
    }, showDuration);
  }

  /* ============================================
     TOAST HELPER
     ============================================ */
  const toastEl = document.getElementById('toast');
  let toastTimer;
  function showToast(message){
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2600);
  }

  /* ============================================
     THEME TOGGLE (dark / light glass)
     ============================================ */
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme === 'light') root.setAttribute('data-theme', 'light');

  themeToggle.addEventListener('click', () => {
    const isLight = root.getAttribute('data-theme') === 'light';
    if (isLight){
      root.removeAttribute('data-theme');
      localStorage.setItem('portfolio-theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
      localStorage.setItem('portfolio-theme', 'light');
    }
  });

  /* ============================================
     MOBILE NAV TOGGLE
     ============================================ */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ============================================
     SCROLL PROGRESS BAR
     ============================================ */
  const progressBar = document.getElementById('scrollProgress');
  function updateProgress(){
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = percent + '%';
  }

  /* ============================================
     SCROLLSPY (highlight active nav link)
     ============================================ */
  const sections = document.querySelectorAll('main .section, main .hero');
  const navLinkEls = document.querySelectorAll('.nav-link');

  function updateActiveLink(){
    let currentId = '';
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 120 && rect.bottom >= 120){
        currentId = section.id;
      }
    });
    navLinkEls.forEach(link => {
      link.classList.toggle('is-active', link.getAttribute('href') === '#' + currentId);
    });
  }

  /* ============================================
     BACK TO TOP FAB
     ============================================ */
  const backToTop = document.getElementById('backToTop');
  function updateFab(){
    backToTop.classList.toggle('is-visible', window.scrollY > 500);
  }
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* combine scroll listeners for performance */
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking){
      window.requestAnimationFrame(() => {
        updateProgress();
        updateActiveLink();
        updateFab();
        ticking = false;
      });
      ticking = true;
    }
  });
  updateProgress();
  updateActiveLink();
  updateFab();

  /* ============================================
     LOCKED PHOTO — selalu terkunci, popup "Hire me"
     ============================================ */
  const lockedPhotoBtn = document.getElementById('lockedPhotoBtn');
  const photoModal = document.getElementById('photoModal');
  const photoModalCancel = document.getElementById('photoModalCancel');
  const photoModalContact = document.getElementById('photoModalContact');

  function openPhotoModal(){
    photoModal.classList.add('is-visible');
    photoModalCancel.focus();
  }
  function closePhotoModal(){
    photoModal.classList.remove('is-visible');
    lockedPhotoBtn.focus();
  }

  lockedPhotoBtn.addEventListener('click', openPhotoModal);
  photoModalCancel.addEventListener('click', closePhotoModal);
  photoModal.addEventListener('click', (e) => {
    if (e.target === photoModal) closePhotoModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && photoModal.classList.contains('is-visible')) closePhotoModal();
  });
  photoModalContact.addEventListener('click', closePhotoModal);

  /* ============================================
     REVEAL ON SCROLL — cards fade/rise once
     ============================================ */
  const revealTargets = document.querySelectorAll(
    '.project-card, .timeline-item, .skill-tile'
  );
  revealTargets.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(18px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  });
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealTargets.forEach(el => revealObserver.observe(el));

  /* ============================================
     FILTER BAR (segmented control) — reusable
     ============================================ */
  function setupFilterBar(barId, onFilter){
    const bar = document.getElementById(barId);
    if (!bar) return;

    const btns = bar.querySelectorAll('.filter-btn');
    const indicator = bar.querySelector('.filter-indicator');

    function moveIndicator(btn){
      indicator.style.width = btn.offsetWidth + 'px';
      indicator.style.transform = `translateX(${btn.offsetLeft - 6}px)`;
    }

    const activeBtn = bar.querySelector('.filter-btn.is-active');
    if (activeBtn) requestAnimationFrame(() => moveIndicator(activeBtn));

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => { b.classList.remove('is-active'); b.setAttribute('aria-selected','false'); });
        btn.classList.add('is-active');
        btn.setAttribute('aria-selected','true');
        moveIndicator(btn);
        onFilter(btn.getAttribute('data-filter'));
      });
    });

    window.addEventListener('resize', () => {
      const current = bar.querySelector('.filter-btn.is-active');
      if (current) moveIndicator(current);
    });
  }

  const projectCards = document.querySelectorAll('.project-card');
  setupFilterBar('projectFilterBar', (filter) => {
    projectCards.forEach(card => {
      const match = filter === 'all' || card.getAttribute('data-category') === filter;
      card.classList.toggle('is-hidden', !match);
    });
  });

  /* ============================================
     CONTACT FORM VALIDATION
     ============================================ */
  const contactForm = document.getElementById('contactForm');

  function setError(fieldName, message){
    const input = contactForm.querySelector(`[name="${fieldName}"]`);
    const errorEl = contactForm.querySelector(`[data-error-for="${fieldName}"]`);
    if (message){
      input.classList.add('has-error');
      errorEl.textContent = message;
    } else {
      input.classList.remove('has-error');
      errorEl.textContent = '';
    }
  }

  function validateForm(data){
    let valid = true;

    if (!data.name.trim()){
      setError('name', 'Nama wajib diisi.');
      valid = false;
    } else {
      setError('name', '');
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email.trim()){
      setError('email', 'Email wajib diisi.');
      valid = false;
    } else if (!emailPattern.test(data.email)){
      setError('email', 'Format email tidak valid.');
      valid = false;
    } else {
      setError('email', '');
    }

    if (!data.message.trim() || data.message.trim().length < 10){
      setError('message', 'Pesan minimal 10 karakter.');
      valid = false;
    } else {
      setError('message', '');
    }

    return valid;
  }

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
      name: contactForm.name.value,
      email: contactForm.email.value,
      message: contactForm.message.value
    };

    if (!validateForm(data)) return;

    // Tidak ada backend di demo ini — buka aplikasi email pengguna
    // sebagai fallback pengiriman pesan yang nyata.
    const subject = encodeURIComponent(`Pesan portofolio dari ${data.name}`);
    const body = encodeURIComponent(`${data.message}\n\n— ${data.name} (${data.email})`);
    window.location.href = `mailto:fahri.rijal@studentmail.ac.id?subject=${subject}&body=${body}`;

    showToast('Membuka aplikasi email Anda…');
    contactForm.reset();
  });

});
