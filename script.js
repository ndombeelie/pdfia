// Configuration de PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// === CONFIGURATION ===
const API_BASE_URL = "http://127.0.0.1:8000";
const USE_AI_API = true;  // Set to false to use local search instead of AI API

// === STATE ===
let fullTextContent = "";
let isProcessing = false;

// === DOM ELEMENTS ===
const fileInput = document.getElementById('file-input');
const dropZone = document.getElementById('drop-zone');
const statusBar = document.getElementById('status-bar');
const chatUI = document.getElementById('chat-ui');
const askBtn = document.getElementById('ask-btn');
const userQuery = document.getElementById('user-query');
const chatHistory = document.getElementById('chat-history');
const loader = document.getElementById('loader');

// === EVENT LISTENERS ===

// File input
fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

// Drag and drop
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    handleFile(e.dataTransfer.files[0]);
});

// Chat submit
askBtn.addEventListener('click', performSearch);
userQuery.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !isProcessing) {
        performSearch();
    }
});

// === FILE HANDLING ===

/**
 * Handle file upload and PDF extraction
 */
async function handleFile(file) {
    if (!file || file.type !== 'application/pdf') {
        showNotification('❌ Erreur', 'Veuillez sélectionner un fichier PDF valide.', 'danger');
        return;
    }

    if (file.size > 50 * 1024 * 1024) {
        showNotification('⚠️ Avertissement', 'Le fichier est trop volumineux (max. 50 MB).', 'warning');
        return;
    }

    try {
        // Reset UI
        fullTextContent = "";
        askBtn.disabled = true;
        showLoadingState(true);

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        
        let extractedText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const strings = content.items.map(item => item.str);
            extractedText += strings.join(" ") + "\n";
        }

        fullTextContent = extractedText;
        
        // Update UI
        dropZone.style.display = 'none';
        statusBar.style.display = 'flex';
        chatUI.style.display = 'flex';
        
        // Reset chat history
        resetChatHistory();
        
        // Show success notification
        setTimeout(() => {
            showLoadingState(false);
            askBtn.disabled = false;
            showNotification('✅ Succès', 'PDF chargé avec succès! Vous pouvez maintenant poser des questions.', 'success');
        }, 500);
        
    } catch (error) {
        console.error("Erreur lors de la lecture du PDF:", error);
        showLoadingState(false);
        askBtn.disabled = false;
        showNotification('❌ Erreur', 'Erreur lors de l\'extraction du texte du PDF.', 'danger');
    }
}

// === CHAT FUNCTIONALITY ===

/**
 * Perform search on the PDF content using AI API or local search
 */
async function performSearch() {
    const query = userQuery.value.trim();
    if (!query || isProcessing) return;

    isProcessing = true;
    askBtn.disabled = true;
    loader.style.display = 'block';

    try {
        let answer;
        
        if (USE_AI_API) {
            // Use AI API (OpenRouter)
            answer = await queryAIAPI(query, fullTextContent);
        } else {
            // Use local search (fallback)
            answer = findBestMatch(query, fullTextContent);
        }
        
        displayMessage(query, answer);
    } catch (error) {
        console.error("Error during search:", error);
        const errorMsg = `⚠️ Erreur: ${error.message}`;
        displayMessage(query, errorMsg);
    } finally {
        loader.style.display = 'none';
        askBtn.disabled = false;
        isProcessing = false;
        userQuery.value = "";
        userQuery.focus();
    }
}

/**
 * Query the AI API (OpenRouter) via FastAPI backend
 */
async function queryAIAPI(question, pdfText) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pdf_text: pdfText,
                question: question
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData.detail || `HTTP ${response.status}`;
            throw new Error(errorMsg);
        }

        const data = await response.json();
        
        // Format the response with model info
        return `🤖 <strong>Réponse IA (${data.model}):</strong>\n\n${data.answer}`;
        
    } catch (error) {
        console.error("API Error:", error);
        throw new Error(`Impossible de contacter l'API: ${error.message}. Vérifiez que le serveur FastAPI est en cours d'exécution sur ${API_BASE_URL}`);
    }
}

/**
 * Find best matching paragraphs from PDF content using advanced scoring
 */
