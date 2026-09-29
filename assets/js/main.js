/* Nations Maintenance — site behaviour. No dependencies. */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     Site config — this is the only place you need to edit.

     FORM_ENDPOINT: paste a form-handling URL (Formspree, Netlify, or your
     own handler). While it is empty, the quote form falls back to opening
     the visitor's mail client so no enquiry is ever silently lost.
     If you DO paste a third-party endpoint, its host must also be allowed in
     the Content Security Policy — add it to connect-src in BOTH `_headers`
     and `.htaccess`, for example:  connect-src 'self' https://formspree.io;
     Otherwise the browser will block the submission. Same-origin endpoints
     (a handler on your own domain) need no change.

     SOCIALS: paste the full profile URL for each platform you actually
     have. Anything left as '' is removed from the page — the site never
     shows a social icon that leads nowhere.

     GOOGLE_REVIEW_URL: the "write a review" link from your Google Business
     Profile. While it is empty, the review buttons point visitors to the
     contact page and phone number instead.

     REVIEWS: real customer testimonials, newest first. Copy them exactly as
     the customer wrote them and keep the name they are happy to be shown
     under. Leave the array empty and the review sections stay hidden — the
     site never invents a testimonial.
     ------------------------------------------------------------------ */
  var SITE = {
    phone: '(330) 353-1136',
    email: 'info@nationsmaintenance.com',
    FORM_ENDPOINT: ''
  };

  var SOCIALS = {
    facebook: '',
    instagram: '',
    google: '',
    linkedin: '',
    x: '',
    youtube: ''
  };

  var GOOGLE_REVIEW_URL = '';

  var REVIEWS = [
    /* { quote: '', name: '', detail: 'North Canton, OH', stars: 5 } */
  ];

  var doc = document;
  doc.documentElement.classList.add('js');

  /* ---------- sticky header shadow ---------- */
  var header = doc.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- mobile navigation ---------- */
  var toggle = doc.querySelector('.nav-toggle');
  var nav = doc.getElementById('site-nav');
  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    };
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a[href]') && window.matchMedia('(max-width: 960px)').matches) setOpen(false);
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 960) setOpen(false);
    });
  }

  /* ---------- services dropdown ---------- */
  var dropButtons = doc.querySelectorAll('[data-dropdown]');
  Array.prototype.forEach.call(dropButtons, function (btn) {
    var panel = doc.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;

    var item = btn.closest('li');
    var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var closeTimer = null;
    var openedByHover = false;

    var clearTimer = function () {
      if (closeTimer) { window.clearTimeout(closeTimer); closeTimer = null; }
    };
    var close = function () {
      clearTimer();
      openedByHover = false;
      btn.setAttribute('aria-expanded', 'false');
      panel.hidden = true;
    };
    var open = function () {
      clearTimer();
      btn.setAttribute('aria-expanded', 'true');
      panel.hidden = false;
    };
    /* a short grace period means clipping the edge of the panel on the way
       in doesn't kill the menu before the visitor can click something */
    var scheduleClose = function () {
      clearTimer();
      closeTimer = window.setTimeout(close, 220);
    };

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      if (btn.getAttribute('aria-expanded') !== 'true') {
        open();
        openedByHover = false;
      } else if (openedByHover) {
        /* the pointer already opened this; a click here means "let me pick
           something", not "shut it" — keep it open, now on the visitor's terms */
        openedByHover = false;
      } else {
        close();
      }
    });

    doc.addEventListener('click', function (e) {
      if (!panel.contains(e.target) && e.target !== btn) close();
    });

    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
        close();
        btn.focus();
      }
    });

    if (item && canHover) {
      item.addEventListener('mouseenter', function () {
        open();
        openedByHover = true;
      });
      item.addEventListener('mouseleave', scheduleClose);
      /* tabbing out of the submenu should close it too */
      item.addEventListener('focusout', function (e) {
        if (!item.contains(e.relatedTarget)) close();
      });
    }
  });

  /* ---------- social links ---------- */
  /* Built here and mounted beside the footer badges. A platform with no URL in
     SOCIALS is skipped entirely, so the site can never show an icon that leads
     nowhere — and adding one later is a one-line paste into SOCIALS. */
  var SOCIAL_ICONS = {
    facebook: { label: 'Facebook', path: '<path d="M15 4h-2.3A3.2 3.2 0 0 0 9.5 7.2V10H7.4v2.9h2.1V21h2.9v-8.1h2.3l.5-2.9h-2.8V7.6c0-.4.3-.7.7-.7H15z"/>' },
    instagram: { label: 'Instagram', path: '<rect x="3.5" y="3.5" width="17" height="17" rx="4.6"/><circle cx="12" cy="12" r="4"/><circle cx="16.9" cy="7.1" r="1.1" fill="currentColor" stroke="none"/>' },
    google: { label: 'Google', path: '<path d="M20.2 12.2A8.4 8.4 0 1 1 17 5.6"/><path d="M20.2 12.2h-7.6"/>' },
    linkedin: { label: 'LinkedIn', path: '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M8 10.6V16.2M8 7.7v.1M12 16.2v-3.3a2 2 0 0 1 4 0v3.3"/>' },
    x: { label: 'X', path: '<path d="M4.4 4h3.5l4.2 5.6L16.8 4h2.8l-6.2 7.6L20 20h-3.5l-4.4-5.9L7.2 20H4.4l6.5-7.9z" fill="currentColor" stroke="none"/>' },
    youtube: { label: 'YouTube', path: '<rect x="2.6" y="5.6" width="18.8" height="12.8" rx="4"/><path d="M10.4 9.6l4.2 2.4-4.2 2.4z"/>' }
  };

  var socialMount = doc.querySelector('.footer-badges') || doc.querySelector('.site-footer .brand');
  if (socialMount) {
    var socialRow = doc.createElement('div');
    socialRow.className = 'social';
    Object.keys(SOCIAL_ICONS).forEach(function (key) {
      if (!SOCIALS[key]) return;
      var link = doc.createElement('a');
      link.href = SOCIALS[key];
      link.target = '_blank';
      link.rel = 'noopener';
      link.setAttribute('aria-label', 'Nations Maintenance on ' + SOCIAL_ICONS[key].label);
      link.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">' +
        SOCIAL_ICONS[key].path + '</svg>';
      socialRow.appendChild(link);
    });
    if (socialRow.children.length) {
      socialMount.parentNode.insertBefore(socialRow, socialMount.nextSibling);
    }
  }

  /* ---------- reviews ---------- */
  var escapeHtml = function (value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var STAR = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.6l2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8z" fill="currentColor"/></svg>';

  var reviewTargets = doc.querySelectorAll('[data-reviews]');
  if (reviewTargets.length && REVIEWS.length) {
    Array.prototype.forEach.call(reviewTargets, function (target) {
      var html = '';
      REVIEWS.forEach(function (review) {
        var stars = Math.max(1, Math.min(5, parseInt(review.stars, 10) || 5));
        html += '<figure class="review">' +
          '<div class="review__stars" role="img" aria-label="' + stars + ' out of 5 stars">' +
          new Array(stars + 1).join(STAR) + '</div>' +
          '<blockquote>' + escapeHtml(review.quote) + '</blockquote>' +
          '<figcaption class="review__who"><b>' + escapeHtml(review.name) + '</b>' +
          escapeHtml(review.detail || '') + '</figcaption>' +
          '</figure>';
      });
      target.innerHTML = html;
    });
    Array.prototype.forEach.call(doc.querySelectorAll('[data-reviews-section]'), function (el) {
      el.hidden = false;
    });
    Array.prototype.forEach.call(doc.querySelectorAll('[data-reviews-empty]'), function (el) {
      el.hidden = true;
    });
  }

  /* review buttons: real Google review link when configured, otherwise the contact page */
  Array.prototype.forEach.call(doc.querySelectorAll('[data-review-link]'), function (el) {
    if (GOOGLE_REVIEW_URL) {
      el.href = GOOGLE_REVIEW_URL;
      el.target = '_blank';
      el.rel = 'noopener';
    } else {
      el.hidden = true;
    }
  });
  Array.prototype.forEach.call(doc.querySelectorAll('[data-review-fallback]'), function (el) {
    el.hidden = Boolean(GOOGLE_REVIEW_URL);
  });

  /* ---------- reveal on scroll ---------- */
  var reveals = doc.querySelectorAll('.reveal');
  if (reveals.length) {
    var showAll = function () {
      Array.prototype.forEach.call(reveals, function (el) {
        el.classList.remove('reveal-hidden');
        el.classList.add('is-visible');
      });
    };
    if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      Array.prototype.forEach.call(reveals, function (el) { el.classList.add('reveal-hidden'); });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.remove('reveal-hidden');
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
      Array.prototype.forEach.call(reveals, function (el) { io.observe(el); });
      /* failsafe: never leave content hidden if the observer stays quiet */
      window.setTimeout(showAll, 2500);
    } else {
      showAll();
    }
  }

  /* ---------- year stamp ---------- */
  Array.prototype.forEach.call(doc.querySelectorAll('[data-year]'), function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- quote form ---------- */
  var form = doc.querySelector('form[data-quote-form]');
  if (!form) return;

  var status = form.querySelector('.form-status');
  var submit = form.querySelector('[type="submit"]');

  var say = function (state, message) {
    if (!status) return;
    status.setAttribute('data-state', state);
    status.textContent = message;
    status.focus && status.focus();
  };

  var fieldValue = function (name) {
    var el = form.elements[name];
    return el && el.value ? el.value.trim() : '';
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var honeypot = form.elements['company_website'];
    if (honeypot && honeypot.value) return; /* silently drop bots */

    if (!form.checkValidity()) {
      form.reportValidity();
      say('error', 'Please complete the highlighted fields so we can reach you.');
      return;
    }

    var payload = {
      name: fieldValue('name'),
      phone: fieldValue('phone'),
      email: fieldValue('email'),
      property: fieldValue('property'),
      service: fieldValue('service'),
      message: fieldValue('message'),
      page: window.location.href
    };

    if (!SITE.FORM_ENDPOINT) {
      var body = [
        'Name: ' + payload.name,
        'Phone: ' + payload.phone,
        'Email: ' + payload.email,
        'Property type: ' + payload.property,
        'Service needed: ' + payload.service,
        '',
        payload.message,
        '',
        'Sent from ' + payload.page
      ].join('\n');
      window.location.href = 'mailto:' + SITE.email +
        '?subject=' + encodeURIComponent('Quote request — ' + payload.name) +
        '&body=' + encodeURIComponent(body);
      say('ok', 'Your email app should now be open with the request ready to send. Prefer to talk? Call ' + SITE.phone + '.');
      return;
    }

    if (submit) { submit.disabled = true; submit.dataset.label = submit.textContent; submit.textContent = 'Sending…'; }

    fetch(SITE.FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (!res.ok) throw new Error('Request failed');
      form.reset();
      say('ok', 'Thanks — your request is in. We will call or email you shortly to schedule your free walkthrough.');
    }).catch(function () {
      say('error', 'Something went wrong sending that. Please call ' + SITE.phone + ' and we will take the details over the phone.');
    }).then(function () {
      if (submit) { submit.disabled = false; submit.textContent = submit.dataset.label || 'Send request'; }
    });
  });
})();
