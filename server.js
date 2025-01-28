const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = 3001;

// Serve static files
app.use(express.static(__dirname));
app.use('/mangas', express.static(path.join(__dirname, '..', 'optiplexmom', 'MangaDownloader', 'Mangas')));

// Scan manga directory
app.get('/scan-manga', async (req, res) => {
    try {
        const mangaPath = path.join(__dirname, '..', 'optiplexmom', 'MangaDownloader', 'Mangas');
        console.log('Scanning manga directory:', mangaPath);
        
        try {
            await fs.access(mangaPath);
        } catch {
            console.error('Manga directory not found:', mangaPath);
            return res.json([]);
        }
        
        const mangas = await fs.readdir(mangaPath);
        console.log('Found manga directories:', mangas);
        
        const mangaList = await Promise.all(mangas.map(async (mangaTitle) => {
            const mangaDir = path.join(mangaPath, mangaTitle);
            const stats = await fs.stat(mangaDir);
            
            if (!stats.isDirectory()) return null;
            
            const chapters = await fs.readdir(mangaDir);
            console.log(`Files in ${mangaTitle}:`, chapters);

            // Look for any image files that might be covers
            const imageFiles = chapters.filter(file => {
                const lowerFile = file.toLowerCase();
                return lowerFile.endsWith('.jpg') || 
                       lowerFile.endsWith('.jpeg') || 
                       lowerFile.endsWith('.png') || 
                       lowerFile.endsWith('.webp');
            });
            console.log(`Image files in ${mangaTitle}:`, imageFiles);

            // First try to find an image with "cover" in the name
            let coverPath = imageFiles.find(file => 
                file.toLowerCase().includes('cover')
            );

            // If no cover found, try the first image file
            if (!coverPath && imageFiles.length > 0) {
                coverPath = imageFiles[0];
                console.log(`No cover found, using first image: ${coverPath}`);
            }

            console.log(`Cover for ${mangaTitle}:`, coverPath);

            // Extract title from cover photo name if available
            let displayTitle = mangaTitle;
            if (coverPath) {
                displayTitle = coverPath
                    .replace(/\.(jpg|jpeg|png|webp)$/i, '') // Remove file extension
                    .replace(/[_\s-]+/g, ' ') // Replace separators with spaces
                    .trim();
            }

            return {
                title: displayTitle,     // Display title from cover image
                folderName: mangaTitle,  // Original folder name for file operations
                cover: coverPath ? `/mangas/${mangaTitle}/${coverPath}` : null,
                chapters: chapters.filter(chapter => 
                    !chapter.toLowerCase().includes('cover')
                ).sort((a, b) => {
                    const numA = parseInt(a.match(/\d+/)?.[0] || '0');
                    const numB = parseInt(b.match(/\d+/)?.[0] || '0');
                    return numA - numB;
                })
            };
        }));

        res.json(mangaList.filter(manga => manga !== null));
    } catch (error) {
        console.error('Error scanning manga directory:', error);
        res.status(500).json({ error: 'Failed to scan manga directory' });
    }
});

// Get chapter pages
app.get('/manga/:title/chapter/:chapter', async (req, res) => {
    try {
        const { title, chapter } = req.params;
        const chapterPath = path.join(__dirname, '..', 'optiplexmom', 'MangaDownloader', 'Mangas', title, chapter);
        
        const files = await fs.readdir(chapterPath);
        const pages = files
            .filter(file => {
                const isImage = file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.webp');
                const hasNumber = /^\d+/.test(file);
                return isImage && hasNumber;
            })
            .sort((a, b) => {
                const numA = parseInt(a.match(/\d+/)?.[0] || '0');
                const numB = parseInt(b.match(/\d+/)?.[0] || '0');
                return numA - numB;
            })
            .map(file => `/mangas/${title}/${chapter}/${file}`);

        res.json(pages);
    } catch (error) {
        console.error('Error getting chapter pages:', error);
        res.status(500).json({ error: 'Failed to get chapter pages' });
    }
});

// Create mangas directory if it doesn't exist
(async () => {
    try {
        await fs.access(path.join(__dirname, '..', 'optiplexmom', 'MangaDownloader', 'Mangas'));
    } catch {
        console.log('Manga directory not found at specified path');
        console.log('Created mangas directory');
    }
})();

app.listen(PORT, () => {
    console.log(`Manga reader server running at http://localhost:${PORT}`);
});
