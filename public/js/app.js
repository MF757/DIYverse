(function () {
  'use strict';

  var listEl = document.getElementById('projects-list');
  var statusEl = document.getElementById('projects-status');
  if (!listEl || !statusEl) return;

  var url = typeof window !== 'undefined' && window.SUPABASE_URL;
  var anonKey = typeof window !== 'undefined' && window.SUPABASE_ANON_KEY;

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function renderProjects(rows) {
    statusEl.remove();
    rows.forEach(function (row) {
      var card = document.createElement('article');
      card.className = 'project-card';
      card.setAttribute('role', 'listitem');
      var title = typeof row.title === 'string' ? row.title : '';
      var owner = typeof row.owner_display_name === 'string' ? row.owner_display_name : 'Unknown';
      var desc = row.description != null && typeof row.description === 'string' ? row.description : '';
      card.innerHTML =
        '<h3 class="project-card__title">' + escapeHtml(title) + '</h3>' +
        '<p class="project-card__meta">By ' + escapeHtml(owner) + '</p>' +
        (desc ? '<p class="project-card__description">' + escapeHtml(desc) + '</p>' : '');
      listEl.appendChild(card);
    });
  }

  function escapeHtml(s) {
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  if (url && anonKey && typeof supabase !== 'undefined' && supabase.createClient) {
    var client = supabase.createClient(url, anonKey);
    client
      .from('projects_public_with_owner')
      .select('id, title, slug, description, owner_display_name')
      .then(function (result) {
        if (result.error) {
          setStatus('Could not load projects. Check the console.');
          console.error(result.error);
          return;
        }
        var data = result.data;
        if (Array.isArray(data) && data.length > 0) {
          renderProjects(data);
        } else {
          setStatus('No public projects yet.');
        }
      })
      .catch(function (err) {
        setStatus('Could not load projects.');
        console.error(err);
      });
  } else {
    setStatus('Set SUPABASE_URL and SUPABASE_ANON_KEY in public/config.js to list projects.');
  }
})();
