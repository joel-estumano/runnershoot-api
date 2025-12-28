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
import { DeleteResult, Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { OutputUserDto } from './dto/output-user.dto';
import { UserEntity } from './entities/user.entity';
import {
  EnumSecurityTokenType,
  UserSecurityTokenEntity,
} from './entities/user-security-token.entity';
import { UserCreatedEvent } from './events/user.event';

interface SignSecurityToken {
  sub: number;
  type: EnumSecurityTokenType;
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
    expiresIn?: number | StringValue | undefined;
  }): Promise<UserSecurityTokenEntity> {
    const token = this.tokenService.sign<SignSecurityToken>(
      { sub: args.user.id, type: args.type },
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
        user: args.user,
        token,
      });
    }

    return await this.userSecurityTokenRepository.save(userSecurityToken);
  }

  private async verifyUserSecurityToken(
    user: UserEntity,
    token: string,
    type: EnumSecurityTokenType,
  ): Promise<SignSecurityToken> {
    const userSecurityToken = await this.userSecurityTokenRepository.findOne({
      where: { user: { id: user.id }, type: type },
      relations: ['user'],
    });

    if (!userSecurityToken) {
      throw new BadRequestException('Invalid token');
    }

    let signSecurityToken: SignSecurityToken;
    try {
      signSecurityToken =
        this.tokenService.verifyToken<SignSecurityToken>(token);
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

    if (userSecurityToken.token !== token) {
      throw new BadRequestException('Invalid token');
    }

    return signSecurityToken;
  }

  /**
   *
   * @param user
   */
  private async sendEmailForVerification(user: UserEntity): Promise<void> {
    const tokenEntity = await this.createOrUpdateUserSecurityToken({
      user,
      type: EnumSecurityTokenType.EMAIL_VERIFICATION,
      expiresIn: '72h',
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

  async remove(id: number): Promise<DeleteResult> {
    return await this.usersRepository.delete(id);
  }

  async verifyEmail(email: string, token: string): Promise<UserEntity> {
    const user = await this.findOne('email', email);
    if (!user)
      throw new NotFoundException(`User with email address ${email} not found`);

    await this.verifyUserSecurityToken(
      user,
      token,
      EnumSecurityTokenType.EMAIL_VERIFICATION,
    );

    user.emailVerified = true;
    await this.usersRepository.save(user);

    await this.userSecurityTokenRepository.delete({
      user: { id: user.id },
      type: EnumSecurityTokenType.EMAIL_VERIFICATION,
    });

    return user;
  }

  async reSendEmailForVerification(email: string): Promise<void> {
    const user = await this.findOne('email', email);
    if (!user)
      throw new NotFoundException(`User with email address ${email} not found`);
    void this.sendEmailForVerification(user);
  }
}
