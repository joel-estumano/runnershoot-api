import { ApiPublicEndpoint } from '@modules/auth/decorators/api-public-endpoint.decorator';
import { Controller, Get, Redirect, Res } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import type { Response } from 'express';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiPublicEndpoint()
  root(@Res() res: Response) {
    return res.render('index', {
      message: this.appService.getHello(),
    });
  }

  @Get('docs')
  @ApiPublicEndpoint()
  @ApiExcludeEndpoint()
  @Redirect('/swagger', 302)
  redirectToSwagger() {
    return;
  }
}
