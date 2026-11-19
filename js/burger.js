(function () {
  var header = document.getElementById('page-header');
  var btn = document.querySelector('.h-burger');
  var nav = document.getElementById('h-nav-mobile');
  if (!header || !btn || !nav) return;

  function setOpen(open) {
    header.classList.toggle('is-menu-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  btn.addEventListener('click', function () {
    setOpen(btn.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });
  window.matchMedia('(min-width: 60em)').addEventListener('change', function (e) {
    if (e.matches) setOpen(false);
  });
})();
