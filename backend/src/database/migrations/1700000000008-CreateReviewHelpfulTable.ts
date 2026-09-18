import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReviewHelpfulTable1700000000008 implements MigrationInterface {
  name = 'CreateReviewHelpfulTable1700000000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "review_helpful" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "review_id" uuid NOT NULL REFERENCES "reviews"("id") ON DELETE CASCADE,
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "uq_review_helpful_review_user" UNIQUE ("review_id", "user_id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "review_helpful"`);
  }
}
