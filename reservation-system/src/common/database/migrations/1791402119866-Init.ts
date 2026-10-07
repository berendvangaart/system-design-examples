import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1791402119866 implements MigrationInterface {
  name = 'Init1791402119866';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."payment_status" AS ENUM('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "booking_id" uuid NOT NULL, "amount_cents" integer NOT NULL, "currency" character(3) NOT NULL DEFAULT 'EUR', "status" "public"."payment_status" NOT NULL DEFAULT 'PENDING', "idempotency_key" character varying(255) NOT NULL, "provider_reference" character varying(255), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_59dcef70bd19850783c84f840e5" UNIQUE ("idempotency_key"), CONSTRAINT "UQ_de9cb5e46ac2a317daf1e201d24" UNIQUE ("provider_reference"), CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e86edf76dc2424f123b9023a2b" ON "payments"  ("booking_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "events" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying NOT NULL, "version" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."seat_status" AS ENUM('AVAILABLE', 'HELD', 'BOOKED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "seats" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "event_id" uuid NOT NULL, "row" character varying(8) NOT NULL, "number" integer NOT NULL, "price_cents" integer NOT NULL, "status" "public"."seat_status" NOT NULL DEFAULT 'AVAILABLE', "held_until" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_5990289f9b1c22c3bbb9ab1dc07" UNIQUE ("event_id", "row", "number"), CONSTRAINT "PK_3fbc74bb4638600c506dcb777a7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_027e8a0d51c50b989d7d73346e" ON "seats"  ("event_id", "status") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."booking_status" AS ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "bookings" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "seat_id" uuid NOT NULL, "user_id" uuid NOT NULL, "status" "public"."booking_status" NOT NULL DEFAULT 'PENDING', "amount_cents" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_64cd97487c5c42806458ab5520" ON "bookings"  ("user_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_bookings_active_seat" ON "bookings"  ("seat_id") WHERE status IN ('PENDING', 'CONFIRMED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD CONSTRAINT "FK_e86edf76dc2424f123b9023a2b2" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "seats" ADD CONSTRAINT "FK_a71d9b311f8ba4a8f95ac6176e2" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD CONSTRAINT "FK_9fc1f239752f7eb30cb8cf97ffd" FOREIGN KEY ("seat_id") REFERENCES "seats"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP CONSTRAINT "FK_9fc1f239752f7eb30cb8cf97ffd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "seats" DROP CONSTRAINT "FK_a71d9b311f8ba4a8f95ac6176e2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "FK_e86edf76dc2424f123b9023a2b2"`,
    );
    await queryRunner.query(`DROP INDEX "public"."UQ_bookings_active_seat"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_64cd97487c5c42806458ab5520"`,
    );
    await queryRunner.query(`DROP TABLE "bookings"`);
    await queryRunner.query(`DROP TYPE "public"."booking_status"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_027e8a0d51c50b989d7d73346e"`,
    );
    await queryRunner.query(`DROP TABLE "seats"`);
    await queryRunner.query(`DROP TYPE "public"."seat_status"`);
    await queryRunner.query(`DROP TABLE "events"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e86edf76dc2424f123b9023a2b"`,
    );
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TYPE "public"."payment_status"`);
  }
}
