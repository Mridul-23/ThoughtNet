from duckduckgo_search import DDGS
import asyncio

async def fetch_from_duckduckgo(query, limit=10):
    """
    Async fetch from DuckDuckGo using duckduckgo_search library.
    This searches the open web, returning relevant links (Reddit, News, Blogs, etc).
    """
    if not query:
        return []
    
    results = []
    try:
        # DDGS is synchronous but fast enough, or we can run in executor?
        # The library uses httpx async internally but exposes sync API mostly in current version?
        # Checking docs: DDGS().text() is sync iterator? 
        # Wait, the latest version might support async or we just wrap it.
        # Actually, let's wrap it in to_thread to be safe for async pipeline.
        
        def _search():
            return list(DDGS().text(query, region='us-en', max_results=limit))
        
        # Run in thread pool
        ddg_results = await asyncio.to_thread(_search)
        
        for r in ddg_results:
            title = r.get('title', '')
            link = r.get('href', '')
            body = r.get('body', '')
            
            # Construct result object
            results.append({
                "content": f"{title}: {body}",
                "source": "Web Search (DDG)",
                "url": link,
                "meta": {
                    "source_name": "DuckDuckGo",
                }
            })
            
        return results

    except Exception as e:
        print(f"Error fetching from DDG: {e}")
        return []
