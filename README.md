# **ThoughtNet**

### *Real-time idea clustering, semantic embeddings & graph visualization (MVP)*

ThoughtNet takes text (tweets, Reddit posts, articles, or any input), encodes it using sentence-transformers, clusters similar ideas, and displays them in a graph.
This is the **MVP release (v1.0)** — minimal, functional, and meant to showcase the core pipeline.

> ⚠️ **Note:** The frontend in v1.0 is intentionally very basic — far simpler than the backend. It’s only a placeholder UI to demonstrate the pipeline. A complete UI overhaul is planned for the next versions.

---

## 🚀 **Features (MVP)**

* Real-time async text fetching from APIs
* Sentence-transformer embeddings
* Basic clustering (KMeans/DBSCAN depending on size)
* Graph-ready JSON output
* Lightweight React front-end (placeholder UI)
* No database — 100% stateless MVP

---

## 🧠 **Pipeline Overview**

1. **Fetch** text from API(s)
2. **Encode** using Sentence-Transformers
3. **Cluster** into semantic groups
4. **Build graph** nodes + edges
5. **Render** interactive graph (basic UI, improvements coming)

---

## 🏗️ **Tech Stack**

**Backend:**

* Django
* SentenceTransformers
* Numpy / Scikit-learn

**Frontend:**

* React
* Lightweight graph library
* Very small MVP interface (to be redesigned in v2+)

---

## 📦 **Local Development Setup**

### **1. Clone the repo**

```bash
git clone https://github.com/<your-username>/ThoughtNet.git
cd ThoughtNet
```

---

## **2. Backend Setup (with virtual environment)**

### **Create & activate virtual environment**

```bash
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate
```

### **Install dependencies**

```bash
pip install -r requirements.txt
```

### **Run backend**

```bash
python manage.py runserver
```

---

## **3. Frontend Setup (basic MVP UI)**

```bash
cd ui
npm install
npm run dev
```

Open:

```
http://localhost:5173
```

> ⚠️ **Frontend is intentionally minimal and will be rebuilt in a future release.**

---

## 🎯 **Limitations (MVP)**

* Very basic UI
* No caching
* No database
* No heavy clustering visualization controls
* Minimal error-handling
* Purely demonstration-ready backend

---

## 📍 **Roadmap (Simplified)**

* UI redesign
* Caching (Redis)
* Better cluster labeling
* More stable graph layout
* Support for larger datasets
* Optional database integration

---

## ✨ **Author**

**Mridul Narula**
Creator of ThoughtNet
