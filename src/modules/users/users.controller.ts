import { ApiPublicEndpoint } from '@modules/auth/decorators/api-public-endpoint.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { DeleteResult } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { EmailUserDto } from './dto/email-user.dto';
import { OutputUserDto } from './dto/output-user.dto';
import { UsersService } from './users.service';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiPublicEndpoint()
  @ApiOperation({
    summary: 'Create a new user',
    description: 'This endpoint creates a new user.',
  })
  @ApiCreatedResponse({
    description: 'User created successfully.',
    type: OutputUserDto,
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // @Get()
  // findAll() {
  //   return this.usersService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.usersService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(+id, updateUserDto);
  // }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a user',
    description: 'This endpoint deletes a user by ID.',
  })
  @ApiOkResponse({
    description: 'User deleted successfully.',
  })
  remove(@Param('id') id: string): Promise<DeleteResult> {
    return this.usersService.remove(+id);
  }

  @Get('e-verification')
  @ApiPublicEndpoint()
  @ApiOperation({
    summary: 'Verify user email',
    description: 'This endpoint verifies a user email using a token.',
  })
  async verifyEmail(
    @Query('email') email: string,
    @Query('token') token: string,
    @Res() res: Response,
  ): Promise<void> {
    const user = await this.usersService.verifyEmail(email, token);
    return res.render('email-verified', {
      userName: `${user.firstName} ${user.lastName}`,
    });
  }

  @Post('e-verification')
  @ApiPublicEndpoint()
  @ApiOperation({
    summary: 'Request a new email verification',
    description:
      'This endpoint sends a new email verification link to the user based on the provided email address.',
  })
  @ApiOkResponse()
  reSendEmailForVerification(
    @Body() emailUserDto: EmailUserDto,
  ): Promise<void> {
    return this.usersService.reSendEmailForVerification(emailUserDto.email);
  }
}
