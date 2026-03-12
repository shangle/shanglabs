/**
 * Budget vs Actual Tracker
 * Upload budget and actual CSV files to analyze variance
 */

// State
let budgetData = null;
let actualData = null;
let mergedData = null;

// DOM Elements
const budgetDropZone = document.getElementById('budgetDropZone');
const actualDropZone = document.getElementById('actualDropZone');
const budgetFile = document.getElementById('budgetFile');
const actualFile = document.getElementById('actualFile');
const budgetFileName = document.getElementById('budgetFileName');
const actualFileName = document.getElementById('actualFileName');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultsSection = document.getElementById('resultsSection');
const exportBtn = document.getElementById('exportBtn');

// File Upload Handlers
budgetDropZone.addEventListener('dragover', handleDragOver);
budgetDropZone.addEventListener('dragleave', handleDragLeave);
budgetDropZone.addEventListener('drop', (e) => handleDrop(e, 'budget'));
actualDropZone.addEventListener('dragover', handleDragOver);
actualDropZone.addEventListener('dragleave', handleDragLeave);
actualDropZone.addEventListener('drop', (e) => handleDrop(e, 'actual'));

budgetFile.addEventListener('change', (e) => handleFileSelect(e, 'budget'));
actualFile.addEventListener('change', (e) => handleFileSelect(e, 'actual'));
analyzeBtn.addEventListener('click', analyzeVariance);
exportBtn.addEventListener('click', exportReport);

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e, type) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0], type);
    }
}

function handleFileSelect(e, type) {
    const files = e.target.files;
    if (files.length > 0) {
        processFile(files[0], type);
    }
}

function processFile(file, type) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target.result;
        const data = parseCSV(content);
        
        if (type === 'budget') {
            budgetData = data;
            budgetFileName.textContent = `✓ ${file.name} (${data.length} rows)`;
        } else {
            actualData = data;
            actualFileName.textContent = `✓ ${file.name} (${data.length} rows)`;
        }
        
        checkReady();
    };
    reader.readAsText(file);
}

function parseCSV(content) {
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length >= headers.length) {
            const row = {};
            headers.forEach((header, index) => {
                let value = values[index]?.trim() || '';
                // Try to parse as number
                const num = parseFloat(value.replace(/[$,]/g, ''));
                row[header] = isNaN(num) ? value : num;
            });
            data.push(row);
        }
    }
    return data;
}

function checkReady() {
    analyzeBtn.disabled = !(budgetData && actualData);
}

function analyzeVariance() {
    if (!budgetData || !actualData) return;
    
    // Merge data by Category and Department
    mergedData = [];
    const seen = new Set();
    
    // Process budget data
    budgetData.forEach(row => {
        const key = `${row.Category || ''}-${row.Department || ''}`;
        seen.add(key);
        mergedData.push({
            category: row.Category || 'Unknown',
            department: row.Department || 'Unknown',
            budget: parseFloat(row.Amount) || 0,
            actual: 0,
            key: key
        });
    });
    
    // Match actual data
    actualData.forEach(row => {
        const key = `${row.Category || ''}-${row.Department || ''}`;
        const existing = mergedData.find(m => m.key === key);
        if (existing) {
            existing.actual = parseFloat(row.Amount) || 0;
        } else {
            mergedData.push({
                category: row.Category || 'Unknown',
                department: row.Department || 'Unknown',
                budget: 0,
                actual: parseFloat(row.Amount) || 0,
                key: key
            });
        }
    });
    
    // Calculate variance
    mergedData.forEach(row => {
        row.variance = row.actual - row.budget;
        row.percentVariance = row.budget !== 0 ? ((row.actual - row.budget) / row.budget * 100) : 0;
        row.status = row.variance > 0 ? 'over' : row.variance < 0 ? 'under' : 'match';
    });
    
    displayResults();
}

