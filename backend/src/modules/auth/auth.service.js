import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { env } from '../../config/env.js';
import { AppError } from '../../middleware/error.middleware.js';

const prisma = new PrismaClient();

function signAccessToken(payload) {
  return jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpiresIn });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiresIn });
}

function refreshTokenExpiresAt() {
  const ms = 7 * 24 * 60 * 60 * 1000; // 7 días
  return new Date(Date.now() + ms);
}

export const authService = {
  async login(email, password) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user || !user.active) {
      throw new AppError('Credenciales incorrectas', 401);
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new AppError('Credenciales incorrectas', 401);
    }

    const tokenPayload = { sub: user.id, email: user.email, role: user.role.name };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken({ sub: user.id });

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: refreshTokenExpiresAt(),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role.name },
    };
  },

  async refresh(refreshToken) {
    let payload;
    try {
      payload = jwt.verify(refreshToken, env.jwt.refreshSecret);
    } catch {
      throw new AppError('Refresh token inválido', 401);
    }

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.expiresAt < new Date()) {
      throw new AppError('Refresh token expirado', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });
    if (!user || !user.active) {
      throw new AppError('Usuario no disponible', 401);
    }

    // Rotación: eliminar el anterior y crear uno nuevo
    await prisma.refreshToken.delete({ where: { token: refreshToken } });

    const newAccessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role.name });
    const newRefreshToken = signRefreshToken({ sub: user.id });

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        expiresAt: refreshTokenExpiresAt(),
      },
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

  async logout(refreshToken) {
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
  },

  async getMe(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });
    if (!user || !user.active) {
      throw new AppError('Usuario no encontrado', 404);
    }
    return { id: user.id, name: user.name, email: user.email, role: user.role.name };
  },
};
