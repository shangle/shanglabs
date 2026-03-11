/**
 * Main Application Logic
 * Handles file upload, parsing, validation, and UI updates
 */

const parser = new NACHAParser();
const validator = new NACHAValidator();

// Show welcome tip after load (only once per user)
window.addEventListener('DOMContentLoaded', () => {
  showWelcomeTip();
});

function showWelcomeTip() {
  // Only show once per user
  if (localStorage.getItem('nacha-viewer-welcome-shown')) {
    return;
  }
  
  const tip = document.createElement('div');
  tip.className = 'welcome-tip';
  tip.innerHTML = `
    <div class="tip-content">
      <div class="tip-icon">💡</div>
      <div class="tip-text">
        <strong>Pro Tip:</strong> Drag & drop your NACHA file directly, or click anywhere to browse.
        <br><small>Supports CCD (Corporate) and PPD (Consumer) file types.</small>
      </div>
      <button class="tip-close" onclick="this.closest('.welcome-tip').remove()">✕</button>
    </div>
  `;
  document.querySelector('.container').appendChild(tip);

  // Mark as shown
  localStorage.setItem('nacha-viewer-welcome-shown', 'true');

  // Auto-dismiss after 8 seconds
  setTimeout(() => {
    if (tip.parentElement) {
      tip.style.opacity = '0';
      setTimeout(() => tip.remove(), 300);
    }
  }, 8000);
}

function animateRecordCards() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.record-card').forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = `opacity 0.4s ease ${index * 0.05}s, transform 0.4s ease ${index * 0.05}s`;
    observer.observe(el);
  });
}

// DOM Elements
const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const resultsSection = document.getElementById('resultsSection');
const fileInfo = document.getElementById('fileInfo');
const validationStatus = document.getElementById('validationStatus');
const searchInput = document.getElementById('searchInput');
const searchType = document.getElementById('searchType');
const exportBtn = document.getElementById('exportBtn');
const statsBar = document.getElementById('statsBar');
const treeView = document.getElementById('treeView');
const recordView = document.getElementById('recordView');

// State
let currentData = null;
let currentFile = null;

// Event Listeners
uploadBox.addEventListener('click', () => fileInput.click());
uploadBox.addEventListener('dragover', handleDragOver);
uploadBox.addEventListener('dragleave', handleDragLeave);
uploadBox.addEventListener('drop', handleDrop);
fileInput.addEventListener('change', handleFileSelect);
searchInput.addEventListener('input', handleSearch);
searchType.addEventListener('change', handleSearch);
exportBtn.addEventListener('click', handleExport);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Escape to reset
  if (e.key === 'Escape' && currentData) {
    resetApp();
  }
  // Cmd/Ctrl + O to open file
  if ((e.metaKey || e.ctrlKey) && e.key === 'o') {
    e.preventDefault();
    if (currentData) {
      resetApp();
    }
    fileInput.click();
  }
  // Cmd/Ctrl + S to export
  if ((e.metaKey || e.ctrlKey) && e.key === 's' && currentData) {
    e.preventDefault();
    handleExport();
  }
});

// Drag and Drop Handlers
function handleDragOver(e) {
  e.preventDefault();
  uploadBox.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.preventDefault();
  uploadBox.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  uploadBox.classList.remove('drag-over');

  const files = e.dataTransfer.files;
  if (files.length > 0) {
    processFile(files[0]);
  }
}

function handleFileSelect(e) {
  const files = e.target.files;
  if (files.length > 0) {
    processFile(files[0]);
  }
}

// File Processing
function processFile(file) {
  currentFile = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target.result;
      const data = parser.parse(content);
      currentData = data;

      const validation = validator.validate(data);

      displayResults(data, validation, file);
    } catch (error) {
      displayError(error.message);
    }
  };

  reader.onerror = () => {
    displayError('Error reading file. Please try again.');
  };

  reader.readAsText(file);
}

