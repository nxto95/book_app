import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { TimeStamps } from './timestamps';

@Entity('books')
export class Book extends TimeStamps {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'varchar' })
  @Index('unique_title', { unique: true })
  title: string;
  @Column({ type: 'varchar' })
  author: string;
  @Column({ type: 'int' })
  publishedYear: number;
  @Column({ type: 'varchar' })
  genre: string;
  @Column({ type: 'int' })
  price: number;
  @Column()
  userId: string;
}
