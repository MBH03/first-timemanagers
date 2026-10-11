(function(){
  var BUBBLE_LABEL = "Ask Ted";

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
    bubble.textContent = BUBBLE_LABEL;
    var isArticlePage = !!document.querySelector('main.article');
    var revealed = false;
    var panelOpen = false;

    function show(){
      if(isArticlePage || panelOpen) return;
      bubble.classList.add('show');
    }
    function hide(){
      bubble.classList.remove('show');
    }
    function reveal(){
      if(revealed || isArticlePage) return;
      revealed = true;
      show();
    }

    if(!isArticlePage){
      setTimeout(reveal, 15000);
      var onScroll = function(){
        var max = document.body.scrollHeight - window.innerHeight;
        if(max > 0 && (window.scrollY / max) >= 0.5){
          reveal();
          window.removeEventListener('scroll', onScroll);
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    return {
      show: function(){ panelOpen = false; if(revealed) show(); },
      hide: function(){ panelOpen = true; hide(); }
    };
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

  var STOPWORDS = {
    a:1, an:1, the:1, is:1, are:1, was:1, were:1, be:1, been:1, being:1,
    to:1, of:1, and:1, but:1, my:1, your:1, i:1, this:1, that:1, do:1, does:1, did:1,
    should:1, could:1, would:1, will:1, shall:1,
    how:1, what:1, when:1, where:1, why:1, who:1, which:1
  };

  // Casual/synonym phrasing people actually type -> the word the site's own
  // content uses, so the literal (non-semantic) search engine can find it.
  // Add to this as real search misses turn up — it's a short list on purpose.
  var SYNONYM_PHRASES = [
    [/\bfire(d|ing)?\b/gi, 'terminate'],
    [/\b(getting along|get along)\b/gi, 'gel'],
    [/\b(stealing|steals|steal) credit\b/gi, 'taking credit'],
    [/\blazy\b/gi, 'underperforming'],
    [/\b(yells?|yelling|yelled) at me\b/gi, 'difficult boss'],
    [/\bseverance\b/gi, 'layoff'],
    [/\blet (someone|them) go\b/gi, 'letting someone go']
  ];

  function applySynonyms(query){
    var out = query;
    SYNONYM_PHRASES.forEach(function(pair){
      out = out.replace(pair[0], pair[1]);
    });
    return out;
  }

  function stripStopwords(query){
    var words = applySynonyms(query)
      .split(/\s+/)
      .map(function(w){ return w.replace(/^[^\w]+|[^\w]+$/g, ''); })
      .filter(function(w){
        return w && !STOPWORDS[w.toLowerCase()];
      });
    if(!words.length) return query;
    return words.join(' ');
  }

  function runSearch(query, resultsEl){
    if(!query){
      resultsEl.innerHTML = '';
      return;
    }
    resultsEl.innerHTML = '<div class="ted-empty">Searching…</div>';
    loadPagefind().then(function(pagefind){
      return pagefind.search(stripStopwords(query));
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
