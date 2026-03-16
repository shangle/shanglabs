# SUBROUTINES.md - Shanglabs Development Workflows

## Overview
**Last Updated:** March 16, 2026
**Purpose:** Standardized procedures for Shanglabs development, testing, and deployment
**Maintained By:** Documentation Keeper Subagent

---

## Development Lifecycle

### 1. New Tool Development

#### Pre-Development Checklist
- [ ] Define tool purpose and target audience
- [ ] Identify 3-5 core features for MVP
- [ ] Create icon/graphic concept
- [ ] Estimate development cost (target <$0.15/tool)
- [ ] Check for similar tools in existing catalog
- [ ] Define category (Banking/Risk/Finance/Operations/Utilities/Manufacturing)

#### Development Process
1. **Setup**
   ```bash
   cd /home/openclaw/.openclaw/workspace/shanglabs
   mkdir new-tool-name
   cd new-tool-name
   ```

2. **Basic Structure**
   - `index.html` - Main application interface
   - `app.js` - Application logic
   - `styles.css` - Styling (or inline for simple tools)
   - `README.md` - Tool-specific documentation

3. **Core Implementation**
   - Use client-side processing only
   - No API keys or backend services
   - Validate all user inputs
   - Provide clear error messages
   - Export functionality (CSV/PDF/Excel preferred)

4. **Testing**
   - Test on Chrome, Firefox, Safari
   - Test on mobile devices (responsive design)
   - Test file uploads/exports
   - Test edge cases (empty inputs, large files)

5. **Integration**
   - Add to `index.html` apps grid
   - Create/update logo SVG
   - Update `APP_CATALOG.md`
   - Update platform stats

6. **Deployment**
   ```bash
   git add .
   git commit -m "feat: add Tool Name (new app)"
   git push
   ```

---

### 2. Feature Enhancement Workflow

#### Enhancement Types
- **Minor:** Bug fixes, UI improvements (< 100 lines)
- **Major:** New features, structural changes (> 100 lines)
- **Critical:** Security issues, broken functionality

#### Process
1. **Assessment**
   - Evaluate impact on existing functionality
   - Test in development branch if major
   - Document breaking changes

2. **Implementation**
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation
   - Test thoroughly

3. **Commit Standards**
   ```bash
   # Minor fixes
   git commit -m "fix: remove console.log from production code"

   # Major features
   git commit -m "feat: Monte Carlo - multi-bank comparison + XBRL support + homepage update"

   # Critical issues
   git commit -m "fix: accept XBRL files with uppercase extension for iOS"
   ```

---

### 3. Testing Procedures

#### Automated Testing (See TESTING.md)
- Run automated test suite
- Check for broken links
- Validate SVG assets
- Test file handling

#### Manual Testing Checklist
- [ ] Tool loads without errors
- [ ] All buttons work as expected
- [ ] File uploads accept correct formats
- [ ] Export functions produce valid files
- [ ] Responsive design works on mobile
- [ ] Dark mode toggles correctly (if applicable)
- [ ] No console errors in browser
- [ ] Performance is acceptable (< 3s load time)

#### Cross-Browser Testing
1. **Chrome/Edge (Primary)**
   - All features tested
   - Performance benchmarked

2. **Firefox**
   - Verify compatibility
   - Check SVG rendering

3. **Safari**
   - iOS file handling
   - PDF export functionality

---

### 4. Deployment Workflow

#### Pre-Deployment Checklist
- [ ] All tests pass
- [ ] Documentation updated
- [ ] No console errors
- [ ] Links verified
- [ ] Performance acceptable
- [ ] Mobile responsive
- [ ] SVG assets validated

#### Deployment Steps
1. **Stage Changes**
   ```bash
   git status
   git diff
   ```

2. **Commit with Proper Message**
   ```bash
   git add .
   git commit -m "feat: descriptive message"
   ```

