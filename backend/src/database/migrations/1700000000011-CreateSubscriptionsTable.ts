import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSubscriptionsTable1700000000011 implements MigrationInterface {
  name = 'CreateSubscriptionsTable1700000000011';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "subscriptions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
        "stripe_customer_id" varchar NOT NULL,
        "stripe_subscription_id" varchar NULL,
        "status" varchar NOT NULL DEFAULT 'NONE',
        "current_period_end" TIMESTAMPTZ NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_subscriptions_stripe_customer_id" ON "subscriptions" ("stripe_customer_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "subscriptions"`);
  }
}
