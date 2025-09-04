from django.urls import path
from .views import ThoughtNetPipelineView, WarmupPing

urlpatterns = [
    path("cluster/", ThoughtNetPipelineView.as_view(), name="cluster"),
    path("warmup/", WarmupPing.as_view(), name="warmup-ping"),
]
