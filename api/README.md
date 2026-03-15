# API FastAPI - Documentation

## 📡 Endpoints

### 1. Health Check
Vérifie que le serveur est en ligne

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "service": "PDF Insight AI"
}
```

---

### 2. Query (Principal)
Traite une question sur un document PDF

**Endpoint:** `POST /api/query`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "pdf_text": "Contenu complet du PDF extrait...",
  "question": "Quelle est la date du document?"
}
```

**Response (200 OK):**
```json
{
  "answer": "Selon le document, la date est le 15 mars 2026.",
  "model": "openrouter/auto",
  "usage": {
    "prompt_tokens": 256,
    "completion_tokens": 45,
    "total_tokens": 301
  }
}
```

**Response (400 Bad Request):**
```json
{
  "detail": "Both pdf_text and question are required"
}
```

**Response (500 Server Error):**
```json
{
  "detail": "OpenRouter API key not configured. Set OPENROUTER_API_KEY environment variable."
}
```

---

### 3. Batch Query
Traite plusieurs questions sur un même document

**Endpoint:** `POST /api/batch-query`

**Request Body:**
```json
{
  "pdf_text": "Contenu du PDF...",
  "questions": [
    "Question 1?",
    "Question 2?",
    "Question 3?"
  ]
}
```

**Response:**
```json
{
  "results": [
    {
      "question": "Question 1?",
      "answer": "Réponse 1...",
      "model": "openrouter/auto"
    },
    {
      "question": "Question 2?",
      "answer": "Réponse 2...",
      "model": "openrouter/auto"
    },
    {
      "question": "Question 3?",
      "answer": "Réponse 3...",
      "model": "openrouter/auto"
    }
  ]
}
```

---

## 🔧 Configuration

### Variables d'Environnement

Créez un fichier `.env` dans le dossier `api/`:

```env
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxx
```

### Modèles OpenRouter Supportés

- `openrouter/auto` - Sélection automatique (recommandé)
- `gpt-3.5-turbo` - Modèle rapide et économique
- `gpt-4` - Modèle plus puissant
- `claude-3-haiku` - Alternative excellente
- Et [beaucoup d'autres](https://openrouter.ai/docs#models)

Pour utiliser un modèle spécifique, modifiez `main.py`:

```python
payload = {
    "model": "gpt-4",  # Changez ici
    ...
}
```

---

## 🚀 Démarrage Rapide

### Windows
```bash
# Terminal 1: Démarrer l'API
start.bat

# Terminal 2: Démarrer le frontend
serve.bat
```

### Windows (Manuel)
```bash
# Terminal 1
cd api
python -m pip install -r requirements.txt
set OPENROUTER_API_KEY=votre_clé
python main.py

# Terminal 2
python -m http.server 8000
```

### Linux/Mac
```bash
# Terminal 1
cd api
pip install -r requirements.txt
export OPENROUTER_API_KEY="votre_clé"
python main.py

# Terminal 2
python -m http.server 8000
```

---

## 📊 Paramètres Configurables

Dans `main.py`, vous pouvez ajuster:

```python
payload = {
    "model": "openrouter/auto",      # Modèle IA
    "temperature": 0.7,               # 0-1: moins chaotique (0) vs plus créatif (1)
    "max_tokens": 1000,               # Longueur max de la réponse
}
```

### Temperature (Température)
- **0.0** - Déterministe, réponses parfois répétitives
- **0.5** - Équilibré (défaut)
- **0.7** - Créatif mais stable (défaut)
- **1.0** - Très créatif, moins consistant

### Max Tokens (Tokens Maximum)
Définit la longueur maximale des réponses:
- **500** - Réponses courtes
- **1000** - Réponses moyennes (défaut)
- **2000** - Réponses longues

---

## 📈 Optimisation des Coûts

OpenRouter offre tarification concurrentielle:

1. **Utilisez `openrouter/auto`** - Sélection intelligente du meilleur modèle
2. **Réduisez `max_tokens`** si les réponses longues ne sont pas nécessaires
3. **Augmentez `temperature`** pour moins de tokens utilisés
4. **Filtrez le contenu PDF** avant d'envoyer (enlever les pages inutiles)

---

## 🔍 Débogage

### Activer les logs détaillés
Modifiez `main.py`:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Tester l'API avec curl
```bash
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{"pdf_text":"Votre texte","question":"Votre question"}'
```

### Interface automatique
OpenRouter génère automatiquement une documentation interactive:
```
http://localhost:8000/docs
```

---

## 🐛 Erreurs Courantes

### "OpenRouter API key not configured"
**Solution:** Créez un fichier `.env` avec votre clé API

### "HTTP 401 Unauthorized"
**Solution:** Vérifiez que votre clé API est correcte et active

### "Timeout"
**Solution:** Réduisez la taille du PDF ou augmentez le timeout

### CORS Error
**Solution:** Le frontend et backend doivent être sur differents ports. CORS est activé par défaut.

---

## 📚 Documentation OpenRouter

Pour plus d'informations:
- [OpenRouter Docs](https://openrouter.ai/docs)
- [Liste des Modèles](https://openrouter.ai/docs#models)
- [Pricing](https://openrouter.ai/docs#pricing)

---

## 🔐 Sécurité

⚠️ **IMPORTANT:**
- Ne committez JAMAIS votre fichier `.env` sur Git
- Utilisez `.gitignore` pour `.env`
- Régénérez votre clé API en cas de leak

Ajoutez à `.gitignore`:
```
.env
__pycache__/
*.pyc
```

---

## 📝 Exemple Complet (Javascript/Node)

```javascript
async function askPDF(pdfText, question) {
  const response = await fetch('http://localhost:8000/api/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pdf_text: pdfText,
      question: question
    })
  });
  
  const data = await response.json();
  console.log(data.answer);
}
```

---

**Créé avec ❤️ - PDF Insight AI**
