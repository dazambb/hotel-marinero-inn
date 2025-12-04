document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling para los enlaces del navbar
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Cerrar el navbar en móvil después de hacer clic
                const navbarCollapse = document.querySelector('.navbar-collapse');
                if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                    navbarCollapse.classList.remove('show');
                }
                
                // Focus management para accesibilidad
                target.setAttribute('tabindex', '-1');
                target.focus();
            }
        });
    });

    // Formulario de contacto con validación mejorada
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const submitBtn = document.getElementById('submitBtn');
        const btnText = document.getElementById('btnText');
        const btnLoader = document.getElementById('btnLoader');
        const formMessages = document.getElementById('formMessages');
        const mensajeTextarea = document.getElementById('mensaje');
        const charCount = document.getElementById('charCount');

        // Contador de caracteres
        if (mensajeTextarea && charCount) {
            mensajeTextarea.addEventListener('input', function() {
                charCount.textContent = this.value.length;
            });
        }

        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Deshabilitar botón y mostrar loader
            submitBtn.disabled = true;
            btnText.textContent = 'Enviando...';
            btnLoader.style.display = 'inline-block';
            formMessages.style.display = 'none';

            // Validación del lado del cliente
            if (!this.checkValidity()) {
                this.classList.add('was-validated');
                submitBtn.disabled = false;
                btnText.textContent = 'Enviar Mensaje';
                btnLoader.style.display = 'none';
                return;
            }

            try {
                // Obtener datos del formulario
                const formData = new FormData(this);
                
                // Enviar datos
                const response = await fetch('/contacto', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        nombre: formData.get('nombre'),
                        email: formData.get('email'),
                        telefono: formData.get('telefono'),
                        mensaje: formData.get('mensaje'),
                        honeypot: formData.get('honeypot')
                    })
                });

                const data = await response.json();

                // Mostrar mensaje
                formMessages.style.display = 'block';
                
                if (data.success) {
                    formMessages.className = 'alert alert-success';
                    formMessages.innerHTML = `
                        <i class="bi bi-check-circle-fill me-2"></i>
                        ${data.message}
                    `;
                    this.reset();
                    charCount.textContent = '0';
                    this.classList.remove('was-validated');
                    
                    // Scroll al mensaje de éxito
                    formMessages.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } else {
                    formMessages.className = 'alert alert-danger';
                    let errorMessage = data.message || 'Hubo un error al enviar el mensaje.';
                    
                    if (data.errors && data.errors.length > 0) {
                        errorMessage += '<ul class="mb-0 mt-2">';
                        data.errors.forEach(error => {
                            errorMessage += `<li>${error.msg}</li>`;
                        });
                        errorMessage += '</ul>';
                    }
                    
                    formMessages.innerHTML = `
                        <i class="bi bi-exclamation-triangle-fill me-2"></i>
                        ${errorMessage}
                    `;
                }

            } catch (error) {
                console.error('Error:', error);
                formMessages.style.display = 'block';
                formMessages.className = 'alert alert-danger';
                formMessages.innerHTML = `
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    Error al enviar el mensaje. Por favor intenta nuevamente o contáctanos por WhatsApp.
                `;
            } finally {
                // Habilitar botón y ocultar loader
                submitBtn.disabled = false;
                btnText.textContent = 'Enviar Mensaje';
                btnLoader.style.display = 'none';
            }
        });
    }

    // Navbar background on scroll con mejor performance
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                const navbar = document.querySelector('.navbar');
                if (navbar) {
                    if (window.scrollY > 50) {
                        navbar.classList.add('scrolled');
                    } else {
                        navbar.classList.remove('scrolled');
                    }
                }
                ticking = false;
            });
            ticking = true;
        }
    });

    // Animación de aparición para las tarjetas
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const fadeObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    fadeObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.service-card, .room-card, .gallery-item').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            fadeObserver.observe(card);
        });
    }
});