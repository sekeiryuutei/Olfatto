import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFragrancesTable1700000000005 implements MigrationInterface {
  name = 'CreateFragrancesTable1700000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "fragrances" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "brand_id" uuid NOT NULL REFERENCES "brands"("id") ON DELETE RESTRICT,
        "name" varchar NOT NULL,
        "concentration" varchar NOT NULL,
        "gender" varchar NOT NULL,
        "release_year" integer NULL,
        "description" text NULL,
        "image_url" varchar NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    // Point 74: indexes for the columns the catalog/search actually filters and sorts by.
    await queryRunner.query(`CREATE INDEX "idx_fragrances_name" ON "fragrances" ("name")`);
    await queryRunner.query(`CREATE INDEX "idx_fragrances_brand_id" ON "fragrances" ("brand_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "fragrances"`);
  }
}
