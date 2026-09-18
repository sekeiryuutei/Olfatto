import 'reflect-metadata';
import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import dataSource from '@config/typeorm.config';
import { BrandOrmEntity } from '@modules/fragrances/infrastructure/persistence/brand.orm-entity';
import { NoteOrmEntity } from '@modules/fragrances/infrastructure/persistence/note.orm-entity';
import { FamilyOrmEntity } from '@modules/fragrances/infrastructure/persistence/family.orm-entity';
import { FragranceOrmEntity } from '@modules/fragrances/infrastructure/persistence/fragrance.orm-entity';
import { UserOrmEntity } from '@modules/users/infrastructure/persistence/user.orm-entity';
import { UserProfileOrmEntity } from '@modules/users/infrastructure/persistence/user-profile.orm-entity';
import { ReviewOrmEntity } from '@modules/reviews/infrastructure/persistence/review.orm-entity';

const BRAND_NAMES = [
  'Dior',
  'Chanel',
  'Yves Saint Laurent',
  'Creed',
  'Parfums de Marly',
  'Giorgio Armani',
  'Tom Ford',
];

const FAMILY_NAMES = [
  'Amaderado',
  'Ámbar',
  'Especiado',
  'Cítrico',
  'Floral',
  'Fougère',
  'Cuero',
  'Oriental',
  'Acuático',
  'Gourmand',
];

const NOTE_NAMES = [
  'Bergamota',
  'Pimienta',
  'Vainilla',
  'Maderas',
  'Ámbar',
  'Lavanda',
  'Sal',
  'Elemí',
  'Geranio',
  'Cedro',
  'Almizcle',
  'Cardamomo',
  'Incienso',
  'Cuero',
  'Iris',
];

