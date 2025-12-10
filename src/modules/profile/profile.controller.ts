import { Body, Controller, Param, Post } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { UserEntity } from '../users/entities/user.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { OutputProfileDto } from './dto/output-profile.dto';
import { UserByIdPipe } from './pipes/user-by-id/user-by-id.pipe';
import { ProfileService } from './profile.service';

@Controller('profile')
@ApiTags('Profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post(':userId')
  @ApiOperation({
    summary: 'Create a new user profile by user ID',
    description: 'This endpoint creates a new user profile by user ID.',
  })
  @ApiCreatedResponse({
    description: 'User profile created successfully.',
    type: OutputProfileDto,
  })
  @ApiParam({ name: 'userId', type: Number, description: 'User ID' })
  create(
    @Param('userId', UserByIdPipe) user: UserEntity,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    return this.profileService.create({ ...createProfileDto, user });
  }

  // @Get()
  // findAll() {
  //   return this.profileService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.profileService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateProfileDto: UpdateProfileDto) {
  //   return this.profileService.update(+id, updateProfileDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.profileService.remove(+id);
  // }
}
