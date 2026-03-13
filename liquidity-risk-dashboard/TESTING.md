# Liquidity Risk Dashboard - Testing

## Smoke Tests
- [ ] Page loads without errors
- [ ] All metrics display
- [ ] Charts render properly
- [ ] Alert banner works correctly
- [ ] Table displays properly

## Functional Tests
- [ ] LCR calculates and displays
- [ ] NSFR calculates and displays
- [ ] Cash position shows trend
- [ ] Liquidity gap projects correctly
- [ ] Daily flow shows average
- [ ] 30-day outflows display

## Alert Tests
- [ ] Alert banner hides when ratios healthy
- [ ] Alert banner appears when LCR < 100%
- [ ] Alert banner appears when NSFR < 100%
- [ ] Alert appears for declining cash
- [ ] Alert appears for liquidity gap

## Chart Tests
- [ ] LCR trend chart shows 30 days
- [ ] NSFR trend chart shows 30 days
- [ ] Cash projection projects 30 days
- [ ] Minimum threshold line displays correctly
- [ ] Funding sources pie chart displays
- [ ] Stress test bar chart works
- [ ] Tooltips work on all charts

## Table Tests
- [ ] Risk table displays all factors
- [ ] Status indicators show correctly
- [ ] Values update with data
- [ ] Threshold comparisons accurate

## Browser Tests
- [ ] Chrome: Works
- [ ] Safari: Works
- [ ] Firefox: Works
- [ ] iOS Safari: Works

## Responsive Tests
- [ ] Desktop (1920x1080): Works
- [ ] Tablet (768x1024): Works
- [ ] Mobile (375x667): Works
- [ ] Charts stack on mobile

## Performance Tests
- [ ] Load time < 2s
- [ ] File size < 100KB
- [ ] No console errors