// Display Results
function displayResults(data, validation, file) {
  uploadBox.style.display = 'none';
  resultsSection.style.display = 'block';

  // Show file info
  fileInfo.innerHTML = `
    <div class="file-info-content">
      <h3>📄 ${file.name}</h3>
      <p>Size: ${formatFileSize(file.size)} • Records: ${data.totalRecords}</p>
    </div>
  `;

  // Show validation status
  if (validation.isValid) {
    validationStatus.className = 'validation-status valid';
    const secDescription = data.fileSEC === 'PPD' ? 'PPD Consumer' : 'CCD Corporate Credit/Debit';
    validationStatus.innerHTML = `
      <div class="status-icon">✅</div>
      <div>
        <strong>File is Valid</strong>
        <p>${secDescription} file passed all validation checks</p>
      </div>
    `;
  } else {
    validationStatus.className = 'validation-status invalid';
    validationStatus.innerHTML = `
      <div class="status-icon">❌</div>
      <div>
        <strong>Validation Failed</strong>
        <p>${validation.errors.length} error(s) found</p>
      </div>
    `;
  }

  // Show warnings
  if (validation.warnings.length > 0) {
    const warningHtml = validation.warnings.map(w =>
      `<div class="warning-item">⚠️ ${w}</div>`
    ).join('');

    if (validation.warnings.length > 0) {
      validationStatus.innerHTML += `
        <div class="warnings-section">
          ${warningHtml}
        </div>
      `;
    }
  }

  // Show errors
  if (validation.errors.length > 0) {
    const errorHtml = validation.errors.map(e =>
      `<div class="error-item">🚨 ${e}</div>`
    ).join('');

    validationStatus.innerHTML += `
      <div class="errors-section">
        ${errorHtml}
      </div>
    `;
  }

  // Show stats
  statsBar.innerHTML = `
    <span><strong>Batches:</strong> ${validation.summary.batchCount}</span>
    <span><strong>Entries:</strong> ${validation.summary.totalEntries}</span>
    <span><strong>Total Debits:</strong> $${validation.summary.totalDebits.toFixed(2)}</span>
    <span><strong>Total Credits:</strong> $${validation.summary.totalCredits.toFixed(2)}</span>
    <span><strong>Net:</strong> $${validation.summary.netAmount.toFixed(2)}</span>
  `;

  // Build tree view
  buildTreeView(data);

  // Show all entries
  renderEntries(data.batches);
}

// Build Tree View
function buildTreeView(data) {
  let html = '';

  data.batches.forEach((batch, batchIndex) => {
    const batchNum = batch.batchNumber || batchIndex + 1;
    const creditDebit = getBatchCreditDebit(batch);

    html += `
      <div class="tree-item tree-batch" onclick="showBatch(${batchIndex})">
        <span class="tree-icon">📦</span>
        <span class="tree-label">Batch ${batchNum}: ${batch.companyName}</span>
        <span class="tree-count">${batch.entries.length} entries</span>
      </div>
    `;
  });

  treeView.innerHTML = html || '<p>No batches found</p>';
}

