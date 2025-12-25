import { BaseEntity } from '@common/shared/entities/base.entity';
import { UserEntity } from '@modules/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum EnumProfileGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export interface IProfile {
  id?: number;
  avatar?: string;
  bio?: string;
  gender?: EnumProfileGender;
  bornAt?: Date;
  bodyHeight?: number;
  bodyWeight?: number;
  user: UserEntity;
}

@Entity('profiles')
export class ProfileEntity extends BaseEntity implements IProfile {
  // Define uma relação 1:1 entre ProfileEntity e UserEntity
  @OneToOne(() => UserEntity, (user) => user.profile, {
    onDelete: 'CASCADE', // se o usuário for deletado, o perfil associado também será removido automaticamente
  })
  @JoinColumn() // cria a coluna userId na tabela profiles, que funciona como chave estrangeira para users.id
  user: UserEntity; // propriedade que representa o usuário dono deste

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  avatar: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'enum', enum: EnumProfileGender, nullable: true })
  gender: EnumProfileGender;

  @Column({ type: 'date', nullable: true })
  bornAt: Date;

  @Column({ type: 'float', nullable: true })
  bodyHeight: number;

  @Column({ type: 'float', nullable: true })
  bodyWeight: number;
}
