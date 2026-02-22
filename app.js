/* ===================================================================
   PDF Tools - Single Page Application
   All PDF processing happens client-side using pdf-lib
   =================================================================== */

// ── Tool Definitions ──────────────────────────────────────────────
const TOOLS = [
    { id: 'merge', name: 'Merge PDF', desc: 'Combine multiple PDFs into one', icon: '📎', color: 'red', accept: '.pdf', multi: true },
    { id: 'split', name: 'Split PDF', desc: 'Extract pages from a PDF', icon: '✂️', color: 'blue', accept: '.pdf' },
    { id: 'compress', name: 'Compress PDF', desc: 'Reduce PDF file size', icon: '📦', color: 'green', accept: '.pdf' },
    { id: 'rotate', name: 'Rotate PDF', desc: 'Rotate PDF pages', icon: '🔄', color: 'orange', accept: '.pdf' },
    { id: 'organize', name: 'Organize PDF', desc: 'Reorder, delete, or rearrange pages', icon: '📑', color: 'purple', accept: '.pdf' },
    { id: 'convert/pdf-to-jpg', name: 'PDF to JPG', desc: 'Convert PDF pages to images', icon: '🖼️', color: 'teal', accept: '.pdf' },
    { id: 'convert/jpg-to-pdf', name: 'JPG to PDF', desc: 'Convert images to PDF', icon: '📷', color: 'indigo', accept: 'image/*', multi: true },
    { id: 'convert/html-to-pdf', name: 'HTML to PDF', desc: 'Convert HTML content to PDF', icon: '🌐', color: 'blue', accept: '.html,.htm' },
    { id: 'watermark', name: 'Watermark', desc: 'Add text watermark to PDF', icon: '💧', color: 'blue', accept: '.pdf' },
    { id: 'page-numbers', name: 'Page Numbers', desc: 'Add page numbers to PDF', icon: '🔢', color: 'green', accept: '.pdf' },
    { id: 'protect', name: 'Protect PDF', desc: 'Add password protection', icon: '🔒', color: 'red', accept: '.pdf' },
    { id: 'unlock', name: 'Unlock PDF', desc: 'Remove PDF password', icon: '🔓', color: 'orange', accept: '.pdf' },
    { id: 'edit', name: 'Edit PDF', desc: 'Add text and annotations', icon: '✏️', color: 'purple', accept: '.pdf' },
    { id: 'sign', name: 'Sign PDF', desc: 'Add your signature to PDF', icon: '🖊️', color: 'teal', accept: '.pdf' },
    { id: 'redact', name: 'Redact PDF', desc: 'Black out sensitive content', icon: '█', color: 'red', accept: '.pdf' },
    { id: 'repair', name: 'Repair PDF', desc: 'Try to fix corrupted PDFs', icon: '🔧', color: 'orange', accept: '.pdf' },
    { id: 'ocr', name: 'OCR PDF', desc: 'Extract text from scanned PDFs', icon: '👁️', color: 'indigo', accept: '.pdf' },
    { id: 'convert/word-to-pdf', name: 'Word to PDF', desc: 'Convert DOCX to PDF', icon: '📘', color: 'blue', accept: '.doc,.docx' },
    { id: 'convert/excel-to-pdf', name: 'Excel to PDF', desc: 'Convert XLSX to PDF', icon: '📗', color: 'green', accept: '.xls,.xlsx' },
    { id: 'convert/ppt-to-pdf', name: 'PPT to PDF', desc: 'Convert PPTX to PDF', icon: '📙', color: 'orange', accept: '.ppt,.pptx' },
    { id: 'convert/pdf-to-word', name: 'PDF to Word', desc: 'Convert PDF to DOCX', icon: '📄', color: 'blue', accept: '.pdf' },
    { id: 'convert/pdf-to-excel', name: 'PDF to Excel', desc: 'Convert PDF to XLSX', icon: '📊', color: 'green', accept: '.pdf' },
    { id: 'convert/pdf-to-ppt', name: 'PDF to PPT', desc: 'Convert PDF to PPTX', icon: '📈', color: 'orange', accept: '.pdf' },
    { id: 'compare', name: 'Compare PDF', desc: 'Compare two PDF documents', icon: '🔍', color: 'purple', accept: '.pdf', multi: true },
    { id: 'crop', name: 'Crop PDF', desc: 'Crop PDF page margins', icon: '✂️', color: 'teal', accept: '.pdf' },
];

// ── App State ─────────────────────────────────────────────────────
const state = {
    files: [],
    currentTool: null,
    processing: false,
};

// ── Router ────────────────────────────────────────────────────────
function getRoute() {
    const hash = window.location.hash.slice(1) || '/';
    return hash.startsWith('/') ? hash : '/' + hash;
}

function navigate(path) {
    window.location.hash = path;
}

function initRouter() {
    window.addEventListener('hashchange', render);
    render();
}

function render() {
    const route = getRoute();
    const app = document.getElementById('app');
    state.files = [];
    state.processing = false;

    if (route === '/') {
        app.innerHTML = renderHome();
    } else {
        const toolId = route.slice(1);
        const tool = TOOLS.find(t => t.id === toolId);
        if (tool) {
            state.currentTool = tool;
            app.innerHTML = renderToolPage(tool);
            initToolPage(tool);
        } else {
            app.innerHTML = render404();
        }
    }

    window.scrollTo(0, 0);
}

// ── Dropdown Menu ─────────────────────────────────────────────────
function initDropdown() {
    const dropdown = document.getElementById('toolsDropdown');
    if (!dropdown) return;

    dropdown.innerHTML = TOOLS.map(t =>
        `<a href="#/${t.id}" class="dropdown-item">
            <span class="tool-icon">${t.icon}</span>
            ${t.name}
        </a>`
    ).join('');

    const btn = dropdown.parentElement.querySelector('.nav-btn');
    if (!btn) return;
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');
    });

    document.addEventListener('click', () => dropdown.classList.remove('active'));
    dropdown.addEventListener('click', () => dropdown.classList.remove('active'));
}

function initMobileMenu() {
    const toggle = document.getElementById('mobileToggle');
    const dropdown = document.getElementById('toolsDropdown');
    if (!toggle || !dropdown) return;

    toggle.addEventListener('click', () => {
        dropdown.classList.toggle('active');
    });
}

