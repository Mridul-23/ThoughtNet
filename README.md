# **ThoughtNet v2.0**

![Python](https://img.shields.io/badge/Python-3.10%2B-blue?style=for-the-badge\&logo=python\&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge\&logo=react\&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Research_Prototype-orange?style=for-the-badge)

---

## Semantic Idea Exploration & Thought Graphs

**ThoughtNet** is an experimental semantic exploration system designed to help users inspect how ideas around a question are distributed across real-world discourse.

Instead of relying on keyword matching, ThoughtNet attempts to:

* decompose a user’s query into meaningful sub-thoughts,
* fetch related sentences from multiple web sources,
* group them using neural embeddings,
* and present the result as an interactive graph of clustered ideas.

**Version 2.0** represents a major evolution from the initial MVP.
While v1 focused on validating an end-to-end pipeline, v2 introduces a redesigned multi-page frontend, asynchronous backend workflows, and a more flexible semantic retrieval approach. The system remains a research prototype, but it now supports a wider variety of prompts and provides better transparency into how results are formed.

---

## 🌟 Current Features (v2.0)

### 🔍 Semantic Exploration

* **Query Decomposition:** Attempts to break complex user questions into simpler semantic sub-thoughts.
* **Multi-Source Aggregation:** Asynchronously fetches related content from Reddit, Hacker News, NewsAPI, and the open web.
* **Sentence-Level Embeddings:** Uses neural sentence embeddings to group semantically related ideas rather than relying on keywords.

### 🌐 Graph-Based Visualization

* **Force-Directed Graph:** Ideas are visualized as nodes connected by semantic relationships.
* **Node Interaction:** Users can expand clusters and inspect the underlying source sentences.
* **Source Transparency:** Every cluster can be traced back to its raw evidence.

### 💾 Exploration Utilities

* **Graph Export:** Save the current graph structure as JSON.
* **Snapshot Export:** Capture a visual snapshot of the graph for reference or sharing.

---

## 📊 Accuracy & Evolution

Early versions of ThoughtNet (v1.x) relied on token-based matching and rigid prompt structures. As a result:

* many prompts failed to produce meaningful results,
* accuracy depended heavily on phrasing,
* and only a narrow class of prompts worked reliably.

In v2.0, semantic embeddings, linguistic preprocessing, and source transparency significantly improve robustness:

* a wider range of prompts now generate structured graphs,
* user intent is better preserved through sub-thought decomposition,
* and relevance can be inspected directly through exposed source sentences.

That said, accuracy is still imperfect:

* unrelated or weakly relevant content may appear,
* clustering quality varies with topic complexity,
* and deeper clause-level understanding has not yet been implemented.

v2.0 marks the point where ThoughtNet transitions from a fragile prototype into a usable exploratory system for simple to moderately complex prompts.

---

## 🧠 Architecture

ThoughtNet operates as a multi-stage pipeline:

1. **Decomposition**
   Attempts to break the input query into semantic sub-components.

2. **Aggregation**
   Asynchronous harvesting of related sentences from multiple sources.

3. **Embedding**
   Conversion of text into vector representations using neural language models.

4. **Clustering**
   Unsupervised grouping (KMeans / DBSCAN) to identify thematic clusters.

5. **Synthesis & Visualization**
   Construction of a graph where each node represents a cluster backed by transparent source evidence.

> The term *recursive* in ThoughtNet refers to iterative semantic decomposition, not recursive model execution.

---

## 🧩 Design Philosophy

ThoughtNet is guided by the following principles:

### 1. Meaning Over Keywords

The system prioritizes sentence-level semantics instead of exact token matching. Even when results are noisy, the goal is to preserve intent rather than phrasing.

### 2. Transparency Over Authority

ThoughtNet does not present answers as facts. Every cluster is backed by visible source sentences, allowing users to inspect, question, or discard conclusions themselves.

### 3. Exploration Over Optimization

Graph instability, imperfect clustering, and noisy sources are treated as signals for exploration rather than errors to hide.

### 4. Incremental Intelligence

The system evolves in layers:

* first capturing structure,
* then improving relevance,
* and later refining linguistic understanding.

This keeps the system flexible, inspectable, and debuggable as it matures.

---

## ⚠️ Current Limitations

* Mobile responsiveness is not yet configured; the UI is optimized for desktop use.
* Backend performance still falls short of the project’s long-term real-time vision.
* Graph rendering may behave unpredictably when zooming via browser controls (`Ctrl + +/-`).
* Navigation may occasionally become unresponsive after visiting the graph page and require a reload.
* Graph edges can become unstable when expanding multiple sub-thoughts simultaneously.
* There is no support for authentication or cloud-based history persistence.
* Transformer-based clause-level query extraction is not yet implemented.

---

## 🏗️ Tech Stack

| Component         | Technologies                                |
| ----------------- | ------------------------------------------- |
| **Backend**       | Python 3.10, Django REST Framework, Asyncio |
| **ML & Data**     | SentenceTransformers, scikit-learn, NumPy   |
| **Networking**    | HTTPX, AsyncPRAW                            |
| **Frontend**      | React (Vite), TailwindCSS                   |
| **Visualization** | React Force Graph                           |

---

## 📦 Installation & Setup

### Prerequisites

* Python 3.10+
* Node.js 16+

### 1. Clone Repository

```bash
git clone https://github.com/Mridul-23/ThoughtNet.git
cd ThoughtNet
```

### 2. Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in `backend/`:

```env
REDDIT_CLIENT_ID=your_id
REDDIT_CLIENT_SECRET=your_secret
NEWS_API_KEY=your_key
```

Run the backend:

```bash
python manage.py runserver
```

---

### 3. Frontend Setup

```bash
cd ui
npm install
npm run dev
```

Visit:

```
http://localhost:5173
```

---

## 🤖 AI-Assisted Development

ThoughtNet was developed using an AI-assisted coding workflow, where large language models were used as collaborative tools for:

* architectural reasoning,
* backend pipeline refactoring,
* frontend component structuring,
* and iterative design discussion.

All final design decisions, implementation, and validation were performed manually, with AI used as a development aid rather than an autonomous agent.


## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.


## ✨ Author

**Mridul Narula**
Creator & Lead Developer
