# Kids Ministry Management System

Sistema de gestión para el ministerio de niños, desarrollado con tecnologías web modernas para facilitar la administración de usuarios, distritos, reportes y datos ministeriales.

## 🚀 Tecnologías

Este proyecto está construido utilizando el siguiente stack tecnológico:

- **Frontend Core**: [Vue 3](https://vuejs.org/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
- **UI Framework**: [Vuetify](https://vuetifyjs.com/) (Material Design)
- **Estado Global**: [Pinia](https://pinia.vuejs.org/)
- **Enrutamiento**: [Vue Router](https://router.vuejs.org/)
- **Backend / Base de Datos**: [Firebase](https://firebase.google.com/) (Firestore, Authentication)
- **Manejo de Fechas**: [date-fns](https://date-fns.org/)
- **Validación de Formularios**: [Vuelidate](https://vuelidate-next.netlify.app/)

## ✨ Funcionalidades Principales

El sistema cuenta con control de acceso basado en roles (Administrador, Secretaria, Usuario) y ofrece las siguientes características:

### 🏠 General
- **Autenticación Segura**: Sistema de inicio de sesión integrado con Firebase Auth.
- **Dashboard**: Panel principal con acceso rápido a las funciones según el rol del usuario.

### 👤 Gestión de Usuarios y Datos
- **Gestión de Usuarios**: Administración de cuentas de acceso al sistema.
- **Datos Personales**: Formularios para el registro y actualización de información personal.
- **Datos Ministeriales**: Gestión de información específica del ministerio.
- **Listados**:
  - Lista de Cumpleaños.
  - Lista de Líderes.

### 🏢 Administración (Roles: Admin/Secretaria)
- **Gestión de Distritos**: ABM (Alta, Baja, Modificación) de distritos.
- **Periodos de Reporte**: Configuración de los periodos para la entrega de informes.
- **Reportes Distritales**: Visualización y gestión de reportes por distrito.
- **Histórico Distrital**: Consulta de datos históricos.
- **Matriz de Reportes**: Vista consolidada de reportes.

## 🛠️ Configuración e Instalación

### Prerrequisitos
- [Node.js](https://nodejs.org/) (versión recomendada LTS)
- NPM (incluido con Node.js)

### Pasos de Instalación

1.  **Clonar el repositorio** (si aplica) o descargar el código fuente.
2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Configuración de Firebase**:
    Asegúrate de tener configurado tu proyecto de Firebase. Verifica el archivo `src/firebase/config.ts` (o similar) para conectar con tus credenciales de Firebase.

### Scripts Disponibles

- **Iniciar servidor de desarrollo**:
    ```bash
    npm run dev
    ```
    Abre la aplicación en modo desarrollo (usualmente http://localhost:5173).

- **Construir para producción**:
    ```bash
    npm run build
    ```
    Genera los archivos estáticos optimizados en la carpeta `dist`, verificando tipos con `vue-tsc`.

- **Previsualizar producción**:
    ```bash
    npm run preview
    ```
    Sirve localmente la versión construida de la aplicación.

## 📂 Estructura del Proyecto

```
src/
├── components/     # Componentes reutilizables de Vue
├── composables/    # Lógica reutilizable (Vue Composables)
├── firebase/       # Configuración e inicialización de Firebase
├── plugins/        # Configuración de plugins (ej. Vuetify)
├── router/         # Configuración de rutas (Vue Router)
├── stores/         # Estados globales (Pinia)
├── types/          # Definiciones de tipos TypeScript
├── views/          # Vistas principales de la aplicación
│   ├── admin/      # Vistas administrativas (Reportes, Distritos, etc.)
│   ├── auth/       # Vistas de autenticación (Login)
│   └── dashboard/  # Vistas del panel principal y formularios de datos
└── App.vue         # Componente raíz
```

## 📄 Licencia

Este proyecto es privado.
