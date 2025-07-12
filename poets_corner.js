const form = document.getElementById('poemForm');
const poemList = document.getElementById('poemList');

// ✅ This must match your server logic
const currentUserId = 'demo_user_123';

// Load all poems from server
fetch('/api/poems')
  .then(res => res.json())
  .then(poems => {
    renderPoems(poems);
  });

form.addEventListener('submit', e => {
  e.preventDefault();
  const text = document.getElementById('poem').value.trim();
  const author = document.getElementById('author').value.trim();

  if (text) {
    fetch('/api/poems', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, author, userId: currentUserId })
    })
    .then(res => res.json())
    .then(() => {
      return fetch('/api/poems')
        .then(res => res.json())
        .then(poems => renderPoems(poems));
    });

    form.reset();
  }
});

function renderPoems(poems) {
  poemList.innerHTML = '';
  poems.slice().reverse().forEach(p => {
    const div = document.createElement('div');
    div.className = 'bg-yellow-100 p-4 rounded-lg shadow mb-4';

    div.innerHTML = `
      <p class="whitespace-pre-line mb-2 text-lg">${p.text}</p>
      <p class="text-right text-sm italic">— ${p.author || 'Anonymous'}</p>
    `;

    if (p.userId === currentUserId) {
      const btn = document.createElement('button');
      btn.textContent = 'Delete';
      btn.className = 'mt-2 text-red-600 underline';
      btn.onclick = () => {
        fetch(`/api/poems/${p._id}`, { method: 'DELETE' })
          .then(() => {
            return fetch('/api/poems')
              .then(res => res.json())
              .then(poems => renderPoems(poems));
          });
      };
      div.appendChild(btn);
    }

    poemList.appendChild(div);
  });
}