function findBestMatch(query, text) {
    // Split text into sentences
    const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
    
    // Extract significant words from query (excluding stop words)
    const stopWords = new Set(['le', 'la', 'les', 'de', 'du', 'et', 'est', 'un', 'une', 'des', 'qui', 'que', 'ou', 'dans', 'pour', 'par', 'avec', 'sur']);
    const queryWords = query.toLowerCase()
        .split(/\W+/)
        .filter(w => w.length > 2 && !stopWords.has(w));
    
    if (queryWords.length === 0) {
        return "Veuillez être plus précis dans votre question. Utilisez au moins un mot clé.";
    }

    // Score all sentences
    const scoredSentences = sentences.map(sentence => {
        let score = 0;
        const sentenceLower = sentence.toLowerCase();
        
        queryWords.forEach(word => {
            const occurrences = (sentenceLower.match(new RegExp(word, 'g')) || []).length;
            score += occurrences * 10; // Base score for each occurrence
            
            // Bonus for sentences containing multiple query words
            if (sentenceLower.includes(word)) {
                score += 5;
            }
        });
        
        // Bonus for longer, more informative sentences
        if (sentence.trim().length > 50) {
            score += 3;
        }
        
        return { text: sentence.trim(), score };
    }).filter(item => item.score > 0);

    if (scoredSentences.length === 0) {
        return "Désolé, je n'ai pas trouvé d'information pertinente dans le document pour répondre à cette question spécifique. Essayez avec d'autres mots-clés.";
    }

    // Sort by score (highest first)
    scoredSentences.sort((a, b) => b.score - a.score);

    // Take top 3-5 relevant sentences for summary
    const topSentences = scoredSentences.slice(0, Math.min(5, scoredSentences.length));
    const summary = generateSummary(topSentences);
    
    return summary;
}

/**
 * Generate a formatted summary from relevant sentences
 */
function generateSummary(sentenceObjects) {
    if (sentenceObjects.length === 0) {
        return "Aucune information trouvée.";
    }

    const sentences = sentenceObjects.map(obj => obj.text);
    
    // Combine sentences into a coherent summary
    let summaryText = sentences.join(" ");
    
    // Truncate if too long
    //   const maxLength = 500;
    const maxLength = 5000;
    if (summaryText.length > maxLength) {
        summaryText = summaryText.substring(0, maxLength).split(' ').slice(0, -1).join(' ') + "...";
    }
    
    // Format with emoji and highlight
    return `📄 <strong>Réponse trouvée:</strong>\n\n"${summaryText}"`;
}

/**
 * Display message in chat history
 */
function displayMessage(query, answer) {
    // Clear empty state
    const emptyState = chatHistory.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }

    // Create user message
    const userDiv = document.createElement('div');
    userDiv.className = 'message user';
    userDiv.innerHTML = `
        <div class="user-icon">
            <i class="fas fa-user-circle"></i> Votre question
        </div>
        ${escapeHtml(query)}
    `;

    // Create AI response message
    const aiDiv = document.createElement('div');
    aiDiv.className = 'message ai';
    aiDiv.innerHTML = `
        <div class="ai-icon">
            <i class="fas fa-brain"></i> Analyse IA
        </div>
        ${formatAnswer(answer)}
    `;

    // Add messages to history (newest first)
    chatHistory.insertBefore(aiDiv, chatHistory.firstChild);
    chatHistory.insertBefore(userDiv, chatHistory.firstChild);
    
    // Scroll to bottom
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

/**
 * Reset chat history to empty state
 */
function resetChatHistory() {
    chatHistory.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-comments"></i>
            <p>Les réponses apparaîtront ici après analyse.</p>
        </div>
    `;
}

/**
 * Format the answer with proper text formatting
 */
function formatAnswer(answer) {
    // Preserve line breaks and escape HTML, but keep intentional HTML tags
    return answer
        .split('\n')
        .map(line => {
            // Preserve HTML formatting while escaping dangerous content
            if (line.includes('<strong>')) {
                // Line already has HTML formatting
                return line;
            } else if (line.startsWith('"')) {
                return `<span style="color: #64748b; font-style: italic;">${escapeHtml(line)}</span>`;
            }
            return escapeHtml(line);
        })
        .join('<br>');
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Show/hide loading state
 */
function showLoadingState(show) {
    if (show) {
        // Simulate loading animation
        loader.style.display = 'block';
    } else {
        loader.style.display = 'none';
    }
}

/**
 * Show notification
 */
function showNotification(title, message, type = 'info') {
    // Create a simple notification using browser alert
    // In a production app, you might use a toast library
    console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
    
    // Optional: Add visual notification (can be enhanced)
    if (type === 'danger') {
        console.error(`${title}: ${message}`);
    }
}

// === INITIALIZATION ===
console.log('PDF Insight AI - Initialized');
console.log('Chargez un PDF pour commencer.');
