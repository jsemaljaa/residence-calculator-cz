const translations = {
    cs: {
        // Main UI elements
        'title': 'Kalkulačka trvalého pobytu',
        'addPeriod': 'Přidat období',
        'calculate': 'Spočítat celkový pobyt',
        'remove': 'Odstranit',
        'selectType': 'Vyberte typ povolení',
        
        // Permit types
        'type24': 'Studium',
        'type26': 'Ostatní dlouhodobé víza/pobyty',
        
        // Result box
        'error': 'Chyba',
        'canApply': 'Můžete žádat o trvalý pobyt',
        'cannotApply': 'Ještě nemůžete žádat',
        'years': 'let',
        'days': 'dní',
        'daysRemaining': 'Chybí ještě',
        'conditionMet': 'Splněna podmínka 5 let nepřetržitého pobytu',
        'progress': 'Postup splnění podmínky',
        'conditionCompleted': 'Podmínka splněna',
        'approxDate': 'Přibližné datum, kdy budete moci podat žádost:',
        'approxNote': '* Toto je pouze přibližný výpočet. Skutečné datum může být ovlivněno různými faktory.',
        'resultTitle': 'Výsledek',
        'resultSuccess': 'Na základě uvedených dat splňujete podmínku pobytu.',
        'resultFailure': 'Na základě uvedených dat nesplňujete podmínku pobytu.',
        'daysInCzech': 'Dny v České republice:',
        'daysRequired': 'Požadované dny:',
        'daysRemaining': 'Potřebné další dny:',
        
        // Error messages
        'missingStart': 'datum začátku',
        'missingEnd': 'datum konce',
        'missingType': 'typ povolení',
        'periodError': 'V období',
        'missing': 'chybí',
        'and': 'a',
        'dateOrderError': 'je datum začátku pobytu později než datum konce pobytu',
        'overlapError': 'Období',
        'overlapAnd': 'a',
        'overlap': 'se překrývají',
        
        // Info text boxes
        'infoText1': 'Povolení k trvalému pobytu se na žádost vydá občanům třetích zemí, kteří ke dni podání žádosti pobývají na území České republiky',
        'infoText1Bold': 'nepřetržitě po dobu nejméně 5 let.',
        'infoText2': 'Pokud potřebujete zjistit přesné informace o délkách jednotlivých pobytů, můžete si vyžádat potvrzení o',
        'historyLink': 'Historii pobytu',
        'infoText2End': 'na příslušném pracovišti Odboru azylové a migrační politiky Ministerstva vnitra (OAMP MVČR).',
        
        // Info links
        'residenceInfo': 'Info o trvalých pobytech',
        'continuousStayInfo': 'Co je nepřetržitý pobyt',
        
        // Language toggle
        'langButton': 'CZ'
    },
    en: {
        // Main UI elements
        'title': 'Permanent Residence Calculator',
        'addPeriod': 'Add Period',
        'calculate': 'Calculate Total Stay',
        'remove': 'Remove',
        'selectType': 'Select permit type',
        
        // Permit types
        'type24': 'Study',
        'type26': 'Other long-term visas/stays',
        
        // Result box
        'error': 'Error',
        'canApply': 'You can apply for permanent residence',
        'cannotApply': 'You cannot apply yet',
        'years': 'years',
        'days': 'days',
        'daysRemaining': 'Days remaining:',
        'conditionMet': '5 years continuous residence condition met',
        'progress': 'Progress towards condition',
        'conditionCompleted': 'Condition completed',
        'approxDate': 'Approximate date when you can apply:',
        'approxNote': '* This is only an approximate calculation. The actual date may be affected by various factors.',
        'resultTitle': 'Result',
        'resultSuccess': 'Based on the provided dates, you meet the residence requirement.',
        'resultFailure': 'Based on the provided dates, you do not meet the residence requirement.',
        'daysInCzech': 'Days in Czech Republic:',
        'daysRequired': 'Days required:',
        'daysRemaining': 'Additional days needed:',
        
        // Error messages
        'missingStart': 'start date',
        'missingEnd': 'end date',
        'missingType': 'permit type',
        'periodError': 'In period',
        'missing': 'missing',
        'and': 'and',
        'dateOrderError': 'the start date is later than the end date',
        'overlapError': 'Periods',
        'overlapAnd': 'and',
        'overlap': 'overlap',
        
        // Info text boxes
        'infoText1': 'A permanent residence permit is issued upon request to third-country nationals who, at the date of application, have been residing in the territory of the Czech Republic',
        'infoText1Bold': 'continuously for at least 5 years.',
        'infoText2': 'If you need to find out exact information about the length of individual stays, you can request a confirmation of your',
        'historyLink': 'Residence History',
        'infoText2End': 'at the relevant office of the Department of Asylum and Migration Policy of the Ministry of Interior (OAMP MVČR).',
        
        // Info links
        'residenceInfo': 'Permanent Residence Info',
        'continuousStayInfo': 'What is Continuous Stay',
        
        // Language toggle
        'langButton': 'EN'
    }
};

let currentLanguage = 'cs';

function translatePage() {
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[currentLanguage][key]) {
            if (element.tagName.toLowerCase() === 'option') {
                element.text = translations[currentLanguage][key];
            } else if (element.tagName.toLowerCase() === 'input' && element.type === 'button') {
                element.value = translations[currentLanguage][key];
            } else {
                element.textContent = translations[currentLanguage][key];
            }
        }
    });
    
    // Update HTML lang attribute
    document.documentElement.lang = currentLanguage;
    
    // Save language preference
    localStorage.setItem('language', currentLanguage);

    // If result box is visible, recalculate to update language
    const resultBox = document.getElementById('result');
    if (resultBox && resultBox.style.display === 'block') {
        calculateResidence();
    }
}

function toggleLanguage() {
    currentLanguage = currentLanguage === 'cs' ? 'en' : 'cs';
    translatePage();
}

// Initialize language from localStorage or default to Czech
document.addEventListener('DOMContentLoaded', () => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
        currentLanguage = savedLanguage;
    }
    translatePage();
}); 