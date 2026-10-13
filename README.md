# Magan Himanshu — research portfolio

Live website: https://hm004-prog.github.io/

## Edit independently

Open https://hm004-prog.github.io/edit.html whenever you want to update your text, profile photo, links, background, or publications. No coding is required for these content changes.

1. Edit the fields. Drafts are saved in the browser you are using.
2. Select **Preview draft** to review your changes. This does not change the public website.
3. Select **Download changes**. Keep the exact filename **site-content.json** (remove any `(1)` suffix your browser adds).
4. Select **GitHub upload**, sign in as **HM004-Prog**, and upload that content file to the repository root on the **main** branch. This replaces the existing content file.
5. Select **Commit changes**. GitHub Pages automatically publishes the update. Allow a few minutes and refresh the live website.

Only an account with write access to this repository can publish changes. The public editor cannot write to GitHub and requires no access token. An uploaded profile photo is included in the downloaded content file, so you only need to upload one file.

For a draft made on another device, use **Import an earlier downloaded content file** in the editor. To revert a published change, use this repository's commit history to restore an earlier version of **site-content.json**.

## Publications

The editor can add, modify, remove, and reorder publications. Select up to five featured records to display by default. The website's dropdown, search, topic filters, and BibTeX downloads use the edited records. Citation counts and Google Scholar rankings are not fetched automatically.

## Layout and code

You own all website files in this repository. For changes to the layout or design, edit **index.html** and **styles.css** using GitHub's file editor or your preferred code editor. **editor.css** controls the content editor. GitHub Pages serves the root of the **main** branch, with no paid hosting plan or build dependencies.

**site-content.json** is the current content source. The original copy in **index.html** is a fallback if loading the content file fails or JavaScript is disabled. **publications-data.js** contains fallback publication data. **content-schema.js** defines the editable fields and their locations in the page.
