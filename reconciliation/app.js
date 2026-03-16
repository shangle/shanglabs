// Payment Reconciliation Helper - Main Application
// Client-side only, handles up to 1000 records efficiently

// State
let payments = [];
let invoices = [];
let matches = [];
let unmatchedPayments = [];
let unmatchedInvoices = [];
let currentMatchTarget = null; // { type: 'payment'|'invoice', index: number }
let sortColumn = null;
let sortDirection = 'asc';

// DOM Elements
const paymentsFile = document.getElementById('paymentsFile');
const invoicesFile = document.getElementById('invoicesFile');
const paymentsInfo = document.getElementById('paymentsInfo');
const invoicesInfo = document.getElementById('invoicesInfo');
const settingsSection = document.getElementById('settingsSection');
const perfWarning = document.getElementById('perfWarning');
const matchBtn = document.getElementById('matchBtn');
const resultsSection = document.getElementById('resultsSection');
const exportBtn = document.getElementById('exportBtn');

// CSV Parsing
function parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length === 0) return [];

    // Detect delimiter
    const firstLine = lines[0];
    let delimiter = ',';
    if (firstLine.includes('\t')) delimiter = '\t';
    else if (firstLine.includes(';')) delimiter = ';';

    const headers = parseCSVLine(firstLine, delimiter);
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i], delimiter);
        if (values.length === headers.length) {
            const row = {};
            headers.forEach((header, idx) => {
                row[header.trim()] = values[idx].trim();
            });
            data.push(row);
        }
    }

    return data;
}

function parseCSVLine(line, delimiter) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === delimiter && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current);
    return result;
}

// Normalize payment data
function normalizePayment(row) {
    return {
        id: generateId(),
        date: parseDate(row.date || row.payment_date || row.Date || row.PaymentDate || ''),
        amount: parseAmount(row.amount || row.payment_amount || row.Amount || row.PaymentAmount || '0'),
        reference: row.reference || row.ref || row.payment_ref || row.Reference || row.Ref || row.invoice_number || row.InvoiceNumber || '',
        description: row.description || row.memo || row.Description || row.Memo || '',
        original: row
    };
}

// Normalize invoice data
function normalizeInvoice(row) {
    return {
        id: generateId(),
        invoiceNumber: row.invoice_number || row.invoice_no || row.number || row.InvoiceNumber || row.InvoiceNo || row.Number || '',
        date: parseDate(row.date || row.invoice_date || row.Date || row.InvoiceDate || ''),
        amount: parseAmount(row.amount || row.total || row.invoice_amount || row.Amount || row.Total || '0'),
        customer: row.customer || row.client || row.customer_name || row.Customer || row.Client || '',
        original: row
    };
}

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function parseDate(value) {
    if (!value) return null;

    // Try various date formats
    const formats = [
        /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
        /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
        /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
        /^\d{4}\/\d{2}\/\d{2}$/, // YYYY/MM/DD
    ];

    for (const format of formats) {
        if (format.test(value)) {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                return date;
            }
        }
    }

    // Try parsing with Date constructor
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
        return date;
    }

    return null;
}

function parseAmount(value) {
    if (!value) return 0;

    // Remove currency symbols and commas
    const clean = value.toString()
        .replace(/[$€£¥]/g, '')
        .replace(/,/g, '')
        .trim();

    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0 : parsed;
}

