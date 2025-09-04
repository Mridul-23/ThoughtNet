import os
import praw
from dotenv import load_dotenv

load_dotenv()

reddit = praw.Reddit(
    client_id=os.getenv("REDDIT_CLIENT_ID"),
    client_secret=os.getenv("REDDIT_CLIENT_SECRET"),
    user_agent=os.getenv("REDDIT_USER_AGENT", "thoughtnet-scraper")
)

def fetch_from_reddit(subreddit="machinelearning", limit=10):
    posts = []
    for submission in reddit.subreddit(subreddit).hot(limit=limit):
        if not submission.stickied:
            posts.append(submission.title)
    return posts
