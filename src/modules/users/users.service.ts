import { appUrlConfig } from '@common/configs';
import { SecurityService } from '@common/modules/security/security.service';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
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
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(UserSecurityTokenEntity)
    private readonly userSecurityTokenRepository: Repository<UserSecurityTokenEntity>,
    //
    @Inject(appUrlConfig.KEY)
    private readonly appUrlConfigKey: ConfigType<typeof appUrlConfig>,
    private readonly securityService: SecurityService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private async createOrUpdateUserSecurityToken(
    user: UserEntity,
    type: EnumSecurityTokenType,
  ): Promise<UserSecurityTokenEntity> {
    const token = this.securityService.generateToken({
      sub: user.id,
      purpose: type,
    });

    let userSecurityToken = await this.userSecurityTokenRepository.findOne({
      where: { user: { id: user.id }, type },
      relations: ['user'],
    });

    if (userSecurityToken) {
      userSecurityToken.token = token;
    } else {
      userSecurityToken = this.userSecurityTokenRepository.create({
        token,
        user,
        type,
      });
    }

    return await this.userSecurityTokenRepository.save(userSecurityToken);
  }

  private async sendEmailForVerification(user: UserEntity): Promise<void> {
    const tokenEntity = await this.createOrUpdateUserSecurityToken(
      user,
      EnumSecurityTokenType.EMAIL_VERIFICATION,
    );
    const userCreatedEvent = new UserCreatedEvent({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      emailVerificationLink: `${this.appUrlConfigKey.url}/users/e-verification?email=${user.email}&token=${tokenEntity.token}`,
    });
    this.eventEmitter.emit('user.created', userCreatedEvent);
  }

  async create(createUserDto: CreateUserDto): Promise<OutputUserDto> {
    const create = this.usersRepository.create(createUserDto);
    const saved = await this.usersRepository.save(create);

    void this.sendEmailForVerification(saved);

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

  private async validateAndCleanUserToken(
    userId: number,
    token: string,
    type: EnumSecurityTokenType,
  ): Promise<void> {
    const userSecurityToken = await this.userSecurityTokenRepository.findOne({
      where: { user: { id: userId }, type },
      relations: ['user'],
    });

    if (!userSecurityToken) {
      throw new BadRequestException('Invalid token');
    }

    try {
      // ✅ Verifica validade do JWT
      this.securityService.verifyToken(token);
    } catch (err) {
      // 🔎 Se expirado → remover
      if (err instanceof TokenExpiredError) {
        await this.userSecurityTokenRepository.remove(userSecurityToken);
        throw new BadRequestException('Expired token');
      }

      // 🔎 Se assinatura inválida → remover
      if (err instanceof JsonWebTokenError) {
        await this.userSecurityTokenRepository.remove(userSecurityToken);
        throw new BadRequestException('Invalid token');
      }

      // Outros erros → apenas falhar
      throw new BadRequestException(`Could not validate token`);
    }

    // 🔎 Se o token é válido mas não corresponde ao salvo → não remover
    if (userSecurityToken.token !== token) {
      throw new BadRequestException('Invalid token');
    }
  }

  async verifyEmail(email: string, token: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user)
      throw new NotFoundException(`User with email address ${email} not found`);

    await this.validateAndCleanUserToken(
      user.id,
      token,
      EnumSecurityTokenType.EMAIL_VERIFICATION,
    );

    user.emailVerified = true;
    await this.usersRepository.save(user);

    await this.userSecurityTokenRepository.delete({
      user: { id: user.id },
      type: EnumSecurityTokenType.EMAIL_VERIFICATION,
    });

    return { message: 'Email verified successfully' };
  }

  async sendNewEmailForVerification(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user)
      throw new NotFoundException(`User with email address ${email} not found`);

    void this.sendEmailForVerification(user);

    return {
      message:
        'New email verification request completed successfully. A verification link will be sent.',
    };
  }

  async resetPassword(userId: number, token: string, newPassword: string) {
    await this.validateAndCleanUserToken(
      userId,
      token,
      EnumSecurityTokenType.PASSWORD_RESET,
    );

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    user.password = await this.securityService.hashPassword(newPassword);
    await this.usersRepository.save(user);

    await this.userSecurityTokenRepository.delete({
      user: { id: userId },
      type: EnumSecurityTokenType.PASSWORD_RESET,
    });

    return { message: 'Password reset successfully' };
  }
}
