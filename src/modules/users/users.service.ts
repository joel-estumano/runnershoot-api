import { appUrlConfig } from '@common/configs';
import appSecretConfig from '@common/configs/app-secret.config';
import { PasswordHelper } from '@common/helpers/password.helper';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { OutputUserDto } from './dto/output-user.dto';
import { UserEntity } from './entities/user.entity';
import { UserSecurityTokenEntity } from './entities/user-security-token.entity';
import { UserCreatedEvent } from './events/user.event';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USERS_REPOSITORY')
    private readonly usersRepository: Repository<UserEntity>,
    @Inject('USERS_SECURITY_TOKEN_REPOSITORY')
    private readonly usersSecurityTokenRepository: Repository<UserSecurityTokenEntity>,
    private readonly eventEmitter: EventEmitter2,
    // inject appSecretConfig
    @Inject(appSecretConfig.KEY)
    private readonly appSecretConfigKey: ConfigType<typeof appSecretConfig>,
    // inject appUrlConfig
    @Inject(appUrlConfig.KEY)
    private readonly appUrlConfigKey: ConfigType<typeof appUrlConfig>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<OutputUserDto> {
    const secretKey = this.appSecretConfigKey.secret;
    const hashedPassword = await PasswordHelper.hashPassword(
      createUserDto.password,
      secretKey,
    );

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const saved = await this.usersRepository.save(user).then((u) => {
      void this.dispatchEvent(u, 'created');
      return u;
    });

    return plainToInstance(OutputUserDto, saved, {
      excludeExtraneousValues: true,
    });
  }

  // findAll() {
  //   return `This action returns all users`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} user`;
  // }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  async remove(id: number) {
    return await this.usersRepository.delete(id);
  }

  async findById(id: number): Promise<UserEntity | null> {
    return await this.usersRepository.findOne({ where: { id } });
  }

  private async dispatchEvent(user: UserEntity, event: 'created') {
    switch (event) {
      case 'created': {
        const securityTokenEntity =
          await this.createOrUpdateUserSecurityToken(user);
        const userCreatedEvent = new UserCreatedEvent({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          emailVerificationLink: `${this.appUrlConfigKey.url}/users/email-verification?email=${user.email}&token=${securityTokenEntity.token}`,
        });
        this.eventEmitter.emit('user.created', userCreatedEvent);
        break;
      }
    }
  }

  private async createOrUpdateUserSecurityToken(
    user: UserEntity,
  ): Promise<UserSecurityTokenEntity> {
    // Gera novo token e validade
    const securityToken = await PasswordHelper.generateSecurityToken(
      this.appSecretConfigKey.secret,
      this.appSecretConfigKey.expiresIn,
    );

    // Verifica se já existe token para o usuário
    let userSecurityToken = await this.usersSecurityTokenRepository.findOne({
      where: { user: { id: user.id } },
      relations: ['user'], // garante que o relacionamento seja carregado
    });

    if (userSecurityToken) {
      // Atualiza token existente
      userSecurityToken.token = securityToken.token;
      userSecurityToken.validUntil = securityToken.validUntil;
    } else {
      // Cria novo token
      userSecurityToken = this.usersSecurityTokenRepository.create({
        ...securityToken,
        user,
      });
    }

    // Salva (cria ou atualiza)
    return await this.usersSecurityTokenRepository.save(userSecurityToken);
  }

  async userEmailVerification(email: string, token: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const userSecurityToken = await this.usersSecurityTokenRepository.findOne({
      where: { user: { id: user.id } },
      relations: ['user'],
    });
    if (!userSecurityToken) {
      throw new BadRequestException('Security token not found');
    }

    const verify = await PasswordHelper.verifySecurityToken(
      this.appSecretConfigKey.secret,
      token,
      userSecurityToken.validUntil,
    );

    if (!verify) {
      throw new BadRequestException('Invalid or expired token');
    }

    // Aqui você pode atualizar o status do usuário para "verificado" se desejar
    user.emailVerified = true;
    await this.usersRepository.save(user);
    await this.usersSecurityTokenRepository.remove(userSecurityToken);

    return { message: 'Email verified successfully' };
  }
}
