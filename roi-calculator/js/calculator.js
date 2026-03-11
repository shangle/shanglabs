// Calculator Logic Module

const Calculator = {
    // Simple Mode Calculations
    calculateSimpleROI(revenue, costs, periodMonths) {
        const profit = revenue - costs;
        const roi = costs > 0 ? (profit / costs) * 100 : 0;
        const paybackMonths = costs > 0 && profit > 0 ? (costs / (revenue / periodMonths)) : Infinity;
        const annualizedRoi = roi > 0 ? Math.pow(1 + (roi / 100), 12 / periodMonths) - 1 : 0;

        return {
            roi: roi,
            profit: profit,
            paybackMonths: paybackMonths,
            annualizedRoi: annualizedRoi * 100
        };
    },

    // Advanced Mode Calculations
    calculateNPV(cashFlows, discountRate) {
        let npv = 0;
        cashFlows.forEach((cf, year) => {
            npv += cf / Math.pow(1 + discountRate / 100, year);
        });
        return npv;
    },

    calculateIRR(cashFlows) {
        let irr = 0.1; // Initial guess
        const maxIterations = 1000;
        const tolerance = 0.0001;

        for (let i = 0; i < maxIterations; i++) {
            let npv = 0;
            cashFlows.forEach((cf, year) => {
                npv += cf / Math.pow(1 + irr, year);
            });

            if (Math.abs(npv) < tolerance) {
                return irr * 100;
            }

            // Calculate derivative
            let derivative = 0;
            cashFlows.forEach((cf, year) => {
                if (year > 0) {
                    derivative -= year * cf / Math.pow(1 + irr, year + 1);
                }
            });

            irr = irr - npv / derivative;

            // Prevent infinite loop
            if (irr < -1 || irr > 10) {
                irr = 0.1;
            }
        }

        return irr * 100;
    },

    calculateROI(initialInvestment, totalBenefits, totalCosts) {
        const totalNetBenefits = totalBenefits - totalCosts;
        return initialInvestment > 0 ? (totalNetBenefits / initialInvestment) * 100 : 0;
    },

    calculatePaybackPeriod(initialInvestment, annualNetBenefit) {
        return annualNetBenefit > 0 ? initialInvestment / annualNetBenefit : Infinity;
    },

    // Generate cash flows for a scenario
    generateCashFlows(investment, annualRevenue, annualCosts, years) {
        const cashFlows = [-investment]; // Year 0 is negative investment

        for (let i = 1; i <= years; i++) {
            cashFlows.push(annualRevenue - annualCosts);
        }

        return cashFlows;
    },

    // Calculate scenario metrics
    calculateScenario(scenario) {
        const cashFlows = this.generateCashFlows(
            scenario.investment,
            scenario.annualRevenue,
            scenario.annualCosts,
            scenario.years
        );

        const totalBenefits = scenario.annualRevenue * scenario.years;
        const totalCosts = scenario.investment + (scenario.annualCosts * scenario.years);
        const annualNetBenefit = scenario.annualRevenue - scenario.annualCosts;

        return {
            npv: this.calculateNPV(cashFlows, scenario.discountRate),
            irr: this.calculateIRR(cashFlows),
            roi: this.calculateROI(scenario.investment, totalBenefits, totalCosts),
            paybackPeriod: this.calculatePaybackPeriod(scenario.investment, annualNetBenefit),
            cashFlows: cashFlows,
            totalBenefits: totalBenefits,
            totalCosts: totalCosts
        };
    },

    // Sensitivity analysis
    calculateSensitivity(baseScenario, revenueVariation, costVariation, discountRateVariation) {
        const adjustedRevenue = baseScenario.annualRevenue * (revenueVariation / 100);
        const adjustedCosts = baseScenario.annualCosts * (costVariation / 100);
        const adjustedDiscountRate = discountRateVariation;

        const adjustedScenario = {
            ...baseScenario,
            annualRevenue: adjustedRevenue,
            annualCosts: adjustedCosts,
            discountRate: adjustedDiscountRate
        };

        const baseResult = this.calculateScenario(baseScenario);
        const adjustedResult = this.calculateScenario(adjustedScenario);

        return {
            roiImpact: adjustedResult.roi - baseResult.roi,
            npvImpact: adjustedResult.npv - baseResult.npv,
            baseResult: baseResult,
            adjustedResult: adjustedResult
        };
    }
};