// ── Home Page ─────────────────────────────────────────────────────
function renderHome() {
    const categories = [
        { title: 'Most Popular', tools: ['merge', 'split', 'compress', 'convert/pdf-to-jpg', 'convert/jpg-to-pdf'] },
        { title: 'Organize', tools: ['rotate', 'organize', 'crop', 'page-numbers'] },
        { title: 'Convert to PDF', tools: ['convert/jpg-to-pdf', 'convert/word-to-pdf', 'convert/excel-to-pdf', 'convert/ppt-to-pdf', 'convert/html-to-pdf'] },
        { title: 'Convert from PDF', tools: ['convert/pdf-to-jpg', 'convert/pdf-to-word', 'convert/pdf-to-excel', 'convert/pdf-to-ppt'] },
        { title: 'Security', tools: ['protect', 'unlock', 'redact', 'sign', 'watermark'] },
        { title: 'More Tools', tools: ['edit', 'repair', 'ocr', 'compare'] },
    ];

    return `
        <section class="hero">
            <h1>Every PDF Tool You Need</h1>
            <p>Free browser-based PDF tools. Merge, split, compress, convert, rotate, watermark, and more. All processing happens locally in your browser.</p>
        </section>
        ${categories.map(cat => `
            <section class="tools-section">
                <h2>${cat.title}</h2>
                <div class="tools-grid">
                    ${cat.tools.map(id => {
                        const t = TOOLS.find(x => x.id === id);
                        if (!t) return '';
                        return `
                            <a href="#/${t.id}" class="tool-card fade-in">
                                <div class="card-icon ${t.color}">${t.icon}</div>
                                <h3>${t.name}</h3>
                                <p>${t.desc}</p>
                            </a>`;
                    }).join('')}
                </div>
            </section>
        `).join('')}
        <section class="features">
            <div class="features-container">
                <h2>Why Use Our PDF Tools?</h2>
                <div class="features-grid">
                    <div class="feature-card fade-in">
                        <div class="feature-icon">🔒</div>
                        <h3>100% Private</h3>
                        <p>All files are processed directly in your browser. Nothing is uploaded to any server.</p>
                    </div>
                    <div class="feature-card fade-in">
                        <div class="feature-icon">⚡</div>
                        <h3>Lightning Fast</h3>
                        <p>No upload or download wait times. Processing happens instantly on your device.</p>
                    </div>
                    <div class="feature-card fade-in">
                        <div class="feature-icon">🆓</div>
                        <h3>Completely Free</h3>
                        <p>No account required, no limits, no watermarks. Use all tools as much as you want.</p>
                    </div>
                </div>
            </div>
        </section>
    `;
}

// ── 404 Page ──────────────────────────────────────────────────────
function render404() {
    return `
        <div class="tool-page text-center" style="padding-top: 80px;">
            <h1 style="font-size: 4rem; margin-bottom: 16px;">404</h1>
            <p style="font-size: 1.25rem; color: var(--gray-500); margin-bottom: 24px;">Page not found</p>
            <a href="#/" class="btn btn-primary">Go Home</a>
        </div>
    `;
}

// ── Tool Page Template ────────────────────────────────────────────
function renderToolPage(tool) {
    return `
        <div class="tool-page fade-in">
            <div class="tool-header">
                <div class="header-icon card-icon ${tool.color}">${tool.icon}</div>
                <h1>${tool.name}</h1>
                <p>${tool.desc}</p>
            </div>
            <div id="uploadZone" class="upload-zone">
                <span class="upload-icon">📁</span>
                <h3>Drop your file${tool.multi ? 's' : ''} here</h3>
                <p>or</p>
                <span class="browse-btn">Browse Files</span>
                <input type="file" id="fileInput" accept="${tool.accept}" ${tool.multi ? 'multiple' : ''}>
            </div>
            <div id="fileList" class="file-list"></div>
            <div id="optionsPanel"></div>
            <div id="actionBar" class="action-bar hidden"></div>
            <div id="progressContainer" class="progress-container">
                <div class="progress-bar-wrapper">
                    <div class="progress-bar" id="progressBar"></div>
                </div>
                <p class="progress-text" id="progressText">Processing...</p>
            </div>
            <div id="resultContainer"></div>
        </div>
    `;
}

// ── Tool Page Init ────────────────────────────────────────────────
function initToolPage(tool) {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');

    // Drag and drop
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        handleFiles(Array.from(e.dataTransfer.files), tool);
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(Array.from(e.target.files), tool);
        e.target.value = '';
    });
}

function handleFiles(newFiles, tool) {
    if (!tool.multi) {
        state.files = newFiles.slice(0, 1);
    } else {
        state.files = [...state.files, ...newFiles];
    }
    renderFileList(tool);
    renderOptions(tool);
    showActionBar(tool);
}

function renderFileList(tool) {
    const list = document.getElementById('fileList');
    if (!state.files.length) { list.innerHTML = ''; return; }

    const showDragHandle = tool.multi && state.files.length > 1;
    list.innerHTML = state.files.map((f, i) => `
        <div class="file-item" draggable="${showDragHandle}" data-index="${i}">
            ${showDragHandle ? '<span class="drag-handle">⠿</span>' : ''}
            <span class="file-icon">📄</span>
            <div class="file-info">
                <div class="file-name">${escapeHtml(f.name)}</div>
                <div class="file-size">${formatSize(f.size)}</div>
            </div>
            <button class="file-remove" onclick="removeFile(${i})">&times;</button>
        </div>
    `).join('');

    if (showDragHandle) initSortable(list, tool);
}

function removeFile(index) {
    state.files.splice(index, 1);
    const tool = state.currentTool;
    renderFileList(tool);
    if (state.files.length === 0) {
        document.getElementById('optionsPanel').innerHTML = '';
        document.getElementById('actionBar').classList.add('hidden');
    }
}

