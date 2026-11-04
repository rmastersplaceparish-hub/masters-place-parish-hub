# Plan: Library books + exam anti-cheating and question shuffling

Three additions to the existing parish site — no rebuild of anything else.

## 1. Book library with staff uploads

The RCCG training manuals are copyrighted, so nothing is downloaded from outside. Instead staff upload the PDFs they already have (School of Disciples, Workers in Training, Baptismal class, and any future books), and the public Library page shows them for download.

- New storage bucket `church-books` (private, same signed-URL pattern as the gallery).
- New table `library_books` in one migration: title, category (`school_of_disciples` / `workers_in_training` / `baptismal_class` / `other`), description, storage_path, file_name, file_size, is_visible, display_order — with RLS: anyone can view visible books, staff (admin/pastor roles) manage them.
- Staff upload page at `/library-admin` (under the signed-in staff area): pick a PDF, choose title, description and category, upload. List existing books with delete and visibility toggle.
- Rework `/library` to show real uploaded books grouped by the three class categories plus a general section, each with a download button (signed URL from a server function). The "coming soon" message stays only for categories with no books yet.

## 2. Anti-cheating (tab switching / minimizing)

- While an exam is running, the page listens for the student leaving it (tab switch, minimize, or switching to another window — browsers report all three the same way).
- First offence: a full-screen warning — "You left the exam. If you leave again it will be submitted automatically."
- Second offence: the exam submits automatically and the student sees their score. The number of offences is recorded with the attempt.
- Staff see a "Tab switches" column in the results table, so genuine malpractice is visible.
- Honest limits: a student can switch apps on a phone's app switcher or open a second window on some setups, and nothing can stop someone using a second device. This catches the ordinary cases.

## 3. Question shuffling

- When a student clicks "Begin exam", the questions are shuffled and, within each question, the A–D answer options are shuffled too — different order for every attempt.
- Scoring is unchanged: answers are submitted as the real option letters, so the server-side scoring and Excel-uploaded answer keys keep working.
- Shuffling is done with a small tested utility (same questions and options in, permuted out, nothing lost or duplicated) with a test next to the existing exam tests.

## Migration (single call)

- `CREATE TABLE public.library_books` + GRANTs + RLS policies.
- `ALTER TABLE public.exam_attempts ADD COLUMN tab_switches integer NOT NULL DEFAULT 0`.
- Extend `submit_exam` with an optional `p_tab_switches` parameter so offences are saved.
- RLS policies on `storage.objects` for the `church-books` bucket (staff write, staff read for signed URLs).
- The bucket itself is created with the storage tool, not SQL.

## Order of work

1. Create `church-books` bucket, then run the migration.
2. Books: server functions (upload, list, delete, toggle, signed URL), staff page, reworked library page.
3. Exams: shuffle utility + test, anti-cheat listeners in the exam page, submit path carries tab-switch count, admin results column.
4. Verify: build clean, tests pass, walk the exam page in the browser (tab-switch warning fires, auto-submit on second offence), confirm the library page renders.

## Notes

- Exam time limits, scoring, and the Excel upload flow are untouched.
- Books need staff to upload; nothing appears in the library until then.
