// PDF.js Configuration
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

// App State
let pdfDoc = null;
let scale = 1.0;
let searchMatches = [];
let currentMatchIndex = -1;
let isSearching = false;
let renderQueue = [];
let isRendering = false;
let pdfAvailable = true;
const pdfFilename = 'sp.pdf'; // Your PDF filename

// DOM Elements
const pdfContainer = document.getElementById('pdf-container');
const loadingIndicator = document.getElementById('loading-indicator');
const currentPageSpan = document.getElementById('current-page');
const totalPagesSpan = document.getElementById('total-pages');
const zoomLevelSpan = document.getElementById('zoom-level');
const searchInput = document.getElementById('search-input');

// Initialize PDF viewer
function loadPDF() {
    const url = pdfFilename;
    
    showLoading(true);
    pdfContainer.innerHTML = '';
    
    // First check if file exists
    checkFileExists(url).then(exists => {
        if (!exists) {
            pdfAvailable = false;
            showLoading(false);
            showErrorModal("The PDF file is not available.");
            return;
        }

        pdfjsLib.getDocument(url).promise
            .then(pdf => {
                pdfDoc = pdf;
                totalPagesSpan.textContent = pdf.numPages;
                showLoading(false);
                renderAllPages();
                setupIntersectionObserver();
            })
            .catch(err => {
                console.error('PDF loading error:', err);
                showLoading(false);
                showErrorModal('Failed to load PDF: ' + err.message);
            });
    });
    
}

// Check if file exists on server
function checkFileExists(url) {
    return new Promise((resolve) => {
        fetch(url, { method: 'HEAD' })
            .then(res => resolve(res.ok))
            .catch(() => resolve(false));
    });
}

// Render all pages with continuous scroll
function renderAllPages() {
    // Adjust scale based on device
    scale = window.innerWidth < 768 ? 1.5 : 2.0;
    if (window.devicePixelRatio > 1.5) scale *= 1.5;
    
    for (let i = 1; i <= pdfDoc.numPages; i++) {
        const pageDiv = document.createElement('div');
        pageDiv.className = 'pdf-page';
        pageDiv.id = `page-${i}`;
        pageDiv.dataset.pageNum = i;
        pageDiv.style.marginBottom = '20px';
        
        const canvas = document.createElement('canvas');
        const textLayerDiv = document.createElement('div');
        textLayerDiv.className = 'text-layer';
        
        canvas.style.transform = 'translateZ(0)';
        canvas.style.imageRendering = 'crisp-edges';
        
        pageDiv.appendChild(canvas);
        pageDiv.appendChild(textLayerDiv);
        pdfContainer.appendChild(pageDiv);
        
        renderQueue.push({ pageNum: i, canvas, textLayerDiv });
    }
    
    processRenderQueue();
}

// Process render queue with quality improvements
function processRenderQueue() {
    if (isRendering || renderQueue.length === 0) return;
    
    isRendering = true;
    const { pageNum, canvas, textLayerDiv } = renderQueue.shift();
    
    pdfDoc.getPage(pageNum).then(page => {
        const viewport = page.getViewport({ 
            scale: scale * (window.devicePixelRatio || 1)
        });
        
        // Set canvas dimensions
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        canvas.style.height = `${viewport.height / (window.devicePixelRatio || 1)}px`;
        canvas.style.width = `${viewport.width / (window.devicePixelRatio || 1)}px`;
        
        // Render with quality settings
        const renderContext = {
            canvasContext: canvas.getContext('2d'),
            viewport: viewport,
            intent: 'print'
        };
        
        return page.render(renderContext).promise.then(() => {
            return page.getTextContent();
        }).then(textContent => {
            // Clear and render text layer
            textLayerDiv.innerHTML = '';
            const textViewport = page.getViewport({ scale: scale });
            textLayerDiv.style.width = `${textViewport.width}px`;
            textLayerDiv.style.height = `${textViewport.height}px`;
            
            return pdfjsLib.renderTextLayer({
                textContent: textContent,
                container: textLayerDiv,
                viewport: textViewport,
                textDivs: [],
                enhanceTextSelection: true,
                fontSize: 16,
                fontFamily: 'Arial',
                spacing: { char: 0.5, line: 1.2 }
            });
        });
    }).then(() => {
        isRendering = false;
        if (renderQueue.length > 0) {
            setTimeout(processRenderQueue, 100);
        }
    });
}

// Set up Intersection Observer
function setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const pageNum = parseInt(entry.target.dataset.pageNum);
                currentPageSpan.textContent = pageNum;
            }
        });
    }, { threshold: 0.5 });
    
    document.querySelectorAll('.pdf-page').forEach(page => {
        observer.observe(page);
    });
}

// Search functionality
async function searchPDF() {
    const searchText = searchInput.value.trim();
    if (!searchText || !pdfDoc || isSearching) return;
    
    isSearching = true;
    searchMatches = [];
    currentMatchIndex = -1;
    clearHighlights();
    
    for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        
        textContent.items.forEach((textItem) => {
            const text = textItem.str;
            let matchPos = -1;
            
            while ((matchPos = text.toLowerCase().indexOf(searchText.toLowerCase(), matchPos + 1)) !== -1) {
                searchMatches.push({
                    pageNum: i,
                    textItem: textItem,
                    matchPos: matchPos,
                    length: searchText.length
                });
            }
        });
    }
    
    if (searchMatches.length > 0) {
        currentMatchIndex = 0;
        highlightMatch(currentMatchIndex);
    } else {
        showErrorModal("No matches found for: " + searchText);
    }
    
    isSearching = false;
}

