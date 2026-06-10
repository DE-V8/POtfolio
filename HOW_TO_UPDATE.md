# 📖 How to Update Your Portfolio

> No coding needed! Just edit `content.json` and drop images in the right folder.

---

## 🎯 Quick Start — Add a New Project in 3 Steps

### Step 1 — Add your image
Put your image file in one of these folders:
- `assets/images/work/` — for "Latest Work" showcase
- `assets/images/gallery/` — for discipline-specific galleries

Accepted formats: `.jpg`, `.png`, `.webp`

### Step 2 — Edit `content.json`
Open `content.json` in any text editor (Notepad, VS Code, etc.)

Find the section for your discipline and add a new block:

```json
{
  "id": "ps-002",
  "title": "My New Photoshop Work",
  "description": "A cool photo manipulation I made",
  "image": "assets/images/gallery/my-work.jpg",
  "date": "2026-06"
}
```

> **IMPORTANT:** Make sure to add a comma after the previous item's closing `}` before adding yours!

### Step 3 — Push to GitHub
```
git add .
git commit -m "Add new Photoshop work"
git push
```
✅ Your site updates automatically in ~30 seconds!

---

## 📁 Which Section to Edit

| You want to add... | Edit this section in content.json |
|--------------------|----------------------------------|
| Photoshop / Digital Art | `works.photoshop` |
| Video Editing | `works.video` |
| 3D Art | `works.3d` |
| UI/UX Design | `works.uiux` |
| Dev / Coding Project | `works.dev` |
| Illustration / Drawing | `works.illustrations` |
| "Latest Work" (front page) | `latestWork` |

---

## ✏️ Update Your Profile

In `content.json`, find the `"owner"` section:

```json
"owner": {
  "name": "Your Actual Name Here",
  "tagline": "Creative Developer & Digital Artist",
  "bio": "Your bio here...",
  "socials": {
    "instagram": "https://instagram.com/YOUR_HANDLE",
    "twitter":   "https://twitter.com/YOUR_HANDLE",
    "github":    "https://github.com/YOUR_HANDLE",
    "linkedin":  "https://linkedin.com/in/YOUR_HANDLE"
  }
}
```

Replace the values in quotes with your actual info.

---

## 🔧 Project JSON Fields Explained

| Field | Required? | What it does |
|-------|-----------|--------------|
| `id` | ✅ Yes | Unique ID (no spaces, use dashes) |
| `title` | ✅ Yes | Name shown on the card |
| `description` | Recommended | Short text shown in card tooltip |
| `image` | Recommended | Path to your image file |
| `date` | Recommended | Format: `"2026-06"` (YYYY-MM) |
| `tags` | Optional | Array of tags: `["Photoshop", "Portrait"]` |
| `link` | Optional | External URL (GitHub, YouTube, etc.) |
| `featured` | Optional | Set `true` to pin to Latest Work |
| `category` | Auto-set | Don't touch, set automatically |

---

## 🌐 Deploy to GitHub Pages

1. Create a GitHub repo named `yourusername.github.io`
2. Push this whole folder to it
3. Go to repo Settings → Pages → Set source to `main` branch
4. Your site is live at `https://yourusername.github.io` 🎉

---

## 🐛 Troubleshooting

**Images not showing?**
- Make sure the path in `content.json` matches exactly (case-sensitive on GitHub!)
- Use forward slashes: `assets/images/gallery/work.jpg` ✅

**JSON errors?**
- Paste your `content.json` into https://jsonlint.com to check for errors
- Most common mistake: missing comma between items

**Fonts not loading?**
- You need internet connection for Google Fonts to load
