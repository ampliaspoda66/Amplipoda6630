/* ===== CDEJ BF0959 — script principal ===== */
(function () {
  'use strict';

  /* ---------- Menu hamburger ---------- */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');

  if (burger && nav) {
    burger.addEventListener('click', function () {
      const isOpen = nav.classList.toggle('is-open');
      burger.classList.toggle('is-open', isOpen);
      burger.setAttribute('aria-expanded', String(isOpen));
      burger.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
    });

    // Fermer au clic sur un lien
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });

    // Fermer au clic en dehors
    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('is-open')) return;
      if (nav.contains(e.target) || burger.contains(e.target)) return;
      nav.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    });

    // Fermer avec Échap
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        burger.focus();
      }
    });

    // Réinitialiser à la redimension desktop
    window.addEventListener('resize', function () {
      if (window.innerWidth > 768) {
        nav.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Header au scroll ---------- */
  const header = document.getElementById('header');
  if (header) {
    const onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 20);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Animations au scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && revealEls.length) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            // léger décalage pour un effet en cascade
            setTimeout(function () {
              entry.target.classList.add('is-visible');
            }, i * 80);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    // Fallback : tout afficher
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Compteurs animés (hero) ---------- */
  const counters = document.querySelectorAll('.stat__num');
  if (counters.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-count'), 10) || 0;
          const duration = 1600;
          const start = performance.now();

          function update(now) {
            const progress = Math.min((now - start) / duration, 1);
            // easing out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target);
            if (progress < 1) {
              requestAnimationFrame(update);
            } else {
              el.textContent = target;
            }
          }
          requestAnimationFrame(update);
          counterObserver.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) { counterObserver.observe(el); });
  }

  /* ---------- Formulaire de contact ---------- */
  const form = document.getElementById('contactForm');
  if (form) {
    const status = document.getElementById('formStatus');

    const validators = {
      name: function (v) { return v.trim().length >= 2 ? '' : 'Veuillez saisir votre nom complet.'; },
      email: function (v) {
        if (!v.trim()) return 'Veuillez saisir votre email.';
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Adresse email invalide.';
      },
      subject: function (v) { return v ? '' : 'Veuillez choisir un sujet.'; },
      message: function (v) { return v.trim().length >= 10 ? '' : 'Votre message doit contenir au moins 10 caractères.'; }
    };

    function setError(field, message) {
      const group = field.closest('.form-group');
      const errorEl = group.querySelector('.form-error');
      if (message) {
        group.classList.add('has-error');
        errorEl.textContent = message;
        field.setAttribute('aria-invalid', 'true');
      } else {
        group.classList.remove('has-error');
        errorEl.textContent = '';
        field.removeAttribute('aria-invalid');
      }
    }

    function validateField(field) {
      const name = field.name;
      if (!validators[name]) return true;
      const message = validators[name](field.value);
      setError(field, message);
      return !message;
    }

    // Validation en direct
    form.querySelectorAll('input, select, textarea').forEach(function (field) {
      field.addEventListener('blur', function () { validateField(field); });
      field.addEventListener('input', function () {
        if (field.closest('.form-group').classList.contains('has-error')) {
          validateField(field);
        }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      let isValid = true;
      let firstInvalid = null;

      form.querySelectorAll('input, select, textarea').forEach(function (field) {
        const ok = validateField(field);
        if (!ok) {
          isValid = false;
          if (!firstInvalid) firstInvalid = field;
        }
      });

      if (!isValid) {
        status.textContent = 'Veuillez corriger les erreurs avant d’envoyer.';
        status.className = 'form-status is-error';
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Simulation d'envoi (aucun backend dans cette version)
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Envoi en cours...';
      status.textContent = '';
      status.className = 'form-status';

      setTimeout(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        status.textContent = 'Merci ! Votre message a bien été envoyé. Nous vous répondrons rapidement.';
        status.className = 'form-status is-success';
        form.reset();
      }, 900);
    });
  }

  /* ---------- Année dans le footer ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();