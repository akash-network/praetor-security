import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Custom exception class for handling security-related errors.
 * This class extends the standard HttpException from NestJS to provide a consistent error response structure.
 *
 * @extends HttpException
 */
export class PraetorSecurityException extends HttpException {
  /**
   * Creates an instance of PraetorSecurityException.
   * @param {string} code - A unique error code that identifies the type of error.
   * @param {string} message - A clear and concise description of the error.
   */
  constructor(code: string, message: string) {
    super(
      {
        status: 'error',
        error: {
          code: code,
          message: message,
        },
      },
      HttpStatus.OK, // HttpStatus.OK is used here to send a 200 HTTP status code, which might need to be revised based on your error handling strategy.
    );
  }
}
