from api.utils.reddit_scraper import fetch_from_reddit
from api.utils.news_scraper import fetch_from_newsapi
from api.utils.hackernews import fetch_from_hackernews
from api.utils.embeddings import embed_texts
from api.utils.clustering import cluster_embeddings
from api.utils.labeling import label_cluster
from api.utils.clustering import evaluate_clusters


def run_pipeline(query="AI", sources=None, clustering_method="kmeans"):
    if sources is None:
        sources = ["reddit", "news", "hn"]

    texts = []

    if "reddit" in sources:
        texts.extend(fetch_from_reddit("machinelearning", limit=10))
    if "news" in sources:
        texts.extend(fetch_from_newsapi(query, page_size=10))
    if "hn" in sources:
        texts.extend(fetch_from_hackernews(limit=10))

    if not texts:
        return {"error": "No data fetched."}

    embeddings = embed_texts(texts)
    labels, cluster_metrics = cluster_embeddings(embeddings, method=clustering_method)
    metrics = evaluate_clusters(embeddings, labels)


    clusters = {}
    cluster_labels = {}

    for cluster_id, text in zip(labels, texts):
        clusters.setdefault(str(cluster_id), []).append(text)


    for cid, c_texts in clusters.items():
        cluster_labels[cid] = label_cluster(c_texts)

    return {
        "query": query,
        "sources": sources,
        "texts": texts,
        "labels": labels,
        "metrics": {**metrics, **cluster_metrics},
    }
