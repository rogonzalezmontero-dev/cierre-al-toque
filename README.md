# 🚕 Cierre al Toque

**Liquidación Diaria Digital para Taxistas de Uruguay**

---

## ¿Qué es?

Cierre al Toque es una Progressive Web App (PWA) que digitaliza la planilla manual de liquidación diaria de taxistas. Funciona como app instalable tanto en iPhone como Android, con soporte offline.

---

## 🚀 Cómo correr localmente

### Requisitos
- Node.js 18+ instalado
- npm 9+

### Pasos

```bash
# 1. Clonar o descomprimir el proyecto
cd cierre-al-toque

# 2. Instalar dependencias
npm install

# 3. Correr en modo desarrollo
npm run dev
```

Abrí el navegador en: **http://localhost:5173**

### Credenciales de demo (admin)
- **Cédula:** `admin`
- **Contraseña:** `admin123`

---

## 📱 Instalar como PWA

### En Android (Chrome)
1. Abrí la app en Chrome
2. Tocá el menú (⋮) → "Agregar a pantalla de inicio"
3. ¡Listo! Aparece como app nativa

### En iPhone (Safari)
1. Abrí la app en Safari
2. Tocá el botón compartir (□↑)
3. Seleccioná "Agregar a pantalla de inicio"
4. ¡Listo!

---

## 🏗 Deploy en Vercel

```bash
# 1. Buildear
npm run build

# 2. Deploy con Vercel CLI
npx vercel --prod
```

O conectar el repositorio directamente desde vercel.com.

---

## 📂 Estructura del proyecto

```
cierre-al-toque/
├── public/
│   ├── manifest.json      # PWA manifest
│   ├── sw.js              # Service worker (offline)
│   └── icon-*.png         # Iconos
├── src/
│   ├── db/
│   │   └── db.js          # Base de datos (localStorage)
│   ├── utils/
│   │   └── calculos.js    # Lógica de cálculo del turno
│   ├── context/
│   │   └── AuthContext.jsx # Estado de autenticación
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── NuevoTurnoPage.jsx
│   │   ├── HistorialPage.jsx
│   │   ├── TurnoDetallePage.jsx
│   │   ├── PerfilPage.jsx
│   │   └── AdminPage.jsx
│   ├── components/
│   │   └── Layout.jsx
│   ├── styles.css
│   ├── App.jsx
│   └── main.jsx
└── package.json
```

---

## 🧮 Lógica de Cálculo

```
Total Banderas = Diurno + Nocturno
Retribución = Total Banderas × (% / 100)  [redondeado al entero]
Aporte Leyes = Retribución × 18.1%
Total Gastos Empresa = Retribución + Combustible + Viáticos + Aceite + Gomería + Lavado + Otros
Líquido Empresa = Total Banderas − Total Gastos Empresa
Subtotal = Líquido Empresa + Aporte Leyes
Total Digital = Suma(H13) + Suma(MercadoPago) + Tarjetas
TOTAL FINAL = Subtotal − Total Digital
```

**Nota importante:** La retribución se calcula SOLO sobre Total Banderas, NO incluye fichas.

---

## 💾 Base de Datos

Los datos se almacenan en `localStorage` del navegador. Esto significa:
- Funciona completamente offline
- Los datos persisten entre sesiones
- Cada dispositivo tiene su propio almacenamiento

Para producción con múltiples dispositivos, se recomienda migrar a Supabase (ver sección de extensiones).

---

## 🔐 Sistema de Usuarios

| Campo | Descripción |
|-------|-------------|
| Nombre | Nombre completo del chofer |
| Cédula | Identificador único (login) |
| Código Chofer | Código interno |
| Matrícula | Número de matrícula del vehículo |
| Móvil | Número de móvil |
| Firma | Canvas digital guardada como PNG base64 |
| Email | Correo electrónico |
| Estado | activo / inactivo |
| Vencimiento | Fecha límite de suscripción |
| Rol | user / admin |

---

## ✨ Funcionalidades

- ✅ Login / Registro con firma digital
- ✅ Nuevo turno con cálculos en tiempo real
- ✅ Múltiples entradas H13 y Mercado Pago
- ✅ Validación número operación MP (12 dígitos)
- ✅ Historial con vista calendario mensual
- ✅ Resumen mensual automático
- ✅ Exportar turno en PDF con firma
- ✅ Panel de administración de usuarios
- ✅ PWA instalable (Android + iPhone)
- ✅ Funciona offline con service worker
- ✅ Control de suscripciones y usuarios activos/inactivos

---

## 🎨 Diseño

Paleta inspirada en los taxis de Montevideo:
- **Amarillo** `#F5C800` — color principal
- **Negro** `#111111` — fondo
- **Blanco** — texto principal
- **Rojo** `#E03030` — alertas y errores

Tipografía: **Barlow Condensed** (títulos) + **Barlow** (cuerpo)

---

*Desarrollado para taxistas de Uruguay 🇺🇾*
