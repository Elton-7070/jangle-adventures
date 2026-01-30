Deploy & Customization — Jangle Adventures Sample

Preview locally

- Open `index.html` in your browser (double-click) or serve with a local HTTP server.

Quick start with PowerShell:

```powershell
cd 'c:\Users\Rolyne Jasmine\Desktop\Company stuff\jangle adventures\sample'
python -m http.server 8000;
# then open http://localhost:8000 in your browser
```

Recommended deploy options

- GitHub Pages:
  1. Create a GitHub repository and push this folder as the repository root.
  2. In repo Settings → Pages, choose the branch and folder (root or `/docs`).
  3. GitHub will publish to `https://<username>.github.io/<repo>/`.

- Netlify:
  - Drag & drop the site folder to Netlify Drop (no build step) or connect the Git repo for CI.
  - For static HTML there is no build command; set publish directory to the repo root.

- Vercel:
  - Connect the repo in Vercel dashboard or use `vercel` CLI. Vercel auto-detects static sites.

- Traditional hosting / FTP:
  - Upload the folder contents to your host's `public_html` or equivalent document root.

Image optimization and responsive images

- Replace the SVG placeholders in `assets/` with optimized photos (WEBP/JPEG). Use `srcset` to serve different sizes:

```html
<img src="assets/hero-800.jpg"
     srcset="assets/hero-400.jpg 400w, assets/hero-800.jpg 800w, assets/hero-1600.jpg 1600w"
     sizes="(max-width: 600px) 100vw, 1200px"
     alt="Scenic view of Uganda"
     loading="lazy">
```

- Windows/ImageMagick example to generate resized variants:

```powershell
# Install ImageMagick then run (PowerShell):
magick convert input.jpg -resize 1600x900 -quality 82 assets/hero-1600.jpg
magick convert input.jpg -resize 800x450 -quality 80 assets/hero-800.jpg
magick convert input.jpg -resize 400x225 -quality 75 assets/hero-400.jpg
magick convert input.jpg -quality 80 assets/hero-800.webp
```

Customizing the site

- Colors & fonts: edit CSS variables at the top of `style.css` (`--accent`, `--text`, `--bg`).
- Add more blog posts: copy `posts/post-1.html`, update the fields and link the new file from `blog.html`.
- Replace SVG placeholders in `assets/` with real photos; update `index.html`/`blog.html` image references.

SEO & accessibility quick checklist

- Ensure each page has a unique `<meta name="description">`.
- Add meaningful `alt` text for all images.
- Validate semantic markup and landmarks (`<main>`, `<article>`, `<nav>`).
- Run Lighthouse in Chrome DevTools for performance, accessibility, and SEO suggestions.

If you want automation or scaling

- Use a static site generator (Eleventy, Hugo) to manage many posts and templates. Eleventy quick start:

```powershell
# Requires Node.js/npm
npm init -y
npm i @11ty/eleventy --save-dev
npx eleventy --serve
```

Next steps I can take for you

- Swap SVG placeholders for optimized JPEG/WEBP photos and add `srcset` variants.
- Scaffold Eleventy templates and a small build step for easier content management.
- Add a Netlify-friendly contact form and a simple privacy notice.

Tell me which next step you want and I will implement it.
