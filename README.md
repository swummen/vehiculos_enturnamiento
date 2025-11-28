# Sistema de Enturnamiento - Arquitectura en Capas

Este proyecto ha sido reorganizado utilizando una arquitectura en capas para mejorar la mantenibilidad, escalabilidad y organización del código.

## 🏗️ Arquitectura

El proyecto sigue el patrón de **Arquitectura en Capas** (Layered Architecture) con las siguientes capas:

### 1. **Capa de Presentación (Presentation Layer)**
- **Frontend**: HTML, CSS, JavaScript (en `/public`)
- **Controladores**: Manejan requests HTTP y responses
- **Middleware**: Autenticación y autorización

### 2. **Capa de Lógica de Negocio (Business Logic Layer)**
- **Servicios**: Contienen la lógica de negocio
- **Validaciones**: Reglas de negocio y validaciones

### 3. **Capa de Acceso a Datos (Data Access Layer)**
- **Repositorios**: Operaciones de base de datos
- **Modelos**: Entidades y objetos de dominio

### 4. **Capa de Infraestructura (Infrastructure Layer)**
- **Base de datos**: Configuración y conexión
- **Configuración**: Variables de entorno y settings

## 📁 Estructura del Proyecto

```
vehiculos_enturnamiento/
├── src/                          # Código fuente del backend
│   ├── controllers/              # Controladores HTTP
│   │   ├── AuthController.js     # Autenticación
│   │   ├── VehicleController.js  # Vehículos
│   │   ├── TripController.js     # Viajes
│   │   ├── OfferController.js    # Ofertas
│   │   ├── ChatController.js     # Chat
│   │   └── AdminController.js    # Administración
│   ├── services/                 # Lógica de negocio
│   │   ├── AuthService.js        # Servicios de autenticación
│   │   ├── VehicleService.js     # Servicios de vehículos
│   │   ├── TripService.js        # Servicios de viajes
│   │   ├── OfferService.js       # Servicios de ofertas
│   │   ├── ChatService.js        # Servicios de chat
│   │   └── AdminService.js       # Servicios de administración
│   ├── repositories/             # Acceso a datos
│   │   ├── UserRepository.js     # Operaciones de usuarios
│   │   ├── VehicleRepository.js  # Operaciones de vehículos
│   │   ├── TripRepository.js     # Operaciones de viajes
│   │   ├── OfferRepository.js    # Operaciones de ofertas
│   │   ├── MessageRepository.js  # Operaciones de mensajes
│   │   ├── NotificationRepository.js # Operaciones de notificaciones
│   │   └── CityRepository.js     # Operaciones de ciudades
│   ├── models/                   # Entidades/Modelos
│   │   ├── User.js               # Modelo de usuario
│   │   ├── Vehicle.js            # Modelo de vehículo
│   │   ├── Trip.js               # Modelo de viaje
│   │   ├── Offer.js              # Modelo de oferta
│   │   ├── Message.js            # Modelo de mensaje
│   │   ├── Notification.js       # Modelo de notificación
│   │   └── City.js               # Modelo de ciudad
│   ├── middleware/               # Middleware
│   │   └── auth.js               # Autenticación y autorización
│   ├── infrastructure/           # Infraestructura
│   │   └── database.js           # Configuración de BD
│   └── utils/                    # Utilidades
├── public/                       # Frontend
│   ├── css/                      # Estilos
│   ├── js/                       # JavaScript del frontend
│   ├── images/                   # Imágenes
│   └── *.html                    # Páginas HTML
├── tests/                        # Pruebas
├── server.js                     # Archivo principal del servidor
├── package.json                  # Dependencias
└── README.md                     # Este archivo
```

## 🔄 Flujo de Datos

```
Cliente HTTP → Controlador → Servicio → Repositorio → Base de Datos
                ↓
             Middleware (Auth)
                ↓
             Respuesta HTTP
```

## 🚀 Instalación y Uso

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar variables de entorno**:
   Crear archivo `.env` con:
   ```
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=password
   DB_NAME=enturnamiento
   JWT_SECRET=tu_jwt_secret_aqui
   ```

3. **Ejecutar el servidor**:
   ```bash
   npm start
   ```

4. **Acceder a la aplicación**:
   - Frontend: http://localhost:3000
   - API: http://localhost:3000/api

## 🔐 Autenticación

El sistema utiliza JWT (JSON Web Tokens) para autenticación:

- **Login**: `POST /api/login`
- **Registro**: `POST /api/register`
- **Headers requeridos**: `Authorization: Bearer <token>`

## 👥 Roles de Usuario

1. **Conductor**: Puede registrar vehículos, actualizar estado/ubicación
2. **Despachador**: Puede crear viajes, enviar ofertas
3. **Administrador**: Puede gestionar usuarios, ver logs del sistema

## 📚 API Endpoints

### Autenticación
- `POST /api/login` - Iniciar sesión
- `POST /api/register` - Registrarse
- `GET /api/users/me` - Obtener perfil

### Vehículos
- `GET /api/vehicles` - Listar vehículos
- `POST /api/vehicles` - Registrar vehículo
- `PUT /api/vehicles/:id/status` - Actualizar estado
- `PUT /api/vehicles/:id/location` - Actualizar ubicación

### Viajes
- `GET /api/trips` - Listar viajes
- `POST /api/trips` - Crear viaje
- `PUT /api/trips/:id/finalize` - Finalizar viaje

### Ofertas
- `GET /api/offers` - Listar ofertas
- `POST /api/offers` - Crear oferta
- `PUT /api/offers/:id/respond` - Responder oferta

### Chat
- `GET /api/chats/conversations` - Obtener conversaciones
- `POST /api/chats` - Enviar mensaje
- `GET /api/users/search` - Buscar usuarios

### Administración
- `GET /api/users` - Listar usuarios
- `PUT /api/users/:id/role` - Actualizar rol
- `GET /api/admin/logs` - Ver logs del sistema

## 🧪 Testing

Para ejecutar las pruebas:
```bash
npm test
```

## 📈 Beneficios de la Arquitectura

1. **Separación de responsabilidades**: Cada capa tiene una función específica
2. **Mantenibilidad**: Código más organizado y fácil de mantener
3. **Escalabilidad**: Fácil agregar nuevas funcionalidades
4. **Testabilidad**: Cada capa se puede probar independientemente
5. **Flexibilidad**: Cambios en una capa no afectan las demás

## 🛠️ Tecnologías

- **Backend**: Node.js, Express.js
- **Base de Datos**: MySQL
- **Autenticación**: JWT
- **Tiempo Real**: Socket.IO
- **Frontend**: HTML5, CSS3, JavaScript

## 📝 Notas

- La aplicación mantiene compatibilidad con la versión anterior
- Todas las rutas de API existentes siguen funcionando
- El frontend se sirve estáticamente desde `/public`
- La base de datos se inicializa automáticamente al arrancar

---

**Desarrollado con Arquitectura en Capas** 🏗️