import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Eye, EyeOff, FileText, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { StaffNav } from "@/components/site/staff-nav";
import { supabase } from "@/integrations/supabase/client";
import {
  BOOK_CATEGORIES,
  BOOK_CATEGORY_LABELS,
  createBook,
  deleteBook,
  listManagedBooks,
  updateBook,
  type BookCategory,
  type LibraryBook,
} from "@/lib/library.functions";

export const Route = createFileRoute("/_authenticated/library-admin")({
  head: () => ({
    meta: [
      { title: "Library Books — RCCG The Master's Place" },
      { name: "description", content: "Upload study books for the parish resource library." },
      { property: "og:title", content: "Library Books — RCCG The Master's Place" },
      { property: "og:description", content: "Upload study books for the parish resource library." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: LibraryAdminPage,
});

const MAX_BOOK_BYTES = 50 * 1024 * 1024;

function LibraryAdminPage() {
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<BookCategory>("school_of_disciples");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    try {
      setBooks(await listManagedBooks());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to load books.");
    }
  };
  useEffect(() => {
    void load();
  }, []);

  const onUpload = async () => {
    if (!file) {
      toast.error("Choose a PDF file first.");
      return;
    }
    if (file.size > MAX_BOOK_BYTES) {
      toast.error("That file is larger than 50 MB. Please compress it first.");
      return;
    }
    setUploading(true);
    try {
      const path = `${crypto.randomUUID()}-${file.name}`;
      const { error } = await supabase.storage.from("church-books").upload(path, file, {
        contentType: file.type || "application/pdf",
        upsert: false,
      });
      if (error) throw new Error(error.message);
      await createBook({
        data: {
          title,
          description: description || null,
          category,
          storagePath: path,
          fileName: file.name,
          fileSize: file.size,
          isVisible: true,
          displayOrder: 0,
        },
      });
      toast.success("Book uploaded.");
      setTitle("");
      setDescription("");
      setFile(null);
      const input = document.querySelector<HTMLInputElement>('#book-file');
      if (input) input.value = "";
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to upload book.");
    } finally {
      setUploading(false);
    }
  };

  const fmtSize = (bytes: number | null) => {
    if (!bytes) return "";
    return bytes > 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
  };

  return (
    <PageShell>
      <StaffNav />
      <PageHeader
        eyebrow="Staff workspace"
        title="Library Books"
        description="Upload the study books members download from the Resource Library page."
      />
      <div className="mx-auto max-w-5xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        <section className="panel space-y-5 p-6">
          <h2 className="font-display text-lg font-semibold">Upload a book</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="book-title">Book title</Label>
              <Input id="book-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. School of Disciples Manual" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as BookCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BOOK_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {BOOK_CATEGORY_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="book-desc">Description (optional)</Label>
            <Textarea id="book-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="book-file">Book file (PDF, up to 50 MB)</Label>
            <Input
              id="book-file"
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <Button onClick={() => void onUpload()} disabled={uploading || !title.trim() || !file}>
            <Upload className="size-4" /> {uploading ? "Uploading…" : "Upload book"}
          </Button>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-lg font-semibold">Your books</h2>
          {books.length === 0 && <p className="text-sm text-muted-foreground">No books uploaded yet.</p>}
          {books.map((book) => (
            <div key={book.id} className="panel flex flex-wrap items-center gap-3 p-5">
              <BookOpen className="size-5 shrink-0 text-accent" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display font-semibold">{book.title}</h3>
                  <Badge variant="secondary">{BOOK_CATEGORY_LABELS[book.category]}</Badge>
                  {!book.isVisible && <Badge variant="destructive">Hidden</Badge>}
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <FileText className="size-3" /> {book.fileName}
                  {book.fileSize ? ` · ${fmtSize(book.fileSize)}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                {book.downloadUrl && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={book.downloadUrl} target="_blank" rel="noreferrer" download={book.fileName}>
                      View
                    </a>
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    try {
                      await updateBook({ data: { id: book.id, isVisible: !book.isVisible } });
                      await load();
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Unable to update book.");
                    }
                  }}
                >
                  {book.isVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  {book.isVisible ? "Hide" : "Show"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    if (!window.confirm(`Delete "${book.title}" permanently?`)) return;
                    try {
                      await deleteBook({ data: { id: book.id } });
                      toast.success("Book deleted.");
                      await load();
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Unable to delete book.");
                    }
                  }}
                >
                  <Trash2 className="size-4" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </PageShell>
  );
}
