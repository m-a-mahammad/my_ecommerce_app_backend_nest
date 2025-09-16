import slugify from 'slugify';
import { ColumnNumericTransformer } from 'src/common/transformers/column-numeric.transformer';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

class Image {
  @Column({ name: 'image_url' })
  url: string;
}

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column()
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  price: number;

  @Column({ nullable: false })
  brand: string;

  @Column({ nullable: false })
  category: string;

  @Column({ default: 0 })
  stock: number;

  @Column(() => Image, { prefix: false })
  image: Image;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    if (!this.slug && this.name) {
      this.slug = slugify(this.name, { lower: true }) as string;
    }
  }
}
