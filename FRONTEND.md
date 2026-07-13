# FRONTEND.md — Guía del frontend (POS Ventas)

Guía práctica de cómo está construido el frontend, qué hace cada sección y **cómo crear o modificar vistas/entidades** en el futuro. El proyecto parte del template **Berry MUI** y fue adaptado a un POS.

---

## 1. Tecnologías

| Herramienta | Para qué |
|---|---|
| **React 18** | Librería de UI |
| **Vite** | Bundler y dev server |
| **Material UI (MUI v6)** | Componentes visuales + tema |
| **React Router v7** | Ruteo y navegación |
| **SWR** | Fetching + cache de datos del servidor |
| **Axios** | Cliente HTTP (llamadas a la API) |
| **React Hook Form** | Manejo de formularios |
| **Zod** | Validación de formularios (esquemas) |
| **ApexCharts** (`react-apexcharts`) | Gráficos (dashboard, reportes) |
| **react-to-print** | Impresión del ticket |
| **@tabler/icons-react** / **@mui/icons-material** | Íconos |

> Nota: el template trae libs que **no usamos** (yup, slick-carousel, framer-motion, etc.). La validación se hace con **Zod**, no yup.

---

## 2. Estructura de carpetas

```
frontend/src/
├── index.jsx            # Punto de entrada React (monta <App/>)
├── App.jsx              # Providers globales: tema, SWRConfig, RouterProvider
├── config.js            # Config del template (tema por defecto, fuente, etc.)
├── api/                 # Datos mock del template (menú demo) — legado
├── assets/              # Imágenes, logos, íconos
├── components/          # Componentes reutilizables genéricos
│   ├── Loadable.jsx     # HOC para lazy loading con spinner
│   ├── cards/MainCard.jsx   # Tarjeta contenedora estándar de cada pantalla
│   └── ...
├── constants/
│   ├── app.js           # Constantes del negocio (moneda, rutas, BUSINESS)
│   └── store.js         # gridSpacing y constantes de layout del template
├── contexts/            # Contextos (config del tema, auth)
├── hooks/               # Hooks de datos (SWR) y utilitarios
├── layouts/
│   ├── MainLayout/      # Layout con sidebar + header (app logueada)
│   └── MinimalLayout/   # Layout limpio (login)
├── menu-items/          # Definición del menú lateral (por grupos)
├── pages/               # Una carpeta por módulo/pantalla
│   └── <modulo>/
│       ├── <Modulo>Page.jsx       # Pantalla principal
│       └── components/            # Sub-componentes de esa pantalla
├── routes/
│   ├── index.jsx        # Crea el router (junta rutas públicas + protegidas)
│   ├── MainRoutes.jsx   # Rutas de la app (protegidas), con lazy loading
│   ├── AuthenticationRoutes.jsx  # Rutas públicas (login)
│   └── ProtectedRoute.jsx        # Redirige a /login si no hay sesión
├── services/            # Cliente HTTP por entidad (axios)
│   ├── api.js           # Instancia axios + interceptores (token, 401)
│   └── <entidad>Service.js
├── theme/               # Tema MUI (colores, tipografía) del template
└── utils/               # Helpers (formatCurrency, etc.)
```

---

## 3. Arquitectura y flujo de datos

El patrón de datos tiene **3 capas** bien separadas:

```
Componente (page)  →  hook (SWR)  →  service (axios)  →  API backend
      UI              cache/estado     HTTP crudo
```

- **service** (`services/<x>Service.js`): funciones que hacen la llamada HTTP con `api` (axios) y devuelven `r.data.data`. Es la única capa que conoce las URLs de la API.
- **hook** (`hooks/use<X>.js`): envuelve el service con **SWR** (cache, revalidación, estados `isLoading`/`error`). Devuelve los datos ya listos para la UI.
- **componente**: consume el hook para leer, y llama al service directamente para mutar (crear/editar/borrar), luego `mutate()` para refrescar.

**Regla:** los componentes **nunca** usan axios directo; siempre van por un service. La lectura va por un hook (SWR); la escritura llama al service y refresca con `mutate()`.

### `services/api.js`
Instancia de axios con:
- `baseURL` = `VITE_API_URL` (o `http://localhost:4000/api`).
- **Interceptor de request**: agrega `Authorization: Bearer <token>` leyendo `access_token` de `localStorage`.
- **Interceptor de response**: si la API responde **401**, borra el token y redirige a `/login`.

### Cache global de SWR (`App.jsx`)
`<SWRConfig>` global configura: `revalidateOnFocus: false`, `dedupingInterval: 5000`, `keepPreviousData: true`, `errorRetryCount: 2`. Esto reduce requests repetidos y evita parpadeo al paginar/filtrar.

---

## 4. Ruteo

- **`routes/index.jsx`**: crea el router con `createBrowserRouter([MainRoutes, AuthenticationRoutes])`.
- **`routes/MainRoutes.jsx`**: las rutas de la app. Van envueltas en `<ProtectedRoute>` + `<MainLayout>`. Cada página se importa con **lazy loading**:
  ```js
  const ProductsPage = Loadable(lazy(() => import('pages/products/ProductsPage')));
  // ...
  { path: 'productos', element: <ProductsPage /> }
  ```
- **`routes/ProtectedRoute.jsx`**: si no hay sesión, redirige a `/login`.
- **`routes/AuthenticationRoutes.jsx`**: rutas públicas (login) con `MinimalLayout`.

## 5. Menú lateral (`menu-items/`)

El menú está dividido en **grupos** (un archivo por grupo): `dashboard`, `catalogo`, `personas`, `operaciones`, `administracion`. `menu-items/index.js` los junta.

Cada ítem:
```js
{
  id: 'productos',
  title: 'Productos',
  type: 'item',
  url: '/productos',
  icon: IconPackage,        // de @tabler/icons-react
  breadcrumbs: false
}
```

