from sklearn.cluster import KMeans, AgglomerativeClustering, DBSCAN, SpectralClustering, MeanShift
from hdbscan import HDBSCAN
from sklearn.metrics import silhouette_score, davies_bouldin_score, calinski_harabasz_score
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

def evaluate_clusters(embeddings, labels):
    # Convert numpy array → list
    if isinstance(labels, np.ndarray):
        labels = labels.tolist()

    # Ensure labels are flat (int list)
    if labels and isinstance(labels[0], (list, tuple)):
        labels = [lbl[0] for lbl in labels]

    # Handle empty or single cluster cases
    if not labels or len(set(labels)) <= 1:
        return {
            "silhouette": None,
            "davies_bouldin": None,
            "calinski_harabasz": None,
        }

    return {
        "silhouette": float(silhouette_score(embeddings, labels)),
        "davies_bouldin": float(davies_bouldin_score(embeddings, labels)),
        "calinski_harabasz": float(calinski_harabasz_score(embeddings, labels)),
    }


def cluster_embeddings(embeddings, method="kmeans", **kwargs):
    if not embeddings:
        return [], None

    if method == "kmeans":
        n_clusters = kwargs.get("n_clusters", 3)
        clusterer = KMeans(n_clusters=n_clusters, random_state=42)
        labels = clusterer.fit_predict(embeddings)

    elif method == "hdbscan":
        min_cluster_size = kwargs.get("min_cluster_size", 2)
        clusterer = HDBSCAN(min_cluster_size=min_cluster_size)
        labels = clusterer.fit_predict(embeddings)

    elif method == "agglomerative":
        n_clusters = kwargs.get("n_clusters", 3)
        clusterer = AgglomerativeClustering(n_clusters=n_clusters)
        labels = clusterer.fit_predict(embeddings)

    elif method == "dbscan":
        eps = kwargs.get("eps", 1.2)
        min_samples = kwargs.get("min_samples", 2)
        clusterer = DBSCAN(eps=eps, min_samples=min_samples)
        labels = clusterer.fit_predict(embeddings)

    elif method == "spectral":
        n_clusters = kwargs.get("n_clusters", 3)
        sim_matrix = cosine_similarity(embeddings)
        clusterer = SpectralClustering(n_clusters=n_clusters, affinity="precomputed", random_state=42)
        labels = clusterer.fit_predict(sim_matrix)

    elif method == "meanshift":
        clusterer = MeanShift()
        labels = clusterer.fit_predict(embeddings)

    else:
        raise ValueError(f"Unsupported clustering method: {method}")

    metrics = evaluate_clusters(embeddings, labels)
    return labels.tolist(), metrics

