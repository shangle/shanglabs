/**
 * Shanglabs - Shared JavaScript Utilities
 * Common functionality for all pages and sub-apps
 *
 * Usage: <script src="../js/shared.js"></script> (or "./js/shared.js" from root)
 */

(function () {
    'use strict';

    /* ---------- Favicon Injection ---------- */
    if (!document.querySelector('link[rel="icon"]')) {
        var favicon = document.createElement('link');
        favicon.rel = 'icon';
        favicon.type = 'image/svg+xml';
        favicon.href = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect fill='%236366f1' width='100' height='100' rx='20'/><text x='50' y='65' font-size='55' text-anchor='middle' fill='white' font-weight='bold'>S</text></svg>";
        document.head.appendChild(favicon);
    }

    /* ---------- Meta Tags Injection ---------- */
    function ensureMeta(name, content, property) {
        var selector = property
            ? 'meta[property="' + name + '"]'
            : 'meta[name="' + name + '"]';
        if (!document.querySelector(selector)) {
            var meta = document.createElement('meta');
            if (property) {
                meta.setAttribute('property', name);
            } else {
                meta.setAttribute('name', name);
            }
            meta.content = content;
            document.head.appendChild(meta);
        }
    }

    // Only add base meta if not already present
    ensureMeta('theme-color', '#6366f1');

    /* ---------- Scroll-to-Top Button ---------- */
    function initScrollToTop() {
        var btn = document.createElement('button');
        btn.className = 'sl-scroll-top';
        btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>';
        btn.setAttribute('aria-label', 'Scroll to top');
        btn.title = 'Back to top';
        document.body.appendChild(btn);

        // Style injection (scoped to the button)
        var style = document.createElement('style');
        style.textContent = [
            '.sl-scroll-top {',
            '  position: fixed;',
            '  bottom: 24px;',
            '  right: 24px;',
            '  width: 44px;',
            '  height: 44px;',
            '  border-radius: 50%;',
            '  background: var(--sl-primary, #6366f1);',
            '  color: white;',
            '  border: none;',
            '  cursor: pointer;',
            '  display: flex;',
            '  align-items: center;',
            '  justify-content: center;',
            '  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);',
            '  opacity: 0;',
            '  visibility: hidden;',
            '  transform: translateY(10px);',
            '  transition: all 0.3s ease;',
            '  z-index: 1000;',
            '}',
            '.sl-scroll-top.visible {',
            '  opacity: 1;',
            '  visibility: visible;',
            '  transform: translateY(0);',
            '}',
            '.sl-scroll-top:hover {',
            '  background: var(--sl-primary-dark, #4f46e5);',
            '  transform: translateY(-2px);',
            '}',
            '@media print { .sl-scroll-top { display: none !important; } }'
        ].join('\n');
        document.head.appendChild(style);

        btn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        window.addEventListener('scroll', function () {
            if (window.pageYOffset > 300) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        }, { passive: true });
    }

    /* ---------- Keyboard Shortcuts ---------- */
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', function (e) {
            // Ctrl/Cmd + Home => scroll to top
            if ((e.ctrlKey || e.metaKey) && e.key === 'Home') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    /* ---------- Smooth Scroll for Anchor Links ---------- */
    function initSmoothScroll() {
        document.addEventListener('click', function (e) {
            var anchor = e.target.closest('a[href^="#"]');
            if (!anchor) return;

            var targetId = anchor.getAttribute('href');
            if (targetId === '#') return;

            var targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    /* ---------- Intersection Observer for Fade-In ---------- */
    function initFadeInAnimations() {
        if (!('IntersectionObserver' in window)) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        document.querySelectorAll('[data-animate]').forEach(function (el) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            observer.observe(el);
        });
    }

    /* ---------- Initialize Everything ---------- */
    function init() {
        initScrollToTop();
        initKeyboardShortcuts();
        initSmoothScroll();
        initFadeInAnimations();
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    /* ---------- Exported Utilities ---------- */
    window.Shanglabs = window.Shanglabs || {};

    /**
     * Format a number as currency
     * @param {number} value
     * @param {string} [currency='USD']
     * @returns {string}
     */
    window.Shanglabs.formatCurrency = function (value, currency) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(value);
    };

    /**
     * Format a number with commas
     * @param {number} value
     * @param {number} [decimals=0]
     * @returns {string}
     */
    window.Shanglabs.formatNumber = function (value, decimals) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals || 0,
            maximumFractionDigits: decimals || 0
        }).format(value);
    };

    /**
     * Format a number as a percentage
     * @param {number} value - Value between 0-100
     * @param {number} [decimals=1]
     * @returns {string}
     */
    window.Shanglabs.formatPercent = function (value, decimals) {
        return value.toFixed(decimals !== undefined ? decimals : 1) + '%';
    };

    /**
     * Download data as a CSV file
     * @param {string} csvContent
     * @param {string} filename
     */
    window.Shanglabs.downloadCSV = function (csvContent, filename) {
        var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename || 'export.csv';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };

    /**
     * Show a temporary toast notification
     * @param {string} message
     * @param {string} [type='info'] - info, success, warning, error
     * @param {number} [duration=3000]
     */
    window.Shanglabs.toast = function (message, type, duration) {
        // Ensure toast container exists
        var container = document.getElementById('sl-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'sl-toast-container';
            container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:10000;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
            document.body.appendChild(container);
        }

        var toast = document.createElement('div');
        var colors = {
            info: { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
            success: { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
            warning: { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
            error: { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' }
        };
        var c = colors[type] || colors.info;

        toast.style.cssText = 'padding:12px 20px;border-radius:8px;font-size:0.9rem;font-weight:500;pointer-events:auto;' +
            'box-shadow:0 4px 12px rgba(0,0,0,0.15);opacity:0;transform:translateX(20px);transition:all 0.3s ease;' +
            'background:' + c.bg + ';color:' + c.color + ';border:1px solid ' + c.border + ';';
        toast.textContent = message;
        container.appendChild(toast);

        // Animate in
        requestAnimationFrame(function () {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        });

        // Auto-remove
        setTimeout(function () {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(20px)';
            setTimeout(function () {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        }, duration || 3000);
    };

})();
