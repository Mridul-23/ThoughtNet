import praw
import os
from dotenv import load_dotenv

load_dotenv()

def fetch_from_reddit(query, limit=10):
    """
    Fetch posts from Reddit based on a query.
    """
    if not query:
        return []

    try:
        client_id = os.getenv("REDDIT_CLIENT_ID")
        client_secret = os.getenv("REDDIT_CLIENT_SECRET")
        user_agent = os.getenv("REDDIT_USER_AGENT", "ThoughtNet/0.1")

        if not client_id or not client_secret:
            print("Warning: Reddit credentials not found.")
            return []

        reddit = praw.Reddit(
            client_id=client_id,
            client_secret=client_secret,
            user_agent=user_agent
        )
        
        # Search in 'all' for broader coverage
        subreddit = reddit.subreddit("all")
        
        results = []
        # If query is very weird, search might return nothing, but not 404.
        for submission in subreddit.search(query, limit=limit):
            # Combine title and selftext
            text = f"{submission.title} {submission.selftext}"
            results.append(text)
            
        return results
    except Exception as e:
        print(f"Error fetching from Reddit: {e}")
        return []
