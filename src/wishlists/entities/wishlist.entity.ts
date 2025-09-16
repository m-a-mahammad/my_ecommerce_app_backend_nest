import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { WishlistItem } from './wishlist-item.entity';
import { User } from 'src/users/entities/user.entity';

@Unique(['user'])
@Entity()
export class Wishlist {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { eager: true, nullable: false })
  @JoinColumn()
  user: User;

  @OneToMany(() => WishlistItem, (item) => item.wishlist, { eager: true })
  items: WishlistItem[];

  @CreateDateColumn()
  createdAt: Date;
}
