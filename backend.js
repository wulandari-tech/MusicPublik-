const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

const MUSIC_DATA_FILE = 'music.json';

function readMusicData() {
    try {
        const data = fs.readFileSync(MUSIC_DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        if (err.code === 'ENOENT') {
            fs.writeFileSync(MUSIC_DATA_FILE, '[]', 'utf8');
            return [];
        }
        console.error("Error reading music data:", err);
        return [];
    }
}

function writeMusicData(data) {
    try {
        fs.writeFileSync(MUSIC_DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error("Error writing music data:", err);
    }
}

app.get('/api/music', (req, res) => {
    const musicList = readMusicData();
    res.json(musicList);
});

app.post('/api/music', (req, res) => {
    const { title, cover, url } = req.body;

    if (!title || !url || !cover) {
        return res.status(400).json({ message: 'Judul, cover (Base64), dan URL lagu harus diisi!' });
    }

    const newMusic = { title, cover, url };
    const musicList = readMusicData();
    musicList.push(newMusic);
    writeMusicData(musicList);

    res.status(201).json({ message: 'Musik berhasil diunggah!', data: newMusic });
});

app.delete('/api/music/:title', (req, res) => {
    const titleToDelete = req.params.title;
    let musicList = readMusicData();
    const initialLength = musicList.length;

    musicList = musicList.filter(music => music.title !== titleToDelete);

    if (musicList.length < initialLength) {
        writeMusicData(musicList);
        res.json({ message: `Musik dengan judul "${titleToDelete}" berhasil dihapus.` });
    } else {
        res.status(404).json({ message: `Musik dengan judul "${titleToDelete}" tidak ditemukan.` });
    }
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
