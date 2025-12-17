import httpx
import asyncio

async def fetch_item(client, item_id):
    try:
        response = await client.get(f"https://hacker-news.firebaseio.com/v0/item/{item_id}.json", timeout=3.0)
        return response.json()
    except:
        return None

async def fetch_from_hackernews(query, limit=10):
    """
    Async fetch from HackerNews using Algolia Search API for querying,
    then retrieving details if necessary (though Algolia returns most info).
    """
    if not query:
        return []

    # Using Algolia API is much faster/better for search than iterating IDs
    url = f"http://hn.algolia.com/api/v1/search?query={query}&tags=story&hitsPerPage={limit}"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, timeout=5.0)
            if response.status_code != 200:
                print(f"HN Search failed: {response.status_code}")
                return []
            
            data = response.json()
            results = []
            
            for hit in data.get("hits", []):
                title = hit.get("title", "")
                url = hit.get("url", "")
                # We return a dict to preserve source metadata for the Graph
                if title:
                    results.append({
                        "content": title,
                        "source": "HackerNews",
                        "url": url if url else f"https://news.ycombinator.com/item?id={hit.get('objectID')}",
                        "meta": hit
                    })
            
            return results

        except Exception as e:
            print(f"Error fetching from HN (Async): {e}")
            return []
