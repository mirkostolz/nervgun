// Configuration
const API_BASE = "https://nervgun-mirkostolz-gmailcoms-projects.vercel.app"; // Production URL

// DOM elements (will be initialized after DOM loads)
let textEl, btnShot, btnSend, btnRemove, shotPreview, previewImg, meta, toast;

// State
let tabInfo = null;
let screenshotDataUrl = null;

// Initialize
async function init() {
  try {
    // Initialize DOM elements
    textEl = document.getElementById('text');
    btnShot = document.getElementById('btn-shot');
    btnSend = document.getElementById('btn-send');
    btnRemove = document.getElementById('btn-remove');
    shotPreview = document.getElementById('shot-preview');
    previewImg = document.getElementById('preview-img');
    meta = document.getElementById('meta');
    toast = document.getElementById('toast');
    
    // Setup event listeners
    btnShot.addEventListener('click', captureScreenshot);
    btnRemove.addEventListener('click', removeScreenshot);
    btnSend.addEventListener('click', sendReport);
    textEl.addEventListener('input', updateCharCounter);
    
    // Get tab info
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    tabInfo = {
      url: tab.url,
      title: tab.title
    };
    
    // Show page info
    const domain = new URL(tab.url).hostname;
    meta.textContent = `${domain} • ${tab.title}`;
    
    // Focus textarea
    textEl.focus();
  } catch (error) {
    console.error('Init error:', error);
    if (toast) showToast('Fehler beim Laden der Seite', false);
  }
}

// Screenshot capture
async function captureScreenshot() {
  try {
    const dataUrl = await chrome.tabs.captureVisibleTab();
    screenshotDataUrl = dataUrl;
    
    // Show preview
    previewImg.src = dataUrl;
    shotPreview.classList.remove('hidden');
    btnShot.textContent = 'Screenshot neu aufnehmen';
    
    showToast('Screenshot aufgenommen');
  } catch (error) {
    console.error('Screenshot error:', error);
    showToast('Screenshot konnte nicht aufgenommen werden', false);
  }
}

// Remove screenshot function
function removeScreenshot() {
  screenshotDataUrl = null;
  shotPreview.classList.add('hidden');
  btnShot.textContent = 'Screenshot anhängen';
  showToast('Screenshot entfernt');
}

// Redaction functionality removed - user should not share sensitive data

// Send report function
async function sendReport() {
  const text = (textEl.value || '').trim();
  if (text.length < 1) { 
    return showToast('Bitte Text eingeben', false); 
  }

  try {
    btnSend.disabled = true;
    btnSend.textContent = 'Sende...';
    
    // Debug: Check if session cookie exists
    const cookieName = '__Secure-next-auth.session-token';
    try {
      const cookies = await chrome.cookies.getAll({
        url: API_BASE,
        name: cookieName
      });
      console.log('Session cookie check:', cookies.length > 0 ? 'Found' : 'Not found');
      if (cookies.length > 0) {
        console.log('Cookie details:', {
          domain: cookies[0].domain,
          sameSite: cookies[0].sameSite,
          secure: cookies[0].secure
        });
      } else {
        console.warn('No session cookie found! User must login at:', API_BASE);
      }
    } catch (e) {
      console.error('Cookie check error:', e);
    }
    
    const res = await fetch(`${API_BASE}/api/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        text,
        url: tabInfo.url,
        title: tabInfo.title,
        screenshotDataUrl: screenshotDataUrl || null,
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
    screenshotDataUrl = null; 
    shotPreview.classList.add('hidden');
    btnShot.textContent = 'Screenshot anhängen';
  } catch (e) {
    console.error(e);
    showToast('Konnte nicht senden (Login?)', false);
  } finally { 
    btnSend.disabled = false; 
    btnSend.textContent = 'Senden';
  }
}

// Toast notifications
function showToast(message, isSuccess = true) {
  toast.textContent = message;
  toast.className = `toast ${isSuccess ? 'success' : 'error'}`;
  toast.classList.remove('hidden');
  
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

// Character counter function
function updateCharCounter() {
  const remaining = 500 - textEl.value.length;
  const counter = document.getElementById('counter') || document.createElement('div');
  counter.id = 'counter';
  counter.textContent = `${remaining} Zeichen übrig`;
  counter.style.fontSize = '12px';
  counter.style.color = remaining < 50 ? '#dc3545' : '#666';
  
  if (!document.getElementById('counter')) {
    textEl.parentNode.insertBefore(counter, textEl.nextSibling);
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);