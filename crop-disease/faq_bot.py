import os
import json
import chromadb
from sentence_transformers import SentenceTransformer
from google import genai
from google.genai import types

CHROMA_PATH = "./rag_chroma_db"
COLLECTION_NAME = "agri_knowledge_base"

# 1. Initialize Vector Database & Local Embedder
client = chromadb.PersistentClient(path=CHROMA_PATH)
try:
    collection = client.get_collection(name=COLLECTION_NAME)
except Exception:
    collection = None
    print("[Warning] Chroma collection not found. Run build_rag_index.py first.")

embedder = SentenceTransformer("all-MiniLM-L6-v2")

# 2. Initialize Gemini Client
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "your_gemini_api_key")
ai_client = genai.Client(api_key=GEMINI_API_KEY)


def retrieve_agronomic_context(query: str, top_k: int = 3) -> list[dict]:
    """Retrieves the most relevant chunks from CIBRC/TNAU publications."""
    if collection is None:
        return []

    query_vec = embedder.encode([query]).tolist()
    results = collection.query(
        query_embeddings=query_vec,
        n_results=top_k
    )

    retrieved = []
    if results and results.get("documents"):
        docs = results["documents"][0]
        metas = results["metadatas"][0]
        distances = results.get("distances", [[0]*len(docs)])[0]
        for d, m, dist in zip(docs, metas, distances):
            retrieved.append({
                "text": d,
                "source": m.get("source", "Official Manual"),
                "category": m.get("category", "General"),
                "page": m.get("page", 1),
                "similarity_score": round(1.0 - dist, 3)
            })
    return retrieved


def ask_agri_bot(query: str, crop_hint: str = None) -> dict:
    """
    Answers farmer queries using Grounded RAG with automatic offline fallback.
    """
    expanded_query = f"{crop_hint} {query}" if crop_hint else query
    context_chunks = retrieve_agronomic_context(expanded_query, top_k=3)

    # Format retrieved context
    if context_chunks:
        context_str = "\n\n".join([
            f"[Source: {c['source']} | Page {c['page']} | Category: {c['category']}]\n{c['text']}"
            for c in context_chunks
        ])
        primary_source = f"{context_chunks[0]['source']} (Page {context_chunks[0]['page']})"
    else:
        context_str = "No specific CIBRC / TNAU manual chunk found."
        primary_source = "Agricultural Standard Practices"

    prompt = f"""
You are an expert, legal agricultural extension officer for Indian farmers.
Use the verified regulatory context below (from CIBRC and TNAU) to answer the user's question.

STRICT RULES:
1. Only recommend chemical active ingredients, dilutions, formulations, and waiting periods (PHI) explicitly verified in the context.
2. If specific waiting periods (PHI) or dosages per hectare/liter are mentioned, state them clearly.
3. Keep the answer practical, concise, and easy for a farmer to follow.

VERIFIED REGULATORY CONTEXT:
{context_str}

FARMER QUESTION:
{query}

ANSWER:
"""

    # Tier 1: Grounded Generation via Gemini
    try:
        response = ai_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config = types.GenerateContentConfig(
              temperature=0.2,
              max_output_tokens=600,
              function_calling_config=types.FunctionCallingConfig(
              mode=types.FunctionCallingMode.NONE
    )
)
        )
        return {
            "query": query,
            "answer": response.text.strip(),
            "source": primary_source,
            "mode": "grounded_rag",
            "context_used": [c["text"][:150] + "..." for c in context_chunks]
        }

    # Tier 2: Offline Fallback (Zero LLM, direct extractive chunk return)
    except Exception as e:
        print(f"[Graceful Degradation] Cloud LLM unavailable ({e}). Serving direct vector chunk.")
        if context_chunks:
            fallback_answer = (
                f"Regulatory Record found in {context_chunks[0]['source']} (Page {context_chunks[0]['page']}):\n\n"
                f"{context_chunks[0]['text']}"
            )
        else:
            fallback_answer = "Offline database query yielded no direct match. Please consult your local Krishi Vigyan Kendra (KVK)."

        return {
            "query": query,
            "answer": fallback_answer,
            "source": primary_source,
            "mode": "extractive_offline_fallback",
            "context_used": []
        }
if __name__ == "__main__":
    test_question = "What is the waiting period and chemical dose for early blight in tomato?"
    result = ask_agri_bot(query=test_question, crop_hint="Tomato")
    print("\n--- AGRI BOT RESPONSE ---")
    print(f"Source: {result['source']}")
    print(f"Mode:   {result['mode']}")
    print(f"Answer:\n{result['answer']}")