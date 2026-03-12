# Shanglabs Testing Framework

## Overview
Comprehensive testing scenarios for all Shanglabs apps. Tests verify functionality, UX, and cross-browser compatibility.

## Test Execution
- Run tests before any deployment
- Run tests weekly on live site
- Document all test results in this file
- Fix critical issues immediately, other issues within 7 days

## Test Categories

### Smoke Tests (Must Pass)
These are quick checks that verify basic functionality. Run before any deployment.

### Integration Tests
Verify all features work together correctly.

### Cross-Browser Tests
Test on Chrome, Firefox, Safari, Edge, and mobile browsers.

### Accessibility Tests
Verify screen reader compatibility, keyboard navigation, and color contrast.

## App-Specific Tests

---

## NACHA File Viewer

### Smoke Tests
- [ ] Page loads in < 3 seconds
- [ ] Upload box accepts file drag-drop
- [ ] Click upload box opens file picker
- [ ] Sample file button downloads file

### Functionality Tests
- [ ] Upload valid CCD file, parse correctly
- [ ] Upload valid PPD file, parse correctly
- [ ] Display file info (name, size, record count)
- [ ] Validation shows valid for correct file
- [ ] Validation shows errors for invalid file
- [ ] Stats bar displays correct totals
- [ ] Tree view shows all batches
- [ ] Record view shows all entries
- [ ] Search filters entries by account number
- [ ] Search filters entries by amount
- [ ] Search filters entries by trace number
- [ ] Search filters entries by name
- [ ] Filter buttons work (All, Credits, Debits, Large)
- [ ] Export CSV generates downloadable file
- [ ] Export JSON generates downloadable file
- [ ] Print button opens print dialog
- [ ] Dark mode toggle works
- [ ] Theme preference saves to localStorage

### Edge Cases
- [ ] Empty file shows error message
- [ ] Corrupted file shows validation errors
- [ ] Very large file (1000+ records) loads with performance warning
- [ ] File with only header/control records shows appropriate message
- [ ] Chinese characters in names display correctly

### Cross-Browser
- [ ] Chrome: All features work
- [ ] Firefox: All features work
- [ ] Safari: All features work
- [ ] Edge: All features work
- [ ] Mobile (iOS Safari): Upload works, responsive layout
- [ ] Mobile (Android Chrome): Upload works, responsive layout

### Accessibility
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader announces validation results

---

## QR Code Generator

### Smoke Tests
- [ ] Page loads in < 2 seconds
- [ ] QR code appears on load
- [ ] All content type tabs display

### Functionality Tests
- [ ] URL tab: Change URL updates QR code
- [ ] Text tab: Change text updates QR code
- [ ] WiFi tab: Change SSID/password updates QR code
- [ ] vCard tab: Change fields updates QR code
- [ ] Email tab: Change fields updates QR code
- [ ] SMS tab: Change phone/message updates QR code
- [ ] Crypto tab: Change address updates QR code
- [ ] Event tab: Change fields updates QR code
- [ ] **FIX VERIFY:** Foreground color picker changes QR color
- [ ] **FIX VERIFY:** Background color picker changes background
- [ ] **FIX VERIFY:** Preset colors work correctly
- [ ] **FIX VERIFY:** Text color input changes picker and QR
- [ ] Size slider updates QR dimensions
- [ ] Margin slider updates QR margin
- [ ] Error correction dropdown works (L, M, Q, H)
- [ ] Logo upload adds image to QR center
- [ ] Logo size slider changes logo size
- [ ] Download PNG generates correct file
- [ ] Download SVG generates correct file
- [ ] Copy to clipboard works (if browser supports)
- [ ] History shows recent QR codes
- [ ] Batch mode toggle shows/hides input area

### Edge Cases
- [ ] Very long URL (> 200 chars) generates QR
- [ ] Empty content shows placeholder QR
- [ ] Logo upload over 500KB shows error
- [ ] Invalid hex color in text input ignored
- [ ] Special characters in text handled correctly

### Cross-Browser
- [ ] Chrome: All features work
- [ ] Firefox: All features work
- [ ] Safari: All features work
- [ ] Edge: All features work
- [ ] Mobile: Touch interactions work

### Accessibility
- [ ] Color inputs have labels
- [ ] Tooltips are keyboard-accessible
- [ ] Download buttons have clear labels

---

## Financial Analysis Suite

### Smoke Tests
- [ ] Page loads in < 2 seconds
- [ ] Welcome screen displays on first visit
- [ ] Three tool tabs display