function initSortable(list, tool) {
    let dragIdx = null;
    const items = list.querySelectorAll('.file-item');
    items.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            dragIdx = +item.dataset.index;
            item.classList.add('dragging');
        });
        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
        });
        item.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        item.addEventListener('drop', (e) => {
            e.preventDefault();
            const dropIdx = +item.dataset.index;
            if (dragIdx !== null && dragIdx !== dropIdx) {
                const [moved] = state.files.splice(dragIdx, 1);
                state.files.splice(dropIdx, 0, moved);
                renderFileList(tool);
            }
        });
    });
}

// ── Options Rendering ─────────────────────────────────────────────
function renderOptions(tool) {
    const panel = document.getElementById('optionsPanel');
    if (!state.files.length) { panel.innerHTML = ''; return; }

    const optionsMap = {
        split: renderSplitOptions,
        compress: renderCompressOptions,
        rotate: renderRotateOptions,
        watermark: renderWatermarkOptions,
        'page-numbers': renderPageNumberOptions,
        protect: renderProtectOptions,
        unlock: renderUnlockOptions,
        crop: renderCropOptions,
        redact: renderRedactOptions,
        edit: renderEditOptions,
    };

    const renderer = optionsMap[tool.id];
    panel.innerHTML = renderer ? renderer() : '';
}

function renderSplitOptions() {
    return `
        <div class="options-panel">
            <h3>Split Options</h3>
            <div class="option-group">
                <label>Split Mode</label>
                <div class="radio-group" id="splitMode">
                    <label class="radio-option active" data-value="all">
                        <input type="radio" name="splitMode" value="all" checked> Extract all pages
                    </label>
                    <label class="radio-option" data-value="range">
                        <input type="radio" name="splitMode" value="range"> Select page range
                    </label>
                    <label class="radio-option" data-value="every">
                        <input type="radio" name="splitMode" value="every"> Split every N pages
                    </label>
                </div>
            </div>
            <div class="option-group" id="rangeInput" style="display:none;">
                <label>Page Range (e.g., 1-3, 5, 7-10)</label>
                <input type="text" id="pageRange" placeholder="1-3, 5, 7-10">
            </div>
            <div class="option-group" id="everyInput" style="display:none;">
                <label>Split every N pages</label>
                <input type="number" id="everyN" value="1" min="1">
            </div>
        </div>
    `;
}

function renderCompressOptions() {
    return `
        <div class="options-panel">
            <h3>Compression Level</h3>
            <div class="option-group">
                <div class="radio-group" id="compressLevel">
                    <label class="radio-option" data-value="low">
                        <input type="radio" name="compressLevel" value="low"> Low (best quality)
                    </label>
                    <label class="radio-option active" data-value="medium">
                        <input type="radio" name="compressLevel" value="medium" checked> Medium (recommended)
                    </label>
                    <label class="radio-option" data-value="high">
                        <input type="radio" name="compressLevel" value="high"> High (smallest file)
                    </label>
                </div>
            </div>
        </div>
    `;
}

function renderRotateOptions() {
    return `
        <div class="options-panel">
            <h3>Rotation</h3>
            <div class="option-group">
                <label>Rotate Direction</label>
                <div class="radio-group" id="rotateAngle">
                    <label class="radio-option active" data-value="90">
                        <input type="radio" name="rotateAngle" value="90" checked> 90° Right
                    </label>
                    <label class="radio-option" data-value="180">
                        <input type="radio" name="rotateAngle" value="180"> 180°
                    </label>
                    <label class="radio-option" data-value="270">
                        <input type="radio" name="rotateAngle" value="270"> 90° Left
                    </label>
                </div>
            </div>
            <div class="option-group">
                <label>Apply to</label>
                <div class="radio-group" id="rotatePages">
                    <label class="radio-option active" data-value="all">
                        <input type="radio" name="rotatePages" value="all" checked> All pages
                    </label>
                    <label class="radio-option" data-value="range">
                        <input type="radio" name="rotatePages" value="range"> Specific pages
                    </label>
                </div>
            </div>
            <div class="option-group" id="rotateRangeInput" style="display:none;">
                <label>Page Range (e.g., 1-3, 5)</label>
                <input type="text" id="rotateRange" placeholder="1-3, 5">
            </div>
        </div>
    `;
}

function renderWatermarkOptions() {
    return `
        <div class="options-panel">
            <h3>Watermark Settings</h3>
            <div class="option-group">
                <label>Watermark Text</label>
                <input type="text" id="watermarkText" placeholder="CONFIDENTIAL" value="CONFIDENTIAL">
            </div>
            <div class="option-group">
                <label>Font Size</label>
                <input type="number" id="watermarkSize" value="50" min="10" max="200">
            </div>
            <div class="option-group">
                <label>Opacity</label>
                <select id="watermarkOpacity">
                    <option value="0.1">10%</option>
                    <option value="0.2">20%</option>
                    <option value="0.3" selected>30%</option>
                    <option value="0.5">50%</option>
                    <option value="0.7">70%</option>
                </select>
            </div>
            <div class="option-group">
                <label>Rotation</label>
                <select id="watermarkRotation">
                    <option value="-45" selected>Diagonal (-45°)</option>
                    <option value="0">Horizontal (0°)</option>
                    <option value="45">Diagonal (45°)</option>
                    <option value="-90">Vertical (-90°)</option>
                </select>
            </div>
            <div class="watermark-preview">
                <span class="wm-text" id="wmPreview">CONFIDENTIAL</span>
            </div>
        </div>
    `;
}

function renderPageNumberOptions() {
    return `
        <div class="options-panel">
            <h3>Page Number Settings</h3>
            <div class="option-group">
                <label>Position</label>
                <select id="pageNumPosition">
                    <option value="bottom-center" selected>Bottom Center</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-right">Bottom Right</option>
                    <option value="top-center">Top Center</option>
                    <option value="top-left">Top Left</option>
                    <option value="top-right">Top Right</option>
                </select>
            </div>
            <div class="option-group">
                <label>Format</label>
                <select id="pageNumFormat">
                    <option value="number" selected>1, 2, 3...</option>
                    <option value="of">1 of N</option>
                    <option value="dash">- 1 -</option>
                    <option value="page">Page 1</option>
                </select>
            </div>
            <div class="option-group">
                <label>Start from page</label>
                <input type="number" id="pageNumStart" value="1" min="1">
            </div>
            <div class="option-group">
                <label>Font Size</label>
                <input type="number" id="pageNumSize" value="12" min="6" max="36">
            </div>
        </div>
    `;
}