function highlightMatch(index) {
    clearHighlights();
    if (index < 0 || index >= searchMatches.length) return;
    
    const match = searchMatches[index];
    const pageDiv = document.getElementById(`page-${match.pageNum}`);
    const textLayer = pageDiv.querySelector('.text-layer');
    
    pageDiv.scrollIntoView({ behavior: 'smooth' });
    
    const highlight = document.createElement('div');
    highlight.className = 'highlight active';
    
    const textItem = match.textItem;
    const textWidth = textItem.width;
    const charWidth = textWidth / textItem.str.length;
    
    highlight.style.left = `${textItem.transform[4] + (charWidth * match.matchPos)}px`;
    highlight.style.top = `${textItem.transform[5]}px`;
    highlight.style.width = `${charWidth * match.length}px`;
    highlight.style.height = `${textItem.height}px`;
    
    textLayer.appendChild(highlight);
}

function clearHighlights() {
    document.querySelectorAll('.highlight').forEach(el => el.remove());
}

// Navigation functions
function nextMatch() {
    if (searchMatches.length === 0) return;
    currentMatchIndex = (currentMatchIndex + 1) % searchMatches.length;
    highlightMatch(currentMatchIndex);
}

function prevMatch() {
    if (searchMatches.length === 0) return;
    currentMatchIndex = (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length;
    highlightMatch(currentMatchIndex);
}

// Zoom functions
function zoomIn() {
    if (scale < 3.0) {
        scale += 0.25;
        updateZoom();
    }
}

function zoomOut() {
    if (scale > 0.5) {
        scale -= 0.25;
        updateZoom();
    }
}

function updateZoom() {
    zoomLevelSpan.textContent = `${Math.round(scale * 100)}%`;
    renderQueue = [];
    document.querySelectorAll('.pdf-page').forEach(page => {
        const pageNum = parseInt(page.dataset.pageNum);
        const canvas = page.querySelector('canvas');
        const textLayer = page.querySelector('.text-layer');
        renderQueue.push({ pageNum, canvas, textLayer });
    });
    processRenderQueue();
}

// Download functionality
// function downloadPDF() {
//     if (!pdfAvailable) {
//         showErrorModal("The PDF file is not available for download.");
//         return;
//     }

//     const link = document.createElement('a');
//     link.href = pdfFilename + '?t=' + new Date().getTime(); // Cache busting
//     link.download = pdfFilename;
    
//     link.addEventListener('click', () => {
//         console.log('Downloading:', pdfFilename);
//         // Add analytics tracking here if needed
//     }, { once: true });
    
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
    
// }
// Enhanced download function with multiple fallbacks
async function downloadPDF() {
    const downloadBtn = document.querySelector('.download-btn');
    try {
        // Show loading state
        downloadBtn.innerHTML = '<span class="download-icon">⏳</span> Preparing Download...';
        
        // First try: Standard download
        if (pdfAvailable) {
            await attemptStandardDownload();
            return;
        }
        
        // Fallback 1: Try fetching as blob
        await attemptBlobDownload();
    } catch (error) {
        console.error('Download failed:', error);
        
        // Fallback 2: Show alternative options
        showDownloadAlternatives();
    } finally {
        // Reset button state
        downloadBtn.innerHTML = '<span class="download-icon">⬇</span> Download PDF';
    }
}

// Standard download attempt
async function attemptStandardDownload() {
    return new Promise((resolve, reject) => {
        const link = document.createElement('a');
        link.href = `${pdfFilename}?t=${Date.now()}`;
        link.download = pdfFilename;
        
        // Add timeout for failure detection
        const timeout = setTimeout(() => {
            reject(new Error('Download timed out'));
        }, 5000);
        
        link.onclick = () => {
            clearTimeout(timeout);
            setTimeout(resolve, 100);
        };
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

// Blob-based download fallback
async function attemptBlobDownload() {
    const response = await fetch(pdfFilename);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = pdfFilename;
    
    // Clean up blob URL after download
    link.onclick = () => {
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    };
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Show alternatives when download fails
function showDownloadAlternatives() {
    const modalContent = `
        <h3>Download Options</h3>
        <p>Couldn't download automatically. Try these:</p>
        <div class="alternative-options">
            <button onclick="window.open('${pdfFilename}', '_blank')">
                Open in New Tab
            </button>
            <button onclick="copyDownloadLink()">
                Copy Download Link
            </button>
            <a href="mailto:?subject=Request%20PDF&body=Please%20send%20me%20the%20PDF%20file" class="email-btn">
                Request via Email
            </a>
        </div>
    `;
    showErrorModal(modalContent);
}


// Copy download link to clipboard
function copyDownloadLink() {
    navigator.clipboard.writeText(window.location.origin + '/' + pdfFilename)
        .then(() => alert('Download link copied to clipboard'))
        .catch(() => alert('Could not copy link'));
}

// UI Helpers
function showLoading(show) {
    loadingIndicator.style.display = show ? 'flex' : 'none';
}

function showErrorModal(message) {
    const modal = document.createElement('div');
    modal.className = 'error-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Error</h3>
            <p>${message}</p>
            <button onclick="this.parentElement.parentElement.remove()">OK</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Event Listeners
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.activeElement === searchInput) {
        searchPDF();
    } else if (e.ctrlKey || e.metaKey) {
        if (e.key === 'f') {
            e.preventDefault();
            searchInput.focus();
        } else if (e.key === '+' || e.key === '=') {
            e.preventDefault();
            zoomIn();
        } else if (e.key === '-') {
            e.preventDefault();
            zoomOut();
        }
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        nextMatch();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        prevMatch();
    }
});

// Initialize
window.addEventListener('load', () => {
    checkFileExists(pdfFilename).then(exists => {
        pdfAvailable = exists;
        if (exists) loadPDF();
    });
});