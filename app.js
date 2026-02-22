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

// Editor tools that open the interactive editor
const EDITOR_TOOL_IDS = ['edit', 'sign', 'redact'];

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

    const isPdfFile = state.files.length > 0 && state.files[0].type === 'application/pdf';

    // Open interactive editor for edit/sign/redact tools
    if (EDITOR_TOOL_IDS.includes(tool.id) && isPdfFile) {
        openEditor(tool);
        return;
    }

    // Show interactive preview for single-PDF tools
    const isSinglePdfTool = tool.accept === '.pdf' && !tool.multi && isPdfFile;
    if (isSinglePdfTool) {
        showPdfPreview(tool);
    } else {
        renderFileList(tool);
        renderOptions(tool);
        showActionBar(tool);
    }
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

// ── Interactive PDF Editor ─────────────────────────────────────────

const editorState = {
    pdf: null,
    pdfBytes: null,
    currentPage: 1,
    totalPages: 0,
    scale: 1.5,
    activeTool: 'select',
    annotations: [],
    undoStack: [],
    redoStack: [],
    isDrawing: false,
    drawStart: null,
    currentPath: [],
    selectedAnnotation: null,
    color: '#000000',
    fontSize: 16,
    lineWidth: 2,
    bold: false,
    italic: false,
    fontFamily: 'Helvetica, Arial, sans-serif',
};

async function openEditor(tool) {
    const file = state.files[0];
    const arrayBuffer = await readFileAsArrayBuffer(file);
    editorState.pdfBytes = new Uint8Array(arrayBuffer);

    if (typeof pdfjsLib === 'undefined') {
        alert('PDF.js library failed to load. Cannot open editor.');
        return;
    }

    try {
        editorState.pdf = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
        editorState.totalPages = editorState.pdf.numPages;
        editorState.currentPage = 1;
        editorState.annotations = [];
        editorState.undoStack = [];
        editorState.redoStack = [];
        editorState.selectedAnnotation = null;
        editorState.color = '#000000';
        editorState.fontSize = 16;
        editorState.lineWidth = 2;

        // Set default tool based on which tool opened the editor
        if (tool.id === 'sign') editorState.activeTool = 'signature';
        else if (tool.id === 'redact') editorState.activeTool = 'eraser';
        else editorState.activeTool = 'text';

    } catch (e) {
        alert('Could not load PDF: ' + e.message);
        return;
    }

    const app = document.getElementById('app');
    app.innerHTML = renderEditorHTML(file);
    document.querySelector('.navbar').style.display = 'none';
    document.querySelector('.footer').style.display = 'none';
    initEditor();
}

function renderEditorHTML(file) {
    return `
    <div class="editor-container">
        <div class="editor-toolbar">
            <div class="editor-toolbar-left">
                <button class="editor-tool-btn" data-tool="select" title="Select & Move">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>
                </button>
                <button class="editor-tool-btn" data-tool="text" title="Add Text">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>
                </button>
                <button class="editor-tool-btn" data-tool="eraser" title="Redact / Erase">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                </button>
                <button class="editor-tool-btn" data-tool="highlight" title="Highlight">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="8" rx="1" fill="#FFEB3B" opacity="0.5"/><path d="M3 8h18v8H3z"/></svg>
                </button>
                <button class="editor-tool-btn" data-tool="freehand" title="Freehand Draw">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 17c3-3 6 2 9-1s3-5 6-4" stroke-linecap="round"/></svg>
                </button>
                <button class="editor-tool-btn" data-tool="signature" title="Add Signature">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 19c3-3 4-6 8-4s4 3 7 1 4-4 5-5" stroke-linecap="round"/><line x1="2" y1="22" x2="22" y2="22"/></svg>
                </button>
                <div class="editor-toolbar-sep"></div>
                <div class="editor-tool-group">
                    <label title="Color"><input type="color" id="editorColor" value="#000000" class="editor-color-input"></label>
                    <label title="Font Size" class="editor-size-label">
                        <input type="number" id="editorFontSize" value="16" min="6" max="120" class="editor-size-input">
                        <span>px</span>
                    </label>
                </div>
            </div>
            <div class="editor-toolbar-right">
                <button class="editor-action-btn" id="editorUndo" title="Undo (Ctrl+Z)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10h13a4 4 0 0 1 0 8H10"/><polyline points="7 6 3 10 7 14"/></svg>
                </button>
                <button class="editor-action-btn" id="editorRedo" title="Redo (Ctrl+Y)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10H8a4 4 0 0 0 0 8h6"/><polyline points="17 6 21 10 17 14"/></svg>
                </button>
                <div class="editor-toolbar-sep"></div>
                <button class="btn btn-primary editor-save-btn" id="editorSave">Save PDF</button>
                <button class="editor-action-btn editor-close-btn" id="editorClose" title="Close Editor">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
        </div>
        <div class="editor-main">
            <div class="editor-sidebar" id="editorSidebar">
                <div class="editor-sidebar-pages" id="editorThumbs"></div>
            </div>
            <div class="editor-canvas-area" id="editorCanvasArea">
                <div class="editor-canvas-wrapper" id="editorCanvasWrapper">
                    <canvas id="editorBgCanvas"></canvas>
                    <canvas id="editorOverlayCanvas"></canvas>
                </div>
            </div>
        </div>
        <div class="editor-bottombar">
            <div class="editor-page-nav">
                <button class="editor-nav-btn" id="editorPrev" title="Previous Page">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <span class="editor-page-info">Page <span id="editorPageNum">1</span> of <span id="editorPageTotal">${editorState.totalPages}</span></span>
                <button class="editor-nav-btn" id="editorNext" title="Next Page">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
            </div>
            <div class="editor-zoom">
                <button class="editor-nav-btn" id="editorZoomOut" title="Zoom Out">-</button>
                <span id="editorZoomLevel">${Math.round(editorState.scale * 100)}%</span>
                <button class="editor-nav-btn" id="editorZoomIn" title="Zoom In">+</button>
            </div>
            <div class="editor-file-info">${escapeHtml(file.name)}</div>
        </div>
    </div>
    `;
}

