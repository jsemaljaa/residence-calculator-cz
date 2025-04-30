document.addEventListener('DOMContentLoaded', () => {
    initializeFirstEntry();
    document.getElementById('add-btn').addEventListener('click', addPermitEntry);
    document.getElementById('calculate-btn').addEventListener('click', calculateResidence);
});

function createPermitEntry() {
    const entry = document.createElement('div');
    entry.className = 'permit-entry';
    
    entry.innerHTML = `
        <div class="date-group">
            <input type="date" class="start-date">
            <input type="date" class="end-date">
        </div>
        <select class="permit-type">
            <option value="" data-translate="selectType">Vyberte typ povolení</option>
            <option value="24" data-translate="type24">Studium</option>
            <option value="26" data-translate="type26">Ostatní dlouhodobé víza/pobyty</option>
        </select>
        <button class="remove-btn" data-translate="remove">Odstranit</button>
    `;

    // Translate the newly created elements
    const elements = entry.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[currentLanguage][key]) {
            if (element.tagName.toLowerCase() === 'option') {
                element.text = translations[currentLanguage][key];
            } else {
                element.textContent = translations[currentLanguage][key];
            }
        }
    });

    entry.querySelector('.remove-btn').addEventListener('click', () => removePermitEntry(entry));
    return entry;
}

function addPermitEntry() {
    const newEntry = createPermitEntry();
    document.getElementById('permits-container').appendChild(newEntry);
    updateRemoveButtons();
}

function removePermitEntry(entry) {
    entry.remove();
    updateRemoveButtons();
}

function updateRemoveButtons() {
    const entries = document.querySelectorAll('.permit-entry');
    entries.forEach(entry => {
        const removeBtn = entry.querySelector('.remove-btn');
        removeBtn.disabled = entries.length === 1;
    });
}

function calculateResidence() {
    const entries = document.querySelectorAll('.permit-entry');
    let totalDays = 0;
    let error = null;
    const dateRanges = [];

    // First pass: validate individual entries
    entries.forEach((entry, index) => {
        const start = getDateFromEntry(entry, 'start');
        const end = getDateFromEntry(entry, 'end');
        const type = entry.querySelector('.permit-type').value;
        
        // Check for missing fields
        const missingFields = [];
        if (!start) missingFields.push(translations[currentLanguage].missingStart);
        if (!end) missingFields.push(translations[currentLanguage].missingEnd);
        if (!type) missingFields.push(translations[currentLanguage].missingType);

        if (missingFields.length > 0) {
            const entryNumber = index + 1;
            if (missingFields.length === 1) {
                error = `${translations[currentLanguage].periodError} ${entryNumber} ${translations[currentLanguage].missing} ${missingFields[0]}`;
            } else if (missingFields.length === 2) {
                error = `${translations[currentLanguage].periodError} ${entryNumber} ${translations[currentLanguage].missing} ${missingFields[0]} ${translations[currentLanguage].and} ${missingFields[1]}`;
            } else {
                error = `${translations[currentLanguage].periodError} ${entryNumber} ${translations[currentLanguage].missing} ${missingFields[0]}, ${missingFields[1]} ${translations[currentLanguage].and} ${missingFields[2]}`;
            }
            return;
        }

        if (start > end) {
            error = `${translations[currentLanguage].periodError} ${index + 1} ${translations[currentLanguage].dateOrderError}`;
            return;
        }

        dateRanges.push({ start, end, type });
    });

    if (error) {
        displayResult(null, error);
        return;
    }

    // Check for overlapping periods
    for (let i = 0; i < dateRanges.length; i++) {
        for (let j = i + 1; j < dateRanges.length; j++) {
            if (datesOverlap(
                dateRanges[i].start, 
                dateRanges[i].end,
                dateRanges[j].start,
                dateRanges[j].end
            )) {
                error = `${translations[currentLanguage].overlapError} ${i + 1} ${translations[currentLanguage].overlapAnd} ${j + 1} ${translations[currentLanguage].overlap}`;
                break;
            }
        }
        if (error) break;
    }

    if (error) {
        displayResult(null, error);
        return;
    }

    // Calculate total days with permit type modifiers
    dateRanges.forEach(range => {
        const days = calculateDaysBetween(range.start, range.end);
        const modifier = range.type === '24' ? 0.5 : 1;
        totalDays += days * modifier;
    });

    // Find the most recent end date
    let lastDate = null;
    dateRanges.forEach(range => {
        if (!lastDate || range.end > lastDate) {
            lastDate = range.end;
        }
    });

    // Calculate days needed assuming type 26 permit (1 day = 1 day)
    const daysNeeded = Math.ceil(1825 - totalDays);

    displayResult(totalDays, error, lastDate, daysNeeded);
}

