const $ = id => document.getElementById(id);

// --- Inputs ---
const invTitleInp    = $('invTitle');
const invBodyInp     = $('invBody');
const invDateInp     = $('invDate');
const fontSizeSlider = $('fontSize');
const fontSizeVal    = $('fontSizeVal');
const alignBtns      = document.querySelectorAll('.align-btn');

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
const invDateDisp       = $('invDateDisplay');
const invDateRow        = $('invDateRow');
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

let currentAlign    = 'left';
let currentFontSize = 16;
let ctaPlacement    = 'below';

// ==========================================================
//  DEFAULTS
// ==========================================================
function applyDefaults() {
  invTitleInp.value     = 'Zaproszenie na Szkolenie: Skuteczna Sprzedaż w Turystyce 2025';
  invBodyInp.value      = 'Szanowni Państwo,\n\nMamy przyjemność zaprosić Państwa na profesjonalne szkolenie organizowane przez Dział Szkoleń Urlop.pl.\n\nSzkolenie obejmie następujące tematy:\n• Nowoczesne techniki sprzedaży ofert turystycznych\n• Budowanie relacji z klientem\n• Efektywna komunikacja i prezentacja oferty\n• Narzędzia cyfrowe wspierające sprzedaż\n\nSzkolenie poprowadzą doświadczeni trenerzy z wieloletnią praktyką w branży turystycznej.\n\nProsimy o potwierdzenie uczestnictwa do 10 października 2025 r.';
  invDateInp.value      = '20 października 2025, godz. 10:00 | Hotel Grand Warszawa';
  qrUrlInp.value        = 'https://www.urlop.pl/szkolenie/rejestracja';
}

// ==========================================================
//  SYNC
// ==========================================================
function syncAll() {
  // Title
  invTitleDisp.textContent     = invTitleInp.value;
  invTitleDisp.style.textAlign = currentAlign;

  // Date
  const dateVal = invDateInp.value.trim();
  invDateRow.style.display = dateVal ? 'flex' : 'none';
  invDateDisp.textContent  = dateVal;

  // Body
  invBodyDisp.textContent    = invBodyInp.value;
  invBodyDisp.style.fontSize = currentFontSize + 'px';
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
//  WIRE INPUTS
// ==========================================================
[invTitleInp, invBodyInp, invDateInp, qrUrlInp,
 footerDeptInp, footerCompanyInp, footerAddressInp, footerPhoneInp
].forEach(el => el.addEventListener('input', syncAll));

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
