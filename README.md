Jangle Adventures — Sample static site

Preview locally

- Open `index.html` in your browser (double-click or use a local server).

Quick start with PowerShell (recommended to avoid CORS issues when fetching fonts):

```powershell
# From the sample folder
python -m http.server 8000; # then open http://localhost:8000
```

What I changed
- Added Google Fonts and CSS variables in `style.css`.
- Improved hero, cards, responsive layout, and accessible nav.
- Added `blog.html` and a sample post at `posts/post-1.html`.
- Added simple SVG assets in `assets/` and a small `script.js` nav toggle.

Next steps you might want
- Replace SVG placeholders with optimized JPEG/WEBP images in `assets/`.
- Add more posts under `posts/` and link them from `blog.html`.
- Consider a static site generator (Eleventy) if you expect many posts.