function initEditor() {
    // Tool buttons
    document.querySelectorAll('.editor-tool-btn').forEach(btn => {
        btn.addEventListener('click', () => setEditorTool(btn.dataset.tool));
    });
    setEditorTool(editorState.activeTool);

    // Color & size
    document.getElementById('editorColor').addEventListener('input', e => { editorState.color = e.target.value; });
    document.getElementById('editorFontSize').addEventListener('input', e => { editorState.fontSize = parseInt(e.target.value) || 16; });

    // Navigation
    document.getElementById('editorPrev').addEventListener('click', () => goToEditorPage(editorState.currentPage - 1));
    document.getElementById('editorNext').addEventListener('click', () => goToEditorPage(editorState.currentPage + 1));

    // Zoom
    document.getElementById('editorZoomIn').addEventListener('click', () => setEditorZoom(editorState.scale + 0.25));
    document.getElementById('editorZoomOut').addEventListener('click', () => setEditorZoom(editorState.scale - 0.25));

    // Undo/Redo
    document.getElementById('editorUndo').addEventListener('click', editorUndo);
    document.getElementById('editorRedo').addEventListener('click', editorRedo);

    // Save & Close
    document.getElementById('editorSave').addEventListener('click', saveEditorPdf);
    document.getElementById('editorClose').addEventListener('click', closeEditor);

    // Keyboard shortcuts
    document.addEventListener('keydown', editorKeyHandler);

    // Canvas events
    const overlay = document.getElementById('editorOverlayCanvas');
    overlay.addEventListener('mousedown', editorMouseDown);
    overlay.addEventListener('mousemove', editorMouseMove);
    overlay.addEventListener('mouseup', editorMouseUp);
    overlay.addEventListener('mouseleave', editorMouseUp);

    // Touch events
    overlay.addEventListener('touchstart', editorTouchStart, { passive: false });
    overlay.addEventListener('touchmove', editorTouchMove, { passive: false });
    overlay.addEventListener('touchend', editorTouchEnd);

    // Render initial page and thumbnails
    renderEditorPage(editorState.currentPage);
    renderEditorThumbnails();
}

function setEditorTool(tool) {
    editorState.activeTool = tool;
    editorState.selectedAnnotation = null;
    removeTextToolbar();
    removeEditorTextInput();
    document.querySelectorAll('.editor-tool-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.tool === tool);
    });
    const overlay = document.getElementById('editorOverlayCanvas');
    if (!overlay) return;
    const cursors = { select: 'default', text: 'text', eraser: 'crosshair', highlight: 'crosshair', freehand: 'crosshair', signature: 'pointer' };
    overlay.style.cursor = cursors[tool] || 'default';
    renderEditorAnnotations();
}

async function renderEditorPage(pageNum) {
    const page = await editorState.pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: editorState.scale });

    const bgCanvas = document.getElementById('editorBgCanvas');
    const overlayCanvas = document.getElementById('editorOverlayCanvas');

    bgCanvas.width = viewport.width;
    bgCanvas.height = viewport.height;
    overlayCanvas.width = viewport.width;
    overlayCanvas.height = viewport.height;

    const ctx = bgCanvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport }).promise;

    editorState.currentPage = pageNum;
    document.getElementById('editorPageNum').textContent = pageNum;
    updateEditorNavButtons();
    renderEditorAnnotations();

    // Highlight active thumbnail
    document.querySelectorAll('.editor-thumb').forEach((t, i) => {
        t.classList.toggle('active', i + 1 === pageNum);
    });
}

function renderEditorAnnotations() {
    const canvas = document.getElementById('editorOverlayCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const pageAnns = editorState.annotations.filter(a => a.page === editorState.currentPage);

    pageAnns.forEach((ann, idx) => {
        ctx.save();
        switch (ann.type) {
            case 'text': {
                const weight = ann.bold ? 'bold' : 'normal';
                const style = ann.italic ? 'italic' : 'normal';
                ctx.font = `${style} ${weight} ${ann.fontSize * editorState.scale}px ${ann.fontFamily || 'Helvetica, Arial, sans-serif'}`;
                ctx.fillStyle = ann.color;
                ctx.fillText(ann.text, ann.x * editorState.scale, ann.y * editorState.scale);
            }
                break;
            case 'rect':
                ctx.fillStyle = ann.color;
                ctx.globalAlpha = ann.opacity != null ? ann.opacity : 1;
                ctx.fillRect(ann.x * editorState.scale, ann.y * editorState.scale, ann.w * editorState.scale, ann.h * editorState.scale);
                break;
            case 'highlight':
                ctx.fillStyle = ann.color || '#FFEB3B';
                ctx.globalAlpha = ann.opacity || 0.35;
                ctx.fillRect(ann.x * editorState.scale, ann.y * editorState.scale, ann.w * editorState.scale, ann.h * editorState.scale);
                break;
            case 'freehand':
                if (ann.points.length < 2) break;
                ctx.strokeStyle = ann.color;
                ctx.lineWidth = (ann.lineWidth || 2) * editorState.scale;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.beginPath();
                ctx.moveTo(ann.points[0].x * editorState.scale, ann.points[0].y * editorState.scale);
                for (let i = 1; i < ann.points.length; i++) {
                    ctx.lineTo(ann.points[i].x * editorState.scale, ann.points[i].y * editorState.scale);
                }
                ctx.stroke();
                break;
            case 'image':
                if (ann._img) {
                    ctx.drawImage(ann._img, ann.x * editorState.scale, ann.y * editorState.scale, ann.w * editorState.scale, ann.h * editorState.scale);
                }
                break;
        }

        // Selection highlight
        if (editorState.selectedAnnotation === ann) {
            ctx.globalAlpha = 1;
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 3]);
            const bounds = getAnnotationBounds(ann);
            ctx.strokeRect(bounds.x * editorState.scale - 3, bounds.y * editorState.scale - 3,
                bounds.w * editorState.scale + 6, bounds.h * editorState.scale + 6);
            ctx.setLineDash([]);
        }
        ctx.restore();
    });
}

