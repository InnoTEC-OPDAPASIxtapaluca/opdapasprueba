// js/login.js - VERSION VRGAS MEJORADA CON AUDIO

// ========== FUNCIONES DE EFECTOS VISUALES ==========

// Función para crear partículas flotantes
function createParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    
    // Crear múltiples partículas
    for (let i = 0; i < 10; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Posiciones aleatorias
        const top = Math.random() * 100;
        const left = Math.random() * 100;
        const size = Math.random() * 4 + 1;
        const delay = Math.random() * 10;
        
        particle.style.top = `${top}%`;
        particle.style.left = `${left}%`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.animationDelay = `${delay}s`;
        
        particlesContainer.appendChild(particle);
    }
    
    document.body.appendChild(particlesContainer);
}

// Función para crear luces de neón en el fondo
function createNeonGlow() {
    const glowContainer = document.createElement('div');
    
    const glow1 = document.createElement('div');
    glow1.className = 'neon-glow';
    glow1.style.left = '10%';
    glow1.style.top = '20%';
    
    const glow2 = document.createElement('div');
    glow2.className = 'neon-glow';
    glow2.style.right = '10%';
    glow2.style.bottom = '20%';
    
    glowContainer.appendChild(glow1);
    glowContainer.appendChild(glow2);
    
    document.querySelector('.container').appendChild(glowContainer);
}

