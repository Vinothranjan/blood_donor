/**
 * LifePulse AI - Multilingual Pan-India NLP Emergency Assistant
 * Parses natural text/voice inputs across English, Hindi, Tamil, Telugu, Kannada, Malayalam, and Marathi
 */

window.LifePulseNLP = {

    // Regex and keyword maps for blood groups
    bloodGroupPatterns: [
        { pattern: /\b(O\s*\+|\bO\s*positive|\bओ\s*पॉजिटिव|\bஓ\s*பாசிட்டிவ்|\bఓ\s*పాజిటివ్|\bಒ\s*ಪಾಸಿಟಿವ್|\bഒ\s*പോസിറ്റീവ്|\bओ\s*पॉझिटिव्ह)\b/i, group: 'O+' },
        { pattern: /\b(O\s*\-|\bO\s*negative|\bओ\s*नेगेटिव|\bஓ\s*நெகட்டிவ்|\bఓ\s*నెగిటివ్|\bಒ\s*ನೆಗೆಟಿವ್|\bഒ\s*നെഗറ്റീവ്|\bओ\s*निगेटिव्ह)\b/i, group: 'O-' },
        { pattern: /\b(A\s*\+|\bA\s*positive|\bए\s*पॉजिटिव|\bஏ\s*பாசிட்டிவ்|\bఎ\s*పాజిటివ్|\bಎ\s*ಪಾಸಿಟಿವ್|\bഎ\s*പോസിറ്റീവ്|\bए\s*पॉझिटिव्ह)\b/i, group: 'A+' },
        { pattern: /\b(A\s*\-|\bA\s*negative|\bए\s*नेगेटिव|\bஏ\s*நெகட்டிவ்|\bఎ\s*నెగిటివ్|\bಎ\s*ನೆಗೆಟಿವ್|\bഎ\s*നെഗറ്റീവ്|\bए\s*निगेटिव्ह)\b/i, group: 'A-' },
        { pattern: /\b(B\s*\+|\bB\s*positive|\bबी\s*पॉजिटिव|\bபி\s*பாசிட்டிவ்|\bబి\s*పాజిటివ్|\bಬಿ\s*ಪಾಸಿಟಿವ್|\bബി\s*പോസിറ്റീവ്|\bबी\s*पॉझिटिव्ह)\b/i, group: 'B+' },
        { pattern: /\b(B\s*\-|\bB\s*negative|\bबी\s*नेगेटिव|\bபி\s*நெகட்டிவ்|\bబి\s*నెగిటిവ്|\bಬಿ\s*ನೆಗೆಟಿವ್|\bബി\s*നെഗറ്റീവ്|\bबी\s*निगेटिव्ह)\b/i, group: 'B-' },
        { pattern: /\b(AB\s*\+|\bAB\s*positive|\bएबी\s*पॉजिटिव|\bஏபி\s*பாசிட்டிவ்|\bఏబి\s*పాజిటివ్|\bಎಬಿ\s*ಪಾಸಿಟಿವ್|\bഎബി\s*പോസിറ്റീവ്|\bएबी\s*पॉझिटिव्ह)\b/i, group: 'AB+' },
        { pattern: /\b(AB\s*\-|\bAB\s*negative|\bएबी\s*नेगेटिव|\bஏபி\s*நெகட்டிவ்|\bఏబి\s*నెగిటివ్|\bಎಬಿ\s*ನೆಗೆಟಿವ್|\bഎബി\s*നെഗറ്റീവ്|\bएबी\s*निगेटिव्ह)\b/i, group: 'AB-' }
    ],

    // Urgency indicators
    urgencyPatterns: {
        CRITICAL: /\b(critical|immediate|urgent|அவசரம்|உடனடியாக|सख्त|अत्यंत|అత్యవసరం|వెంటనే|ತುರ್ತು|തൽക്ഷണം|अतितातडीचे|emergency|icu)\b/i,
        URGENT: /\b(within 4 hours|soon|4 घंटे|4 மணிநேரம்|4 గంటలు|4 ഗണിക്കൂർ)\b/i,
        STANDARD: /\b(today|tomorrow|standard|சாதாரண|सामान्य|సాధారణ)\b/i
    },

    // Units extractor pattern (e.g., 2 units, 3 bags, 2 பாட்டில், 2 यूनिट, 2 యూనిట్లు)
    unitsPattern: /(\d+)\s*(unit|units|bag|bags|bottle|bottles|பாட்டில்|யூனிட்|यूनिट|यूनिट्स|యూనిట్లు|ಯೂನಿಟ್|യൂണിറ്റ്)/i,

    // City patterns
    cityPatterns: [
        { pattern: /\b(chennai|சென்னை|चेन्नई|చెన్నై|ಚೆನ್ನೈ|ചെന്നൈ)\b/i, id: 'chennai' },
        { pattern: /\b(delhi|दिल्ली|டெல்லி|ఢిల్లీ|ದೆಹಲಿ|ഡൽഹി)\b/i, id: 'delhi' },
        { pattern: /\b(mumbai|मुंबई|மும்பை|ముంబై|ಮುಂಬೈ|മുംബൈ)\b/i, id: 'mumbai' },
        { pattern: /\b(bengaluru|bangalore|பெங்களூர்|बेंगलुरु|బెంగళూరు|ಬೆಂಗಳೂರು|ബാംഗ്ലൂർ)\b/i, id: 'bengaluru' },
        { pattern: /\b(hyderabad|ஹைதராபாத்|हैदराबाद|హైదరాబాద్|ಹೈದರಾಬಾದ್|ഹൈദരാബാദ്)\b/i, id: 'hyderabad' },
        { pattern: /\b(kochi|cochin|கொச்சி|कोच्चि|కొచ్చి|കൊച്ചി)\b/i, id: 'kochi' },
        { pattern: /\b(pune|பூனே|पुणे|పుణే|പുണെ)\b/i, id: 'pune' }
    ],

    // Parse natural prompt string
    parsePrompt: function(text) {
        if (!text || typeof text !== 'string') return null;

        var result = {
            rawText: text,
            bloodGroup: 'O+', // default fallback
            units: 1,
            urgency: 'URGENT',
            cityId: 'chennai',
            matchedHospital: null,
            detectedLanguage: 'en',
            confidence: 85
        };

        // 1. Detect Blood Group
        for (var i = 0; i < this.bloodGroupPatterns.length; i++) {
            if (this.bloodGroupPatterns[i].pattern.test(text)) {
                result.bloodGroup = this.bloodGroupPatterns[i].group;
                break;
            }
        }

        // 2. Detect Units
        var unitMatch = text.match(this.unitsPattern);
        if (unitMatch && unitMatch[1]) {
            result.units = parseInt(unitMatch[1], 10);
        } else {
            // Check standalone digit
            var digitMatch = text.match(/\b([1-9])\b/);
            if (digitMatch && digitMatch[1]) {
                result.units = parseInt(digitMatch[1], 10);
            }
        }

        // 3. Detect Urgency
        if (this.urgencyPatterns.CRITICAL.test(text)) {
            result.urgency = 'CRITICAL';
        } else if (this.urgencyPatterns.URGENT.test(text)) {
            result.urgency = 'URGENT';
        } else if (this.urgencyPatterns.STANDARD.test(text)) {
            result.urgency = 'STANDARD';
        }

        // 4. Detect City
        for (var j = 0; j < this.cityPatterns.length; j++) {
            if (this.cityPatterns[j].pattern.test(text)) {
                result.cityId = this.cityPatterns[j].id;
                break;
            }
        }

        // 5. Detect Hospital Name matching
        if (window.LifePulseData && window.LifePulseData.hospitals) {
            var lower = text.toLowerCase();
            var hospitalsInCity = window.LifePulseData.hospitals.filter(function(h) { return h.cityId === result.cityId; });
            for (var k = 0; k < hospitalsInCity.length; k++) {
                var hospName = hospitalsInCity[k].name.toLowerCase();
                var keywords = hospName.split(/[\s,]+/);
                for (var w = 0; w < keywords.length; w++) {
                    if (keywords[w].length > 3 && lower.indexOf(keywords[w]) !== -1) {
                        result.matchedHospital = hospitalsInCity[k];
                        break;
                    }
                }
                if (result.matchedHospital) break;
            }
        }

        // Detect Script / Language heuristics
        if (/[\u0B80-\u0BFF]/.test(text)) result.detectedLanguage = 'ta';
        else if (/[\u0900-\u097F]/.test(text)) {
            if (/तात्काळ|तातडीने|मला|पाहिजे/.test(text)) result.detectedLanguage = 'mr';
            else result.detectedLanguage = 'hi';
        }
        else if (/[\u0C00-\u0C7F]/.test(text)) result.detectedLanguage = 'te';
        else if (/[\u0C80-\u0CFF]/.test(text)) result.detectedLanguage = 'kn';
        else if (/[\u0D00-\u0D7F]/.test(text)) result.detectedLanguage = 'ml';

        return result;
    }
};
