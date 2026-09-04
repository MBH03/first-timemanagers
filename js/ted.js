(function(){
  var PHRASES = [
    "Need help?",
    "Not sure what to do?",
    "Feeling stuck?",
    "Need a second opinion?",
    "Not sure where to start?",
    "Have a tough conversation coming up?",
    "Need help figuring it out?",
    "Lost?"
  ];

  var pagefindPromise = null;
  function loadPagefind(){
    if(!pagefindPromise){
      pagefindPromise = import('/pagefind/pagefind.js').then(function(mod){
        return mod.init().then(function(){ return mod; });
      });
    }
    return pagefindPromise;
  }

  function buildMarkup(){
    var orb = document.createElement('button');
    orb.className = 'ted-orb';
    orb.type = 'button';
    orb.setAttribute('aria-label', 'Search the site');
    orb.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><circle cx="12" cy="12" r="2.2"/></svg>';

    var bubble = document.createElement('div');
    bubble.className = 'ted-bubble';

    var panel = document.createElement('div');
    panel.className = 'ted-panel';
    panel.innerHTML =
      '<div class="ted-panel-header">' +
        '<div>' +
          '<div class="ted-panel-title">Hey, I\'m Ted.</div>' +
          '<div class="ted-panel-tagline">Be curious, not judgmental.</div>' +
        '</div>' +
        '<button type="button" class="ted-close" aria-label="Close">&times;</button>' +
      '</div>' +
      '<input type="text" class="ted-search-input" placeholder="Ask Ted anything" autocomplete="off">' +
      '<div class="ted-chips">' +
        '<button type="button" class="ted-chip">giving feedback</button>' +
        '<button type="button" class="ted-chip">difficult conversation</button>' +
        '<button type="button" class="ted-chip">first 90 days</button>' +
        '<button type="button" class="ted-chip">templates</button>' +
      '</div>' +
      '<div class="ted-results"></div>';

    document.body.appendChild(bubble);
    document.body.appendChild(panel);
    document.body.appendChild(orb);
    return { orb: orb, bubble: bubble, panel: panel };
  }

  function setupBubble(bubble){
    var i = 0;
    function render(){ bubble.textContent = PHRASES[i]; }
    render();
    function show(){ bubble.classList.add('show'); }
    function hide(){ bubble.classList.remove('show'); }
    show();
    setInterval(function(){
      hide();
      setTimeout(function(){
        i = (i + 1) % PHRASES.length;
        render();
        show();
      }, 400);
    }, 4500);
    return { show: show, hide: hide };
  }

  function debounce(fn, ms){
    var t;
    return function(){
      var args = arguments;
      clearTimeout(t);
      t = setTimeout(function(){ fn.apply(null, args); }, ms);
    };
  }

  function escapeHtml(str){
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function runSearch(query, resultsEl){
    if(!query){
      resultsEl.innerHTML = '';
      return;
    }
    resultsEl.innerHTML = '<div class="ted-empty">Searching…</div>';
    loadPagefind().then(function(pagefind){
      return pagefind.search(query);
    }).then(function(search){
      if(!search.results.length){
        resultsEl.innerHTML = '<div class="ted-no-results">Nothing landed on that one. Try a different word or two.</div>';
        return null;
      }
      return Promise.all(search.results.slice(0, 6).map(function(r){ return r.data(); }));
    }).then(function(items){
      if(!items) return;
      resultsEl.innerHTML = items.map(function(item){
        var title = (item.meta && item.meta.title) ? item.meta.title.split(' | ')[0] : item.url;
        return '<a class="ted-result" href="' + item.url + '">' +
          '<div class="ted-result-title">' + escapeHtml(title) + '</div>' +
          '<div class="ted-result-excerpt">' + item.excerpt + '</div>' +
        '</a>';
      }).join('');
    }).catch(function(){
      resultsEl.innerHTML = '<div class="ted-no-results">Search is still waking up, give it another second.</div>';
    });
  }

  function init(){
    var built = buildMarkup();
    var orb = built.orb, bubble = built.bubble, panel = built.panel;
    var bubbleCtl = setupBubble(bubble);

    var closeBtn = panel.querySelector('.ted-close');
    var input = panel.querySelector('.ted-search-input');
    var resultsEl = panel.querySelector('.ted-results');
    var chips = panel.querySelectorAll('.ted-chip');

    function openPanel(){
      panel.classList.add('open');
      bubbleCtl.hide();
      loadPagefind();
      setTimeout(function(){ input.focus(); }, 150);
    }
    function closePanel(){
      panel.classList.remove('open');
      bubbleCtl.show();
    }

    orb.addEventListener('click', function(){
      if(panel.classList.contains('open')){ closePanel(); } else { openPanel(); }
    });
    closeBtn.addEventListener('click', closePanel);

    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape') closePanel();
    });
    document.addEventListener('click', function(e){
      if(!panel.classList.contains('open')) return;
      if(panel.contains(e.target) || orb.contains(e.target)) return;
      closePanel();
    });

    var doSearch = debounce(function(){ runSearch(input.value.trim(), resultsEl); }, 300);
    input.addEventListener('input', doSearch);

    chips.forEach(function(chip){
      chip.addEventListener('click', function(){
        input.value = chip.textContent;
        runSearch(chip.textContent, resultsEl);
      });
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
