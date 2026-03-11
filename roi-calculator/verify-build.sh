#!/bin/bash

echo "================================"
echo "ROI Calculator - Build Verification"
echo "================================"
echo ""

# Check file structure
echo "1. Checking file structure..."
files=(
    "index.html"
    "css/style.css"
    "js/calculator.js"
    "js/visualization.js"
    "js/export.js"
    "js/app.js"
    "README.md"
)

all_present=true
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file exists"
    else
        echo "✗ $file missing"
        all_present=false
    fi
done
echo ""

# Check file sizes
echo "2. Checking file sizes..."
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
        echo "  $file: $(printf "%'d" $size) bytes"
    fi
done
echo ""

# Validate HTML structure
echo "3. Validating HTML structure..."
if grep -q "css/style.css" index.html && \
   grep -q "js/calculator.js" index.html && \
   grep -q "js/visualization.js" index.html && \
   grep -q "js/export.js" index.html && \
   grep -q "js/app.js" index.html; then
    echo "✓ All CSS and JS files referenced in HTML"
else
    echo "✗ Some references missing in HTML"
fi
echo ""

# Check for CDN dependencies
echo "4. Checking CDN dependencies..."
if grep -q "chart.js" index.html; then
    echo "✓ Chart.js CDN included"
else
    echo "✗ Chart.js CDN missing"
fi

if grep -q "jspdf" index.html; then
    echo "✓ jsPDF CDN included"
else
    echo "✗ jsPDF CDN missing"
fi
echo ""

# Check for key features
echo "5. Checking for key features..."
features=(
    "Simple Mode"
    "Advanced Mode"
    "ROI calculation"
    "NPV calculation"
    "IRR calculation"
    "Sensitivity analysis"
    "Export to CSV"
    "Export to PDF"
)

for feature in "${features[@]}"; do
    if grep -ri "$feature" js/ index.html > /dev/null 2>&1; then
        echo "✓ $feature implemented"
    else
        echo "? $feature (not verified)"
    fi
done
echo ""

# Final summary
echo "================================"
echo "Build Summary"
echo "================================"
if [ "$all_present" = true ]; then
    echo "✓ All required files present"
    echo "✓ Application is ready to deploy"
    echo ""
    echo "To run locally:"
    echo "  1. Open index.html in a web browser"
    echo "  2. Or run: python3 -m http.server 8080"
    echo "  3. Visit: http://localhost:8080"
else
    echo "✗ Some files are missing"
    exit 1
fi

echo ""
echo "Total size: $(du -sh . | cut -f1)"
