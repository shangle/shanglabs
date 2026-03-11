// Main Application State and Logic

const AppState = {
    mode: null,
    simpleStep: 1,
    advStep: 1,
    simpleData: {
        revenue: 0,
        costs: 0,
        periodMonths: 6,
        results: null
    },
    advData: {
        baseScenario: {
            investment: 0,
            years: 3,
            annualRevenue: 0,
            annualCosts: 0,
            discountRate: 10
        },
        scenarios: [],
        cashFlows: []
    }
};

// Mode Selection
function selectMode(mode) {
    AppState.mode = mode;
    document.getElementById('mode-selection').classList.add('hidden');

    if (mode === 'simple') {
        document.getElementById('simple-wizard').classList.remove('hidden');
        showSimpleStep(1);
    } else {
        document.getElementById('advanced-wizard').classList.remove('hidden');
        showAdvStep(1);
        initCashFlowTable();
    }
}

function goBack() {
    AppState.mode = null;
    AppState.simpleStep = 1;
    AppState.advStep = 1;

    document.getElementById('mode-selection').classList.remove('hidden');
    document.getElementById('simple-wizard').classList.add('hidden');
    document.getElementById('advanced-wizard').classList.add('hidden');

    // Clear all charts
    Visualizer.destroyChart('simple-chart');
    Visualizer.destroyChart('cashflow-chart');
    Visualizer.destroyChart('roi-chart');
    Visualizer.destroyChart('sensitivity-chart');
}

// Simple Mode Wizard
function showSimpleStep(stepNum) {
    // Hide all steps
    document.querySelectorAll('#simple-wizard .wizard-step').forEach(step => {
        step.classList.remove('active');
    });

    // Update step indicators
    document.querySelectorAll('[id^="simple-step-"]').forEach((el, index) => {
        if (index + 1 === stepNum) {
            el.classList.add('active');
        } else if (index + 1 < stepNum) {
            el.classList.add('completed');
            el.classList.remove('active');
        } else {
            el.classList.remove('active', 'completed');
        }
    });

    // Show current step
    const stepEl = document.getElementById(`simple-step-${stepNum}-content`);
    if (stepEl) {
        stepEl.classList.add('active');
    }

    // Update buttons
    document.getElementById('simple-prev-btn').style.display = stepNum === 1 ? 'none' : 'block';
    document.getElementById('simple-next-btn').textContent =
        stepNum === 3 ? 'Calculate' : 'Next';

    AppState.simpleStep = stepNum;
}

function nextSimpleStep() {
    const currentStep = AppState.simpleStep;

    // Validate current step
    if (currentStep === 1) {
        const revenue = parseFloat(document.getElementById('simple-revenue').value);
        if (isNaN(revenue) || revenue < 0) {
            alert('Please enter a valid revenue amount');
            return;
        }
        AppState.simpleData.revenue = revenue;
    } else if (currentStep === 2) {
        const costs = parseFloat(document.getElementById('simple-costs').value);
        if (isNaN(costs) || costs < 0) {
            alert('Please enter a valid cost amount');
            return;
        }
        AppState.simpleData.costs = costs;
    } else if (currentStep === 3) {
        const period = parseInt(document.getElementById('simple-period').value);
        AppState.simpleData.periodMonths = period;
        calculateAndShowSimpleResults();
        return;
    }

    showSimpleStep(currentStep + 1);
}

function prevSimpleStep() {
    if (AppState.simpleStep > 1) {
        showSimpleStep(AppState.simpleStep - 1);
    }
}

