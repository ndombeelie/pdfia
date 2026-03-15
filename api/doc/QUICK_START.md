# 🚀 Configuration Rapide - PDF Insight AI avec OpenRouter

## ⚡ Démarrage en 5 Minutes

### Étape 1: Obtenir une Clé API OpenRouter (2 min)

1. **Accédez** https://openrouter.ai
2. **Créez un compte** (gratuit avec crédits gratuits)
3. **Allez dans** Settings → Keys
4. **Créez une nouvelle clé** et copiez-la

### Étape 2: Configuration (1 min)

**Sur Windows:**
```bash
# Double-cliquez sur start.bat
# Il vous demandera votre clé API
# La clé sera sauvegardée automatiquement
```

**Manuellement:**
1. Ouvrez le dossier `api/`
2. Créez un fichier nommé `.env`
3. Ajoutez cette ligne:
```
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxx
```
4. Sauvegardez

### Étape 3: Lancer l'Application (2 min)

**Option A: Automatique (Plus facile)**
1. Double-cliquez `start.bat` (démarre l'API)
2. Double-cliquez `serve.bat` dans une autre fenêtre
3. Ouvrez http://localhost:8000 dans votre navigateur

**Option B: Terminal (Manuel)**
```powershell
# Terminal 1 - Lancer l'API
cd api
pip install -r requirements.txt
python main.py

# Terminal 2 - Lancer le Frontend
python -m http.server 8000
```

### Étape 4: Utiliser l'Application (1 min)

1. Chargez un PDF (glissez-déposez ou cliquez)
2. Posez une question
3. Recevez une réponse IA!

---

## ✅ Vérification du Statut

### L'API fonctionne?
Ouvrez http://localhost:8000/health

Vous devriez voir:
```json
{
  "status": "ok",
  "service": "PDF Insight AI"
}
```

### Documentation interactive
http://localhost:8000/docs

---

## 🔧 Configuration Avancée

### Utiliser un Modèle IA Différent

Éditez `api/main.py`, trouvez cette ligne:
```python
"model": "openrouter/auto",
```

Et remplacez par:
- `"gpt-4"` - Plus puissant
- `"gpt-3.5-turbo"` - Plus rapide et moins cher
- `"claude-3-haiku"` - Très bon compromis

### Ajuster la Qualité/Vitesse

Toujours dans `api/main.py`:
```python
"temperature": 0.7,      # 0.0 = déterministe, 1.0 = créatif
"max_tokens": 1000,      # Longueur max de la réponse
```

### Basculer entre Mode IA et Recherche Locale

Éditez `script.js`:
```javascript
const USE_AI_API = true;   // true = IA, false = Recherche locale
```

---

## 🆘 Problèmes Courants

### "Impossible de contacter l'API"
✅ **Solution:** Vérifiez que l'API est lancée
```bash
cd api && python main.py
```

### "OpenRouter API key not configured"
✅ **Solution:** Créez/vérifiez le fichier `.env`:
```bash
# Vérifiez qu'il existe
dir api\.env

# Si absent, créez-le avec votre clé:
echo "OPENROUTER_API_KEY=sk-or-v1-xxx" > api\.env
```

### "401 Unauthorized"
✅ **Solution:** Votre clé API est invalide
- Régénérez une nouvelle clé sur OpenRouter
- Mettez à jour `.env`

### "Navigateur refuse la connexion"
✅ **Solution:** Vérifiez les ports
- L'API doit être sur `localhost:8000`
- Le frontend doit être sur `localhost:8000` ou un autre port

---

## 💡 Tips & Tricks

### Télécharger un PDF Contenant Beaucoup de Texte?
- Augmentez `max_tokens` pour des réponses plus longues
- Réduisez la `temperature` pour des réponses plus précises

### Question Spécifique?
- Utilisez des mots-clés exact qui apparaissent dans le PDF
- Soyez concis et précis

### PDF Pas Très Clair?
- Réduisez `temperature` à 0.5
- Utilisez le mode recherche locale (`USE_AI_API = false`)

### Réduire les Coûts?
- OpenRouter est très bon marché
- Utilisez `"gpt-3.5-turbo"` au lieu de `"gpt-4"`
- Réduisez `max_tokens` si les réponses courtes suffisent

---

## 📞 Support

**Documentation complète:** Voir `api/README.md` et `README_SETUP.md`

**Questions sur OpenRouter?** https://openrouter.ai/docs

---

**Bon à savoir:**
- Les PDFs de 50 MB max
- Pas de stockage de données (tout est traité en temps réel)
- Les credits gratuits OpenRouter suffisent pour essayer
- Vous pouvez ajouter des cartes de paiement pour plus de crédits

---

**Amusez-vous! 🎉**