### Functionality Tests
- [ ] **FIX VERIFY:** Welcome screen appears for first-time users
- [ ] **FIX VERIFY:** "Start Guided Tour" button dismisses welcome
- [ ] **FIX VERIFY:** "Start Using Tools" button dismisses welcome
- [ ] **FIX VERIFY:** Welcome screen remembers user (localStorage)
- [ ] **FIX VERIFY:** Tooltips appear on field hover
- [ ] **FIX VERIFY:** All tooltips have helpful content
- [ ] **FIX VERIFY:** Help button shows overview
- [ ] ROI tab: Calculate NPV correctly
- [ ] ROI tab: Calculate IRR correctly
- [ ] ROI tab: Calculate payback period correctly
- [ ] ROI tab: Chart renders correctly
- [ ] Break-Even tab: Calculate break-even units correctly
- [ ] Break-Even tab: Calculate revenue at break-even correctly
- [ ] Break-Even tab: Calculate contribution margin correctly
- [ ] Break-Even tab: Chart renders correctly
- [ ] Budget tab: CSV upload parses correctly
- [ ] Budget tab: Variance calculations correct
- [ ] Budget tab: Chart renders correctly

### Edge Cases
- [ ] ROI: Zero discount rate handled
- [ ] ROI: Negative cash flows handled
- [ ] Break-Even: Variable cost >= price shows error
- [ ] Break-Even: Zero fixed cost handled
- [ ] Budget: CSV with extra columns handled
- [ ] Budget: Empty budget amounts handled

### Cross-Browser
- [ ] Chrome: Charts render correctly
- [ ] Firefox: Charts render correctly
- [ ] Safari: Charts render correctly
- [ ] Edge: Charts render correctly
- [ ] Mobile: Tooltips work on touch devices

### Accessibility
- [ ] All form fields have labels
- [ ] Tooltips don't block keyboard navigation
- [ ] Chart colors have sufficient contrast
- [ ] Error messages announced to screen readers

---

## Homepage (index.html)

### Smoke Tests
- [ ] Page loads in < 2 seconds
- [ ] Hero section displays correctly
- [ ] All navigation links work

### Functionality Tests
- [ ] **FIX VERIFY:** Privacy link opens legal.html
- [ ] **FIX VERIFY:** Terms link opens legal.html
- [ ] "Browse Tools" scrolls to apps section
- [ ] "Learn More" scrolls to about section
- [ ] "How It Works" scrolls to why section
- [ ] All app cards link to correct pages
- [ ] Download buttons show correct prices
- [ ] Subscription CTA works
- [ ] Social links open in new tabs

### Cross-Browser
- [ ] Chrome: All sections display correctly
- [ ] Firefox: All sections display correctly
- [ ] Safari: All sections display correctly
- [ ] Edge: All sections display correctly
- [ ] Mobile: Responsive layout works
- [ ] Mobile: Hamburger menu appears (if implemented)

### Accessibility
- [ ] All links have descriptive text
- [ ] Color contrast meets WCAG AA
- [ ] Keyboard can navigate all links

---

## Legal Page (legal.html)

### Smoke Tests
- [ ] Page loads in < 1 second
- [ ] Both Privacy and Terms sections display

### Functionality Tests
- [ ] Privacy section displays completely
- [ ] Terms section displays completely
- [ ] "Back to Shanglabs" link works
- [ ] Footer links work

### Accessibility
- [ ] Document is readable (headings, lists)
- [ ] Links are keyboard-accessible

---

## Deployment Checklist

Run these before every deployment:

### Pre-Deployment
- [ ] All smoke tests pass
- [ ] No console errors in Chrome DevTools
- [ ] Mobile responsive on iPhone and Android
- [ ] Links to external sites work
- [ ] Legal page is accessible

### Post-Deployment
- [ ] Verify live site at shangle.me (or tools.shangle.me)
- [ ] Check all navigation links
- [ ] Test file downloads (NACHA sample, QR downloads)
- [ ] Verify Google no broken links report (if available)
- [ ] Check site performance in Lighthouse

---

## Test Schedule

### Weekly (Every Friday)
- Run all smoke tests on live site
- Check broken link checker
- Verify page load times
- Test on mobile devices

### Monthly
- Full cross-browser test suite
- Accessibility audit
- Performance audit
- Security scan (dependencies)

### Pre-Release
- Full test suite for affected apps
- Manual testing of new features
- Regression testing of existing features

---

## Test Results Log

### 2026-03-13 - Post-Fix Deployment
**Tester:** Claw
**Status:** ✅ Changes deployed to GitHub

**QR Code Generator:**
- [ ] Manual testing pending
- **Known Issue:** None

**Financial Analysis Suite:**
- [ ] Manual testing pending
- **Known Issue:** None

**Homepage:**
- [ ] Manual testing pending
- **Known Issue:** None

**Legal Page:**
- [ ] Manual testing pending
- **Known Issue:** None

---

## Bug Tracking

### Critical (Fix Immediately)
- None currently

### High (Fix Within 7 Days)
- None currently

### Medium (Fix Within 14 Days)
- None currently

### Low (Fix Within 30 Days)
- None currently

---

## Performance Benchmarks

### Page Load Time Targets
- Homepage: < 2 seconds
- App pages: < 3 seconds
- Legal page: < 1 second

### Bundle Size Targets
- Homepage: < 25KB
- App pages: < 50KB
- Legal page: < 15KB

---

**Last Updated:** March 13, 2026
**Next Test:** March 20, 2026 (Friday)
