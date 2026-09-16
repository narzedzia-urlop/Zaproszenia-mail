const $ = id => document.getElementById(id);

// --- Inputs ---
const invTitleInp         = $('invTitle');
const invBodyInp          = $('invBody');
const invDateInp          = $('invDate');
const invLocationInp      = $('invLocation');
const titleFontSizeSlider = $('titleFontSize');
const titleFontSizeVal    = $('titleFontSizeVal');
const fontSizeSlider      = $('fontSize');
const fontSizeVal         = $('fontSizeVal');
const alignBtns           = document.querySelectorAll('.align-btn');
const btnBold             = $('btnBold');
const btnBullet           = $('btnBullet');

// --- QR ---
const qrUrlInp       = $('qrUrl');
const placeBelowBtn  = $('placeBelowBtn');
const placeFooterBtn = $('placeFooterBtn');
const invQrBelow     = $('invQrBelow');
const invQrFooter    = $('invQrFooter');
const qrCanvasBelow  = $('qrCanvasBelow');
const qrCanvasFooter = $('qrCanvasFooter');

// --- Footer inputs ---
const footerDeptInp    = $('footerDept');
const footerCompanyInp = $('footerCompany');
const footerAddressInp = $('footerAddress');
const footerPhoneInp   = $('footerPhone');

// --- Canvas displays ---
const invTitleDisp      = $('invTitleDisplay');
const invMetaRow        = $('invMetaRow');
const invDateItem       = $('invDateItem');
const invDateDisp       = $('invDateDisplay');
const invLocationItem   = $('invLocationItem');
const invLocationDisp   = $('invLocationDisplay');
const invBodyDisp       = $('invBodyDisplay');
const footerDeptDisp    = $('footerDeptDisplay');
const footerCompanyDisp = $('footerCompanyDisplay');
const footerAddressDisp = $('footerAddressDisplay');
const footerPhoneDisp   = $('footerPhoneDisplay');

// --- Scaler ---
const canvas         = $('invitationCanvas');
const previewScaler  = $('previewScaler');
const previewWrapper = $('previewWrapper');
const previewDims    = $('previewDims');
const btnExport      = $('btnExport');
const exportOverlay  = $('exportOverlay');
const toastSuccess   = $('toastSuccess');

let currentAlign         = 'left';
let currentTitleFontSize = 30;
let currentFontSize      = 16;
let ctaPlacement         = 'below';

// ==========================================================
//  DEFAULTS
// ==========================================================
function applyDefaults() {
  invTitleInp.value     = 'Zaproszenie na Szkolenie: Skuteczna Sprzedaż w Turystyce 2025';
  invBodyInp.value      = 'Szanowni Państwo,\n\nMamy przyjemność zaprosić Państwa na profesjonalne szkolenie organizowane przez **Dział Szkoleń Urlop.pl**.\n\nSzkolenie obejmie kluczowe tematy:\n• **Nowoczesne techniki sprzedaży** ofert turystycznych\n• **Budowanie relacji** z wymagającym klientem\n• **Efektywna komunikacja** i prezentacja oferty\n• **Narzędzia cyfrowe** wspierające codzienną pracę\n\nSzkolenie poprowadzą doświadczeni trenerzy z wieloletnią praktyką w branży turystycznej.\n\n**Prosimy o potwierdzenie uczestnictwa** do 10 października 2025 r.';
  invDateInp.value      = '20 października 2025, godz. 10:00';
  invLocationInp.value  = 'Hotel Grand Warszawa';
  qrUrlInp.value        = 'https://www.urlop.pl/szkolenie/rejestracja';
}

// ==========================================================
//  FORMATTING (Markdown to HTML)
// ==========================================================
function formatBodyText(raw) {
  if (!raw) return '';
  // 1. Escape HTML
  let escaped = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 2. Parse **bold** and <b>...</b>
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>');
  escaped = escaped.replace(/&lt;b&gt;(.*?)&lt;\/b&gt;/gi, '<strong>$1</strong>');
  escaped = escaped.replace(/&lt;strong&gt;(.*?)&lt;\/strong&gt;/gi, '<strong>$1</strong>');
  escaped = escaped.replace(/&lt;i&gt;(.*?)&lt;\/i&gt;/gi, '<em>$1</em>');
  escaped = escaped.replace(/&lt;em&gt;(.*?)&lt;\/em&gt;/gi, '<em>$1</em>');

  return escaped;
}

// ==========================================================
//  SYNC
// ==========================================================
function syncAll() {
  // Title
  invTitleDisp.textContent     = invTitleInp.value;
  invTitleDisp.style.fontSize  = currentTitleFontSize + 'px';
  invTitleDisp.style.textAlign = currentAlign;

  // Date & Location
  const dateVal = invDateInp.value.trim();
  const locVal  = invLocationInp.value.trim();

  if (dateVal) {
    invDateDisp.textContent = dateVal;
    invDateItem.style.display = 'inline-flex';
  } else {
    invDateItem.style.display = 'none';
  }

  if (locVal) {
    invLocationDisp.textContent = locVal;
    invLocationItem.style.display = 'inline-flex';
  } else {
    invLocationItem.style.display = 'none';
  }

  invMetaRow.style.display = (dateVal || locVal) ? 'flex' : 'none';
  invMetaRow.style.justifyContent = currentAlign === 'center' ? 'center' : (currentAlign === 'right' ? 'flex-end' : 'flex-start');

  // Body
  invBodyDisp.innerHTML     = formatBodyText(invBodyInp.value);
  invBodyDisp.style.fontSize  = currentFontSize + 'px';
  invBodyDisp.style.textAlign = currentAlign;

  // QR
  const url = qrUrlInp.value.trim();
  if (url) {
    renderQR(qrCanvasBelow, url, 140);
    renderQR(qrCanvasFooter, url, 96);
    invQrBelow.style.display  = ctaPlacement === 'below'  ? 'flex' : 'none';
    invQrFooter.style.display = ctaPlacement === 'footer' ? 'flex' : 'none';
  } else {
    invQrBelow.style.display  = 'none';
    invQrFooter.style.display = 'none';
  }

  // Footer
  footerDeptDisp.textContent    = footerDeptInp.value;
  footerCompanyDisp.textContent = footerCompanyInp.value;
  footerAddressDisp.textContent = footerAddressInp.value;
  footerPhoneDisp.textContent   = footerPhoneInp.value;

  requestAnimationFrame(updateDims);
}

