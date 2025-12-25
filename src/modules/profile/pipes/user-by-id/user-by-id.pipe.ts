import { UserEntity } from '@modules/users/entities/user.entity';
import { UsersService } from '@modules/users/users.service';
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class UserByIdPipe implements PipeTransform {
  constructor(private readonly usersService: UsersService) {}

  async transform(value: any, metadata: ArgumentMetadata): Promise<UserEntity> {
    if (value === undefined || value === null || value === '') {
      throw new BadRequestException(
        `The ${metadata.data} parameter must be provided.`,
      );
    }

    const parsedValue = Number(value);

    if (isNaN(parsedValue) || !Number.isInteger(parsedValue)) {
      throw new BadRequestException(
        `The ${metadata.data} parameter must be a valid integer.`,
      );
    }

    const user = await this.usersService.findById(parsedValue);
    if (!user) {
      throw new NotFoundException(`User with ID ${parsedValue} was not found.`);
    }

    return user;
  }
}
