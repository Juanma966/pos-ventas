# Despliegue en producción

Guía para levantar el POS en un servidor (VPS) con Docker. El stack son 3
contenedores: **Postgres** (base de datos), **backend** (API Node/Express) y
**frontend** (build de React servido por nginx, que además hace de proxy a la API).

---

## 1. Requisitos del servidor

- Un VPS con Linux (Ubuntu/Debian recomendado), 1 vCPU y 1–2 GB de RAM alcanzan para un comercio.
- **Docker** y **Docker Compose v2** instalados.
- Un dominio apuntando al servidor (opcional pero recomendado para HTTPS).
- Puerto 80 (y 443 si usás HTTPS) abiertos en el firewall.

Instalar Docker en Ubuntu:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # re-loguearse después
```

---

## 2. Obtener el proyecto

```bash
git clone https://github.com/Juanma966/pos-ventas.git
cd pos-ventas
```

---

## 3. Configurar variables de entorno

Copiar la plantilla y completarla:

```bash
cp .env.prod.example .env
```

Editar `.env`:

- `POSTGRES_PASSWORD`: una contraseña fuerte para la base.
- `JWT_ACCESS_SECRET` y `JWT_REFRESH_SECRET`: **obligatorio** 32+ caracteres y
  distintos de los de ejemplo (si no, el backend se niega a arrancar). Generarlos con:

  ```bash
  openssl rand -base64 48
  ```

- `FRONTEND_URL`: la URL pública desde donde se accede (ej. `https://pos.midominio.com`).
- `HTTP_PORT`: puerto público de nginx (por defecto 80).

> El archivo `.env` contiene secretos y está en `.gitignore`: nunca se commitea.

---

## 4. Primer arranque

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Esto construye las imágenes y levanta el stack. Al arrancar, el backend aplica
**automáticamente las migraciones** de la base (`prisma migrate deploy`).

La base arranca **vacía**. Para crear el usuario administrador y los datos base,
correr el seed **una sola vez**:

```bash
docker compose -f docker-compose.prod.yml exec backend pnpm db:seed
```

Esto crea el admin `admin@pos.com` / `admin123`.

> **IMPORTANTE:** entrá al sistema y cambiá esa contraseña de inmediato
> (Configuración → Usuarios), o creá un admin nuevo y desactivá el de ejemplo.

Acceder: `http://IP_DEL_SERVIDOR:HTTP_PORT` (o tu dominio).

---

## 5. HTTPS (recomendado)

El stack expone HTTP en el puerto de `HTTP_PORT`. Para servir por HTTPS con
certificado gratuito, poné un reverse proxy delante (en el mismo servidor):

- **Caddy** es lo más simple: obtiene y renueva el certificado de Let's Encrypt solo.

  ```
  # Caddyfile
  pos.midominio.com {
      reverse_proxy localhost:80
  }
  ```

- Alternativas: **Traefik** o **nginx + certbot**.

El backend ya está preparado para correr detrás de un proxy (`trust proxy` en
producción). Acordate de poner `FRONTEND_URL=https://pos.midominio.com` en el `.env`.

---

## 6. Backups

Backup manual de la base:

```bash
./scripts/backup.sh            # genera backups/pos_ventas_AAAAMMDD_HHMMSS.sql.gz
```

Conserva los últimos 14 automáticamente. Programar un backup diario con cron:

```bash
crontab -e
# Todos los días a las 3 AM:
0 3 * * * cd /ruta/al/proyecto && ./scripts/backup.sh >> backups/backup.log 2>&1
```

Restaurar un backup (operación destructiva, pide confirmación):

```bash
./scripts/restore.sh backups/pos_ventas_20260101_030000.sql.gz
```

> Recomendación: copiar los backups a otro lugar (otro servidor, almacenamiento
> externo) periódicamente, para no depender solo del disco del VPS.

---

## 7. Operación diaria

**Ver estado y salud:**

```bash
docker compose -f docker-compose.prod.yml ps
curl http://localhost/api/health      # {"status":"ok","db":"up"} si todo anda
```

**Ver logs:**

```bash
docker compose -f docker-compose.prod.yml logs -f backend
```

**Actualizar a una nueva versión:**

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

Las migraciones nuevas se aplican solas al reiniciar el backend.

**Detener / reiniciar:**

```bash
docker compose -f docker-compose.prod.yml stop
docker compose -f docker-compose.prod.yml up -d
```

---

## 8. Checklist de seguridad

- [ ] Secretos JWT fuertes (32+ chars) y contraseña de Postgres fuerte en `.env`.
- [ ] Contraseña del admin de ejemplo cambiada tras el primer login.
- [ ] HTTPS activo (reverse proxy con certificado).
- [ ] Firewall: solo 80/443 (y SSH) abiertos; la base **no** se expone al exterior.
- [ ] Backups programados y copiados fuera del servidor.
- [ ] `.env` fuera de git (ya está en `.gitignore`).