3. **Push to Production**
   ```bash
   git push origin main
   ```

4. **Post-Deployment Verification**
   - Visit live site
   - Test deployed features
   - Check for any issues

---

### 5. Documentation Maintenance

#### When to Update Documentation
- After deploying new tool
- After major feature changes
- After breaking changes
- Weekly during active development

#### Documentation Files

**APP_CATALOG.md**
- Update tool count
- Add new tools with features
- Update statistics
- Mark tools as "New" for first week

**PROJECT_MANAGEMENT.md**
- Update task status
- Add completed items
- Update health metrics

**SUBROUTINES.md** (This file)
- Add new workflows as discovered
- Update procedures based on lessons learned
- Document common patterns

**AI_COST_TRACKER.md**
- Update after each development session
- Track token usage and costs
- Maintain transparency

---

### 6. Asset Management

#### Logo SVG Standards
1. **Size:** 60x60px (for app cards)
2. **Format:** SVG with proper viewBox
3. **Style:** Simple, clean, scalable
4. **Colors:** Use platform palette
5. **Validation:** Run SVG validator before commit

#### SVG Validation
```bash
# Check all SVG files
find assets/ -name "*.svg" -exec svgo {} \;
```

#### Asset Naming Convention
```
logo-[tool-name].svg
```

Examples:
- `logo-nacha.svg`
- `logo-finance.svg`
- `logo-monte-carlo.svg`

---

### 7. Code Standards

#### JavaScript Standards
- Use strict mode: `'use strict';`
- No external libraries (unless absolutely necessary)
- Client-side processing only
- Clear function names
- Inline comments for complex logic
- No `console.log` in production code

#### HTML Standards
- Semantic HTML5 elements
- Proper meta tags
- Responsive meta viewport
- Accessible aria labels
- Proper heading hierarchy

#### CSS Standards
- Use CSS variables for theming
- Mobile-first responsive design
- Smooth transitions
- Consistent spacing
- Proper contrast ratios

---

### 8. Git Workflow