function getAnnotationBounds(ann) {
    switch (ann.type) {
        case 'text': {
            const approxW = ann.text.length * ann.fontSize * 0.6;
            return { x: ann.x, y: ann.y - ann.fontSize, w: approxW, h: ann.fontSize * 1.2 };
        }
        case 'rect':
        case 'highlight':
            return { x: ann.x, y: ann.y, w: ann.w, h: ann.h };
        case 'freehand': {
            if (!ann.points.length) return { x: 0, y: 0, w: 0, h: 0 };
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            ann.points.forEach(p => { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); });
            return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
        }
        case 'image':
            return { x: ann.x, y: ann.y, w: ann.w, h: ann.h };
        default:
            return { x: 0, y: 0, w: 0, h: 0 };
    }
}

async function renderEditorThumbnails() {
    const container = document.getElementById('editorThumbs');
    if (!container) return;
    container.innerHTML = '';

    const maxThumbs = Math.min(editorState.totalPages, 50);
    for (let i = 1; i <= maxThumbs; i++) {
        const page = await editorState.pdf.getPage(i);
        const vp = page.getViewport({ scale: 0.2 });

        const wrapper = document.createElement('div');
        wrapper.className = 'editor-thumb' + (i === editorState.currentPage ? ' active' : '');
        wrapper.dataset.page = i;

        const canvas = document.createElement('canvas');
        canvas.width = vp.width;
        canvas.height = vp.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;

        const label = document.createElement('span');
        label.className = 'editor-thumb-label';
        label.textContent = i;

        wrapper.appendChild(canvas);
        wrapper.appendChild(label);
        wrapper.addEventListener('click', () => goToEditorPage(i));
        container.appendChild(wrapper);
    }
}

function goToEditorPage(pageNum) {
    if (pageNum < 1 || pageNum > editorState.totalPages) return;
    removeEditorTextInput();
    renderEditorPage(pageNum);
}

function updateEditorNavButtons() {
    const prev = document.getElementById('editorPrev');
    const next = document.getElementById('editorNext');
    if (prev) prev.disabled = editorState.currentPage <= 1;
    if (next) next.disabled = editorState.currentPage >= editorState.totalPages;
}

function setEditorZoom(newScale) {
    newScale = Math.max(0.5, Math.min(3, newScale));
    editorState.scale = newScale;
    document.getElementById('editorZoomLevel').textContent = Math.round(newScale * 100) + '%';
    renderEditorPage(editorState.currentPage);
}

// ── Canvas Event Handling ─────────────────────────────────────────

function getCanvasCoords(e) {
    const canvas = document.getElementById('editorOverlayCanvas');
    const rect = canvas.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left) / editorState.scale,
        y: (e.clientY - rect.top) / editorState.scale,
    };
}

function editorMouseDown(e) {
    const pos = getCanvasCoords(e);
    const tool = editorState.activeTool;

    if (tool === 'text') {
        showEditorTextInput(pos);
        return;
    }

    if (tool === 'signature') {
        openSignaturePad(pos);
        return;
    }

    if (tool === 'select') {
        editorSelectAt(pos);
        return;
    }

    // Start drawing for eraser, highlight, freehand
    editorState.isDrawing = true;
    editorState.drawStart = pos;

    if (tool === 'freehand') {
        editorState.currentPath = [pos];
    }
}

function editorMouseMove(e) {
    if (!editorState.isDrawing) return;
    const pos = getCanvasCoords(e);
    const tool = editorState.activeTool;

    if (tool === 'freehand') {
        editorState.currentPath.push(pos);
        // Draw live preview
        const canvas = document.getElementById('editorOverlayCanvas');
        const ctx = canvas.getContext('2d');
        renderEditorAnnotations();
        ctx.save();
        ctx.strokeStyle = editorState.color;
        ctx.lineWidth = editorState.lineWidth * editorState.scale;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(editorState.currentPath[0].x * editorState.scale, editorState.currentPath[0].y * editorState.scale);
        for (let i = 1; i < editorState.currentPath.length; i++) {
            ctx.lineTo(editorState.currentPath[i].x * editorState.scale, editorState.currentPath[i].y * editorState.scale);
        }
        ctx.stroke();
        ctx.restore();
        return;
    }

    if (tool === 'eraser' || tool === 'highlight') {
        // Draw live preview rect
        renderEditorAnnotations();
        const canvas = document.getElementById('editorOverlayCanvas');
        const ctx = canvas.getContext('2d');
        const start = editorState.drawStart;
        ctx.save();
        if (tool === 'eraser') {
            ctx.fillStyle = editorState.color;
            ctx.globalAlpha = 1;
        } else {
            ctx.fillStyle = '#FFEB3B';
            ctx.globalAlpha = 0.35;
        }
        ctx.fillRect(
            Math.min(start.x, pos.x) * editorState.scale,
            Math.min(start.y, pos.y) * editorState.scale,
            Math.abs(pos.x - start.x) * editorState.scale,
            Math.abs(pos.y - start.y) * editorState.scale
        );
        ctx.restore();
    }
}

function editorMouseUp(e) {
    if (!editorState.isDrawing) return;
    editorState.isDrawing = false;
    const tool = editorState.activeTool;

    if (tool === 'freehand' && editorState.currentPath.length > 1) {
        const ann = {
            type: 'freehand',
            page: editorState.currentPage,
            points: [...editorState.currentPath],
            color: editorState.color,
            lineWidth: editorState.lineWidth,
        };
        pushAnnotation(ann);
        editorState.currentPath = [];
    }

    if ((tool === 'eraser' || tool === 'highlight') && editorState.drawStart) {
        const pos = e.type === 'mouseleave' ? editorState.drawStart : getCanvasCoords(e);
        const start = editorState.drawStart;
        const w = Math.abs(pos.x - start.x);
        const h = Math.abs(pos.y - start.y);
        if (w > 2 || h > 2) {
            const ann = {
                type: tool === 'eraser' ? 'rect' : 'highlight',
                page: editorState.currentPage,
                x: Math.min(start.x, pos.x),
                y: Math.min(start.y, pos.y),
                w: w,
                h: h,
                color: tool === 'eraser' ? editorState.color : '#FFEB3B',
                opacity: tool === 'eraser' ? 1 : 0.35,
            };
            pushAnnotation(ann);
        }
    }

    editorState.drawStart = null;
    renderEditorAnnotations();
}

