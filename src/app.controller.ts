import { ApiPublicEndpoint } from '@modules/auth/decorators/api-public-endpoint.decorator';
import { Controller, Get, Redirect } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiPublicEndpoint()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('docs')
  @ApiExcludeEndpoint()
  @Redirect('/swagger', 302)
  redirectToSwagger() {
    return;
  }
}