// ==========================================================
//  QR RENDERING (white on transparent)
// ==========================================================
function renderQR(canvasEl, value, size) {
  try {
    new QRious({
      element: canvasEl,
      value: value,
      size: size,
      foreground: '#ffffff',
      background: 'transparent',
      level: 'M',
      padding: 6
    });
  } catch(e) {
    console.error('QR error:', e);
  }
}

// ==========================================================
//  TOOLBAR ACTIONS
// ==========================================================
btnBold.addEventListener('click', () => {
  wrapTextareaSelection(invBodyInp, '**', '**', 'pogrubiony tekst');
  syncAll();
});

btnBullet.addEventListener('click', () => {
  insertAtTextareaCursor(invBodyInp, '• ');
  syncAll();
});

function wrapTextareaSelection(textarea, prefix, suffix, placeholder) {
  const start = textarea.selectionStart;
  const end   = textarea.selectionEnd;
  const val   = textarea.value;

  if (start !== end) {
    const selected = val.substring(start, end);
    textarea.value = val.substring(0, start) + prefix + selected + suffix + val.substring(end);
    textarea.focus();
    textarea.setSelectionRange(start + prefix.length, end + prefix.length);
  } else {
    textarea.value = val.substring(0, start) + prefix + placeholder + suffix + val.substring(end);
    textarea.focus();
    textarea.setSelectionRange(start + prefix.length, start + prefix.length + placeholder.length);
  }
}

function insertAtTextareaCursor(textarea, text) {
  const start = textarea.selectionStart;
  const end   = textarea.selectionEnd;
  const val   = textarea.value;

  textarea.value = val.substring(0, start) + text + val.substring(end);
  textarea.focus();
  textarea.setSelectionRange(start + text.length, start + text.length);
}

// ==========================================================
//  WIRE INPUTS
// ==========================================================
[invTitleInp, invBodyInp, invDateInp, invLocationInp, qrUrlInp,
 footerDeptInp, footerCompanyInp, footerAddressInp, footerPhoneInp
].forEach(el => el.addEventListener('input', syncAll));

titleFontSizeSlider.addEventListener('input', () => {
  currentTitleFontSize = parseInt(titleFontSizeSlider.value);
  titleFontSizeVal.textContent = currentTitleFontSize + 'px';
  syncAll();
});

fontSizeSlider.addEventListener('input', () => {
  currentFontSize = parseInt(fontSizeSlider.value);
  fontSizeVal.textContent = currentFontSize + 'px';
  syncAll();
});

alignBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    alignBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentAlign = btn.dataset.align;
    syncAll();
  });
});

[placeBelowBtn, placeFooterBtn].forEach(btn => {
  btn.addEventListener('click', () => {
    [placeBelowBtn, placeFooterBtn].forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    ctaPlacement = btn.dataset.pos;
    syncAll();
  });
});

// ==========================================================
//  PREVIEW SCALER
// ==========================================================
function scalePreview() {
  const wrapW = previewWrapper.clientWidth - 40;
  const scale = Math.min(1, wrapW / 900);
  canvas.style.transform       = 'scale(' + scale + ')';
  canvas.style.transformOrigin = 'top left';
  requestAnimationFrame(() => {
    previewScaler.style.width  = Math.round(900 * scale) + 'px';
    previewScaler.style.height = Math.round(canvas.scrollHeight * scale) + 'px';
    updateDims();
  });
}

function updateDims() {
  previewDims.textContent = '900 x ' + canvas.scrollHeight + ' px';
}

new ResizeObserver(scalePreview).observe(previewWrapper);
window.addEventListener('resize', scalePreview);

// ==========================================================
//  EXPORT
// ==========================================================
btnExport.addEventListener('click', async () => {
  exportOverlay.classList.remove('hidden');
  const prevTransform = canvas.style.transform;
  canvas.style.transform = 'none';
  await sleep(150);

  try {
    const result = await html2canvas(canvas, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#18a95d',
      logging: false,
      width: 900,
      windowWidth: 900,
      scrollX: 0,
      scrollY: 0
    });
    
    const link = document.createElement('a');
    link.href = result.toDataURL('image/jpeg', 0.95);
    link.download = 'zaproszenie-urlop.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast();
  } catch (err) {
    console.error('Export error:', err);
    alert('Błąd eksportu: ' + err.message);
  } finally {
    canvas.style.transform = prevTransform;
    exportOverlay.classList.add('hidden');
    scalePreview();
  }
});

function showToast() {
  toastSuccess.classList.remove('hidden');
  setTimeout(() => toastSuccess.classList.add('hidden'), 3000);
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ==========================================================
//  INIT
// ==========================================================
applyDefaults();
syncAll();
scalePreview();