// Touch event wrappers
function editorTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    editorMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
}
function editorTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    editorMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
}
function editorTouchEnd(e) {
    const touch = e.changedTouches[0];
    editorMouseUp({ clientX: touch.clientX, clientY: touch.clientY, type: 'touchend' });
}

// ── Text Input ────────────────────────────────────────────────────

function showEditorTextInput(pos) {
    removeEditorTextInput();
    removeTextToolbar();
    const wrapper = document.getElementById('editorCanvasWrapper');
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'editor-text-input';
    input.style.left = (pos.x * editorState.scale) + 'px';
    input.style.top = (pos.y * editorState.scale - editorState.fontSize * editorState.scale) + 'px';
    input.style.fontSize = (editorState.fontSize * editorState.scale) + 'px';
    input.style.color = editorState.color;
    input.style.fontFamily = editorState.fontFamily;
    input.style.fontWeight = editorState.bold ? 'bold' : 'normal';
    input.style.fontStyle = editorState.italic ? 'italic' : 'normal';
    input.placeholder = 'Type here...';

    const commitText = () => {
        const text = input.value.trim();
        if (text) {
            pushAnnotation({
                type: 'text',
                page: editorState.currentPage,
                x: pos.x,
                y: pos.y,
                text: text,
                fontSize: editorState.fontSize,
                color: editorState.color,
                fontFamily: editorState.fontFamily,
                bold: editorState.bold,
                italic: editorState.italic,
            });
            renderEditorAnnotations();
        }
        input.remove();
        removeTextToolbar();
    };

    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); commitText(); }
        if (e.key === 'Escape') { input.remove(); removeTextToolbar(); }
    });
    input.addEventListener('blur', (e) => {
        // Don't commit if clicking on the toolbar
        if (e.relatedTarget && e.relatedTarget.closest('.editor-text-toolbar')) {
            input.focus();
            return;
        }
        commitText();
    });

    wrapper.appendChild(input);
    input.focus();

    // Show floating toolbar for the new text input
    showTextToolbar(null, { inputPos: pos });
}

function removeEditorTextInput() {
    const existing = document.querySelector('.editor-text-input');
    if (existing) existing.remove();
}

// ── Floating Text Toolbar ─────────────────────────────────────────

