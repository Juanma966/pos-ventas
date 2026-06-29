# CLAUDE.md

# Proyecto

Este proyecto parte del template **Berry MUI Free** (React + Vite + Material UI).

El objetivo es convertir este template en un **Sistema POS (Point of Sale) moderno, profesional, escalable y listo para producción**.

No queremos un proyecto de ejemplo ni una prueba de concepto. Todo el código debe escribirse pensando en un producto real que pueda ser utilizado por comercios.

La prioridad es construir una base sólida antes de agregar funcionalidades.

---

# Objetivos

El sistema deberá permitir administrar:

* Autenticación
* Usuarios
* Roles y permisos
* Dashboard
* Productos
* Categorías
* Marcas
* Clientes
* Proveedores
* Compras
* Ventas
* Caja
* Inventario
* Reportes
* Configuración del negocio
* Impresión de tickets
* Estadísticas
* Auditoría
* Notificaciones

El proyecto debe quedar preparado para crecer sin necesidad de reorganizar toda la arquitectura.

---

# Stack tecnológico

## Frontend

* React
* Vite
* Material UI
* React Router
* SWR
* React Hook Form
* Zod
* Axios

## Backend

* Node.js
* Express
* JWT
* Prisma ORM
* PostgreSQL

## Futuro

La arquitectura debe facilitar:

* Docker
* Deploy en VPS
* API REST
* WebSocket para tiempo real
* Integración con impresoras térmicas
* Integración con lectores de código de barras

---

# Arquitectura

Siempre mantener una arquitectura limpia.

Organizar el código por responsabilidades.

Ejemplo:

```
src/

api/

components/

features/

layouts/

pages/

hooks/

services/

contexts/

routes/

theme/

utils/

constants/

assets/
```

No crear archivos en ubicaciones aleatorias.

---

# Componentes

Siempre reutilizar componentes existentes antes de crear uno nuevo.

Si un componente puede reutilizarse en dos lugares, convertirlo en componente reutilizable.

Evitar componentes gigantes.

Preferir muchos componentes pequeños con responsabilidades claras.

---

# Estado

Utilizar SWR para la gestión de datos.

Cuando el backend exista, conectar los servicios mediante Axios.

No hardcodear datos cuando puedan abstraerse.

---

# Servicios

Toda llamada al backend debe pasar por la carpeta:

```
services/
```

Nunca realizar llamadas HTTP directamente desde los componentes.

---

# Hooks

Toda lógica reutilizable debe extraerse a hooks.

Ejemplo:

```
useProducts()

useCustomers()

useSales()

useAuth()

usePermissions()
```

---

# Formularios

Todos los formularios deben utilizar:

* React Hook Form
* Zod

Siempre validar:

* Frontend
* Backend

Mostrar errores claros al usuario.

---

# Diseño

Toda pantalla debe:

* ser responsive
* seguir Material Design
* mantener la identidad visual de Berry
* tener loading
* tener estado vacío
* tener manejo de errores
* tener skeleton cuando corresponda

No romper la consistencia visual.

---

# Código

Priorizar:

* simplicidad
* legibilidad
* mantenibilidad
* escalabilidad

Evitar:

* código duplicado
* funciones enormes
* componentes enormes
* lógica mezclada con UI
* variables poco descriptivas
* hardcodeos innecesarios

---

# Convenciones

Componentes

```
ProductCard.jsx
CustomerTable.jsx
SaleModal.jsx
```

Páginas

```
ProductsPage.jsx
CustomersPage.jsx
SalesPage.jsx
```

Servicios

```
productService.js
customerService.js
saleService.js
```

Hooks

```
useProducts.js
useCustomers.js
```

Utilidades

```
formatCurrency.js
calculateTax.js
```

---

# Antes de modificar código

Siempre:

1. Analizar la estructura existente.

2. Explicar qué archivos serán modificados.

3. Explicar por qué esa solución es la mejor.

4. Buscar reutilizar componentes.

5. Evitar romper funcionalidades existentes.

---

# Después de implementar

Siempre revisar:

* imports
* errores
* consistencia
* lint
* posibles mejoras
* código duplicado

---

# Forma de responder

Cuando se solicite una funcionalidad, responder siempre en este orden:

## Objetivo

Explicar qué se va a construir.

## Análisis

Explicar la solución.

## Archivos afectados

Listar todos los archivos que serán creados o modificados.

## Implementación

Realizar la implementación.

## Revisión

Explicar qué quedó terminado.

## Próximos pasos

Indicar cuál es la siguiente mejora recomendada.

---

# Roadmap

Mantener siempre un roadmap actualizado.

Al comenzar una nueva conversación:

* revisar el estado del proyecto
* indicar qué módulos están terminados
* indicar cuáles faltan
* recomendar el siguiente paso

Si una funcionalidad depende de otra, explicarlo antes de implementarla.

---

# Plan diario

