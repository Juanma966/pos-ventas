import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { env } from './config/env.js';
import { prisma } from './config/prisma.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { apiLimiter, loginLimiter } from './middleware/rateLimit.middleware.js';
import authRoutes from './modules/auth/auth.routes.js';
import categoryRoutes from './modules/categories/category.routes.js';
import brandRoutes from './modules/brands/brand.routes.js';
import productRoutes from './modules/products/product.routes.js';
import customerRoutes from './modules/customers/customer.routes.js';
import supplierRoutes from './modules/suppliers/supplier.routes.js';
import purchaseRoutes from './modules/purchases/purchase.routes.js';
import saleRoutes from './modules/sales/sale.routes.js';
import cashRoutes from './modules/cash/cash.routes.js';
import inventoryRoutes from './modules/inventory/inventory.routes.js';
import reportRoutes from './modules/reports/report.routes.js';
import settingsRoutes from './modules/settings/settings.routes.js';
import userRoutes from './modules/users/user.routes.js';
import branchRoutes from './modules/branches/branch.routes.js';
import fixedExpenseRoutes from './modules/fixed-expenses/fixedExpense.routes.js';
import employeeRoutes from './modules/employees/employee.routes.js';

const app = express();

// Detrás de un reverse proxy (nginx) en producción: necesario para que
// rate-limit y las cookies "secure" vean la IP/protocolo reales.
if (!env.isDev) {
  app.set('trust proxy', 1);
}

app.use(helmet());
app.use(cors({
  origin: env.frontendUrl,
  credentials: true,
}));
app.use(morgan(env.isDev ? 'dev' : 'combined'));
// Límite de tamaño: los avatares viajan como data URL base64 en el body.
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

// Rate limiting general de la API (se desactiva en desarrollo).
app.use('/api', apiLimiter);

// Rutas
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/cash', cashRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/fixed-expenses', fixedExpenseRoutes);
app.use('/api/employees', employeeRoutes);

// Health check: incluye la conectividad con la base de datos.
app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', env: env.nodeEnv, db: 'up' });
  } catch {
    res.status(503).json({ status: 'error', env: env.nodeEnv, db: 'down' });
  }
});

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

app.use(errorMiddleware);

export default app;
