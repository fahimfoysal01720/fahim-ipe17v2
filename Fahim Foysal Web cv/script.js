document.addEventListener('DOMContentLoaded', function() {
    // ===== Print Functionality =====
    const printBtn = document.getElementById('print-btn');
    if (printBtn) {
        printBtn.addEventListener('click', function() {
            // Add printing class to body
            document.body.classList.add('printing');
            
            // Create print styles dynamically
            const style = document.createElement('style');
            style.id = 'print-styles';
            style.textContent = `
                @media print {
                    a[href^="http"]::after {
                        content: none !important;
                    }
                    body::before {
                        display: none !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `;
            document.head.appendChild(style);
            
            // Delay print to allow rendering
            setTimeout(() => {
                window.print();
                setTimeout(() => {
                    document.body.classList.remove('printing');
                    document.getElementById('print-styles')?.remove();
                }, 500);
            }, 500);
        });
    }

    
    // ===== PDF Download Functionality =====
    const downloadPdfBtn = document.getElementById('download-pdf-btn');
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', async function() {
            if (typeof html2pdf === 'undefined') {
                alert('PDF library not loaded. Please try again later.');
                return;
            }

            // Show loading state
            const originalText = downloadPdfBtn.innerHTML;
            downloadPdfBtn.innerHTML = 'Generating PDF...';
            downloadPdfBtn.disabled = true;

            try {
                const element = document.querySelector('.container');
                
                // Workaround for html2pdf issues
                const opt = {
                    margin: [10, 10, 10, 10],
                    filename: 'Fahim_Foysal_CV.pdf',
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { 
                        scale: 2,
                        letterRendering: true,
                        useCORS: true,
                        scrollX: 0,
                        scrollY: 0,
                        logging: false,
                        backgroundColor: '#FFFFFF',
                        ignoreElements: (element) => {
                            // Ignore elements you don't want in PDF
                            return element.classList.contains('no-print');
                        }
                    },
                    jsPDF: { 
                        unit: 'mm', 
                        format: 'a4', 
                        orientation: 'portrait',
                        compress: true
                    },
                    pagebreak: { 
                        mode: ['css', 'legacy'],
                        before: '.section', // Add page breaks before each section
                        avoid: 'img' // Avoid breaking images
                    }
                };

                // Create clone of element to prevent layout issues
                const clone = element.cloneNode(true);
                clone.style.width = '210mm';
                clone.style.margin = '0 auto';
                clone.style.padding = '0';
                
                // Remove elements that shouldn't be in PDF
                clone.querySelectorAll('.no-print, .footer').forEach(el => el.remove());
                
                // Fix for duplicate links in print
                clone.querySelectorAll('a').forEach(a => {
                    if (a.getAttribute('href')?.startsWith('http')) {
                        a.setAttribute('data-original-href', a.getAttribute('href'));
                        a.removeAttribute('href');
                    }
                });
                
                document.body.appendChild(clone);
                
                // Generate PDF
                await html2pdf().set(opt).from(clone).save();
                
                // Clean up
                clone.remove();
                
                // Show success state
                downloadPdfBtn.innerHTML = '✓ Downloaded!';
                setTimeout(() => {
                    downloadPdfBtn.innerHTML = originalText;
                    downloadPdfBtn.disabled = false;
                }, 2000);
                
            } catch (error) {
                console.error('PDF generation error:', error);
                downloadPdfBtn.innerHTML = 'Error! Try Again';
                downloadPdfBtn.disabled = false;
                setTimeout(() => {
                    downloadPdfBtn.innerHTML = originalText;
                }, 2000);
                alert('PDF generation failed. Please try printing instead.');
            }
        });
    }

    // ===== Menu Functionality =====
    const menuToggle = document.querySelector('.cv-menu-toggle');
    const menu = document.querySelector('.cv-menu');
    
    if (menuToggle && menu) {
        menuToggle.addEventListener('click', function() {
            menu.classList.toggle('active');
            this.classList.toggle('active');
        });
    }

    // Smooth scrolling and active menu item
    document.querySelectorAll('.cv-menu a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                if (menu.classList.contains('active')) {
                    menu.classList.remove('active');
                    menuToggle.classList.remove('active');
                }
                
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Highlight active menu item on scroll
    function highlightMenu() {
        const sections = document.querySelectorAll('.section');
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });
        
        document.querySelectorAll('.cv-menu a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', highlightMenu);
    highlightMenu();
});