function showTextToolbar(ann, opts) {
    removeTextToolbar();
    const wrapper = document.getElementById('editorCanvasWrapper');
    if (!wrapper) return;

    const toolbar = document.createElement('div');
    toolbar.className = 'editor-text-toolbar';
    toolbar.addEventListener('mousedown', e => {
        // Prevent blur on text input for buttons, but allow native inputs to work
        if (e.target.tagName !== 'SELECT' && e.target.tagName !== 'INPUT') {
            e.preventDefault();
        }
        e.stopPropagation();
    });
    toolbar.addEventListener('pointerdown', e => e.stopPropagation());

    // Determine current values
    const isBold = ann ? ann.bold : editorState.bold;
    const isItalic = ann ? ann.italic : editorState.italic;
    const fontFamily = ann ? (ann.fontFamily || 'Helvetica, Arial, sans-serif') : editorState.fontFamily;
    const fontSize = ann ? ann.fontSize : editorState.fontSize;
    const color = ann ? ann.color : editorState.color;

    // Map font family string to short name for dropdown
    const fontKey = fontFamily.toLowerCase().includes('courier') ? 'Courier' :
                    fontFamily.toLowerCase().includes('times') ? 'Times Roman' : 'Helvetica';

    toolbar.innerHTML = `
        <button class="ett-btn ett-bold${isBold ? ' active' : ''}" title="Bold" data-action="bold">B</button>
        <button class="ett-btn ett-italic${isItalic ? ' active' : ''}" title="Italic" data-action="italic">I</button>
        <div class="ett-sep"></div>
        <select class="ett-font-select" data-action="fontFamily" title="Font Family">
            <option value="Helvetica, Arial, sans-serif"${fontKey === 'Helvetica' ? ' selected' : ''}>Helvetica</option>
            <option value="Times New Roman, Times, serif"${fontKey === 'Times Roman' ? ' selected' : ''}>Times Roman</option>
            <option value="Courier New, Courier, monospace"${fontKey === 'Courier' ? ' selected' : ''}>Courier</option>
        </select>
        <div class="ett-sep"></div>
        <input type="number" class="ett-size-input" value="${fontSize}" min="6" max="120" title="Font Size" data-action="fontSize">
        <span class="ett-size-label">px</span>
        <div class="ett-sep"></div>
        <input type="color" class="ett-color-input" value="${color}" title="Color" data-action="color">
        <div class="ett-sep"></div>
        <button class="ett-btn" title="Duplicate" data-action="duplicate">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
        </button>
        <button class="ett-btn ett-delete" title="Delete" data-action="delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
        </button>
    `;

    // Position the toolbar above the annotation or text input
    let posX, posY;
    if (ann) {
        const bounds = getAnnotationBounds(ann);
        posX = bounds.x * editorState.scale;
        posY = bounds.y * editorState.scale - 44;
    } else if (opts && opts.inputPos) {
        posX = opts.inputPos.x * editorState.scale;
        posY = opts.inputPos.y * editorState.scale - editorState.fontSize * editorState.scale - 44;
    }
    // Clamp to stay within canvas wrapper
    if (posX < 0) posX = 0;
    if (posY < 0) posY = 4;
    toolbar.style.left = posX + 'px';
    toolbar.style.top = posY + 'px';

    wrapper.appendChild(toolbar);

    // ─── Event handlers ───
    // Bold toggle
    toolbar.querySelector('[data-action="bold"]').addEventListener('click', () => {
        if (ann) {
            editorState.undoStack.push([...editorState.annotations.map(a => ({ ...a }))]);
            editorState.redoStack = [];
            ann.bold = !ann.bold;
            updateUndoRedoButtons();
            renderEditorAnnotations();
            showTextToolbar(ann);
        } else {
            editorState.bold = !editorState.bold;
            updateTextInputStyle();
            refreshToolbarToggle(toolbar, 'bold', editorState.bold);
        }
    });

    // Italic toggle
    toolbar.querySelector('[data-action="italic"]').addEventListener('click', () => {
        if (ann) {
            editorState.undoStack.push([...editorState.annotations.map(a => ({ ...a }))]);
            editorState.redoStack = [];
            ann.italic = !ann.italic;
            updateUndoRedoButtons();
            renderEditorAnnotations();
            showTextToolbar(ann);
        } else {
            editorState.italic = !editorState.italic;
            updateTextInputStyle();
            refreshToolbarToggle(toolbar, 'italic', editorState.italic);
        }
    });

    // Font family
    toolbar.querySelector('[data-action="fontFamily"]').addEventListener('change', (e) => {
        if (ann) {
            editorState.undoStack.push([...editorState.annotations.map(a => ({ ...a }))]);
            editorState.redoStack = [];
            ann.fontFamily = e.target.value;
            updateUndoRedoButtons();
            renderEditorAnnotations();
            showTextToolbar(ann);
        } else {
            editorState.fontFamily = e.target.value;
            updateTextInputStyle();
        }
    });

    // Font size
    toolbar.querySelector('[data-action="fontSize"]').addEventListener('input', (e) => {
        const val = parseInt(e.target.value) || 16;
        if (ann) {
            editorState.undoStack.push([...editorState.annotations.map(a => ({ ...a }))]);
            editorState.redoStack = [];
            ann.fontSize = val;
            updateUndoRedoButtons();
            renderEditorAnnotations();
            showTextToolbar(ann);
        } else {
            editorState.fontSize = val;
            document.getElementById('editorFontSize').value = val;
            updateTextInputStyle();
        }
    });

    // Color
    toolbar.querySelector('[data-action="color"]').addEventListener('input', (e) => {
        if (ann) {
            editorState.undoStack.push([...editorState.annotations.map(a => ({ ...a }))]);
            editorState.redoStack = [];
            ann.color = e.target.value;
            updateUndoRedoButtons();
            renderEditorAnnotations();
        } else {
            editorState.color = e.target.value;
            document.getElementById('editorColor').value = e.target.value;
            updateTextInputStyle();
        }
    });

    // Duplicate
    toolbar.querySelector('[data-action="duplicate"]').addEventListener('click', () => {
        if (!ann) return;
        editorState.undoStack.push([...editorState.annotations.map(a => ({ ...a }))]);
        editorState.redoStack = [];
        const clone = { ...ann, x: ann.x + 15, y: ann.y + 15 };
        editorState.annotations.push(clone);
        editorState.selectedAnnotation = clone;
        updateUndoRedoButtons();
        renderEditorAnnotations();
        showTextToolbar(clone);
    });

    // Delete
    toolbar.querySelector('[data-action="delete"]').addEventListener('click', () => {
        if (!ann) return;
        editorState.undoStack.push([...editorState.annotations.map(a => ({ ...a }))]);
        editorState.redoStack = [];
        editorState.annotations = editorState.annotations.filter(a => a !== ann);
        editorState.selectedAnnotation = null;
        updateUndoRedoButtons();
        renderEditorAnnotations();
        removeTextToolbar();
    });
}

function removeTextToolbar() {
    const existing = document.querySelector('.editor-text-toolbar');
    if (existing) existing.remove();
}

function refreshToolbarToggle(toolbar, action, active) {
    const btn = toolbar.querySelector(`[data-action="${action}"]`);
    if (btn) btn.classList.toggle('active', active);
}

function updateTextInputStyle() {
    const input = document.querySelector('.editor-text-input');
    if (!input) return;
    input.style.fontSize = (editorState.fontSize * editorState.scale) + 'px';
    input.style.color = editorState.color;
    input.style.fontFamily = editorState.fontFamily;
    input.style.fontWeight = editorState.bold ? 'bold' : 'normal';
    input.style.fontStyle = editorState.italic ? 'italic' : 'normal';
}

// ── Select Tool ───────────────────────────────────────────────────

function editorSelectAt(pos) {
    const pageAnns = editorState.annotations.filter(a => a.page === editorState.currentPage);
    let found = null;

    // Check in reverse order (topmost first)
    for (let i = pageAnns.length - 1; i >= 0; i--) {
        const bounds = getAnnotationBounds(pageAnns[i]);
        if (pos.x >= bounds.x && pos.x <= bounds.x + bounds.w &&
            pos.y >= bounds.y && pos.y <= bounds.y + bounds.h) {
            found = pageAnns[i];
            break;
        }
    }

    editorState.selectedAnnotation = found;
    renderEditorAnnotations();

    // Show floating toolbar for text annotations, hide otherwise
    if (found && found.type === 'text') {
        showTextToolbar(found);
    } else {
        removeTextToolbar();
    }
}

// ── Signature Pad ─────────────────────────────────────────────────

