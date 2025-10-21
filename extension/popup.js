// Configuration
const API_BASE = "http://localhost:3000"; // Change to your deployed web app origin

// DOM elements
const textEl = document.getElementById('text');
const btnShot = document.getElementById('btn-shot');
const btnSend = document.getElementById('btn-send');
const btnClear = document.getElementById('btn-clear');
const btnApply = document.getElementById('btn-apply');
const shotWrap = document.getElementById('shot-wrap');
const canvas = document.getElementById('canvas');
const meta = document.getElementById('meta');
const toast = document.getElementById('toast');

// State
let tabInfo = null;
let confirmedImageDataUrl = null;
let rects = [];
let ctx = null;
let img = null;

// Redaction state management
const redactionState = {
  draft: null,
  
  startRect(e) {
    const pos = relPos(e);
    this.draft = { x: pos.x, y: pos.y, w: 0, h: 0 };
  },
  
  updateRect(e) {
    if (this.draft) {
      const p = relPos(e);
      this.draft.w = p.x - this.draft.x;
      this.draft.h = p.y - this.draft.y;
      redraw();
    }
  },
  
  finalizeRect() {
    if (this.draft) {
      if (Math.abs(this.draft.w) > 4 && Math.abs(this.draft.h) > 4) {
        rects.push(normRect(this.draft));
      }
      this.draft = null;
      redraw();
    }
  }
};

// Initialize
async function init() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    tabInfo = {
      url: tab.url,
      title: tab.title
    };
    
    // Show page info
    const domain = new URL(tab.url).hostname;
    meta.textContent = `${domain} • ${tab.title}`;
    
    // Setup canvas
    ctx = canvas.getContext('2d');
    
    // Focus textarea
    textEl.focus();

    // Auto-capture a screenshot on open and show redaction UI
    try {
      await captureAndShowScreenshot();
    } catch (e) {
      console.error('Auto screenshot failed:', e);
      // Non-fatal; user can still click the button
    }
  } catch (error) {
    console.error('Init error:', error);
    showToast('Fehler beim Laden der Seite', false);
  }
}

// Screenshot capture
async function captureAndShowScreenshot() {
  const dataUrl = await chrome.tabs.captureVisibleTab();
  confirmedImageDataUrl = dataUrl;

  // Load image into canvas
  img = new Image();
  img.onload = () => {
    // Set canvas size - much higher resolution for better quality
    const maxWidth = 1920;  // Full HD width
    const maxHeight = 1080; // Full HD height
    let { width, height } = img;

    // Only downscale if the image is larger than our max dimensions
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }
    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    canvas.width = width;
    canvas.height = height;

    // Draw image
    ctx.drawImage(img, 0, 0, width, height);

    // Show redaction tools
    shotWrap.classList.remove('hidden');
    showToast('Screenshot aufgenommen - ziehe schwarze Kästen über sensible Bereiche');
  };
  img.src = dataUrl;
}

btnShot.addEventListener('click', async () => {
  try {
    await captureAndShowScreenshot();
  } catch (error) {
    console.error('Screenshot error:', error);
    showToast('Screenshot konnte nicht aufgenommen werden', false);
  }
});

// Redaction tools
function relPos(e) {
  const r = canvas.getBoundingClientRect();
  return { 
    x: Math.max(0, Math.min(canvas.width, e.clientX - r.left)), 
    y: Math.max(0, Math.min(canvas.height, e.clientY - r.top)) 
  };
}

// Redaction functions using state management
function startRect(e) { 
  redactionState.startRect(e);
}

function updateRect(e) {
  redactionState.updateRect(e);
}

function finalizeRect() { 
  redactionState.finalizeRect();
}

function normRect(r) {
  const x = r.w < 0 ? r.x + r.w : r.x;
  const y = r.h < 0 ? r.y + r.h : r.y;
  const w = Math.abs(r.w);
  const h = Math.abs(r.h);
  return { x, y, w, h };
}

function redraw() {
  if (!ctx || !img) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#000';
  rects.forEach(r => ctx.fillRect(r.x, r.y, r.w, r.h));
  if (redactionState.draft) { 
    const r = normRect(redactionState.draft); 
    ctx.fillRect(r.x, r.y, r.w, r.h); 
  }
}

// Canvas event listeners
canvas.addEventListener('mousedown', startRect);
canvas.addEventListener('mousemove', updateRect);
canvas.addEventListener('mouseup', finalizeRect);

// Redaction buttons
btnClear.addEventListener('click', () => { 
  rects = []; 
  redactionState.draft = null;
  redraw(); 
});

btnApply.addEventListener('click', () => {
  // Apply rects (already drawn), export to dataURL (PNG)
  confirmedImageDataUrl = canvas.toDataURL('image/png');
  shotWrap.classList.add('hidden');
  showToast('Screenshot bereit');
});

// Send report
btnSend.addEventListener('click', async () => {
  const text = (textEl.value || '').trim();
  if (text.length < 1) { 
    return showToast('Bitte Text eingeben', false); 
  }

  try {
    btnSend.disabled = true;
    btnSend.textContent = 'Sende...';
    
    const res = await fetch(`${API_BASE}/api/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // requires you to be logged in on the site in a tab
      body: JSON.stringify({
        text,
        url: tabInfo.url,
        title: tabInfo.title,
        screenshotDataUrl: confirmedImageDataUrl || null,
        client: { 
          browser: navigator.userAgent, 
          os: navigator.platform 
        }
      })
    });

    if (res.status === 413) { 
      showToast('Bild zu groß (max 5MB)', false); 
      btnSend.disabled = false; 
      btnSend.textContent = 'Senden';
      return; 
    }
    
    if (!res.ok) { 
      const msg = await res.text(); 
      throw new Error(msg || 'Fehler'); 
    }

    showToast('Gesendet – danke!');
    textEl.value = ''; 
    confirmedImageDataUrl = null; 
    rects = []; 
    redraw(); 
    shotWrap.classList.add('hidden');
  } catch (e) {
    console.error(e);
    showToast('Konnte nicht senden (Login?)', false);
  } finally { 
    btnSend.disabled = false; 
    btnSend.textContent = 'Senden';
  }
});

// Toast notifications
function showToast(message, isSuccess = true) {
  toast.textContent = message;
  toast.className = `toast ${isSuccess ? 'success' : 'error'}`;
  toast.classList.remove('hidden');
  
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

// Character counter
textEl.addEventListener('input', () => {
  const remaining = 500 - textEl.value.length;
  const counter = document.getElementById('counter') || document.createElement('div');
  counter.id = 'counter';
  counter.textContent = `${remaining} Zeichen übrig`;
  counter.style.fontSize = '12px';
  counter.style.color = remaining < 50 ? '#dc3545' : '#666';
  
  if (!document.getElementById('counter')) {
    textEl.parentNode.insertBefore(counter, textEl.nextSibling);
  }
});

// Initialize on load
document.addEventListener('DOMContentLoaded', init);