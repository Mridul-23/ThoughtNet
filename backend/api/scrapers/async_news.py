import httpx
import os
from dotenv import load_dotenv

load_dotenv()

async def fetch_from_newsapi(query, page_size=10):
    """
    Async fetch from NewsAPI.
    """
    api_key = os.getenv("NEWS_API_KEY")
    if not api_key:
        print("Warning: NewsAPI Key not found.")
        return []

    if not query:
        return []

    url = "https://newsapi.org/v2/everything"
    params = {
        "q": query,
        "apiKey": api_key,
        "language": "en",
        "sortBy": "relevancy",
        "pageSize": page_size,
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, params=params, timeout=5.0)
            if response.status_code != 200:
                print(f"NewsAPI failed: {response.status_code} - {response.text}")
                return []
            
            data = response.json()
            articles = data.get("articles", [])
            results = []

            for art in articles:
                title = art.get("title")
                description = art.get("description") or ""
                url = art.get("url")
                
                if title:
                    # Combine title + desc for better embeddings, but keep separate for display if needed
                    text = f"{title}. {description}"
                    results.append({
                        "content": text,
                        "source": "NewsAPI",
                        "url": url,
                        "meta": {
                            "source_name": art.get("source", {}).get("name"),
                            "publishedAt": art.get("publishedAt")
                        }
                    })
            
            return results

        except Exception as e:
            print(f"Error fetching from NewsAPI (Async): {e}")
            return []
