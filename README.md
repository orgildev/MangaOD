# Local Manga Reader

A clean web-based manga reader

## Setup

1. Install Node.js
2. Install dependencies:
```bash
npm install
```

3. Create your manga directory structure:
```
manga-reader/
  └── mangas/
      └── Manga Title/
          ├── cover.jpg (or cover.png, cover.webp)
          └── Chapter 1/
              ├── 01.jpg
              ├── 02.jpg
              └── ...
```

Example:
```
manga-reader/
  └── mangas/
      └── One Piece/
          ├── cover.webp
          └── Chapter 1/
              ├── 01.jpg
              ├── 02.jpg
              └── 03.jpg
```

## Usage

1. Start the server:
```bash
npm start
```

2. Open your browser and visit:
```
http://localhost:3001
```

3. Click on any manga to start reading
4. Use the navigation controls to:
   - Switch between chapters using the dropdown
   - Navigate pages using Previous/Next buttons
   - Close the reader using the Close button

## Features

- Clean, modern interface inspired by popular manga sites
- Responsive grid layout for manga titles
- Full-screen reader with easy navigation
- Automatic chapter sorting
- Support for JPG and PNG images
- WebP support for cover images
- Dark theme for comfortable reading
