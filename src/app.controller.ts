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
  @ApiPublicEndpoint()
  @ApiExcludeEndpoint()
  @Redirect('/swagger', 302)
  redirectToSwagger() {
    return;
  }

  // @Get('roles')
  // @UseGuards(RolesGuard)
  // @Roles(EnumUserRole.ADMIN, EnumUserRole.USER)
  // findAll() {
  //   return 'Admins e usuários podem acessar!';
  // }
}
