import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { TimeStamps } from './timestamps';
import { UserRole } from '../types';

@Entity('users')
export class User extends TimeStamps {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'varchar' })
  @Index('unique_username', { unique: true })
  username: string;
  @Column({ type: 'varchar' })
  @Index('unique_email', { unique: true })
  email: string;
  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;
  @Column({ type: 'varchar', select: false })
  password: string;
  @Column({ type: 'text', nullable: true, select: false })
  refreshTokens: string | null;
  @Column({ type: 'boolean', default: false })
  isBlocked: boolean;
}
