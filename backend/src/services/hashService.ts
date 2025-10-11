import * as crypto from 'crypto';

/**
 * Genera un código hash único para una película
 * Formato: hash(nombre_en_minuscula_sin_espacios + año)
 */
export class HashService {
  static generateMovieHash(title: string, year: number): string {
    const normalized = title.toLowerCase().replace(/\s+/g, '') + year.toString();
    return crypto.createHash('sha256').update(normalized).digest('hex').substring(0, 16);
  }

  /**
   * Verifica si un hash corresponde a un título y año dados
   */
  static verifyMovieHash(title: string, year: number, hash: string): boolean {
    const expectedHash = this.generateMovieHash(title, year);
    return expectedHash === hash;
  }
}
