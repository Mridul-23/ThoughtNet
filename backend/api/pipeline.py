from api.utils.reddit_scraper import fetch_from_reddit
from api.utils.news_scraper import fetch_from_newsapi
from api.utils.hackernews import fetch_from_hackernews
from api.utils.embeddings import embed_texts
from api.utils.clustering import cluster_embeddings, evaluate_clusters
from api.utils.labeling import label_cluster
from api.utils.semantic_analysis import analyze_query
import time


def run_pipeline(query="AI", sources=None, clustering_method="kmeans"):
    if sources is None:
        sources = ["reddit", "news", "hn"]

    # 1. Semantic Analysis
    start_time = time.time()
    sub_queries, complexity = analyze_query(query)
    print(f"Sub-queries: {sub_queries}, Complexity: {complexity}")
    print(f"[TIMING] Semantic Analysis took: {time.time() - start_time:.2f}s")

    all_texts = []

    # 2. Fetch data for each sub-query
    fetch_start_time = time.time()
    for sub_q in sub_queries:
        sub_fetch_start = time.time()
        print(f"Fetching for sub-query: {sub_q}")
        texts = []
        if "reddit" in sources:
            t0 = time.time()
            texts.extend(fetch_from_reddit(sub_q, limit=10))
            print(f"  [TIMING] Reddit fetch for '{sub_q}' took: {time.time() - t0:.2f}s")
        if "news" in sources:
            t0 = time.time()
            texts.extend(fetch_from_newsapi(sub_q, page_size=10))
            print(f"  [TIMING] NewsAPI fetch for '{sub_q}' took: {time.time() - t0:.2f}s")
        if "hn" in sources:
            t0 = time.time()
            texts.extend(fetch_from_hackernews(limit=10)) # HN search might not support complex queries well
            print(f"  [TIMING] HN fetch for '{sub_q}' took: {time.time() - t0:.2f}s")
        
        all_texts.extend(texts)
        print(f"[TIMING] Total fetch for sub-query '{sub_q}' took: {time.time() - sub_fetch_start:.2f}s")
    
    print(f"[TIMING] Total Data Fetching took: {time.time() - fetch_start_time:.2f}s")

    if not all_texts:
        return {"error": "No data fetched."}

    # Remove duplicates
    all_texts = list(set(all_texts))

    # 3. Embed and Cluster
    embed_start = time.time()
    embeddings = embed_texts(all_texts)
    print(f"[TIMING] Embedding {len(all_texts)} texts took: {time.time() - embed_start:.2f}s")
    
    # Dynamic clustering based on complexity if method is kmeans
    if clustering_method == "kmeans":
        # Ensure we don't ask for more clusters than samples
        n_clusters = min(complexity, len(all_texts))
        labels, cluster_metrics = cluster_embeddings(embeddings, method=clustering_method, n_clusters=n_clusters)
    else:
        labels, cluster_metrics = cluster_embeddings(embeddings, method=clustering_method)
        
    metrics = evaluate_clusters(embeddings, labels)


    clusters = {}
    cluster_labels = {}

    for cluster_id, text in zip(labels, all_texts):
        clusters.setdefault(str(cluster_id), []).append(text)


    for cid, c_texts in clusters.items():
        cluster_labels[cid] = label_cluster(c_texts)

    return {
        "query": query,
        "sub_queries": sub_queries,
        "sources": sources,
        "texts": all_texts,
        "labels": labels,
        "metrics": {**metrics, **cluster_metrics},
        "cluster_labels": cluster_labels
    }
