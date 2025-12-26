import { BaseEntity } from '@common/shared/entities/base.entity';
import { ProfileEntity } from '@modules/profile/entities/profile.entity';
import { TenantEntity } from '@modules/tenant/entities/tenant.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserSecurityTokenEntity } from './user-security-token.entity';

export enum EnumUserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  SYSTEM = 'SYSTEM',
}

export interface IUser {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role?: EnumUserRole;
}

@Entity('users')
export class UserEntity extends BaseEntity implements IUser {
  @ManyToOne(() => TenantEntity, (tenant) => tenant.users, {
    onDelete: 'CASCADE',
  })
  tenant: TenantEntity;

  @OneToOne(() => ProfileEntity, (profile) => profile.user, {
    cascade: true,
  })
  profile: ProfileEntity;

  @OneToMany(() => UserSecurityTokenEntity, (sToken) => sToken.user, {
    cascade: true,
  })
  securityTokens: UserSecurityTokenEntity[];

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  firstName: string;

  @Column({ nullable: false })
  lastName: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ type: 'varchar', length: 512, nullable: false, select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: EnumUserRole,
    nullable: false,
    default: EnumUserRole.USER,
  })
  role: EnumUserRole;
}
