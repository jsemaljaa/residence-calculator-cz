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
            <input type="date" class="start-date" placeholder="Začátek">
            <span>–</span>
            <input type="date" class="end-date" placeholder="Konec">
        </div>
        <select class="permit-type">
            <option value="">Vyberte typ povolení</option>
            <option value="24">Studium</option>
            <option value="26">Ostatní dlouhodobé víza/pobyty</option>
        </select>
        <button class="remove-btn">Odstranit</button>
    `;

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
        if (!start) missingFields.push('datum začátku');
        if (!end) missingFields.push('datum konce');
        if (!type) missingFields.push('typ povolení');

        if (missingFields.length > 0) {
            const entryNumber = index + 1;
            if (missingFields.length === 1) {
                error = `V období ${entryNumber} chybí ${missingFields[0]}`;
            } else if (missingFields.length === 2) {
                error = `V období ${entryNumber} chybí ${missingFields[0]} a ${missingFields[1]}`;
            } else {
                error = `V období ${entryNumber} chybí ${missingFields[0]}, ${missingFields[1]} a ${missingFields[2]}`;
            }
            return;
        }

        if (start > end) {
            error = `V období ${index + 1} je datum začátku pobytu později než datum konce pobytu`;
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
                error = `Období ${i + 1} a ${j + 1} se překrývají`;
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
            <div class="result-header" style="color: red;">Chyba</div>
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
    applicationDate.setDate(lastDate.getDate() + daysNeeded);
    
    const formattedApplicationDate = applicationDate.toLocaleDateString('cs-CZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    let resultHTML = `
        <div class="result-header">
            <span>${daysToFiveYears > 0 ? '❌' : '✅'} ${daysToFiveYears > 0 ? 'Ještě nemůžete žádat' : 'Můžete žádat o trvalý pobyt'}</span>
        </div>
        <div class="result-main">
            <span>${totalYears}</span>
            <span style="font-size: 0.6em; color: #757575">let</span>
            <span style="width: 2px"></span>
            <span>${remainingDays}</span>
            <span style="font-size: 0.6em; color: #757575">dní</span>
        </div>
        <div class="result-details">
            <div>${daysToFiveYears > 0 ? `Chybí ještě ${daysToFiveYears} dní` : 'Splněna podmínka 5 let nepřetržitého pobytu'}</div>
        </div>
        <div class="progress-info">
            <div>${daysToFiveYears > 0 ? 'Postup splnění podmínky' : 'Podmínka splněna'}</div>
            <div>${Math.min((totalDays / 1825) * 100, 100).toFixed(1)}%</div>
        </div>
        ${daysToFiveYears > 0 ? `
        <div class="approximate-date">
            <div>Přibližné datum, kdy budete moci podat žádost:</div>
            <div class="date-value">${formattedApplicationDate}</div>
            <div class="date-note">* Toto je pouze přibližný výpočet. Skutečné datum může být ovlivněno různými faktory.</div>
        </div>
        ` : ''}
    `;

    resultDiv.innerHTML = resultHTML;
    resultDiv.className = `result-box ${daysToFiveYears > 0 ? 'error' : 'success'}`;
    resultDiv.style.display = 'block';
}

function initializeFirstEntry() {
    const container = document.getElementById('permits-container');
    container.appendChild(createPermitEntry());
    updateRemoveButtons();
}