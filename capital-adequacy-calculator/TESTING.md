# Capital Adequacy Calculator - Testing

## Smoke Tests
- [ ] Page loads without errors
- [ ] All inputs are editable
- [ ] Range sliders work
- [ ] Export PDF works
- [ ] Calculations update on input change

## Functional Tests
- [ ] Tier 1 ratio calculates correctly
- [ ] Total capital ratio calculates correctly
- [ ] Leverage ratio calculates correctly
- [ ] Capital surplus calculates correctly
- [ ] Status badges update correctly
- [ ] Minimum/maximum requirements apply

## Data Validation Tests
- [ ] Zero values where allowed handled
- [ ] Negative values rejected
- [ ] Missing inputs default to sample values
- [ ] Large values handled correctly

## Chart Tests
- [ ] Ratios chart shows current vs requirements
- [ ] Colors change based on pass/fail status
- [ ] Trend chart shows historical data
- [ ] Tooltips work on all charts
- [ ] Charts update when inputs change

## Export Tests
- [ ] PDF report includes all capital metrics
- [ ] PDF report includes regulatory requirements
- [ ] PDF report has correct filename
- [ ] PDF is readable

## Calculator Validation
- [ ] Tier 1 ratio = Tier 1 / RWA
- [ ] Total capital ratio = Total Capital / RWA
- [ ] Leverage ratio = Tier 1 / Total Assets
- [ ] Capital surplus = Total Capital - (RWA * minimum requirement)

## Browser Tests
- [ ] Chrome: Works
- [ ] Safari: Works
- [ ] Firefox: Works
- [ ] iOS Safari: Works

## Responsive Tests
- [ ] Desktop (1920x1080): Works
- [ ] Tablet (768x1024): Works
- [ ] Mobile (375x667): Works

## Performance Tests
- [ ] Load time < 2s
- [ ] File size < 100KB
- [ ] No console errors
