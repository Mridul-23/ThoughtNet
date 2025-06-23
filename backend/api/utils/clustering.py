from sklearn.cluster import KMeans
from hdbscan import HDBSCAN

def cluster_embeddings(embeddings, method="kmeans", **kwargs):
    if method == "kmeans":
        n_clusters = kwargs.get("n_clusters", 3)
        kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        labels = kmeans.fit_predict(embeddings)
        return labels.tolist()

    elif method == "hdbscan":
        min_cluster_size = kwargs.get("min_cluster_size", 2)
        clusterer = HDBSCAN(min_cluster_size=min_cluster_size)
        labels = clusterer.fit_predict(embeddings)
        return labels.tolist()

    else:
        raise ValueError(f"Unsupported clustering method: {method}")
