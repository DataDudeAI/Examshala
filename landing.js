// Landing Page JavaScript
// Mobile Menu Toggle
function toggleMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('active');
}

function closeMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.remove('active');
}

// Scroll to Section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
        closeMenu();
    }
}

// Navigation Functions
function redirectToLogin() {
    window.location.href = 'auth.html?mode=login';
}

function redirectToRegister() {
    window.location.href = 'auth.html?mode=register';
}

function redirectToExam(examType) {
    if (localStorage.getItem('authToken')) {
        window.location.href = `portal.html?exam=${examType}`;
    } else {
        window.location.href = `auth.html?mode=register&redirect=portal&exam=${examType}`;
    }
}

function contactSales() {
    window.location.href = 'mailto:sales@exampro.com?subject=Enterprise Plan Inquiry';
}

// Active Link Highlight
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Handle mobile menu clicks
    document.addEventListener('click', (e) => {
        const hamburger = document.querySelector('.hamburger');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
            closeMenu();
        }
    });
});

// Smooth Scroll Enhancement
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
    }
});

// Floating Card Animations
const floatingCards = document.querySelectorAll('.floating-card');
floatingCards.forEach((card, index) => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'scale(1.1) translateY(-15px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'scale(1) translateY(0)';
    });
});