// Efecto de sonido visual al hacer clic
function addVisualClickEffects() {
    const buttons = document.querySelectorAll('button, .btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Efecto de onda de clic
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.4);
                transform: scale(0);
                animation: ripple 0.6s linear;
                width: ${size}px;
                height: ${size}px;
                top: ${y}px;
                left: ${x}px;
                pointer-events: none;
                z-index: 1;
            `;
            
            this.appendChild(ripple);
            
            // Eliminar el elemento después de la animación
            setTimeout(() => ripple.remove(), 600);
            
            // Efecto de pulsación
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

// Agregar estilo para efecto ripple
function addRippleStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Validación mejorada con efectos visuales
function enhanceFormValidation() {
    const inputs = document.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.parentElement.style.transform = 'translateY(-5px)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.parentElement.style.transform = 'translateY(0)';
        });
        
        input.addEventListener('input', function() {
            if (this.value.trim() !== '') {
                this.parentElement.querySelector('i')?.classList.add('icon-valid');
                this.style.borderColor = '#2ecc71';
                this.style.boxShadow = '0 0 0 3px rgba(46, 204, 113, 0.1), 0 0 10px rgba(46, 204, 113, 0.2)';
            } else {
                this.parentElement.querySelector('i')?.classList.remove('icon-valid');
                this.style.borderColor = '';
                this.style.boxShadow = '';
            }
        });
    });
}

// Efecto de carga mejorado
function enhanceLoadingEffect() {
    const loginBtn = document.getElementById('loginBtn');
    const originalHTML = loginBtn.innerHTML;
    
    loginBtn.addEventListener('click', function() {
        // Solo mostrar efecto si el formulario es válido
        const form = document.getElementById('loginForm');
        if (form.checkValidity()) {
            // Crear efecto de partículas en el botón
            const particles = 5;
            for (let i = 0; i < particles; i++) {
                const particle = document.createElement('div');
                particle.className = 'btn-particle';
                particle.style.cssText = `
                    position: absolute;
                    width: 6px;
                    height: 6px;
                    background: white;
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 2;
                    animation: btnParticle 0.8s ease-out forwards;
                `;
                
                // Posición aleatoria alrededor del botón
                const angle = Math.random() * Math.PI * 2;
                const distance = 50;
                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance;
                
                particle.style.left = '50%';
                particle.style.top = '50%';
                particle.style.setProperty('--x', `${x}px`);
                particle.style.setProperty('--y', `${y}px`);
                
                this.appendChild(particle);
                
                // Eliminar después de la animación
                setTimeout(() => particle.remove(), 800);
            }
        }
    });
    
    // Agregar estilo para partículas del botón
    const style = document.createElement('style');
    style.textContent = `
        @keyframes btnParticle {
            0% {
                transform: translate(0, 0) scale(1);
                opacity: 1;
            }
            100% {
                transform: translate(var(--x), var(--y)) scale(0);
                opacity: 0;
            }
        }
        
        .icon-valid {
            color: #2ecc71 !important;
            filter: drop-shadow(0 0 5px rgba(46, 204, 113, 0.7)) !important;
        }
    `;
    document.head.appendChild(style);
}

// Animación de entrada mejorada
function enhanceEntryAnimation() {
    const loginContainer = document.querySelector('.login-container');
    const formGroups = document.querySelectorAll('.form-group');
    
    // Retrasar animación para mejor efecto
    setTimeout(() => {
        loginContainer.style.opacity = '0';
        loginContainer.style.transform = 'translateY(30px) scale(0.95)';
        
        setTimeout(() => {
            loginContainer.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            loginContainer.style.opacity = '1';
            loginContainer.style.transform = 'translateY(0) scale(1)';
        }, 100);
    }, 100);
    
    // Animación secuencial para grupos de formulario
    formGroups.forEach((group, index) => {
        group.style.animationDelay = `${0.1 + index * 0.1}s`;
    });
}

// Efecto de cambio de área/rol
function enhanceSelectEffects() {
    const selects = document.querySelectorAll('select');
    
    selects.forEach(select => {
        select.addEventListener('change', function() {
            // Efecto visual al cambiar
            this.style.transform = 'scale(1.05)';
            this.style.boxShadow = '0 0 20px rgba(187, 147, 88, 0.4)';
            
            // Icono de confirmación
            const icon = this.parentElement.querySelector('.select-icon');
            if (icon) {
                icon.style.color = '#2ecc71';
                icon.style.transform = 'translateY(-50%) rotate(360deg)';
                setTimeout(() => {
                    icon.style.color = '';
                    icon.style.transform = 'translateY(-50%) rotate(0deg)';
                }, 500);
            }
            
            setTimeout(() => {
                this.style.transform = '';
                this.style.boxShadow = '';
            }, 300);
        });
    });
}

// ========== FUNCIÓN PARA REPRODUCIR AUDIO ==========

// Función para reproducir audio de bienvenida (compatible con todos los navegadores)
function reproducirAudioBienvenida() {
    try {
        // Crear elemento de audio
        const audio = new Audio('audios/bienvenido.mp3');
        audio.volume = 0.9; // Volumen al 70%
        
        // Intentar reproducir automáticamente
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('🎵 Audio de bienvenida reproducido exitosamente');
            }).catch(error => {
                console.warn('⚠️ No se pudo reproducir automáticamente:', error);
                
                // Intentar con una estrategia alternativa
                setTimeout(() => {
                    audio.play().catch(e => {
                        console.log('🔇 Audio no disponible, continuando sin sonido');
                        // Mostrar mensaje visual alternativo
                        mostrarMensajeBienvenidaVisual();
                    });
                }, 100);
            });
        }
        
        // Manejar el final del audio
        audio.onended = () => {
            console.log('✅ Audio de bienvenida finalizado');
        };
        
    } catch (error) {
        console.error('❌ Error al intentar reproducir audio:', error);
        mostrarMensajeBienvenidaVisual();
    }
}

// Función para mostrar mensaje visual si el audio falla
function mostrarMensajeBienvenidaVisual() {
    const mensajeBienvenida = document.createElement('div');
    mensajeBienvenida.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, rgba(105, 26, 48, 0.95) 0%, rgba(138, 28, 58, 0.95) 100%);
        color: white;
        padding: 15px 30px;
        border-radius: 10px;
        z-index: 9999;
        font-size: 18px;
        font-weight: bold;
        animation: fadeInOut 2s ease;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        border: 2px solid #bb9358;
        text-align: center;
    `;
    mensajeBienvenida.textContent = '¡BIENVENIDO AL SISTEMA!';
    document.body.appendChild(mensajeBienvenida);
    
    // Eliminar después de 2 segundos
    setTimeout(() => {
        if (mensajeBienvenida.parentNode) {
            mensajeBienvenida.remove();
        }
    }, 2000);
}

