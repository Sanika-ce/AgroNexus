const API_KEY = "YOUR_API_KEY"; // Replace with your GNews API key

function fetchNews() {
  const url = `https://gnews.io/api/v4/search?q=agriculture&lang=en&country=in&max=10&apikey=${API_KEY}`;

  fetch(url)
    .then(res => res.json())
    .then(data => displayNews(data.articles))
    .catch(err => {
      console.error("Error fetching news:", err);
      document.getElementById("news-container").innerHTML = "Failed to load news.";
    });
}

function displayNews(articles) {
  const container = document.getElementById("news-container");
  container.innerHTML = "";

  if (articles.length === 0) {
    container.innerHTML = "<p>No articles found.</p>";
    return;
  }

  articles.forEach(article => {
    const newsCard = document.createElement("div");
    newsCard.style.border = "1px solid #ccc";
    newsCard.style.margin = "10px";
    newsCard.style.padding = "10px";
    newsCard.style.borderRadius = "5px";
    newsCard.innerHTML = `
      <h3><a href="${article.url}" target="_blank">${article.title}</a></h3>
      <p>${article.description}</p>
      <p><small>Source: ${article.source.name}</small></p>
    `;
    container.appendChild(newsCard);
  });
}
