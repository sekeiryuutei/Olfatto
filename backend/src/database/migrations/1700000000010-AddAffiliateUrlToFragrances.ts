import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAffiliateUrlToFragrances1700000000010 implements MigrationInterface {
  name = 'AddAffiliateUrlToFragrances1700000000010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "fragrances" ADD COLUMN "affiliate_url" varchar NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "fragrances" DROP COLUMN "affiliate_url"`);
  }
}
