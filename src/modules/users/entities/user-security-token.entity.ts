import { BaseEntity } from '@common/shared/entities/base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserEntity } from './user.entity';

@Entity('user-security-tokens')
export class UserSecurityTokenEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number; // id INT AUTO_INCREMENT PRIMARY KEY

  @OneToOne(() => UserEntity, (user) => user.securityToken, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: UserEntity;

  @Column({ type: 'varchar', length: 512, nullable: true, unique: true })
  token: string;

  @Column({ type: 'timestamp', nullable: true })
  validUntil: Date;
}
