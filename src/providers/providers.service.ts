import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';
import * as https from 'node:https';
import { FetchError } from 'node-fetch';

@Injectable()
export class ProvidersService {
  constructor() {}

  /**
   * Fetches the status of multiple providers concurrently.
   * @param providers - An array of provider objects containing host_uri, owner, and duplicate_uri.
   * @returns {Promise<Array>} - A promise that resolves to an array of provider statuses.
   */
  async providerStatus(providers: any): Promise<any[]> {
    let asyncFunction = [];
    providers.forEach((provider) => {
      let response = this.getProviderStatus(
        provider['host_uri'],
        provider['owner'],
        provider['duplicate_uri'],
      );
      asyncFunction.push(response);
    });
    const providersList = await Promise.all(asyncFunction);
    return providersList;
  }

  /**
   * Fetches the status of a single provider.
   * @param hostUri - URI of the provider.
   * @param address - The address identifier of the provider.
   * @param duplicateUri - Indicates if the URI is duplicated.
   * @returns {Promise<object>} - A promise that resolves to an object containing details about the provider's status.
   */
  async getProviderStatus(
    hostUri: string,
    address: string,
    duplicateUri: boolean,
  ): Promise<object> {
    const options = { timeout: 50000 };
    const controller = new AbortController();
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false, // This can pose a security risk in production
    });

    let providerStatusDetail = null;
    try {
      const response = await fetch(`${hostUri}/status`, {
        ...options,
        signal: controller.signal,
        agent: httpsAgent,
      });
      const data = await response.json();
      providerStatusDetail = {
        owner: address,
        connected: true,
        duplicate_uri: duplicateUri,
        cluster: data.cluster || null,
        bidengine: data.bidengine || null,
        manifest: data.manifest || null,
        cluster_public_hostname: data.cluster_public_hostname || null,
        provider_url: hostUri.split('://')[1].split(':')[0],
      };
    } catch (error) {
      providerStatusDetail = {
        owner: address,
        connected: false,
        duplicate_uri: duplicateUri,
      };
    }
    return providerStatusDetail;
  }

  /**
   * Fetches the version information of a provider.
   * @param hostUri - URI of the provider.
   * @returns {Promise<object>} - A promise that resolves to an object containing the provider's version details.
   */
  async getProviderVersion(hostUri: string): Promise<object> {
    const options = { timeout: 50000 };
    const controller = new AbortController();
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false, // This can pose a security risk in production
    });

    let providerVersionDetail = null;
    try {
      const response = await fetch(`${hostUri}/version`, {
        ...options,
        signal: controller.signal,
        agent: httpsAgent,
      });
      const data = await response.json();
      providerVersionDetail = {
        akash_version: data.akash ? data.akash.version : null,
      };
    } catch (error) {
      providerVersionDetail = { akash_version: null };
    }
    return providerVersionDetail;
  }
}
