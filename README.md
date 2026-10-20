# shanymo.com

Static site. Every folder is a page:

| Page | File |
|---|---|
| Home | `index.html` |
| Work | `work/index.html` |
| Inventory | `inventory/index.html` |
| Lab | `lab/index.html` |
| 404 | `404.html` |

## Changing copy or adding a project

Each page has two parts:
- **Layout and fixed text** inside `<template id="dc-tpl">`.
- **Projects and data** in the `<script>` near the bottom: look for `this.data = [` (Work), `this.rows = [` (Inventory) or `this.experiments = [` (Lab). One `{ ... }` or `R(...)` block per project — copy one, edit it, commit.

Edit on github.com with the pencil icon; Hostinger deploys `main` automatically.

## Deploy

Hostinger → staging.shanymo.com → Advanced → Git → this repo, branch `main`, directory `public_html`, auto-deploy on.
Staging is hidden from search engines automatically (`.htaccess` + meta tag on `staging.` hosts).
