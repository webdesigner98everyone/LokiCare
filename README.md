# LokiCare 🐶

Aplicación de control veterinario para mascotas.

## Estructura

```
lokicare/
├── frontend/   → App móvil (React Native + Expo + TypeScript)
└── backend/    → API REST (Express + MySQL)
```

## Inicio rápido

### Backend
```bash
cd backend
npm install
npm run dev
```
Requiere MySQL corriendo (XAMPP). Ejecutar `backend/src/sql/schema.sql` en phpMyAdmin.

### Frontend
```bash
cd frontend
npm install
npx expo start
```
