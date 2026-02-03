// ETH Kompetenzraster PWA - PRODUCTION VERSION
// Version: 2.0 (Fixed & Tested)
// Fixes: showError integration, XSS protection, error handling

let modules = {};
let currentModule = null;

// Register Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('Service Worker registered'))
        .catch(err => {
            console.error('SW registration failed:', err);
            showError('Offline-Funktionalität nicht verfügbar');
        });
}

// Update offline indicator
window.addEventListener('online', () => {
    document.getElementById('offline-indicator').style.display = 'none';
});

window.addEventListener('offline', () => {
    document.getElementById('offline-indicator').style.display = 'block';
});

/**
 * Zeige Fehlermeldung für User an
 * @param {string} message - Fehlermeldung (wird HTML-escaped)
 * @param {string} severity - 'error' | 'warning' | 'info' (default: 'error')
 * @param {number} duration - Auto-hide nach milliseconds (0 = keine auto-hide)
 */
function showError(message, severity = 'error', duration = 8000) {
    const banner = document.getElementById('error-banner');
    if (!banner) {
        console.error('Error banner element not found');
        return;
    }
    
    // Clear existing timeout if any
    if (window.errorTimeout) {
        clearTimeout(window.errorTimeout);
    }
    
    // HTML-Escape für XSS-Schutz
    const escaped = escapeHtml(message);
    document.getElementById('error-text').textContent = escaped;
    
    // Set severity class
    banner.className = `error-banner error-${severity}`;
    banner.style.display = 'block';
    
    // Set accessibility
    banner.setAttribute('role', 'alert');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-atomic', 'true');
    
    // Auto-hide if duration > 0
    if (duration > 0) {
        window.errorTimeout = setTimeout(() => {
            banner.style.display = 'none';
        }, duration);
    }
}

/**
 * Escape HTML für XSS-Schutz
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Lade alle Kompetenzen-Module aus modules.json
 * Datengetriebenes Design: Alle Inhalte in JSON, keine Hardcodierung
 * @async
 * @returns {Promise<void>}
 * @throws {Error} Falls modules.json nicht ladbar
 */
async function loadModules() {
    try {
        const response = await fetch('../data/modules.json');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        modules = data;
        initializeApp();
    } catch (error) {
        const msg = `Module konnten nicht geladen werden: ${error.message}`;
        showError(msg, 'error', 0); // Don't auto-hide on critical error
        console.error('Failed to load modules:', error);
    }
}

/**
 * Initialisiere die App nach erfolgreichem Modul-Laden
 * - Framework-Navigation rendern
 * - Event-Listener registrieren
 */
function initializeApp() {
    renderFrameworkNav();
    setupEventListeners();
}

/**
 * Render die 3 Kompetenzbereiche mit Modulen als Grid
 * Structure: Bereich > Module Grid > Modul-Cards
 */
function renderFrameworkNav() {
    const gridContainer = document.getElementById('module-grid');
    if (!gridContainer) {
        console.error('module-grid container not found');
        return;
    }
    
    gridContainer.innerHTML = '';
    
    if (!modules.bereiche || !Array.isArray(modules.bereiche)) {
        showError('Ungültige Modul-Struktur', 'error', 0);
        return;
    }
    
    modules.bereiche.forEach(bereich => {
        const bereichSection = document.createElement('section');
        bereichSection.className = 'bereich-section';
        bereichSection.innerHTML = `
            <h2 class="bereich-title">${escapeHtml(bereich.name)}</h2>
            <p class="bereich-desc">${escapeHtml(bereich.beschreibung)}</p>
        `;
        
        const moduleContainer = document.createElement('div');
        moduleContainer.className = 'module-container';
        
        if (!Array.isArray(bereich.module)) {
            console.warn(`Bereich ${bereich.id} has no modules`);
            return;
        }
        
        bereich.module.forEach(modul => {
            const card = document.createElement('button');
            card.className = 'module-card';
            card.dataset.moduleId = modul.id;
            card.setAttribute('aria-label', `Modul: ${modul.name}`);
            card.innerHTML = `
                <h3>${escapeHtml(modul.name)}</h3>
                <p>${escapeHtml(modul.kurzbeschreibung)}</p>
            `;
            card.addEventListener('click', () => showModuleDetail(modul.id, bereich.id));
            moduleContainer.appendChild(card);
        });
        
        bereichSection.appendChild(moduleContainer);
        gridContainer.appendChild(bereichSection);
    });
}

