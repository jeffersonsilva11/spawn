/**
 * Storage Service Interface - Domain Layer
 *
 * Defines the contract for file storage (S3).
 * Infrastructure layer implements this interface.
 */

export interface IStorageService {
  /**
   * Upload a file to storage
   */
  uploadFile(key: string, buffer: Buffer, contentType: string): Promise<string>;

  /**
   * Get a pre-signed URL for upload
   */
  getPresignedUploadUrl(key: string, contentType: string, expiresIn: number): Promise<string>;

  /**
   * Get a pre-signed URL for download
   */
  getPresignedDownloadUrl(key: string, expiresIn: number): Promise<string>;

  /**
   * Delete a file from storage
   */
  deleteFile(key: string): Promise<void>;

  /**
   * Check if file exists
   */
  fileExists(key: string): Promise<boolean>;

  /**
   * Get file size
   */
  getFileSize(key: string): Promise<number>;
}
