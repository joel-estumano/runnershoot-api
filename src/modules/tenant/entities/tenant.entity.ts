import { BaseEntity } from '@common/shared/entities/base.entity';
import { UserEntity } from '@modules/users/entities/user.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tenants')
export class TenantEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  domain: string;

  @OneToMany(() => UserEntity, (user) => user.tenant)
  users: UserEntity[];
}
