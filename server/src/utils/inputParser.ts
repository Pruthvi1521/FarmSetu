import { Commodity } from '../models/Commodity';

export interface IParsedEntity {
  commodity: string;
  commodityId?: string;
  quantityKg: number;
  availabilityDays: number;
  originalText: string;
  confidence: number;
}

// Convert Indic script numerals (Telugu, Devanagari, Tamil, Kannada) to standard ASCII 0-9
function normalizeIndicNumerals(text: string): string {
  const numeralMap: Record<string, string> = {
    // Telugu
    '౦': '0', '౧': '1', '౨': '2', '౩': '3', '౪': '4', '౫': '5', '౬': '6', '౭': '7', '౮': '8', '౯': '9',
    // Devanagari
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
    // Tamil
    '௦': '0', '௧': '1', '௨': '2', '௩': '3', '௪': '4', '௫': '5', '௬': '6', '௭': '7', '௮': '8', '௯': '9',
    // Kannada
    '೦': '0', '೧': '1', '೨': '2', '೩': '3', '೪': '4', '೫': '5', '೬': '6', '೭': '7', '೮': '8', '೯': '9'
  };

  return text.replace(/[౦-౯०-९௦-௯೦-೯]/g, (char) => numeralMap[char] || char);
}

export async function parseFarmerInputText(rawText: string): Promise<IParsedEntity> {
  const normalizedRaw = normalizeIndicNumerals(rawText);
  const text = normalizedRaw.toLowerCase().trim();

  // 1. Identify Commodity
  const commodities = await Commodity.find({}).lean();
  let matchedCommodity = 'Tomato';
  let matchedCommodityId: string | undefined = undefined;

  // Direct match on English name or first word
  for (const c of commodities) {
    const cName = c.name.toLowerCase();
    if (text.includes(cName) || text.includes(cName.split(' ')[0])) {
      matchedCommodity = c.name;
      matchedCommodityId = c._id.toString();
      break;
    }
  }

  // Multilingual Synonym fallbacks (Telugu, Hindi, Tamil, Kannada, Marathi)
  if (!matchedCommodityId) {
    const findCommodityByName = (key: string) =>
      commodities.find((c) => c.name.toLowerCase().includes(key));

    const isTomato =
      text.includes('tamatar') || text.includes('thakkali') || text.includes('tamata') ||
      text.includes('టమోటా') || text.includes('టమాటో') || text.includes('టమాటా') || text.includes('టమాట') ||
      text.includes('టమోటాలు') || text.includes('టమాటోలు') || text.includes('తమట') || text.includes('टमाटर') ||
      text.includes('தக்காளி') || text.includes('ಟೊಮೆಟೊ') || text.includes('टोमॅटो');

    const isOnion =
      text.includes('pyaaz') || text.includes('vengayam') || text.includes('ullipaya') ||
      text.includes('ఉల్లిపాయ') || text.includes('ఉల్లి') || text.includes('ఉల్లిగడ్డ') || text.includes('ఉల్లిపాయలు') ||
      text.includes('प्याज') || text.includes('வெங்காயம்') || text.includes('ಈರುಳ್ಳಿ') || text.includes('कांदा');

    const isPotato =
      text.includes('aloo') || text.includes('urulaikizhangu') || text.includes('bangaladumpa') ||
      text.includes('బంగాళాదుంప') || text.includes('ఆలుగడ్డ') || text.includes('బంగాళాదుంపలు') ||
      text.includes('आलू') || text.includes('உருளைக்கிழங்கு') || text.includes('ಆಲೂಗಡ್ಡೆ') || text.includes('बटाटा');

    const isRice =
      text.includes('rice') || text.includes('biyyam') || text.includes('vari') ||
      text.includes('వరి') || text.includes('బియ్యం') || text.includes('వరి ధాన్యం') ||
      text.includes('चावल') || text.includes('अரிசி') || text.includes('அரிசி') || text.includes('ಅಕ್ಕಿ') || text.includes('तांदूळ');

    const isChilli =
      text.includes('chilli') || text.includes('chili') || text.includes('mirapa') || text.includes('mirchi') ||
      text.includes('మిరప') || text.includes('మిరపకాయలు') || text.includes('ఎండు మిరపకాయలు') || text.includes('మిర్చి') ||
      text.includes('मिर्च') || text.includes('மிளகாய்') || text.includes('ಮೆಣಸಿನಕಾಯಿ') || text.includes('मिरची');

    const isMaize =
      text.includes('maize') || text.includes('corn') || text.includes('jonna') || text.includes('mokkajonna') ||
      text.includes('జొన్న') || text.includes('జొన్నలు') || text.includes('మొక్కజొన్న') || text.includes('మొక్క జొన్న') ||
      text.includes('मक्का') || text.includes('சோளம்') || text.includes('ಮೆಕ್ಕೆಜೋಳ') || text.includes('ಮಕಾ');

    const isCotton =
      text.includes('cotton') || text.includes('patti') || text.includes('doodi') ||
      text.includes('పత్తి') || text.includes('దూది') || text.includes('कपास') ||
      text.includes('பருத்தி') || text.includes('ಹತ್ತಿ') || text.includes('कापूस');

    if (isTomato) {
      const doc = findCommodityByName('tomato');
      if (doc) { matchedCommodity = doc.name; matchedCommodityId = doc._id.toString(); }
    } else if (isOnion) {
      const doc = findCommodityByName('onion');
      if (doc) { matchedCommodity = doc.name; matchedCommodityId = doc._id.toString(); }
    } else if (isPotato) {
      const doc = findCommodityByName('potato');
      if (doc) { matchedCommodity = doc.name; matchedCommodityId = doc._id.toString(); }
    } else if (isRice) {
      const doc = findCommodityByName('rice');
      if (doc) { matchedCommodity = doc.name; matchedCommodityId = doc._id.toString(); }
    } else if (isChilli) {
      const doc = findCommodityByName('chilli');
      if (doc) { matchedCommodity = doc.name; matchedCommodityId = doc._id.toString(); }
    } else if (isMaize) {
      const doc = findCommodityByName('maize');
      if (doc) { matchedCommodity = doc.name; matchedCommodityId = doc._id.toString(); }
    } else if (isCotton) {
      const doc = findCommodityByName('cotton');
      if (doc) { matchedCommodity = doc.name; matchedCommodityId = doc._id.toString(); }
    }
  }

  // Default to Tomato if not specified, but fetch ID if possible
  if (!matchedCommodityId) {
    const defaultDoc = commodities.find((c) => c.name.toLowerCase().includes('tomato'));
    if (defaultDoc) {
      matchedCommodity = defaultDoc.name;
      matchedCommodityId = defaultDoc._id.toString();
    }
  }

  // 2. Extract Quantity
  let quantityKg = 2000; // Default 2000 kg (2 tonnes)

  // Check tonnes / tons (English & Multilingual)
  const tonneMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:tonnes?|tons?|t\b|టన్నులు|టన్నుల|టన్ను|టన్|टनो|टन|டன்|டன்கள்|ಟನ್|ಟನ್ನುಗಳು)/i);
  if (tonneMatch) {
    quantityKg = Math.round(parseFloat(tonneMatch[1]) * 1000);
  } else {
    // Check quintals (English & Multilingual)
    const quintalMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:quintals?|qtl\b|క్వింటాళ్లు|క్వింటాళ్ళు|కువింటాల్|క్వింటాల్|క్వింటాళ్ల|क्विंटल|குவிண்டால்|ಕ್ವಿಂಟಾಲ್)/i);
    if (quintalMatch) {
      quantityKg = Math.round(parseFloat(quintalMatch[1]) * 100);
    } else {
      // Check kg / kilograms (English & Multilingual)
      const kgMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:kg|kgs|kilograms?|కేజీలు|కేజీ|కిలోలు|కిలో|కిలోగ్రాములు|కిలోల|किग्रा|किलो|किलोग्राम|கிலோ|கிலோகிராம்|ಕೆಜಿ|ಕಿಲೋಗ್ರಾಂ)/i);
      if (kgMatch) {
        quantityKg = Math.round(parseFloat(kgMatch[1]));
      } else {
        // Plain number match
        const numMatch = text.match(/\b(\d{2,5})\b/);
        if (numMatch) {
          quantityKg = parseInt(numMatch[1], 10);
        }
      }
    }
  }

  // 3. Extract Availability Days
  let availabilityDays = 5; // Default 5 days

  // Check word numbers in English and Indic languages
  const wordMap: Record<string, number> = {
    // English
    one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, today: 0, tomorrow: 1,
    // Telugu
    ఒకటి: 1, రెండు: 2, మూడు: 3, నాలుగు: 4, ఐదు: 5, ఆరు: 6, ఏడు: 7, ఈరోజు: 0, నేడు: 0, రేపు: 1, ఎల్లుండి: 2,
    // Hindi
    एक: 1, दो: 2, तीन: 3, चार: 4, पांच: 5, पाँच: 5, छह: 6, सात: 7, आज: 0, कल: 1,
    // Tamil
    ஒன்று: 1, இரண்டு: 2, மூன்று: 3, நான்கு: 4, ஐந்து: 5, இன்று: 0, நாளை: 1,
    // Kannada
    ಒಂದು: 1, ಎರಡು: 2, ಮೂರು: 3, ನಾಲ್ಕು: 4, ಐದು: 5, ಇಂದು: 0, ನಾಳೆ: 1
  };

  for (const [word, val] of Object.entries(wordMap)) {
    if (text.includes(word)) {
      availabilityDays = val;
      break;
    }
  }

  const daysMatch = text.match(/(\d+)\s*(?:days?|din\b|రోజుల్లో|రోజులలో|రోజులు|రోజు|दिनों|दिन|நாட்களில்|நாட்கள்|ದಿನಗಳಲ್ಲಿ|ದಿನಗಳು|दिवसांत)/i);
  if (daysMatch) {
    availabilityDays = parseInt(daysMatch[1], 10);
  }

  return {
    commodity: matchedCommodity,
    commodityId: matchedCommodityId,
    quantityKg,
    availabilityDays,
    originalText: rawText,
    confidence: 95
  };
}
