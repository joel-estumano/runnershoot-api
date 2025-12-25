import { SecurityService } from '@common/modules/security/security.service';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';

import { UserEntity } from '../user.entity';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<UserEntity> {
  constructor(
    dataSource: DataSource,
    private readonly securityService: SecurityService,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return UserEntity;
  }

  async beforeInsert(event: InsertEvent<UserEntity>) {
    if (event.entity.password) {
      event.entity.password = await this.securityService.hashPassword(
        event.entity.password,
      );
    }
  }
}
