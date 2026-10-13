# Magan Himanshu — research portfolio

Live website: https://hm004-prog.github.io/

Editor: https://hm004-prog.github.io/edit.html

## Edit and publish directly

1. Connect or unlock publishing in the editor.
2. Update your text, profile photo, links, background, or publications.
3. Select **Preview draft** to review your changes.
4. Select **Save and publish**. The editor saves the content to this repository and confirms when GitHub Pages has updated the public website.

No manual download, upload, or GitHub visit is required for each update. **Download backup** remains available if you want a copy of your draft.

### First connection

In GitHub, create a **fine-grained personal access token** owned by **HM004-Prog**. Choose **Only select repositories**, select **hm004-prog.github.io**, and grant **Contents: read and write**. The automatically required **Metadata: read** permission is sufficient for metadata. No workflow, administration, or other repository permission is needed.

Paste the key only into **GitHub publishing key** in your own website editor. The application verifies your owner account and the repository ID. Publishing keys are sent only to GitHub API requests, not to another backend. They are never included in content files, downloads, URLs, or logs.

Optionally choose **Remember this connection on this device** and create an editor password of at least 12 characters. The saved token is encrypted in the browser with AES-GCM and a key derived using PBKDF2-SHA-256 (600,000 iterations, a random salt, and a random IV). The password is not stored or sent to GitHub. Only ciphertext is persisted. Without this option, the token stays in memory until publishing locks or the page closes.

On later visits to the same browser, select **Unlock publishing** and enter your editor password. Publishing locks after 15 minutes without activity. You will need a new key when the existing one expires or is revoked. **Forget saved connection on this device** removes only the local encrypted connection; it does not revoke the GitHub key.

### Drafts and concurrent edits

Drafts stay in your browser until you publish them. The public site does not display another visitor's draft. **Preview draft** opens a labelled preview.

Each save checks the source content SHA and uses GitHub's conditional file update. If another session changed the content, the save stops and keeps your draft. Use **Load latest published content** to review the current version. A previous draft remains available using **Restore saved draft**.

If a network interruption makes the write result uncertain, the editor checks the resulting content hash without resubmitting the update. Use **Check save status** to continue checking. A confirmed repository save and a confirmed public deployment are reported separately.

## Publications

The editor adds, modifies, removes, and reorders publications. Choose up to five featured records to show by default. Search, topic filters, the publication dropdown, and BibTeX downloads use the edited records. Citation rankings are not fetched automatically.

## Layout and code

All website files are in this repository. Edit **index.html** and **styles.css** for layout or design changes. **editor.css** controls the editor. GitHub Pages serves the root of **main**, without a paid hosting plan or build dependencies.

**site-content.json** is the content source. The copy in **index.html** and **publications-data.js** is a fallback if content loading fails or JavaScript is disabled. **content-schema.js** maps editable fields to the page. **publisher.js** handles owner verification, conditional writes, and connection encryption. No token belongs in this repository.
