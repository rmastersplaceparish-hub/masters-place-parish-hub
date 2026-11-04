INSERT INTO public.gallery_photos (storage_path, caption, category, display_order, is_visible) VALUES
('gallery/masters-place-01.jpg', 'A recent moment at RCCG The Master''s Place', 'Church life', 0, true),
('gallery/masters-place-02.jpg', 'Church family at RCCG The Master''s Place', 'Church life', 1, true),
('gallery/masters-place-03.jpg', 'A recent gathering at RCCG The Master''s Place', 'Church life', 2, true),
('gallery/masters-place-04.jpg', 'Fellowship at RCCG The Master''s Place', 'Church life', 3, true),
('gallery/masters-place-05.jpg', 'Life at RCCG The Master''s Place', 'Church life', 4, true),
('gallery/masters-place-06.jpg', 'A joyful moment at RCCG The Master''s Place', 'Church life', 5, true),
('gallery/masters-place-07.jpg', 'The Master''s Place church community', 'Church life', 6, true),
('gallery/masters-place-08.jpg', 'A recent church gathering in Ile-Ife', 'Church life', 7, true),
('gallery/masters-place-09.jpg', 'Worship and fellowship at The Master''s Place', 'Church life', 8, true),
('gallery/masters-place-10.jpg', 'A recent photo from The Master''s Place', 'Church life', 9, true)
ON CONFLICT (storage_path) DO NOTHING;