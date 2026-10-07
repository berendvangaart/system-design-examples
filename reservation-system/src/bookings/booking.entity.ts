import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Payment } from '../payments/payment.entity.js';
import { Seat } from '../seats/seat.entity.js';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

@Entity('bookings')
// At most one active booking per seat: a database-level safety net on top of the seat hold.
@Index('UQ_bookings_active_seat', ['seat'], {
  unique: true,
  where: `status IN ('PENDING', 'CONFIRMED')`,
})
@Index(['userId'])
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Seat, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'seat_id' })
  seat: Relation<Seat>;

  @Column({ name: 'seat_id', type: 'uuid' })
  seatId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    enumName: 'booking_status',
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({ name: 'amount_cents', type: 'int' })
  amountCents: number;

  @OneToMany(() => Payment, (payment) => payment.booking)
  payments: Relation<Payment[]>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
