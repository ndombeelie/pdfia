from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv
import json
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = FastAPI(title="PDF Insight AI - Backend", version="1.0.0")

# Enable CORS FIRST (before other middleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

# Models
class QueryRequest(BaseModel):
    pdf_text: str
    question: str

class QueryResponse(BaseModel):
    answer: str
    model: str
    usage: dict

# Helper function to truncate large PDF content
def truncate_pdf_content(pdf_text: str, question: str, max_chars: int = 8000) -> str:
    """
    Intelligently truncate PDF content to fit within token limits.
    Prioritizes sections containing keywords from the question.
    """
    if len(pdf_text) <= max_chars:
        return pdf_text
    
    logger.info(f"⚠️  PDF text truncated from {len(pdf_text)} to {max_chars} characters")
    
    # Extract keywords from question
    keywords = [word.lower() for word in question.split() if len(word) > 3]
    
    # Find paragraphs containing keywords
    paragraphs = pdf_text.split('\n\n')
    relevant_paragraphs = []
    
    for para in paragraphs:
        if any(keyword in para.lower() for keyword in keywords):
            relevant_paragraphs.append(para)
    
    # If relevant paragraphs found, use them; otherwise use first part
    if relevant_paragraphs:
        content = '\n\n'.join(relevant_paragraphs)[:max_chars]
    else:
        content = pdf_text[:max_chars]
    
    # Add context note
    content += "\n\n[Note: Document truncated for processing]"
    return content

# Health check
@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok", "service": "PDF Insight AI"}

# Main query endpoint
@app.post("/api/query", response_model=QueryResponse)
async def process_query(request: QueryRequest):
    """
    Process a question against PDF content using OpenRouter API
    """
    
    logger.info(f"🔵 Received query request")
    logger.info(f"API Key configured: {bool(OPENROUTER_API_KEY)}")
    logger.info(f"PDF text length: {len(request.pdf_text)}")
    logger.info(f"Question: {request.question}")
    
    if not OPENROUTER_API_KEY:
        logger.error("❌ API key not configured!")
        raise HTTPException(
            status_code=500,
            detail="OpenRouter API key not configured. Set OPENROUTER_API_KEY environment variable."
        )
    
    if not request.pdf_text or not request.question:
        raise HTTPException(
            status_code=400,
            detail="Both pdf_text and question are required"
        )
    
    # Truncate PDF if necessary
    pdf_content = truncate_pdf_content(request.pdf_text, request.question)
    
    # Prepare the prompt
    system_prompt = """Tu es un assistant spécialisé dans l'analyse de documents PDF.
Tu dois répondre aux questions de l'utilisateur en te basant UNIQUEMENT sur le contenu du document fourni.
Si l'information n'est pas présente dans le document, dis-le clairement.
Sois concis, précis et directement pertinent à la question posée.
Formatage préféré: Utilise un langage clair et professionnel."""

    user_message = f"""Document PDF à analyser:
---
{pdf_content}
---

Question: {request.question}

Répondez basé uniquement sur le contenu du document."""

    try:
        # Call OpenRouter API
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "PDF Insight AI",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "openai/gpt-4o-mini",  # Fast, affordable model
            "messages": [
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": user_message
                }
            ],
            "temperature": 0.7,
            "max_tokens": 1000,
        }
        
        response = requests.post(
            OPENROUTER_API_URL,
            headers=headers,
            json=payload,
            timeout=30
        )
        
        if response.status_code != 200:
            error_detail = response.text
            logger.error(f"❌ OpenRouter API error (HTTP {response.status_code}): {error_detail}")
            raise HTTPException(
                status_code=response.status_code,
                detail=f"OpenRouter API error: {error_detail}"
            )
        
        data = response.json()
        
        # Extract the answer
        answer = data["choices"][0]["message"]["content"]
        model = data.get("model", "unknown")
        usage = data.get("usage", {})
        
        return QueryResponse(
            answer=answer,
            model=model,
            usage=usage
        )
        
    except requests.exceptions.Timeout:
        raise HTTPException(
            status_code=504,
            detail="OpenRouter API request timed out. Please try again."
        )
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error communicating with OpenRouter API: {str(e)}"
        )
    except KeyError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected response format from OpenRouter API: {str(e)}"
        )

# Batch query endpoint (for analyzing multiple questions)
class BatchQueryRequest(BaseModel):
    pdf_text: str
    questions: list[str]

class BatchQueryResponse(BaseModel):
    results: list[dict]

@app.post("/api/batch-query", response_model=BatchQueryResponse)
async def batch_query(request: BatchQueryRequest):
    """
    Process multiple questions against PDF content
    """
    
    if not OPENROUTER_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="OpenRouter API key not configured"
        )
    
    if not request.pdf_text or not request.questions:
        raise HTTPException(
            status_code=400,
            detail="Both pdf_text and questions are required"
        )
    
    results = []
    
    for question in request.questions:
        try:
            query_req = QueryRequest(pdf_text=request.pdf_text, question=question)
            response = await process_query(query_req)
            results.append({
                "question": question,
                "answer": response.answer,
                "model": response.model
            })
        except HTTPException as e:
            results.append({
                "question": question,
                "answer": f"Error: {e.detail}",
                "model": "error"
            })
    
    return BatchQueryResponse(results=results)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

