document.addEventListener('DOMContentLoaded', function () {
  var input = document.getElementById('templateSearch');
  if (!input) return;

  var countEl = document.getElementById('templateCount');
  var emptyEl = document.getElementById('templateEmpty');
  var sections = Array.prototype.slice.call(document.querySelectorAll('.section-div'));
  var pairs = sections.map(function (section) {
    return { section: section, grid: section.nextElementSibling };
  }).filter(function (p) { return p.grid && p.grid.classList.contains('grid'); });

  var totalTiles = document.querySelectorAll('.grid .tile').length;

  function apply() {
    var q = input.value.trim().toLowerCase();
    var visible = 0;

    pairs.forEach(function (pair) {
      var tiles = Array.prototype.slice.call(pair.grid.querySelectorAll('.tile'));
      var anyVisible = false;
      tiles.forEach(function (tile) {
        var haystack = (tile.textContent + ' ' + (tile.dataset.alias || '')).toLowerCase();
        var match = q === '' || haystack.indexOf(q) !== -1;
        tile.style.display = match ? '' : 'none';
        if (match) { anyVisible = true; visible++; }
      });
      pair.section.style.display = anyVisible ? '' : 'none';
      pair.grid.style.display = anyVisible ? '' : 'none';
    });

    if (countEl) {
      countEl.textContent = q === ''
        ? totalTiles + ' templates'
        : visible + (visible === 1 ? ' match' : ' matches');
    }
    if (emptyEl) emptyEl.style.display = visible === 0 ? 'block' : 'none';
  }

  input.addEventListener('input', apply);
  apply();
});
