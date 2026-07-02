# CHANGELOG

Toutes les modifications notables apportées à ce projet seront documentées ici.

## [Unreleased] - 2026-07-02
### Ajouts
- Interface frontend modernisée (styles, animations, layout responsive).
- Remplacement des SVG par Font Awesome 6.5.1 pour des icônes homogènes et scalables.
- Séparation claire du code : `index.html`, `styles.css`, `script.js`.
- Backend FastAPI dans le dossier `api/` avec endpoints : `/health`, `/api/query`, `/api/batch-query`.
- Implémentation d'un algorithme local de recherche / fallback dans `script.js` (`findBestMatch`) pour éviter de dépendre d'une API externe.
- Fonction de troncature intelligente du texte PDF côté backend (`truncate_pdf_content`) pour respecter les limites de tokens.
- Endpoint batch pour traiter plusieurs questions dans une même requête (`/api/batch-query`).

### Améliorations
- Meilleure hiérarchie visuelle et palette cohérente (variables CSS dans `styles.css`).
- Support clavier (touche Entrée pour envoyer une question).
- Messages et affichage de l'historique de conversation dans l'UI (formatage, loading spinner, états vides).
- Cross-Origin Resource Sharing (CORS) activé côté FastAPI pour faciliter le développement local.
- Logs détaillés côté backend (logging level DEBUG) pour faciliter le debug.

### Correctifs
- Gestion d'erreurs améliorée lors des appels vers OpenRouter (gestion des timeouts, erreurs HTTP, format inattendu).
- Validation des entrées côté backend (400 si `pdf_text` ou `question` manquent).
- Taille maximale de fichier PDF limitée à 50 MB côté frontend (vérification avant extraction).

### Sécurité / Confidentialité
- Traitement majoritairement local du PDF (extraction côté navigateur) pour préserver la confidentialité.
- Content Security Policy (CSP) dans `index.html` pour limiter les sources autorisées.
- Recommandation : NE JAMAIS committer les fichiers `.env` contenant des clés API. `.gitignore` suggéré dans `api/README.md`.

### Dépendances
- Frontend : PDF.js (v3.11.174), Font Awesome (6.5.1)
- Backend : FastAPI, python-dotenv, requests (voir `api/requirements.txt`).

## [1.0.0] - Initial release (approx.)
- Version initiale décrite dans le README : interface d'analyse PDF locale avec frontend et backend optionnel.
- Première mise en place des fichiers principaux : `index.html`, `styles.css`, `script.js`, `api/main.py`.

---

## Instructions de mise à jour / migration

1. Mettre à jour les dépendances backend :

```bash
cd api
pip install -r requirements.txt
```

2. Configurer la clé OpenRouter (si vous utilisez l'API externe) :

```bash
# Linux / Mac
export OPENROUTER_API_KEY="votre_clé"
# Windows (PowerShell)
setx OPENROUTER_API_KEY "votre_clé"
```

3. Démarrer le backend (FastAPI) :

```bash
cd api
python main.py
```

4. Démarrer le frontend (serveur statique) :

```bash
python -m http.server 8000
# puis ouvrir http://localhost:8000
```

5. Basculer le frontend pour n'utiliser que la recherche locale (pas d'API) :
- Ouvrir `script.js` et définir `USE_AI_API = false`.

## Notes de maintenance
- Si vous changez la façon d'appeler OpenRouter (URL ou format des messages), mettez à jour `api/main.py` et la documentation dans `api/README.md`.
- Si vous modifiez la structure d'extraction du texte PDF (ex : meilleure segmentation), ajustez la fonction `findBestMatch` et le `truncate_pdf_content` pour conserver la pertinence.

---

Si vous voulez, je peux :
- ajouter ce fichier `CHANGELOG.md` directement au dépôt (je l'ai ajouté),
- créer une release GitHub et taguer `v1.0.0`,
- générer un résumé de diffusion (release notes) prêt à publier sur la page Releases.
