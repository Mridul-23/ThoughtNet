
import re

try:
    import spacy
    try:
        nlp = spacy.load("en_core_web_sm")
    except OSError:
        # Try to download if not present, but if it fails, fallback
        try:
            from spacy.cli import download
            download("en_core_web_sm")
            nlp = spacy.load("en_core_web_sm")
        except Exception as e:
            print(f"Warning: Could not load spacy model: {e}. Using fallback.")
            nlp = None
except ImportError:
    print("Warning: Spacy not installed. Using fallback.")
    nlp = None

def calculate_complexity(query):
    """
    Calculate a complexity score (3-7) for the query.
    """
    score = 3
    
    # Length factor
    words = query.split()
    if len(words) > 10:
        score += 1
    if len(words) > 20:
        score += 1
        
    # Sub-clause factor (if we can detect them)
    if nlp:
        doc = nlp(query)
        # Count verbs/clauses
        verbs = [t for t in doc if t.pos_ == "VERB"]
        if len(verbs) > 2:
            score += 1
        
        # Entities
        ents = doc.ents
        if len(ents) > 2:
            score += 1
            
    return min(score, 7)

def analyze_query(query):
    """
    Analyzes the input query and breaks it down into sub-sentences or clauses.
    Returns a list of sub-queries and a complexity score.
    """
    complexity = calculate_complexity(query)
    sub_queries = []
    
    if nlp:
        try:
            doc = nlp(query)
            
            # 1. Split by '?' first to handle multiple sentence questions.
            # E.g. "Question 1? Question 2?"
            # We use regex to split but keep the '?'
            initial_parts = re.split(r'(\?+)', query)
            sentences = []
            current = ""
            for p in initial_parts:
                if '?' in p:
                    current += p
                    sentences.append(current.strip())
                    current = ""
                else:
                    current += p
            if current.strip():
                sentences.append(current.strip())
            
            final_sub_queries = []
            
            for sent_text in sentences:
                if not sent_text: continue
                sent_doc = nlp(sent_text)

                # 2. Textual Split by Conjunctions for robustness
                # We split by "and", "or", "but"
                parts = re.split(r'(?i)(?:,?\s+and\s+|,?\s+or\s+|,?\s+but\s+)', sent_text)
                clean_parts = [p.strip() for p in parts if p.strip()]
                
                current_subj = None
                
                for i, part in enumerate(clean_parts):
                    p_doc = nlp(part)
                    
                    # Detect Subject
                    subjs = [t.text for t in p_doc if t.dep_ in ("nsubj", "nsubjpass", "expl")]
                    has_subj = len(subjs) > 0
                    
                    # Detect Verb/Aux (to confirm it's a clause)
                    has_verb = any(t.pos_ in ("VERB", "AUX") for t in p_doc)

                    if has_subj:
                        current_subj = subjs[0] 
                        final_sub_queries.append(part)
                    else:
                        # Missing subject.
                        if current_subj:
                             # Reconstruct context
                             # If we have a verb but no subject, prepend subject.
                             if has_verb:
                                 final_sub_queries.append(f"{current_subj} {part}")
                             else:
                                 # No verb either? E.g. "Is AGI upcoming or false?" -> "false"
                                 # Prepend subject
                                 final_sub_queries.append(f"{current_subj} {part}")
                        else:
                             # No previous subject. Keep as is.
                             final_sub_queries.append(part)

            sub_queries = final_sub_queries if final_sub_queries else [query]
            return sub_queries, complexity
            
        except Exception as e:
            print(f"Error in spacy analysis: {e}. Falling back to regex.")

    # Fallback: Regex based splitting
    parts = re.split(r',| and | or | but |;', query, flags=re.IGNORECASE)
    parts = [p.strip() for p in parts if p.strip()]
    
    sub_queries = parts if parts else [query]
    return sub_queries, complexity
