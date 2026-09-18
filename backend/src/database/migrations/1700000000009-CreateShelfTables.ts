import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateShelfTables1700000000009 implements MigrationInterface {
  name = 'CreateShelfTables1700000000009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "collection_items" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "fragrance_id" uuid NOT NULL REFERENCES "fragrances"("id") ON DELETE CASCADE,
        "status" varchar NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "uq_collection_items_user_fragrance" UNIQUE ("user_id", "fragrance_id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_collection_items_user_id" ON "collection_items" ("user_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "wishlist_items" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "fragrance_id" uuid NOT NULL REFERENCES "fragrances"("id") ON DELETE CASCADE,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "uq_wishlist_items_user_fragrance" UNIQUE ("user_id", "fragrance_id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_wishlist_items_user_id" ON "wishlist_items" ("user_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "favorites" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "fragrance_id" uuid NOT NULL REFERENCES "fragrances"("id") ON DELETE CASCADE,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "uq_favorites_user_fragrance" UNIQUE ("user_id", "fragrance_id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_favorites_user_id" ON "favorites" ("user_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "favorites"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "wishlist_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "collection_items"`);
  }
}