// Render Entries
function renderEntries(batches) {
  let html = '';

  batches.forEach((batch, batchIndex) => {
    const batchNum = batch.batchNumber || batchIndex + 1;

    batch.entries.forEach((entry, entryIndex) => {
      const transactionType = ['22', '23', '32', '33'].includes(entry.transactionCode) ? 'credit' : 'debit';
      const amountClass = transactionType === 'credit' ? 'amount-credit' : 'amount-debit';
      const amountPrefix = transactionType === 'credit' ? '+' : '-';

      html += `
        <div class="record-card">
          <div class="record-header">
            <span class="record-batch">Batch ${batchNum}</span>
            <span class="record-type ${transactionType}">${entry.transactionCodeDescription}</span>
            <span class="record-amount ${amountClass}">${amountPrefix}$${entry.amount.toFixed(2)}</span>
          </div>

          <div class="record-details">
            <div class="detail-row">
              <span class="detail-label">Account:</span>
              <span class="detail-value">${entry.receivingDFIAccountNumber}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Name:</span>
              <span class="detail-value">${entry.individualName}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Trace Number:</span>
              <span class="detail-value">${entry.traceNumber}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">DFI Routing:</span>
              <span class="detail-value">${entry.receivingDFIIdentification}-${entry.checkDigit}</span>
            </div>

            ${entry.addenda && entry.addenda.length > 0 ? `
              <div class="addenda-section">
                <span class="addenda-header">Addenda (${entry.addenda.length}):</span>
                ${entry.addenda.map(addenda => `
                  <div class="addenda-content">
                    ${addenda.paymentRelatedInformation}
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      `;
    });
  });

  recordView.innerHTML = html || '<p>No entries to display</p>';
  
  // Animate cards on load
  animateRecordCards();
}

// Show Specific Batch
function showBatch(batchIndex) {
  if (!currentData || !currentData.batches[batchIndex]) return;

  const batch = currentData.batches[batchIndex];
  renderEntries([batch]);
}

// Search Handler
function handleSearch() {
  const query = searchInput.value.trim();
  const type = searchType.value;

  if (query.length === 0) {
    renderEntries(currentData.batches);
    return;
  }

  const results = parser.search(query, type);

  if (results.length === 0) {
    recordView.innerHTML = '<p class="no-results">No matching entries found</p>';
    return;
  }

  // Render search results
  let html = `<p class="search-count">Found ${results.length} matching entries</p>`;

  results.forEach((result, index) => {
    const entry = result.entry;
    const transactionType = ['22', '23', '32', '33'].includes(entry.transactionCode) ? 'credit' : 'debit';
    const amountClass = transactionType === 'credit' ? 'amount-credit' : 'amount-debit';
    const amountPrefix = transactionType === 'credit' ? '+' : '-';

    html += `
      <div class="record-card search-result">
        <div class="record-header">
          <span class="record-batch">${result.batchName}</span>
          <span class="record-type ${transactionType}">${entry.transactionCodeDescription}</span>
          <span class="record-amount ${amountClass}">${amountPrefix}$${entry.amount.toFixed(2)}</span>
        </div>

        <div class="record-details">
          <div class="detail-row">
            <span class="detail-label">Account:</span>
            <span class="detail-value">${entry.receivingDFIAccountNumber}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">Name:</span>
            <span class="detail-value">${entry.individualName}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">Trace Number:</span>
            <span class="detail-value">${entry.traceNumber}</span>
          </div>
        </div>
      </div>
    `;
  });

  recordView.innerHTML = html;
}

// Export to CSV
function handleExport() {
  if (!currentData) return;

  const csvContent = parser.exportToCSV();
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  const filename = currentFile ?
    currentFile.name.replace(/\.[^/.]+$/, '') + '_export.csv' :
    'nacha_export.csv';

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Display Error
function displayError(message) {
  uploadBox.style.display = 'none';

  resultsSection.style.display = 'block';
  validationStatus.className = 'validation-status invalid';
  validationStatus.innerHTML = `
    <div class="status-icon">❌</div>
    <div>
      <strong>Error Processing File</strong>
      <p>${message}</p>
      <button class="btn btn-secondary" onclick="resetApp()">Try Another File</button>
    </div>
  `;

  statsBar.innerHTML = '';
  treeView.innerHTML = '';
  recordView.innerHTML = '';
}

// Reset App
function resetApp() {
  currentData = null;
  currentFile = null;
  searchInput.value = '';

  uploadBox.style.display = 'block';
  resultsSection.style.display = 'none';

  fileInput.value = '';
}

// Utility Functions
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function getBatchCreditDebit(batch) {
  if (batch.serviceClassCode === '220') return 'Credits Only';
  if (batch.serviceClassCode === '225') return 'Debits Only';
  return 'Mixed';
}

// Make functions globally available for HTML onclick handlers
window.showBatch = showBatch;
window.resetApp = resetApp;
