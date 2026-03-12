/**
 * Main Application Logic
 * Handles file upload, parsing, validation, and UI updates
 */

const parser = new NACHAParser();
const validator = new NACHAValidator();

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
const welcomeTip = document.getElementById('welcomeTip');

// State
let currentData = null;
let currentFile = null;

// Welcome Tips
const welcomeTips = [
  '💡 Tip: Drag and drop your NACHA file onto the upload area for quick access',
  '💡 Tip: Press Ctrl+K (or Cmd+K on Mac) to focus the search box',
  '💡 Tip: Press Escape to reset and load a new file',
  '💡 Tip: Click a batch in the sidebar to filter entries by batch',
  '💡 Tip: Export to CSV for further analysis in Excel or Google Sheets',
  '💡 Tip: This viewer supports both CCD and PPD file formats',
  '💡 Tip: Your file never leaves your browser - 100% client-side processing'
];

let currentTipIndex = 0;

function rotateWelcomeTip() {
  if (!welcomeTip) return;
  currentTipIndex = (currentTipIndex + 1) % welcomeTips.length;
  welcomeTip.style.opacity = '0';
  welcomeTip.style.transform = 'translateY(-10px)';
  setTimeout(() => {
    welcomeTip.textContent = welcomeTips[currentTipIndex];
    welcomeTip.style.opacity = '1';
    welcomeTip.style.transform = 'translateY(0)';
  }, 200);
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + K = Focus search
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    if (searchInput && resultsSection.style.display !== 'none') {
      searchInput.focus();
    }
  }
  
  // Escape = Reset app
  if (e.key === 'Escape') {
    if (resultsSection.style.display !== 'none') {
      resetApp();
    }
  }
  
  // Ctrl/Cmd + E = Export CSV
  if ((e.ctrlKey || e.metaKey) && e.key === 'e' && currentData) {
    e.preventDefault();
    handleExport();
  }
});

// Initialize welcome tip rotation
setInterval(rotateWelcomeTip, 6000);

