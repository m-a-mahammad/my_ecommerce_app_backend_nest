import { Cart } from 'src/carts/entities/cart.entity';
import { UserRole } from 'src/enums/user-role.enum';
import { Payment } from 'src/payments/entities/payment.entity';
import { Wishlist } from 'src/wishlists/entities/wishlist.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

class Image {
  @Column({ name: 'image_url', nullable: true })
  url: string;
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    nullable: false,
    length: 100,
  })
  name: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: false, length: 100 })
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: string;

  @Column(() => Image, { prefix: false })
  image: Image;

  @OneToOne(() => Cart, (cart) => cart.user)
  cart: Cart;

  @OneToOne(() => Wishlist, (wishlist) => wishlist.user)
  wishlist: Wishlist;

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
