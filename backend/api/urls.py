from django.urls import path
from .views import FetchData, EmbedData, ClusterData, WarmupPing

urlpatterns = [
    path("fetch/", FetchData.as_view()),
    path("embed/", EmbedData.as_view()),
    path("cluster/", ClusterData.as_view()),
    path("warmup/", WarmupPing.as_view()),
]
