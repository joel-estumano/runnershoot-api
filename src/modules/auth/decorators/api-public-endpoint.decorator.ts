import { SetMetadata } from '@nestjs/common';

export const API_PUBLIC_ENDPOINT_KEY = 'apiPublicEndpoint';
export const ApiPublicEndpoint = () =>
  SetMetadata(API_PUBLIC_ENDPOINT_KEY, true);
