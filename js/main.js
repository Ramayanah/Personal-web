// Hide loader when page fully loads
function hidePageLoader() {
    const loader = document.getElementById('pageLoader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 500);
    }
}

// Show loader on page refresh
window.addEventListener('beforeunload', () => {
    const loader = document.getElementById('pageLoader');
    if (loader) {
        loader.classList.remove('hidden');
    }
});

// Hide loader when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hidePageLoader);
} else {
    hidePageLoader();
}

// Also hide loader when window fully loads
window.addEventListener('load', hidePageLoader);

document.addEventListener('DOMContentLoaded', () => {
    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');

    function getNavbarOffset() {
        if (navbar) {
            const styles = getComputedStyle(navbar);
            const top = parseFloat(styles.top) || 0;
            return Math.ceil(navbar.getBoundingClientRect().height + top + 24);
        }

        const bodyStyles = getComputedStyle(document.body);
        const bodyOffset = parseFloat(bodyStyles.getPropertyValue('--navbar-clearance'));
        if (Number.isFinite(bodyOffset)) return bodyOffset;

        const styles = getComputedStyle(document.documentElement);
        const cssOffset = parseFloat(styles.getPropertyValue('--navbar-clearance'));
        return Number.isFinite(cssOffset) ? cssOffset : 120;
    }

    function scrollWithNavbarOffset(targetElement) {
        const top = targetElement.getBoundingClientRect().top + window.pageYOffset - getNavbarOffset();
        window.scrollTo({
            top: Math.max(0, top),
            behavior: 'smooth'
        });
    }
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            const isActive = navLinks.classList.toggle('active');
            mobileMenuBtn.setAttribute('aria-expanded', isActive);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            if (navLinks) {
                navLinks.classList.remove('active'); // Close mobile menu if open
            }
            if(mobileMenuBtn) {
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
            }

            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                scrollWithNavbarOffset(targetElement);
            }
        });
    });

    // Contact form removed - use external contact methods (Email/WhatsApp)

    // Scroll Reveal Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));

    // Keep production console clean. Add analytics here when a provider is configured.
});
