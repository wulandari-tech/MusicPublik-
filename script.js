document.addEventListener("DOMContentLoaded", function () {
    const musicList = document.getElementById("musicList");

    fetch('https://anonim-wanz-production.up.railway.app/api/music')
        .then(response => response.json())
        .then(data => {
            data.forEach(music => {
                const card = document.createElement("div");
                card.classList.add("card");

                card.innerHTML = `
                    <img src="${music.cover}" alt="Cover">
                    <h2>${music.title}</h2>
                    <audio controls src="${music.url}"></audio>
                    <button onclick="deleteMusic('${music.title}')">Hapus</button>
                `;

                musicList.appendChild(card);
            });
        })
        .catch(error => console.error('Error:', error));
});

async function uploadMusic() {
    const title = document.getElementById("title").value;
    const coverFile = document.getElementById("cover").files[0];
    const musicUrl = document.getElementById("musicUrl").value;

    if (!title || !musicUrl) {
        alert("Judul dan URL lagu harus diisi!");
        return;
    }

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    try {
        const coverBase64 = coverFile ? await toBase64(coverFile) : null;

        const response = await fetch('https://anonim-wanz-production.up.railway.app/api/music', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: title,
                cover: coverBase64,
                url: musicUrl
            })
        });

        if (response.ok) {
            const result = await response.json();
            alert(result.message);
            window.location.reload();
        } else {
            const errorData = await response.json();
            alert("Error: " + errorData.message)
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat mengunggah musik.');
    }
}

async function deleteMusic(title) {
    if (!confirm(`Apakah Anda yakin ingin menghapus musik "${title}"?`)) {
        return;
    }

    try {
        const response = await fetch(`https://anonim-wanz-production.up.railway.app/api/music/${title}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            const result = await response.json();
            alert(result.message);
            window.location.reload();
        } else {
            const errorData = await response.json();
             alert("Error: " + errorData.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat menghapus musik.');
    }
}
