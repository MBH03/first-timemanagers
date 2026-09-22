document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.mobile-toggle');
  var links = document.querySelector('.navlinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', function () {
    var isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  document.addEventListener('click', function (e) {
    if (!links.classList.contains('open')) return;
    if (links.contains(e.target) || toggle.contains(e.target)) return;
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  });

  function closeAllDrops() {
    document.querySelectorAll('.nav-drop.open').forEach(function (d) {
      d.classList.remove('open');
      var t = d.querySelector('.nav-drop-trigger');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
  }

  document.querySelectorAll('.nav-drop-trigger').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var drop = btn.closest('.nav-drop');
      var wasOpen = drop.classList.contains('open');
      closeAllDrops();
      if (!wasOpen) {
        drop.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-drop')) closeAllDrops();
  });
});

(function () {
  var s = document.createElement('script');
  s.src = 'js/ted.js';
  s.defer = true;
  document.body.appendChild(s);
})();