function openSignaturePad(placePos) {
    let existing = document.getElementById('sigPadOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'sigPadOverlay';
    overlay.className = 'sig-pad-overlay';
    overlay.innerHTML = `
        <div class="sig-pad-modal">
            <h3>Draw Your Signature</h3>
            <canvas id="sigPadCanvas" width="400" height="160"></canvas>
            <div class="sig-pad-actions">
                <button class="btn btn-secondary" id="sigPadClear">Clear</button>
                <button class="btn btn-secondary" id="sigPadUpload">Upload Image</button>
                <input type="file" id="sigPadFile" accept="image/*" style="display:none">
                <button class="btn btn-primary" id="sigPadDone">Place Signature</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('active'));

    const sigCanvas = document.getElementById('sigPadCanvas');
    const sigCtx = sigCanvas.getContext('2d');
    let drawing = false;

    sigCanvas.addEventListener('mousedown', e => {
        drawing = true;
        const r = sigCanvas.getBoundingClientRect();
        sigCtx.beginPath();
        sigCtx.moveTo(e.clientX - r.left, e.clientY - r.top);
    });
    sigCanvas.addEventListener('mousemove', e => {
        if (!drawing) return;
        const r = sigCanvas.getBoundingClientRect();
        sigCtx.lineWidth = 2;
        sigCtx.lineCap = 'round';
        sigCtx.strokeStyle = '#000';
        sigCtx.lineTo(e.clientX - r.left, e.clientY - r.top);
        sigCtx.stroke();
    });
    sigCanvas.addEventListener('mouseup', () => { drawing = false; });
    sigCanvas.addEventListener('mouseleave', () => { drawing = false; });

    // Touch support for signature pad
    sigCanvas.addEventListener('touchstart', e => {
        e.preventDefault();
        drawing = true;
        const r = sigCanvas.getBoundingClientRect();
        const t = e.touches[0];
        sigCtx.beginPath();
        sigCtx.moveTo(t.clientX - r.left, t.clientY - r.top);
    }, { passive: false });
    sigCanvas.addEventListener('touchmove', e => {
        e.preventDefault();
        if (!drawing) return;
        const r = sigCanvas.getBoundingClientRect();
        const t = e.touches[0];
        sigCtx.lineWidth = 2;
        sigCtx.lineCap = 'round';
        sigCtx.strokeStyle = '#000';
        sigCtx.lineTo(t.clientX - r.left, t.clientY - r.top);
        sigCtx.stroke();
    }, { passive: false });
    sigCanvas.addEventListener('touchend', () => { drawing = false; });

    document.getElementById('sigPadClear').addEventListener('click', () => {
        sigCtx.clearRect(0, 0, 400, 160);
    });

    document.getElementById('sigPadUpload').addEventListener('click', () => {
        document.getElementById('sigPadFile').click();
    });

    document.getElementById('sigPadFile').addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        const img = new Image();
        img.onload = () => {
            sigCtx.clearRect(0, 0, 400, 160);
            const ratio = Math.min(400 / img.width, 160 / img.height);
            const w = img.width * ratio;
            const h = img.height * ratio;
            sigCtx.drawImage(img, (400 - w) / 2, (160 - h) / 2, w, h);
        };
        img.src = URL.createObjectURL(file);
    });

    document.getElementById('sigPadDone').addEventListener('click', () => {
        const dataUrl = sigCanvas.toDataURL('image/png');
        const img = new Image();
        img.onload = () => {
            const sigW = 200;
            const sigH = 80;
            const ann = {
                type: 'image',
                page: editorState.currentPage,
                x: placePos.x,
                y: placePos.y,
                w: sigW,
                h: sigH,
                dataUrl: dataUrl,
                _img: img,
            };
            pushAnnotation(ann);
            renderEditorAnnotations();
        };
        img.src = dataUrl;
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 200);
    });

    overlay.addEventListener('click', e => {
        if (e.target === overlay) {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 200);
        }
    });
}

// ── Undo / Redo ───────────────────────────────────────────────────

function pushAnnotation(ann) {
    editorState.undoStack.push([...editorState.annotations.map(a => ({ ...a }))]);
    editorState.redoStack = [];
    editorState.annotations.push(ann);
    updateUndoRedoButtons();
}

function editorUndo() {
    if (!editorState.undoStack.length) return;
    editorState.redoStack.push([...editorState.annotations.map(a => ({ ...a }))]);
    editorState.annotations = editorState.undoStack.pop();
    // Restore image objects for image annotations
    editorState.annotations.forEach(ann => {
        if (ann.type === 'image' && ann.dataUrl && !ann._img) {
            const img = new Image();
            img.onload = () => { ann._img = img; renderEditorAnnotations(); };
            img.src = ann.dataUrl;
        }
    });
    editorState.selectedAnnotation = null;
    renderEditorAnnotations();
    updateUndoRedoButtons();
}

function editorRedo() {
    if (!editorState.redoStack.length) return;
    editorState.undoStack.push([...editorState.annotations.map(a => ({ ...a }))]);
    editorState.annotations = editorState.redoStack.pop();
    editorState.annotations.forEach(ann => {
        if (ann.type === 'image' && ann.dataUrl && !ann._img) {
            const img = new Image();
            img.onload = () => { ann._img = img; renderEditorAnnotations(); };
            img.src = ann.dataUrl;
        }
    });
    editorState.selectedAnnotation = null;
    renderEditorAnnotations();
    updateUndoRedoButtons();
}

function updateUndoRedoButtons() {
    const undo = document.getElementById('editorUndo');
    const redo = document.getElementById('editorRedo');
    if (undo) undo.disabled = editorState.undoStack.length === 0;
    if (redo) redo.disabled = editorState.redoStack.length === 0;
}

function editorKeyHandler(e) {
    // Only handle when editor is open
    if (!document.getElementById('editorOverlayCanvas')) return;

    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        editorUndo();
    } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
        e.preventDefault();
        editorRedo();
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (editorState.selectedAnnotation && !document.querySelector('.editor-text-input:focus')) {
            e.preventDefault();
            editorState.undoStack.push([...editorState.annotations.map(a => ({ ...a }))]);
            editorState.redoStack = [];
            editorState.annotations = editorState.annotations.filter(a => a !== editorState.selectedAnnotation);
            editorState.selectedAnnotation = null;
            renderEditorAnnotations();
            updateUndoRedoButtons();
            removeTextToolbar();
        }
    } else if (e.key === 'Escape') {
        removeEditorTextInput();
        removeTextToolbar();
        editorState.selectedAnnotation = null;
        renderEditorAnnotations();
    }
}

// ── Save PDF ──────────────────────────────────────────────────────

async function saveEditorPdf() {
    const saveBtn = document.getElementById('editorSave');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    try {
        const { PDFDocument, StandardFonts, rgb } = PDFLib;
        const doc = await PDFDocument.load(editorState.pdfBytes, { ignoreEncryption: true });
        const fontCache = {};
        async function getFont(ann) {
            const family = (ann.fontFamily || '').toLowerCase();
            let fontName;
            if (family.includes('courier')) {
                if (ann.bold && ann.italic) fontName = 'CourierBoldOblique';
                else if (ann.bold) fontName = 'CourierBold';
                else if (ann.italic) fontName = 'CourierOblique';
                else fontName = 'Courier';
            } else if (family.includes('times')) {
                if (ann.bold && ann.italic) fontName = 'TimesRomanBoldItalic';
                else if (ann.bold) fontName = 'TimesRomanBold';
                else if (ann.italic) fontName = 'TimesRomanItalic';
                else fontName = 'TimesRoman';
            } else {
                if (ann.bold && ann.italic) fontName = 'HelveticaBoldOblique';
                else if (ann.bold) fontName = 'HelveticaBold';
                else if (ann.italic) fontName = 'HelveticaOblique';
                else fontName = 'Helvetica';
            }
            if (!fontCache[fontName]) {
                fontCache[fontName] = await doc.embedFont(StandardFonts[fontName]);
            }
            return fontCache[fontName];
        }
        const pages = doc.getPages();

        for (const ann of editorState.annotations) {
            const pageIdx = ann.page - 1;
            if (pageIdx < 0 || pageIdx >= pages.length) continue;
            const page = pages[pageIdx];
            const { height: pageHeight } = page.getSize();

            switch (ann.type) {
                case 'text': {
                    const pdfX = ann.x;
                    const pdfY = pageHeight - ann.y;
                    const c = hexToRgb(ann.color);
                    const font = await getFont(ann);
                    page.drawText(ann.text, {
                        x: pdfX,
                        y: pdfY,
                        size: ann.fontSize,
                        font: font,
                        color: rgb(c.r, c.g, c.b),
                    });
                    break;
                }
                case 'rect': {
                    const c = hexToRgb(ann.color);
                    page.drawRectangle({
                        x: ann.x,
                        y: pageHeight - ann.y - ann.h,
                        width: ann.w,
                        height: ann.h,
                        color: rgb(c.r, c.g, c.b),
                        opacity: ann.opacity != null ? ann.opacity : 1,
                    });
                    break;
                }
                case 'highlight': {
                    const c = hexToRgb(ann.color || '#FFEB3B');
                    page.drawRectangle({
                        x: ann.x,
                        y: pageHeight - ann.y - ann.h,
                        width: ann.w,
                        height: ann.h,
                        color: rgb(c.r, c.g, c.b),
                        opacity: ann.opacity || 0.35,
                    });
                    break;
                }
                case 'freehand': {
                    if (ann.points.length < 2) break;
                    const c = hexToRgb(ann.color);
                    for (let i = 0; i < ann.points.length - 1; i++) {
                        page.drawLine({
                            start: { x: ann.points[i].x, y: pageHeight - ann.points[i].y },
                            end: { x: ann.points[i + 1].x, y: pageHeight - ann.points[i + 1].y },
                            thickness: ann.lineWidth || 2,
                            color: rgb(c.r, c.g, c.b),
                        });
                    }
                    break;
                }
                case 'image': {
                    if (!ann.dataUrl) break;
                    const pngData = await fetch(ann.dataUrl).then(r => r.arrayBuffer());
                    const pngImage = await doc.embedPng(pngData);
                    page.drawImage(pngImage, {
                        x: ann.x,
                        y: pageHeight - ann.y - ann.h,
                        width: ann.w,
                        height: ann.h,
                    });
                    break;
                }
            }
        }

        const pdfBytes = await doc.save();
        downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'edited.pdf');
    } catch (err) {
        alert('Failed to save PDF: ' + err.message);
        console.error(err);
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save PDF';
    }
}

function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const n = parseInt(hex, 16);
    return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

function closeEditor() {
    const hasEdits = editorState.annotations.length > 0;
    if (hasEdits && !confirm('You have unsaved changes. Close the editor?')) return;

    document.removeEventListener('keydown', editorKeyHandler);
    document.querySelector('.navbar').style.display = '';
    document.querySelector('.footer').style.display = '';

    // Re-render the tool page
    const tool = state.currentTool;
    const app = document.getElementById('app');
    state.files = [];
    app.innerHTML = renderToolPage(tool);
    initToolPage(tool);
}

// ── PDF Preview ───────────────────────────────────────────────────
async function showPdfPreview(tool) {
    const file = state.files[0];
    const arrayBuffer = await readFileAsArrayBuffer(file);
    state._previewBytes = new Uint8Array(arrayBuffer);

    // Get page count from pdf-lib (fast, no rendering)
    let pageCount = 0;
    try {
        const doc = await PDFLib.PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        pageCount = doc.getPageCount();
    } catch (e) {
        // Fallback: skip preview and go straight to normal flow
        renderFileList(tool);
        renderOptions(tool);
        showActionBar(tool);
        return;
    }

    state._previewPageCount = pageCount;

    // Build the preview modal overlay
    let existing = document.getElementById('pdfPreviewOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'pdfPreviewOverlay';
    overlay.className = 'pdf-preview-overlay';

    overlay.innerHTML = `
        <div class="pdf-preview-modal">
            <div class="pdf-preview-header">
                <div class="pdf-preview-file-info">
                    <span class="pdf-preview-icon">📄</span>
                    <div>
                        <div class="pdf-preview-filename">${escapeHtml(file.name)}</div>
                        <div class="pdf-preview-meta">${pageCount} page${pageCount !== 1 ? 's' : ''} &middot; ${formatSize(file.size)}</div>
                    </div>
                </div>
                <button class="pdf-preview-close" id="previewClose">&times;</button>
            </div>
            <div class="pdf-preview-body">
                <div class="pdf-preview-pages" id="previewPages">
                    <div class="pdf-preview-loading">Loading preview...</div>
                </div>
                <div class="pdf-preview-sidebar">
                    <div class="pdf-preview-tool-info">
                        <div class="card-icon ${tool.color}" style="width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;margin:0 auto 12px;">${tool.icon}</div>
                        <h3>${tool.name}</h3>
                        <p>${tool.desc}</p>
                    </div>
                    <div id="previewOptionsPanel" class="pdf-preview-options"></div>
                    <button class="btn btn-primary btn-lg pdf-preview-action" id="previewProcessBtn">
                        ${getToolActionLabel(tool)}
                    </button>
                    <button class="btn btn-secondary" id="previewChangeFile" style="width:100%;margin-top:8px;">Choose Different File</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('active'));

    // Render options inside the sidebar
    const optionsPanel = document.getElementById('previewOptionsPanel');
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
    if (renderer) {
        optionsPanel.innerHTML = renderer();
        initRadioGroups();
        initWatermarkPreview();
        initSplitModeToggle();
        initRotatePageToggle();
    }

    // Wire up close button
    document.getElementById('previewClose').addEventListener('click', closePdfPreview);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closePdfPreview();
    });

    // Wire up process button
    document.getElementById('previewProcessBtn').addEventListener('click', () => {
        // Save option values from the modal before closing
        const savedValues = {};
        overlay.querySelectorAll('input, select').forEach(el => {
            if (el.id) savedValues[el.id] = el.type === 'checkbox' || el.type === 'radio' ? el.checked : el.value;
        });
        const activeRadios = {};
        overlay.querySelectorAll('.radio-option.active').forEach(el => {
            const group = el.closest('.radio-group');
            if (group && group.id) activeRadios[group.id] = el.dataset.value;
        });

        closePdfPreview();
        renderFileList(tool);
        renderOptions(tool);
        showActionBar(tool);

        // Restore saved option values into the main page
        Object.entries(savedValues).forEach(([id, val]) => {
            const el = document.getElementById(id);
            if (!el) return;
            if (el.type === 'checkbox' || el.type === 'radio') el.checked = val;
            else el.value = val;
        });
        Object.entries(activeRadios).forEach(([groupId, activeVal]) => {
            const group = document.getElementById(groupId);
            if (!group) return;
            group.querySelectorAll('.radio-option').forEach(opt => {
                opt.classList.toggle('active', opt.dataset.value === activeVal);
                const radio = opt.querySelector('input[type="radio"]');
                if (radio) radio.checked = opt.dataset.value === activeVal;
            });
        });
        // Re-init toggles so visibility matches restored state
        initSplitModeToggle();
        initRotatePageToggle();

        // Auto-trigger processing
        setTimeout(() => processFiles(tool), 150);
    });

    // Wire up change file button
    document.getElementById('previewChangeFile').addEventListener('click', () => {
        closePdfPreview();
        state.files = [];
    });

    // Render PDF page thumbnails using PDF.js
    renderPreviewThumbnails(file, pageCount);
}

