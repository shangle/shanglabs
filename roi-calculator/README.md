# ROI Calculator

A client-side Business Case Analysis Tool built with vanilla JavaScript, HTML, and CSS.

## Features

### Two Modes

#### Simple Mode
- Quick ROI calculation with basic inputs
- Revenue, costs, and time period entry
- Displays ROI percentage, net profit, and payback period
- Annualized ROI calculation
- Visual breakdown with doughnut chart
- Export to CSV or PDF

#### Advanced Mode
- Multi-scenario comparison (base + custom scenarios)
- NPV (Net Present Value) calculation
- IRR (Internal Rate of Return) calculation
- Sensitivity analysis with interactive sliders
- Multi-year cash flow details
- Payback period analysis
- Visual comparisons with line charts and bar charts
- Export to CSV or PDF

### Key Features
- **100% Client-Side**: All calculations happen in your browser - no data is sent to any server
- **Clean Wizard UI**: Step-by-step guided experience
- **Real-Time Calculations**: Instant feedback in sensitivity analysis
- **Visual Insights**: Interactive charts powered by Chart.js
- **Export Options**: Download results as CSV or PDF reports
- **Responsive Design**: Works on desktop, tablet, and mobile

## How to Use

### Simple Mode

1. Click "Start Simple" on the main screen
2. **Step 1**: Enter your expected revenue or savings
3. **Step 2**: Enter total costs or investments
4. **Step 3**: Select the time period for your analysis
5. Review results and export if needed

### Advanced Mode

1. Click "Start Advanced" on the main screen
2. **Step 1**: Define base scenario parameters:
   - Initial investment
   - Analysis period (years)
   - Annual revenue/savings
   - Annual operating costs
   - Discount rate
3. **Step 2**: Add alternative scenarios for comparison
4. **Step 3**: (Optional) Adjust multi-year cash flows
5. **Step 4**: Use sensitivity sliders to test different assumptions
6. **Step 5**: Review comprehensive results with NPV, IRR, and ROI comparisons

## File Structure

```
roi-calculator/
├── index.html          # Main HTML file
├── css/
│   └── style.css       # All styles (responsive, modern design)
├── js/
│   ├── calculator.js   # Core calculation logic (NPV, IRR, ROI)
│   ├── visualization.js # Chart.js integration
│   ├── export.js       # CSV/PDF export functionality
│   └── app.js          # Main application logic and state management
└── README.md           # This file
```

## Technical Details

### Dependencies
- **Chart.js** (CDN): For interactive visualizations
- **jsPDF** (CDN): For PDF export functionality

### Calculations

**ROI (Return on Investment):**
```
ROI = (Net Benefits / Total Investment) × 100
```

**NPV (Net Present Value):**
```
NPV = Σ(Cash Flow / (1 + r)^t)
Where r = discount rate, t = time period
```

**IRR (Internal Rate of Return):**
Calculated using iterative method to find rate where NPV = 0

**Payback Period:**
```
Payback Period = Initial Investment / Annual Net Benefit
```

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- PDF export requires Canvas support

## Privacy & Security

This application runs entirely in your browser:
- No data is transmitted to any server
- All calculations are performed client-side
- Your financial data never leaves your device
- Can be used offline once loaded

## License

Built for ShangLabs - Client-side only - Your data stays in your browser.

## Support

For issues or questions, contact the development team.
