from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import requests
from langchain_chroma import Chroma
from langchain.embeddings.base import Embeddings
from langchain.schema import Document
from typing import List

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def read_index():
    return FileResponse('static/index.html')

class NomicEmbedding(Embeddings):
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        response = requests.post(
            "http://127.0.0.1:1234/v1/embeddings",
            headers={"Content-Type": "application/json"},
            json={"model": "text-embedding-nomic-embed-text-v1.5", "input": texts}
        )
        return [d["embedding"] for d in response.json()["data"]]

    def embed_query(self, text: str) -> List[float]:
        return self.embed_documents([text])[0]

embedding = NomicEmbedding()
vectorstore = Chroma(persist_directory="./chroma_data", embedding_function=embedding)

@app.post("/query")
async def query_rag(request: Request):
    try:
        body = await request.json()
        question = body.get("question")
        
        if not question:
            return {"error": "No question provided"}

        print(f"Received question: {question}")
        
        docs: List[Document] = vectorstore.similarity_search(question, k=4)
        context = "\n\n".join([doc.page_content for doc in docs])
        
        print(f"Found {len(docs)} relevant documents")

        payload = {
            # "model": "deepseek-r1-distill-qwen-7b",
            "model": "phi-4-mini-reasoning-mlx",
            "messages": [
                {"role": "system", "content": "Answer questions based on the given context."},
                {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {question}"}
            ],
            "temperature": 0.7,
            "max_tokens": -1,
            "stream": False
        }

        print("Sending request to LM Studio...")
        response = requests.post(
            "http://127.0.0.1:1234/v1/chat/completions",
            headers={"Content-Type": "application/json"},
            json=payload,
            timeout=60
        )
        
        if response.status_code != 200:
            print(f"LM Studio error: {response.status_code} - {response.text}")
            return {"error": f"LM Studio error: {response.status_code}"}

        result = response.json()
        answer = result['choices'][0]['message']['content']
        print(f"Generated answer length: {len(answer)} characters")
        
        return {"answer": answer}
        
    except Exception as e:
        print(f"Error in query_rag: {str(e)}")
        return {"error": f"Server error: {str(e)}"}