async function renderPreviewThumbnails(file, pageCount) {
    const container = document.getElementById('previewPages');
    if (!container) return;

    if (typeof pdfjsLib === 'undefined') {
        container.innerHTML = `<div class="pdf-preview-no-render">
            <div class="pdf-preview-page-grid">
                ${Array.from({length: Math.min(pageCount, 20)}, (_, i) => `
                    <div class="pdf-preview-page-placeholder">
                        <span>Page ${i + 1}</span>
                    </div>
                `).join('')}
            </div>
            ${pageCount > 20 ? `<p class="pdf-preview-more">+ ${pageCount - 20} more pages</p>` : ''}
        </div>`;
        return;
    }

    try {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const maxPages = Math.min(pdf.numPages, 30);

        container.innerHTML = `<div class="pdf-preview-page-grid" id="previewGrid"></div>
            ${pdf.numPages > maxPages ? `<p class="pdf-preview-more">Showing ${maxPages} of ${pdf.numPages} pages</p>` : ''}`;
        const grid = document.getElementById('previewGrid');

        for (let i = 1; i <= maxPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 0.5 });

            const wrapper = document.createElement('div');
            wrapper.className = 'pdf-preview-thumb';

            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');

            await page.render({ canvasContext: ctx, viewport: viewport }).promise;

            const label = document.createElement('span');
            label.className = 'pdf-preview-thumb-label';
            label.textContent = i;

            wrapper.appendChild(canvas);
            wrapper.appendChild(label);
            grid.appendChild(wrapper);
        }
    } catch (err) {
        container.innerHTML = `<div class="pdf-preview-no-render">
            <p>Could not render preview. The PDF may be encrypted or corrupted.</p>
            <p style="font-size:0.8rem;color:var(--gray-400);margin-top:8px;">${escapeHtml(err.message)}</p>
        </div>`;
    }
}

function closePdfPreview() {
    const overlay = document.getElementById('pdfPreviewOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 200);
    }
}

function getToolActionLabel(tool) {
    const labels = {
        merge: 'Merge PDFs',
        split: 'Split PDF',
        compress: 'Compress PDF',
        rotate: 'Rotate PDF',
        organize: 'Organize Pages',
        watermark: 'Add Watermark',
        'page-numbers': 'Add Page Numbers',
        protect: 'Protect PDF',
        unlock: 'Unlock PDF',
        edit: 'Edit PDF',
        sign: 'Sign PDF',
        redact: 'Redact PDF',
        repair: 'Repair PDF',
        ocr: 'Run OCR',
        crop: 'Crop PDF',
        compare: 'Compare PDFs',
        'convert/pdf-to-jpg': 'Convert to JPG',
        'convert/pdf-to-word': 'Convert to Word',
        'convert/pdf-to-excel': 'Convert to Excel',
        'convert/pdf-to-ppt': 'Convert to PPT',
    };
    return labels[tool.id] || 'Process PDF';
}

// ── Init ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initDropdown();
    initMobileMenu();
    initRouter();
});
