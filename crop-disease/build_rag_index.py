import os
import re
from pypdf import PdfReader
import chromadb
from sentence_transformers import SentenceTransformer

PDF_FILES = [
    {"path": "2._chemical_mup_fungicide_as_on_31.03.2026_0.pdf", "category": "Chemical Fungicides"},
    {"path": "3._bio_pesticide_mup_biofungicide_as_on_31.03.2026.pdf", "category": "Bio Fungicides"},
    {"path": "4._herbicides_mup_as_on_31.03.2026.pdf", "category": "Herbicides"},
    {"path": "5._pgr_mup_as_on_31.03.2026.pdf", "category": "Plant Growth Regulators"},
    {"path": "6._mup_bio_insecticide_31.03.2026.pdf", "category": "Bio Insecticides"},
    {"path": "updated_mup_insecticide_as_on_31.03.2026_c.pdf", "category": "Chemical Insecticides"},
    {"path": "HORTICULTURE.pdf", "category": "TNAU Package of Practices"},
]

def clean_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 75) -> list[str]:
    words = text.split()
    chunks = []
    step = chunk_size - overlap
    for i in range(0, len(words), step):
        chunk = " ".join(words[i : i + chunk_size])
        if len(chunk.split()) > 30:
            chunks.append(chunk)
    return chunks

def build_index():
    client = chromadb.PersistentClient(path="./rag_chroma_db")
    collection = client.get_or_create_collection(
        name="agri_knowledge_base",
        metadata={"hnsw:space": "cosine"}
    )

    embedder = SentenceTransformer("all-MiniLM-L6-v2")
    doc_id = 0

    for item in PDF_FILES:
        file_path = item["path"]
        category = item["category"]
        if not os.path.exists(file_path):
            print(f"[Skip] File not found: {file_path}")
            continue

        print(f"[Processing] {file_path} ({category})...")
        reader = PdfReader(file_path)

        for page_num, page in enumerate(reader.pages):
            raw_text = page.extract_text() or ""
            cleaned = clean_text(raw_text)
            if not cleaned:
                continue

            page_chunks = chunk_text(cleaned)
            if not page_chunks:
                continue

            embeddings = embedder.encode(page_chunks, show_progress_bar=False).tolist()

            ids = [f"doc_{doc_id}_{i}" for i in range(len(page_chunks))]
            metadatas = [{
                "source": os.path.basename(file_path),
                "category": category,
                "page": page_num + 1
            } for _ in page_chunks]

            collection.add(
                ids=ids,
                documents=page_chunks,
                embeddings=embeddings,
                metadatas=metadatas
            )
            doc_id += 1

    print("[Complete] Chroma vector database populated in ./rag_chroma_db")

if __name__ == "__main__":
    build_index()