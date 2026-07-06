import { authService } from './auth.service.js';
import { AppError } from '../../middleware/error.middleware.js';

const REFRESH_COOKIE = 'refresh_token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en ms
};

export const authController = {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) throw new AppError('Email y contraseña son requeridos');

      const { accessToken, refreshToken, user } = await authService.login(email, password);

      res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS);
      res.json({ success: true, data: { accessToken, user } });
    } catch (err) {
      next(err);
    }
  },

  async refresh(req, res, next) {
    try {
      const refreshToken = req.cookies?.[REFRESH_COOKIE];
      if (!refreshToken) throw new AppError('Refresh token requerido', 401);

      const { accessToken, refreshToken: newRefreshToken } = await authService.refresh(refreshToken);

      res.cookie(REFRESH_COOKIE, newRefreshToken, COOKIE_OPTIONS);
      res.json({ success: true, data: { accessToken } });
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res, next) {
    try {
      const refreshToken = req.cookies?.[REFRESH_COOKIE];
      await authService.logout(refreshToken);

      res.clearCookie(REFRESH_COOKIE);
      res.json({ success: true, message: 'Sesión cerrada' });
    } catch (err) {
      next(err);
    }
  },

  async me(req, res, next) {
    try {
      const user = await authService.getMe(req.user.sub);
      res.json({ success: true, data: { user } });
    } catch (err) {
      next(err);
    }
  },
};