// Event Listeners
uploadBox.addEventListener('click', () => fileInput.click());
uploadBox.addEventListener('dragover', handleDragOver);
uploadBox.addEventListener('dragleave', handleDragLeave);
uploadBox.addEventListener('drop', handleDrop);
fileInput.addEventListener('change', handleFileSelect);
searchInput.addEventListener('input', handleSearch);
searchType.addEventListener('change', handleSearch);
exportBtn.addEventListener('click', handleExport);

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
    <button class="btn btn-secondary btn-small" onclick="resetApp()">Load New File</button>
  `;

  // Show validation status
  const secType = data.batches[0]?.standardEntryClassCode || 'Unknown';
  const secDescription = secType === 'CCD' ? 'Corporate Credit/Debit' : 
                         secType === 'PPD' ? 'Prearranged Payment and Deposit' : secType;
  
  if (validation.isValid) {
    validationStatus.className = 'validation-status valid';
    validationStatus.innerHTML = `
      <div class="status-icon">✅</div>
      <div>
        <strong>File is Valid</strong>
        <p>${secDescription} (${secType}) file passed all validation checks</p>
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
    <div class="stat-item">
      <span class="stat-label">Batches</span>
      <span class="stat-value">${validation.summary.batchCount}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Entries</span>
      <span class="stat-value">${validation.summary.totalEntries}</span>
    </div>
    <div class="stat-item stat-credit">
      <span class="stat-label">Credits</span>
      <span class="stat-value">$${validation.summary.totalCredits.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
    </div>
    <div class="stat-item stat-debit">
      <span class="stat-label">Debits</span>
      <span class="stat-value">$${validation.summary.totalDebits.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
    </div>
    <div class="stat-item stat-net ${validation.summary.netAmount >= 0 ? 'positive' : 'negative'}">
      <span class="stat-label">Net</span>
      <span class="stat-value">${validation.summary.netAmount >= 0 ? '+' : ''}$${validation.summary.netAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
    </div>
  `;

  // Build tree view
  buildTreeView(data);

  // Show all entries
  currentData.viewingAll = true;
  renderEntries(data.batches);
}

// Build Tree View
function buildTreeView(data) {
  let html = `
    <div class="tree-item tree-all ${currentData.viewingAll ? 'active' : ''}" onclick="showAllBatches()">
      <span class="tree-icon">📋</span>
      <span class="tree-label">All Entries</span>
      <span class="tree-count">${data.batches.reduce((sum, b) => sum + b.entries.length, 0)}</span>
    </div>
  `;

  data.batches.forEach((batch, batchIndex) => {
    const batchNum = batch.batchNumber || batchIndex + 1;
    const creditDebit = getBatchCreditDebit(batch);
    const secCode = batch.standardEntryClassCode || 'CCD';
    
    // Calculate batch totals
    let batchCredits = 0, batchDebits = 0;
    batch.entries.forEach(e => {
      if (['22', '23', '32', '33'].includes(e.transactionCode)) {
        batchCredits += e.amount;
      } else {
        batchDebits += e.amount;
      }
    });

    html += `
      <div class="tree-item tree-batch" onclick="showBatch(${batchIndex})">
        <span class="tree-icon">📦</span>
        <div class="tree-batch-info">
          <span class="tree-label">Batch ${batchNum}: ${batch.companyName}</span>
          <span class="tree-meta">${secCode} • ${creditDebit} • ${batch.entries.length} entries</span>
          <span class="tree-totals">
            ${batchCredits > 0 ? `<span class="tree-credit">+$${batchCredits.toFixed(2)}</span>` : ''}
            ${batchDebits > 0 ? `<span class="tree-debit">-$${batchDebits.toFixed(2)}</span>` : ''}
          </span>
        </div>
      </div>
    `;
  });

  treeView.innerHTML = html || '<p>No batches found</p>';
}

// Show All Batches
function showAllBatches() {
  if (!currentData) return;
  currentData.viewingAll = true;
  renderEntries(currentData.batches);
  
  // Update active state
  document.querySelectorAll('.tree-item').forEach(item => item.classList.remove('active'));
  document.querySelector('.tree-all')?.classList.add('active');
}

// Render Entries with Staggered Animation
function renderEntries(batches) {
  let html = '';
  let cardIndex = 0;

  batches.forEach((batch, batchIndex) => {
    const batchNum = batch.batchNumber || batchIndex + 1;

    batch.entries.forEach((entry, entryIndex) => {
      const transactionType = ['22', '23', '32', '33'].includes(entry.transactionCode) ? 'credit' : 'debit';
      const amountClass = transactionType === 'credit' ? 'amount-credit' : 'amount-debit';
      const amountPrefix = transactionType === 'credit' ? '+' : '-';
      
      // Staggered animation delay
      const delay = Math.min(cardIndex * 30, 500); // Cap at 500ms

      html += `
        <div class="record-card record-card-animate${entry.amount >= 10000 ? ' large-amount' : ''}" style="animation-delay: ${delay}ms; opacity: 0;">
          <div class="record-header">
            <span class="record-batch">Batch ${batchNum}</span>
            <span class="record-type ${transactionType}">${entry.transactionCodeDescription}</span>
            <span class="record-amount ${amountClass}">${amountPrefix}$${entry.amount.toFixed(2)}</span>
            ${entry.amount >= 10000 ? '<span class="large-badge" title="Transaction over $10,000">⚠️ Large</span>' : ''}
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
              <button class="copy-btn" onclick="copyToClipboard('${entry.traceNumber}', this)" title="Copy trace number">Copy</button>
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
      cardIndex++;
    });
  });

  recordView.innerHTML = html || '<p>No entries to display</p>';
  
  // Trigger animations after a brief delay
  requestAnimationFrame(() => {
    const cards = recordView.querySelectorAll('.record-card-animate');
    cards.forEach((card, i) => {
      setTimeout(() => {
        card.style.opacity = '1';
      }, i * 30);
    });
  });
}

