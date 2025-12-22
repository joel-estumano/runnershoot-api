import { appUrlConfig } from '@common/configs';
import { SecurityService } from '@common/modules/security/security.service';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { OutputUserDto } from './dto/output-user.dto';
import { UserEntity } from './entities/user.entity';
import {
  EnumSecurityTokenType,
  UserSecurityTokenEntity,
} from './entities/user-security-token.entity';
import { UserCreatedEvent } from './events/user.event';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USERS_REPOSITORY')
    private readonly usersRepository: Repository<UserEntity>,
    @Inject('USERS_SECURITY_TOKEN_REPOSITORY')
    private readonly usersSecurityTokenRepository: Repository<UserSecurityTokenEntity>,
    private readonly eventEmitter: EventEmitter2,
    @Inject(appUrlConfig.KEY)
    private readonly appUrlConfigKey: ConfigType<typeof appUrlConfig>,

    private readonly securityService: SecurityService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<OutputUserDto> {
    const hashedPassword = await this.securityService.hashPassword(
      createUserDto.password,
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
        const securityTokenEntity = await this.createOrUpdateUserSecurityToken(
          user,
          EnumSecurityTokenType.EMAIL_VERIFICATION,
        );
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
    type: EnumSecurityTokenType,
  ): Promise<UserSecurityTokenEntity> {
    const token = this.securityService.generateToken({
      sub: user.id,
      purpose: type,
    });

    // 🔍 Verifica se já existe token do mesmo tipo para o usuário
    let userSecurityToken = await this.usersSecurityTokenRepository.findOne({
      where: { user: { id: user.id }, type },
      relations: ['user'],
    });

    if (userSecurityToken) {
      userSecurityToken.token = token;
    } else {
      userSecurityToken = this.usersSecurityTokenRepository.create({
        token,
        user,
        type,
      });
    }

    // 💾 Salva (cria ou atualiza)
    return await this.usersSecurityTokenRepository.save(userSecurityToken);
  }

  private async validateAndCleanUserToken(
    userId: number,
    token: string,
    type: EnumSecurityTokenType,
  ): Promise<void> {
    const userSecurityToken = await this.usersSecurityTokenRepository.findOne({
      where: { user: { id: userId }, type },
      relations: ['user'],
    });

    if (!userSecurityToken) {
      throw new BadRequestException(`Security token of type ${type} not found`);
    }

    const decoded = this.securityService.verifyToken(token);

    // Se inválido/expirado OU não corresponde ao que está no banco
    if (!decoded || userSecurityToken.token !== token) {
      await this.usersSecurityTokenRepository.remove(userSecurityToken);
      throw new BadRequestException(`Invalid or expired ${type} token`);
    }
  }

  async userEmailVerification(email: string, token: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) throw new BadRequestException('User not found');

    await this.validateAndCleanUserToken(
      user.id,
      token,
      EnumSecurityTokenType.EMAIL_VERIFICATION,
    );

    user.emailVerified = true;
    await this.usersRepository.save(user);

    await this.usersSecurityTokenRepository.delete({
      user: { id: user.id },
      type: EnumSecurityTokenType.EMAIL_VERIFICATION,
    });

    return { message: 'Email verified successfully' };
  }

  async resetPassword(userId: number, token: string, newPassword: string) {
    await this.validateAndCleanUserToken(
      userId,
      token,
      EnumSecurityTokenType.PASSWORD_RESET,
    );

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    user.password = await this.securityService.hashPassword(newPassword);
    await this.usersRepository.save(user);

    await this.usersSecurityTokenRepository.delete({
      user: { id: userId },
      type: EnumSecurityTokenType.PASSWORD_RESET,
    });

    return { message: 'Password reset successfully' };
  }
}