function getDateFromEntry(entry, prefix) {
    const dateString = entry.querySelector(`.${prefix}-date`).value;
    if (!dateString) return null;
    return new Date(dateString);
}

function calculateDaysBetween(start, end) {
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // Inclusive
}

function datesOverlap(aStart, aEnd, bStart, bEnd) {
    return aStart <= bEnd && bStart <= aEnd;
}

function applyTypeModifier(days, type) {
    return ['24', '25'].includes(type) ? days / 2 : days;
}

function displayResult(totalDays, error, lastDate, daysNeeded) {
    const resultDiv = document.getElementById('result');
    resultDiv.className = error ? 'error visible' : 'success visible';
    resultDiv.innerHTML = '';

    if (error) {
        resultDiv.innerHTML = `
            <div class="result-header" style="color: red;">${translations[currentLanguage].error}</div>
            <div style="padding: 15px 0;">${error}</div>
        `;
        return;
    }

    // Calculate time components
    const totalYears = Math.floor(totalDays / 365);
    const remainingDays = totalDays % 365;
    const daysToFiveYears = Math.max(0, 1825 - totalDays);
    const yearsToFive = Math.floor(daysToFiveYears / 365);
    const daysRemaining = daysToFiveYears % 365;

    // Calculate approximate application date from the last date
    const applicationDate = new Date(lastDate);
    applicationDate.setDate(lastDate.getDate() + daysNeeded + 1);
    
    const formattedApplicationDate = applicationDate.toLocaleDateString(currentLanguage === 'cs' ? 'cs-CZ' : 'en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    let resultHTML = `
        <div class="result-header">
            <span>${daysToFiveYears > 0 ? '❌' : '✅'} ${daysToFiveYears > 0 ? translations[currentLanguage].cannotApply : translations[currentLanguage].canApply}</span>
        </div>
        <div class="result-main">
            <span>${totalYears}</span>
            <span style="font-size: 0.6em; color: #757575">${translations[currentLanguage].years}</span>
            <span style="width: 2px"></span>
            <span>${remainingDays}</span>
            <span style="font-size: 0.6em; color: #757575">${translations[currentLanguage].days}</span>
        </div>
        <div class="result-details">
            <div>${daysToFiveYears > 0 ? `${translations[currentLanguage].daysRemaining} ${daysToFiveYears} ${translations[currentLanguage].days}` : translations[currentLanguage].conditionMet}</div>
        </div>
        <div class="progress-info">
            <div>${daysToFiveYears > 0 ? translations[currentLanguage].progress : translations[currentLanguage].conditionCompleted}</div>
            <div>${Math.min((totalDays / 1825) * 100, 100).toFixed(1)}%</div>
        </div>
        ${daysToFiveYears > 0 ? `
        <div class="approximate-date">
            <div>${translations[currentLanguage].approxDate}</div>
            <div class="date-value">${formattedApplicationDate}</div>
            <div class="date-note">${translations[currentLanguage].approxNote}</div>
        </div>
        ` : ''}
    `;

    resultDiv.innerHTML = resultHTML;
    resultDiv.className = `result-box ${daysToFiveYears > 0 ? 'error' : 'success'}`;
    resultDiv.style.display = 'block';
}

function initializeFirstEntry() {
    const container = document.getElementById('permits-container');
    
    // Create one empty entry
    const entry = createPermitEntry();
    container.appendChild(entry);

    updateRemoveButtons();
}