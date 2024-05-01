import { Controller, HttpCode, Post } from '@nestjs/common';
import { UtilsService } from 'src/utils/utils.service';
import { ProvidersService } from './providers.service';
import { Body } from '@nestjs/common';
import { ProviderStatusDto } from './dto/provider-status.dto';
import { ProviderVersionDto } from './dto/provider-version.dto';

@Controller('providers') // Defines the route prefix for all methods within this controller.
export class ProvidersController {
  constructor(
    private readonly providerService: ProvidersService,
    private readonly utilsService: UtilsService,
  ) {}

  /**
   * POST method to check the status of multiple providers.
   * Validates input and returns either a success response with provider statuses or an error response.
   * @param {ProviderStatusDto} providerStatusDto - Data transfer object for provider status request.
   * @returns {Promise<object>} A promise that resolves to a success or error response.
   */
  @Post('/status')
  @HttpCode(200) // Sets the HTTP status code for the response to 200 OK.
  async status(@Body() providerStatusDto: ProviderStatusDto) {
    // Checks if the provider details are provided in the request body.
    if (!providerStatusDto.providers) {
      return this.utilsService.errorResponse(
        'N5001',
        'Request parameters are missing, possible values are providers.',
      );
    }

    try {
      const providerStatuses = await this.providerService.providerStatus(
        providerStatusDto.providers,
      );
      return this.utilsService.successResponse(providerStatuses);
    } catch (error) {
      return this.utilsService.errorResponse(
        error.response.error.code,
        error.response.error.message,
      );
    }
  }

  /**
   * POST method to get the software version of a specified provider.
   * Returns a success response with version information or an error response.
   * @param {ProviderVersionDto} providerVersionDto - Data transfer object for provider version request.
   * @returns {Promise<object>} A promise that resolves to a success or error response.
   */
  @Post('/version')
  @HttpCode(200) // Sets the HTTP status code for the response to 200 OK.
  async version(@Body() providerVersionDto: ProviderVersionDto) {
    try {
      const providerVersion = await this.providerService.getProviderVersion(
        providerVersionDto.provider_uri,
      );
      return this.utilsService.successResponse(providerVersion);
    } catch (error) {
      return this.utilsService.errorResponse(
        error.response.error.code,
        error.response.error.message,
      );
    }
  }
}
