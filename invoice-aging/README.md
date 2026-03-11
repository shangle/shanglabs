# Invoice Aging Tracker

A client-side web tool for tracking overdue payments and categorizing invoices by aging period.

## Features

- **CSV Upload**: Drag and drop or click to upload invoice data
- **Auto-Categorization**: Automatically assigns invoices to aging buckets:
  - Current: 0-30 days
  - 31-60 Days: Overdue 1-2 months
  - 61-90 Days: Overdue 2-3 months
  - 90+ Days: Severely overdue
- **Visual Dashboard**: Color-coded buckets with amount totals and invoice counts
- **Detailed Table**: View all invoices with days overdue and aging bucket
- **Export**: Download aging report with summaries and full details

## How to Use

1. Open `index.html` in a web browser (no server required)
2. Upload a CSV file with invoice data
3. View the aging dashboard and invoice details
4. Click "Export Aging Report" to download a CSV summary

## CSV Format

The CSV file should include these columns (headers can vary - the app will auto-detect):

- **Invoice #**: Invoice number or identifier
- **Amount**: Invoice amount (numeric)
- **Due Date**: Due date (supports multiple formats: YYYY-MM-DD, MM/DD/YYYY, DD-MM-YYYY, etc.)
- **Customer Name**: Customer or client name

### Example CSV

```csv
invoice_number,customer_name,amount,due_date
INV-2024-001,Acme Corporation,2500.00,2024-01-15
INV-2024-002,Smith & Associates,1750.50,2024-01-20
INV-2024-003,TechStart Inc.,3200.00,2023-12-10
```

A sample CSV is included as `sample-data.csv` for testing.

## Technical Details

- **Client-side only**: No data is sent to any server
- **No dependencies**: Pure vanilla JavaScript, HTML, and CSS
- **Responsive**: Works on desktop and mobile devices
- **Self-contained**: Just open the HTML file in any modern browser

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Any modern browser with ES6 support

## File Structure

```
invoice-aging/
├── index.html          # Main application
├── styles.css          # Styling
├── app.js              # Application logic
├── sample-data.csv     # Sample invoice data for testing
└── README.md           # This file
```

## License

Free to use and modify.