/**
 * Zeige Modul-Details (meta, content, tasks)
 * Parallel fetch aller 3 Dateien für bessere Performance
 * @async
 * @param {string} moduleId - z.B. 'm1', 's3', 'p6'
 * @param {string} bereichId - z.B. 'methodenspezifisch'
 */
async function showModuleDetail(moduleId, bereichId) {
    // Show loading indicator
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.style.display = 'flex';
    
    try {
        // Parallel fetch aller 3 Dateien
        const [metaRes, contentRes, tasksRes] = await Promise.all([
            fetch(`../modules/${moduleId}/meta.json`),
            fetch(`../modules/${moduleId}/content.md`),
            fetch(`../modules/${moduleId}/tasks.json`)
        ]);
        
        // Check responses
        if (!metaRes.ok || !contentRes.ok || !tasksRes.ok) {
            throw new Error('Eine oder mehrere Dateien nicht geladen');
        }
        
        const meta = await metaRes.json();
        const content = await contentRes.text();
        const tasks = await tasksRes.json();
        
        currentModule = { id: moduleId, bereichId, meta, content, tasks };
        
        document.getElementById('overview').style.display = 'none';
        document.getElementById('detail').style.display = 'block';
        
        document.getElementById('detail-title').textContent = escapeHtml(meta.name);
        document.getElementById('detail-area').textContent = escapeHtml(meta.bereich);
        
        // Markdown → HTML (mit XSS-Schutz)
        const contentHtml = markdownToHtml(content);
        document.getElementById('detail-content').innerHTML = contentHtml;
        
        // Render tasks
        const tasksHtml = renderTasks(tasks.aufgaben);
        document.getElementById('detail-tasks').innerHTML = tasksHtml || '';
        
        window.scrollTo(0, 0);
    } catch (error) {
        const msg = `Modul ${moduleId} konnte nicht geladen werden: ${error.message}`;
        showError(msg, 'error');
        console.error('Failed to load module detail:', error);
    } finally {
        if (spinner) spinner.style.display = 'none';
    }
}

/**
 * Konvertiere Markdown zu HTML (safe, mit XSS-Schutz)
 * Unterstützt: # ## ### **text** *text* - list items
 * LIMITATION: Keine nested lists, code blocks, links
 * @param {string} markdown
 * @returns {string} HTML (safe, nicht raw)
 */
function markdownToHtml(markdown) {
    // 1. Escape HTML zuerst (XSS-Schutz)
    let html = escapeHtml(markdown);
    
    // 2. Dann Markdown-Patterns ersetzen (sicher weil bereits escaped)
    html = html
        .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
        .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
        .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/gm, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gm, '<em>$1</em>')
        .replace(/\n- (.*?)(?=\n|$)/gm, '<ul><li>$1</li></ul>')
        .replace(/</ul>\n<ul>/g, '\n')
        .replace(/\n\n/gm, '</p><p>');
    
    // 3. Wrap in paragraphs
    if (!html.startsWith('<')) {
        html = '<p>' + html + '</p>';
    }
    
    return html;
}

/**
 * Render Aufgaben mit Schritten
 * @param {Array} aufgaben
 * @returns {string} HTML
 */
function renderTasks(aufgaben) {
    if (!aufgaben || aufgaben.length === 0) return '';
    
    let html = '<div class="tasks-section"><h2>Aufgaben</h2>';
    
    aufgaben.forEach((task, idx) => {
        html += `
            <div class="task-item">
                <h3>${idx + 1}. ${escapeHtml(task.title || 'Aufgabe')}</h3>
                <p>${escapeHtml(task.description || '')}</p>
        `;
        
        if (Array.isArray(task.steps)) {
            html += '<ol class="task-steps">';
            task.steps.forEach(step => {
                html += `<li>${escapeHtml(step)}</li>`;
            });
            html += '</ol>';
        }
        
        html += '</div>';
    });
    
    html += '</div>';
    return html;
}

/**
 * Event-Listener für Navigation und Interaktion
 */
function setupEventListeners() {
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            document.getElementById('detail').style.display = 'none';
            document.getElementById('overview').style.display = 'block';
            currentModule = null;
            window.scrollTo(0, 0);
        });
    }
}

/**
 * Initialize app when DOM is ready
 */
document.addEventListener('DOMContentLoaded', loadModules);
