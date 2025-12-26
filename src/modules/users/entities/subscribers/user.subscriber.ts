import { TokenService } from '@common/modules/token/token.service';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';

import { UserEntity } from '../user.entity';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<UserEntity> {
  constructor(
    dataSource: DataSource,
    private readonly tokenService: TokenService,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return UserEntity;
  }

  async beforeInsert(event: InsertEvent<UserEntity>) {
    if (event.entity.password) {
      event.entity.password = await this.tokenService.hashPassword(
        event.entity.password,
      );
    }
  }

  async beforeUpdate(event: UpdateEvent<UserEntity>) {
    if (
      event.entity?.password &&
      event.entity.password !== event.databaseEntity?.password
    ) {
      event.entity.password = await this.tokenService.hashPassword(
        event.entity.password as string,
      );
    }
  }
}
