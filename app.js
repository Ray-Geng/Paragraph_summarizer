const MODEL_NAME = "gemini-2.5-flash";

// PDF.js configuration
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

const apiKeyInput = document.getElementById('api-key-input');
const paragraphInput = document.getElementById('paragraph-input');
const charCounter = document.getElementById('char-counter');
const analyzeBtn = document.getElementById('analyze-btn');
const loadingState = document.getElementById('loading-state');
const loadingText = document.getElementById('loading-text');
const errorAlert = document.getElementById('error-alert');
const errorMessage = document.getElementById('error-message');
const outputSection = document.getElementById('output-section');

const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('file-input');

const summaryContent = document.getElementById('summary-content');
const keywordsContent = document.getElementById('keywords-content');
const questionsContent = document.getElementById('questions-content');
const stepsContent = document.getElementById('steps-content');

// Load API key from localStorage if it exists
const savedKey = localStorage.getItem('gemini_api_key');
if (savedKey) {
    apiKeyInput.value = savedKey;
}

// Character counter
paragraphInput.addEventListener('input', () => {
    const count = paragraphInput.value.length;
    charCounter.textContent = `${count.toLocaleString()} character${count !== 1 ? 's' : ''}`;
});

// PDF Drag & Drop listeners
dropzone.addEventListener('click', () => fileInput.click());

dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
});

dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
});

dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

async function handleFile(file) {
    if (file.type !== 'application/pdf') {
        showError('Please upload a PDF file.');
        return;
    }

    hideError();
    loadingState.classList.remove('hidden');
    loadingText.textContent = 'Extracting text from PDF...';
    analyzeBtn.disabled = true;

    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let textContent = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items.map(item => item.str).join(' ');
            textContent += pageText + '\n\n';
        }

        if (!textContent.trim()) {
            throw new Error('No text content found in PDF.');
        }

        paragraphInput.value = textContent;
        // Trigger character counter update
        paragraphInput.dispatchEvent(new Event('input'));
        
    } catch (err) {
        console.error(err);
        showError('Error reading PDF: ' + err.message);
    } finally {
        loadingState.classList.add('hidden');
        loadingText.textContent = 'Analyzing with Gemini 2.5 Flash...';
        analyzeBtn.disabled = false;
    }
}

analyzeBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    const text = paragraphInput.value.trim();

    if (!apiKey) {
        showError("Please enter your Gemini API Key.");
        apiKeyInput.focus();
        return;
    }

    if (!text) {
        showError("Please enter a paragraph or upload a PDF to analyze.");
        paragraphInput.focus();
        return;
    }

    // Save key to localStorage for convenience
    localStorage.setItem('gemini_api_key', apiKey);

    // Reset states
    hideError();
    outputSection.classList.add('hidden');
    loadingState.classList.remove('hidden');
    analyzeBtn.disabled = true;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are an AI learning assistant. Analyze the following paragraph/text.
                        Generate:
                        1. A simple summary.
                        2. 3-5 keywords.
                        3. 3-5 questions to ponder.
                        4. 3-5 next learning steps.

                        Respond ONLY in the following JSON format:
                        {
                            "summary": "simple summary here",
                            "keywords": ["keyword1", "keyword2", "keyword3"],
                            "questions": ["question1", "question2", "question3"],
                            "learning_steps": ["step1", "step2", "step3"]
                        }

                        Here is the content:
                        ${text}`
                    }]
                }],
                generationConfig: {
                    responseMimeType: "application/json"
                }
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error?.message || "Failed to call Gemini API");
        }

        const data = await response.json();
        const textResult = data.candidates[0].content.parts[0].text;
        const result = JSON.parse(textResult);

        displayResults(result);
    } catch (err) {
        console.error(err);
        showError(err.message || "An unexpected error occurred. Please check your console.");
    } finally {
        loadingState.classList.add('hidden');
        analyzeBtn.disabled = false;
    }
});

function displayResults(data) {
    // 1. Summary
    summaryContent.textContent = data.summary || "No summary generated.";

    // 2. Keywords
    keywordsContent.innerHTML = '';
    if (data.keywords && data.keywords.length > 0) {
        data.keywords.forEach(keyword => {
            const span = document.createElement('span');
            span.className = 'tag';
            span.textContent = keyword;
            keywordsContent.appendChild(span);
        });
    } else {
        keywordsContent.textContent = "No keywords generated.";
    }

    // 3. Questions
    questionsContent.innerHTML = '';
    if (data.questions && data.questions.length > 0) {
        data.questions.forEach(q => {
            const li = document.createElement('li');
            li.textContent = q;
            questionsContent.appendChild(li);
        });
    } else {
        questionsContent.textContent = "No questions generated.";
    }

    // 4. Learning Steps
    stepsContent.innerHTML = '';
    if (data.learning_steps && data.learning_steps.length > 0) {
        data.learning_steps.forEach(step => {
            const li = document.createElement('li');
            li.textContent = step;
            stepsContent.appendChild(li);
        });
    } else {
        stepsContent.textContent = "No learning steps generated.";
    }

    outputSection.classList.remove('hidden');
    outputSection.scrollIntoView({ behavior: 'smooth' });
}

function showError(msg) {
    errorMessage.textContent = msg;
    errorAlert.classList.remove('hidden');
}

function hideError() {
    errorAlert.classList.add('hidden');
}
