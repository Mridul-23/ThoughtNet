from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.pipeline import run_pipeline

class ThoughtNetPipelineView(APIView):
    def get(self, request):
        query = request.query_params.get("query", "AI")
        sources = request.query_params.getlist("sources") or ["reddit", "news", "hn"]
        method = request.query_params.get("method", "kmeans")

        try:
            result = run_pipeline(query=query, sources=sources, clustering_method=method)
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class WarmupPing(APIView):
    def get(self, request):
        return Response({"status": "awake"}, status=200)
