import { UserEntity } from '@modules/users/entities/user.entity';
import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { AuthService } from './auth.service';
import { ApiPublicEndpoint } from './decorators/api-public-endpoint.decorator';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local/local-auth.guard';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiPublicEndpoint()
  @UseGuards(LocalAuthGuard)
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticates the user with email and password.',
  })
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: LoginDto })
  login(
    @Request() req: { user: UserEntity },
    @Res({ passthrough: true }) res: Response,
  ) {
    const auth = this.authService.login(req.user);

    res.cookie('access_token', auth.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: auth.maxAge,
    });

    return auth.user;
  }

  @Post('logout')
  @ApiPublicEndpoint()
  @ApiOperation({
    summary: 'User logout',
    description:
      'Endpoint to remove the authentication cookie (access_token) and invalidate access on the client..',
  })
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    return { message: 'Logout completed successfully!' };
  }
}
