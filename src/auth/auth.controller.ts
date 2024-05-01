import { Controller, HttpCode, Post } from '@nestjs/common';
import { UtilsService } from 'src/utils/utils.service';
import { AuthService } from './auth.service';
import { Body } from '@nestjs/common';
import { VerifySignatureDto } from './dto/verify-signature.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth') // Controller to manage authentication-related routes
export class AuthController {
  constructor(
    private readonly authService: AuthService, // Injects the AuthService to handle core authentication logic
    private readonly utilsService: UtilsService, // Injects the UtilsService to handle responses and errors
  ) {}

  /**
   * POST endpoint to verify digital signatures and issue authentication tokens.
   * Validates necessary parameters and uses AuthService to verify the signatures.
   * @param {VerifySignatureDto} verifySignatureDto - DTO containing signer, public key, and signature data.
   * @returns {Promise<object>} - A response with authentication tokens or an error message.
   */
  @Post('/verify')
  @HttpCode(200) // Specifies that HTTP 200 OK should be returned on both success and error responses
  async verify(@Body() verifySignatureDto: VerifySignatureDto) {
    const signer = verifySignatureDto.signer;
    const publicKeyType = verifySignatureDto.pub_key['type'];
    const publicKey = verifySignatureDto.pub_key['value'];
    const signature = verifySignatureDto.signature;

    // Validates the request data for completeness and correctness
    if (!signer || !publicKey || !signature || !publicKeyType) {
      return this.utilsService.errorResponse(
        'N5001',
        'Request parameters are missing, possible values are signer, pub_key, signature',
      );
    }

    // Validates the type of public key to ensure it's supported
    if (publicKeyType !== 'tendermint/PubKeySecp256k1') {
      return this.utilsService.errorResponse(
        'N5002',
        'Wrong public key type provided',
      );
    }

    try {
      const tokens = await this.authService.verifySignature(
        signer,
        Buffer.from(publicKey, 'base64'),
        Buffer.from(signature, 'base64'),
      );

      return this.utilsService.successResponse(tokens);
    } catch (error) {
      return this.utilsService.errorResponse(
        error.response.error.code,
        error.response.error.message,
      );
    }
  }

  /**
   * POST endpoint to refresh authentication tokens using a refresh token.
   * Checks for validity of the refresh token and issues new tokens.
   * @param {RefreshTokenDto} refreshTokenDto - DTO containing refresh token and user address.
   * @returns {Promise<object>} - A response with new authentication tokens or an error message.
   */
  @Post('/refresh')
  @HttpCode(200) // Specifies that HTTP 200 OK should be returned on both success and error responses
  async generateRefreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const refreshToken = refreshTokenDto.refresh_token;
    const address = refreshTokenDto.address;

    // Validates the request data for completeness
    if (!refreshToken || !address) {
      return this.utilsService.errorResponse(
        'N5006',
        'Request parameters are missing, possible values are refreshToken, address',
      );
    }

    try {
      const tokens = await this.authService.verifyRefreshToken(
        address,
        refreshToken,
      );
      return this.utilsService.successResponse(tokens);
    } catch (error) {
      return this.utilsService.errorResponse(
        error.response.error.code,
        error.response.error.message,
      );
    }
  }
}