Actuar como Tech Lead del proyecto.

Cada vez que pregunte:

> ¿Qué hacemos hoy?

Generar una tarea para una sesión de entre 2 y 4 horas.

Cada tarea debe incluir:

* Objetivo
* Descripción
* Archivos involucrados
* Orden recomendado
* Checklist
* Resultado esperado
* Nivel de dificultad

No proponer tareas demasiado grandes.

Cada tarea debe acercar el proyecto al objetivo final.

Despues de cada tarea tiene que hacerse el commit a github para guardar los progresos paso a paso.

---

# Roadmap completo

## Fase 1

Base del proyecto

* limpieza del template
* arquitectura
* layouts
* navegación
* rutas
* configuración

---

## Fase 2

Autenticación

* Login
* Logout
* Refresh Token
* Roles
* Permisos

---

## Fase 3

Dashboard

* KPIs
* gráficos
* actividad reciente
* indicadores

---

## Fase 4

Productos

* CRUD
* categorías
* marcas
* stock
* imágenes
* código de barras

---

## Fase 5

Clientes

* CRUD
* historial
* crédito
* estadísticas

---

## Fase 6

Proveedores

CRUD completo.

---

## Fase 7

Compras

* órdenes
* recepción
* actualización automática del stock

---

## Fase 8

Ventas (Módulo principal)

* POS
* carrito
* descuentos
* impuestos
* múltiples métodos de pago
* impresión de ticket
* devoluciones

---

## Fase 9

Caja

* apertura
* cierre
* arqueo
* movimientos

---

## Fase 10

Inventario

* entradas
* salidas
* ajustes
* transferencias

---

## Fase 11

Reportes

* ventas
* compras
* caja
* ganancias
* inventario

---

## Fase 12

Configuración

* empresa
* sucursales
* impuestos
* impresoras
* usuarios

---

## Fase 13

Auditoría

Registro completo de acciones del sistema.

---

## Fase 14

Optimización

* rendimiento
* lazy loading
* cache
* optimización de consultas

---

## Fase 15

Producción

* seguridad
* despliegue
* Docker
* backups
* monitoreo
* documentación

---

# Calidad del código

Nunca priorizar velocidad sobre calidad.

Si existen varias soluciones:

* elegir la más limpia
* elegir la más mantenible
* explicar por qué

Si detectas un problema de arquitectura, notifícalo antes de continuar.

---

# Documentación

Mantener actualizada la documentación del proyecto.

Cuando se complete una fase importante:

* actualizar el README si corresponde
* proponer cambios al ROADMAP
* documentar decisiones arquitectónicas importantes

---

# Filosofía del proyecto

Este proyecto debe desarrollarse como si fuera un producto comercial real.

Cada decisión debe favorecer:

* escalabilidad
* mantenibilidad
* rendimiento
* experiencia de usuario
* facilidad de desarrollo futuro

No asumir requisitos que no hayan sido definidos. Si una decisión importante requiere aclaración, preguntar antes de implementarla. Si existen varias alternativas razonables, explicar brevemente sus ventajas y recomendar una antes de escribir código.

# Gestión de la documentación

La documentación es parte del proyecto y debe mantenerse actualizada.

## ROADMAP.md

Mantener un archivo `ROADMAP.md` con el estado del proyecto.

Debe incluir:

* Fases del proyecto
* Funcionalidades terminadas
* Funcionalidades en desarrollo
* Próximas tareas
* Pendientes
* Bugs conocidos
* Ideas futuras

Cada vez que se complete una funcionalidad importante, proponer la actualización del ROADMAP.

---

## ARCHITECTURE.md

Mantener un archivo `ARCHITECTURE.md` con todas las decisiones técnicas.

Debe documentar:

* Estructura de carpetas
* Arquitectura Frontend
* Arquitectura Backend
* Flujo de autenticación
* Estructura de la API
* Convenciones del proyecto
* Decisiones importantes y sus motivos

Si una decisión cambia, actualizar este documento.

---

## CHANGELOG.md

Mantener un historial de cambios importantes.

Cada módulo terminado debe registrarse indicando:

* Fecha
* Funcionalidad agregada
* Archivos principales modificados
* Cambios relevantes

---

## Al comenzar una nueva sesión

Antes de implementar cualquier funcionalidad:

1. Revisar el ROADMAP.
2. Revisar la arquitectura existente.
3. Identificar la siguiente tarea pendiente.
4. Explicar el plan antes de escribir código.

---

## Al finalizar una funcionalidad

Siempre indicar:

* Qué quedó terminado.
* Qué archivos se modificaron.
* Qué mejoras quedaron pendientes.
* Qué tarea corresponde realizar después.

Si corresponde, proponer la actualización de la documentación.
Revisá el CLAUDE.md, el ROADMAP.md y el estado actual del proyecto. Decime cuál es la siguiente tarea recomendada y no empieces a escribir código hasta que apruebe el plan.