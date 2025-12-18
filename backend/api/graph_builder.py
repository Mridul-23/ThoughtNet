import uuid

def build_graph_response(query, sub_queries_data, clusters):
    """
    Constructs a hierarchical graph for the frontend.
    
    Structure:
    - Root Node (Original Query)
      - Sub-Query Nodes (Broad Categories)
        - Cluster Nodes (Specific Topics)
          - Leaf Nodes (Evidence/Articles)
    
    If no sub-queries (simple query), Root -> Cluster -> Leaves.
    """
    
    nodes = []
    edges = []
    
    # 1. Root Node
    root_id = "root"
    nodes.append({
        "id": root_id,
        "label": query,
        "type": "root",
        "size": 30
    })
    
    # Track existing nodes to avoid dupes if any
    seen_nodes = set([root_id])

    # If we have distinct sub-queries, create nodes for them.
    # If sub-queries list just contains the original query, skip this layer.
    
    # We need to map which data belongs to which sub-query.
    # The 'sub_queries_data' input is expected to be a dict: { "SubQuery String": [List of results] }
    # 'clusters' is expected to be: { "SubQuery String": { "cluster_label": [Items] } }
    
    for sq, cluster_map in clusters.items():
        # Check if SQ is significantly different from Root
        is_root_alias = (sq.lower().strip() == query.lower().strip())
        
        if is_root_alias:
            sq_node_id = root_id
        else:
            sq_node_id = f"sq_{abs(hash(sq))}"
            if sq_node_id not in seen_nodes:
                nodes.append({
                    "id": sq_node_id,
                    "label": sq,
                    "type": "sub_topic",
                    "size": 20
                })
                edges.append({
                    "source": root_id,
                    "target": sq_node_id
                })
                seen_nodes.add(sq_node_id)
        
        # Now add Clusters for this Sub-Query
        for c_label, items in cluster_map.items():
            cluster_id = f"cl_{uuid.uuid4().hex[:8]}"
            
            # Cluster Node (Thought Cloud)
            nodes.append({
                "id": cluster_id,
                "label": c_label, # Summary of the thought
                "type": "thought_cloud",
                "size": 15
            })
            
            edges.append({
                "source": sq_node_id,
                "target": cluster_id
            })
            
            # Add Leaves (Evidence)
            # Limit leaves per cluster to avoid graph explosion
            for i, item in enumerate(items[:5]): 
                leaf_id = f"leaf_{uuid.uuid4().hex[:8]}"
                nodes.append({
                    "id": leaf_id,
                    "label": item['content'][:50] + "...", # Truncate for label
                    "full_text": item['content'],
                    "url": item.get('url'),
                    "source": item.get('source'),
                    "type": "evidence",
                    "size": 10
                })
                edges.append({
                    "source": cluster_id,
                    "target": leaf_id
                })

    return {
        "root_id": root_id,
        "nodes": nodes,
        "edges": edges
    }
