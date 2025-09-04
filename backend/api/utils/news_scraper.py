import os
import requests
from dotenv import load_dotenv

load_dotenv()
NEWS_API_KEY = os.getenv("NEWS_API_KEY")

def fetch_from_newsapi(query="AI", page_size=10):
    url = "https://newsapi.org/v2/everything"
    params = {
        "q": query,
        "pageSize": page_size,
        "language": "en",
        "apiKey": NEWS_API_KEY,
    }
    response = requests.get(url, params=params)
    if response.status_code != 200:
        return [f"Error fetching news: {response.text}"]

    articles = response.json().get("articles", [])
    return [article["title"] for article in articles if article.get("title")]
