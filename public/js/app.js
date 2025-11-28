// app.js - Lógica principal del sistema

// API simple para gestionar datos
const API = {
    baseURL: 'https://vehiculos-enturnamiento.onrender.com/api',   // 🔥 BASE FIJA EN RENDER

    async request(endpoint, options = {}) {
        const token = localStorage.getItem('authToken');
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers
            },
            ...options
        };

        try {
            console.log(`🔄 API Call: ${this.baseURL}${endpoint}`);
            const response = await fetch(`${this.baseURL}${endpoint}`, config);
            const data = await response.json();
            console.log(`✅ API Response:`, data);
            return data;
        } catch (error) {
            console.error('❌ API Error:', error);
            return { 
                success: false, 
                message: 'Error de conexión con el servidor. Verifica que el servidor esté ejecutándose.' 
            };
        }
    },

    // Autenticación
    async login(credentials) {
        return await this.request('/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    },

    async register(userData) {
        return await this.request('/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    async getProfile() {
        return await this.request('/users/me');
    },

    // Admin API
    async getUsers(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        return await this.request(`/users?${queryParams}`);
    },

    async searchUsers(q) {
        const queryParams = new URLSearchParams({ username: q }).toString();
        return await this.request(`/users/search?${queryParams}`);
    },

    async updateUserRole(userId, role) {
        return await this.request(`/users/${userId}/role`, {
            method: 'PUT',
            body: JSON.stringify({ role })
        });
    },

    async updateUserState(userId, estado) {
        return await this.request(`/users/${userId}/state`, {
            method: 'PUT',
            body: JSON.stringify({ estado })
        });
    },

    // Offers & chat
    async createOffer(offerData) {
        return await this.request('/offers', {
            method: 'POST',
            body: JSON.stringify(offerData)
        });
    },

    async getOffers(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        return await this.request(`/offers?${queryParams}`);
    },

    async getTrips(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        return await this.request(`/trips?${queryParams}`);
    },

    async respondOffer(offerId, action) {
        return await this.request(`/offers/${offerId}/respond`, {
            method: 'PUT',
            body: JSON.stringify({ action })
        });
    },

    async getChats(withUser) {
        return await this.request(`/chats?withUser=${encodeURIComponent(withUser)}`);
    },

    async getConversations() {
        return await this.request(`/chats/conversations`);
    },

    async getUserById(id) {
        return await this.request(`/users/${id}`);
    },

    async postChat(toUserId, message, offerId) {
        return await this.request('/chats', {
            method: 'POST',
            body: JSON.stringify({ toUserId, message, offerId })
        });
    },

    async getAdminLogs() {
        return await this.request('/admin/logs');
    },

    // Métodos para vehículos
    async getVehicles(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        return await this.request(`/vehicles?${queryParams}`);
    },

    async registerVehicle(vehicleData) {
        return await this.request('/vehicles', {
            method: 'POST',
            body: JSON.stringify(vehicleData)
        });
    },

    async updateVehicleStatus(vehicleId, status) {
        return await this.request(`/vehicles/${vehicleId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    },

    async updateVehicleLocation(vehicleId, lat, lng) {
        return await this.request(`/vehicles/${vehicleId}/location`, {
            method: 'PUT',
            body: JSON.stringify({ lat, lng })
        });
    }
};

// Centro de notificaciones en pantalla (sin ventanas emergentes)
class NotificationCenter {
    constructor() {
        this.container = null;
        document.addEventListener('DOMContentLoaded', () => {
            this.container = document.getElementById('notification-center');
        });
    }

    show(message, type = 'info') {
        if (!this.container) {
            this.container = document.getElementById('notification-center');
        }

        if (!this.container) return alert(message);

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="status-dot"></div>
            <div>
                <strong>${type === 'error' ? 'Error' : type === 'success' ? 'Listo' : 'Aviso'}</strong>
                <div style="color: var(--muted);">${message}</div>
            </div>
        `;

        this.container.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
    }
}

// Sistema de navegación
class NavigationSystem {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.init();
    }
    
    init() {
        this.loadHeader();
        this.loadFooter();
        this.setupEventListeners();
    }
    
    loadHeader() {
        const headerContainer = document.getElementById('header-container');
        if (headerContainer) {
            fetch('header.html')
                .then(response => response.text())
                .then(html => {
                    headerContainer.innerHTML = html;
                    this.updateNavigationBasedOnUser();
                    this.updateHomeFeatures();
                    this.attachHomeButtons();
                })
                .catch(error => {
                    console.error('Error loading header:', error);
                    headerContainer.innerHTML = this.getDefaultHeader();
                });
        }
    }
    
    loadFooter() {
        const footerContainer = document.getElementById('footer-container');
        if (footerContainer) {
            fetch('footer.html')
                .then(response => response.text())
                .then(html => {
                    footerContainer.innerHTML = html;
                })
                .catch(error => {
                    console.error('Error loading footer:', error);
                    footerContainer.innerHTML = this.getDefaultFooter();
                });
        }
    }
    
    getDefaultHeader() {
        return `
            <header class="header">
                <div class="logo">
                    <h2>Sistema Enturnamiento</h2>
                </div>
                <nav class="nav">
                    <a href="index.html">Inicio</a>
                    <a href="inicio_sesion.html">Iniciar Sesión</a>
                    <a href="registration.html">Registrarse</a>
                </nav>
            </header>
            <div id="notification-center" class="notification-center"></div>
        `;
    }
    
    getDefaultFooter() {
        return `
            <footer class="footer">
                <div class="footer-content">
                    <div class="footer-section">
                        <h3>Empresa</h3>
                        <p>Sistema de gestión de enturnamiento para vehículos de terceros</p>
                    </div>
                    <div class="footer-section">
                        <h3>Enlaces rápidos</h3>
                        <ul>
                            <li><a href="#">Contratos</a></li>
                            <li><a href="#">Distribuidores</a></li>
                            <li><a href="#">Nosotros</a></li>
                        </ul>
                    </div>
                    <div class="footer-section">
                        <h3>Contacto</h3>
                        <p>+1 999 9845 556</p>
                        <p>info@empresa.com</p>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy; 2025 Empresa. Todos los derechos reservados.</p>
                </div>
            </footer>
        `;
    }
    
    updateNavigationBasedOnUser() {
        const nav = document.querySelector('.nav');
        if (!nav) return;

        if (!this.currentUser) {
            return;
        }

        nav.innerHTML = '';

        nav.innerHTML += `<a href="index.html" class="home-link">Inicio</a>`;

        switch(this.currentUser.role) {
            case 'conductor':
                nav.innerHTML += `
                    <a href="conductor.html">Panel Conductor</a>
                    <a href="chat.html" id="nav-chat-link">Chat 
                        <span id="nav-chat-badge" class="chat-badge" style="display:none"></span>
                    </a>
                `;
                break;
            case 'despachador':
                nav.innerHTML += `
                    <a href="despachador.html">Panel Despachador</a>
                    <a href="chat.html" id="nav-chat-link">Chat 
                        <span id="nav-chat-badge" class="chat-badge" style="display:none"></span>
                    </a>
                `;
                break;
            case 'administrador':
                nav.innerHTML += `
                    <a href="administrador.html">Panel Admin</a>
                    <a href="ruta.html">Gestión Rutas</a>
                `;
                break;
        }

        nav.innerHTML += `
            <span class="user-info">${this.currentUser.username}</span>
            <a href="#" id="logout-btn">Cerrar Sesión</a>
        `;

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        NavigationSystem.setChatBadge(parseInt(localStorage.getItem('chatUnreadCount') || '0'));
    }

    static setChatBadge(count) {
        try {
            const el = document.getElementById('nav-chat-badge');
            if (!el) return;
            localStorage.setItem('chatUnreadCount', count);
            if (!count || count <= 0) {
                el.style.display = 'none';
                el.textContent = '';
            } else {
                el.style.display = 'inline-block';
                el.textContent = count > 9 ? '9+' : String(count);
            }
        } catch (e) { /* ignore */ }
    }

    updateHomeFeatures() {
        const roleCards = document.querySelectorAll('[data-role-card]');
        const guestMessage = document.getElementById('guest-feature-message');

        if (!roleCards.length) return;

        const cta = document.querySelector('.cta-buttons');
        if (!this.currentUser) {
            roleCards.forEach(card => (card.style.display = 'none'));
            if (guestMessage) guestMessage.style.display = 'block';
            if (cta) cta.style.display = 'flex';
            return;
        }

        roleCards.forEach(card => {
            const role = card.getAttribute('data-role-card');
            card.style.display = role === this.currentUser.role ? 'block' : 'none';
        });

        if (guestMessage) guestMessage.style.display = 'none';
        if (cta) cta.style.display = 'none';
    }
    
    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.updateHomeFeatures();
            this.attachHomeButtons();
        });
    }

    attachHomeButtons() {
        document.querySelectorAll('.cta-buttons a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href');
                if (target) window.location.href = target;
            });
        });

        document.querySelectorAll('.home-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const currentPage = window.location.pathname.split('/').pop() || 'index.html';
                const target = link.getAttribute('href');
                if (currentPage === 'index.html' || currentPage === '') {
                    e.preventDefault();
                    this.updateHomeFeatures();
                    const main = document.querySelector('.main-content');
                    if (main) main.scrollIntoView({ behavior: 'smooth' });
                    return;
                }
                if (target) window.location.href = target;
            });
        });

        document.querySelectorAll('[data-role-card] a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();

                if (!this.currentUser) {
                    notifications.show('Inicia sesión para ir a tu panel.', 'info');
                    window.location.href = 'inicio_sesion.html';
                    return;
                }

                const target = link.getAttribute('href');
                if (target) window.location.href = target;
            });
        });
    }
    
    redirectToDashboard() {
        const target = this.getDashboardPath();
        if (!target) return;

        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage !== target) {
            window.location.href = target;
        }
    }

    getDashboardPath() {
        if (!this.currentUser) return null;
        switch(this.currentUser.role) {
            case 'conductor':
                return 'conductor.html';
            case 'despachador':
                return 'despachador.html';
            case 'administrador':
                return 'administrador.html';
            default:
                return 'index.html';
        }
    }
    
    async login(credentials) {
        try {
            const result = await API.login(credentials);
            if (result.success) {
                this.currentUser = result.user;
                localStorage.setItem('authToken', result.token);
                localStorage.setItem('currentUser', JSON.stringify(result.user));
                notifications.show('Inicio de sesión exitoso. Redirigiendo a tu panel...', 'success');
                this.updateNavigationBasedOnUser();
                this.updateHomeFeatures();
                this.attachHomeButtons();
                this.redirectToDashboard();
                return { success: true };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Error de conexión' };
        }
    }
    
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        window.location.href = 'index.html';
    }

    ensureAuthenticated(allowedRoles = []) {
        if (!this.currentUser) {
            window.location.href = 'inicio_sesion.html';
            return false;
        }

        if (allowedRoles.length && !allowedRoles.includes(this.currentUser.role)) {
            window.location.href = 'index.html';
            return false;
        }

        return true;
    }
}

