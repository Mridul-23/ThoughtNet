from keybert import KeyBERT

kw_model = KeyBERT("all-MiniLM-L6-v2")

def label_cluster(texts, top_n=2):
    """
    Generate a short label for a cluster based on its texts.
    """
    if not texts:
        return "Misc"

    keywords = kw_model.extract_keywords(
        " ".join(texts), 
        keyphrase_ngram_range=(1, 2),
        stop_words="english",
        top_n=top_n
    )
    # keywords = [("AI research", 0.72), ...]
    label = ", ".join([kw for kw, _ in keywords])
    return label.title() if label else "Misc"