async function run(): Promise<void> {
  await dataSource.initialize();
  console.log('DB connected. Seeding Olfatto...');

  const brandRepo = dataSource.getRepository(BrandOrmEntity);
  const noteRepo = dataSource.getRepository(NoteOrmEntity);
  const familyRepo = dataSource.getRepository(FamilyOrmEntity);
  const fragranceRepo = dataSource.getRepository(FragranceOrmEntity);
  const userRepo = dataSource.getRepository(UserOrmEntity);
  const profileRepo = dataSource.getRepository(UserProfileOrmEntity);
  const reviewRepo = dataSource.getRepository(ReviewOrmEntity);

  // ---- Reference data ----
  const brands = await brandRepo.save(BRAND_NAMES.map((name) => brandRepo.create({ name })));
  const families = await familyRepo.save(
    FAMILY_NAMES.map((name) => familyRepo.create({ name })),
  );
  const notes = await noteRepo.save(NOTE_NAMES.map((name) => noteRepo.create({ name })));

  const brand = (name: string) => brands.find((b) => b.name === name)!;
  const family = (name: string) => families.find((f) => f.name === name)!;
  const note = (name: string) => notes.find((n) => n.name === name)!;

  // ---- Demo fragrances ----
  // Sauvage EDP is the fragrance used in every mockup throughout the spec
  // (points 8, 14-20) — seeded with real reviews below so the detail page
  // shows actual duration/skin-performance data on first run.
  const fragrancesData = [
    {
      name: 'Sauvage',
      brand: brand('Dior'),
      concentration: 'EDP',
      gender: 'MASCULINE',
      releaseYear: 2018,
      description: 'Fresco, especiado y adictivo — la referencia moderna del amaderado especiado.',
      families: [family('Amaderado'), family('Especiado'), family('Ámbar'), family('Cítrico')],
      notes: [note('Bergamota'), note('Pimienta'), note('Ámbar'), note('Maderas'), note('Elemí')],
    },
    {
      name: 'Bleu de Chanel',
      brand: brand('Chanel'),
      concentration: 'EDP',
      gender: 'MASCULINE',
      releaseYear: 2014,
      description: 'Amaderado aromático, versátil, con un fondo cálido y elegante.',
      families: [family('Amaderado'), family('Cítrico')],
      notes: [note('Bergamota'), note('Cedro'), note('Incienso')],
    },
    {
      name: 'Y Eau de Parfum',
      brand: brand('Yves Saint Laurent'),
      concentration: 'EDP',
      gender: 'MASCULINE',
      releaseYear: 2018,
      description: 'Aromático fougère con salida cítrica y fondo amaderado.',
      families: [family('Fougère'), family('Amaderado')],
      notes: [note('Bergamota'), note('Geranio'), note('Cedro')],
    },
    {
      name: 'Aventus',
      brand: brand('Creed'),
      concentration: 'EDP',
      gender: 'MASCULINE',
      releaseYear: 2010,
      description: 'Afrutado y amaderado, icónico por su salida a piña y fondo a musgo de roble.',
      families: [family('Amaderado'), family('Cítrico')],
      notes: [note('Bergamota'), note('Almizcle'), note('Cedro')],
    },
    {
      name: 'Layton',
      brand: brand('Parfums de Marly'),
      concentration: 'EDP',
      gender: 'UNISEX',
      releaseYear: 2016,
      description: 'Oriental especiado con vainilla y almendra amarga sobre fondo amaderado.',
      families: [family('Oriental'), family('Especiado')],
      notes: [note('Vainilla'), note('Cardamomo'), note('Maderas')],
    },
    {
      name: 'Code',
      brand: brand('Giorgio Armani'),
      concentration: 'EDT',
      gender: 'MASCULINE',
      releaseYear: 2004,
      description: 'Oriental amaderado con salida cítrica y corazón de tabaco.',
      families: [family('Oriental'), family('Amaderado')],
      notes: [note('Bergamota'), note('Cuero'), note('Cardamomo')],
    },
    {
      name: 'Oud Wood',
      brand: brand('Tom Ford'),
      concentration: 'PARFUM',
      gender: 'UNISEX',
      releaseYear: 2007,
      description: 'Amaderado oriental exótico, cálido y envolvente.',
      families: [family('Amaderado'), family('Oriental')],
      notes: [note('Maderas'), note('Cardamomo'), note('Ámbar')],
    },
  ];

  const fragrances = await fragranceRepo.save(
    fragrancesData.map((data) =>
      fragranceRepo.create({
        name: data.name,
        brandId: data.brand.id,
        concentration: data.concentration,
        gender: data.gender,
        releaseYear: data.releaseYear,
        description: data.description,
        families: data.families,
        notes: data.notes,
      }),
    ),
  );

  const sauvage = fragrances.find((f) => f.name === 'Sauvage')!;

  // ---- Demo users (password for all: "Olfatto2026!") ----
  const passwordHash = await bcrypt.hash('Olfatto2026!', 12);

  const demoUsersData = [
    { name: 'Victor Demo', email: 'admin@olfatto.app', role: 'ADMIN', skinType: 'OILY' },
    { name: 'Carlos Restrepo', email: 'carlos@olfatto.app', role: 'USER', skinType: 'OILY' },
    { name: 'Ana Torres', email: 'ana@olfatto.app', role: 'USER', skinType: 'DRY' },
    { name: 'Laura Gómez', email: 'laura@olfatto.app', role: 'USER', skinType: 'COMBINATION' },
  ];

  const users = await userRepo.save(
    demoUsersData.map((u) =>
      userRepo.create({
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
        emailVerified: true,
      }),
    ),
  );

  await profileRepo.save(
    users.map((u, i) =>
      profileRepo.create({
        userId: u.id,
        skinType: demoUsersData[i].skinType,
        retentionLevel: 'HIGH',
        preferredDuration: 'LONG',
        preferredProjection: 'STRONG',
        climate: 'TEMPERATE',
      }),
    ),
  );

  // ---- Demo reviews on Sauvage — feeds the duration distribution / skin
  // performance shown on the fragrance detail page (points 16-17) right
  // after a fresh install. ----
  const [, carlos, ana, laura] = users;
  await reviewRepo.save([
    reviewRepo.create({
      userId: carlos.id,
      fragranceId: sauvage.id,
      rating: '5.0',
      durationHours: '9.5',
      projection: 'STRONG',
      liked: true,
      comment: 'En mi piel proyecta muchísimo las primeras 2 horas y se queda cerca todo el día.',
      skinTypeSnapshot: 'OILY',
    }),
    reviewRepo.create({
      userId: ana.id,
      fragranceId: sauvage.id,
      rating: '4.0',
      durationHours: '6.0',
      projection: 'MODERATE',
      liked: true,
      comment: 'Me dura menos que a otros pero el aroma es espectacular.',
      skinTypeSnapshot: 'DRY',
    }),
    reviewRepo.create({
      userId: laura.id,
      fragranceId: sauvage.id,
      rating: '4.5',
      durationHours: '8.0',
      projection: 'STRONG',
      liked: true,
      comment: 'Excelente para el día a día, versátil.',
      skinTypeSnapshot: 'COMBINATION',
    }),
  ]);

  console.log(
    `Seed complete: ${brands.length} brands, ${families.length} families, ${notes.length} notes, ` +
      `${fragrances.length} fragrances, ${users.length} demo users (password: Olfatto2026!), 3 reviews.`,
  );

  await dataSource.destroy();
}

run().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
