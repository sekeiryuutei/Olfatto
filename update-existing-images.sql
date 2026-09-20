-- Corre esto una sola vez sobre tu DB actual para que las 7 fragancias del
-- seed tengan imagen sin necesidad de re-sedear (evita duplicar/romper las
-- reviews que ya cargaste). Son placeholders genéricos, no fotos reales de
-- producto -- reemplazalas por fotos con licencia antes de cualquier launch real.
UPDATE fragrances SET image_url = 'https://placehold.co/600x600/1B1B1F/D4AF37?text=' || REPLACE(name, ' ', '+')
WHERE image_url IS NULL;
