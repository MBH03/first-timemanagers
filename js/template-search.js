document.addEventListener('DOMContentLoaded', function () {
  var input = document.getElementById('templateSearch');
  if (!input) return;

  var countEl = document.getElementById('templateCount');
  var emptyEl = document.getElementById('templateEmpty');
  var tiles = Array.prototype.slice.call(document.querySelectorAll('.grid .tile'));
  var sectionHeads = Array.prototype.slice.call(document.querySelectorAll('.template-section-head'));
  var totalTiles = tiles.length;
  var chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
  var activeFilter = 'All';

  function apply() {
    var q = input.value.trim().toLowerCase();
    var visible = 0;

    tiles.forEach(function (tile) {
      var haystack = (tile.textContent + ' ' + (tile.dataset.alias || '')).toLowerCase();
      var textMatch = q === '' || haystack.indexOf(q) !== -1;
      var tags = (tile.dataset.tags || '').split(' ');
      var tagMatch = activeFilter === 'All' || tags.indexOf(activeFilter) !== -1;
      var match = textMatch && tagMatch;
      tile.style.display = match ? '' : 'none';
      if (match) visible++;
    });

    sectionHeads.forEach(function (head) {
      var grid = head.nextElementSibling;
      if (!grid || !grid.classList.contains('grid')) return;
      var anyVisible = grid.querySelectorAll('.tile:not([style*="display: none"])').length > 0;
      head.style.display = anyVisible ? '' : 'none';
      grid.style.display = anyVisible ? '' : 'none';
    });

    if (countEl) {
      countEl.textContent = q === '' && activeFilter === 'All'
        ? totalTiles + ' templates'
        : visible + (visible === 1 ? ' match' : ' matches');
    }
    if (emptyEl) emptyEl.style.display = visible === 0 ? 'block' : 'none';
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      activeFilter = chip.dataset.filter;
      apply();
    });
  });

  input.addEventListener('input', apply);
  apply();
});
