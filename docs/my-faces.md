# My faces

Reference photos a person chose to keep, so the next swap in Nano FaceStudio Online or Nano HeadSwap Pro starts
with one click instead of an upload. Added 2026-11-24 to give people a reason to come back to the same tools
(owner's request: "make users stick to our face swap models").

## How it works

- Under a reference photo the person uploaded, **Save to My faces** asks first ("Keep this photo in My faces
  so you can use it again? It is stored privately, only you can see it, and you can delete it at any time.").
  Nothing is kept without that click; the row's `consented_at` records it.
- The browser resizes the photo (JPEG, long side at most 2,048 px) and makes a 256 px thumbnail, then uploads
  both to signed R2 addresses: `saved-faces/<user id>/<face id>.jpg` and `<face id>_t.jpg` in the bucket of
  `R2_DOWNLOADS_*`. The site checks both are there (and under 8 MB / 512 KB) before listing the face.
- The **My faces** row (public/my-faces.js) shows up to 20 per account. Clicking one reads the photo through
  `/api/saved-faces/<id>/image` (same origin) and hands it to the tool as if it had been uploaded again; the
  tool's normal upload path is unchanged. Each pick adds to `use_count` and sets `last_used_at`.
- The × on a face deletes the row and both files at once.

Code: lib/saved-faces-server.ts, app/api/saved-faces/*, public/my-faces.js; table scripts/028_create_saved_faces.sql.
Signed out, or with the table missing, the row simply does not appear.

## Deleting an account by hand

The rows go with the account (ON DELETE CASCADE); the files do not. Also delete everything under
`saved-faces/<user id>/` in the R2 bucket.

## Reading it

```sql
SELECT count(*) FILTER (WHERE confirmed_at IS NOT NULL) AS faces,
       count(DISTINCT user_id) FILTER (WHERE confirmed_at IS NOT NULL) AS people,
       count(*) FILTER (WHERE use_count > 0) AS used_again,
       sum(use_count) AS uses
FROM public.saved_faces;
```
