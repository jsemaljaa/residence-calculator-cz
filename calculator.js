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
            <option value="26">Vědecký výzkum</option>
            <option value="26">Hledání zaměstnání, zahájení podnikatelské činnosti</option>
            <option value="26">Podnikání</option>
            <option value="26">Sloučení rodiny, společné soužití rodiny</option>
            <option value="26">Investování</option>
            <option value="26">Zaměstnanecká/modrá karta</option>
            <option value="26">Účel kulturní, sportovní, zdravotní</option>
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
    entries.forEach(entry => {
        const start = getDateFromEntry(entry, 'start');
        const end = getDateFromEntry(entry, 'end');
        const type = entry.querySelector('.permit-type').value;
        
        if (!start || !end || !type) {
            error = 'Vyplňte všechna pole';
            return;
        }

        if (start > end) {
            error = 'Datum konce nesmí být před datem začátku';
            return;
        }

        dateRanges.push({ start, end });
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
                error = 'Období pobytu se nesmí překrývat';
                break;
            }
        }
        if (error) break;
    }

    if (error) {
        displayResult(null, error);
        return;
    }

    // Calculate total days if valid
    entries.forEach((entry, index) => {
        const days = calculateDaysBetween(dateRanges[index].start, dateRanges[index].end);
        totalDays += applyTypeModifier(days, entry.querySelector('.permit-type').value);
    });

    displayResult(totalDays, error);
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

function displayResult(totalDays, error) {
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

    resultDiv.innerHTML = `
        <div class="result-header">Celková doba pobytu</div>

        <div class="result-main">
            <span>${totalYears}</span>
            <span style="font-size: 0.6em; color: #757575">let</span>
            <span style="width: 2px"></span>
            <span>${remainingDays}</span>
            <span style="font-size: 0.6em; color: #757575">dní</span>
        </div>

        <div class="result-details">
            ${totalDays.toLocaleString()} celkem dní
        </div>

        <div class="progress-info">
            <div style="margin-bottom: 12px; color: #616161;">
                ${daysToFiveYears > 0 ? 'Do 5 let zbývá:' : 'Dosaženo 5 let pobytu:'}
            </div>

            <div style="font-size: 1.6em; color: ${daysToFiveYears <= 0 ? '#2E7D32' : '#D32F2F'}; font-weight: 500;">
                ${daysToFiveYears > 0 ? 
                    `${yearsToFive > 0 ? `${yearsToFive} let ` : ''}${daysRemaining} dní` : 
                    '✓ Splněno'}
            </div>
        </div>
                
        <div style="margin-top: 24px; font-size: 0.85em; color: #757575;">
            * 5 let = 1825 dní
        </div>
    `;

    // Add subtle animation for days counter
    if (daysToFiveYears > 0) {
        const counter = resultDiv.querySelector('.progress-info div');
        if (counter) {
            counter.style.animation = 'pulse 1.5s ease-in-out infinite';
        }
    }
}

function initializeFirstEntry() {
    const container = document.getElementById('permits-container');
    container.appendChild(createPermitEntry());
    updateRemoveButtons();
}