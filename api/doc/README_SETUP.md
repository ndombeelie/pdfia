# PDF Insight AI - Assistant d'Analyse de Documents IA

Une application web intelligente pour poser des questions sur vos documents PDF avec réponses alimentées par une véritable IA.

## 🚀 Caractéristiques

- **Upload de PDF** - Glissez-déposez ou sélectionnez vos fichiers PDF
- **IA Réelle** - Intégration OpenRouter pour une compréhension naturelle
- **Recherche Intelligente** - Deux modes: IA (recommandé) ou recherche locale
- **Interface Moderne** - Design responsive et élégant
- **Pas de Données Stockées** - Tout reste local or traité en temps réel

## 📋 Prérequis

- Node.js / Navigateur Web moderne
- Python 3.8+
- Clé API OpenRouter (gratuite avec crédits)

## 🔧 Installation

### 1. Obtenir une Clé API OpenRouter

1. Allez sur [openrouter.ai](https://openrouter.ai)
2. Créez un compte gratuit
3. Allez dans **Keys** et créez une nouvelle clé API
4. Copiez la clé API

### 2. Configuration du Backend (API FastAPI)

```bash
# Allez dans le dossier api
cd api

# Créez un fichier .env
# Sous Windows (PowerShell):
$env:OPENROUTER_API_KEY="votre_clé_api_ici"

# Ou créez un fichier .env:
echo "OPENROUTER_API_KEY=votre_clé_api_ici" > .env

# Installez les dépendances
pip install -r requirements.txt

# Lancez le serveur FastAPI
python main.py
```

Le serveur sera disponible sur `http://localhost:8000`

### 3. Lancer l'Application Frontend

Deux options:

**Option A: Avec Python (simple)**
```bash
cd ..
python -m http.server 3000
```

**Option B: Avec Visual Studio Code**
- Installer l'extension "Live Server"
- Clic droit sur index.html → "Open with Live Server"

**Option C: Avec Node.js**
```bash
npx http-server
```

L'app sera disponible sur `http://localhost:3000` (ou le port affiché)

## 📖 Utilisation

1. Ouvrez l'application dans votre navigateur
2. Chargez un PDF (glissez-déposez ou cliquez)
3. Posez une question sur le contenu du PDF
4. Recevez une réponse alimentée par l'IA OpenRouter

## 🔄 Modes de Fonctionnement

### Mode IA (Recommandé)
- Utilise OpenRouter pour une vraie compréhension naturelle
- Lectures plus juste et contextuelles
- Coûts minimaux grâce aux tarifs d'OpenRouter

### Mode Recherche Locale (Fallback)
- Recherche basée sur des mots-clés
- Aucun appel API externe
- Pas aussi précis mais toujours fonctionnel

Pour basculer ou toggler entre les modes, modifiez dans `script.js`:
```javascript
const USE_AI_API = true;  // true = IA, false = Recherche locale
```

## 📊 Structure du Projet

```
pdfia/
├── index.html          # Interface HTML
├── script.js           # Logique frontend + API calls
├── styles.css          # Design CSS
├── README.md           # Cette file
└── api/
    ├── main.py         # Backend FastAPI
    ├── requirements.txt # Dépendances Python
    └── .env.example    # Modèle de configuration
```

## 🔑 Variables d'Environnement

### Backend (.env)
- `OPENROUTER_API_KEY` - Votre clé API OpenRouter

## 📡 API Endpoints

### POST /api/query
Traite une question sur un document PDF

**Request:**
```json
{
  "pdf_text": "Contenu complet du PDF",
  "question": "Votre question"
}
```

**Response:**
```json
{
  "answer": "La réponse de l'IA",
  "model": "openrouter/auto",
  "usage": {
    "prompt_tokens": 100,
    "completion_tokens": 50
  }
}
```

### POST /api/batch-query
Traite plusieurs questions à la fois

**Request:**
```json
{
  "pdf_text": "Contenu du PDF",
  "questions": ["Question 1", "Question 2", "Question 3"]
}
```

### GET /health
Vérifica la santé du serveur

## 🐛 Dépannage

### "Impossible de contacter l'API"
- Vérifiez que le serveur FastAPI est en cours d'exécution
- Vérifiez que l'URL est correcte dans `script.js` (par défaut `http://localhost:8000`)

### "OpenRouter API key not configured"
- Créez un fichier `.env` dans le dossier `api/`
- Ajoutez votre clé: `OPENROUTER_API_KEY=sk-...`

### "Error communicating with OpenRouter API"
- Vérifiez votre connexion Internet
- Vérifiez que votre clé API est valide
- Vérifiez que vous avez des crédits sur OpenRouter

### Le PDF ne se charge pas
- Vérifiez que c'est un PDF valide
- Vérifiez la taille (max 50 MB)

## 💡 Conseils

- **Questions spécifiques** - Des questions plus précises = meilleures réponses
- **Mots-clés** - Utiliser les termes qui apparaissent dans le document
- **PDFs structurés** - Les PDFs text-based fonctionnent mieux que les images

## 🤝 Contributions

Les contributions sont bienvenues! N'hésitez pas à créer des issues ou des pull requests.

## 📄 Licence

MIT - Libre d'utilisation

## 🎯 Feuille de Route Futures

- [ ] Support de plusieurs langues
- [ ] Interface de gestion de crédits OpenRouter
- [ ] Historique persistant des conversations
- [ ] Export des réponses (PDF, Word)
- [ ] Support des images dans les PDFs
- [ ] Synthèse automatique de documents
- [ ] Dashboard d'analytics

---

**Créé avec ❤️ - PDF Insight AI**
