/* StudentBot – interactions uniquement. Le contenu est dans index.html (#screens). */
const chat = document.getElementById('chat');
const opts = document.querySelector('#opts div');
let stack = [];

function bubble(html, cls) {
  const d = document.createElement('div');
  d.className = 'b ' + cls;
  d.innerHTML = html;
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
  return d;
}

function addButton(label, cls, onClick) {
  const b = document.createElement('button');
  b.textContent = label;
  if (cls) b.className = cls;
  b.onclick = onClick;
  opts.appendChild(b);
  return b;
}

function show(id) {
  const screen = document.getElementById(id);
  stack.push(id);
  const d = bubble(screen.querySelector('.msg').innerHTML, 'bot');

  // étiquettes "dans X j" des deadlines
  d.querySelectorAll('[data-date]').forEach(t => {
    const n = Math.ceil((new Date(t.dataset.date + 'T23:59:59') - Date.now()) / 864e5);
    t.textContent = n < 0 ? 'passé' : n === 0 ? "aujourd'hui" : n === 1 ? 'demain' : 'dans ' + n + ' j';
    if (n >= 0 && n <= 3) t.classList.add('hot');
  });

  // formulaire "question introuvable"
  const send = d.querySelector('.qs');
  if (send) send.onclick = () => {
    const box = d.querySelector('.qt');
    if (!box.value.trim()) return;
    bubble('Merci ! Ta question est enregistrée. Dans la version finale, elle sera envoyée à l\'équipe via le back-end.', 'bot');
    box.value = '';
  };

  // boutons du menu
  opts.innerHTML = '';
  const navBtns = screen.querySelectorAll('nav button');
  let btnIndex = 0;
  navBtns.forEach(src => {
    const b = addButton(src.textContent, '', () => {
      bubble(src.textContent, 'u');
      show(src.dataset.go);
    });
    b.style.animationDelay = (btnIndex++ * 0.035) + 's';
  });
  if (stack.length > 1) {
    const b = addButton('↩ Retour', 'nav', () => {
      bubble('↩ Retour', 'u');
      stack.pop();
      show(stack.pop());
    });
    b.style.animationDelay = (btnIndex++ * 0.035) + 's';
  }
  if (id !== 'home') {
    const b = addButton('🏠 Menu principal', 'nav', () => {
      bubble('🏠 Menu principal', 'u');
      stack = [];
      show('home');
    });
    b.style.animationDelay = (btnIndex++ * 0.035) + 's';
  }
  if (id === 'mod') {
    const b = addButton('🔑 Codes Classroom', 'code-btn', () => {
      bubble('🔑 Codes Classroom', 'u');
      show('classroom_codes');
    });
    b.style.animationDelay = (btnIndex++ * 0.035) + 's';
  }
  const clr = addButton('🗑️ Effacer l\'historique', 'nav', () => {
    chat.innerHTML = '';
    stack = [];
    show('home');
  });
  clr.style.animationDelay = (btnIndex * 0.035) + 's';
}

show('home');

// Agrandissement des photos d'emplois du temps (lightbox)
document.addEventListener('click', e => {
  const img = e.target.closest('.schedule-img');
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  if (img && lb && lbImg) {
    lbImg.src = img.src;
    lb.hidden = false;
    return;
  }
  if (e.target.closest('#lb-close') || (lb && !lb.hidden && (e.target === lb || e.target === lbImg))) {
    if (lb) lb.hidden = true;
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const lb = document.getElementById('lightbox');
    if (lb && !lb.hidden) lb.hidden = true;
  }
});