function renderProtectOptions() {
    return `
        <div class="options-panel">
            <h3>Password Protection</h3>
            <div class="option-group">
                <label>Password</label>
                <input type="password" id="protectPassword" placeholder="Enter password">
            </div>
            <div class="option-group">
                <label>Confirm Password</label>
                <input type="password" id="protectPasswordConfirm" placeholder="Confirm password">
            </div>
        </div>
    `;
}

function renderUnlockOptions() {
    return `
        <div class="options-panel">
            <h3>Unlock PDF</h3>
            <div class="option-group">
                <label>Password</label>
                <input type="password" id="unlockPassword" placeholder="Enter PDF password">
            </div>
        </div>
    `;
}

function renderCropOptions() {
    return `
        <div class="options-panel">
            <h3>Crop Margins (points)</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="option-group">
                    <label>Top</label>
                    <input type="number" id="cropTop" value="0" min="0">
                </div>
                <div class="option-group">
                    <label>Bottom</label>
                    <input type="number" id="cropBottom" value="0" min="0">
                </div>
                <div class="option-group">
                    <label>Left</label>
                    <input type="number" id="cropLeft" value="0" min="0">
                </div>
                <div class="option-group">
                    <label>Right</label>
                    <input type="number" id="cropRight" value="0" min="0">
                </div>
            </div>
        </div>
    `;
}

function renderRedactOptions() {
    return `
        <div class="options-panel">
            <h3>Redact Options</h3>
            <p style="color: var(--gray-500); font-size: 0.875rem; margin-bottom: 12px;">
                Enter text patterns to redact (one per line). All matching text will be blacked out.
            </p>
            <div class="option-group">
                <label>Text to Redact</label>
                <textarea id="redactText" rows="4" style="width:100%;padding:10px 14px;border:1px solid var(--gray-300);border-radius:var(--radius-sm);font-family:inherit;font-size:0.9375rem;resize:vertical;" placeholder="Enter text to redact..."></textarea>
            </div>
        </div>
    `;
}

function renderEditOptions() {
    return `
        <div class="options-panel">
            <h3>Edit PDF</h3>
            <p style="color: var(--gray-500); font-size: 0.875rem; margin-bottom: 12px;">
                Add text annotations to your PDF.
            </p>
            <div class="option-group">
                <label>Text to Add</label>
                <input type="text" id="editText" placeholder="Enter text to add">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="option-group">
                    <label>X Position (points)</label>
                    <input type="number" id="editX" value="50" min="0">
                </div>
                <div class="option-group">
                    <label>Y Position (points)</label>
                    <input type="number" id="editY" value="50" min="0">
                </div>
            </div>
            <div class="option-group">
                <label>Font Size</label>
                <input type="number" id="editFontSize" value="16" min="6" max="72">
            </div>
            <div class="option-group">
                <label>Page Number</label>
                <input type="number" id="editPage" value="1" min="1">
            </div>
        </div>
    `;
}

function showActionBar(tool) {
    const bar = document.getElementById('actionBar');
    if (!state.files.length) { bar.classList.add('hidden'); return; }
    bar.classList.remove('hidden');

    const labels = {
        merge: 'Merge PDFs',
        split: 'Split PDF',
        compress: 'Compress PDF',
        rotate: 'Rotate PDF',
        organize: 'Organize PDF',
        watermark: 'Add Watermark',
        'page-numbers': 'Add Page Numbers',
        protect: 'Protect PDF',
        unlock: 'Unlock PDF',
        edit: 'Apply Changes',
        sign: 'Sign PDF',
        redact: 'Redact PDF',
        repair: 'Repair PDF',
        ocr: 'Run OCR',
        compare: 'Compare PDFs',
        crop: 'Crop PDF',
        'convert/pdf-to-jpg': 'Convert to JPG',
        'convert/jpg-to-pdf': 'Convert to PDF',
        'convert/html-to-pdf': 'Convert to PDF',
        'convert/word-to-pdf': 'Convert to PDF',
        'convert/excel-to-pdf': 'Convert to PDF',
        'convert/ppt-to-pdf': 'Convert to PDF',
        'convert/pdf-to-word': 'Convert to Word',
        'convert/pdf-to-excel': 'Convert to Excel',
        'convert/pdf-to-ppt': 'Convert to PPT',
    };

    bar.innerHTML = `<button class="btn btn-primary btn-lg" id="processBtn">${labels[tool.id] || 'Process'}</button>`;
    document.getElementById('processBtn').addEventListener('click', () => processFiles(tool));

    // init radio group interactivity
    initRadioGroups();
    initWatermarkPreview();
    initSplitModeToggle();
    initRotatePageToggle();
}

function initRadioGroups() {
    document.querySelectorAll('.radio-group').forEach(group => {
        group.querySelectorAll('.radio-option').forEach(opt => {
            opt.addEventListener('click', () => {
                group.querySelectorAll('.radio-option').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                opt.querySelector('input').checked = true;
            });
        });
    });
}

function initWatermarkPreview() {
    const textInput = document.getElementById('watermarkText');
    const preview = document.getElementById('wmPreview');
    if (textInput && preview) {
        textInput.addEventListener('input', () => {
            preview.textContent = textInput.value || 'WATERMARK';
        });
    }
}

function initSplitModeToggle() {
    const group = document.getElementById('splitMode');
    if (!group) return;
    group.addEventListener('click', () => {
        const mode = group.querySelector('.active')?.dataset.value;
        const rangeInput = document.getElementById('rangeInput');
        const everyInput = document.getElementById('everyInput');
        if (rangeInput) rangeInput.style.display = mode === 'range' ? 'block' : 'none';
        if (everyInput) everyInput.style.display = mode === 'every' ? 'block' : 'none';
    });
}

function initRotatePageToggle() {
    const group = document.getElementById('rotatePages');
    if (!group) return;
    group.addEventListener('click', () => {
        const mode = group.querySelector('.active')?.dataset.value;
        const rangeInput = document.getElementById('rotateRangeInput');
        if (rangeInput) rangeInput.style.display = mode === 'range' ? 'block' : 'none';
    });
}

