
# Capstone Project Perempuan Inovasi GENerasi AI
### AI Full Stack Web Development 2026

**Group Name: Martha Christina Tiahahu**

Welcome to the official repository of our **Perempuan Inovasi GENerasi AI Capstone Project**.

Our team consists of four developers participating in the AI Full Stack Web Development program. Together, we developed **SYCLE**, a digital platform that integrates women's reproductive health, environmental awareness, and artificial intelligence.

---

## Our Warriors

Meet the team behind SYCLE!

| Name | Contact |
|:---:|:---:|
| Ita Rahmatiah Mustamin | [LinkedIn]() · [GitHub]() |
| Nurmalia | [LinkedIn]() · [GitHub]() |
| Revina Chitra Sagita | [LinkedIn](https://www.linkedin.com/in/revina-chitra-s-61a71893/) · [GitHub](https://github.com/vinachitra) |

---

## Our Mentors

| Mentor Name |
|:---:|
| Andiastika Intan Pratiwi Hasan |
| Jesslyn Audrey |

---

## About This Project

**SYCLE** is a digital platform designed to help Indonesian women understand the relationship between reproductive health and environmental conditions.

By integrating environmental data, health tracking, educational resources, and AI-powered insights, SYCLE aims to provide accessible, contextual, and evidence-based information to support women's health awareness.

SYCLE considers environmental factors such as temperature, humidity, UV index, and air quality as contextual information that may influence daily experiences, not as standalone medical diagnoses.

---

## Project Documentation

| Document | Link |
|:---:|:---:|
| Project Plan | [View Document]() |
| Project Brief | [View Document]() |
| YouTube Presentation | [Watch Video]() |

---

## System Architecture

SYCLE is developed as a full-stack web application with an integrated AI-powered information retrieval system.

**Main Technologies:**
- Frontend: Next.js, React.js
- Backend: Next.js Server Actions / API Routes and FastAPI
- Database & Authentication: Supabase
- AI Integration: Retrieval-Augmented Generation (RAG)
- Environment Data: BMKG, KLH/BPLH, and Open-Meteo

![SYCLE System Architecture]()

---

## Repositories


## Repositories

| Branch | Description | Link |
|:---:|:---:|:---:|
| `main` | Main branch containing the stable and integrated version of SYCLE | [View Branch](https://github.com/katanyalia/Sycle_LCH_PI/tree/main) |
| `demo-gabungan` | Development branch for ongoing development, feature integration, and testing | [View Branch](https://github.com/katanyalia/Sycle_LCH_PI/tree/demo-gabungan) |

---

## AI & RAG Documentation

SYCLE integrates a **Retrieval-Augmented Generation (RAG)** system to provide contextual, relevant, and evidence-based responses related to women's reproductive health and environmental conditions.

The RAG pipeline uses a **Hybrid Retrieval** approach, combining keyword-based and semantic search to improve the relevance of retrieved information.

### RAG Technology Stack

| Component | Technology / Method |
|:---:|:---:|
| RAG Framework | Custom RAG Pipeline |
| Embedding Model | `paraphrase-multilingual-MiniLM-L12-v2` |
| Vector Database | Supabase |
| Keyword Retrieval | BM25 |
| Semantic Retrieval | Vector Similarity Search |
| Retrieval Strategy | Hybrid Retrieval |
| Result Fusion | Reciprocal Rank Fusion (RRF) |

### Hybrid Retrieval Process

1. **BM25 Retrieval:** Finds relevant evidence based on keyword matching.
2. **Vector Similarity Search:** Retrieves semantically relevant evidence using embedding similarity.
3. **Reciprocal Rank Fusion (RRF):** Combines and ranks the results from both retrieval methods.
4. **Context Generation:** Provides the retrieved evidence as context for the AI to generate responses.

This hybrid approach helps SYCLE retrieve relevant information through both exact keyword matching and semantic understanding.

---

## Datasets & Data Sources

SYCLE uses environmental and educational data sources to provide contextual information.

| Data Source | Purpose |
|:---:|:---:|
| BMKG | Weather and environmental information |
| KLH/BPLH | Air Quality Index (ISPU) information |
| Open-Meteo | Environmental data fallback, including UV index |
| Evidence Documents | Reproductive health education and supporting references |

---

## UI/UX Design

| Design & Prototype | Link |
|:---:|:---:|
| UI/UX Design (Figma) | [View Design]() |
| Product Prototype | [View Prototype]() |
| Deployed Application | [Open SYCLE](https://sycle-eta.vercel.app) |

---

## Deployment

SYCLE is developed as a Progressive Web Application (PWA), allowing users to access the platform through supported web browsers and install it on compatible mobile devices.

**Application Link:** [Open SYCLE](https://sycle-eta.vercel.app)