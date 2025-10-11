import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { config } from '../config/env';
import { RegisterDTO, LoginDTO, AuthResponse, UserPayload } from '../types';
import { AppError } from '../middlewares/errorHandler';
import { logger } from '../utils/logger';

const SALT_ROUNDS = 10;

export class AuthService {
  /**
   * Registra un nuevo usuario
   */
  static async register(data: RegisterDTO): Promise<AuthResponse> {
    try {
      // Verificar si el email ya existe
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (existingUser) {
        throw new AppError(409, 'El email ya está registrado');
      }

      // Hashear contraseña
      const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

      // Crear usuario
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name
        }
      });

      // Generar token
      const token = this.generateToken({
        id: user.id,
        email: user.email,
        name: user.name
      });

      logger.info(`Usuario registrado: ${user.email}`);

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error en registro: ${error}`);
      throw new AppError(500, 'Error al registrar usuario');
    }
  }

  /**
   * Inicia sesión de un usuario
   */
  static async login(data: LoginDTO): Promise<AuthResponse> {
    try {
      // Buscar usuario
      const user = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (!user) {
        throw new AppError(401, 'Credenciales inválidas');
      }

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(data.password, user.password);

      if (!isPasswordValid) {
        throw new AppError(401, 'Credenciales inválidas');
      }

      // Generar token
      const token = this.generateToken({
        id: user.id,
        email: user.email,
        name: user.name
      });

      logger.info(`Usuario autenticado: ${user.email}`);

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error en login: ${error}`);
      throw new AppError(500, 'Error al iniciar sesión');
    }
  }

  /**
   * Genera un token JWT
   */
  private static generateToken(payload: UserPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as string
    } as jwt.SignOptions);
  }

  /**
   * Verifica un token JWT
   */
  static verifyToken(token: string): UserPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as UserPayload;
    } catch (error) {
      throw new AppError(401, 'Token inválido o expirado');
    }
  }
}
