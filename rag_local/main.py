import os
os.environ["USER_AGENT"] = "hackathon-ragbot/0.1"
import requests
from bs4 import BeautifulSoup
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_community.document_loaders import WebBaseLoader
from langchain.embeddings.base import Embeddings
from typing import List
import tldextract

VISITED_FILE = "visited.txt"

# Custom Nomic Embedding Wrapper (LM Studio OpenAI-compatible)
class NomicEmbedding(Embeddings):
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        try:
            response = requests.post(
                "http://127.0.0.1:1234/v1/embeddings",
                headers={"Content-Type": "application/json"},
                json={"model": "text-embedding-nomic-embed-text-v1.5", "input": texts},
                timeout=30
            )

            
            response.raise_for_status()  # Raise an exception for bad status codes
            
            data = response.json()
            print(f"API Response status: {response.status_code}")
            print(f"Response keys: {data.keys()}")
            
            if "data" not in data:
                print(f"Unexpected response format: {data}")
                raise ValueError(f"Expected 'data' key in response, got: {list(data.keys())}")
            
            embeddings = [d["embedding"] for d in data["data"]]
            print(f"Generated {len(embeddings)} embeddings with dimension {len(embeddings[0]) if embeddings else 0}")
            return embeddings
            
        except requests.exceptions.ConnectionError:
            print("❌ Cannot connect to LM Studio at 127.0.0.1:1234")
            print("Make sure LM Studio is running with an embedding model loaded")
            raise
        except requests.exceptions.Timeout:
            print("❌ Request to LM Studio timed out")
            raise
        except Exception as e:
            print(f"❌ Error getting embeddings: {e}")
            raise

    def embed_query(self, text: str) -> List[float]:
        return self.embed_documents([text])[0]

def load_visited():
    if not os.path.exists(VISITED_FILE):
        return set()
    with open(VISITED_FILE) as f:
        return set(line.strip() for line in f.readlines())

def save_visited(url):
    with open(VISITED_FILE, 'a') as f:
        f.write(url + "\n")

def extract_links(html, base_url):
    soup = BeautifulSoup(html, "html.parser")
    links = set()
    for tag in soup.find_all("a", href=True):
        href = tag['href']
        if href.startswith("http"):
            links.add(href)
        elif href.startswith("/"):
            links.add(base_url + href)
    return links

def should_visit(url, visited, allowed_domain):
    if url in visited:
        return False
    domain = tldextract.extract(url).registered_domain
    return allowed_domain in domain

def crawl_and_store(seed_urls, max_depth=2):
    print("Crawling and storing data...")
    visited = load_visited()
    embedding = NomicEmbedding()
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)

    vectorstore = Chroma(persist_directory="./chroma_data", embedding_function=embedding)

    queue = [(url, 0) for url in seed_urls]
    allowed_domain = tldextract.extract(seed_urls[0]).registered_domain

    while queue:
        url, depth = queue.pop(0)
        if not should_visit(url, visited, allowed_domain):
            continue

        print(f"Visiting: {url}")
        try:
            loader = WebBaseLoader(url)
            docs = loader.load()
            
            if not docs:
                print(f"No documents loaded from {url}")
                continue
                
        except Exception as e:
            print(f"Failed to load {url}: {e}")
            continue

        chunks = text_splitter.split_documents(docs)
        
        # Filter out empty chunks
        valid_chunks = [chunk for chunk in chunks if chunk.page_content.strip()]
        
        if not valid_chunks:
            print(f"No valid content chunks from {url}")
            save_visited(url)
            visited.add(url)
            continue
            
        print(f"Adding {len(valid_chunks)} chunks to vectorstore...")
        try:
            vectorstore.add_documents(valid_chunks)
            print(f"✅ Successfully added {len(valid_chunks)} chunks from {url}")
        except Exception as e:
            print(f"❌ Failed to add documents to vectorstore: {e}")
            continue
            
        save_visited(url)
        visited.add(url)

        if depth < max_depth:
            try:
                res = requests.get(url)
                links = extract_links(res.text, base_url=f"{res.url.split('//')[0]}//{res.url.split('/')[2]}")
                for link in links:
                    queue.append((link, depth + 1))
            except:
                pass

    vectorstore.persist()
    print("✅ All done! Data stored in ChromaDB.")

# crawl_and_store(["https://enterprise.arcgis.com/en/portal/latest/administer/windows/configure-and-deploy-arcgis-enterprise-for-raster-analytics.htm"])
