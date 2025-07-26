const rtlLangs = [
    "ar",  // Arabisch
    "fa",  // Persisch
    "he",  // Hebräisch
    "ur",  // Urdu
    "ps",  // Paschtu
    "syr", // Syrisch
    "dv"   // Dhivehi
];

const userLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
const baseLang = userLang.split('-')[0];

document.documentElement.lang = baseLang;

if (rtlLangs.includes(baseLang)) {
    document.documentElement.dir = 'rtl';
} else {
    document.documentElement.dir = 'ltr';
}

/* Debug-Ausgabe: Richtung in der Konsole anzeigen*/
console.log(`Sprache erkannt: ${baseLang}, Richtung: ${document.documentElement.dir}`);