// Show Specific Batch
function showBatch(batchIndex) {
  if (!currentData || !currentData.batches[batchIndex]) return;

  const batch = currentData.batches[batchIndex];
  currentData.viewingAll = false;
  currentFilter = 'all';
  updateFilterButtons();
  renderEntries([batch]);
  
  // Update active state
  document.querySelectorAll('.tree-item').forEach(item => item.classList.remove('active'));
  document.querySelectorAll('.tree-batch')[batchIndex]?.classList.add('active');
}

// Show All Batches
function showAllBatches() {
  if (!currentData) return;
  currentData.viewingAll = true;
  currentFilter = 'all';
  updateFilterButtons();
  renderEntries(currentData.batches);
  
  // Update active state
  document.querySelectorAll('.tree-item').forEach(item => item.classList.remove('active'));
  document.querySelector('.tree-all')?.classList.add('active');
}

// Filter state
let currentFilter = 'all';

// Filter entries by credit/debit/large
function filterEntries(filter) {
  if (!currentData) return;
  currentFilter = filter;
  updateFilterButtons();
  
  if (filter === 'all') {
    renderEntries(currentData.batches);
    return;
  }
  
  // Filter entries
  const filteredBatches = currentData.batches.map(batch => ({
    ...batch,
    entries: batch.entries.filter(entry => {
      if (filter === 'large') {
        return entry.amount >= 10000;
      }
      const isCredit = ['22', '23', '32', '33'].includes(entry.transactionCode);
      return filter === 'credit' ? isCredit : !isCredit;
    })
  })).filter(batch => batch.entries.length > 0);
  
  if (filteredBatches.length === 0) {
    recordView.innerHTML = `<p class="no-results">No ${filter === 'large' ? 'large transactions ($10k+)' : filter + 's'} found</p>`;
    return;
  }
  
  renderEntries(filteredBatches);
}

function updateFilterButtons() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === currentFilter);
  });
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

