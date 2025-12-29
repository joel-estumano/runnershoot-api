import { Roles } from '@modules/auth/decorators/user-roles.decorator';
import { OwnershipGuard } from '@modules/auth/guards/ownership/ownership.guard';
import { RolesGuard } from '@modules/auth/guards/roles/roles.guard';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { EnumUserRole, UserEntity } from '../users/entities/user.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { OutputProfileDto } from './dto/output-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileEntity } from './entities/profile.entity';
import { UserByIdPipe } from './pipes/user-by-id/user-by-id.pipe';
import { ProfilesService } from './profiles.service';

@Controller('profiles')
@ApiTags('Profiles')
@UseGuards(RolesGuard, OwnershipGuard)
@Roles(EnumUserRole.ADMIN, EnumUserRole.USER)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post(':id')
  @ApiOperation({
    summary: 'Create a new user profile by user ID',
    description: 'This endpoint creates a new user profile by user ID.',
  })
  @ApiCreatedResponse({
    description: 'User profile created successfully.',
    type: OutputProfileDto,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User ID',
  })
  create(
    @Param('id', UserByIdPipe) user: UserEntity,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    return this.profilesService.create({ ...createProfileDto, user });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user profile by user ID',
    description: 'This endpoint retrieves a user profile by user ID.',
  })
  @ApiOkResponse({
    description: 'User profile retrieved successfully.',
    type: OutputProfileDto,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User ID',
  })
  findByUserId(
    @Param('id', UserByIdPipe) user: UserEntity,
  ): Promise<ProfileEntity | null> {
    return this.profilesService.findByUserId(user.id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update user profile by User ID',
    description:
      'Updates an existing user profile associated with the given user ID.',
  })
  @ApiOkResponse({
    description: 'User profile updated successfully.',
    type: OutputProfileDto,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User ID',
  })
  async update(
    @Param('id', UserByIdPipe) user: UserEntity,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<ProfileEntity> {
    return this.profilesService.update(user.id, updateProfileDto);
  }

  // @Get()
  // findAll() {
  //   return this.profileService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.profileService.findOne(+id);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.profileService.remove(+id);
  // }
}
