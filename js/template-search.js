document.addEventListener('DOMContentLoaded', function () {
  var input = document.getElementById('templateSearch');
  if (!input) return;

  var countEl = document.getElementById('templateCount');
  var emptyEl = document.getElementById('templateEmpty');
  var tiles = Array.prototype.slice.call(document.querySelectorAll('.grid .tile'));
  var totalTiles = tiles.length;

  function apply() {
    var q = input.value.trim().toLowerCase();
    var visible = 0;

    tiles.forEach(function (tile) {
      var haystack = (tile.textContent + ' ' + (tile.dataset.alias || '')).toLowerCase();
      var match = q === '' || haystack.indexOf(q) !== -1;
      tile.style.display = match ? '' : 'none';
      if (match) visible++;
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
