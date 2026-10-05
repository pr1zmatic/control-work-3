const contentDiv = document.getElementById('app-content');
const homeBtn = document.getElementById('home-btn');
const aboutBtn = document.getElementById('about-btn');
const statusBadge = document.getElementById('status-badge');
const installBtn = document.getElementById('install-btn');

let deferredPrompt = null;

async function loadPage(pageName) {
    try {
        const res = await fetch(`content/${pageName}.html`);
        const html = await res.text();
        contentDiv.innerHTML = html;

        if (pageName === 'home') {
        initNotesLogic();
        }
    } catch (err) {
        console.log('Ошибка загрузки страницы:', err);
        contentDiv.innerHTML = '<p>Ошибка загрузки контента</p>';
    }
}

function setActiveTab(btn) {
    [homeBtn, aboutBtn].forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

homeBtn.addEventListener('click', () => {
    setActiveTab(homeBtn);
    loadPage('home');
});

aboutBtn.addEventListener('click', () => {
    setActiveTab(aboutBtn);
    loadPage('about');
});

function initNotesLogic() {
    const form = document.getElementById('note-form');
    const titleInput = document.getElementById('note-title');
    const textInput = document.getElementById('note-text');
    const listDiv = document.getElementById('notes-list');

    function renderNotes() {
        const notes = JSON.parse(localStorage.getItem('notes_data') || '[]');
        if (!notes.length) {
        listDiv.innerHTML = '<p style="color: #777;">Нет сохраненных заметок</p>';
        return;
        }

        listDiv.innerHTML = notes.map(n => `
        <div class="note-card">
            <div class="note-content">
            <h3>${escapeHtml(n.title)}</h3>
            <p>${escapeHtml(n.text)}</p>
            </div>
            <button class="btn-delete" onclick="removeNote('${n.id}')">Удалить</button>
        </div>
        `).join('');
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = titleInput.value.trim();
        const text = textInput.value.trim();

        if (!title || !text) return;

        const notes = JSON.parse(localStorage.getItem('notes_data') || '[]');
        notes.unshift({ id: Date.now().toString(), title, text });
        localStorage.setItem('notes_data', JSON.stringify(notes));

        titleInput.value = '';
        textInput.value = '';
        renderNotes();
    });

    window.removeNote = function(id) {
        let notes = JSON.parse(localStorage.getItem('notes_data') || '[]');
        notes = notes.filter(n => n.id !== id);
        localStorage.setItem('notes_data', JSON.stringify(notes));
        renderNotes();
    };

    renderNotes();
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function updateStatus() {
    if (navigator.onLine) {
        statusBadge.textContent = 'Онлайн';
        statusBadge.className = 'badge online';
    } else {
        statusBadge.textContent = 'Офлайн';
        statusBadge.className = 'badge offline';
    }
}

window.addEventListener('online', updateStatus);
window.addEventListener('offline', updateStatus);
updateStatus();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('SW зарегистрирован:', reg.scope))
        .catch(err => console.log('Ошибка регистрации SW:', err));
    });
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'block';
});

installBtn.addEventListener('click', () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt = null;
        installBtn.style.display = 'none';
    }
});

loadPage('home');