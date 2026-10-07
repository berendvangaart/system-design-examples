import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Booking } from '../bookings/booking.entity.js';

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

@Entity('payments')
@Index(['bookingId'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Booking, (booking) => booking.payments, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'booking_id' })
  booking: Relation<Booking>;

  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @Column({ name: 'amount_cents', type: 'int' })
  amountCents: number;

  @Column({ type: 'char', length: 3, default: 'EUR' })
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    enumName: 'payment_status',
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  // Client-supplied key so a retried request doesn't charge twice.
  @Column({
    name: 'idempotency_key',
    type: 'varchar',
    length: 255,
    unique: true,
  })
  idempotencyKey: string;

  // ID from the payment provider (e.g. Stripe), known once the provider responds.
  @Column({
    name: 'provider_reference',
    type: 'varchar',
    length: 255,
    nullable: true,
    unique: true,
  })
  providerReference: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
