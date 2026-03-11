class InvoiceAgingTracker {
    constructor() {
        this.invoices = [];
        this.agingBuckets = {
            current: { label: 'Current', daysMin: 0, daysMax: 30, invoices: [] },
            days31_60: { label: '31-60 Days', daysMin: 31, daysMax: 60, invoices: [] },
            days61_90: { label: '61-90 Days', daysMin: 61, daysMax: 90, invoices: [] },
            days90plus: { label: '90+ Days', daysMin: 91, daysMax: Infinity, invoices: [] }
        };
        this.init();
    }

    init() {
        const csvInput = document.getElementById('csvInput');
        const uploadBox = document.getElementById('uploadBox');
        const exportBtn = document.getElementById('exportBtn');

        // CSV Input
        csvInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Drag and Drop
        uploadBox.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadBox.classList.add('dragover');
        });

        uploadBox.addEventListener('dragleave', () => {
            uploadBox.classList.remove('dragover');
        });

        uploadBox.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadBox.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.name.endsWith('.csv')) {
                this.processFile(file);
            } else {
                alert('Please upload a CSV file.');
            }
        });

        // Export
        exportBtn.addEventListener('click', () => this.exportReport());
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    processFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const csvContent = e.target.result;
            this.parseCSV(csvContent);
        };
        reader.readAsText(file);
    }

    parseCSV(csvContent) {
        const lines = csvContent.trim().split('\n');
        if (lines.length < 2) {
            alert('CSV file is empty or has no data rows.');
            return;
        }

        // Detect delimiter
        const firstLine = lines[0];
        const delimiter = firstLine.includes(',') ? ',' : ';';

        // Parse header and data
        const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase());
        this.invoices = [];

        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i], delimiter);
            const invoice = {};

            headers.forEach((header, index) => {
                invoice[header] = values[index] ? values[index].trim() : '';
            });

            // Normalize fields
            invoice.invoiceNumber = this.findField(invoice, headers, ['invoice', 'invoice #', 'invoice number', 'inv#', 'inv #']);
            invoice.amount = parseFloat(this.findField(invoice, headers, ['amount', 'total', 'balance', 'invoice amount'])) || 0;
            invoice.dueDate = this.findField(invoice, headers, ['due date', 'due', 'date due', 'duedate']);
            invoice.customerName = this.findField(invoice, headers, ['customer', 'customer name', 'client', 'client name', 'name']);

            if (invoice.invoiceNumber && invoice.amount > 0 && invoice.dueDate) {
                this.invoices.push(invoice);
            }
        }

        if (this.invoices.length === 0) {
            alert('No valid invoices found. Please ensure your CSV has columns for Invoice #, Amount, Due Date, and Customer Name.');
            return;
        }

        this.calculateAging();
        this.updateUI();
    }

    parseCSVLine(line, delimiter) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                inQuotes = !inQuotes;
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

    findField(invoice, headers, searchFields) {
        for (const searchField of searchFields) {
            const index = headers.findIndex(h => h.includes(searchField));
            if (index !== -1) {
                return Object.values(invoice)[index];
            }
        }
        return '';
    }

    calculateAging() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Reset buckets
        Object.values(this.agingBuckets).forEach(bucket => bucket.invoices = []);

        this.invoices.forEach(invoice => {
            const dueDate = this.parseDate(invoice.dueDate);
            if (!dueDate) return;

            const daysOverdue = Math.max(0, Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24)));
            invoice.daysOverdue = daysOverdue;

            // Categorize into bucket
            if (daysOverdue <= 30) {
                this.agingBuckets.current.invoices.push(invoice);
            } else if (daysOverdue <= 60) {
                this.agingBuckets.days31_60.invoices.push(invoice);
            } else if (daysOverdue <= 90) {
                this.agingBuckets.days61_90.invoices.push(invoice);
            } else {
                this.agingBuckets.days90plus.invoices.push(invoice);
            }
        });
    }

    parseDate(dateStr) {
        if (!dateStr) return null;

        // Try various date formats
        const formats = [
            /(\d{4})[-/](\d{1,2})[-/](\d{1,2})/, // YYYY-MM-DD or YYYY/MM/DD
            /(\d{1,2})[-/](\d{1,2})[-/](\d{4})/, // MM-DD-YYYY or MM/DD/YYYY
            /(\d{1,2})[-/](\d{1,2})[-/](\d{2})/  // MM-DD-YY or MM/DD/YY
        ];

        for (const format of formats) {
            const match = dateStr.match(format);
            if (match) {
                let year, month, day;

                if (format.source.includes('\\d{4}')) {
                    if (format.source.startsWith('(\\d{4}')) {
                        // YYYY-MM-DD
                        year = parseInt(match[1]);
                        month = parseInt(match[2]) - 1;
                        day = parseInt(match[3]);
                    } else {
                        // MM-DD-YYYY
                        month = parseInt(match[1]) - 1;
                        day = parseInt(match[2]);
                        year = parseInt(match[3]);
                    }
                } else {
                    // MM-DD-YY
                    month = parseInt(match[1]) - 1;
                    day = parseInt(match[2]);
                    year = parseInt(match[3]);
                    if (year < 100) {
                        year += year < 50 ? 2000 : 1900;
                    }
                }

                const date = new Date(year, month, day);
                if (!isNaN(date.getTime())) {
                    return date;
                }
            }
        }

        // Try native Date parsing
        const nativeDate = new Date(dateStr);
        if (!isNaN(nativeDate.getTime())) {
            return nativeDate;
        }

        return null;
    }

    updateUI() {
        // Show results section
        document.getElementById('resultsSection').classList.remove('hidden');

        // Update totals
        const totalAmount = this.invoices.reduce((sum, inv) => sum + inv.amount, 0);
        document.getElementById('totalOutstanding').textContent = this.formatCurrency(totalAmount);

        // Update bucket stats
        this.updateBucket('current', 'current', 'currentFill');
        this.updateBucket('days31_60', 'days31', 'days31Fill');
        this.updateBucket('days61_90', 'days61', 'days61Fill');
        this.updateBucket('days90plus', 'days90', 'days90Fill');

        // Update table
        this.updateTable();

        // Scroll to results
        document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    updateBucket(bucketKey, prefix, fillId) {
        const bucket = this.agingBuckets[bucketKey];
        const amount = bucket.invoices.reduce((sum, inv) => sum + inv.amount, 0);
        const count = bucket.invoices.length;

        document.getElementById(`${prefix}Amount`).textContent = this.formatCurrency(amount);
        document.getElementById(`${prefix}Count`).textContent = count;

        // Calculate fill percentage
        const totalAmount = this.invoices.reduce((sum, inv) => sum + inv.amount, 0);
        const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
        document.getElementById(fillId).style.width = `${percentage}%`;
    }

    updateTable() {
        const tbody = document.getElementById('invoiceTableBody');
        tbody.innerHTML = '';

        // Sort by days overdue (descending)
        const sortedInvoices = [...this.invoices].sort((a, b) => b.daysOverdue - a.daysOverdue);

        sortedInvoices.forEach(invoice => {
            const row = document.createElement('tr');

            const bucket = this.getBucketLabel(invoice.daysOverdue);
            const badgeClass = bucket.badgeClass;

            row.innerHTML = `
                <td><strong>${this.escapeHtml(invoice.invoiceNumber)}</strong></td>
                <td>${this.escapeHtml(invoice.customerName)}</td>
                <td>${this.formatCurrency(invoice.amount)}</td>
                <td>${this.escapeHtml(invoice.dueDate)}</td>
                <td>${invoice.daysOverdue} days</td>
                <td><span class="badge ${badgeClass}">${bucket.label}</span></td>
            `;

            tbody.appendChild(row);
        });
    }

    getBucketLabel(daysOverdue) {
        if (daysOverdue <= 30) return { label: 'Current', badgeClass: 'badge-current' };
        if (daysOverdue <= 60) return { label: '31-60 Days', badgeClass: 'badge-31-60' };
        if (daysOverdue <= 90) return { label: '61-90 Days', badgeClass: 'badge-61-90' };
        return { label: '90+ Days', badgeClass: 'badge-90plus' };
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    exportReport() {
        const rows = [
            ['Invoice Aging Report', '', '', '', ''],
            [`Generated: ${new Date().toLocaleDateString()}`, '', '', '', ''],
            ['', '', '', '', ''],
            ['Aging Bucket', 'Total Amount', 'Invoice Count', '', ''],
            ['', '', '', '', '']
        ];

        // Add bucket summaries
        rows.push(['Current', this.agingBuckets.current.invoices.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2), this.agingBuckets.current.invoices.length, '', '']);
        rows.push(['31-60 Days', this.agingBuckets.days31_60.invoices.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2), this.agingBuckets.days31_60.invoices.length, '', '']);
        rows.push(['61-90 Days', this.agingBuckets.days61_90.invoices.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2), this.agingBuckets.days61_90.invoices.length, '', '']);
        rows.push(['90+ Days', this.agingBuckets.days90plus.invoices.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2), this.agingBuckets.days90plus.invoices.length, '', '']);
        rows.push(['', '', '', '', '']);

        const totalAmount = this.invoices.reduce((sum, inv) => sum + inv.amount, 0);
        rows.push(['TOTAL', totalAmount.toFixed(2), this.invoices.length, '', '']);
        rows.push(['', '', '', '', '']);

        // Add invoice details
        rows.push(['Invoice Details', '', '', '', '']);
        rows.push(['Invoice #', 'Customer Name', 'Amount', 'Due Date', 'Days Overdue', 'Aging Bucket']);

        const sortedInvoices = [...this.invoices].sort((a, b) => b.daysOverdue - a.daysOverdue);
        sortedInvoices.forEach(invoice => {
            rows.push([
                invoice.invoiceNumber,
                invoice.customerName,
                invoice.amount.toFixed(2),
                invoice.dueDate,
                invoice.daysOverdue.toString(),
                this.getBucketLabel(invoice.daysOverdue).label
            ]);
        });

        // Convert to CSV
        const csvContent = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

        // Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `invoice-aging-report-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new InvoiceAgingTracker();
});
