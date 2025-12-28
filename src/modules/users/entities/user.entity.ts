import { BaseEntity } from '@common/shared/entities/base.entity';
import { ProfileEntity } from '@modules/profile/entities/profile.entity';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserSecurityTokenEntity } from './user-security-token.entity';

/**
 * EnumUserRole define os diferentes papéis que um usuário pode assumir no sistema.
 *
 * - `ADMIN`: Representa o administrador do sistema.
 *   → Pode gerenciar todo o sistema, incluindo usuários, organizadores e eventos.
 *
 * - `USER`: Representa o participante comum.
 *   → Pode visualizar eventos disponíveis e se inscrever em corridas ou maratonas.
 *
 * - `ORGANIZER`: Representa o organizador de eventos.
 *   → Pode criar novos eventos, editar detalhes e gerenciar inscrições dos participantes.
 */
export enum EnumUserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  ORGANIZER = 'ORGANIZER',
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
