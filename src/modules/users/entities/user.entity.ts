import { BaseEntity } from '@common/shared/entities/base.entity';
import { ProfileEntity } from 'src/modules/profile/entities/profile.entity';
import {
  Column,
  Entity,
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
  // Relação 1:1 com ProfileEntity
  @OneToOne(() => ProfileEntity, (profile) => profile.user, {
    cascade: true, // garante que operações de criação/atualização no usuário também sejam aplicadas ao perfil
  })
  // O usuário é o lado inverso da relação, ou seja, acessa o perfil vinculado
  profile: ProfileEntity; // propriedade que representa o perfil associado a este usuário

  @OneToMany(() => UserSecurityTokenEntity, (sToken) => sToken.user, {
    cascade: true,
  })
  securityTokens: UserSecurityTokenEntity[];

  @PrimaryGeneratedColumn()
  id: number; // id INT AUTO_INCREMENT PRIMARY KEY

  @Column({ nullable: false })
  firstName: string; // firstName VARCHAR(255) NOT NULL

  @Column({ nullable: false })
  lastName: string; // lastName VARCHAR(255) NOT NULL

  @Column({ nullable: false, unique: true })
  email: string; // email VARCHAR(255) NOT NULL UNIQUE

  @Column({ default: false })
  emailVerified: boolean; // emailVerified BOOLEAN DEFAULT FALSE

  @Column({ type: 'varchar', length: 512, nullable: false, select: false })
  password: string;
  // password VARCHAR(512) NOT NULL (não retornado por padrão nas queries)

  @Column({
    type: 'enum',
    enum: EnumUserRole,
    nullable: false,
    default: EnumUserRole.USER,
  })
  role: EnumUserRole;
}
