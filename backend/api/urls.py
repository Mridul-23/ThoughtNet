from django.urls import path
from .views import thoughtnet_pipeline_view, WarmupPing

urlpatterns = [
    path("cluster/", thoughtnet_pipeline_view, name="cluster"),
    path("warmup/", WarmupPing.as_view(), name="warmup-ping"),
]