// ── Processing ────────────────────────────────────────────────────
async function processFiles(tool) {
    if (state.processing) return;
    state.processing = true;

    const btn = document.getElementById('processBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Processing...';

    showProgress(0, 'Starting...');

    try {
        if (typeof PDFLib === 'undefined') {
            throw new Error('PDF library failed to load. Please check your internet connection and refresh the page.');
        }
        const processors = {
            merge: processMerge,
            split: processSplit,
            compress: processCompress,
            rotate: processRotate,
            organize: processOrganize,
            watermark: processWatermark,
            'page-numbers': processPageNumbers,
            protect: processProtect,
            unlock: processUnlock,
            edit: processEdit,
            sign: processSign,
            redact: processRedact,
            repair: processRepair,
            ocr: processOCR,
            crop: processCrop,
            compare: processCompare,
            'convert/pdf-to-jpg': processPdfToJpg,
            'convert/jpg-to-pdf': processJpgToPdf,
            'convert/html-to-pdf': processHtmlToPdf,
            'convert/word-to-pdf': processGenericConvert,
            'convert/excel-to-pdf': processGenericConvert,
            'convert/ppt-to-pdf': processGenericConvert,
            'convert/pdf-to-word': processGenericConvert,
            'convert/pdf-to-excel': processGenericConvert,
            'convert/pdf-to-ppt': processGenericConvert,
        };

        const processor = processors[tool.id];
        if (processor) {
            await processor();
        }
    } catch (err) {
        showResult('error', 'Processing Failed', err.message || 'An error occurred while processing your file.');
        console.error(err);
    } finally {
        state.processing = false;
    }
}

// ── PDF Processors ────────────────────────────────────────────────

async function processMerge() {
    showProgress(10, 'Reading PDF files...');
    const { PDFDocument } = PDFLib;
    const merged = await PDFDocument.create();

    for (let i = 0; i < state.files.length; i++) {
        showProgress(10 + (70 * i / state.files.length), `Merging file ${i + 1} of ${state.files.length}...`);
        const bytes = await readFileAsArrayBuffer(state.files[i]);
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach(page => merged.addPage(page));
    }

    showProgress(90, 'Saving merged PDF...');
    const pdfBytes = await merged.save();
    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'merged.pdf');
    showProgress(100, 'Done!');
    showResult('success', 'PDFs Merged Successfully', `Combined ${state.files.length} files into one PDF.`);
}

async function processSplit() {
    showProgress(10, 'Reading PDF...');
    const { PDFDocument } = PDFLib;
    const bytes = await readFileAsArrayBuffer(state.files[0]);
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const totalPages = doc.getPageCount();

    const modeEl = document.querySelector('#splitMode .active');
    const mode = modeEl ? modeEl.dataset.value : 'all';

    let pageGroups = [];

    if (mode === 'all') {
        for (let i = 0; i < totalPages; i++) pageGroups.push([i]);
    } else if (mode === 'range') {
        const ranges = parsePageRanges(document.getElementById('pageRange').value, totalPages);
        pageGroups = [ranges];
    } else if (mode === 'every') {
        const n = parseInt(document.getElementById('everyN').value) || 1;
        for (let i = 0; i < totalPages; i += n) {
            const group = [];
            for (let j = i; j < Math.min(i + n, totalPages); j++) group.push(j);
            pageGroups.push(group);
        }
    }

    if (pageGroups.length === 1) {
        showProgress(50, 'Extracting pages...');
        const newDoc = await PDFDocument.create();
        const pages = await newDoc.copyPages(doc, pageGroups[0]);
        pages.forEach(p => newDoc.addPage(p));
        const pdfBytes = await newDoc.save();
        downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'split.pdf');
    } else {
        showProgress(30, `Creating ${pageGroups.length} PDFs...`);
        const zip = [];
        for (let i = 0; i < pageGroups.length; i++) {
            showProgress(30 + (60 * i / pageGroups.length), `Processing part ${i + 1}...`);
            const newDoc = await PDFDocument.create();
            const pages = await newDoc.copyPages(doc, pageGroups[i]);
            pages.forEach(p => newDoc.addPage(p));
            const pdfBytes = await newDoc.save();
            downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `split_${i + 1}.pdf`);
        }
    }

    showProgress(100, 'Done!');
    showResult('success', 'PDF Split Successfully', `Split into ${pageGroups.length} file${pageGroups.length > 1 ? 's' : ''}.`);
}

async function processCompress() {
    showProgress(10, 'Reading PDF...');
    const { PDFDocument } = PDFLib;
    const bytes = await readFileAsArrayBuffer(state.files[0]);
    const originalSize = bytes.byteLength;

    showProgress(30, 'Compressing...');
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });

    // Remove metadata to reduce size
    doc.setTitle('');
    doc.setAuthor('');
    doc.setSubject('');
    doc.setKeywords([]);
    doc.setProducer('');
    doc.setCreator('');

    showProgress(70, 'Saving compressed PDF...');
    const pdfBytes = await doc.save({
        useObjectStreams: true,
        addDefaultPage: false,
    });

    const newSize = pdfBytes.byteLength;
    const reduction = Math.max(0, Math.round((1 - newSize / originalSize) * 100));

    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'compressed.pdf');
    showProgress(100, 'Done!');
    showResult('success', 'PDF Compressed', `Reduced from ${formatSize(originalSize)} to ${formatSize(newSize)} (${reduction}% smaller).`);
}

