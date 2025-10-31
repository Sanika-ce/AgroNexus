const API_KEY = "YOUR_API_KEY";

function fetchNews() {
  const url = `https://gnews.io/api/v4/search?q=agriculture&lang=en&country=in&max=10&apikey=${API_KEY}`;
  fetch(url)
    .then(res => res.json())
    .then(data => displayNews(data.articles))
    .catch(err => {
      document.getElementById("news-container").innerHTML = "❌ Failed to load news.";
      console.error(err);
    });
}

function displayNews(articles) {
  const container = document.getElementById("news-container");
  container.innerHTML = "";

  articles.forEach(article => {
    const card = document.createElement("div");
    card.className = "news-card";

    card.innerHTML = `
      <h3><a href="${article.url}" target="_blank">${article.title}</a></h3>
      <p>${article.description}</p>
      <p class="source-name">Source: ${article.source.name}</p>
    `;
    container.appendChild(card);
  });
}
