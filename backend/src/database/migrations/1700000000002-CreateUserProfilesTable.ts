import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserProfilesTable1700000000002 implements MigrationInterface {
  name = 'CreateUserProfilesTable1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_profiles" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
        "skin_type" varchar NOT NULL DEFAULT 'UNKNOWN',
        "retention_level" varchar NULL,
        "preferred_duration" varchar NULL,
        "preferred_projection" varchar NULL,
        "climate" varchar NULL,
        "preferred_family_ids" uuid[] NOT NULL DEFAULT '{}',
        "favorite_note_ids" uuid[] NOT NULL DEFAULT '{}',
        "disliked_note_ids" uuid[] NOT NULL DEFAULT '{}',
        "preferred_usages" varchar[] NOT NULL DEFAULT '{}',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "user_profiles"`);
  }
}
