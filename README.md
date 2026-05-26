# JaliscoRecicla 🌿
**Aplicación móvil de reciclaje para el estado de Jalisco, México.**
Stack: React Native (Expo) + Firebase JS SDK v10

---

## 📁 Estructura del proyecto

```
jaliscorecicla/
├── App.js                          ← Entry point con auth listener
├── app.json                        ← Configuración de Expo
├── package.json                    ← Dependencias
│
├── config/
│   └── firebaseConfig.js           ← Init Firebase (auth, db, storage)
│
├── services/
│   ├── authService.js              ← Login, register, logout, Google OAuth
│   └── firestoreService.js         ← CRUD de las 6 colecciones
│
├── utils/
│   └── seedFirestore.js            ← Carga datos iniciales en Firestore
│
├── navigation/
│   └── AppNavigator.js             ← Stack + Bottom Tab navigation
│
├── screens/
│   ├── SplashScreen.js             ← Pantalla 1  – Splash / onboarding
│   ├── LoginScreen.js              ← Pantalla 2  – Login ciudadano
│   ├── RegisterScreen.js           ← Pantalla 3  – Registro de cuenta
│   ├── HomeScreen.js               ← Pantalla 4  – Home dashboard
│   ├── SearchScreen.js             ← Pantalla 5  – Buscar residuo
│   ├── MapScreen.js                ← Pantalla 6  – Mapa / centros cercanos
│   ├── CenterDetailScreen.js       ← Pantalla 7  – Detalle de centro
│   ├── ReportScreen.js             ← Pantalla 8  – Reportar centro (form)
│   ├── UploadEvidenceScreen.js     ← Pantalla 9  – Subir fotos
│   ├── ReportSuccessScreen.js      ← Pantalla 10 – Reporte enviado ✓
│   ├── NotificationsScreen.js      ← Pantalla 11 – Notificaciones
│   ├── ProfileScreen.js            ← Pantalla 12 – Perfil del usuario
│   ├── AdminLoginScreen.js         ← Pantalla 13 – Login administrador
│   └── AdminDashboardScreen.js     ← Pantalla 14 – Panel de administración
│
└── assets/
    ├── icon.png
    ├── splash.png
    └── adaptive-icon.png
```

---

## 🚀 Instalación paso a paso

### 1. Crear el proyecto Expo

```bash
npx create-expo-app jaliscorecicla --template blank
cd jaliscorecicla
```

### 2. Copiar los archivos de este proyecto

Copia todas las carpetas y archivos (`config/`, `services/`, `navigation/`, `screens/`, `utils/`, `App.js`, `app.json`) dentro del proyecto creado.

### 3. Instalar dependencias

```bash
# Firebase
npx expo install firebase
npx expo install @react-native-async-storage/async-storage

# Navigation
npx expo install @react-navigation/native
npx expo install @react-navigation/native-stack
npx expo install @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context
npx expo install react-native-gesture-handler

# Maps & Location
npx expo install react-native-maps
npx expo install expo-location

# Image picker & Notifications
npx expo install expo-image-picker
npx expo install expo-notifications
npx expo install expo-splash-screen expo-font expo-constants

# Icons (incluido con Expo)
# @expo/vector-icons ya viene instalado
```

### 4. Configurar Firebase

1. Ve a [console.firebase.google.com](https://console.firebase.google.com)
2. Crea un proyecto llamado **jaliscorecicla**
3. Agrega una app web (`</>`)
4. Copia el objeto de configuración y pégalo en `config/firebaseConfig.js`:

```js
const firebaseConfig = {
  apiKey:            "TU_API_KEY",
  authDomain:        "jaliscorecicla.firebaseapp.com",
  projectId:         "jaliscorecicla",
  storageBucket:     "jaliscorecicla.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId:             "TU_APP_ID",
};
```

5. En Firebase Console:
   - **Authentication** → Sign-in method → Habilita **Email/Password** y **Google**
   - **Firestore Database** → Crear base de datos → Modo producción
   - **Storage** → Comenzar

### 5. Desplegar reglas de seguridad

```bash
npm install -g firebase-tools
firebase login
firebase init firestore
# Copia el contenido de firestore.rules al archivo generado
firebase deploy --only firestore:rules
```

### 6. Cargar datos iniciales (seed)

En cualquier pantalla de desarrollo (o en `App.js` temporalmente):

```js
import { runAllSeeds } from './utils/seedFirestore';
await runAllSeeds();
// Retira esta línea después de ejecutar una vez
```

### 7. Configurar Google Maps

**Android** – en `app.json` reemplaza `YOUR_ANDROID_GOOGLE_MAPS_API_KEY` con tu API key de Google Maps.

**iOS** – no requiere API key en `app.json`, pero sí en el código nativo si usas bare workflow.

Obtén tu API key en [console.cloud.google.com](https://console.cloud.google.com) → APIs → Maps SDK for Android / iOS.

### 8. Correr la app

```bash
npx expo start
# Presiona 'a' para Android, 'i' para iOS, 'w' para web
```

---

## 🔑 Usuarios de prueba (después del seed)

| Rol           | Email                         | Contraseña    |
|---------------|-------------------------------|---------------|
| Ciudadano     | aaron@jaliscorecicla.mx       | *(crear en Firebase Auth manualmente)* |
| Administrador | admin@jaliscorecicla.mx       | *(crear en Firebase Auth manualmente)* |

> Los documentos de Firestore se crean con el seed. Las cuentas de Firebase Auth se crean desde la app (Register) o desde la consola de Firebase.

---

## 🗺️ Flujo de navegación

```
Splash → Login → Register
                    ↓
               Home (tabs)
               ├── Inicio
               ├── Buscar
               ├── Reportar → UploadEvidence → ReportSuccess
               ├── Mapa     → CenterDetail
               └── Perfil

Splash → AdminLogin → AdminDashboard
```

---

## 📦 Colecciones de Firestore

| Colección          | Descripción                                |
|--------------------|--------------------------------------------|
| `users`            | Perfiles de ciudadanos y administradores   |
| `recyclingCenters` | Centros de reciclaje verificados           |
| `reports`          | Reportes ciudadanos de nuevos centros      |
| `wasteTypes`       | Catálogo de tipos de residuos              |
| `centerWasteTypes` | Relación N:M centro ↔ tipo de residuo      |
| `notifications`    | Notificaciones push por usuario            |

---

## 🛠️ Tecnologías

| Tecnología            | Uso                                    |
|-----------------------|----------------------------------------|
| React Native + Expo   | Framework móvil (iOS & Android)        |
| Firebase Auth         | Autenticación JWT (email + Google)     |
| Cloud Firestore       | Base de datos NoSQL en tiempo real     |
| Firebase Storage      | Almacenamiento de fotos de reportes    |
| Firebase Cloud Msgs   | Notificaciones push                    |
| Google Maps SDK       | Mapa interactivo y geolocalización     |
| React Navigation v6   | Stack + Bottom Tab navigation          |
| Expo Location         | Obtener coordenadas GPS del dispositivo|
| Expo Image Picker     | Selección de fotos desde galería       |

---

*Desarrollado como proyecto final de Ingeniería de Software – Jalisco, México 2026*
