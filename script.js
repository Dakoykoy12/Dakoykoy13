const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsDiv = document.getElementById('results');

searchInput.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    searchManga();
  }
});

searchBtn.addEventListener('click', searchManga);

async function searchManga() {
  const searchTerm = searchInput.value.trim();
  if (searchTerm === '') {
    alert('Please enter a manga title!');
    return;
  }

  const apiUrl = `https://api.mangadex.org/manga?title=${encodeURIComponent(searchTerm)}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }
    const data = await response.json();
    displayResults(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    resultsDiv.innerHTML = 'Error fetching data. Please try again later.';
  }
}

async function displayResults(data) {
  resultsDiv.innerHTML = '';

  if (data.data.length === 0) {
    resultsDiv.innerHTML = 'No manga found.';
    return;
  }

  for (const manga of data.data) {
    const title = manga.attributes.title.en || 'Title not available';
    const description = manga.attributes.description.en || 'Description not available';
    const coverRelationship = manga.relationships.find(rel => rel.type === 'cover_art');
    const coverId = coverRelationship ? coverRelationship.id : null;

    if (coverId) {
      try {
        const coverResponse = await fetch(`https://api.mangadex.org/cover/${coverId}`);
        if (coverResponse.ok) {
          const coverData = await coverResponse.json();
          const imageUrl = coverData.data.attributes.fileName;
          const coverUrl = `https://uploads.mangadex.org/covers/${manga.id}/${imageUrl}`;

          const mangaDiv = document.createElement('div');
          mangaDiv.classList.add('manga-card');

          mangaDiv.innerHTML = `
            <h2>${title}</h2>
            <img src="${coverUrl}" alt="${title} cover">
            <p>${description}</p>
          `;

          resultsDiv.appendChild(mangaDiv);
        } else {
          throw new Error('Error fetching cover data.');
        }
      } catch (error) {
        console.error('Error fetching cover data:', error);
      }
    } else {
      console.error('Cover data not available for manga:', manga.id);
    }
  }
}
