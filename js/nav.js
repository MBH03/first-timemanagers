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
});

(function () {
  var s = document.createElement('script');
  s.src = 'js/ted.js';
  s.defer = true;
  document.body.appendChild(s);
})();
