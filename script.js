// Manga data structure
let currentManga = null;
let currentChapter = null;
let chapters = [];
let pages = [];

// Function to scan the manga directory
async function scanMangaDirectory() {
    try {
        const response = await fetch('/scan-manga');
        const mangas = await response.json();
        console.log('Scanned mangas:', mangas);
        displayMangaGrid(mangas);
    } catch (error) {
        console.error('Error scanning manga directory:', error);
    }
}

// Function to display manga grid
function displayMangaGrid(mangas) {
    const grid = document.getElementById('mangaGrid');
    grid.innerHTML = '';

    mangas.forEach(manga => {
        const card = document.createElement('div');
        card.className = 'manga-card';
        card.innerHTML = `
            <img class="manga-cover" src="${manga.cover || '#'}" alt="${manga.title}">
            <div class="manga-info">
                <h3 class="manga-title">${manga.title}</h3>
                <div class="manga-chapters">${manga.chapters.length} Chapters</div>
            </div>
        `;
        card.onclick = () => openManga(manga);
        grid.appendChild(card);
    });
}

// Function to open manga reader
function openManga(manga) {
    currentManga = manga;
    console.log('Opening manga:', manga);
    document.getElementById('home').style.display = 'none';
    document.getElementById('reader').classList.add('active');
    loadChapters(manga);
}

// Function to load chapters
function loadChapters(manga) {
    const select = document.getElementById('chapterSelect');
    select.innerHTML = '';
    
    manga.chapters.forEach((chapter, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = chapter;
        select.appendChild(option);
    });

    select.onchange = () => loadChapter(select.value);
    
    loadChapter(0);
}

// Function to load chapter
async function loadChapter(chapterIndex) {
    currentChapter = chapterIndex;
    
    try {
        const chapterPath = currentManga.chapters[chapterIndex];
        console.log('Loading chapter:', {
            title: currentManga.title,
            chapter: chapterPath,
            url: `/manga/${currentManga.title}/chapter/${chapterPath}`
        });
        
        const response = await fetch(`/manga/${currentManga.title}/chapter/${chapterPath}`);
        pages = await response.json();
        console.log('Loaded pages:', pages);
        displayPages();
    } catch (error) {
        console.error('Error loading chapter:', error);
    }
}

// Function to display all pages
function displayPages() {
    const container = document.getElementById('pages');
    container.innerHTML = '';
    
    pages.forEach((page, index) => {
        const img = document.createElement('img');
        img.src = page;
        img.alt = `Page ${index + 1}`;
        img.className = 'page-img';
        container.appendChild(img);
    });

    // Scroll to top when loading new chapter
    window.scrollTo(0, 0);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Back button event listener
    document.getElementById('backButton').onclick = (e) => {
        e.preventDefault();
        document.getElementById('home').style.display = 'block';
        document.getElementById('reader').classList.remove('active');
    };

    // Chapter navigation buttons
    document.getElementById('prevChapter').onclick = () => {
        if (currentChapter > 0) {
            loadChapter(currentChapter - 1);
            document.getElementById('chapterSelect').value = currentChapter - 1;
        }
    };

    document.getElementById('nextChapter').onclick = () => {
        if (currentChapter < currentManga.chapters.length - 1) {
            loadChapter(currentChapter + 1);
            document.getElementById('chapterSelect').value = currentChapter + 1;
        }
    };

    // Scroll direction detection
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
        const readerControls = document.querySelector('.reader-controls');
        if (!readerControls || !document.getElementById('reader').classList.contains('active')) return;

        const currentScrollY = window.scrollY;
        const isScrollingUp = currentScrollY < lastScrollY;
        
        if (isScrollingUp || currentScrollY < 50) {
            readerControls.classList.add('visible');
        } else {
            readerControls.classList.remove('visible');
        }
        
        lastScrollY = currentScrollY;
    });

    // Update chapter navigation buttons
    function updateChapterNavButtons() {
        const prevButton = document.getElementById('prevChapter');
        const nextButton = document.getElementById('nextChapter');
        
        prevButton.disabled = currentChapter === 0;
        nextButton.disabled = currentChapter === currentManga.chapters.length - 1;
    }

    // Add to loadChapter function
    const originalLoadChapter = loadChapter;
    loadChapter = async (chapterIndex) => {
        await originalLoadChapter(chapterIndex);
        updateChapterNavButtons();
    };

    // Initialize
    scanMangaDirectory();
});
