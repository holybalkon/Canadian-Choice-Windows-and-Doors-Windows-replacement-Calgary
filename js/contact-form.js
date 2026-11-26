(function () {
  'use strict';

  var modal = document.getElementById('cf-modal');
  var panel = modal ? modal.querySelector('.cf-modal__panel') : null;
  var lastFocus = null;

  function openModal(e) {
    if (e) e.preventDefault();
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.documentElement.classList.add('cf-lock');
    panel.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.documentElement.classList.remove('cf-lock');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  if (modal) {
    // All "FREE consultation" buttons open the modal (href="tel:" stays as a no-JS fallback)
    document.querySelectorAll('a.btn[href^="tel:"]').forEach(function (a) {
      if (/free\s+consultation/i.test(a.textContent)) {
        a.addEventListener('click', openModal);
      }
    });
    modal.addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-cf-close')) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
    });
  }

  // ---- Draft persistence (survives reload; shared by all forms on the page) ----
  var DRAFT_KEY = 'cf-draft';
  var FIELDS = ['name', 'phone', 'email', 'postal_code', 'windows_count', 'message'];

  function readDraft() {
    try { return JSON.parse(sessionStorage.getItem(DRAFT_KEY)) || {}; } catch (e) { return {}; }
  }
  function writeDraft(d) {
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch (e) { /* storage unavailable */ }
  }
  function clearDraft() {
    try { sessionStorage.removeItem(DRAFT_KEY); } catch (e) { /* ignore */ }
  }
  function field(form, name) { return form.querySelector('[name="' + name + '"]'); }

  function restoreDraft(form) {
    var d = readDraft();
    FIELDS.forEach(function (n) {
      var el = field(form, n);
      if (el && d[n]) el.value = d[n];
    });
  }

  function syncDraft(sourceForm) {
    var d = readDraft();
    FIELDS.forEach(function (n) {
      var el = field(sourceForm, n);
      if (el) d[n] = el.value;
    });
    writeDraft(d);
    // mirror into the other forms on the page
    document.querySelectorAll('form.cf-form').forEach(function (f) {
      if (f === sourceForm) return;
      FIELDS.forEach(function (n) {
        var el = field(f, n);
        if (el) el.value = d[n] || '';
      });
    });
  }

  function initForm(form) {
    restoreDraft(form);
    form.addEventListener('input', function () { syncDraft(form); });

    var status = form.querySelector('.cf-status');
    var postal = form.querySelector('[name="postal_code"]');

    function setStatus(text, type) {
      status.textContent = text;
      status.className = 'cf-status' + (type ? ' cf-status--' + type : '');
    }

    // Postal code: uppercase, "A1A 1A1" format
    postal.addEventListener('input', function () {
      var v = postal.value.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 6);
      postal.value = v.length > 3 ? v.slice(0, 3) + ' ' + v.slice(3) : v;
    });

    function validate() {
      var ok = true;
      form.querySelectorAll('[required]').forEach(function (el) {
        var bad = !el.value.trim() || (el.type === 'email' && !el.checkValidity());
        if (el.name === 'phone' && el.value.replace(/\D/g, '').length < 10) bad = true;
        if (el.name === 'postal_code' && el.value.replace(/\s/g, '').length < 6) bad = true;
        if (el.name === 'windows_count' && !/[1-9]/.test(el.value)) bad = true;
        el.classList.toggle('cf-invalid', bad);
        el.setAttribute('aria-invalid', bad ? 'true' : 'false');
        if (bad) ok = false;
      });
      return ok;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) {
        setStatus('Please fill in all required fields correctly (only "Describe your needs" is optional).', 'error');
        return;
      }

      setStatus('', '');
      // Sending is not connected yet.
    });
  }

  document.querySelectorAll('form.cf-form').forEach(initForm);
})();

// Hide the sticky bottom CTA while the inline form section is on screen
(function () {
  var bar = document.getElementById('footer-cta');
  var section = document.getElementById('request-quote');
  if (!bar || !section || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { bar.classList.toggle('is-form-open', e.isIntersecting); });
  }).observe(section);
})();
