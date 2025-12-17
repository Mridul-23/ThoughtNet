from transformers import pipeline

# Initialize the summarization pipeline
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

def generate_summary(texts):
    """
    Generate a summary for a cluster based on its texts.
    """
    if not texts:
        return "Misc"

    # Combine texts into a single string
    combined_text = " ".join(texts)
    
    # Truncate if too long (BART limit is usually 1024 tokens)
    if len(combined_text) > 3000:
        combined_text = combined_text[:3000]

    try:
        summary = summarizer(combined_text, max_length=50, min_length=10, do_sample=False)
        return summary[0]['summary_text']
    except Exception as e:
        print(f"Summarization failed: {e}")
        return "Cluster Summary"

def label_cluster(texts, top_n=2):
    """
    Legacy function wrapper for backward compatibility if needed, 
    or we can just use generate_summary.
    """
    return generate_summary(texts)
