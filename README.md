# LokiCare 🐶

Aplicación móvil de control veterinario para mascotas, desarrollada con React Native y Express.

## 📱 Descripción

LokiCare es una app diseñada para llevar el historial médico completo de tus mascotas de forma organizada y accesible. Permite registrar vacunas, desparasitaciones, baños, peso y más, con notificaciones inteligentes que te avisan cuando se acercan fechas importantes.

## 🎯 Funcionalidades

- **Ficha médica** — Dashboard con resumen de la mascota y últimos registros
- **Vacunas** — CRUD completo con historial, búsqueda y ordenamiento
- **Desparasitaciones** — Control de internas y externas con filtros
- **Baños y Grooming** — Registro con fecha, hora y observaciones
- **Historial de peso** — Seguimiento con gráfica de evolución
- **Perfil editable** — Datos de la mascota y propietario con foto de perfil
- **Multi-mascota** — Soporte para registrar y alternar entre varias mascotas
- **Exportar PDF** — Genera historial médico completo en PDF para compartir
- **Modo oscuro** — Tema claro/oscuro con toggle
- **Notificaciones internas** — Campanita con alertas de vencimientos próximos y cumpleaños
- **Pull to refresh** — Actualización de datos deslizando hacia abajo

## 🛠️ Stack Tecnológico

### Frontend

- React Native + Expo (SDK 54)
- TypeScript
- Expo Router (navegación por tabs)
- React Native Chart Kit (gráficas)
- Expo Image Picker (cámara/galería)
- Expo Print + Sharing (exportar PDF)

### Backend

- Node.js + Express
- TypeScript
- MySQL (mysql2)
- Multer (upload de imágenes)

## 📂 Estructura del Proyecto

```
lokicare/
├── frontend/
│   ├── app/
│   │   ├── _layout.tsx
│   │   └── (tabs)/
│   │       ├── home.tsx
│   │       ├── vacunas.tsx
│   │       ├── desparasitacion.tsx
│   │       ├── banos.tsx
│   │       ├── peso.tsx
│   │       └── perfil.tsx
│   ├── src/
│   │   ├── components/
│   │   │   ├── AnimatedCard.tsx
│   │   │   ├── DateField.tsx
│   │   │   ├── TimeField.tsx
│   │   │   └── NotificationBell.tsx
│   │   ├── context/
│   │   │   ├── ThemeContext.tsx
│   │   │   └── MascotaContext.tsx
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── alertas.ts
│   │   │   └── notifications.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── utils/
│   │       ├── format.ts
│   │       └── validation.ts
│   └── assets/
└── backend/
    ├── src/
    │   ├── config/db.ts
    │   ├── controllers/
    │   ├── routes/
    │   ├── sql/schema.sql
    │   └── index.ts
    └── uploads/
```

## 🚀 Inicio Rápido

### Requisitos

- Node.js 18+
- MySQL (XAMPP o similar)
- Expo Go (dispositivo móvil)

### Backend

```bash
cd backend
npm install
# Ejecutar schema.sql en MySQL
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npx expo start
```

## 📸 Características Destacadas

### Dashboard Inteligente

- Muestra edad calculada automáticamente
- Indicadores visuales de urgencia (rojo ≤7 días, naranja ≤30 días)
- Foto dinámica de la mascota

### Sistema de Alertas

- Campanita con badge en el header
- Alerta de vacunas y desparasitaciones próximas a vencer
- Notificación de cumpleaños de la mascota
- Descarte individual o masivo de alertas

### Formularios Modernos

- DatePicker nativo para selección de fechas
- TimePicker para horas
- Modales flotantes para crear/editar registros
- Validación de campos en tiempo real

### Multi-mascota

- Selector de mascota activa en el perfil
- Modal para registrar nuevas mascotas
- Selector/creador de propietarios

## 🎨 Diseño

- Paleta: `#0077b6` (azul principal), `#00b4d8` (acento), `#2a9d8f` (verde)
- Modo claro y oscuro
- Cards con animaciones de entrada (fade + slide)
- Iconografía con emojis nativos

## 📄 API Endpoints

| Método              | Ruta                         | Descripción            |
| ------------------- | ---------------------------- | ---------------------- |
| GET                 | `/api/mascota/:id/resumen`   | Dashboard completo     |
| GET/PUT             | `/api/mascota/:id`           | Perfil de mascota      |
| POST                | `/api/mascota/:id/foto`      | Upload de foto         |
| GET/POST/PUT/DELETE | `/api/vacunas/...`           | CRUD vacunas           |
| GET/POST/PUT/DELETE | `/api/desparasitaciones/...` | CRUD desparasitaciones |
| GET/POST/PUT/DELETE | `/api/banos/...`             | CRUD baños             |
| GET/POST/PUT/DELETE | `/api/pesos/...`             | CRUD pesos             |
| GET/POST            | `/api/propietarios`          | Gestión propietarios   |

## 🔮 Roadmap

- [ ] Notificaciones push (listo para production build)
- [ ] Autenticación de usuarios
- [ ] Deploy en cloud (Railway + Firebase)
- [ ] Migración de imágenes a Cloudinary
- [ ] Historial de visitas al veterinario
- [ ] Compartir ficha por WhatsApp
- [ ] QR de identificación de mascota

## 👨‍💻 Autor

Desarrollado Por Luis Alberto Forero Guzman como proyecto personal para el control veterinario de mascotas.

---

_Construido con ❤️ y mucho café ☕_
