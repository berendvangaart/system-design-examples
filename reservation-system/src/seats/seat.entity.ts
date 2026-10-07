import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  Unique,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { Event } from '../events/event.entity.js';

export enum SeatStatus {
  AVAILABLE = 'AVAILABLE',
  HELD = 'HELD',
  BOOKED = 'BOOKED',
}

@Entity('seats')
@Unique(['event', 'row', 'number'])
@Index(['event', 'status'])
export class Seat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Event, (event) => event.seats, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event: Relation<Event>;

  @Column({ name: 'event_id', type: 'uuid' })
  eventId: string;

  @Column({ type: 'varchar', length: 8 })
  row: string;

  @Column({ type: 'int' })
  number: number;

  @Column({ name: 'price_cents', type: 'int' })
  priceCents: number;

  @Column({
    type: 'enum',
    enum: SeatStatus,
    enumName: 'seat_status',
    default: SeatStatus.AVAILABLE,
  })
  status: SeatStatus;

  @Column({ name: 'held_until', type: 'timestamptz', nullable: true })
  heldUntil: Date | null;

  @VersionColumn()
  version: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
