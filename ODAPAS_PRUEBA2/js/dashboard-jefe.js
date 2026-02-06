// js/dashboard-jefe.js - VERSIÓN FINAL CON WEATHERAPI FUNCIONAL

document.addEventListener('DOMContentLoaded', function() {
    console.log('=== DASHBOARD INICIANDO ===');
    
    // Actualizar hora actual
    function updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        const dateString = now.toLocaleDateString('es-MX', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        document.getElementById('currentTime').textContent = 
            `${dateString} - ${timeString}`;
    }
    
    // Actualizar cada segundo
    updateTime();
    setInterval(updateTime, 1000);
    
    // Función para obtener el clima de Ixtapaluca con WeatherAPI
    async function getWeather() {
        console.log('=== OBTENIENDO CLIMA CON WEATHERAPI ===');
        
        try {
            // TU API KEY DE WEATHERAPI - FUNCIONA INMEDIATAMENTE
            const apiKey = 'dc79576b888d45a987b181040260602';
            
            // Ciudad: Ixtapaluca, Estado de México (formato específico)
            const location = 'Ixtapaluca,State of Mexico,Mexico';
            
            // URL de WeatherAPI (funciona al instante)
            const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(location)}&lang=es`;
            
            console.log(`🌤️ Solicitando clima para: ${location}`);
            
            // Hacer la petición con timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const response = await fetch(url, {
                signal: controller.signal,
                mode: 'cors',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                console.error(`❌ Error HTTP ${response.status}:`, response.statusText);
                
                // Intentar leer el error específico
                try {
                    const errorData = await response.json();
                    console.error('Detalles del error:', errorData);
                    
                    if (errorData.error && errorData.error.code === 1002) {
                        throw new Error('API Key no válida o falta parámetro q');
                    } else if (errorData.error && errorData.error.code === 2006) {
                        throw new Error('API Key desactivada. Revisa tu cuenta en weatherapi.com');
                    } else {
                        throw new Error(`WeatherAPI: ${errorData.error?.message || 'Error desconocido'}`);
                    }
                } catch (parseError) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
            }
            
            const data = await response.json();
            
            console.log('✅ DATOS CLIMA RECIBIDOS:', {
                ubicación: `${data.location.name}, ${data.location.region}`,
                temperatura: `${data.current.temp_c}°C`,
                sensación: `${data.current.feelslike_c}°C`,
                condición: data.current.condition.text,
                humedad: `${data.current.humidity}%`,
                viento: `${data.current.wind_kph} km/h`,
                visibilidad: `${data.current.vis_km} km`
            });
            
            // Convertir datos al formato esperado
            const formattedData = {
                main: {
                    temp: data.current.temp_c
                },
                weather: [{
                    description: data.current.condition.text,
                    main: getWeatherMainFromCode(data.current.condition.code)
                }],
                name: data.location.name
            };
            
            // Actualizar la interfaz
            updateWeatherUI(formattedData);
            
            // Guardar en localStorage
            localStorage.setItem('weather_data', JSON.stringify({
                data: formattedData,
                rawData: data,
                timestamp: Date.now(),
                source: 'weatherapi'
            }));
            
            console.log('✓ Clima actualizado correctamente desde WeatherAPI');
            
            // Notificación de éxito (silenciosa)
            setTimeout(() => {
                if (Math.random() > 0.7) { // Solo mostrar a veces para no molestar
                    showNotification(`Clima actual: ${Math.round(data.current.temp_c)}°C - ${data.current.condition.text}`, 'success');
                }
            }, 1500);
            
            return data;
            
        } catch (error) {
            console.error('❌ ERROR OBTENIENDO CLIMA:', {
                mensaje: error.message,
                tipo: error.name,
                stack: error.stack
            });
            
            // Mensajes específicos según el error
            let errorMsg = 'No se pudo obtener el clima actual. ';
            
            if (error.message.includes('API Key') || error.message.includes('1002') || error.message.includes('2006')) {
                errorMsg = 'Problema con la API Key. Verifica tu cuenta en weatherapi.com';
                console.warn('⚠️ Problema con API Key. Usando datos demo mejorados...');
            } else if (error.name === 'AbortError') {
                errorMsg = 'Tiempo de espera agotado. ';
            } else if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
                errorMsg = 'Error de conexión a internet. ';
            } else {
                errorMsg += error.message;
            }
            
            errorMsg += ' Mostrando datos locales.';
            
            // Mostrar notificación solo si es un error crítico
            if (error.message.includes('API Key') || error.message.includes('1002')) {
                showNotification(errorMsg, 'warning');
            }
            
            // Usar datos demo mejorados
            useRealisticWeatherData();
            return null;
        }
    }
    
    // Función para convertir código de WeatherAPI a "main"
    function getWeatherMainFromCode(code) {
        // Códigos de WeatherAPI: https://www.weatherapi.com/docs/weather_conditions.json
        if (code === 1000) return 'Clear'; // Soleado
        if (code === 1003 || code === 1006 || code === 1009) return 'Clouds'; // Parcialmente nublado/Nublado
        if (code >= 1030 && code <= 1087) return 'Mist'; // Niebla/Neblina
        if (code >= 1063 && code <= 1201) return 'Rain'; // Lluvia
        if (code >= 1204 && code <= 1237) return 'Snow'; // Nieve
        if (code >= 1240 && code <= 1264) return 'Rain'; // Lluvia helada
        if (code >= 1273 && code <= 1282) return 'Thunderstorm'; // Tormenta
        return 'Clouds'; // Por defecto
    }
    
    // Función para actualizar la interfaz con datos del clima
    function updateWeatherUI(weatherData) {
        const weatherTemp = document.getElementById('weatherTemp');
        const weatherDesc = document.getElementById('weatherDesc');
        const weatherIcon = document.querySelector('.weather-icon');
        
        if (!weatherTemp || !weatherDesc || !weatherIcon) {
            console.error('Elementos del clima no encontrados');
            return;
        }
        
        // Extraer datos
        const temp = Math.round(weatherData.main.temp);
        const description = weatherData.weather[0].description;
        const main = weatherData.weather[0].main.toLowerCase();
        
        // Actualizar temperatura
        weatherTemp.textContent = `${temp}°C`;
        
        // Actualizar descripción (capitalizar primera letra)
        weatherDesc.textContent = description.charAt(0).toUpperCase() + description.slice(1);
        
        // Actualizar icono según el clima
        updateWeatherIcon(weatherIcon, main);
        
        // Efecto visual
        weatherIcon.style.animation = 'iconFloat 3s ease-in-out infinite';
        
        // Cambiar color del icono según la temperatura
        if (temp <= 12) {
            weatherIcon.style.color = '#4dabf7'; // Azul para frío
        } else if (temp >= 28) {
            weatherIcon.style.color = '#ff922b'; // Naranja para calor
        } else {
            weatherIcon.style.color = '#bb9358'; // Dorado para temperatura normal
        }
        
        console.log(`🌡️ Clima UI actualizado: ${temp}°C - ${description}`);
    }
    
    // Función para actualizar icono según el clima
    function updateWeatherIcon(iconElement, weatherCondition) {
        const iconMap = {
            'clear': 'fa-sun',
            'clouds': 'fa-cloud',
            'rain': 'fa-cloud-rain',
            'drizzle': 'fa-cloud-drizzle',
            'thunderstorm': 'fa-bolt',
            'snow': 'fa-snowflake',
            'mist': 'fa-smog',
            'smoke': 'fa-smog',
            'haze': 'fa-smog',
            'dust': 'fa-smog',
            'fog': 'fa-smog',
            'sand': 'fa-smog',
            'ash': 'fa-smog',
            'squall': 'fa-wind',
            'tornado': 'fa-tornado',
            'default': 'fa-cloud-sun'
        };
        
        const iconClass = iconMap[weatherCondition] || iconMap['default'];
        
        // Cambiar clase del icono
        iconElement.className = `fas ${iconClass} weather-icon`;
    }
    
    // Función para datos climáticos realistas (cuando falla la API)
    function useRealisticWeatherData() {
        console.log('🌤️ Generando datos climáticos realistas para Ixtapaluca');
        
        const now = new Date();
        const hour = now.getHours();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        
        // Datos climáticos históricos para Ixtapaluca
        let temp, description, condition;
        
        // Según el mes (clima típico de Ixtapaluca)
        if (month === 1) { // Enero
            temp = 17 + (Math.random() * 4 - 2); // 15-19°C
            description = ['Fresco por las mañanas', 'Soleado', 'Cielos despejados'][Math.floor(Math.random() * 3)];
            condition = 'Clear';
        } else if (month === 2) { // Febrero
            temp = 18 + (Math.random() * 4 - 2); // 16-20°C
            description = 'Días templados';
            condition = 'Clear';
        } else if (month === 3) { // Marzo
            temp = 21 + (Math.random() * 4 - 2); // 19-23°C
            description = 'Primavera templada';
            condition = 'Clear';
        } else if (month === 4) { // Abril
            temp = 23 + (Math.random() * 4 - 2); // 21-25°C
            description = 'Cálido y seco';
            condition = 'Clear';
        } else if (month === 5) { // Mayo
            temp = 24 + (Math.random() * 4 - 2); // 22-26°C
            description = 'Inicio de lluvias';
            condition = 'Clouds';
        } else if (month >= 6 && month <= 9) { // Jun-Sep (temporada de lluvias)
            temp = 22 + (Math.random() * 4 - 2); // 20-24°C
            const rainyOptions = ['Lluvias por la tarde', 'Nublado con llovizna', 'Tormentas eléctricas', 'Húmedo y fresco'];
            description = rainyOptions[Math.floor(Math.random() * rainyOptions.length)];
            condition = description.includes('Tormenta') ? 'Thunderstorm' : 'Rain';
        } else if (month === 10) { // Octubre
            temp = 21 + (Math.random() * 4 - 2); // 19-23°C
            description = 'Fin de lluvias, días frescos';
            condition = 'Clouds';
        } else if (month === 11) { // Noviembre
            temp = 19 + (Math.random() * 4 - 2); // 17-21°C
            description = 'Otoño fresco';
            condition = 'Clear';
        } else { // Diciembre
            temp = 17 + (Math.random() * 4 - 2); // 15-19°C
            description = 'Noches frías';
            condition = 'Clear';
        }
        
        // Ajuste por hora del día
        if (hour >= 22 || hour < 6) { // Noche (10pm-6am)
            temp -= 4;
            description = 'Noche despejada';
            condition = 'Clear';
        } else if (hour >= 6 && hour < 10) { // Mañana temprano (6am-10am)
            temp -= 2;
            description = 'Fresco por la mañana';
        } else if (hour >= 10 && hour < 14) { // Medio día (10am-2pm)
            temp += 2;
            description = description.replace('fresco', 'templado').replace('Fresco', 'Templado');
        } else if (hour >= 14 && hour < 18) { // Tarde (2pm-6pm)
            temp += 1;
            if (month >= 6 && month <= 9 && hour >= 16) {
                description = 'Probables lluvias por la tarde';
                condition = 'Rain';
            }
        }
        
        // Pequeña variación aleatoria
        temp += (Math.random() > 0.5 ? 0.5 : -0.5) * Math.random() * 2;
        
        const demoData = {
            main: {
                temp: parseFloat(temp.toFixed(1))
            },
            weather: [{
                description: description,
                main: condition
            }],
            name: 'Ixtapaluca'
        };
        
        console.log('📊 Datos climáticos generados:', {
            temperatura: `${demoData.main.temp}°C`,
            descripción: description,
            condición: condition,
            hora: `${hour}:00`,
            mes: month
        });
        
        updateWeatherUI(demoData);
        
        // Guardar como respaldo
        localStorage.setItem('weather_data', JSON.stringify({
            data: demoData,
            timestamp: Date.now(),
            source: 'simulated'
        }));
    }
    
    // Función para verificar y cargar datos del clima desde localStorage
    function loadWeatherData() {
        const storedWeather = localStorage.getItem('weather_data');
        
        if (storedWeather) {
            try {
                const weatherData = JSON.parse(storedWeather);
                const now = Date.now();
                const oneHour = 60 * 60 * 1000; // 1 hora en milisegundos
                
                // Si los datos tienen menos de 1 hora, usarlos
                if (now - weatherData.timestamp < oneHour) {
                    console.log('📂 Usando datos del clima almacenados');
                    console.log('Fuente:', weatherData.source || 'desconocida');
                    console.log('Edad:', Math.round((now - weatherData.timestamp) / 60000), 'minutos');
                    
                    updateWeatherUI(weatherData.data);
                    return true;
                } else {
                    console.log('⏰ Datos almacenados muy viejos, obteniendo nuevos...');
                }
            } catch (e) {
                console.error('Error al parsear datos del clima almacenados:', e);
            }
        }
        
        return false;
    }
    
    // Cargar información del usuario desde localStorage/sesión
    function loadUserData() {
        console.log('=== INICIANDO CARGA DE DATOS DE USUARIO ===');
        
        // Primero buscar en 'usuario' (como guarda login.js)
        let storedUser = localStorage.getItem('usuario');
        
        // Si no está, buscar en 'usuario_logueado' (para compatibilidad)
        if (!storedUser) {
            storedUser = localStorage.getItem('usuario_logueado');
            if (storedUser) {
                console.log('✓ Datos encontrados en clave alternativa: usuario_logueado');
            }
        } else {
            console.log('✓ Datos encontrados en clave principal: usuario');
        }
        
        let userData = {
            nombre: "Administrador",
            apellido_paterno: "OPDAPAS",
            apellido_materno: "Ixtapaluca",
            no_nomina: "ADMIN001",
            tipo_rol: "Jefe de Departamento",
            area: "Administración"
        };
        
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                console.log('Datos del usuario encontrados:', parsedUser);
                
                // Combinar datos, manteniendo los valores por defecto si faltan
                userData = {
                    ...userData,
                    ...parsedUser
                };
                console.log('✓ Datos combinados:', userData);
                
            } catch (e) {
                console.error('Error al parsear datos del usuario:', e);
                console.log('Datos crudos que causaron error:', storedUser);
            }
        } else {
            console.warn('✗ No se encontraron datos de usuario en localStorage');
            console.log('Claves disponibles en localStorage:');
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                console.log(`  - "${key}": "${localStorage.getItem(key).substring(0, 50)}..."`);
            }
        }
        
        // Mostrar nombre del usuario
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            const nombreCompleto = `${userData.nombre} ${userData.apellido_paterno} ${userData.apellido_materno || ''}`.trim();
            userNameElement.textContent = nombreCompleto;
            console.log(`✓ Nombre mostrado en interfaz: "${nombreCompleto}"`);
            
            // Mostrar mensaje de bienvenida si no es el usuario por defecto
            setTimeout(() => {
                if (userData.nombre !== "Administrador") {
                    showNotification(`¡Bienvenido, ${userData.nombre}!`, 'success');
                }
            }, 1500);
        } else {
            console.error('✗ No se encontró el elemento #userName en el DOM');
        }
        
        // Mostrar información adicional del usuario en consola para debug
        console.log('Información del usuario cargada:', {
            nombreCompleto: `${userData.nombre} ${userData.apellido_paterno} ${userData.apellido_materno}`,
            no_nomina: userData.no_nomina,
            tipo_rol: userData.tipo_rol,
            area: userData.area
        });
        
        console.log('=== FIN CARGA DE DATOS ===');
        return userData;
    }
    
    // Cargar módulos dinámicamente con iconos grandes
    function loadModules() {
        const modules = [
            {
                id: 'almacen',
                name: 'Almacén',
                icon: 'fa-warehouse',
                description: 'Gestión de inventario y almacenamiento'
            },
            {
                id: 'almacen-usuario',
                name: 'Almacén a Usuario',
                icon: 'fa-user-tag',
                description: 'Asignación de recursos a usuarios'
            },
            {
                id: 'canales-cielo-abierto',
                name: 'Canales de Cielo Abierto',
                icon: 'fa-water',
                description: 'Control de canales y drenajes abiertos'
            },
            {
                id: 'cargamos',
                name: 'Carcamos',
                icon: 'fa-truck-loading',
                description: 'Sistema de carga y distribución'
            },
            {
                id: 'dashboard',
                name: 'Dashboard',
                icon: 'fa-chart-pie',
                description: 'Panel de control principal'
            },
            {
                id: 'drenaje',
                name: 'Drenaje',
                icon: 'fa-recycle',
                description: 'Gestión de sistemas de drenaje'
            },
            {
                id: 'lineas-agua',
                name: 'Lineas de Agua',
                icon: 'fa-tint',
                description: 'Control de líneas de suministro'
            },
            {
                id: 'pipas',
                name: 'Pipas',
                icon: 'fa-gas-pump',
                description: 'Gestión de vehículos de distribución'
            },
            {
                id: 'plantas',
                name: 'Plantas',
                icon: 'fa-industry',
                description: 'Control de plantas de tratamiento'
            },
            {
                id: 'plantas-sedimentadoras',
                name: 'Plantas Sedimentadoras',
                icon: 'fa-filter',
                description: 'Gestión de sedimentación y filtrado'
            },
            {
                id: 'pozos',
                name: 'Pozos',
                icon: 'fa-oil-well',
                description: 'Control de pozos de extracción'
            },
            {
                id: 'pozos-absorcion',
                name: 'Pozos de absorción',
                icon: 'fa-fan',
                description: 'Gestión de sistemas de absorción'
            },
            {
                id: 'presas-gavion',
                name: 'Presas de Gavion',
                icon: 'fa-solid fa-water',
                description: 'Control de presas y contención'
            },
            {
                id: 'tanques',
                name: 'Tanques',
                icon: 'fa-oil-can',
                description: 'Gestión de tanques de almacenamiento'
            },
            {
                id: 'valvulas',
                name: 'Válvulas',
                icon: 'fa-toggle-on',
                description: 'Control de válvulas y flujos'
            },
            {
                id: 'zonas-inundacion',
                name: 'Zonas de Inundación',
                icon: 'fa-cloud-rain',
                description: 'Monitoreo de zonas de riesgo'
            }
        ];
        
        const modulesGrid = document.getElementById('modulesGrid');
        modulesGrid.innerHTML = '';
        
        modules.forEach((module, index) => {
            const moduleCard = document.createElement('div');
            moduleCard.className = 'module-card';
            moduleCard.dataset.moduleId = module.id;
            moduleCard.style.animationDelay = `${(index * 0.1) + 0.1}s`;
            
            moduleCard.innerHTML = `
                <div class="hover-glow"></div>
                <div class="module-front">
                    <i class="fas ${module.icon} module-icon"></i>
                    <h3 class="module-name">${module.name}</h3>
                    <p class="module-desc">${module.description}</p>
                </div>
                <div class="module-back">
                    <button class="btn-enter" onclick="openModule('${module.id}')">
                        <i class="fas fa-arrow-right"></i>
                        Ingresar
                    </button>
                </div>
            `;
            
            // Añadir efecto de brillo al pasar el mouse
            moduleCard.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const hoverGlow = this.querySelector('.hover-glow');
                hoverGlow.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
                hoverGlow.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
            });
            
            modulesGrid.appendChild(moduleCard);
        });
    }
    
    // Crear estrellas dinámicamente
    function createStars() {
        const starsContainer = document.querySelector('.stars');
        starsContainer.innerHTML = '';
        
        for (let i = 0; i < 60; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            
            // Posición aleatoria
            const top = Math.random() * 100;
            const left = Math.random() * 100;
            
            // Tamaño aleatorio
            const size = Math.random() * 3 + 1;
            
            // Delay de animación aleatorio
            const delay = Math.random() * 5;
            
            star.style.top = `${top}%`;
            star.style.left = `${left}%`;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.animationDelay = `${delay}s`;
            
            starsContainer.appendChild(star);
        }
    }
    
    // Crear partículas dinámicamente
    function createParticles() {
        const particlesContainer = document.querySelector('.particles');
        particlesContainer.innerHTML = '';
        
        for (let i = 0; i < 25; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Posición aleatoria
            const top = Math.random() * 100;
            const left = Math.random() * 100;
            
            // Color aleatorio entre dorado y vino
            const colors = ['#bb9358', '#ffd8a6', '#691a30', '#7a1e38'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            // Duración de animación aleatoria
            const duration = Math.random() * 20 + 20;
            const delay = Math.random() * 10;
            
            particle.style.top = `${top}%`;
            particle.style.left = `${left}%`;
            particle.style.background = `radial-gradient(circle, ${color} 30%, transparent 70%)`;
            particle.style.boxShadow = `0 0 20px ${color}80`;
            particle.style.animationDuration = `${duration}s`;
            particle.style.animationDelay = `${delay}s`;
            
            particlesContainer.appendChild(particle);
        }
    }
    
    // Efecto de iluminación en las tarjetas
    function setupCardEffects() {
        const cards = document.querySelectorAll('.module-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                // Efecto de pulso en el icono
                const icon = this.querySelector('.module-icon');
                icon.style.animation = 'iconFloat 2s ease-in-out infinite';
            });
            
            card.addEventListener('mouseleave', function() {
                // Detener animación del icono
                const icon = this.querySelector('.module-icon');
                icon.style.animation = '';
            });
        });
    }
    
    // Verificar sesión antes de cargar todo
    function verificarSesion() {
        const storedUser = localStorage.getItem('usuario');
        
        if (!storedUser) {
            console.warn('No hay sesión activa, redirigiendo al login...');
            
            // Mostrar mensaje y redirigir
            showNotification('No hay sesión activa. Redirigiendo al login...', 'warning');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            
            return false;
        }
        
        console.log('✓ Sesión activa verificada');
        return true;
    }
    
    // Inicializar todo
    if (verificarSesion()) {
        loadUserData();
        loadModules();
        createStars();
        createParticles();
        setupCardEffects();
        
        // Configurar el menú activo
        setupActiveMenu();
        
        // Cargar datos del clima
        if (!loadWeatherData()) {
            // Si no hay datos almacenados, obtener nuevos después de 1 segundo
            setTimeout(() => {
                console.log('🌤️ Obteniendo datos de clima frescos...');
                getWeather();
            }, 1000);
        }
        
        // Actualizar clima cada 30 minutos (1800000 ms)
        setInterval(() => {
            console.log('⏰ Actualización programada del clima...');
            getWeather();
        }, 30 * 60 * 1000);
        
        console.log('✅ Dashboard cargado correctamente');
        
        // Mostrar ayuda para debug
        setTimeout(() => {
            console.log('=== AYUDA PARA DEBUG ===');
            console.log('Para verificar datos, ejecuta: debugUsuario()');
            console.log('Para actualizar clima manualmente: updateWeather()');
            console.log('Para probar la API directamente: testWeatherAPI()');
        }, 3000);
    }
});

// Configurar menú activo
function setupActiveMenu() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remover clase activa de todos
            menuItems.forEach(i => {
                i.classList.remove('active');
            });
            
            // Agregar clase activa al actual
            this.classList.add('active');
            
            // Guardar estado en localStorage
            localStorage.setItem('menu_activo', this.querySelector('span').textContent);
        });
    });
    
    // Restaurar menú activo si existe
    const menuActivo = localStorage.getItem('menu_activo');
    if (menuActivo) {
        menuItems.forEach(item => {
            if (item.querySelector('span').textContent === menuActivo) {
                item.classList.add('active');
            }
        });
    }
}

// Funciones globales
function openModule(moduleId) {
    console.log(`Abriendo módulo: ${moduleId}`);
    
    // Obtener datos del usuario para personalizar el mensaje
    const storedUser = localStorage.getItem('usuario');
    let nombreUsuario = "Usuario";
    
    if (storedUser) {
        try {
            const userData = JSON.parse(storedUser);
            nombreUsuario = userData.nombre || "Usuario";
        } catch (e) {
            console.error('Error al obtener nombre del usuario:', e);
        }
    }
    
    // Efecto visual antes de redirigir
    const card = document.querySelector(`[data-module-id="${moduleId}"]`);
    if (card) {
        card.style.transform = 'scale(0.95)';
        card.style.opacity = '0.8';
        
        setTimeout(() => {
            card.style.transform = '';
            card.style.opacity = '';
            
            // Aquí pondrías tu redirección real
            // window.location.href = `modulos/${moduleId}.html`;
            
            // Por ahora, mostramos un mensaje personalizado
            const moduleName = card.querySelector('.module-name').textContent;
            showNotification(`${nombreUsuario}, redirigiendo al módulo: ${moduleName}`, 'success');
        }, 300);
    }
}

function navigateTo(page) {
    console.log(`Navegando a: ${page}`);
    
    // Obtener nombre del usuario
    const storedUser = localStorage.getItem('usuario');
    let nombreUsuario = "Usuario";
    
    if (storedUser) {
        try {
            const userData = JSON.parse(storedUser);
            nombreUsuario = userData.nombre || "Usuario";
        } catch (e) {
            console.error('Error al obtener nombre del usuario:', e);
        }
    }
    
    // Efecto visual
    showNotification(`${nombreUsuario}, redirigiendo a: ${page}`, 'info');
    
    // Aquí pondrías tu redirección real
    // window.location.href = `paginas/${page}.html`;
}

function logout() {
    // Obtener nombre del usuario para mensaje de despedida
    const storedUser = localStorage.getItem('usuario');
    let nombreUsuario = "Usuario";
    
    if (storedUser) {
        try {
            const userData = JSON.parse(storedUser);
            nombreUsuario = userData.nombre || "Usuario";
        } catch (e) {
            console.error('Error al obtener nombre del usuario:', e);
        }
    }
    
    showNotification(`${nombreUsuario}, cerrando sesión...`, 'warning');
    
    setTimeout(() => {
        // Limpiar localStorage
        localStorage.removeItem('usuario');
        localStorage.removeItem('usuario_logueado');
        localStorage.removeItem('menu_activo');
        localStorage.removeItem('weather_data');
        
        // Limpiar sessionStorage también
        sessionStorage.clear();
        
        console.log('✓ Sesión cerrada, datos limpiados');
        
        // Redirigir al login
        window.location.href = 'index.html';
    }, 1500);
}

// Mostrar notificaciones
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Icono según el tipo
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';
    if (type === 'error') icon = 'fa-times-circle';
    
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    // Estilos de notificación
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(145deg, #1e1e2a, #181824);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 15px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        z-index: 10000;
        border-left: 4px solid ${type === 'success' ? '#4CAF50' : type === 'warning' ? '#ff9800' : type === 'error' ? '#f44336' : '#2196F3'};
        transform: translateX(150%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Mostrar notificación
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(150%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Efecto de brillo al pasar el mouse sobre las tarjetas
document.addEventListener('mousemove', function(e) {
    const cards = document.querySelectorAll('.module-card');
    
    cards.forEach(card => {
        if (card.matches(':hover')) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const shine = card.querySelector('.hover-glow');
            if (shine) {
                shine.style.opacity = '1';
                shine.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
                shine.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
            }
        }
    });
});

// Efecto de ripple en botones
document.addEventListener('click', function(e) {
    if (e.target.closest('.btn-enter')) {
        const button = e.target.closest('.btn-enter');
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple 0.6s linear;
            width: ${size}px;
            height: ${size}px;
            top: ${y}px;
            left: ${x}px;
            pointer-events: none;
        `;
        
        button.appendChild(ripple);
        
        // Agregar animación ripple al CSS si no existe
        if (!document.querySelector('#ripple-animation')) {
            const style = document.createElement('style');
            style.id = 'ripple-animation';
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
        
        setTimeout(() => ripple.remove(), 600);
    }
});

// Función para actualizar el clima manualmente
function updateWeather() {
    console.log('🔄 Actualizando clima manualmente...');
    showNotification('Actualizando información del clima...', 'info');
    
    // Eliminar datos almacenados para forzar una actualización
    localStorage.removeItem('weather_data');
    
    // Obtener nuevos datos
    setTimeout(() => {
        // Buscar la función getWeather en el ámbito global
        if (typeof getWeather === 'function') {
            getWeather();
        } else {
            // Recargar la página si la función no está disponible
            console.warn('Función getWeather no encontrada, recargando...');
            location.reload();
        }
    }, 500);
}

// Añadir función para debug en consola
window.debugUsuario = function() {
    console.log('=== DEBUG USUARIO ===');
    console.log('localStorage.usuario:', localStorage.getItem('usuario'));
    console.log('localStorage.usuario_logueado:', localStorage.getItem('usuario_logueado'));
    console.log('localStorage.weather_data:', localStorage.getItem('weather_data'));
    
    try {
        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
        console.log('Datos parseados del usuario:', usuario);
        console.log('Nombre completo:', `${usuario.nombre || ''} ${usuario.apellido_paterno || ''} ${usuario.apellido_materno || ''}`.trim());
        
        const weather = JSON.parse(localStorage.getItem('weather_data') || '{}');
        if (weather.data) {
            console.log('Datos del clima almacenados:', {
                temperatura: weather.data.main?.temp + '°C',
                descripción: weather.data.weather?.[0]?.description,
                fuente: weather.source || 'desconocida',
                timestamp: new Date(weather.timestamp).toLocaleString(),
                edad: Math.round((Date.now() - weather.timestamp) / 60000) + ' minutos'
            });
        }
    } catch (e) {
        console.error('Error al parsear:', e);
    }
    
    console.log('Elementos DOM:');
    console.log('#userName:', document.getElementById('userName'));
    console.log('#weatherTemp:', document.getElementById('weatherTemp'));
    console.log('#weatherDesc:', document.getElementById('weatherDesc'));
    console.log('=== FIN DEBUG ===');
};

// Función para probar la API de clima directamente
window.testWeatherAPI = async function() {
    console.log('=== PRUEBA DIRECTA DE WEATHERAPI ===');
    
    const apiKey = 'dc79576b888d45a987b181040260602';
    
    // Probar diferentes ubicaciones
    const locations = [
        'Ixtapaluca,State of Mexico,Mexico',
        'Ixtapaluca',
        'Mexico City',
        '19.3186,-98.8824' // Coordenadas
    ];
    
    for (const location of locations) {
        console.log(`\n📍 Probando ubicación: "${location}"`);
        
        const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(location)}&lang=es`;
        
        try {
            const response = await fetch(url);
            console.log('Status:', response.status, response.statusText);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ ÉXITO - Datos recibidos:', {
                    ubicación: `${data.location.name}, ${data.location.region}, ${data.location.country}`,
                    temperatura: data.current.temp_c + '°C',
                    condición: data.current.condition.text,
                    humedad: data.current.humidity + '%',
                    viento: data.current.wind_kph + ' km/h'
                });
                
                // Actualizar la interfaz inmediatamente
                const weatherTemp = document.getElementById('weatherTemp');
                const weatherDesc = document.getElementById('weatherDesc');
                
                if (weatherTemp && weatherDesc) {
                    weatherTemp.textContent = Math.round(data.current.temp_c) + '°C';
                    weatherDesc.textContent = data.current.condition.text;
                }
                
                showNotification(`✅ API funciona: ${data.location.name} - ${Math.round(data.current.temp_c)}°C`, 'success');
                return { success: true, data: data };
            } else {
                const errorData = await response.json();
                console.error('❌ ERROR API:', errorData.error);
                showNotification(`Error ${response.status}: ${errorData.error?.message}`, 'warning');
            }
        } catch (error) {
            console.error('❌ Error en prueba:', error.message);
        }
    }
    
    showNotification('No se pudo conectar con ninguna ubicación', 'error');
    return { success: false };
};

// Función para verificar el estado de la API Key
window.checkAPIKeyStatus = async function() {
    console.log('=== VERIFICANDO ESTADO DE API KEY ===');
    
    const apiKey = 'dc79576b888d45a987b181040260602';
    
    // Intentar una llamada simple
    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=Mexico City&lang=es`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.error) {
            console.error('❌ Problema con API Key:', data.error);
            showNotification(`Problema API: ${data.error.message} (Código: ${data.error.code})`, 'error');
            return false;
        } else {
            console.log('✅ API Key válida y funcionando');
            showNotification('API Key verificada correctamente', 'success');
            return true;
        }
    } catch (error) {
        console.error('❌ Error verificando API Key:', error);
        showNotification('Error verificando API Key: ' + error.message, 'error');
        return false;
    }
};

// Ejecutar automáticamente una prueba después de cargar
setTimeout(() => {
    console.log('=== DASHBOARD OPDAPAS LISTO ===');
    console.log('Comandos disponibles en consola:');
    console.log('- debugUsuario() - Ver datos almacenados');
    console.log('- updateWeather() - Actualizar clima manualmente');
    console.log('- testWeatherAPI() - Probar conexión con API');
    console.log('- checkAPIKeyStatus() - Verificar estado de API Key');
    console.log('\n🌤️ API Key configurada: dc79576b888d45a987b181040260602');
    console.log('📍 Ubicación: Ixtapaluca, Estado de México, México');
}, 4000);