// ========== MAIN - INICIALIZACIÓN ==========

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del formulario
    const loginForm = document.getElementById('loginForm');
    const areaSelect = document.getElementById('area');
    const userTypeSelect = document.getElementById('userType');
    const workerCodeInput = document.getElementById('workerCode');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    const loginBtn = document.getElementById('loginBtn');
    
    // Inicializar efectos VRGAS
    addRippleStyles();
    createParticles();
    createNeonGlow();
    addVisualClickEffects();
    enhanceFormValidation();
    enhanceLoadingEffect();
    enhanceEntryAnimation();
    enhanceSelectEffects();
    
    // Alternar visibilidad de contraseña
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const passwordInput = this.closest('.input-with-icon').querySelector('input');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
                this.style.color = '#691a30';
                this.style.filter = 'drop-shadow(0 0 5px rgba(105, 26, 48, 0.5))';
            } else {
                passwordInput.type = 'password';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
                this.style.color = '';
                this.style.filter = '';
            }
        });
    });
    
    // Manejo del formulario de login
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Resetear errores
        clearErrors();
        
        // Validaciones básicas
        let isValid = true;
        
        if (!areaSelect.value) {
            showError('errorArea', 'Por favor seleccione un área', areaSelect);
            isValid = false;
        }
        
        if (!userTypeSelect.value) {
            showError('errorUserType', 'Por favor seleccione un rol', userTypeSelect);
            isValid = false;
        }
        
        if (!workerCodeInput.value.trim()) {
            showError('errorWorkerCode', 'Por favor ingrese su número de trabajador', workerCodeInput);
            isValid = false;
        }
        
        if (!passwordInput.value.trim()) {
            showError('errorPassword', 'Por favor ingrese su contraseña', passwordInput);
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Deshabilitar botón durante la petición
        const originalText = loginBtn.innerHTML;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Verificando credenciales...</span>';
        loginBtn.disabled = true;
        
        // Efecto de carga en el botón
        loginBtn.style.background = 'linear-gradient(145deg, #4a1530 0%, #6a1a3a 100%)';
        loginBtn.style.animation = 'none';
        
        try {
            // Simular delay para mostrar efectos (en producción quitar esto)
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Preparar datos para enviar
            const loginData = {
                area: areaSelect.value,
                tipo_rol: userTypeSelect.value,
                no_nomina: workerCodeInput.value.trim(),
                password: passwordInput.value.trim()
            };
            
            // Enviar petición al servidor
            const response = await fetch('php/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Login exitoso - Efecto de éxito
                showSuccess('¡Acceso autorizado! Redirigiendo al sistema...');
                
                // 🔈 REPRODUCIR AUDIO DE BIENVENIDA AUTOMÁTICAMENTE
                reproducirAudioBienvenida();
                
                // Efecto visual de éxito
                loginForm.style.transform = 'scale(0.95)';
                loginForm.style.opacity = '0.8';
                
                // Guardar datos en localStorage
                localStorage.setItem('usuario', JSON.stringify(data.usuario));
                localStorage.setItem('session_token', data.token || Date.now().toString());
                
                // Redirigir según el rol y área
                setTimeout(() => {
                    // Efecto de desvanecimiento
                    document.body.style.opacity = '0.5';
                    document.body.style.transform = 'scale(0.95)';
                    document.body.style.transition = 'all 0.5s ease';
                    
                    setTimeout(() => {
                        // Aquí puedes redirigir a diferentes páginas según el rol y área
                        if (data.usuario.tipo_rol === 'jefe') {
                            window.location.href = 'dashboard-jefe.html';
                        } else {
                            window.location.href = 'dashboard-empleado.html';
                        }
                    }, 500);
                    
                }, 2000);
                
            } else {
                // Error en el login
                showError('errorPassword', data.message || 'Credenciales incorrectas', passwordInput);
                
                // Efecto de error
                loginForm.classList.add('shake');
                setTimeout(() => loginForm.classList.remove('shake'), 500);
            }
            
        } catch (error) {
            console.error('Error:', error);
            showError('errorPassword', 'Error de conexión con el servidor', passwordInput);
            
            // Efecto de error de conexión
            document.querySelector('.login-container').style.animation = 'shakeX 0.5s';
            setTimeout(() => {
                document.querySelector('.login-container').style.animation = '';
            }, 500);
        } finally {
            // Restaurar botón
            setTimeout(() => {
                loginBtn.innerHTML = originalText;
                loginBtn.disabled = false;
                loginBtn.style.background = '';
                loginBtn.style.animation = 'btnPulse 3s infinite';
                loginForm.style.transform = '';
                loginForm.style.opacity = '';
            }, 1000);
        }
    });
    
    // Funciones auxiliares
    function showError(elementId, message, element) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
            
            // Efecto de error en el elemento
            if (element) {
                element.style.borderColor = '#e74c3c';
                element.style.boxShadow = '0 0 0 3px rgba(231, 76, 60, 0.1), 0 0 15px rgba(231, 76, 60, 0.3)';
                
                // Efecto de vibración
                element.style.animation = 'shake 0.5s';
                setTimeout(() => element.style.animation = '', 500);
            }
        }
    }
    
    function clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.classList.remove('show');
            el.textContent = '';
        });
        
        // Restaurar bordes
        document.querySelectorAll('input, select').forEach(el => {
            el.style.borderColor = '';
            el.style.boxShadow = '';
            el.style.animation = '';
        });
        
        // Remover clase shake del formulario
        loginForm.classList.remove('shake');
    }
    
    function showSuccess(message) {
        // Efecto de confeti visual
        for (let i = 0; i < 20; i++) {
            createConfetti();
        }
        
        Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: message,
            timer: 2000,
            showConfirmButton: false,
            background: '#ffffff',
            color: '#691a30',
            customClass: {
                popup: 'animated pulse'
            }
        });
    }
    
    function createConfetti() {
        const confetti = document.createElement('div');
        const colors = ['#691a30', '#bb9358', '#8a1c3a', '#ffd700'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${color};
            border-radius: 2px;
            top: -20px;
            left: ${Math.random() * 100}vw;
            animation: fall ${Math.random() * 2 + 1}s linear forwards;
            z-index: 1000;
            pointer-events: none;
            opacity: 0.8;
        `;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 2000);
    }
    
    // Agregar estilo para animaciones adicionales
    const extraStyles = document.createElement('style');
    extraStyles.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        @keyframes shakeX {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
        
        .shake {
            animation: shake 0.5s;
        }
        
        @keyframes fall {
            to {
                transform: translateY(100vh) rotate(${Math.random() * 360}deg);
                opacity: 0;
            }
        }
        
        @keyframes fadeInOut {
            0% { 
                opacity: 0; 
                transform: translate(-50%, -50%) scale(0.8); 
            }
            20% { 
                opacity: 1; 
                transform: translate(-50%, -50%) scale(1); 
            }
            80% { 
                opacity: 1; 
                transform: translate(-50%, -50%) scale(1); 
            }
            100% { 
                opacity: 0; 
                transform: translate(-50%, -50%) scale(1.2); 
            }
        }
        
        @keyframes btnPulse {
            0% { box-shadow: 0 0 0 0 rgba(187, 147, 88, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(187, 147, 88, 0); }
            100% { box-shadow: 0 0 0 0 rgba(187, 147, 88, 0); }
        }
    `;
    document.head.appendChild(extraStyles);
    
    // Validación en tiempo real
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            clearFieldError(this);
        });
        
        input.addEventListener('change', function() {
            clearFieldError(this);
        });
    });
    
    function clearFieldError(field) {
        const formGroup = field.closest('.form-group');
        if (formGroup) {
            const errorElement = formGroup.querySelector('.error-message');
            if (errorElement) {
                errorElement.classList.remove('show');
                field.style.borderColor = '';
                field.style.boxShadow = '';
                field.style.animation = '';
            }
        }
    }
    
    // Ayuda contextual mejorada
    document.getElementById('helpLink')?.addEventListener('click', function(e) {
        e.preventDefault();
        
        Swal.fire({
            title: '🎮 AYUDA DEL SISTEMA',
            html: `
                <div style="text-align: left; max-width: 500px;">
                    <p style="color: #691a30; font-weight: bold; margin-bottom: 15px;">🔑 Credenciales de Prueba:</p>
                    <div style="background: linear-gradient(135deg, #f8f5f0 0%, #f0ece5 100%); padding: 15px; border-radius: 10px; border-left: 4px solid #bb9358;">
                        <p style="margin: 5px 0;"><strong>Área:</strong> Cualquiera de las 5 opciones</p>
                        <p style="margin: 5px 0;"><strong>Rol:</strong> jefe o empleado</p>
                        <p style="margin: 5px 0;"><strong>Nómina:</strong> Ej. RH001, FIN002, TEC001, etc.</p>
                        <p style="margin: 5px 0;"><strong>Contraseña:</strong> 123456</p>
                    </div>
                    
                    <p style="color: #691a30; font-weight: bold; margin: 20px 0 10px 0;">💼 Ejemplos Funcionales:</p>
                    <ul style="padding-left: 20px;">
                        <li style="margin-bottom: 8px;">Área: <strong>Recursos Humanos</strong>, Rol: <strong>jefe</strong>, Nómina: <strong>RH001</strong></li>
                        <li style="margin-bottom: 8px;">Área: <strong>Finanzas</strong>, Rol: <strong>empleado</strong>, Nómina: <strong>FIN002</strong></li>
                        <li style="margin-bottom: 8px;">Área: <strong>Tecnología</strong>, Rol: <strong>jefe</strong>, Nómina: <strong>TEC001</strong></li>
                    </ul>
                    
                    <p style="color: #691a30; font-weight: bold; margin: 20px 0 10px 0;">💡 Consejos:</p>
                    <ul style="padding-left: 20px;">
                        <li style="margin-bottom: 5px;">El código de nómina debe coincidir con el área seleccionada</li>
                        <li style="margin-bottom: 5px;">Los jefes tienen acceso a funciones administrativas</li>
                        <li style="margin-bottom: 5px;">Las credenciales son sensibles a mayúsculas/minúsculas</li>
                    </ul>
                </div>
            `,
            width: 600,
            padding: '20px',
            background: '#ffffff',
            color: '#333',
            showCloseButton: true,
            showConfirmButton: true,
            confirmButtonText: '¡Entendido!',
            confirmButtonColor: '#691a30',
            customClass: {
                popup: 'animated zoomIn'
            }
        });
    });
    
    // Efecto de teclear en campos
    workerCodeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            this.style.transform = 'scale(0.98)';
            setTimeout(() => this.style.transform = '', 200);
        }
    });
    
    // Efecto de foco automático en el primer campo
    setTimeout(() => {
        areaSelect.style.transform = 'scale(1.02)';
        setTimeout(() => areaSelect.style.transform = '', 300);
    }, 1000);
    
    // Agregar efecto de pulso al botón de login
    loginBtn.style.animation = 'btnPulse 3s infinite';
});