// Matching Algorithms
function runAutoMatch() {
    const strategy = document.getElementById('matchStrategy').value;
    const dateTolerance = parseInt(document.getElementById('dateTolerance').value) || 3;
    const amountTolerance = parseFloat(document.getElementById('amountTolerance').value) || 0.01;

    // Reset matches
    matches = [];
    const usedPayments = new Set();
    const usedInvoices = new Set();

    // First pass: Reference matching (highest priority)
    payments.forEach((payment, pIdx) => {
        if (usedPayments.has(payment.id)) return;

        invoices.forEach((invoice, iIdx) => {
            if (usedInvoices.has(invoice.id)) return;

            if (payment.reference && payment.reference.toLowerCase() === invoice.invoiceNumber.toLowerCase()) {
                matches.push({
                    payment,
                    invoice,
                    type: 'reference',
                    paymentIdx: pIdx,
                    invoiceIdx: iIdx
                });
                usedPayments.add(payment.id);
                usedInvoices.add(invoice.id);
            }
        });
    });

    // Second pass: Amount + Date matching
    payments.forEach((payment, pIdx) => {
        if (usedPayments.has(payment.id)) return;

        invoices.forEach((invoice, iIdx) => {
            if (usedInvoices.has(invoice.id)) return;

            let match = false;

            if (strategy === 'strict') {
                // Exact amount only
                if (Math.abs(payment.amount - invoice.amount) < 0.01) {
                    match = true;
                }
            } else if (strategy === 'flexible') {
                // Exact amount + date range
                if (Math.abs(payment.amount - invoice.amount) < 0.01) {
                    if (payment.date && invoice.date) {
                        const daysDiff = Math.abs((payment.date - invoice.date) / (1000 * 60 * 60 * 24));
                        if (daysDiff <= dateTolerance) {
                            match = true;
                        }
                    }
                }
            } else if (strategy === 'loose') {
                // Amount within tolerance
                if (Math.abs(payment.amount - invoice.amount) <= amountTolerance) {
                    match = true;
                }
            }

            if (match) {
                matches.push({
                    payment,
                    invoice,
                    type: strategy === 'strict' ? 'exact' : 'amount-date',
                    paymentIdx: pIdx,
                    invoiceIdx: iIdx
                });
                usedPayments.add(payment.id);
                usedInvoices.add(invoice.id);
            }
        });
    });

    // Build unmatched lists
    unmatchedPayments = payments.filter((p, idx) => !usedPayments.has(p.id));
    unmatchedInvoices = invoices.filter((i, idx) => !usedInvoices.has(i.id));

    // Update UI
    renderResults();
}

// Manual Matching
function openMatchModal(type, index) {
    const modal = document.getElementById('matchModal');
    const sourceDiv = document.getElementById('matchSource');
    const targetSelect = document.getElementById('targetSelect');

    currentMatchTarget = { type, index };

    let sourceData, targetOptions;

    if (type === 'payment') {
        sourceData = unmatchedPayments[index];
        targetOptions = unmatchedInvoices;
    } else {
        sourceData = unmatchedInvoices[index];
        targetOptions = unmatchedPayments;
    }

    // Render source
    if (type === 'payment') {
        sourceDiv.innerHTML = `
            <div><strong>Payment:</strong> ${formatCurrency(sourceData.amount)}</div>
            <div><strong>Date:</strong> ${formatDate(sourceData.date)}</div>
            <div><strong>Ref:</strong> ${sourceData.reference || '-'}</div>
        `;
    } else {
        sourceDiv.innerHTML = `
            <div><strong>Invoice:</strong> ${sourceData.invoiceNumber || '-'}</div>
            <div><strong>Amount:</strong> ${formatCurrency(sourceData.amount)}</div>
            <div><strong>Date:</strong> ${formatDate(sourceData.date)}</div>
        `;
    }

    // Render target options
    targetSelect.innerHTML = '<option value="">Select a match...</option>';
    targetOptions.forEach((item, idx) => {
        const label = type === 'payment'
            ? `INV ${item.invoiceNumber} - ${formatCurrency(item.amount)} - ${formatDate(item.date)}`
            : `PAY ${formatCurrency(item.amount)} - ${formatDate(item.date)} - ${item.reference || '-'}`;

        targetSelect.innerHTML += `<option value="${idx}">${label}</option>`;
    });

    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('matchModal').style.display = 'none';
    currentMatchTarget = null;
}

function confirmManualMatch() {
    const targetSelect = document.getElementById('targetSelect');
    const targetIndex = targetSelect.value;

    if (!targetIndex || !currentMatchTarget) {
        alert('Please select a match');
        return;
    }

    let payment, invoice;

    if (currentMatchTarget.type === 'payment') {
        payment = unmatchedPayments[currentMatchTarget.index];
        invoice = unmatchedInvoices[parseInt(targetIndex)];
    } else {
        invoice = unmatchedInvoices[currentMatchTarget.index];
        payment = unmatchedPayments[parseInt(targetIndex)];
    }

    // Add to matches
    matches.push({
        payment,
        invoice,
        type: 'manual',
        paymentIdx: payments.indexOf(payment),
        invoiceIdx: invoices.indexOf(invoice)
    });

    // Remove from unmatched lists
    unmatchedPayments = unmatchedPayments.filter(p => p.id !== payment.id);
    unmatchedInvoices = unmatchedInvoices.filter(i => i.id !== invoice.id);

    closeModal();
    renderResults();
}

