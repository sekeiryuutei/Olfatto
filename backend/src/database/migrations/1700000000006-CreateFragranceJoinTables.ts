import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFragranceJoinTables1700000000006 implements MigrationInterface {
  name = 'CreateFragranceJoinTables1700000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "fragrance_notes" (
        "fragrance_id" uuid NOT NULL REFERENCES "fragrances"("id") ON DELETE CASCADE,
        "note_id" uuid NOT NULL REFERENCES "notes"("id") ON DELETE CASCADE,
        PRIMARY KEY ("fragrance_id", "note_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "fragrance_families" (
        "fragrance_id" uuid NOT NULL REFERENCES "fragrances"("id") ON DELETE CASCADE,
        "family_id" uuid NOT NULL REFERENCES "families"("id") ON DELETE CASCADE,
        PRIMARY KEY ("fragrance_id", "family_id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "fragrance_families"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "fragrance_notes"`);
  }
}
