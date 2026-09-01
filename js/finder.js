document.addEventListener('DOMContentLoaded', function () {
  var input = document.getElementById('finderSearch');
  var rows = Array.prototype.slice.call(document.querySelectorAll('.topic-row'));
  var groups = Array.prototype.slice.call(document.querySelectorAll('.topic-group'));
  var countEl = document.getElementById('finderCount');
  var emptyEl = document.getElementById('finderEmpty');
  if (!input) return;

  function apply() {
    var q = input.value.trim().toLowerCase();
    var visible = 0;
    rows.forEach(function (row) {
      var haystack = row.textContent.toLowerCase();
      var match = q === '' || haystack.indexOf(q) !== -1;
      row.style.display = match ? '' : 'none';
      if (match) visible++;
    });
    groups.forEach(function (group) {
      var anyVisible = group.querySelectorAll('.topic-row:not([style*="display: none"])').length > 0;
      group.style.display = anyVisible ? '' : 'none';
    });
    if (countEl) countEl.textContent = visible + (visible === 1 ? ' topic' : ' topics');
    if (emptyEl) emptyEl.style.display = visible === 0 ? 'block' : 'none';
  }

  input.addEventListener('input', apply);
  apply();
});
