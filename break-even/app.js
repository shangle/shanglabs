// Product data storage
let products = [];
let chart = null;

// Color palette for multiple products
const colors = [
    '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'
];

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('productForm').addEventListener('submit', handleAddProduct);
    document.getElementById('clearAllBtn').addEventListener('click', clearAllProducts);
    document.getElementById('exportBtn').addEventListener('click', exportToCSV);
    initChart();
});

// Add new product
function handleAddProduct(e) {
    e.preventDefault();

    const name = document.getElementById('productName').value.trim();
    const fixedCosts = parseFloat(document.getElementById('fixedCosts').value);
    const variableCost = parseFloat(document.getElementById('variableCost').value);
    const sellingPrice = parseFloat(document.getElementById('sellingPrice').value);

    // Validation
    if (variableCost >= sellingPrice) {
        alert('Variable cost must be less than selling price for a profitable product.');
        return;
    }

    const product = {
        id: Date.now(),
        name,
        fixedCosts,
        variableCost,
        sellingPrice,
        color: colors[products.length % colors.length]
    };

    products.push(product);
    updateUI();
    e.target.reset();
}

// Remove product
function removeProduct(id) {
    products = products.filter(p => p.id !== id);
    updateUI();
}

// Clear all products
function clearAllProducts() {
    if (products.length === 0) return;
    if (confirm('Are you sure you want to remove all products?')) {
        products = [];
        updateUI();
    }
}

// Calculate break-even analysis
function calculateAnalysis(product) {
    const contributionMargin = product.sellingPrice - product.variableCost;
    const contributionMarginRatio = contributionMargin / product.sellingPrice;
    const breakEvenUnits = product.fixedCosts / contributionMargin;
    const breakEvenDollars = breakEvenUnits * product.sellingPrice;

    return {
        contributionMargin,
        contributionMarginRatio,
        breakEvenUnits,
        breakEvenDollars
    };
}

// Calculate profit at different sales levels
function calculateProfitAtLevels(product, analysis) {
    const levels = [0.10, 0.50, 1.00, 1.50, 2.00];
    return levels.map(level => {
        const units = analysis.breakEvenUnits * level;
        const revenue = units * product.sellingPrice;
        const totalVariableCost = units * product.variableCost;
        const profit = revenue - totalVariableCost - product.fixedCosts;
        return { level, units, revenue, profit };
    });
}