function displayResults() {
    resultsSection.classList.remove('hidden');
    
    // Calculate totals
    const totals = mergedData.reduce((acc, row) => {
        acc.budget += row.budget;
        acc.actual += row.actual;
        acc.variance += row.variance;
        return acc;
    }, { budget: 0, actual: 0, variance: 0 });
    
    totals.percentVariance = totals.budget !== 0 ? (totals.variance / totals.budget * 100) : 0;
    
    // Update summary cards
    document.getElementById('totalBudget').textContent = formatCurrency(totals.budget);
    document.getElementById('totalActual').textContent = formatCurrency(totals.actual);
    document.getElementById('totalVariance').textContent = formatCurrency(totals.variance);
    document.getElementById('totalVariance').className = `stat-value ${totals.variance > 0 ? 'negative' : totals.variance < 0 ? 'positive' : ''}`;
    document.getElementById('totalPercentVariance').textContent = `${totals.percentVariance.toFixed(1)}%`;
    
    // Render table
    renderTable(mergedData);
    
    // Render charts
    renderCharts();
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function renderTable(data) {
    const tbody = document.querySelector('#varianceTable tbody');
    tbody.innerHTML = data.map(row => `
        <tr class="status-${row.status}">
            <td>${row.category}</td>
            <td>${row.department}</td>
            <td>${formatCurrency(row.budget)}</td>
            <td>${formatCurrency(row.actual)}</td>
            <td class="${row.variance > 0 ? 'negative' : row.variance < 0 ? 'positive' : ''}">${formatCurrency(row.variance)}</td>
            <td>${row.percentVariance.toFixed(1)}%</td>
            <td><span class="status-badge ${row.status}">${row.status === 'over' ? 'Over Budget' : row.status === 'under' ? 'Under Budget' : 'On Budget'}</span></td>
        </tr>
    `).join('');
    
    // Filter buttons
    document.getElementById('filterAll').onclick = () => filterTable('all');
    document.getElementById('filterOver').onclick = () => filterTable('over');
    document.getElementById('filterUnder').onclick = () => filterTable('under');
    document.getElementById('filterMatch').onclick = () => filterTable('match');
}

function filterTable(status) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`filter${status.charAt(0).toUpperCase() + status.slice(1)}`).classList.add('active');
    
    const filtered = status === 'all' ? mergedData : mergedData.filter(row => row.status === status);
    renderTable(filtered);
}

function renderCharts() {
    // Group by category
    const byCategory = {};
    mergedData.forEach(row => {
        if (!byCategory[row.category]) {
            byCategory[row.category] = { budget: 0, actual: 0 };
        }
        byCategory[row.category].budget += row.budget;
        byCategory[row.category].actual += row.actual;
    });
    
    // Simple bar chart representation using CSS
    const chartCategory = document.getElementById('chartCategory');
    const categories = Object.keys(byCategory);
    chartCategory.innerHTML = categories.map(cat => {
        const max = Math.max(byCategory[cat].budget, byCategory[cat].actual, 1);
        return `
            <div class="bar-group">
                <div class="bar-label">${cat}</div>
                <div class="bar-container">
                    <div class="bar budget" style="width: ${(byCategory[cat].budget / max * 100)}%" title="Budget: ${formatCurrency(byCategory[cat].budget)}"></div>
                    <div class="bar actual" style="width: ${(byCategory[cat].actual / max * 100)}%" title="Actual: ${formatCurrency(byCategory[cat].actual)}"></div>
                </div>
                <div class="bar-legend">
                    <span class="legend-budget">Budget: ${formatCurrency(byCategory[cat].budget)}</span>
                    <span class="legend-actual">Actual: ${formatCurrency(byCategory[cat].actual)}</span>
                </div>
            </div>
        `;
    }).join('');
    
    // Group by department
    const byDepartment = {};
    mergedData.forEach(row => {
        if (!byDepartment[row.department]) {
            byDepartment[row.department] = { budget: 0, actual: 0 };
        }
        byDepartment[row.department].budget += row.budget;
        byDepartment[row.department].actual += row.actual;
    });
    
    const chartDepartment = document.getElementById('chartDepartment');
    const departments = Object.keys(byDepartment);
    chartDepartment.innerHTML = departments.map(dept => {
        const max = Math.max(byDepartment[dept].budget, byDepartment[dept].actual, 1);
        return `
            <div class="bar-group">
                <div class="bar-label">${dept}</div>
                <div class="bar-container">
                    <div class="bar budget" style="width: ${(byDepartment[dept].budget / max * 100)}%" title="Budget: ${formatCurrency(byDepartment[dept].budget)}"></div>
                    <div class="bar actual" style="width: ${(byDepartment[dept].actual / max * 100)}%" title="Actual: ${formatCurrency(byDepartment[dept].actual)}"></div>
                </div>
                <div class="bar-legend">
                    <span class="legend-budget">Budget: ${formatCurrency(byDepartment[dept].budget)}</span>
                    <span class="legend-actual">Actual: ${formatCurrency(byDepartment[dept].actual)}</span>
                </div>
            </div>
        `;
    }).join('');
}

function exportReport() {
    if (!mergedData) return;
    
    let csv = 'Category,Department,Budget,Actual,Variance,% Variance,Status\n';
    mergedData.forEach(row => {
        csv += `"${row.category}","${row.department}",${row.budget},${row.variance},${row.percentVariance.toFixed(2)},${row.status}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'budget_variance_report.csv';
    link.click();
}

function formatCurrency(amount) {
    return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
