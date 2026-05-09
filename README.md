# 🎬 FreeFlix — Vintage Movie Streaming

A vintage-inspired, pastel-themed movie and TV streaming website built with pure HTML, CSS, and vanilla JavaScript. Fast-loading, responsive, and beautifully designed.

![FreeFlix](https://img.shields.io/badge/FreeFlix-Vintage%20Stream-E8A87C?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## ✨ Features

- **🎞️ Browse Movies & TV Shows** — Trending, popular, and top-rated content
- **🔍 Search** — Real-time multi-search across movies and TV shows
- **📺 Stream** — Embedded video player powered by VidSrc API
- **🎭 Genre Filtering** — Filter content by genre
- **📱 Fully Responsive** — Works on desktop, tablet, and mobile
- **⚡ Fast Loading** — Zero frameworks, pure vanilla stack
- **🎨 Vintage Pastel Design** — Warm cream tones, serif typography, film grain overlay

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Structure | HTML5 |
| Styling | Vanilla CSS |
| Logic | Vanilla JavaScript |
| Movie Data | TMDB API |
| Streaming | VidSrc API |
| Fonts | Google Fonts (Playfair Display, Lora) |

## 🚀 Getting Started

1. **Clone the repo**
   ```bash
   git clone https://github.com/YOUR_USERNAME/freeflix.git
   cd freeflix
   ```

2. **Serve locally** (any static server works)
   ```bash
   # Python
   python -m http.server 3000

   # Node.js
   npx serve . -l 3000
   ```

3. **Open** `http://localhost:3000` in your browser

## 📁 Project Structure

```
freeflix/
├── index.html    # Main HTML structure
├── style.css     # Complete styling with vintage pastel theme
├── app.js        # All application logic & API integration
└── README.md     # This file
```

## 🎨 Design

- **Color Palette**: Warm cream (`#FDF6EC`), peach (`#E8A87C`), dusty rose (`#D4A5A5`), powder blue (`#95B8D1`), sage (`#C9CBA3`)
- **Typography**: Playfair Display (headings) + Lora (body)
- **Effects**: Film grain overlay, skeleton loading, smooth scroll animations, hover transitions

## 📝 API Reference

### TMDB API
Used for fetching movie/TV metadata, posters, and backdrops.
- [TMDB API Docs](https://developer.themoviedb.org/docs)

### VidSrc API
Used for embedding video streams.
- Movie: `https://vidsrc.mov/embed/movie/{tmdb_id}`
- TV: `https://vidsrc.mov/embed/tv/{tmdb_id}/{season}/{episode}`

## ⚠️ Disclaimer

This project is for **educational purposes only**. It does not host, store, or distribute any media content. All video streams are provided by third-party APIs. Use responsibly and respect copyright laws.

## 📄 License

MIT License — feel free to fork and customize!