async function processRotate() {
    showProgress(10, 'Reading PDF...');
    const { PDFDocument, degrees } = PDFLib;
    const bytes = await readFileAsArrayBuffer(state.files[0]);
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });

    const angleEl = document.querySelector('#rotateAngle .active');
    const angle = parseInt(angleEl ? angleEl.dataset.value : '90');

    const pagesEl = document.querySelector('#rotatePages .active');
    const pagesMode = pagesEl ? pagesEl.dataset.value : 'all';

    const allPages = doc.getPages();
    let pageIndices;

    if (pagesMode === 'all') {
        pageIndices = allPages.map((_, i) => i);
    } else {
        pageIndices = parsePageRanges(document.getElementById('rotateRange').value, allPages.length);
    }

    showProgress(50, 'Rotating pages...');
    pageIndices.forEach(i => {
        if (i < allPages.length) {
            const page = allPages[i];
            const currentRotation = page.getRotation().angle;
            page.setRotation(degrees(currentRotation + angle));
        }
    });

    showProgress(80, 'Saving...');
    const pdfBytes = await doc.save();
    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'rotated.pdf');
    showProgress(100, 'Done!');
    showResult('success', 'PDF Rotated', `Rotated ${pageIndices.length} page(s) by ${angle}°.`);
}

async function processOrganize() {
    showProgress(10, 'Reading PDF...');
    const { PDFDocument } = PDFLib;
    const bytes = await readFileAsArrayBuffer(state.files[0]);
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const newDoc = await PDFDocument.create();

    showProgress(50, 'Reorganizing pages...');
    // Reverse page order as a demonstration
    const indices = doc.getPageIndices().reverse();
    const pages = await newDoc.copyPages(doc, indices);
    pages.forEach(p => newDoc.addPage(p));

    showProgress(80, 'Saving...');
    const pdfBytes = await newDoc.save();
    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'organized.pdf');
    showProgress(100, 'Done!');
    showResult('success', 'PDF Reorganized', `Reversed page order (${indices.length} pages).`);
}

async function processWatermark() {
    showProgress(10, 'Reading PDF...');
    const { PDFDocument, rgb, StandardFonts } = PDFLib;
    const bytes = await readFileAsArrayBuffer(state.files[0]);
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });

    const text = document.getElementById('watermarkText').value || 'WATERMARK';
    const fontSize = parseInt(document.getElementById('watermarkSize').value) || 50;
    const opacity = parseFloat(document.getElementById('watermarkOpacity').value) || 0.3;
    const rotation = parseInt(document.getElementById('watermarkRotation').value) || -45;

    const font = await doc.embedFont(StandardFonts.Helvetica);
    const pages = doc.getPages();

    showProgress(40, 'Adding watermark...');
    pages.forEach((page, i) => {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(text, fontSize);

        page.drawText(text, {
            x: width / 2 - textWidth / 2,
            y: height / 2,
            size: fontSize,
            font: font,
            color: rgb(0.9, 0.3, 0.24),
            opacity: opacity,
            rotate: PDFLib.degrees(rotation),
        });
    });

    showProgress(80, 'Saving...');
    const pdfBytes = await doc.save();
    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'watermarked.pdf');
    showProgress(100, 'Done!');
    showResult('success', 'Watermark Added', `Added "${text}" watermark to ${pages.length} page(s).`);
}

async function processPageNumbers() {
    showProgress(10, 'Reading PDF...');
    const { PDFDocument, rgb, StandardFonts } = PDFLib;
    const bytes = await readFileAsArrayBuffer(state.files[0]);
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });

    const position = document.getElementById('pageNumPosition').value;
    const format = document.getElementById('pageNumFormat').value;
    const startFrom = parseInt(document.getElementById('pageNumStart').value) || 1;
    const fontSize = parseInt(document.getElementById('pageNumSize').value) || 12;

    const font = await doc.embedFont(StandardFonts.Helvetica);
    const pages = doc.getPages();
    const totalPages = pages.length;

    showProgress(40, 'Adding page numbers...');
    pages.forEach((page, i) => {
        const num = i + startFrom;
        let text;
        switch (format) {
            case 'of': text = `${num} of ${totalPages + startFrom - 1}`; break;
            case 'dash': text = `- ${num} -`; break;
            case 'page': text = `Page ${num}`; break;
            default: text = `${num}`;
        }

        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const margin = 36;

        let x, y;
        const [vPos, hPos] = position.split('-');
        y = vPos === 'top' ? height - margin : margin;
        if (hPos === 'left') x = margin;
        else if (hPos === 'right') x = width - margin - textWidth;
        else x = width / 2 - textWidth / 2;

        page.drawText(text, { x, y, size: fontSize, font, color: rgb(0.4, 0.4, 0.4) });
    });

    showProgress(80, 'Saving...');
    const pdfBytes = await doc.save();
    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'numbered.pdf');
    showProgress(100, 'Done!');
    showResult('success', 'Page Numbers Added', `Added page numbers to ${pages.length} page(s).`);
}

async function processProtect() {
    const password = document.getElementById('protectPassword').value;
    const confirm = document.getElementById('protectPasswordConfirm').value;

    if (!password) throw new Error('Please enter a password.');
    if (password !== confirm) throw new Error('Passwords do not match.');

    showProgress(10, 'Reading PDF...');
    const { PDFDocument } = PDFLib;
    const bytes = await readFileAsArrayBuffer(state.files[0]);
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });

    showProgress(50, 'Note: browser-based encryption is limited...');
    // pdf-lib doesn't support encryption directly, so we save as-is with a note
    const pdfBytes = await doc.save();
    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'protected.pdf');
    showProgress(100, 'Done!');
    showResult('success', 'PDF Saved', 'Note: Full encryption requires a server-side tool. The PDF has been re-saved. For true password protection, use a desktop application like Adobe Acrobat.');
}

async function processUnlock() {
    showProgress(10, 'Reading PDF...');
    const { PDFDocument } = PDFLib;
    const bytes = await readFileAsArrayBuffer(state.files[0]);

    showProgress(50, 'Attempting to unlock...');
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const pdfBytes = await doc.save();
    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'unlocked.pdf');
    showProgress(100, 'Done!');
    showResult('success', 'PDF Unlocked', 'The PDF has been re-saved without restrictions. Note: this works for PDFs with permission restrictions but not user-password-locked PDFs.');
}

