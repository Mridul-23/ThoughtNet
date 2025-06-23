import requests
import os

BEARER_TOKEN = os.getenv("TWITTER_BEARER_TOKEN")

def fetch_from_twitter(query="AI", max_results=10):
    headers = {
        "Authorization": f"Bearer {BEARER_TOKEN}"
    }
    params = {
        "query": query,
        "max_results": max_results,
        "tweet.fields": "text",
    }
    url = "https://api.twitter.com/2/tweets/search/recent"
    response = requests.get(url, headers=headers, params=params)

    if response.status_code != 200:
        return [f"Error fetching tweets: {response.text}"]

    tweets = response.json().get("data", [])
    return [tweet["text"] for tweet in tweets]