// Inicializar el sistema de navegación
const notifications = new NotificationCenter();
const navigation = new NavigationSystem();

// Funciones globales
window.navigationSystem = navigation;
window.API = API;
window.notifications = notifications;

// =============================
// MAPA
// =============================
window.MapHelper = (function () {
    let usingLeaflet = false;

    function loadLeaflet() {
        return new Promise((resolve, reject) => {
            if (window.L) return resolve();
            const css = document.createElement('link');
            css.rel = 'stylesheet';
            css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(css);

            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.async = true;
            script.onload = () => {
                usingLeaflet = true;
                resolve();
            };
            script.onerror = () => reject(new Error('Error cargando Leaflet'));
            document.head.appendChild(script);
        });
    }

    function loadGoogle(apiKey) {
        return new Promise((resolve, reject) => {
            if (window.google && window.google.maps) return resolve();
            if (!apiKey) return reject(new Error('No Google API key'));
            const s = document.createElement('script');
            s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
            s.async = true;
            s.onload = () => resolve();
            s.onerror = () => reject(new Error('Error cargando Google Maps'));
            document.head.appendChild(s);
        });
    }

    async function loadMapLib(apiKey) {
        if (apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
            try {
                await loadGoogle(apiKey);
                usingLeaflet = false;
                return { provider: 'google' };
            } catch (e) {
                console.warn('Google Maps carga fallida, fallback a Leaflet', e);
            }
        }

        await loadLeaflet();
        return { provider: 'leaflet' };
    }

    function createMap(containerId, opts = {}) {
        const container = document.getElementById(containerId);
        if (!container) throw new Error(`Mapa: contenedor ${containerId} no existe`);

        if (!usingLeaflet && window.google && window.google.maps) {
            const map = new google.maps.Map(container, {
                center: opts.center || { lat: 4.711, lng: -74.072 },
                zoom: opts.zoom || 6,
            });
            return { provider: 'google', map };
        }

        const map = L.map(containerId).setView([opts.center?.lat || 4.711, opts.center?.lng || -74.072], opts.zoom || 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        return { provider: 'leaflet', map };
    }

    function addMarker(mapObject, lat, lng, title) {
        if (mapObject.provider === 'google') {
            return new google.maps.Marker({ position: { lat, lng }, map: mapObject.map, title });
        }
        return L.marker([lat, lng]).addTo(mapObject.map).bindPopup(title || '');
    }

    return {
        loadMapLib,
        createMap,
        addMarker,
        isLeaflet: () => usingLeaflet,
    };
})();

// =============================
// Socket global para chat
// =============================
(function setupGlobalChatSocket() {
  document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    if (window.globalChatSocket) return;

    if (typeof io === 'undefined') {
      console.warn('socket.io no está disponible. Incluye el script.');
      return;
    }

    const socket = io('https://vehiculos-enturnamiento.onrender.com', { auth: { token } });
    window.globalChatSocket = socket;

    socket.on('connect', () => {
      console.log('Socket global conectado');
    });

    socket.on('private_message', (msg) => {
      if (window.chatPageActive) return;

      let count = parseInt(localStorage.getItem('chatUnreadCount') || '0');
      count += 1;
      NavigationSystem.setChatBadge(count);
    });

    socket.on('disconnect', () => {
      console.log('Socket global desconectado');
    });
  });
})();
