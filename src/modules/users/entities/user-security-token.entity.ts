import { BaseEntity } from '@common/shared/entities/base.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { UserEntity } from './user.entity';

@Entity('user-security-tokens')
export class UserSecurityTokenEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.securityTokens, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @Column({ type: 'varchar', length: 512, nullable: true, unique: true })
  token: string;
}
