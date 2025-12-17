import asyncpraw
import os
from dotenv import load_dotenv

load_dotenv()

async def fetch_from_reddit(query, limit=10):
    """
    Async fetch from Reddit using AsyncPRAW.
    """
    client_id = os.getenv("REDDIT_CLIENT_ID")
    client_secret = os.getenv("REDDIT_CLIENT_SECRET")
    user_agent = os.getenv("REDDIT_USER_AGENT", "ThoughtNet/0.2 Async")

    if not client_id or not client_secret:
        print("Warning: Reddit credentials not found.")
        return []

    if not query:
        return []

    try:
        reddit = asyncpraw.Reddit(
            client_id=client_id,
            client_secret=client_secret,
            user_agent=user_agent
        )
        
        results = []
        subreddit = await reddit.subreddit("all")
        
        # Async iterator
        async for submission in subreddit.search(query, limit=limit):
            title = submission.title
            selftext = submission.selftext[:500] # Truncate body
            url = submission.url
            permalink = f"https://reddit.com{submission.permalink}"
            
            text = f"{title} {selftext}"
            results.append({
                "content": text,
                "source": "Reddit",
                "url": permalink, # Prefer comment thread link over direct link for "Discussion" context
                "meta": {
                    "score": submission.score,
                    "subreddit": submission.subreddit.display_name
                }
            })
        
        await reddit.close()
        return results

    except Exception as e:
        print(f"Error fetching from Reddit (Async): {e}")
        return []
