import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { CreateProfileDto } from './dto/create-profile.dto';
import { ProfileEntity } from './entities/profile.entity';
//import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @Inject('PROFILES_REPOSITORY')
    private readonly profilesRepository: Repository<ProfileEntity>,
  ) {}

  async create(createProfileDto: CreateProfileDto): Promise<ProfileEntity> {
    const profile = this.profilesRepository.create(createProfileDto);
    return await this.profilesRepository.save(profile);
  }

  // findAll() {
  //   return `This action returns all profile`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} profile`;
  // }

  // update(id: number, updateProfileDto: UpdateProfileDto) {
  //   return `This action updates a #${id} profile`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} profile`;
  // }
}
