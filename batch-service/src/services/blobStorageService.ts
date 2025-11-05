import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { logger } from '../utils/logger';

/**
 * Servicio para interactuar con Azure Blob Storage
 */
class BlobStorageService {
  private containerClient: ContainerClient | null = null;
  private readonly connectionString: string;
  private readonly containerName: string;

  constructor() {
    this.connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || '';
    this.containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'reviews-files';

    if (!this.connectionString) {
      logger.warn('⚠️ Azure Storage connection string no configurado. Blob Storage deshabilitado.');
    }
  }

  /**
   * Inicializa la conexión con Azure Blob Storage
   */
  async initialize(): Promise<void> {
    if (!this.connectionString) {
      logger.warn('⚠️ Blob Storage no inicializado: falta connection string');
      return;
    }

    try {
      const blobServiceClient = BlobServiceClient.fromConnectionString(this.connectionString);
      this.containerClient = blobServiceClient.getContainerClient(this.containerName);

      // Verificar si el container existe, si no, crearlo
      const exists = await this.containerClient.exists();
      if (!exists) {
        await this.containerClient.create();
        logger.info(`✅ Container '${this.containerName}' creado en Azure Blob Storage`);
      } else {
        logger.info(`✅ Conectado a container '${this.containerName}' en Azure Blob Storage`);
      }
    } catch (error) {
      logger.error(`❌ Error al inicializar Blob Storage: ${error}`);
      throw error;
    }
  }

  /**
   * Sube un archivo de texto a Azure Blob Storage
   * @param fileName Nombre del archivo
   * @param content Contenido del archivo
   * @returns URL del blob subido
   */
  async uploadTextFile(fileName: string, content: string): Promise<string> {
    if (!this.containerClient) {
      throw new Error('Blob Storage no inicializado');
    }

    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(fileName);
      
      // Subir el contenido como texto
      await blockBlobClient.upload(content, Buffer.byteLength(content), {
        blobHTTPHeaders: {
          blobContentType: 'text/plain; charset=utf-8'
        }
      });

      const blobUrl = blockBlobClient.url;
      logger.debug(`✓ Archivo '${fileName}' subido a Blob Storage`);
      
      return blobUrl;
    } catch (error) {
      logger.error(`❌ Error al subir archivo '${fileName}': ${error}`);
      throw error;
    }
  }

  /**
   * Genera un nombre de archivo único para una reseña
   * @param reviewId ID de la reseña
   * @returns Nombre del archivo
   */
  generateFileName(reviewId: number): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `review-${reviewId}-${timestamp}.txt`;
  }

  /**
   * Crea el contenido del archivo de reseña
   * @param review Datos de la reseña
   * @returns Contenido formateado
   */
  createReviewFileContent(review: {
    id: number;
    rating: number;
    comment: string;
    userId: number;
    movieId: number;
    createdAt: Date;
  }): string {
    return `===========================================
RESEÑA DE PELÍCULA - ID: ${review.id}
===========================================

Usuario ID: ${review.userId}
Película ID: ${review.movieId}
Calificación: ${review.rating}/5 ⭐
Fecha: ${review.createdAt.toISOString()}

-------------------------------------------
COMENTARIO:
-------------------------------------------

${review.comment}

===========================================
Archivo generado por JovaFilms Batch Service
Fecha de procesamiento: ${new Date().toISOString()}
===========================================
`;
  }

  /**
   * Verifica si Blob Storage está habilitado
   */
  isEnabled(): boolean {
    return !!this.connectionString && !!this.containerClient;
  }
}

export const blobStorageService = new BlobStorageService();
