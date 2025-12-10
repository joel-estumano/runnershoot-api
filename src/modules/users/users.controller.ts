import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CreateUserDto } from './dto/create-user.dto';
import { OutputUserDto } from './dto/output-user.dto';
import { UsersService } from './users.service';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
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
    //type: OutputUserDto,
  })
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Get('email-verification')
  @ApiOperation({
    summary: 'Verify user email',
    description: 'This endpoint verifies a user email using a token.',
  })
  userEmailVerification(
    @Query('email') email: string,
    @Query('token') token: string,
  ) {
    return this.usersService.userEmailVerification(email, token);
  }
}
