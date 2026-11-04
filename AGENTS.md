<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project architecture

- Internal pastoral-care reads and writes use TanStack Start server functions with authenticated Supabase context; this keeps service credentials out of the browser.
- Gallery photos live in Supabase church-media with records in gallery_photos and signed URLs from server functions, so staff changes propagate to Lovable and Vercel without redeploying.
