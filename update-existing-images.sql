-- Corré esto una sola vez sobre tu DB actual si tus fragancias quedaron con
-- una URL de placehold.co (la que mostraba texto roto tipo "Bleu+de+Chanel").
-- Las vuelve a NULL -- el frontend ya genera su propio placeholder local
-- (SVG, sin red) automáticamente cuando no hay imageUrl, así que no hace
-- falta apuntar a ningún servicio externo.
UPDATE fragrances SET image_url = NULL WHERE image_url LIKE '%placehold.co%';