#### Branch Strategy
- **main** - Production ready code
- **feature/** - New features
- **fix/** - Bug fixes
- **docs/** - Documentation changes

#### Commit Message Format
```
type: description

types:
- feat: new feature
- fix: bug fix
- docs: documentation
- style: formatting
- refactor: code restructuring
- perf: performance improvement
- test: testing
- chore: maintenance
```

#### Best Practices
- Commit frequently (small, focused commits)
- Write clear, descriptive messages
- Avoid committing broken code to main
- Review changes before pushing

---

### 9. Communication Protocols

#### Telegram Bot Notifications
- **Status Updates:** Daily during active development
- **Deployments:** Immediately after pushing
- **Issues:** As they arise
- **Milestones:** Weekly summary

#### Status Update Format
```
📊 Daily Update - [Date]

✅ Completed:
- Task 1
- Task 2

🔄 In Progress:
- Task 3
- Task 4

📋 Next Up:
- Task 5
- Task 6

💰 AI Cost Today: $X.XX
📈 Total Cost: $XX.XX
```

---

### 10. Issue Resolution

#### Bug Reporting
When a bug is discovered:
1. Document the issue clearly
2. Identify reproduction steps
3. Check browser console for errors
4. Test across browsers
5. Create fix
6. Test thoroughly
7. Deploy fix

#### Feature Requests
When a feature is requested:
1. Evaluate against platform goals
2. Estimate development cost
3. Assess impact on existing features
4. Decide priority
5. Add to task list if approved

---

### 11. Performance Optimization

#### Performance Targets
- **Page Load:** < 3 seconds
- **First Contentful Paint:** < 1.5 seconds
- **Time to Interactive:** < 3 seconds
- **Bundle Size:** < 500KB (minified)

#### Optimization Techniques
- Minimize DOM manipulation
- Use event delegation
- Debounce/Throttle expensive operations
- Lazy load images and heavy components
- Optimize file reading for large files
- Use efficient algorithms for data processing

---

### 12. Security Considerations

#### Security Checklist
- [ ] No user data sent to servers
- [ ] All inputs validated on client side
- [ ] No API keys in client code
- [ ] Sanitize file uploads
- [ ] Prevent XSS attacks
- [ ] Use HTTPS for all connections

#### File Upload Security
- Validate file type before processing
- Check file size limits
- Sanitize file names
- Process in browser only
- Never store user files

---

### 13. Accessibility Standards

#### Accessibility Features
- Proper heading structure
- Alt text for images
- ARIA labels for interactive elements
- Keyboard navigation support
- Color contrast ratios (WCAG AA)
- Screen reader friendly
- Focus indicators visible

#### Testing Tools
- WAVE browser extension
- Chrome Lighthouse audit
- Keyboard navigation testing
- Screen reader testing (optional)

---

### 14. Backup and Recovery

#### What to Backup
- All source code (git)
- Documentation files
- AI cost tracking data
- Project management notes
- Important configurations

#### Backup Frequency
- **Automatic:** Git commits (continuous)
- **Manual:** Weekly full workspace backup

#### Recovery Process
```bash
# Clone from GitHub if needed
git clone https://github.com/shangle/shanglabs.git

# Restore from workspace backup
cp -r /backup/path/shanglabs/* .
```

---

### 15. Continuous Improvement

#### Weekly Review Checklist
- [ ] Review completed tasks
- [ ] Identify bottlenecks
- [ ] Update documentation
- [ ] Plan next week's priorities
- [ ] Check AI cost trends
- [ ] Gather user feedback

#### Monthly Review Checklist
- [ ] Full platform audit
- [ ] Performance review
- [ ] Security review
- [ ] Accessibility audit
- [ ] Cross-browser testing
- [ ] User testing

---

## Quick Reference

### Common Commands

```bash
# Start new tool
mkdir new-tool && cd new-tool

# Test tool locally
python -m http.server 8000
# Visit http://localhost:8000

# Validate SVGs
find assets/ -name "*.svg" -exec svgo {} \;

# Check for broken links
# (Use browser dev tools or online validator)

# Run tests
# (See TESTING.md)

# Deploy
git add .
git commit -m "feat: message"
git push
```

### File Structure Template
```
shanglabs/
├── index.html (homepage)
├── assets/
│   ├── logo-shanglabs.svg
│   ├── logo-[tool].svg
│   └── css/
├── [tool-name]/
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   └── README.md
├── APP_CATALOG.md
├── PROJECT_MANAGEMENT.md
├── SUBROUTINES.md
├── TESTING.md
└── AI_COST_TRACKER.md
```

### Platform Palette
```css
--primary: #6366f1;
--primary-dark: #4f46e5;
--secondary: #8b5cf6;
--accent: #f59e0b;
--white: #ffffff;
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-600: #4b5563;
--gray-800: #1f2937;
--gray-900: #111827;
```

---

## Troubleshooting

### Common Issues

**Issue:** Tool won't load
**Solution:** Check browser console, verify file paths, clear cache

**Issue:** File upload fails
**Solution:** Check file size, validate file format, check file permissions

**Issue:** Export doesn't work
**Solution:** Verify export logic, check browser compatibility, test with smaller data

**Issue:** Mobile layout broken
**Solution:** Check viewport meta tag, test CSS media queries, verify responsive breakpoints

**Issue:** SVG not displaying
**Solution:** Validate SVG file, check path to asset, verify file permissions

---

## Documentation Version

**Current Version:** 1.0
**Last Updated:** March 16, 2026
**Next Review:** March 23, 2026
**Maintained By:** Documentation Keeper Subagent

---

## Change Log

### v1.0 (March 16, 2026)
- Initial documentation of development workflows
- Added standard procedures for all major processes
- Documented code standards and best practices
- Created quick reference guide
