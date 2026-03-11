# Break-Even Analysis Tool

A client-side pricing and margin calculator for product profitability analysis. Calculate break-even points, contribution margins, and visualize profit projections with no data leaving your browser.

## Features

- **Multi-Product Comparison**: Add and compare multiple products side by side
- **Break-Even Calculations**: Automatically calculates break-even point in units and dollars
- **Contribution Margin Analysis**: Shows margin per unit and margin ratio
- **Visual Profit Curves**: Interactive chart showing profit/loss at different sales levels
- **Profit Projection Table**: Detailed breakdown at 10%, 50%, 100%, 150%, and 200% of break-even
- **CSV Export**: Export your complete analysis for external use
- **Client-Side Only**: No server, no database, no data transmission - 100% private

## How to Use

### 1. Add a Product

Fill in the form with:
- **Product Name**: A descriptive name (e.g., "Widget A")
- **Fixed Costs ($)**: Total fixed costs (rent, salaries, utilities, etc.)
- **Variable Cost per Unit ($)**: Cost to produce/deliver one unit
- **Selling Price per Unit ($)**: Revenue from selling one unit

Click "Add Product" to include it in your analysis.

### 2. View Results

Once you add products, you'll see:

**Break-Even Analysis Cards** for each product:
- Break-even point (in units)
- Break-even revenue (in dollars)
- Contribution margin per unit
- Margin ratio (percentage)

**Profit/Loss Chart**: Visual representation of how profit changes with sales volume

**Profit Projection Table**: Detailed breakdown at different sales levels:
- 10% of BEP (operating at loss)
- 50% of BEP (closer to break-even)
- 100% of BEP (break-even point, no profit/loss)
- 150% of BEP (profitable)
- 200% of BEP (strong profit)

### 3. Compare Products

Add multiple products to compare:
- Which has the lowest break-even point?
- Which has the highest contribution margin?
- Which product is most profitable at different sales volumes?

### 4. Export Data

Click "Export CSV" to download your complete analysis including:
- All product inputs
- Calculated metrics (BEP, contribution margin, etc.)
- Profit/loss at all sales levels

Use the CSV for:
- Reports and presentations
- Further analysis in spreadsheets
- Historical tracking

## Understanding the Metrics

### Break-Even Point (BEP)
The point where total revenue equals total costs. At this point:
- No profit, no loss
- **BEP (units)** = Fixed Costs ÷ (Selling Price - Variable Cost)
- **BEP (dollars)** = BEP (units) × Selling Price

### Contribution Margin
The amount each unit contributes toward covering fixed costs and generating profit:
- **Per unit** = Selling Price - Variable Cost
- **Ratio** = Contribution Margin ÷ Selling Price

### Profit/Loss at Different Levels
- **Below BEP**: Loss (red)
- **At BEP**: Break-even (gray)
- **Above BEP**: Profit (green)

## Tech Stack

- **HTML5**: Structure
- **CSS3**: Styling with CSS variables and responsive design
- **Vanilla JavaScript**: All calculations and chart rendering
- **Canvas API**: Custom chart rendering (no external libraries)

## File Structure

```
break-even/
├── index.html      # Main application structure
├── styles.css      # Responsive styling
├── app.js          # Core logic and calculations
└── README.md       # This file
```

## Running the Application

Simply open `index.html` in any modern web browser. No server required.

**Optionally serve with a local server:**

```bash
# Python 3
python -m http.server 8000

# Node.js (with npx)
npx serve

# PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Privacy & Security

This tool is **100% client-side**:
- No data is sent to any server
- No cookies or tracking
- Works offline after loading
- All calculations happen in your browser

## License

Free to use, modify, and distribute.

## Use Cases

- **Product Development**: Determine pricing strategies
- **Business Planning**: Calculate how many units to sell to be profitable
- **Investment Analysis**: Evaluate viability of new products
- **Budget Planning**: Understand cost structures
- **Pricing Experiments**: Test different price points and see impact on break-even

## Tips

1. **Accurate Costs**: Be thorough when estimating fixed and variable costs
2. **Test Scenarios**: Add multiple products with different prices to compare
3. **Export Early**: Export your analysis regularly to save your work
4. **Visual Analysis**: Use the chart to quickly identify which products have the best profit curves
5. **Margin Focus**: Products with higher contribution margins reach break-even faster

## Future Enhancements

Potential additions:
- Save/load projects (localStorage)
- Sensitivity analysis (what-if scenarios)
- Multi-currency support
- Print-friendly reports
- Dark mode theme
- Cost breakdown visualization
