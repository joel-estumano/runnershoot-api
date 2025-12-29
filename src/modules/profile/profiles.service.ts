import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileEntity } from './entities/profile.entity';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(ProfileEntity)
    private readonly profilesRepository: Repository<ProfileEntity>,
  ) {}

  async create(createProfileDto: CreateProfileDto): Promise<ProfileEntity> {
    const profile = this.profilesRepository.create(createProfileDto);
    return await this.profilesRepository.save(profile);
  }

  async findByUserId(userId: number): Promise<ProfileEntity | null> {
    return await this.profilesRepository.findOne({
      where: { user: { id: userId } },
    });
  }

  /**
   * Atualização de perfil usando recursos do TypeORM.
   *
   * O TypeORM já oferece métodos próprios para atualizar entidades:
   *
   * 🔑 Alternativas:
   * - repository.merge() + repository.save()
   * - repository.update()
   *
   * 🚀 Diferenças de retorno:
   * - merge + save → retorna a entidade completa atualizada (incluindo todos os campos e relações).
   *   Exemplo:
   *   {
   *     "id": 1,
   *     "name": "Novo Nome",
   *     "email": "teste@exemplo.com",
   *     "user": { "id": 10, "username": "joel" }
   *   }
   *
   * - update → retorna apenas metadados da operação (UpdateResult), sem a entidade atualizada.
   *   Exemplo:
   *   {
   *     "generatedMaps": [],
   *     "raw": [],
   *     "affected": 1
   *   }
   *
   * 👉 Use merge + save quando precisar devolver o objeto atualizado ao cliente.
   * 👉 Use update quando só precisar confirmar a operação, sem retornar a entidade.
   */
  async update(
    userId: number,
    updateProfileDto: UpdateProfileDto,
  ): Promise<ProfileEntity> {
    const profile = await this.profilesRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException(`Profile for user ID ${userId} not found`);
    }

    // Atualiza os campos usando merge
    this.profilesRepository.merge(profile, updateProfileDto);

    return await this.profilesRepository.save(profile);
  }

  // findAll() {
  //   return `This action returns all profile`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} profile`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} profile`;
  // }
}
