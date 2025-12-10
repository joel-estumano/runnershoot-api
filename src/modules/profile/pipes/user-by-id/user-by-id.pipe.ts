import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { UsersService } from 'src/modules/users/users.service';

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
