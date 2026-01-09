/**
 * Green Valley Dairy Farm - Interactive Features
 * Vanilla JavaScript implementation for enhanced user experience
 * 
 * Features:
 * - Smooth scrolling navigation
 * - Mobile hamburger menu
 * - Lazy loading for images
 * - Scroll-triggered animations
 * - Keyboard navigation support
 * - Progressive enhancement
 */

(function() {
  'use strict';

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  const CONFIG = Object.freeze({
    SCROLL_OFFSET: 80,
    ANIMATION_THRESHOLD: 0.15,
    MOBILE_BREAKPOINT: 768,
    SCROLL_BEHAVIOR: 'smooth',
    ANIMATION_CLASS: 'animate-in',
    VISIBLE_CLASS: 'is-visible',
    MENU_ACTIVE_CLASS: 'menu-active',
    HAMBURGER_ACTIVE_CLASS: 'hamburger-active'
  });

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Debounce function to limit execution rate
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Check if element is in viewport
   * @param {Element} element - DOM element to check
   * @param {number} threshold - Visibility threshold (0-1)
   * @returns {boolean} True if element is visible
   */
  function isInViewport(element, threshold = CONFIG.ANIMATION_THRESHOLD) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
    const elementHeight = rect.height;
    return visibleHeight / elementHeight >= threshold;
  }

  /**
   * Log structured message with context
   * @param {string} level - Log level (info, warn, error)
   * @param {string} message - Log message
   * @param {Object} context - Additional context
   */
  function log(level, message, context = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...context
    };

    if (level === 'error') {
      console.error(`[${timestamp}] ${message}`, context);
    } else if (level === 'warn') {
      console.warn(`[${timestamp}] ${message}`, context);
    } else {
      console.log(`[${timestamp}] ${message}`, context);
    }
  }

  // ============================================================================
  // SMOOTH SCROLLING NAVIGATION
  // ============================================================================

  class SmoothScroll {
    constructor() {
      this.links = document.querySelectorAll('a[href^="#"]');
      this.init();
    }

    init() {
      if (this.links.length === 0) {
        log('info', 'No internal navigation links found');
        return;
      }

      this.links.forEach(link => {
        link.addEventListener('click', this.handleClick.bind(this));
      });

      log('info', 'Smooth scrolling initialized', { linkCount: this.links.length });
    }

    handleClick(event) {
      const href = event.currentTarget.getAttribute('href');
      
      if (!href || href === '#') {
        return;
      }

      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);

      if (!targetElement) {
        log('warn', 'Target element not found', { targetId });
        return;
      }

      event.preventDefault();

      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = targetPosition - CONFIG.SCROLL_OFFSET;

      try {
        window.scrollTo({
          top: offsetPosition,
          behavior: CONFIG.SCROLL_BEHAVIOR
        });

        // Update URL without triggering navigation
        if (history.pushState) {
          history.pushState(null, null, href);
        }

        // Set focus for accessibility
        targetElement.setAttribute('tabindex', '-1');
        targetElement.focus();

        log('info', 'Smooth scroll executed', { targetId, offsetPosition });
      } catch (error) {
        log('error', 'Smooth scroll failed', { error: error.message, targetId });
        // Fallback to default behavior
        window.location.hash = href;
      }
    }
  }

  // ============================================================================
  // MOBILE HAMBURGER MENU
  // ============================================================================

  class MobileMenu {
    constructor() {
      this.header = document.querySelector('header');
      this.nav = document.querySelector('nav');
      this.hamburger = null;
      this.isOpen = false;
      this.init();
    }

    init() {
      if (!this.header || !this.nav) {
        log('warn', 'Header or navigation not found');
        return;
      }

      this.createHamburger();
      this.attachEventListeners();
      this.handleResize();

      log('info', 'Mobile menu initialized');
    }

    createHamburger() {
      this.hamburger = document.createElement('button');
      this.hamburger.className = 'hamburger-menu';
      this.hamburger.setAttribute('aria-label', 'Toggle navigation menu');
      this.hamburger.setAttribute('aria-expanded', 'false');
      this.hamburger.setAttribute('aria-controls', 'main-navigation');
      
      this.hamburger.innerHTML = `
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      `;

      this.nav.setAttribute('id', 'main-navigation');
      this.header.querySelector('.header-container').insertBefore(
        this.hamburger,
        this.nav
      );

      this.addStyles();
    }

    addStyles() {
      const style = document.createElement('style');
      style.textContent = `
        .hamburger-menu {
          display: none;
          flex-direction: column;
          gap: 4px;
          background: transparent;
          border: none;
          padding: 8px;
          cursor: pointer;
          z-index: 100;
        }

        .hamburger-line {
          width: 25px;
          height: 3px;
          background-color: white;
          transition: all 0.3s ease;
          border-radius: 2px;
        }

        .hamburger-active .hamburger-line:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }

        .hamburger-active .hamburger-line:nth-child(2) {
          opacity: 0;
        }

        .hamburger-active .hamburger-line:nth-child(3) {
          transform: rotate(-45deg) translate(7px, -6px);
        }

        @media (max-width: ${CONFIG.MOBILE_BREAKPOINT}px) {
          .hamburger-menu {
            display: flex;
          }

          nav {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background-color: var(--color-primary);
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
          }

          nav.menu-active {
            max-height: 400px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          }

          nav ul {
            flex-direction: column;
            padding: 1rem;
          }

          nav li {
            width: 100%;
          }

          nav a {
            display: block;
            padding: 0.75rem 1rem;
          }
        }
      `;
      document.head.appendChild(style);
    }

    attachEventListeners() {
      this.hamburger.addEventListener('click', this.toggle.bind(this));
      
      // Close menu when clicking outside
      document.addEventListener('click', (event) => {
        if (this.isOpen && 
            !this.nav.contains(event.target) && 
            !this.hamburger.contains(event.target)) {
          this.close();
        }
      });

      // Close menu on escape key
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && this.isOpen) {
          this.close();
          this.hamburger.focus();
        }
      });

      // Handle window resize
      window.addEventListener('resize', debounce(this.handleResize.bind(this), 250));

      // Close menu when navigation link is clicked
      this.nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          if (this.isOpen) {
            this.close();
          }
        });
      });
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    open() {
      this.isOpen = true;
      this.nav.classList.add(CONFIG.MENU_ACTIVE_CLASS);
      this.hamburger.classList.add(CONFIG.HAMBURGER_ACTIVE_CLASS);
      this.hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      
      log('info', 'Mobile menu opened');
    }

    close() {
      this.isOpen = false;
      this.nav.classList.remove(CONFIG.MENU_ACTIVE_CLASS);
      this.hamburger.classList.remove(CONFIG.HAMBURGER_ACTIVE_CLASS);
      this.hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      
      log('info', 'Mobile menu closed');
    }

    handleResize() {
      if (window.innerWidth > CONFIG.MOBILE_BREAKPOINT && this.isOpen) {
        this.close();
      }
    }
  }

  // ============================================================================
  // LAZY LOADING FOR IMAGES
  // ============================================================================

  class LazyLoader {
    constructor() {
      this.images = [];
      this.observer = null;
      this.init();
    }

    init() {
      // Find all images that should be lazy loaded
      this.images = Array.from(document.querySelectorAll('img[data-src]'));

      if (this.images.length === 0) {
        log('info', 'No images found for lazy loading');
        return;
      }

      if ('IntersectionObserver' in window) {
        this.setupIntersectionObserver();
      } else {
        this.loadAllImages();
      }

      log('info', 'Lazy loading initialized', { imageCount: this.images.length });
    }

    setupIntersectionObserver() {
      const options = {
        root: null,
        rootMargin: '50px',
        threshold: 0.01
      };

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target);
            this.observer.unobserve(entry.target);
          }
        });
      }, options);

      this.images.forEach(img => this.observer.observe(img));
    }

    loadImage(img) {
      const src = img.getAttribute('data-src');
      
      if (!src) {
        log('warn', 'Image missing data-src attribute', { img });
        return;
      }

      img.src = src;
      img.removeAttribute('data-src');

      img.addEventListener('load', () => {
        img.classList.add('loaded');
        log('info', 'Image loaded', { src });
      });

      img.addEventListener('error', () => {
        log('error', 'Image failed to load', { src });
        img.classList.add('error');
      });
    }

    loadAllImages() {
      log('info', 'IntersectionObserver not supported, loading all images');
      this.images.forEach(img => this.loadImage(img));
    }
  }

  // ============================================================================
  // SCROLL ANIMATIONS
  // ============================================================================

  class ScrollAnimations {
    constructor() {
      this.elements = [];
      this.observer = null;
      this.init();
    }

    init() {
      // Find all elements that should animate on scroll
      this.elements = Array.from(document.querySelectorAll('.product-item, .about-content, .contact-content > div'));

      if (this.elements.length === 0) {
        log('info', 'No elements found for scroll animations');
        return;
      }

      this.addStyles();

      if ('IntersectionObserver' in window) {
        this.setupIntersectionObserver();
      } else {
        this.showAllElements();
      }

      log('info', 'Scroll animations initialized', { elementCount: this.elements.length });
    }

    addStyles() {
      const style = document.createElement('style');
      style.textContent = `
        .product-item,
        .about-content,
        .contact-content > div {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .product-item.is-visible,
        .about-content.is-visible,
        .contact-content > div.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        @media (prefers-reduced-motion: reduce) {
          .product-item,
          .about-content,
          .contact-content > div {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }
      `;
      document.head.appendChild(style);
    }

    setupIntersectionObserver() {
      const options = {
        root: null,
        rootMargin: '0px',
        threshold: CONFIG.ANIMATION_THRESHOLD
      };

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add(CONFIG.VISIBLE_CLASS);
            log('info', 'Element animated into view', { element: entry.target.className });
          }
        });
      }, options);

      this.elements.forEach(element => this.observer.observe(element));
    }

    showAllElements() {
      log('info', 'IntersectionObserver not supported, showing all elements');
      this.elements.forEach(element => element.classList.add(CONFIG.VISIBLE_CLASS));
    }
  }

  // ============================================================================
  // KEYBOARD NAVIGATION ENHANCEMENT
  // ============================================================================

  class KeyboardNavigation {
    constructor() {
      this.init();
    }

    init() {
      // Enhance focus visibility
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Tab') {
          document.body.classList.add('keyboard-navigation');
        }
      });

      document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
      });

      this.addStyles();

      log('info', 'Keyboard navigation enhanced');
    }

    addStyles() {
      const style = document.createElement('style');
      style.textContent = `
        body:not(.keyboard-navigation) *:focus {
          outline: none;
        }

        .keyboard-navigation *:focus {
          outline: 2px solid var(--color-accent, #d4a574);
          outline-offset: 2px;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  function initialize() {
    try {
      log('info', 'Initializing interactive features');

      // Initialize all features
      new SmoothScroll();
      new MobileMenu();
      new LazyLoader();
      new ScrollAnimations();
      new KeyboardNavigation();

      log('info', 'All interactive features initialized successfully');
    } catch (error) {
      log('error', 'Failed to initialize interactive features', { 
        error: error.message,
        stack: error.stack 
      });
    }
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

})();