function unmatchItem(matchIndex) {
    const match = matches[matchIndex];

    // Add back to unmatched
    unmatchedPayments.push(match.payment);
    unmatchedInvoices.push(match.invoice);

    // Remove from matches
    matches.splice(matchIndex, 1);

    renderResults();
}

// Rendering
function renderResults() {
    // Update stats
    document.getElementById('matchedCount').textContent = matches.length;
    document.getElementById('unmatchedPaymentsCount').textContent = unmatchedPayments.length;
    document.getElementById('unmatchedInvoicesCount').textContent = unmatchedInvoices.length;

    // Render tables
    renderMatchedTable();
    renderUnmatchedPaymentsTable();
    renderUnmatchedInvoicesTable();

    // Show results
    resultsSection.style.display = 'block';
}

function renderMatchedTable() {
    const tbody = document.getElementById('matchedTableBody');
    tbody.innerHTML = '';

    let displayData = [...matches];
    if (sortColumn) {
        displayData.sort((a, b) => {
            let aVal, bVal;
            switch (sortColumn) {
                case 0: aVal = a.payment.date; bVal = b.payment.date; break;
                case 1: aVal = a.payment.amount; bVal = b.payment.amount; break;
                case 2: aVal = a.payment.reference; bVal = b.payment.reference; break;
                case 3: aVal = a.invoice.invoiceNumber; bVal = b.invoice.invoiceNumber; break;
                case 4: aVal = a.invoice.date; bVal = b.invoice.date; break;
                case 5: aVal = a.invoice.amount; bVal = b.invoice.amount; break;
                default: return 0;
            }

            if (typeof aVal === 'string') {
                return sortDirection === 'asc'
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            } else if (aVal instanceof Date) {
                return sortDirection === 'asc'
                    ? aVal - bVal
                    : bVal - aVal;
            } else {
                return sortDirection === 'asc'
                    ? aVal - bVal
                    : bVal - aVal;
            }
        });
    }

    displayData.forEach((match, idx) => {
        const badgeClass = match.type === 'reference' ? 'match-reference' :
                           match.type === 'manual' ? 'match-manual' :
                           match.type === 'exact' ? 'match-exact' : 'match-amount-date';

        const typeLabel = match.type === 'reference' ? 'Reference' :
                          match.type === 'manual' ? 'Manual' :
                          match.type === 'exact' ? 'Exact' : 'Amount + Date';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDate(match.payment.date)}</td>
            <td>${formatCurrency(match.payment.amount)}</td>
            <td>${match.payment.reference || '-'}</td>
            <td>${match.invoice.invoiceNumber || '-'}</td>
            <td>${formatDate(match.invoice.date)}</td>
            <td>${formatCurrency(match.invoice.amount)}</td>
            <td><span class="match-badge ${badgeClass}">${typeLabel}</span></td>
            <td class="actions">
                <button class="btn btn-sm btn-danger" onclick="unmatchItem(${matches.indexOf(match)})">Unmatch</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderUnmatchedPaymentsTable() {
    const tbody = document.getElementById('unmatchedPaymentsBody');
    tbody.innerHTML = '';

    unmatchedPayments.forEach((payment, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDate(payment.date)}</td>
            <td>${formatCurrency(payment.amount)}</td>
            <td>${payment.reference || '-'}</td>
            <td>${payment.description || '-'}</td>
            <td class="actions">
                <button class="btn btn-sm btn-primary" onclick="openMatchModal('payment', ${idx})">Match</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderUnmatchedInvoicesTable() {
    const tbody = document.getElementById('unmatchedInvoicesBody');
    tbody.innerHTML = '';

    unmatchedInvoices.forEach((invoice, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${invoice.invoiceNumber || '-'}</td>
            <td>${formatDate(invoice.date)}</td>
            <td>${formatCurrency(invoice.amount)}</td>
            <td>${invoice.customer || '-'}</td>
            <td class="actions">
                <button class="btn btn-sm btn-primary" onclick="openMatchModal('invoice', ${idx})">Match</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Formatting
function formatDate(date) {
    if (!date) return '-';
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Export
function exportReport() {
    const rows = [];

    // Header
    rows.push([
        'Match Status',
        'Payment Date',
        'Payment Amount',
        'Payment Reference',
        'Invoice Number',
        'Invoice Date',
        'Invoice Amount',
        'Invoice Customer',
        'Match Type'
    ]);

    // Matched items
    matches.forEach(match => {
        rows.push([
            'MATCHED',
            formatDate(match.payment.date),
            match.payment.amount,
            match.payment.reference || '',
            match.invoice.invoiceNumber || '',
            formatDate(match.invoice.date),
            match.invoice.amount,
            match.invoice.customer || '',
            match.type
        ]);
    });

    // Unmatched payments
    unmatchedPayments.forEach(payment => {
        rows.push([
            'UNMATCHED_PAYMENT',
            formatDate(payment.date),
            payment.amount,
            payment.reference || '',
            '',
            '',
            '',
            '',
            ''
        ]);
    });

    // Unmatched invoices
    unmatchedInvoices.forEach(invoice => {
        rows.push([
            'UNMATCHED_INVOICE',
            '',
            '',
            '',
            invoice.invoiceNumber || '',
            formatDate(invoice.date),
            invoice.amount,
            invoice.customer || '',
            ''
        ]);
    });

    // Convert to CSV
    const csv = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reconciliation_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// Tab Navigation
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        // Update active tab
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Show corresponding content
        const tabId = tab.dataset.tab;
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById(`tab-${tabId}`).style.display = 'block';
    });
});

// Table Sorting
document.querySelectorAll('.data-table th').forEach((th, idx) => {
    th.addEventListener('click', () => {
        if (sortColumn === idx) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            sortColumn = idx;
            sortDirection = 'asc';
        }
        renderMatchedTable();
    });
});

// File Upload Handlers
paymentsFile.addEventListener('change', (e) => {
    handleFileUpload(e.target.files[0], 'payments');
});

invoicesFile.addEventListener('change', (e) => {
    handleFileUpload(e.target.files[0], 'invoices');
});

function handleFileUpload(file, type) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const data = parseCSV(e.target.result);

        if (type === 'payments') {
            payments = data.map(normalizePayment);
            paymentsInfo.innerHTML = `<strong>✓ ${file.name}</strong><br>${payments.length} payments loaded`;
            paymentsInfo.parentElement.classList.add('has-file');
            paymentsInfo.classList.add('show');
        } else {
            invoices = data.map(normalizeInvoice);
            invoicesInfo.innerHTML = `<strong>✓ ${file.name}</strong><br>${invoices.length} invoices loaded`;
            invoicesInfo.parentElement.classList.add('has-file');
            invoicesInfo.classList.add('show');
        }

        // Show performance warning if large dataset
        const totalRecords = payments.length + invoices.length;
        if (totalRecords > 1000) {
            perfWarning.style.display = 'block';
        }

        // Show settings if both files uploaded
        if (payments.length > 0 && invoices.length > 0) {
            settingsSection.style.display = 'block';
        }
    };
    reader.readAsText(file);
}

// Event Listeners
matchBtn.addEventListener('click', () => {
    matchBtn.disabled = true;
    matchBtn.textContent = '⏳ Matching...';

    setTimeout(() => {
        runAutoMatch();
        matchBtn.disabled = false;
        matchBtn.textContent = '🔍 Run Auto-Match';
    }, 100);
});

exportBtn.addEventListener('click', exportReport);

// Drag and drop support
document.querySelectorAll('.upload-card').forEach(card => {
    card.addEventListener('dragover', (e) => {
        e.preventDefault();
        card.style.borderColor = 'var(--primary)';
        card.style.background = 'var(--gray-100)';
    });

    card.addEventListener('dragleave', () => {
        card.style.borderColor = '';
        card.style.background = '';
    });

    card.addEventListener('drop', (e) => {
        e.preventDefault();
        card.style.borderColor = '';
        card.style.background = '';

        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.csv')) {
            const input = card.querySelector('input[type="file"]');
            input.files = e.dataTransfer.files;
            handleFileUpload(file, input.id === 'paymentsFile' ? 'payments' : 'invoices');
        }
    });
});

// Initialize

