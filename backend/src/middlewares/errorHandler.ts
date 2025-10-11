import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';
import { ErrorResponse } from '../types';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error(`Error: ${err.message}`, { error: err });

  // Error de validación Zod
  if (err instanceof ZodError) {
    const response: ErrorResponse = {
      error: 'Validation Error',
      message: 'Datos de entrada inválidos',
      statusCode: 400,
      details: err.errors
    };
    res.status(400).json(response);
    return;
  }

  // Error personalizado de la aplicación
  if (err instanceof AppError) {
    const response: ErrorResponse = {
      error: err.name,
      message: err.message,
      statusCode: err.statusCode,
      details: err.details
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // Error de Prisma
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    
    if (prismaError.code === 'P2002') {
      const response: ErrorResponse = {
        error: 'Conflict',
        message: 'El recurso ya existe',
        statusCode: 409,
        details: prismaError.meta
      };
      res.status(409).json(response);
      return;
    }

    if (prismaError.code === 'P2025') {
      const response: ErrorResponse = {
        error: 'Not Found',
        message: 'Recurso no encontrado',
        statusCode: 404
      };
      res.status(404).json(response);
      return;
    }
  }

  // Error genérico
  const response: ErrorResponse = {
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Ha ocurrido un error interno' 
      : err.message,
    statusCode: 500
  };
  
  res.status(500).json(response);
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const response: ErrorResponse = {
    error: 'Not Found',
    message: `Ruta ${req.originalUrl} no encontrada`,
    statusCode: 404
  };
  res.status(404).json(response);
};