// Update UI
function updateUI() {
    const productsSection = document.getElementById('productsSection');
    const resultsSection = document.getElementById('resultsSection');
    const emptyState = document.getElementById('emptyState');

    if (products.length === 0) {
        productsSection.style.display = 'none';
        resultsSection.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    productsSection.style.display = 'block';
    resultsSection.style.display = 'block';
    emptyState.style.display = 'none';

    renderProductsList();
    renderResults();
    updateChart();
}

// Render products list
function renderProductsList() {
    const container = document.getElementById('productsList');
    container.innerHTML = products.map(product => {
        const analysis = calculateAnalysis(product);
        return `
            <div class="product-item" style="border-left: 4px solid ${product.color}">
                <div class="product-info">
                    <h4>${escapeHtml(product.name)}</h4>
                    <p>FC: $${formatNumber(product.fixedCosts)} | VC: $${formatNumber(product.variableCost)}/unit | SP: $${formatNumber(product.sellingPrice)}/unit</p>
                </div>
                <button class="btn btn-danger" onclick="removeProduct(${product.id})">Remove</button>
            </div>
        `;
    }).join('');
}

// Render results
function renderResults() {
    const container = document.getElementById('resultsContent');
    const tableBody = document.querySelector('#profitTable tbody');

    let resultsHtml = '<div class="results-grid">';

    products.forEach(product => {
        const analysis = calculateAnalysis(product);
        resultsHtml += `
            <div class="result-card" style="border-top: 4px solid ${product.color}">
                <div class="label">${escapeHtml(product.name)}</div>
                <div class="label">Break-Even Point</div>
                <div class="value">${Math.round(analysis.breakEvenUnits).toLocaleString()} units</div>
                <div class="label">Break-Even Revenue</div>
                <div class="value">$${formatNumber(analysis.breakEvenDollars)}</div>
                <div class="label">Contribution Margin</div>
                <div class="value">$${formatNumber(analysis.contributionMargin)}/unit</div>
                <div class="label">Margin Ratio</div>
                <div class="value">${(analysis.contributionMarginRatio * 100).toFixed(1)}%</div>
            </div>
        `;
    });

    resultsHtml += '</div>';
    container.innerHTML = resultsHtml;

    // Render profit table
    tableBody.innerHTML = products.map(product => {
        const analysis = calculateAnalysis(product);
        const profitLevels = calculateProfitAtLevels(product, analysis);

        return `
            <tr>
                <td style="border-left: 4px solid ${product.color}; padding-left: 20px;">
                    <strong>${escapeHtml(product.name)}</strong><br>
                    <small>BEP: ${Math.round(analysis.breakEvenUnits).toLocaleString()} units</small>
                </td>
                ${profitLevels.map(level => {
                    const profitClass = level.profit > 0 ? 'positive-profit' :
                                      level.profit < 0 ? 'negative-profit' : 'neutral-profit';
                    return `
                        <td class="${profitClass}">
                            ${level.units.toLocaleString()} units<br>
                            <small>$${formatNumber(level.profit)}</small>
                        </td>
                    `;
                }).join('')}
            </tr>
        `;
    }).join('');
}

// Initialize chart
function initChart() {
    const canvas = document.getElementById('breakEvenChart');
    const ctx = canvas.getContext('2d');

    // Set canvas size for high DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    chart = ctx;
    chart.canvas = canvas;
    chart.width = rect.width;
    chart.height = rect.height;

    // Initial draw
    drawChart();
}

// Update chart
function updateChart() {
    drawChart();
}

// Draw chart
function drawChart() {
    const canvas = chart.canvas;
    const ctx = chart;
    const width = chart.width;
    const height = chart.height;
    const padding = { top: 40, right: 40, bottom: 60, left: 80 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (products.length === 0) return;

    // Find max values for scaling
    let maxRevenue = 0;
    let maxUnits = 0;

    products.forEach(product => {
        const analysis = calculateAnalysis(product);
        const profitLevels = calculateProfitAtLevels(product, analysis);
        profitLevels.forEach(level => {
            maxRevenue = Math.max(maxRevenue, level.revenue);
            maxUnits = Math.max(maxUnits, level.units);
        });
        // Also consider 200% of BEP
        maxUnits = Math.max(maxUnits, analysis.breakEvenUnits * 2);
        maxRevenue = Math.max(maxRevenue, analysis.breakEvenDollars * 2);
    });

    // Add 10% padding
    maxUnits *= 1.1;
    maxRevenue *= 1.1;

    // Coordinate conversion
    const toX = (units) => padding.left + (units / maxUnits) * chartWidth;
    const toY = (revenue) => padding.top + chartHeight - (revenue / maxRevenue) * chartHeight;

    // Draw grid and axes
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;

    // Vertical grid lines
    for (let i = 0; i <= 5; i++) {
        const x = padding.left + (i / 5) * chartWidth;
        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, height - padding.bottom);
        ctx.stroke();

        // X-axis labels
        const units = (i / 5) * maxUnits;
        ctx.fillStyle = '#64748b';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(formatLargeNumber(units), x, height - padding.bottom + 20);
    }

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
        const y = padding.top + (i / 5) * chartHeight;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();

        // Y-axis labels
        const revenue = maxRevenue * (1 - i / 5);
        ctx.fillStyle = '#64748b';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('$' + formatLargeNumber(revenue), padding.left - 10, y + 4);
    }

    // Draw axis labels
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Units Sold', width / 2, height - 10);

    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Revenue / Cost ($)', 0, 0);
    ctx.restore();

    // Draw break-even line (diagonal)
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(0));
    ctx.lineTo(toX(maxUnits), toY(maxRevenue * (maxUnits / maxUnits)));
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw zero profit line (horizontal at break-even revenue for each product)
    products.forEach(product => {
        const analysis = calculateAnalysis(product);
        const y = toY(analysis.breakEvenDollars);

        ctx.strokeStyle = product.color;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label
        ctx.fillStyle = product.color;
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(product.name + ' BEP', width - padding.right + 5, y + 4);
    });

    // Draw profit curves for each product
    products.forEach(product => {
        const analysis = calculateAnalysis(product);
        const profitLevels = calculateProfitAtLevels(product, analysis);

        // Draw total cost line
        ctx.strokeStyle = product.color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        const points = [];
        points.push({ units: 0, profit: -product.fixedCosts });
        profitLevels.forEach(level => points.push({ units: level.units, profit: level.profit }));

        points.forEach((point, i) => {
            const x = toX(point.units);
            const y = toY(point.profit + product.fixedCosts); // Offset to show on chart
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Draw data points
        points.forEach((point, i) => {
            const x = toX(point.units);
            const y = toY(point.profit + product.fixedCosts);

            ctx.fillStyle = product.color;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();

            // Mark break-even point
            if (i === 2) { // 100% BEP
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        });
    });

    // Legend
    const legendY = height - padding.bottom + 45;
    let legendX = padding.left;

    products.forEach((product, index) => {
        const analysis = calculateAnalysis(product);

        // Color box
        ctx.fillStyle = product.color;
        ctx.fillRect(legendX, legendY, 16, 16);

        // Text
        ctx.fillStyle = '#1e293b';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(
            `${product.name} (BEP: ${Math.round(analysis.breakEvenUnits).toLocaleString()})`,
            legendX + 20,
            legendY + 13
        );

        legendX += 180;
        if (legendX > width - padding.right) {
            legendX = padding.left;
        }
    });

    // Title
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Profit/Loss Curves', width / 2, 20);
}

// Export to CSV
function exportToCSV() {
    if (products.length === 0) {
        alert('No products to export');
        return;
    }

    let csv = 'Product,Fixed Costs ($),Variable Cost per Unit ($),Selling Price per Unit ($),Break-Even Units,Break-Even Revenue ($),Contribution Margin ($),Margin Ratio (%),10% BEP Profit ($),50% BEP Profit ($),100% BEP Profit ($),150% BEP Profit ($),200% BEP Profit ($)\n';

    products.forEach(product => {
        const analysis = calculateAnalysis(product);
        const profitLevels = calculateProfitAtLevels(product, analysis);

        csv += `"${product.name}",`;
        csv += `${product.fixedCosts},`;
        csv += `${product.variableCost},`;
        csv += `${product.sellingPrice},`;
        csv += `${analysis.breakEvenUnits.toFixed(2)},`;
        csv += `${analysis.breakEvenDollars.toFixed(2)},`;
        csv += `${analysis.contributionMargin.toFixed(2)},`;
        csv += `${(analysis.contributionMarginRatio * 100).toFixed(2)},`;

        profitLevels.forEach(level => {
            csv += `${level.profit.toFixed(2)},`;
        });

        csv = csv.slice(0, -1) + '\n';
    });

    downloadCSV(csv, 'break-even-analysis.csv');
}

// Download CSV file
function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Utility functions
function formatNumber(num) {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatLargeNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toFixed(0);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Handle window resize for chart
window.addEventListener('resize', () => {
    initChart();
    if (products.length > 0) {
        updateChart();
    }
});
