import { appUrlConfig } from '@common/configs';
import { TokenService } from '@common/modules/token/token.service';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { StringValue } from 'ms';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { OutputUserDto } from './dto/output-user.dto';
import { ResetPasswordDto } from './dto/reset.password.dto';
import { UserEntity } from './entities/user.entity';
import {
  EnumSecurityTokenType,
  UserSecurityTokenEntity,
} from './entities/user-security-token.entity';
import { UserCreatedEvent } from './events/user.event';

interface SignSecurityToken {
  sub: number;
  purpose: EnumSecurityTokenType;
  otp?: string;
}

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
    private readonly tokenService: TokenService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private async createOrUpdateUserSecurityToken(args: {
    user: UserEntity;
    type: EnumSecurityTokenType;
    otp?: string;
    expiresIn?: number | StringValue | undefined;
  }): Promise<UserSecurityTokenEntity> {
    const token = this.tokenService.sign<SignSecurityToken>(
      {
        sub: args.user.id,
        purpose: args.type,
        otp: args.otp,
      },
      args.expiresIn,
    );

    let userSecurityToken = await this.userSecurityTokenRepository.findOne({
      where: { user: { id: args.user.id }, type: args.type },
      relations: ['user'],
    });

    if (userSecurityToken) {
      userSecurityToken.token = token;
    } else {
      userSecurityToken = this.userSecurityTokenRepository.create({
        token,
        user: args.user,
        type: args.type,
      });
    }

    return await this.userSecurityTokenRepository.save(userSecurityToken);
  }

  private async sendEmailForVerification(user: UserEntity): Promise<void> {
    const tokenEntity = await this.createOrUpdateUserSecurityToken({
      user: user,
      type: EnumSecurityTokenType.EMAIL_VERIFICATION,
    });
    const userCreatedEvent = new UserCreatedEvent({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      emailVerificationLink: `${this.appUrlConfigKey.url}/users/e-verification?email=${user.email}&token=${tokenEntity.token}`,
    });
    this.eventEmitter.emit('user.created', userCreatedEvent);
  }

  async create(createUserDto: CreateUserDto): Promise<OutputUserDto> {
    const user = this.usersRepository.create(createUserDto);
    const saved = await this.usersRepository.save(user); // O subscriber (beforeInsert) vai aplicar o hash automaticamente

    void this.sendEmailForVerification(saved);

    return plainToInstance(OutputUserDto, saved, {
      excludeExtraneousValues: true,
    });
  }

  // findAll() {
  //   return `This action returns all users`;
  // }

  async findOne<K extends keyof UserEntity>(
    field: K,
    value: UserEntity[K],
    selects?: (keyof UserEntity)[],
  ): Promise<UserEntity | null> {
    return await this.usersRepository.findOne({
      where: { [field]: value },
      select: selects,
    });
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  async remove(id: number) {
    return await this.usersRepository.delete(id);
  }

  async findById(id: number): Promise<UserEntity | null> {
    return await this.usersRepository.findOne({ where: { id } });
  }

  private async verifyTokenByUserId(
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
      this.tokenService.verifyToken(token);
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        await this.userSecurityTokenRepository.remove(userSecurityToken);
        throw new BadRequestException('Expired token');
      }

      if (err instanceof JsonWebTokenError) {
        await this.userSecurityTokenRepository.remove(userSecurityToken);
        throw new BadRequestException('Invalid token');
      }

      throw new InternalServerErrorException(
        'Unexpected error validating token',
      );
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

    await this.verifyTokenByUserId(
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

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.usersRepository.findOne({
      where: { email: resetPasswordDto.email },
    });
    if (!user)
      throw new NotFoundException(
        `User with email address ${resetPasswordDto.email} not found`,
      );

    await this.verifyTokenByUserId(
      user.id,
      resetPasswordDto.token,
      EnumSecurityTokenType.PASSWORD_RESET,
    );

    user.password = resetPasswordDto.password;
    await this.usersRepository.save(user); // O subscriber (beforeUpdate) vai aplicar o hash automaticamente

    await this.userSecurityTokenRepository.delete({
      user: { id: user.id },
      type: EnumSecurityTokenType.PASSWORD_RESET,
    });

    return { message: 'Password reset successfully' };
  }
}
