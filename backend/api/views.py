from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .utils.embeddings import embed_texts
from .utils.clustering import cluster_embeddings
from .utils.twitter_scraper import fetch_from_twitter
from .utils.reddit_scraper import fetch_from_reddit

class FetchData(APIView):
    def get(self, request):
        twitter_data = fetch_from_twitter(query="AI", max_results=10)
        reddit_data = fetch_from_reddit(subreddit="machinelearning", limit=10)
        combined = twitter_data + reddit_data
        return Response({"data": combined}, status=200)

class EmbedData(APIView):
    def post(self, request):
        texts = request.data.get("texts", [])
        if not texts:
            return Response({"error": "No texts provided"}, status=400)
        embeddings = embed_texts(texts)
        return Response({"embeddings": embeddings}, status=200)

class ClusterData(APIView):
    def post(self, request):
        embeddings = request.data.get("embeddings", [])
        method = request.data.get("method", "kmeans")
        options = request.data.get("options", {})
        if not embeddings:
            return Response({"error": "No embeddings provided"}, status=400)

        try:
            labels = cluster_embeddings(embeddings, method=method, **options)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)

        return Response({"labels": labels}, status=200)

class WarmupPing(APIView):
    def get(self, request):
        return Response({"status": "awake"}, status=200)
