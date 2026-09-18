import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReviewsTable1700000000007 implements MigrationInterface {
  name = 'CreateReviewsTable1700000000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "reviews" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "fragrance_id" uuid NOT NULL REFERENCES "fragrances"("id") ON DELETE CASCADE,
        "rating" decimal(2,1) NOT NULL CHECK ("rating" >= 0 AND "rating" <= 5),
        "duration_hours" decimal(4,1) NOT NULL CHECK ("duration_hours" >= 0 AND "duration_hours" <= 24),
        "projection" varchar NOT NULL,
        "liked" boolean NOT NULL,
        "comment" varchar(280) NULL,
        "skin_type_snapshot" varchar NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "uq_reviews_user_fragrance" UNIQUE ("user_id", "fragrance_id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_reviews_fragrance_id" ON "reviews" ("fragrance_id")`);
    await queryRunner.query(`CREATE INDEX "idx_reviews_user_id" ON "reviews" ("user_id")`);
    await queryRunner.query(
      `CREATE INDEX "idx_reviews_skin_type_snapshot" ON "reviews" ("skin_type_snapshot")`,
    );
    await queryRunner.query(`CREATE INDEX "idx_reviews_created_at" ON "reviews" ("created_at")`);
    // Composite index for the point-17 "performance by skin type" aggregation query.
    await queryRunner.query(
      `CREATE INDEX "idx_reviews_fragrance_skin" ON "reviews" ("fragrance_id", "skin_type_snapshot")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "reviews"`);
  }
}