## 6. Convenciones de UI

- **`MainCard`**: contenedor estándar de cada pantalla. Acepta `title` y `secondary` (acción a la derecha del título).
- **Tablas**: `Table` de MUI + `TablePagination`, con estados de **loading** (Skeleton), **vacío** (mensaje) y datos.
- **Modales de formulario**: `Dialog` de MUI + **React Hook Form + Zod** (`zodResolver`).
- **Moneda**: siempre `formatCurrency()` de `utils/formatCurrency.js` (ARS).
- **Feedback**: `Snackbar` + `Alert` para éxito/error.

### Patrón de formulario (RHF + Zod)
```jsx
const schema = z.object({
  name: z.string().min(1, 'Requerido').max(100),
  price: z.coerce.number().min(0),
  active: z.boolean(),
});

const { control, handleSubmit, reset, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
  defaultValues,
});

<Controller name="name" control={control} render={({ field }) => (
  <TextField {...field} label="Nombre *" error={!!errors.name} helperText={errors.name?.message} />
)} />
```

---

## 7. Paso a paso: crear una vista/entidad nueva

Ejemplo: pantalla **Gastos** (`/gastos`) para una entidad `Expense` que ya existe en el backend (`/api/expenses`). Es el mismo patrón que Clientes, Proveedores, etc.

### Paso 1 — Service `services/expenseService.js`
```js
import api from './api';

export const expenseService = {
  getAll: (params) => api.get('/expenses', { params }).then((r) => r.data.data),
  create: (data) => api.post('/expenses', data).then((r) => r.data.data),
  update: (id, data) => api.put(`/expenses/${id}`, data).then((r) => r.data.data),
  remove: (id) => api.delete(`/expenses/${id}`).then((r) => r.data),
};
```

### Paso 2 — Hook `hooks/useExpenses.js`
```js
import useSWR from 'swr';
import { expenseService } from 'services/expenseService';

export default function useExpenses(params = {}) {
  const key = ['/expenses', JSON.stringify(params)];
  const { data, error, isLoading, mutate } = useSWR(key, () => expenseService.getAll(params));
  return {
    expenses: data?.items ?? [],
    total: data?.total ?? 0,
    error, isLoading, mutate,
  };
}
```

### Paso 3 — Componentes en `pages/expenses/components/`
- **`ExpenseTable.jsx`**: tabla con Skeleton (loading), estado vacío, paginación y botones editar/borrar. (Copiá `pages/customers/components/CustomerTable.jsx` como base.)
- **`ExpenseFormModal.jsx`**: modal con RHF + Zod para crear/editar. (Base: `CustomerFormModal.jsx`.)

### Paso 4 — Pantalla `pages/expenses/ExpensesPage.jsx`
Orquesta: estado de búsqueda/paginación/modal, usa `useExpenses`, y al crear/editar/borrar llama a `expenseService` + `mutate()`. (Base: `pages/customers/CustomersPage.jsx`.)

### Paso 5 — Registrar la ruta en `routes/MainRoutes.jsx`
```js
const ExpensesPage = Loadable(lazy(() => import('pages/expenses/ExpensesPage')));
// ...
{ path: 'gastos', element: <ExpensesPage /> }
```

### Paso 6 — Agregar el ítem de menú
En el grupo correspondiente (ej. `menu-items/administracion.js`):
```js
{ id: 'gastos', title: 'Gastos', type: 'item', url: '/gastos', icon: IconCash, breadcrumbs: false }
```

### Paso 7 — Verificar
```bash
cd frontend
pnpm dev            # dev server (hot reload)
# o para chequear que compila:
npx vite build
```

> **Atajo:** la forma más rápida y segura de crear un CRUD nuevo es **copiar el módulo de Clientes o Proveedores** (`pages/customers/` o `pages/suppliers/` + su service + su hook) y renombrar. Ya traen todos los estados (loading, vacío, error, paginación).

---

## 8. Cómo modificar una vista existente

- **Nuevo campo en un formulario**: agregalo al `schema` Zod, a `defaultValues`, y un `<Controller>` en el modal. Actualizá el `reset(...)` de edición.
- **Nueva columna en una tabla**: agregá el `<TableCell>` en el header y en el body.
- **Nueva pantalla con pestañas**: mirá `pages/reports/ReportsPage.jsx` o `pages/config/ConfigPage.jsx` (usan `Tabs` + un componente por pestaña).
- **Un gráfico**: usá `react-apexcharts` (ver `pages/reports/components/DailyTotalChart.jsx` o `PaymentMethodChart.jsx`).
- **Vista de detalle/edición en página completa** (no modal): mirá `pages/purchases/PurchaseFormPage.jsx`.

---

## 9. Comandos útiles (`frontend/`)

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Dev server con hot reload (puerto 3000) |
| `pnpm build` / `npx vite build` | Build de producción (verifica que compile) |
| `pnpm preview` | Sirve el build de producción |
| `npx eslint src/...` | Lint de archivos |

Variables de entorno (`.env`): `VITE_API_URL` apunta al backend (`http://localhost:4000/api`).

---

## 10. Checklist para una vista/entidad nueva

- [ ] `services/<x>Service.js` (métodos que pegan a la API)
- [ ] `hooks/use<X>.js` (envuelve el service con SWR)
- [ ] `pages/<x>/components/` (tabla + modal de formulario)
- [ ] `pages/<x>/<X>Page.jsx` (orquesta estado + CRUD + `mutate()`)
- [ ] Ruta en `routes/MainRoutes.jsx` (lazy + `Loadable`)
- [ ] Ítem en el `menu-items/` del grupo correspondiente
- [ ] `pnpm dev` / `npx vite build` para verificar
