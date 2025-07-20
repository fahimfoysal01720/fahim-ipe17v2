// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navList = document.querySelector('.nav-list');
    
    mobileMenuToggle.addEventListener('click', function() {
        navList.classList.toggle('active');
        this.querySelector('i').classList.toggle('fa-times');
    });

    // Dropdown Menu Toggle for Mobile
    const dropdowns = document.querySelectorAll('.dropdown > a, .nested-dropdown > a');
    
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const submenu = this.nextElementSibling;
                submenu.classList.toggle('active');
                
                // Toggle chevron icon
                const chevron = this.querySelector('.fa-chevron-down, .fa-chevron-right');
                if (chevron) {
                    chevron.classList.toggle('fa-chevron-down');
                    chevron.classList.toggle('fa-chevron-up');
                }
            }
        });
    });
    * Add this JavaScript to your existing script to handle the scroll effect */
document.addEventListener('DOMContentLoaded', function() {
  // Menu bar scroll effect
  const menuBar = document.querySelector('.menu-bar');
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      menuBar.classList.add('scrolled');
    } else {
      menuBar.classList.remove('scrolled');
    }
  });

  // Create particles for hero section
  const heroSection = document.querySelector('.hero-section');
  if (heroSection) {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    heroSection.appendChild(particlesContainer);

    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      // Random properties
      const size = Math.random() * 5 + 2;
      const posX = Math.random() * 100;
      const duration = Math.random() * 10 + 10;
      const delay = Math.random() * -20;
      
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${posX}%`;
      particle.style.bottom = `-${size}px`;
      particle.style.animationDuration = `${duration}s`;
      particle.style.animationDelay = `${delay}s`;
      
      particlesContainer.appendChild(particle);
    }
  }
});


    // Sticky Header on Scroll
    const menuBar = document.querySelector('.menu-bar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            menuBar.classList.add('scrolled');
        } else {
            menuBar.classList.remove('scrolled');
        }
    });

    // Back to Top Button
    const backToTopBtn = document.querySelector('.back-to-top');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Property Card Animation on Scroll
    const propertyCards = document.querySelectorAll('.property-card');
    const observerOptions = {
        threshold: 0.1
    };

    const propertyObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    propertyCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.5s ease';
        propertyObserver.observe(card);
    });

    // Testimonial Slider
    const testimonials = document.querySelectorAll('.testimonial-card');
    let currentTestimonial = 0;
    
    function showTestimonial(index) {
        testimonials.forEach((testimonial, i) => {
            testimonial.style.display = i === index ? 'block' : 'none';
        });
    }
    
    // Initialize first testimonial
    if (testimonials.length > 0) {
        showTestimonial(0);
        
        // Auto-rotate testimonials
        setInterval(() => {
            currentTestimonial = (currentTestimonial + 1) % testimonials.length;
            showTestimonial(currentTestimonial);
        }, 5000);
    }

    // Form Validation for Newsletter
    const newsletterForm = document.querySelector('.newsletter form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            
            if (emailInput.value && isValidEmail(emailInput.value)) {
                // Here you would typically send the data to your server
                alert('Thank you for subscribing to our newsletter!');
                emailInput.value = '';
            } else {
                alert('Please enter a valid email address.');
            }
        });
    }

    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Search Functionality (Basic Implementation)
    const searchButton = document.querySelector('.search-button');
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            const citySelect = document.querySelector('.search-option:nth-child(1) select');
            const typeSelect = document.querySelector('.search-option:nth-child(2) select');
            const budgetSelect = document.querySelector('.search-option:nth-child(3) select');
            
            // In a real implementation, this would filter properties or make an API call
            alert(`Searching for: ${typeSelect.value} in ${citySelect.value} with budget ${budgetSelect.value}`);
        });
    }

    // FAB (Floating Action Button) Toggle
    const fabMain = document.querySelector('.fab-main');
    const fabOptions = document.querySelector('.fab-options');
    
    if (fabMain && fabOptions) {
        fabMain.addEventListener('click', function() {
            fabOptions.style.opacity = fabOptions.style.opacity === '1' ? '0' : '1';
            fabOptions.style.visibility = fabOptions.style.visibility === 'visible' ? 'hidden' : 'visible';
        });
    }
});

// Smooth Scrolling for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 70,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            const navList = document.querySelector('.nav-list');
            if (navList.classList.contains('active')) {
                navList.classList.remove('active');
                document.querySelector('.mobile-menu-toggle i').classList.remove('fa-times');
            }
        }
    });
});
// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navList = document.querySelector('.nav-list');
    
    mobileMenuToggle.addEventListener('click', function() {
        navList.classList.toggle('active');
        this.querySelector('i').classList.toggle('fa-times');
    });

    // Dropdown Menu Toggle for Mobile
    const dropdowns = document.querySelectorAll('.dropdown > a');
    
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const parent = this.parentElement;
                parent.classList.toggle('active');
                
                // Toggle chevron icon
                const chevron = this.querySelector('.fa-chevron-down');
                if (chevron) {
                    chevron.classList.toggle('fa-chevron-down');
                    chevron.classList.toggle('fa-chevron-up');
                }
            }
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (window.innerWidth > 768) {
            if (!e.target.closest('.dropdown')) {
                document.querySelectorAll('.mega-menu').forEach(menu => {
                    menu.style.opacity = '0';
                    menu.style.visibility = 'hidden';
                    menu.style.transform = 'translateY(10px)';
                });
                
                // Reset chevron icons
                document.querySelectorAll('.dropdown a .fa-chevron-up').forEach(icon => {
                    icon.classList.remove('fa-chevron-up');
                    icon.classList.add('fa-chevron-down');
                });
            }
        }
    });

    // Rest of your existing JavaScript...
});