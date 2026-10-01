/* Nations Maintenance — site behaviour. No dependencies. */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     Site config — this is the only place you need to edit.

     FORM_ENDPOINT: where the quote and information form posts. It is set to
     /send.php — a handler on this same domain that emails the enquiry to
     RECIPIENT below. Because it is same-origin, the Content Security Policy
     needs no change. If the handler cannot run (a static host like GitHub
     Pages cannot execute PHP, or the mailbox is down), the form falls back to
     opening the visitor's own mail client addressed to the same inbox, so an
     enquiry is never silently lost. To use a third-party service instead,
     paste its URL here AND add its host to connect-src in both `_headers` and
     `.htaccess`.

     email: the address enquiries go to. It is also published as a mailto link
     in the footer and on the contact page.

     SOCIALS: paste the full profile URL for each platform you actually
     have. Every platform keeps its place in the footer either way: one with a URL
     becomes a real link, one without it shows greyed out and labelled "profile
     coming soon". It is not a link in that state, so nothing on the site can
     send a visitor to a dead end or a wrong company's page.

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
    email: 'jordon@nationsmaintenance.com',
    FORM_ENDPOINT: '/send.php'
  };

  /* Social profiles, in footer order. Paste the full URL — e.g.
     'https://www.facebook.com/nationsmaintenance' — and that icon starts
     linking immediately; no other file needs touching. Anything left empty
     stays visible but inert. Set SHOW_PENDING_SOCIALS to false to hide the
     ones with no URL instead. */
  var SHOW_PENDING_SOCIALS = true;

  var SOCIALS = [
    { id: 'facebook',  label: 'Facebook',  url: '' },
    { id: 'instagram', label: 'Instagram', url: '' },
    { id: 'google',    label: 'Google',    url: '' },
    { id: 'youtube',   label: 'YouTube',   url: '' },
    { id: 'linkedin',  label: 'LinkedIn',  url: '' },
    { id: 'x',         label: 'X',         url: '' },
    { id: 'tiktok',    label: 'TikTok',    url: '' }
  ];

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
  /* Each icon carries its own SVG presentation attributes, so Google can be the
     real four-colour G (filled paths) and Instagram can keep its gradient,
     while the rest are stroked in the platform's brand colour (set in the
     stylesheet via .social [data-social="…"]). */
  var STROKED = 'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"';

  var SOCIAL_ICONS = {
    facebook: {
      label: 'Facebook',
      attrs: STROKED,
      inner: '<path d="M15 4h-2.3A3.2 3.2 0 0 0 9.5 7.2V10H7.4v2.9h2.1V21h2.9v-8.1h2.3l.5-2.9h-2.8V7.6c0-.4.3-.7.7-.7H15z"/>'
    },
    instagram: {
      label: 'Instagram',
      attrs: 'fill="none" stroke="url(#igGradient)" stroke-width="1.7" stroke-linejoin="round"',
      defs: '<defs><linearGradient id="igGradient" x1="0" y1="1" x2="1" y2="0">' +
            '<stop offset="0" stop-color="#FEDA75"/><stop offset=".28" stop-color="#FA7E1E"/>' +
            '<stop offset=".52" stop-color="#D62976"/><stop offset=".76" stop-color="#962FBF"/>' +
            '<stop offset="1" stop-color="#4F5BD5"/></linearGradient></defs>',
      inner: '<rect x="3.5" y="3.5" width="17" height="17" rx="4.6"/><circle cx="12" cy="12" r="4"/>' +
             '<circle cx="16.9" cy="7.1" r="1.1" fill="#D62976" stroke="none"/>'
    },
    google: {
      label: 'Google',
      attrs: 'fill="none" stroke="none"',
      inner:
        '<path fill="#4285F4" d="M21.6 12.23c0-.7-.06-1.37-.18-2.02H12v3.82h5.4a4.62 4.62 0 0 1-2 3.03v2.52h3.24c1.9-1.74 2.96-4.3 2.96-7.35z"/>' +
        '<path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.23-2.52c-.9.6-2.05.96-3.39.96-2.6 0-4.8-1.76-5.6-4.13H3.07v2.6A10 10 0 0 0 12 22z"/>' +
        '<path fill="#FBBC05" d="M6.4 13.89a6 6 0 0 1 0-3.83v-2.6H3.07a10 10 0 0 0 0 9.03l3.33-2.6z"/>' +
        '<path fill="#EA4335" d="M12 5.99c1.47 0 2.79.5 3.83 1.5l2.87-2.87C16.95 2.98 14.7 2 12 2A10 10 0 0 0 3.07 7.46l3.33 2.6C7.2 7.7 9.4 5.99 12 5.99z"/>'
    },
    youtube: {
      label: 'YouTube',
      attrs: STROKED,
      inner: '<rect x="2.6" y="5.6" width="18.8" height="12.8" rx="4"/><path d="M10.4 9.6l4.2 2.4-4.2 2.4z"/>'
    },
    linkedin: {
      label: 'LinkedIn',
      attrs: STROKED,
      inner: '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M8 10.6V16.2M8 7.7v.1M12 16.2v-3.3a2 2 0 0 1 4 0v3.3"/>'
    },
    x: {
      label: 'X',
      attrs: 'fill="currentColor" stroke="none"',
      inner: '<path d="M4.4 4h3.5l4.2 5.6L16.8 4h2.8l-6.2 7.6L20 20h-3.5l-4.4-5.9L7.2 20H4.4l6.5-7.9z"/>'
    },
    tiktok: {
      label: 'TikTok',
      attrs: 'fill="currentColor" stroke="none"',
      inner: '<path d="M14.6 4c.4 2 1.7 3.3 3.7 3.5v2.6c-1.4 0-2.6-.4-3.7-1.2v5.5a5.4 5.4 0 1 1-5.4-5.4c.3 0 .6 0 .9.1v2.7a2.7 2.7 0 1 0 1.9 2.6V4z"/>'
    }
  };

  var socialMount = doc.querySelector('.footer-badges') || doc.querySelector('.site-footer .brand');
  if (socialMount) {
    var socialRow = doc.createElement('div');
    socialRow.className = 'social social--light';
    SOCIALS.forEach(function (profile) {
      var icon = SOCIAL_ICONS[profile.id];
      if (!icon) return;
      var svg = '<svg viewBox="0 0 24 24" aria-hidden="true" ' + icon.attrs + '>' +
        (icon.defs || '') + icon.inner + '</svg>';

      if (profile.url) {
        var link = doc.createElement('a');
        link.href = profile.url;
        link.target = '_blank';
        link.rel = 'noopener';
        link.title = icon.label;
        link.setAttribute('data-social', profile.id);
        link.setAttribute('aria-label', 'Nations Maintenance on ' + icon.label);
        link.innerHTML = svg;
        socialRow.appendChild(link);
      } else if (SHOW_PENDING_SOCIALS) {
        /* Visible but inert. Nothing permanent is printed on the page — the
           "Coming soon" tip is revealed by the stylesheet on hover, and by the
           tap handler below on touch. A visually-hidden note keeps it clear to
           a screen reader either way. */
        var pending = doc.createElement('span');
        pending.className = 'social__pending';
        pending.setAttribute('data-social', profile.id);
        pending.setAttribute('data-tip', 'Coming soon');
        pending.innerHTML = svg +
          '<span class="visually-hidden">' + icon.label + ' — profile coming soon</span>';
        socialRow.appendChild(pending);
      }
    });
    if (socialRow.children.length) {
      socialMount.parentNode.insertBefore(socialRow, socialMount.nextSibling);
    }
  }

  /* ---------- "coming soon" tip on tap ---------- */
  /* A phone has no hover, so a tap reveals the tip the stylesheet shows on
     :hover. It clears itself after a moment, or when you tap somewhere else. */
  var pendingIcons = doc.querySelectorAll('.social__pending');
  if (pendingIcons.length) {
    var tipTimer = null;
    var clearTips = function () {
      Array.prototype.forEach.call(pendingIcons, function (el) {
        el.classList.remove('is-tipped');
      });
    };
    Array.prototype.forEach.call(pendingIcons, function (el) {
      el.addEventListener('click', function () {
        var wasShown = el.classList.contains('is-tipped');
        clearTips();
        window.clearTimeout(tipTimer);
        if (!wasShown) {
          el.classList.add('is-tipped');
          tipTimer = window.setTimeout(clearTips, 2600);
        }
      });
    });
    doc.addEventListener('click', function (e) {
      if (!e.target.closest('.social__pending')) {
        window.clearTimeout(tipTimer);
        clearTips();
      }
    });
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

  /* ---------- mobile action bar ---------- */
  /* On a phone the hero already shows its own primary button, so repeating the
     same call to action in the fixed bar put two identical orange buttons on
     screen at once. The bar's non-phone action stays hidden until the hero's
     buttons have scrolled out of view, so there is only ever one in front of
     the visitor. */
  var barAction = doc.querySelector('.action-bar a:not([href^="tel:"])');
  var heroCtas = doc.querySelector('.hero__ctas');
  if (barAction && heroCtas && 'IntersectionObserver' in window) {
    barAction.hidden = true;
    new IntersectionObserver(function (entries) {
      barAction.hidden = entries[entries.length - 1].isIntersecting;
    }, { threshold: 0 }).observe(heroCtas);
  }

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
      say('error', 'The form is not connected yet. Please call ' + SITE.phone + ' or email ' + SITE.email + '.');
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
      /* The enquiry is in the inbox: acknowledge it here and promise the reply
         window. Nothing is handed off to the visitor's own mail app. */
      say('ok', 'Request sent — thank you. We reply to every request within 24 hours, usually much sooner.');
    }).catch(function () {
      /* Deliberately no mail-client hand-off: if the handler could not be
         reached the visitor needs a route that still works, so give them the
         phone number and address to use directly. */
      say('error', 'We could not send that just now. Please call ' + SITE.phone + ' or email ' + SITE.email + ' and we will take the details directly.');
    }).then(function () {
      if (submit) { submit.disabled = false; submit.textContent = submit.dataset.label || 'Send request'; }
    });
  });
})();
