/* StudentBot – panneau d'administration. Ouvrir index.html#admin pour afficher le bouton ⚙️ Admin. */
(function () {
  const $ = id => document.getElementById(id);
  const KEY = 'studentbot_screens_v2';
  const PH = '<span class="ph">[à remplir]</span>';
  const NOTE = '<small>ℹ️ Confirme toujours auprès de l\'administration.</small>';
  const ORIG_SUB = $('sub').textContent;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fr = d => d.split('-').reverse().join('/');
  const iso = t => { const m = /^(\d\d)\/(\d\d)\/(\d{4})$/.exec(t.trim()); return m ? m[3] + '-' + m[2] + '-' + m[1] : ''; };
  const msgOf = id => $(id).querySelector('.msg');
  const say = t => { $('amsg').textContent = t; };
  const subjects = () => [...$('mod').querySelectorAll('nav button')].map(b => ({ id: b.dataset.go, name: b.textContent.trim() }));
  const subOpts = sel => subjects().map(s => `<option ${s.name === sel ? 'selected' : ''}>${esc(s.name)}</option>`).join('');

  // restaurer les modifications faites sur cet appareil (avant que le bot ne démarre)
  try { const s = localStorage.getItem(KEY); if (s) { $('screens').innerHTML = s; $('sub').textContent = '⚠️ Modifications locales actives'; } } catch (e) {}

  function persist() {
    try { localStorage.setItem(KEY, $('screens').innerHTML); say('✅ Enregistré sur cet appareil. Télécharge index.html pour le garder dans le projet.'); }
    catch (e) { say('Modifié dans la page, mais impossible de garder sur cet appareil.'); }
    renderAll();
  }

  /* --- deadlines --- */
  const dlRow = (s = '', w = '', d = '') => `<div class="rw"><select>${subOpts(s)}</select><input placeholder="Titre (ex : Rendu TP 1)" value="${esc(w)}"><input type="date" value="${esc(d)}"><button class="nav" data-rm>✕</button></div>`;
  const renderDL = () => { $('adl').innerHTML = [...msgOf('dl').querySelectorAll('p[data-d]')].map(p => dlRow(p.dataset.s, p.dataset.w, p.dataset.d)).join(''); };
  $('adl-add').onclick = () => $('adl').insertAdjacentHTML('beforeend', dlRow());
  $('adl-save').onclick = () => {
    const rows = [...$('adl').querySelectorAll('.rw')].map(r => {
      const i = r.querySelectorAll('input');
      return { s: r.querySelector('select').value, w: i[0].value.trim(), d: i[1].value };
    }).filter(x => x.d).sort((a, b) => a.d < b.d ? -1 : 1);
    const m = msgOf('dl'), note = m.querySelector('small');
    m.innerHTML = '<b>Prochaines échéances</b><br>' + (rows.map(x => `<p data-s="${esc(x.s)}" data-w="${esc(x.w)}" data-d="${x.d}">${esc(x.s)} – ${esc(x.w)}<br>${fr(x.d)}<span class="tag" data-date="${x.d}"></span></p>`).join('') || PH) + (note ? note.outerHTML : '');
    persist();
  };

  /* --- examens --- */
  const renderEX = () => {
    const cur = {};
    msgOf('exa').querySelectorAll('tr').forEach(tr => { const td = tr.querySelectorAll('td'); if (td.length) cur[td[0].textContent.trim()] = iso(td[1].textContent); });
    $('aex').innerHTML = subjects().map(s => `<div class="rw"><span>${esc(s.name)}</span><input type="date" data-s="${esc(s.name)}" value="${cur[s.name] || ''}"></div>`).join('');
  };
  $('aex-save').onclick = () => {
    const val = {}; $('aex').querySelectorAll('input').forEach(i => val[i.dataset.s] = i.value);
    msgOf('exa').querySelectorAll('tr').forEach(tr => { const td = tr.querySelectorAll('td'); if (td.length) td[1].textContent = val[td[0].textContent.trim()] ? fr(val[td[0].textContent.trim()]) : 'à confirmer'; });
    persist();
  };

  /* --- photo codes Classroom --- */
  const renderCO = () => {
    const sec = $('classroom_codes');
    const img = sec ? sec.querySelector('img') : null;
    const prev = $('aco-preview');
    if (prev && img) {
      prev.innerHTML = `<div style="display:flex;align-items:center;gap:10px;"><img src="${img.src}" style="max-height:80px;border-radius:6px;border:1px solid var(--line);"><small class="hint">Photo actuelle</small></div>`;
    }
  };
  $('aco-btn').onclick = () => { $('aco-file').click(); };
  $('aco-file').onchange = e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target.result;
      const sec = $('classroom_codes');
      if (sec) {
        const img = sec.querySelector('img');
        if (img) img.src = dataUrl;
        const link = sec.querySelector('.img-actions a');
        if (link) link.href = dataUrl;
      }
      persist();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  /* --- avancement --- */
  const renderPR = () => { $('apr').innerHTML = subjects().map(s => { const m = /(\d+) chapitres sur (\d+)/.exec(msgOf(s.id + 'p').textContent) || ['', '', '']; return `<div class="rw"><span>${esc(s.name)}</span><input type="number" min="0" data-id="${s.id}" data-n="${esc(s.name)}" data-k="d" value="${m[1]}" placeholder="faits"><input type="number" min="0" data-id="${s.id}" data-k="t" value="${m[2]}" placeholder="total"></div>`; }).join(''); };
  $('apr-save').onclick = () => {
    subjects().forEach(s => {
      const d = +$('apr').querySelector(`[data-id="${s.id}"][data-k="d"]`).value, t = +$('apr').querySelector(`[data-id="${s.id}"][data-k="t"]`).value;
      msgOf(s.id + 'p').innerHTML = t > 0 ? `<b>${esc(s.name)}</b> : ${d} chapitres sur ${t}<div class="bar"><i style="width:${Math.min(100, Math.round(100 * d / t))}%"></i></div><small>Mis à jour par le délégué.</small>` : `<b>${esc(s.name)}</b> : avancement non renseigné pour le moment.`;
    });
    persist();
  };

  /* --- ajouter / supprimer FAQ, démarches, contacts --- */
  const PAR = { faq: 'f', proc: 'p', ct: 'o' };
  $('add-btn').onclick = () => {
    const par = $('add-par').value, t = $('add-title').value.trim(), b = $('add-body').value.trim();
    if (!t) { say('Le titre est obligatoire.'); return; }
    const id = PAR[par] + 'n' + Date.now().toString(36);
    const sec = document.createElement('section'); sec.id = id;
    sec.innerHTML = `<div class="msg"><b>${esc(t)}</b><br>${esc(b).replace(/\n/g, '<br>')}${NOTE}</div><nav></nav>`;
    $('screens').appendChild(sec);
    const btn = document.createElement('button'); btn.dataset.go = id; btn.textContent = t;
    $(par).querySelector('nav').appendChild(btn);
    $('add-title').value = ''; $('add-body').value = '';
    persist();
  };
  const renderDEL = () => { $('adel').innerHTML = Object.keys(PAR).map(p => [...$(p).querySelectorAll('nav button')].map(b => `<div class="rw"><span>${esc(b.textContent)}</span><button class="nav" data-del="${b.dataset.go}" data-par="${p}">Suppr.</button></div>`).join('')).join(''); };

  /* --- modifier un écran --- */
  const renderSED = () => {
    const cur = $('ased').value;
    $('ased').innerHTML = [...$('screens').querySelectorAll('section')].map(s => `<option value="${s.id}">${s.id} – ${esc(s.querySelector('.msg').textContent.trim().slice(0, 45))}</option>`).join('');
    if (cur && $(cur)) $('ased').value = cur;
    $('ahtml').value = msgOf($('ased').value).innerHTML;
  };
  $('ased').onchange = () => { $('ahtml').value = msgOf($('ased').value).innerHTML; };
  $('ased-save').onclick = () => { msgOf($('ased').value).innerHTML = $('ahtml').value; persist(); };

  /* --- export / reset --- */
  function buildExport() {
    const c = document.documentElement.cloneNode(true);
    c.querySelector('#chat').innerHTML = ''; c.querySelector('#opts div').innerHTML = '';
    ['adl', 'aex', 'apr', 'adel', 'amsg', 'ased', 'ahtml', 'aco-preview'].forEach(i => { const el = c.querySelector('#' + i); if (el) el.textContent = ''; });
    c.querySelector('#admin').setAttribute('hidden', '');
    c.querySelector('#sub').textContent = ORIG_SUB;
    return '<!DOCTYPE html>\n' + c.outerHTML;
  }
  $('aexp').onclick = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([buildExport()], { type: 'text/html' }));
    a.download = 'index.html'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  $('areset').onclick = () => { if (confirm('Effacer toutes les modifications faites sur cet appareil ?')) { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); } };

  /* --- clics génériques et ouverture --- */
  $('admin').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if ('rm' in b.dataset) b.closest('.rw').remove();
    if (b.dataset.del && confirm('Supprimer cette entrée ?')) {
      $(b.dataset.par).querySelector(`nav button[data-go="${b.dataset.del}"]`).remove();
      const s = $(b.dataset.del); if (s) s.remove();
      persist();
    }
  });
  function renderAll() { renderDL(); renderEX(); renderCO(); renderPR(); renderDEL(); renderSED(); }
  $('abtn').onclick = () => {
    const pwd = prompt('Mot de passe administrateur :');
    if (pwd === null) return;
    if (pwd === 'isikef2027') {
      renderAll();
      $('admin').hidden = false;
    } else {
      alert('Mot de passe incorrect.');
    }
  };
  $('aclose').onclick = () => { $('admin').hidden = true; };
  // Le bouton est toujours visible par défaut ; suppression du filtre #admin
  $('abtn').hidden = false;
})();
