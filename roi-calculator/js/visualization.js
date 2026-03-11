// Visualization Module

const Visualizer = {
    charts: {},

    destroyChart(canvasId) {
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
            delete this.charts[canvasId];
        }
    },

    createSimpleChart(revenue, costs, profit) {
        this.destroyChart('simple-chart');

        const ctx = document.getElementById('simple-chart').getContext('2d');
        this.charts['simple-chart'] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Revenue', 'Costs', 'Net Profit'],
                datasets: [{
                    data: [revenue, costs, Math.max(0, profit)],
                    backgroundColor: [
                        'rgba(79, 70, 229, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(16, 185, 129, 0.8)'
                    ],
                    borderColor: [
                        'rgba(79, 70, 229, 1)',
                        'rgba(239, 68, 68, 1)',
                        'rgba(16, 185, 129, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': $' + context.raw.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    },

    createCashFlowChart(scenarios, years) {
        this.destroyChart('cashflow-chart');

        const labels = ['Year 0'];
        for (let i = 1; i <= years; i++) {
            labels.push('Year ' + i);
        }

        const datasets = scenarios.map((scenario, index) => {
            const colors = [
                'rgba(79, 70, 229, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(239, 68, 68, 0.8)',
                'rgba(139, 92, 246, 0.8)'
            ];
            const borderColors = [
                'rgba(79, 70, 229, 1)',
                'rgba(16, 185, 129, 1)',
                'rgba(245, 158, 11, 1)',
                'rgba(239, 68, 68, 1)',
                'rgba(139, 92, 246, 1)'
            ];

            return {
                label: scenario.name,
                data: scenario.results.cashFlows,
                borderColor: borderColors[index % borderColors.length],
                backgroundColor: colors[index % colors.length],
                borderWidth: 3,
                fill: false,
                tension: 0.1
            };
        });

        const ctx = document.getElementById('cashflow-chart').getContext('2d');
        this.charts['cashflow-chart'] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': $' + context.raw.toLocaleString();
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    },

    createROIComparisonChart(scenarios) {
        this.destroyChart('roi-chart');

        const labels = scenarios.map(s => s.name);
        const roiData = scenarios.map(s => s.results.roi);

        const colors = [
            'rgba(79, 70, 229, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(139, 92, 246, 0.8)'
        ];

        const ctx = document.getElementById('roi-chart').getContext('2d');
        this.charts['roi-chart'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'ROI (%)',
                    data: roiData,
                    backgroundColor: colors,
                    borderColor: colors.map(c => c.replace('0.8', '1')),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'ROI: ' + context.raw.toFixed(2) + '%';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    },

    createSensitivityChart() {
        this.destroyChart('sensitivity-chart');

        // Generate data points for sensitivity chart
        const revenueSlider = document.getElementById('sens-revenue-rev');
        const costsSlider = document.getElementById('sens-costs-rev');
        const discountSlider = document.getElementById('sens-discount-rev');

        const currentRevenue = parseInt(revenueSlider.value);
        const currentCosts = parseInt(costsSlider.value);
        const currentDiscount = parseInt(discountSlider.value);

        const labels = [];
        const roiData = [];
        const npvData = [];

        // Test different revenue variations
        const baseScenario = AppState.getBaseScenario();
        if (baseScenario) {
            for (let i = 50; i <= 150; i += 10) {
                const result = Calculator.calculateSensitivity(
                    baseScenario,
                    i,
                    currentCosts,
                    currentDiscount
                );
                labels.push(i + '%');
                roiData.push(result.adjustedResult.roi);
                npvData.push(result.adjustedResult.npv);
            }
        }

        const ctx = document.getElementById('sensitivity-chart').getContext('2d');
        this.charts['sensitivity-chart'] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'ROI (%)',
                    data: roiData,
                    borderColor: 'rgba(79, 70, 229, 1)',
                    backgroundColor: 'rgba(79, 70, 229, 0.2)',
                    borderWidth: 3,
                    yAxisID: 'y'
                }, {
                    label: 'NPV ($)',
                    data: npvData,
                    borderColor: 'rgba(16, 185, 129, 1)',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    borderWidth: 3,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'ROI (%)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false
                        },
                        title: {
                            display: true,
                            text: 'NPV ($)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Revenue Variation'
                        }
                    }
                }
            }
        });
    }
};
