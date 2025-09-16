import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.payments)
  user: User;

  @Column()
  amount: number;

  @Column()
  currency: string;

  @Column()
  method: number;

  @Column({ nullable: true })
  client_secret?: string;

  @Column({ nullable: true })
  intention_id?: string;

  @Column({ default: 'initiated' })
  status: string; // ⏳ initiated | paid | failed | refunded

  @CreateDateColumn()
  created_at: Date;
}
