function calculateResidence() {
    // ... existing code ...
    
    const resultBox = document.getElementById('result');
    const currentLang = getCurrentLanguage();
    
    // Update result box content with translations
    document.getElementById('resultTitle').textContent = translations[currentLang].resultTitle;
    
    if (totalDays >= requiredDays) {
        document.getElementById('resultMessage').textContent = translations[currentLang].resultSuccess;
    } else {
        document.getElementById('resultMessage').textContent = translations[currentLang].resultFailure;
    }
    
    document.getElementById('daysInCzech').textContent = `${translations[currentLang].daysInCzech} ${totalDays}`;
    document.getElementById('daysRequired').textContent = `${translations[currentLang].daysRequired} ${requiredDays}`;
    
    if (totalDays < requiredDays) {
        document.getElementById('daysRemaining').textContent = 
            `${translations[currentLang].daysRemaining} ${requiredDays - totalDays}`;
    }
    
    resultBox.style.display = 'block';
} 