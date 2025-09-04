import requests

def fetch_from_hackernews(limit=10):
    url = "https://hacker-news.firebaseio.com/v0/topstories.json"
    ids = requests.get(url).json()[:limit]
    posts = []

    for i in ids:
        item_url = f"https://hacker-news.firebaseio.com/v0/item/{i}.json"
        item = requests.get(item_url).json()
        if item and "title" in item:
            posts.append(item["title"])
    return posts