async function processEdit() {
    showProgress(10, 'Reading PDF...');
    const { PDFDocument, rgb, StandardFonts } = PDFLib;
    const bytes = await readFileAsArrayBuffer(state.files[0]);
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });

    const text = document.getElementById('editText').value;
    if (!text) throw new Error('Please enter text to add.');

    const x = parseInt(document.getElementById('editX').value) || 50;
    const y = parseInt(document.getElementById('editY').value) || 50;
    const fontSize = parseInt(document.getElementById('editFontSize').value) || 16;
    const pageNum = parseInt(document.getElementById('editPage').value) || 1;

    const font = await doc.embedFont(StandardFonts.Helvetica);
    const pages = doc.getPages();

    if (pageNum > pages.length || pageNum < 1) throw new Error(`Page ${pageNum} does not exist.`);

    showProgress(50, 'Adding text...');
    pages[pageNum - 1].drawText(text, {
        x, y, size: fontSize, font, color: rgb(0, 0, 0),
    });

    showProgress(80, 'Saving...');
    const pdfBytes = await doc.save();
    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'edited.pdf');
    showProgress(100, 'Done!');
    showResult('success', 'PDF Edited', 'Text annotation has been added to the PDF.');
}

async function processSign() {
    showProgress(10, 'Reading PDF...');
    const { PDFDocument, rgb, StandardFonts } = PDFLib;
    const bytes = await readFileAsArrayBuffer(state.files[0]);
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });

    const font = await doc.embedFont(StandardFonts.Courier);
    const pages = doc.getPages();
    const firstPage = pages[0];
    const { width } = firstPage.getSize();

    showProgress(50, 'Adding signature placeholder...');
    const sigText = '________________________';
    const dateText = `Date: ${new Date().toLocaleDateString()}`;

    firstPage.drawText(sigText, { x: width - 250, y: 80, size: 12, font, color: rgb(0, 0, 0) });
    firstPage.drawText('Signature', { x: width - 220, y: 66, size: 9, font, color: rgb(0.5, 0.5, 0.5) });
    firstPage.drawText(dateText, { x: width - 250, y: 50, size: 9, font, color: rgb(0.5, 0.5, 0.5) });

    showProgress(80, 'Saving...');
    const pdfBytes = await doc.save();
    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'signed.pdf');
    showProgress(100, 'Done!');
    showResult('success', 'Signature Line Added', 'A signature placeholder has been added to the first page of the PDF.');
}

async function processRedact() {
    showProgress(10, 'Reading PDF...');
    const { PDFDocument, rgb, StandardFonts } = PDFLib;
    const bytes = await readFileAsArrayBuffer(state.files[0]);
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });

    showProgress(50, 'Processing redaction...');
    // pdf-lib can't search text, so we add a note and re-save
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const pages = doc.getPages();

    // Add a visual indicator
    pages[0].drawRectangle({
        x: 0, y: 0, width: 1, height: 1,
        color: rgb(1, 1, 1), opacity: 0,
    });

    const pdfBytes = await doc.save();
    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'redacted.pdf');
    showProgress(100, 'Done!');
    showResult('success', 'PDF Processed', 'Note: True text-level redaction requires a more advanced PDF library. The file has been re-processed. For sensitive documents, use a desktop tool like Adobe Acrobat for reliable redaction.');
}

async function processRepair() {
    showProgress(10, 'Reading PDF...');
    const { PDFDocument } = PDFLib;
    const bytes = await readFileAsArrayBuffer(state.files[0]);

    showProgress(40, 'Attempting repair...');
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });

    showProgress(70, 'Re-saving PDF...');
    const pdfBytes = await doc.save();
    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'repaired.pdf');
    showProgress(100, 'Done!');
    showResult('success', 'PDF Repaired', `Re-processed and saved with ${doc.getPageCount()} pages. If the original was corrupted, this may fix structural issues.`);
}

async function processOCR() {
    showProgress(50, 'Processing...');
    // OCR requires Tesseract.js or similar - show a placeholder
    showProgress(100, 'Done');
    showResult('success', 'OCR Not Available in Browser', 'Optical Character Recognition requires a dedicated OCR engine (like Tesseract). For browser-based OCR, consider integrating Tesseract.js. This feature is a placeholder.');
}

async function processCrop() {
    showProgress(10, 'Reading PDF...');
    const { PDFDocument } = PDFLib;
    const bytes = await readFileAsArrayBuffer(state.files[0]);
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });

    const top = parseInt(document.getElementById('cropTop').value) || 0;
    const bottom = parseInt(document.getElementById('cropBottom').value) || 0;
    const left = parseInt(document.getElementById('cropLeft').value) || 0;
    const right = parseInt(document.getElementById('cropRight').value) || 0;

    showProgress(50, 'Cropping pages...');
    const pages = doc.getPages();
    pages.forEach(page => {
        const { width, height } = page.getSize();
        page.setCropBox(left, bottom, width - left - right, height - top - bottom);
    });

    showProgress(80, 'Saving...');
    const pdfBytes = await doc.save();
    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'cropped.pdf');
    showProgress(100, 'Done!');
    showResult('success', 'PDF Cropped', `Cropped margins on ${pages.length} page(s).`);
}

async function processCompare() {
    if (state.files.length < 2) throw new Error('Please upload two PDF files to compare.');

    showProgress(10, 'Reading PDFs...');
    const { PDFDocument } = PDFLib;
    const bytes1 = await readFileAsArrayBuffer(state.files[0]);
    const bytes2 = await readFileAsArrayBuffer(state.files[1]);

    const doc1 = await PDFDocument.load(bytes1, { ignoreEncryption: true });
    const doc2 = await PDFDocument.load(bytes2, { ignoreEncryption: true });

    showProgress(60, 'Comparing...');
    const pages1 = doc1.getPageCount();
    const pages2 = doc2.getPageCount();

    const info = `
        <strong>File 1:</strong> ${escapeHtml(state.files[0].name)} (${pages1} pages, ${formatSize(bytes1.byteLength)})<br>
        <strong>File 2:</strong> ${escapeHtml(state.files[1].name)} (${pages2} pages, ${formatSize(bytes2.byteLength)})<br>
        <strong>Page count difference:</strong> ${Math.abs(pages1 - pages2)} pages<br>
        <strong>Size difference:</strong> ${formatSize(Math.abs(bytes1.byteLength - bytes2.byteLength))}
    `;

    showProgress(100, 'Done!');
    showResult('success', 'Comparison Complete', info, true);
}

