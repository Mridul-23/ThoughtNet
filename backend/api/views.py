from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
# from api.pipeline import run_pipeline # Old sync pipeline
from api.async_pipeline import run_async_pipeline
from asgiref.sync import async_to_sync

from rest_framework.decorators import api_view

@api_view(['GET'])
def thoughtnet_pipeline_view(request):
    """
    Sync Wrapper for ThoughtNet Async Pipeline.
    Uses async_to_sync to bridge DRF (Sync) and Pipeline (Async).
    """
    query = request.query_params.get("query", "AI")
    sources = request.query_params.getlist("sources") or ["reddit", "news", "hn"]

    try:
        # Wrap async call
        result = async_to_sync(run_async_pipeline)(query=query, sources=sources)
        return Response(result, status=status.HTTP_200_OK)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class WarmupPing(APIView):
    def get(self, request):
        return Response({"status": "awake"}, status=200)
