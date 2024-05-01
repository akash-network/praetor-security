import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilsService {
  /**
   * Generates a random string (nonce) of a specified length using alphanumeric characters.
   * @param {number} length - The length of the nonce to be generated.
   * @returns {Promise<string>} A promise that resolves with the generated nonce.
   */
  async generateNonce(length: number): Promise<string> {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  /**
   * Creates a standardized success response object for API outputs.
   * @param {any} data - The data to be included in the success response.
   * @returns {Promise<object>} A promise that resolves with the success response object.
   */
  async successResponse(data: any): Promise<object> {
    return {
      status: 'success',
      data: data,
    };
  }

  /**
   * Creates a standardized error response object for API errors.
   * @param {string} code - The error code representing the type of error.
   * @param {any} message - The error message explaining what went wrong.
   * @returns {Promise<object>} A promise that resolves with the error response object.
   */
  async errorResponse(code: string, message: any): Promise<object> {
    return {
      status: 'error',
      error: {
        code: code,
        message: message,
      },
    };
  }

  /**
   * Decodes the header part of a JWT token without verifying its signature.
   * @param {string} token - The JWT token from which the header will be extracted.
   * @returns {Promise<object>} A promise that resolves with the decoded header as a JSON object.
   */
  async getUnverifiedHeader(token: string): Promise<object> {
    const base64Header = token.split('.')[0];
    const header = Buffer.from(base64Header, 'base64');
    return JSON.parse(header.toString());
  }

  /**
   * Decodes the payload part of a JWT token without verifying its signature.
   * @param {string} token - The JWT token from which the payload will be extracted.
   * @returns {Promise<object>} A promise that resolves with the decoded payload as a JSON object.
   */
  async getUnverifiedPayload(token: string): Promise<object> {
    const base64Payload = token.split('.')[1];
    const payload = Buffer.from(base64Payload, 'base64');
    return JSON.parse(payload.toString());
  }
}