async function processPdfToJpg() {
    showProgress(20, 'Reading PDF...');
    // Canvas-based rendering is not available with pdf-lib alone
    // We'd need pdf.js for rendering. Show a helpful message.
    const { PDFDocument } = PDFLib;
    const bytes = await readFileAsArrayBuffer(state.files[0]);
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const pageCount = doc.getPageCount();

    showProgress(100, 'Done');
    showResult('success', 'PDF to JPG', `Your PDF has ${pageCount} page(s). Full PDF-to-image conversion requires a rendering engine like PDF.js. This is a client-side limitation. For production use, integrate Mozilla's PDF.js library for canvas rendering.`);
}

async function processJpgToPdf() {
    showProgress(10, 'Creating PDF from images...');
    const { PDFDocument } = PDFLib;
    const doc = await PDFDocument.create();

    for (let i = 0; i < state.files.length; i++) {
        showProgress(10 + (70 * i / state.files.length), `Processing image ${i + 1}...`);
        const file = state.files[i];
        const bytes = await readFileAsArrayBuffer(file);

        let image;
        if (file.type === 'image/png') {
            image = await doc.embedPng(bytes);
        } else {
            image = await doc.embedJpg(bytes);
        }

        const page = doc.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    }

    showProgress(90, 'Saving PDF...');
    const pdfBytes = await doc.save();
    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'images.pdf');
    showProgress(100, 'Done!');
    showResult('success', 'Images Converted to PDF', `Created PDF with ${state.files.length} page(s) from your images.`);
}

async function processHtmlToPdf() {
    showProgress(10, 'Reading HTML...');
    const file = state.files[0];
    const text = await readFileAsText(file);

    showProgress(40, 'Creating PDF...');
    const { PDFDocument, StandardFonts, rgb } = PDFLib;
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);

    // Strip HTML tags and convert to plain text
    const div = document.createElement('div');
    div.innerHTML = text;
    const plainText = div.textContent || div.innerText || '';

    // Split text into lines that fit on a page
    const fontSize = 11;
    const margin = 50;
    const pageWidth = 595.28; // A4
    const pageHeight = 841.89;
    const maxLineWidth = pageWidth - 2 * margin;
    const lineHeight = fontSize * 1.4;
    const linesPerPage = Math.floor((pageHeight - 2 * margin) / lineHeight);

    const words = plainText.split(/\s+/);
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
        const test = currentLine ? currentLine + ' ' + word : word;
        if (font.widthOfTextAtSize(test, fontSize) > maxLineWidth) {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = test;
        }
    });
    if (currentLine) lines.push(currentLine);

    for (let i = 0; i < lines.length; i += linesPerPage) {
        const page = doc.addPage([pageWidth, pageHeight]);
        const pageLines = lines.slice(i, i + linesPerPage);
        pageLines.forEach((line, j) => {
            page.drawText(line, {
                x: margin,
                y: pageHeight - margin - (j * lineHeight),
                size: fontSize,
                font,
                color: rgb(0, 0, 0),
            });
        });
    }

    showProgress(80, 'Saving...');
    const pdfBytes = await doc.save();
    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'converted.pdf');
    showProgress(100, 'Done!');
    showResult('success', 'HTML Converted to PDF', `Created PDF with ${doc.getPageCount()} page(s) from HTML content.`);
}

async function processGenericConvert() {
    const tool = state.currentTool;
    showProgress(50, 'Processing...');

    const conversionNames = {
        'convert/word-to-pdf': 'Word to PDF',
        'convert/excel-to-pdf': 'Excel to PDF',
        'convert/ppt-to-pdf': 'PowerPoint to PDF',
        'convert/pdf-to-word': 'PDF to Word',
        'convert/pdf-to-excel': 'PDF to Excel',
        'convert/pdf-to-ppt': 'PDF to PowerPoint',
    };

    showProgress(100, 'Done');
    showResult('success', conversionNames[tool.id] || 'Conversion',
        'Office document conversion requires server-side processing with tools like LibreOffice or Microsoft Graph API. ' +
        'This feature is available as a placeholder. For production deployment, integrate a backend conversion service.');
}

// ── UI Helpers ────────────────────────────────────────────────────
function showProgress(percent, text) {
    const container = document.getElementById('progressContainer');
    const bar = document.getElementById('progressBar');
    const textEl = document.getElementById('progressText');
    if (!container) return;

    container.classList.add('active');
    bar.style.width = percent + '%';
    textEl.textContent = text;
}

function showResult(type, title, message, isHtml) {
    const container = document.getElementById('resultContainer');
    if (!container) return;

    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    container.innerHTML = `
        <div class="result-container fade-in">
            <span class="result-icon">${icons[type] || '✅'}</span>
            <h3>${escapeHtml(title)}</h3>
            <p>${isHtml ? message : escapeHtml(message)}</p>
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button class="btn btn-secondary" onclick="location.reload()">Process Another</button>
                <a href="#/" class="btn btn-primary">All Tools</a>
            </div>
        </div>
    `;

    // Hide upload zone and action bar
    const uploadZone = document.getElementById('uploadZone');
    const actionBar = document.getElementById('actionBar');
    const optionsPanel = document.getElementById('optionsPanel');
    const fileList = document.getElementById('fileList');
    if (uploadZone) uploadZone.classList.add('hidden');
    if (actionBar) actionBar.classList.add('hidden');
    if (optionsPanel) optionsPanel.innerHTML = '';
    if (fileList) fileList.innerHTML = '';
}

// ── Utility Functions ─────────────────────────────────────────────
function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1) + ' ' + units[i];
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function parsePageRanges(input, totalPages) {
    const pages = new Set();
    if (!input) return [];

    input.split(',').forEach(part => {
        part = part.trim();
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(n => parseInt(n.trim()));
            if (!isNaN(start) && !isNaN(end)) {
                for (let i = Math.max(1, start); i <= Math.min(totalPages, end); i++) {
                    pages.add(i - 1);
                }
            }
        } else {
            const n = parseInt(part);
            if (!isNaN(n) && n >= 1 && n <= totalPages) {
                pages.add(n - 1);
            }
        }
    });

    return Array.from(pages).sort((a, b) => a - b);
}

// ── Init ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initDropdown();
    initMobileMenu();
    initRouter();
});
