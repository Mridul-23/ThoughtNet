import re
import asyncio
import time
from api.utils.semantic_analysis import analyze_query
from api.scrapers.async_reddit import fetch_from_reddit
from api.scrapers.async_news import fetch_from_newsapi
from api.scrapers.async_hn import fetch_from_hackernews
from api.scrapers.async_ddg import fetch_from_duckduckgo
from api.utils.embeddings import embed_texts
from api.utils.clustering import cluster_embeddings
from api.utils.labeling import generate_summary
from api.graph_builder import build_graph_response

async def run_async_pipeline(query, sources=None):
    if sources is None:
        sources = ["reddit", "news", "hn", "ddg"]
    
    start_total = time.time()
    
    # 1. Semantic Analysis (Sync but fast)
    sub_queries, complexity = analyze_query(query)
    print(f"[AsyncPipeline] Sub-queries: {sub_queries}")
    
    # 2. Parallel Data Fetching
    # We want to fetch data for ALL sub-queries from ALL sources in parallel.
    tasks = []
    
    # Structure to hold results: { "sub_query": [results] }
    # We'll use a wrapper to keep track of which sub-query a result belongs to.
    
    async def fetch_wrapper(sq, src_func, src_name):
        print(f"  -> Starting fetch for '{sq}' from {src_name}")
        t0 = time.time()
        res = await src_func(sq, limit=10) # Limit 10 per source per sub-query
        print(f"  <- Finished fetch for '{sq}' from {src_name} in {time.time()-t0:.2f}s")
        return sq, res

    for sq in sub_queries:
        if "reddit" in sources:
            tasks.append(fetch_wrapper(sq, fetch_from_reddit, "Reddit"))
        if "news" in sources:
            # NewsAPI might limit QPS, so we might need a semaphore if many sub-queries
            tasks.append(fetch_wrapper(sq, fetch_from_newsapi, "NewsAPI"))
        if "hn" in sources:
            tasks.append(fetch_wrapper(sq, fetch_from_hackernews, "HN"))
        if "ddg" in sources or "web" in sources:
            tasks.append(fetch_wrapper(sq, fetch_from_duckduckgo, "DuckDuckGo"))
            
    # Execute all fetches
    params_fetch_start = time.time()
    results_flat = await asyncio.gather(*tasks, return_exceptions=True)
    print(f"[AsyncPipeline] Total Fetch Time: {time.time() - params_fetch_start:.2f}s")
    
    # Aggregation
    sq_data = {sq: [] for sq in sub_queries}
    for res in results_flat:
        if isinstance(res, Exception):
            print(f"[AsyncPipeline] Task failed with error: {res}")
            continue
        # res is (sq_key, items)
        sq_key, items = res
        
        # Relevance Filter: Filter out noise (e.g. random Chinese results or unrelated topics)
        # Simple heuristic: Item must contain at least one meaningful word from the sub-query?
        # Or just rely on clustering? 
        # The user saw "Rap" and "WeChat" for "Quantum Computing". That's unacceptable.
        
        filtered_items = []
        sq_words = set(re.findall(r'\w+', sq_key.lower()))
        # Remove stop words roughly
        stop_words = {"where", "are", "we", "in", "the", "of", "it", "is", "to", "or", "and", "a", "an", "for"}
        keywords = {w for w in sq_words if w not in stop_words and len(w) > 2}
        
        for item in items:
            content = (item.get('content') or "").lower()
            title = (item.get('title') or "").lower() # some items might have label/title
            text_to_check = content + " " + title
            
            # If we represent "Quantum Computing", and result has NONE of the keywords, drop it.
            # But if query is "Is it too far?", keywords might be "too", "far".
            # Be careful with strictness.
            if not keywords: 
                filtered_items.append(item) # Cannot filter if no keywords
                continue
                
            if any(k in text_to_check for k in keywords):
                filtered_items.append(item)
            else:
                # print(f"Filtered out irrelevant: {item.get('url')}")
                pass
                
        sq_data[sq_key].extend(filtered_items)
        
    # 3. Process Each Sub-Query (Embed -> Cluster -> Label)
    # This part is CPU bound (Embeddings), so we run it synchronously or in a thread pool executor.
    # For now, we'll keep it simple sequentially per sub-query or parallelize if needed, 
    # but embedding models often release GIL or use C++ backends so it might be okay.
    
    final_clusters = {} # { "sub_query": { "cluster_label": [items] } }
    
    for sq, items in sq_data.items():
        if not items:
            continue
            
        # Extract text for embedding
        texts = [item['content'] for item in items]
        
        # Deduplicate based on content
        unique_items = []
        seen_texts = set()
        for it in items:
            if it['content'] not in seen_texts:
                unique_items.append(it)
                seen_texts.add(it['content'])
        
        items = unique_items
        texts = [item['content'] for item in items]
        
        if not texts:
            continue

        print(f"  Processing {len(texts)} items for '{sq}'...")
        embeddings = embed_texts(texts)
        
        # Determine N clusters based on volume
        # If texts < 2, we can't do KMeans with n=2. Just put all in one cluster.
        if len(texts) < 2:
            labels = [0] * len(texts)
        else:
            n_clusters = max(2, min(len(texts) // 3, 5))
            # Safety check: n_clusters must be < len(texts) if we want valid clusters, 
            # actually KMeans works if n_clusters <= len(texts), but if equal, every point is a cluster.
            if n_clusters > len(texts):
                 n_clusters = len(texts)
                 
            labels, _ = cluster_embeddings(embeddings, method="kmeans", n_clusters=n_clusters)
        
        # Group by label
        groups = {}
        for lab, item in zip(labels, items):
            groups.setdefault(lab, []).append(item)
            
        # Generate Summaries for labels
        named_groups = {}
        for lab, group_items in groups.items():
            cluster_texts = [x['content'] for x in group_items]
            summary_label = generate_summary(cluster_texts) # Uses BART (might be slow)
            named_groups[summary_label] = group_items
            
        final_clusters[sq] = named_groups
        
    # 4. Build Graph
    graph_data = build_graph_response(query, sq_data, final_clusters)
    
    print(f"[AsyncPipeline] Total Execution: {time.time() - start_total:.2f}s")
    return graph_data
