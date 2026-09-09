import { Commodity } from '../models/Commodity';

export interface IParsedEntity {
  commodity: string;
  commodityId?: string;
  quantityKg: number;
  availabilityDays: number;
  originalText: string;
  confidence: number;
}

export async function parseFarmerInputText(rawText: string): Promise<IParsedEntity> {
  const text = rawText.toLowerCase().trim();

  // 1. Identify Commodity
  const commodities = await Commodity.find({}).lean();
  let matchedCommodity = 'Tomato';
  let matchedCommodityId: string | undefined = undefined;

  for (const c of commodities) {
    const cName = c.name.toLowerCase();
    if (text.includes(cName) || text.includes(cName.split(' ')[0])) {
      matchedCommodity = c.name;
      matchedCommodityId = c._id.toString();
      break;
    }
  }

  // Synonym fallbacks
  if (text.includes('tamatar') || text.includes('thakkali') || text.includes('tamata')) {
    const tomatoDoc = commodities.find((c) => c.name.toLowerCase().includes('tomato'));
    if (tomatoDoc) {
      matchedCommodity = tomatoDoc.name;
      matchedCommodityId = tomatoDoc._id.toString();
    }
  } else if (text.includes('pyaaz') || text.includes('vengayam') || text.includes('ullipaya')) {
    const onionDoc = commodities.find((c) => c.name.toLowerCase().includes('onion'));
    if (onionDoc) {
      matchedCommodity = onionDoc.name;
      matchedCommodityId = onionDoc._id.toString();
    }
  } else if (text.includes('aloo') || text.includes('urulaikizhangu') || text.includes('bangaladumpa')) {
    const potatoDoc = commodities.find((c) => c.name.toLowerCase().includes('potato'));
    if (potatoDoc) {
      matchedCommodity = potatoDoc.name;
      matchedCommodityId = potatoDoc._id.toString();
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

  // Check tonnes / tons
  const tonneMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:tonnes?|tons?|t\b)/i);
  if (tonneMatch) {
    quantityKg = Math.round(parseFloat(tonneMatch[1]) * 1000);
  } else {
    // Check quintals
    const quintalMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:quintals?|qtl\b)/i);
    if (quintalMatch) {
      quantityKg = Math.round(parseFloat(quintalMatch[1]) * 100);
    } else {
      // Check kg / kilograms
      const kgMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:kg|kgs|kilograms?)/i);
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

  // Check word numbers (five, 5, three, etc.)
  const wordMap: Record<string, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    today: 0,
    tomorrow: 1
  };

  for (const [word, val] of Object.entries(wordMap)) {
    if (text.includes(word)) {
      availabilityDays = val;
      break;
    }
  }

  const daysMatch = text.match(/(\d+)\s*(?:days?|din\b)/i);
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