// Export to JSON
function exportJSON() {
  if (!currentData) return;
  
  const exportData = {
    fileName: currentFile?.name || 'unknown',
    exportedAt: new Date().toISOString(),
    fileHeader: currentData.fileHeader,
    batches: currentData.batches.map(batch => ({
      batchNumber: batch.batchNumber,
      companyName: batch.companyName,
      serviceClassCode: batch.serviceClassCode,
      standardEntryClassCode: batch.standardEntryClassCode,
      entryCount: batch.entries.length,
      entries: batch.entries.map(entry => ({
        transactionCode: entry.transactionCode,
        transactionType: ['22', '23', '32', '33'].includes(entry.transactionCode) ? 'credit' : 'debit',
        amount: entry.amount,
        name: entry.individualName,
        account: entry.receivingDFIAccountNumber,
        traceNumber: entry.traceNumber,
        receivingDFI: `${entry.receivingDFIIdentification}-${entry.checkDigit}`
      })),
      batchControl: batch.batchControl
    })),
    fileControl: currentData.fileControl
  };
  
  const jsonContent = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const filename = currentFile ?
    currentFile.name.replace(/\.[^/.]+$/, '') + '_export.json' :
    'nacha_export.json';
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function getBatchCreditDebit(batch) {
  if (batch.serviceClassCode === '220') return 'Credits Only';
  if (batch.serviceClassCode === '225') return 'Debits Only';
  return 'Mixed';
}

// Make functions globally available for HTML onclick handlers
window.showBatch = showBatch;
window.showAllBatches = showAllBatches;
window.resetApp = resetApp;
window.copyToClipboard = copyToClipboard;
window.filterEntries = filterEntries;
window.printSummary = printSummary;
window.toggleTheme = toggleTheme;
window.exportJSON = exportJSON;
window.filterEntries = filterEntries;

// Generate Sample CCD File
function generateSampleCCD() {
  const now = new Date();
  const date = now.toISOString().slice(2, 8); // YYMMDD
  const time = now.toISOString().slice(9, 13); // HHMM
  
  // File Header (Record Type 1)
  const fileHeader = 
    '1' +                                    // Record Type
    '01' +                                   // Priority Code
    ' 12345678' +                            // Immediate Destination (space + routing)
    ' 87654321' +                            // Immediate Origin
    date +                                   // File Creation Date
    time +                                   // File Creation Time
    'A' +                                    // File ID Modifier
    '094' +                                  // Record Size
    '10' +                                   // Blocking Factor
    '1' +                                    // Format Code
    'SAMPLE BANK           ' +               // Immediate Destination Name (23 chars)
    'YOUR COMPANY          ' +               // Immediate Origin Name (23 chars)
    'REF12345';                              // Reference Code (8 chars)

  // Batch Header (Record Type 5)
  const batchHeader = 
    '5' +                                    // Record Type
    '220' +                                  // Service Class Code (Credits Only)
    'YOUR COMPANY   ' +                      // Company Name (16 chars)
    '12345678901234567890' +                 // Company Identification (20 chars)
    'PPD' +                                  // Standard Entry Class
    'PAYROLL  ' +                            // Company Entry Description (10 chars)
    date +                                   // Company Descriptive Date
    date +                                   // Effective Entry Date
    '   ' +                                  // Settlement Date (blank)
    '1' +                                    // Originator Status Code
    '12345678' +                             // ODFI Identification
    '0000001';                               // Batch Number

  // Entry Detail Records (Record Type 6)
  const entries = [
    { name: 'JOHN DOE           ', account: '1234567890123456', amount: 150000, trace: 1 },
    { name: 'JANE SMITH         ', account: '9876543210987654', amount: 250000, trace: 2 },
    { name: 'BOB JOHNSON        ', account: '5555666677778888', amount: 175000, trace: 3 },
  ];

  let entryRecords = '';
  let entryCount = 0;
  let totalDebits = 0;
  let totalCredits = 0;
  let entryHash = 0;

  entries.forEach(e => {
    const entryRecord = 
      '6' +                                  // Record Type
      '22' +                                 // Transaction Code (Credit to Checking)
      '12345678' +                           // Receiving DFI Identification
      '5' +                                  // Check Digit
      e.account.padEnd(17, ' ') +            // Account Number (17 chars)
      '               ' +                    // Individual ID (15 chars)
      e.name +                               // Individual Name (22 chars)
      '  ' +                                 // Discretionary Data
      '0' +                                  // Addenda Record Indicator
      '12345678' +                           // ODFI Identification
      String(e.trace).padStart(7, '0');      // Trace Number Sequence

    entryRecords += entryRecord + '\n';
    entryCount++;
    totalCredits += e.amount;
    entryHash += parseInt('12345678');
  });

  // Batch Control (Record Type 8)
  const batchControl = 
    '8' +                                    // Record Type
    '220' +                                  // Service Class Code
    String(entryCount).padStart(6, '0') +    // Entry/Addenda Count
    String(entryHash).slice(-10).padStart(10, '0') + // Entry Hash
    String(totalDebits).padStart(12, '0') +  // Total Debit Entry Amount
    String(totalCredits).padStart(12, '0') + // Total Credit Entry Amount
    '12345678901234567890' +                 // Company Identification
    '         ' +                            // Message Authentication Code
    '      ' +                               // Reserved
    '12345678' +                             // ODFI Identification
    '0000001';                               // Batch Number

  // File Control (Record Type 9)
  const fileControl = 
    '9' +                                    // Record Type
    '000001' +                               // Batch Count
    '000001' +                               // Block Count
    String(entryCount).padStart(8, '0') +    // Entry/Addenda Count
    String(entryHash).slice(-10).padStart(10, '0') + // Entry Hash
    String(totalDebits).padStart(12, '0') +  // Total Debit Entry Amount
    String(totalCredits).padStart(12, '0') + // Total Credit Entry Amount
    '                                       '; // Reserved (39 chars)

  const content = fileHeader + '\n' + 
                  batchHeader + '\n' + 
                  entryRecords + 
                  batchControl + '\n' + 
                  fileControl + '\n' +
                  '9' + ' '.repeat(93);     // EOF Block

  return content;
}

// Download Sample File
function downloadSampleFile() {
  const content = generateSampleCCD();
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', 'sample_ccd_file.ach');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Copy to Clipboard
function copyToClipboard(text, button) {
  navigator.clipboard.writeText(text).then(() => {
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    button.classList.add('copied');
    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('copied');
    }, 1500);
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
}

// Sample file button
document.getElementById('sampleFileBtn')?.addEventListener('click', (e) => {
  e.stopPropagation();
  downloadSampleFile();
});

// Theme Toggle
function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('nacha-viewer-theme', isDark ? 'dark' : 'light');
  updateThemeToggle(isDark);
}

function updateThemeToggle(isDark) {
  const btn = document.getElementById('themeToggle');
  if (btn) {
    btn.textContent = isDark ? '☀️' : '🌙';
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }
}

// Initialize theme from localStorage
(function initTheme() {
  const savedTheme = localStorage.getItem('nacha-viewer-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
  
  if (isDark) {
    document.body.classList.add('dark-mode');
  }
  
  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', () => {
    updateThemeToggle(document.body.classList.contains('dark-mode'));
  });
})();

