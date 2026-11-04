INSERT INTO public.church_events (title, theme, description, event_date, end_date, location, is_featured, is_published, status)
SELECT v.title, v.theme, v.description, v.event_date, v.end_date, v.location, v.is_featured, TRUE, 'upcoming'
FROM (VALUES
  (
    'Sunday Celebration Service',
    'Raising Disciples, Transforming Lives',
    'Our weekly celebration service with Spirit-filled worship, sound biblical teaching and prayer. Children''s church runs alongside the main service, and first-time visitors are warmly received at the welcome desk.',
    (date_trunc('week', now() AT TIME ZONE 'Africa/Lagos')::date + 6) + TIME '09:00',
    (date_trunc('week', now() AT TIME ZONE 'Africa/Lagos')::date + 6) + TIME '11:30',
    'Mayfair, Opposite Slot, Ile-Ife, Osun State, Nigeria',
    TRUE
  ),
  (
    'Midweek Communion & Word Service',
    'Digging Deep into the Word',
    'A midweek gathering for deeper Bible study, holy communion and corporate prayer. Come expectant for teaching that applies to everyday life.',
    (date_trunc('week', now() AT TIME ZONE 'Africa/Lagos')::date + 8) + TIME '17:30',
    (date_trunc('week', now() AT TIME ZONE 'Africa/Lagos')::date + 8) + TIME '19:30',
    'Mayfair, Opposite Slot, Ile-Ife, Osun State, Nigeria',
    FALSE
  ),
  (
    'Master''s Praise Concert',
    'A Night of Worship and Thanksgiving',
    'An evening of praise with our choir, worship team and invited ministers, celebrating God''s faithfulness to the parish. Family and friends are welcome.',
    (date_trunc('week', now() AT TIME ZONE 'Africa/Lagos')::date + 34) + TIME '16:00',
    (date_trunc('week', now() AT TIME ZONE 'Africa/Lagos')::date + 34) + TIME '20:00',
    'Mayfair, Opposite Slot, Ile-Ife, Osun State, Nigeria',
    FALSE
  )
) AS v(title, theme, description, event_date, end_date, location, is_featured)
WHERE NOT EXISTS (SELECT 1 FROM public.church_events e WHERE e.title = v.title);