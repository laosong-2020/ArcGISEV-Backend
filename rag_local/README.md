# 🏢 ArcGIS Enterprise RAG Chatbot

A **Retrieval-Augmented Generation (RAG)** chatbot that helps users with ArcGIS Enterprise configuration, deployment, and raster analytics questions. Built with FastAPI, ChromaDB, and powered by local LM Studio models.

![Python](https://img.shields.io/badge/python-v3.10+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🎯 **Features**

- 🤖 **AI-Powered Responses**: Uses local LLMs via LM Studio for privacy and control
- 📚 **Knowledge Base**: Pre-loaded with ArcGIS Enterprise documentation
- 🎨 **Modern Web Interface**: Beautiful, responsive chatbot UI with markdown support
- 🔍 **Semantic Search**: ChromaDB vector database for relevant context retrieval
- 🚀 **All-in-One Server**: Single FastAPI server handles both frontend and API
- 💾 **Local Processing**: Everything runs locally - no cloud dependencies

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Web Browser   │◄──►│   FastAPI App    │◄──►│   LM Studio     │
│                 │    │                  │    │                 │
│  - Chat UI      │    │  - Static Files  │    │  - Chat Model   │
│  - Markdown     │    │  - RAG API       │    │  - Embeddings   │
│  - JavaScript   │    │  - CORS          │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │    ChromaDB      │
                       │                  │
                       │  - Vector Store  │
                       │  - Embeddings    │
                       │  - Documents     │
                       └──────────────────┘
```

## 📋 **Prerequisites**

### Required Software

- **Python 3.10+**
- **LM Studio** ([Download](https://lmstudio.ai/))

### Required Models in LM Studio

1. **Chat Model**: `phi-4-mini-reasoning-mlx` (or `deepseek-r1-distill-qwen-7b`)
2. **Embedding Model**: `text-embedding-nomic-embed-text-v1.5`

## 🚀 **Quick Start**

### 1. Clone & Setup

```bash
# Clone the project
git clone <repository-url>
cd rag_local

# Install dependencies
pip install -r requirements.txt
```

### 2. Setup LM Studio

1. **Download and install** [LM Studio](https://lmstudio.ai/)
2. **Load models**:
   - Chat: `phi-4-mini-reasoning-mlx`
   - Embeddings: `text-embedding-nomic-embed-text-v1.5`
3. **Start local server** on `127.0.0.1:1234`

### 3. Run the Application

```bash
# Start the server
uvicorn rag_api:app --reload --host 127.0.0.1 --port 8000

# Open your browser
open http://127.0.0.1:8000
```

## 📁 **Project Structure**

```
rag_local/
├── README.md                 # This file
├── requirements.txt          # Python dependencies
├── main.py                  # Web crawler & data ingestion
├── rag_api.py              # FastAPI server (backend + frontend)
├── visited.txt             # Crawled URLs tracking
├── static/
│   └── index.html          # Chatbot web interface
└── chroma_data/            # ChromaDB vector database
    ├── chroma.sqlite3      # SQLite database
    └── [uuid]/            # Vector embeddings
```

## 🔧 **Configuration**

### Environment Variables

```bash
# Optional: Set user agent for web crawling
export USER_AGENT="hackathon-ragbot/0.1"
```

### Model Configuration

Edit `rag_api.py` to change models:

```python
# Chat model (line 62)
"model": "phi-4-mini-reasoning-mlx"

# Embedding model (line 33)
"model": "text-embedding-nomic-embed-text-v1.5"
```

### LM Studio Settings

- **Host**: `127.0.0.1`
- **Port**: `1234`
- **Endpoints**:
  - Chat: `/v1/chat/completions`
  - Embeddings: `/v1/embeddings`

## 📚 **Usage**

### Web Interface

1. **Open browser**: Go to `http://127.0.0.1:8000`
2. **Ask questions**: Type ArcGIS Enterprise questions
3. **Get answers**: Receive AI-powered responses with context

### Example Questions

- "What is ArcGIS Enterprise?"
- "How do I configure raster analytics?"
- "What are the system requirements for deployment?"
- "How do I set up the web adaptor?"
- "How do I troubleshoot HTTPS connections?"

### API Endpoint

```bash
# Direct API call
curl -X POST http://127.0.0.1:8000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is ArcGIS Enterprise?"}'
```

## 🔄 **Data Management**

### Adding New Documentation

1. **Update URLs** in `main.py`:

   ```python
   crawl_and_store(["https://new-documentation-url.com"])
   ```

2. **Run crawler**:

   ```bash
   python main.py
   ```

3. **Restart server** to load new data

### Reset Database

```bash
# Remove existing data
rm -rf chroma_data/
rm visited.txt

# Re-run crawler
python main.py
```

## 🛠️ **Development**

### Install Development Dependencies

```bash
pip install -r requirements.txt
```

### Running in Development Mode

```bash
# Auto-reload on changes
uvicorn rag_api:app --reload --host 127.0.0.1 --port 8000
```

### Debugging

- **Backend logs**: Check terminal running uvicorn
- **Frontend logs**: Browser Console (F12)
- **API testing**: Use `/docs` endpoint for Swagger UI

## 🐛 **Troubleshooting**

### Common Issues

#### "ModuleNotFoundError: No module named 'langchain_chroma'"

```bash
pip install -U langchain-chroma
```

#### "Cannot connect to LM Studio"

- ✅ Ensure LM Studio is running
- ✅ Check models are loaded
- ✅ Verify server is on `127.0.0.1:1234`
- ✅ Test with curl:
  ```bash
  curl http://127.0.0.1:1234/v1/models
  ```

#### "405 Method Not Allowed"

- ✅ Restart FastAPI server
- ✅ Check `/docs` endpoint
- ✅ Verify CORS configuration

#### "Empty embeddings error"

- ✅ Check embedding model is loaded in LM Studio
- ✅ Verify API endpoint responds:
  ```bash
  curl http://127.0.0.1:1234/v1/embeddings \
    -H "Content-Type: application/json" \
    -d '{"model": "text-embedding-nomic-embed-text-v1.5", "input": "test"}'
  ```

#### Web interface not loading

- ✅ Ensure server is running on port 8000
- ✅ Check static files exist in `static/` directory
- ✅ Try direct URL: `http://127.0.0.1:8000/static/index.html`

## 📦 **Dependencies**

### Core Libraries

- **FastAPI**: Web framework and API server
- **langchain-chroma**: Vector database integration
- **chromadb**: Vector storage and similarity search
- **beautifulsoup4**: HTML parsing for web crawling
- **requests**: HTTP client for API calls
- **tldextract**: Domain extraction for URL filtering

### Frontend Libraries (CDN)

- **Marked.js**: Markdown rendering
- **Modern CSS**: Responsive design with animations

## 🔐 **Security & Privacy**

- ✅ **Local Processing**: All data stays on your machine
- ✅ **No Cloud APIs**: Uses local LM Studio models
- ✅ **CORS Configured**: Secure cross-origin requests
- ✅ **Input Validation**: Sanitized user inputs
- ✅ **Error Handling**: Safe error responses

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙋‍♂️ **Support**

If you encounter any issues:

1. **Check logs** in terminal and browser console
2. **Verify LM Studio** is running with correct models
3. **Test API endpoints** directly with curl
4. **Review troubleshooting** section above

## 🔮 **Future Enhancements**

- [ ] **Multi-language support**
- [ ] **Document upload interface**
- [ ] **Chat history persistence**
- [ ] **Advanced search filters**
- [ ] **Export conversation feature**
- [ ] **Model switching in UI**
- [ ] **Authentication system**
- [ ] **API rate limiting**

---

**Happy chatting with your ArcGIS Enterprise assistant! 🚀**