// Print Summary
function printSummary() {
  if (!currentData || !currentFile) return;
  
  const printWindow = window.open('', '_blank');
  const fileName = currentFile.name;
  const validation = validator.validate(currentData);
  
  let entriesHtml = '';
  currentData.batches.forEach((batch, i) => {
    const batchNum = batch.batchNumber || i + 1;
    batch.entries.forEach(entry => {
      const type = ['22', '23', '32', '33'].includes(entry.transactionCode) ? 'Credit' : 'Debit';
      entriesHtml += `
        <tr>
          <td>${batchNum}</td>
          <td>${type}</td>
          <td>${entry.individualName}</td>
          <td>${entry.receivingDFIAccountNumber}</td>
          <td class="amount">$${entry.amount.toFixed(2)}</td>
          <td>${entry.traceNumber}</td>
        </tr>
      `;
    });
  });
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>NACHA File Summary - ${fileName}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1f2937; }
        h1 { font-size: 24px; margin-bottom: 8px; }
        .meta { color: #6b7280; margin-bottom: 24px; }
        .stats { display: flex; gap: 24px; margin-bottom: 24px; flex-wrap: wrap; }
        .stat { background: #f3f4f6; padding: 12px 20px; border-radius: 8px; }
        .stat-label { font-size: 12px; text-transform: uppercase; color: #6b7280; font-weight: 600; }
        .stat-value { font-size: 20px; font-weight: 700; margin-top: 4px; }
        .stat.credit .stat-value { color: #10b981; }
        .stat.debit .stat-value { color: #ef4444; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        th { background: #e5e7eb; padding: 10px 12px; text-align: left; font-weight: 600; }
        td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
        .amount { font-family: monospace; text-align: right; }
        .footer { margin-top: 24px; font-size: 12px; color: #9ca3af; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <h1>NACHA File Summary</h1>
      <p class="meta">File: ${fileName} • Generated: ${new Date().toLocaleString()}</p>
      
      <div class="stats">
        <div class="stat">
          <div class="stat-label">Batches</div>
          <div class="stat-value">${validation.summary.batchCount}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Entries</div>
          <div class="stat-value">${validation.summary.totalEntries}</div>
        </div>
        <div class="stat credit">
          <div class="stat-label">Total Credits</div>
          <div class="stat-value">$${validation.summary.totalCredits.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
        </div>
        <div class="stat debit">
          <div class="stat-label">Total Debits</div>
          <div class="stat-value">$${validation.summary.totalDebits.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Net Amount</div>
          <div class="stat-value">$${validation.summary.netAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Batch</th>
            <th>Type</th>
            <th>Name</th>
            <th>Account</th>
            <th>Amount</th>
            <th>Trace #</th>
          </tr>
        </thead>
        <tbody>
          ${entriesHtml}
        </tbody>
      </table>
      
      <p class="footer">Generated by NACHA File Viewer • 100% Client-Side Processing</p>
    </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 250);
}