function calculateAndShowSimpleResults() {
    const results = Calculator.calculateSimpleROI(
        AppState.simpleData.revenue,
        AppState.simpleData.costs,
        AppState.simpleData.periodMonths
    );

    AppState.simpleData.results = results;

    // Update results display
    document.getElementById('simple-roi-percent').textContent = results.roi.toFixed(2) + '%';
    document.getElementById('simple-profit').textContent = formatCurrency(results.profit);
    document.getElementById('simple-revenue-display').textContent = formatCurrency(AppState.simpleData.revenue);
    document.getElementById('simple-costs-display').textContent = formatCurrency(AppState.simpleData.costs);
    document.getElementById('simple-payback').textContent = results.paybackMonths === Infinity ?
        'Never' : results.paybackMonths.toFixed(1) + ' months';
    document.getElementById('simple-annualized').textContent = results.annualizedRoi.toFixed(2) + '%';

    // Update step 5 indicator as completed
    document.getElementById('simple-step-3').classList.add('completed');

    // Show results
    document.querySelectorAll('#simple-wizard .wizard-step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById('simple-results').classList.add('active');

    // Hide prev/next buttons
    document.getElementById('simple-prev-btn').style.display = 'none';
    document.getElementById('simple-next-btn').style.display = 'none';

    // Create chart
    Visualizer.createSimpleChart(
        AppState.simpleData.revenue,
        AppState.simpleData.costs,
        results.profit
    );
}

function exportSimple(format) {
    if (!AppState.simpleData.results) {
        alert('No results to export');
        return;
    }

    const exportData = {
        ...AppState.simpleData.results,
        revenue: AppState.simpleData.revenue,
        costs: AppState.simpleData.costs,
        periodMonths: AppState.simpleData.periodMonths
    };

    if (format === 'csv') {
        Exporter.exportSimpleToCSV(exportData);
    } else if (format === 'pdf') {
        Exporter.exportSimpleToPDF(exportData);
    }
}

function resetSimple() {
    AppState.simpleStep = 1;
    AppState.simpleData = {
        revenue: 0,
        costs: 0,
        periodMonths: 6,
        results: null
    };

    // Clear inputs
    document.getElementById('simple-revenue').value = '';
    document.getElementById('simple-costs').value = '';
    document.getElementById('simple-period').value = '6';

    showSimpleStep(1);
}

// Advanced Mode Wizard
function showAdvStep(stepNum) {
    // Hide all steps
    document.querySelectorAll('#advanced-wizard .wizard-step').forEach(step => {
        step.classList.remove('active');
    });

    // Update step indicators
    document.querySelectorAll('[id^="adv-step-"]').forEach((el, index) => {
        if (index + 1 === stepNum) {
            el.classList.add('active');
        } else if (index + 1 < stepNum) {
            el.classList.add('completed');
            el.classList.remove('active');
        } else {
            el.classList.remove('active', 'completed');
        }
    });

    // Show current step
    const stepEl = document.getElementById(`adv-step-${stepNum}-content`);
    if (stepEl) {
        stepEl.classList.add('active');
    }

    // Update buttons
    document.getElementById('adv-prev-btn').style.display = stepNum === 1 ? 'none' : 'block';
    document.getElementById('adv-next-btn').textContent =
        stepNum === 5 ? 'Calculate' : 'Next';

    AppState.advStep = stepNum;
}

function nextAdvStep() {
    const currentStep = AppState.advStep;

    // Validate and save current step
    if (currentStep === 1) {
        const investment = parseFloat(document.getElementById('adv-investment').value);
        const years = parseInt(document.getElementById('adv-period').value);
        const annualRevenue = parseFloat(document.getElementById('adv-annual-revenue').value);
        const annualCosts = parseFloat(document.getElementById('adv-annual-costs').value);
        const discountRate = parseFloat(document.getElementById('adv-discount-rate').value);

        if (isNaN(investment) || investment < 0 ||
            isNaN(annualRevenue) || annualRevenue < 0 ||
            isNaN(annualCosts) || annualCosts < 0 ||
            isNaN(discountRate) || discountRate < 0) {
            alert('Please enter valid values for all fields');
            return;
        }

        AppState.advData.baseScenario = {
            investment,
            years,
            annualRevenue,
            annualCosts,
            discountRate
        };

        // Add base scenario to scenarios array
        AppState.advData.scenarios = [{
            name: 'Base Scenario',
            ...AppState.advData.baseScenario,
            results: null
        }];
    } else if (currentStep === 2) {
        // Scenarios are already in AppState
    } else if (currentStep === 3) {
        // Cash flows are captured from table inputs
    } else if (currentStep === 4) {
        calculateAndShowAdvResults();
        return;
    }

    showAdvStep(currentStep + 1);

    // If moving to step 4, initialize sensitivity chart
    if (currentStep + 1 === 4) {
        updateSensitivity();
    }
}

function prevAdvStep() {
    if (AppState.advStep > 1) {
        showAdvStep(AppState.advStep - 1);
    }
}

function addScenario() {
    const scenarioCount = AppState.advData.scenarios.length;
    const newScenario = {
        name: `Scenario ${scenarioCount + 1}`,
        investment: AppState.advData.baseScenario.investment,
        years: AppState.advData.baseScenario.years,
        annualRevenue: AppState.advData.baseScenario.annualRevenue,
        annualCosts: AppState.advData.baseScenario.annualCosts,
        discountRate: AppState.advData.baseScenario.discountRate,
        results: null
    };

    AppState.advData.scenarios.push(newScenario);
    renderScenarios();
}

function removeScenario(index) {
    if (AppState.advData.scenarios.length > 1) {
        AppState.advData.scenarios.splice(index, 1);
        renderScenarios();
    }
}

function renderScenarios() {
    const container = document.getElementById('scenarios-container');
    container.innerHTML = '';

    AppState.advData.scenarios.forEach((scenario, index) => {
        const card = document.createElement('div');
        card.className = 'scenario-card';

        const isBase = index === 0;
        const inputDisabled = isBase ? 'disabled' : '';

        card.innerHTML = `
            ${isBase ? '<h3>📊 Base Scenario</h3><p class="scenario-note">Defined in Step 1</p>' :
            `<h3>📈 ${scenario.name}</h3>
            <div class="scenario-input">
                <label>Scenario Name:</label>
                <input type="text" value="${scenario.name}" onchange="updateScenarioName(${index}, this.value)">
                <label>Investment ($):</label>
                <input type="number" value="${scenario.investment}" onchange="updateScenarioValue(${index}, 'investment', this.value)">
                <label>Annual Revenue ($):</label>
                <input type="number" value="${scenario.annualRevenue}" onchange="updateScenarioValue(${index}, 'annualRevenue', this.value)">
                <label>Annual Costs ($):</label>
                <input type="number" value="${scenario.annualCosts}" onchange="updateScenarioValue(${index}, 'annualCosts', this.value)">
            </div>
            <div class="scenario-actions">
                <button class="btn btn-outline" style="padding: 5px 10px; font-size: 0.8rem;" onclick="removeScenario(${index})">Remove</button>
            </div>`}
        `;

        container.appendChild(card);
    });
}

function updateScenarioName(index, name) {
    AppState.advData.scenarios[index].name = name;
}

function updateScenarioValue(index, field, value) {
    AppState.advData.scenarios[index][field] = parseFloat(value) || 0;
}

function initCashFlowTable() {
    const table = document.getElementById('cash-flows-table');
    const years = AppState.advData.baseScenario.years;

    let html = '<table><thead><tr><th>Year</th><th>Revenue ($)</th><th>Costs ($)</th><th>Net Flow ($)</th></tr></thead><tbody>';

    for (let i = 0; i <= years; i++) {
        const revenueValue = i === 0 ? 0 : '';
        const costsValue = i === 0 ? AppState.advData.baseScenario.investment : '';
        const netValue = '';

        html += `
            <tr>
                <td>${i === 0 ? 'Year 0' : 'Year ' + i}</td>
                <td><input type="number" id="cf-rev-${i}" placeholder="${revenueValue}" onchange="updateCashFlows()"></td>
                <td><input type="number" id="cf-cost-${i}" placeholder="${costsValue}" onchange="updateCashFlows()"></td>
                <td>${netValue}</td>
            </tr>
        `;
    }

    html += '</tbody></table>';
    table.innerHTML = html;
}

function updateCashFlows() {
    const years = AppState.advData.baseScenario.years;
    const cashFlows = [];

    for (let i = 0; i <= years; i++) {
        const revInput = document.getElementById(`cf-rev-${i}`);
        const costInput = document.getElementById(`cf-cost-${i}`);

        const revenue = revInput && revInput.value ? parseFloat(revInput.value) :
            (i === 0 ? 0 : AppState.advData.baseScenario.annualRevenue);
        const costs = costInput && costInput.value ? parseFloat(costInput.value) :
            (i === 0 ? AppState.advData.baseScenario.investment : AppState.advData.baseScenario.annualCosts);

        cashFlows.push(revenue - costs);
    }

    AppState.advData.cashFlows = cashFlows;
}

function updateSensitivity() {
    const revenueRev = parseInt(document.getElementById('sens-revenue-rev').value);
    const costsRev = parseInt(document.getElementById('sens-costs-rev').value);
    const discountRev = parseInt(document.getElementById('sens-discount-rev').value);

    document.getElementById('sens-revenue-val').textContent = revenueRev + '%';
    document.getElementById('sens-costs-val').textContent = costsRev + '%';
    document.getElementById('sens-discount-val').textContent = discountRev + '%';

    const baseScenario = AppState.getBaseScenario();
    if (baseScenario) {
        const sensitivity = Calculator.calculateSensitivity(
            baseScenario,
            revenueRev,
            costsRev,
            discountRev
        );

        document.getElementById('sens-impact').textContent =
            (sensitivity.roiImpact >= 0 ? '+' : '') + sensitivity.roiImpact.toFixed(2) + '%';
        document.getElementById('sens-npv').textContent =
            formatCurrency(sensitivity.npvImpact);

        // Update chart
        Visualizer.createSensitivityChart();
    }
}

function calculateAndShowAdvResults() {
    // Calculate results for all scenarios
    AppState.advData.scenarios.forEach(scenario => {
        scenario.results = Calculator.calculateScenario(scenario);
    });

    // Build scenarios table
    const tbody = document.querySelector('#scenarios-table tbody');
    tbody.innerHTML = '';

    AppState.advData.scenarios.forEach(scenario => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${scenario.name}</strong></td>
            <td>${formatCurrency(scenario.results.npv)}</td>
            <td>${formatPercent(scenario.results.irr)}</td>
            <td>${formatPercent(scenario.results.roi)}</td>
            <td>${scenario.results.paybackPeriod === Infinity ? 'Never' : scenario.results.paybackPeriod.toFixed(2)}</td>
        `;
        tbody.appendChild(row);
    });

    // Update step indicator
    document.getElementById('adv-step-5').classList.add('completed');

    // Show results
    document.querySelectorAll('#advanced-wizard .wizard-step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById('adv-step-5-content').classList.add('active');

    // Hide prev/next buttons
    document.getElementById('adv-prev-btn').style.display = 'none';
    document.getElementById('adv-next-btn').style.display = 'none';

    // Create charts
    Visualizer.createCashFlowChart(AppState.advData.scenarios, AppState.advData.baseScenario.years);
    Visualizer.createROIComparisonChart(AppState.advData.scenarios);
}

function exportAdvanced(format) {
    if (AppState.advData.scenarios.length === 0) {
        alert('No results to export');
        return;
    }

    // Calculate results if not already calculated
    AppState.advData.scenarios.forEach(scenario => {
        if (!scenario.results) {
            scenario.results = Calculator.calculateScenario(scenario);
        }
    });

    if (format === 'csv') {
        Exporter.exportAdvancedToCSV(AppState.advData.scenarios);
    } else if (format === 'pdf') {
        Exporter.exportAdvancedToPDF(AppState.advData.scenarios);
    }
}

function resetAdvanced() {
    AppState.advStep = 1;
    AppState.advData = {
        baseScenario: {
            investment: 0,
            years: 3,
            annualRevenue: 0,
            annualCosts: 0,
            discountRate: 10
        },
        scenarios: [],
        cashFlows: []
    };

    // Clear inputs
    document.getElementById('adv-investment').value = '';
    document.getElementById('adv-period').value = '3';
    document.getElementById('adv-annual-revenue').value = '';
    document.getElementById('adv-annual-costs').value = '';
    document.getElementById('adv-discount-rate').value = '10';

    showAdvStep(1);
}

// Helper method to get base scenario
AppState.getBaseScenario = function() {
    return this.advData.baseScenario && this.advData.baseScenario.investment > 0 ?
        this.advData.baseScenario : null;
};

// Utility Functions
function formatCurrency(value) {
    return '$' + value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatPercent(value) {
    return value.toFixed(2) + '%';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Set default sensitivity values
    document.getElementById('sens-revenue-rev').value = 100;
    document.getElementById('sens-costs-rev').value = 100;
    document.getElementById('sens-discount-rev').value = 10;
});
