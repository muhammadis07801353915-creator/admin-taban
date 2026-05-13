const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://kdlwstunxgbwxwafhvkm.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkbHdzdHVueGdid3h3YWZodmttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMjc4MjgsImV4cCI6MjA5MjgwMzgyOH0.bI3uXegL9aHqQh3OFxqHYBHR_NOSYg1zaJOa_8mBs3k');

// Brands with fewer than 20 models that need filling:
// Audi(16), Changan(6), Chevrolet(10), Dodge(5), Ford(11), GMC(5),
// Honda(9), Hyundai(11), Jeep(6), Kia(11), Land Rover(6),
// Lexus(9), Mazda(8), Mitsubishi(6), Volkswagen(11), Volvo(7)

const brandModels = {
    "Audi": [
        "A1", "A3", "A4", "A5", "A6", "A7", "A8",
        "Q2", "Q3", "Q4 e-tron", "Q5", "Q6", "Q7", "Q8",
        "Q8 e-tron", "R8", "TT", "TTS", "RS3", "RS4", "RS5",
        "RS6", "RS7", "RS Q3", "RS Q8", "S3", "S4", "S5",
        "S6", "S7", "S8", "e-tron", "e-tron GT", "e-tron Sportback"
    ],
    "Changan": [
        "CS15", "CS35", "CS35 Plus", "CS55", "CS55 Plus", "CS75", "CS75 Plus",
        "CS85", "CS95", "Alsvin", "Eado", "Eado Plus", "Raeton",
        "Raeton CC", "Hunter", "Uni-T", "Uni-K", "Uni-V", "Uni-Z",
        "Lamore", "Deepal S7", "Deepal L7", "Deepal SL03", "Star S7",
        "Shenlan SL03", "Lumin EV", "Auchan X5", "Auchan X7", "Kaicene F70"
    ],
    "Chevrolet": [
        "Spark", "Aveo", "Cruze", "Malibu", "Impala", "Camaro", "Corvette",
        "Sonic", "Trax", "Equinox", "Blazer", "Traverse", "Tahoe", "Suburban",
        "Colorado", "Silverado 1500", "Silverado 2500", "Silverado 3500",
        "Express", "Captiva", "Trailblazer", "Orlando", "Volt", "Bolt EV",
        "Bolt EUV", "Monte Carlo", "SS", "HHR", "Uplander"
    ],
    "Dodge": [
        "Charger", "Challenger", "Durango", "Journey", "Ram 1500", "Ram 2500",
        "Ram 3500", "Grand Caravan", "Dakota", "Viper", "Dart", "Avenger",
        "Nitro", "Caliber", "Neon", "Stratus", "Intrepid", "Magnum",
        "Stealth", "Spirit", "Shadow", "Raider", "Colt", "Dynasty", "Monaco"
    ],
    "Ford": [
        "Fiesta", "Focus", "Fusion", "Mondeo", "Taurus", "Mustang",
        "EcoSport", "Escape", "Edge", "Explorer", "Expedition",
        "Ranger", "F-150", "F-250", "F-350", "Maverick", "Bronco",
        "Bronco Sport", "Puma", "Kuga", "Galaxy", "S-Max", "Mach-E",
        "Transit", "Transit Connect", "Tourneo", "Territory", "Everest"
    ],
    "GMC": [
        "Terrain", "Acadia", "Yukon", "Yukon XL", "Sierra 1500",
        "Sierra 2500", "Sierra 3500", "Canyon", "Envoy", "Jimmy",
        "Safari", "Sonoma", "Typhoon", "Syclone", "Envision",
        "Hummer EV", "Suburban", "Savana", "Topkick", "W-Series"
    ],
    "Honda": [
        "Civic", "Accord", "City", "Jazz", "Fit", "CR-V", "HR-V",
        "Pilot", "Passport", "Ridgeline", "Odyssey", "Insight",
        "e", "e:NS1", "e:NP1", "ZR-V", "BR-V", "WR-V",
        "Freed", "Stream", "Airwave", "Mobilio", "Brio",
        "Amaze", "Elevate", "CR-Z", "S2000", "NSX"
    ],
    "Hyundai": [
        "i10", "i20", "i30", "i40", "i20 Active", "Elantra",
        "Sonata", "Azera", "Accent", "Verna", "Kona", "Tucson",
        "Santa Fe", "Santa Cruz", "Palisade", "Venue", "ix35",
        "ix55", "Ioniq", "Ioniq 5", "Ioniq 6", "Nexo", "Staria",
        "H1", "H350", "Veloster", "Genesis G80", "Creta", "Bayon"
    ],
    "Jeep": [
        "Renegade", "Compass", "Cherokee", "Grand Cherokee",
        "Grand Cherokee L", "Wrangler", "Gladiator", "Wagoneer",
        "Grand Wagoneer", "Avenger", "Commander", "Patriot",
        "Liberty", "Scrambler", "CJ-5", "CJ-7", "CJ-8",
        "TJ", "YJ", "XJ", "MJ", "ZJ", "WJ", "KJ", "KK"
    ],
    "Kia": [
        "Picanto", "Rio", "Ceed", "Pro Ceed", "Xceed", "Stinger",
        "Sportage", "Sorento", "Telluride", "Carnival", "EV6",
        "EV9", "Seltos", "K5", "K8", "K9", "Niro", "Soul",
        "Mohave", "Stonic", "Ray", "Morning", "Bongo",
        "Cerato", "Optima", "Cadenza", "Quoris", "Forte"
    ],
    "Land Rover": [
        "Defender 90", "Defender 110", "Defender 130",
        "Discovery", "Discovery Sport", "Discovery 3", "Discovery 4",
        "Range Rover", "Range Rover Sport", "Range Rover Velar",
        "Range Rover Evoque", "Range Rover SV", "Freelander",
        "Freelander 2", "Series I", "Series II", "Series III",
        "LR2", "LR3", "LR4", "Defender Works V8"
    ],
    "Lexus": [
        "IS", "IS F", "ES", "GS", "LS", "LS 500", "LS 500h",
        "NX", "NX 350h", "RX", "RX 350", "RX 500h", "GX", "LX",
        "LC", "LC 500", "LC 500h", "UX", "UX 250h", "RZ",
        "CT", "HS", "SC", "RC", "RC F", "LFA", "LM"
    ],
    "Mazda": [
        "Mazda2", "Mazda3", "Mazda6", "CX-3", "CX-30", "CX-5",
        "CX-8", "CX-9", "MX-5 Miata", "MX-30", "RX-7", "RX-8",
        "BT-50", "CX-50", "CX-60", "CX-70", "CX-80", "CX-90",
        "323", "626", "929", "MX-3", "MX-6", "Tribute",
        "Protege", "Millenia", "Demio", "Atenza", "Axela"
    ],
    "Mitsubishi": [
        "Mirage", "Mirage G4", "Lancer", "Lancer Evolution",
        "Galant", "ASX", "Eclipse Cross", "Outlander", "Outlander PHEV",
        "Pajero", "Pajero Sport", "L200", "Triton", "Delica",
        "Colt", "Grandis", "RVR", "Sigma", "Starion",
        "3000GT", "FTO", "GTO", "Carisma", "Space Star", "Xpander"
    ],
    "Volkswagen": [
        "Polo", "Golf", "Golf GTI", "Golf R", "Jetta", "Passat",
        "Arteon", "Phaeton", "Tiguan", "T-Roc", "T-Cross", "Touareg",
        "Touran", "ID.3", "ID.4", "ID.5", "ID.6", "ID.7", "ID. Buzz",
        "Scirocco", "Beetle", "CC", "Up!", "Sharan", "Caddy",
        "Transporter", "Multivan", "Amarok", "Crafter", "Taigo"
    ],
    "Volvo": [
        "S40", "S60", "S60 Cross Country", "S90", "V40",
        "V40 Cross Country", "V60", "V60 Cross Country", "V90",
        "V90 Cross Country", "XC40", "XC40 Recharge", "XC60",
        "XC70", "XC90", "C30", "C70", "C40 Recharge",
        "EX30", "EX90", "EC40", "850", "940", "960"
    ]
};

async function run() {
    const { data: brands, error: bError } = await supabase.from('brands').select('id, name');
    if (bError) { console.error(bError); return; }

    for (const [brandName, models] of Object.entries(brandModels)) {
        const brand = brands.find(b => b.name.toLowerCase().trim() === brandName.toLowerCase().trim());
        if (!brand) { console.log(`NOT FOUND: ${brandName}`); continue; }

        const { data: existing } = await supabase.from('models').select('name').eq('brand_id', brand.id);
        const existingNames = (existing || []).map(m => m.name.toLowerCase().trim());

        const toAdd = models
            .filter(name => !existingNames.includes(name.toLowerCase().trim()))
            .map(name => ({ name, brand_id: brand.id }));

        if (toAdd.length > 0) {
            const { error } = await supabase.from('models').insert(toAdd);
            if (error) console.error(`Error for ${brandName}:`, error.message);
            else console.log(`✅ ${brandName}: +${toAdd.length} models (total ~${existingNames.length + toAdd.length})`);
        } else {
            console.log(`⏭  ${brandName}: already has ${existingNames.length} models, nothing to add`);
        }
    }
    console.log('\nDone!');
}

run();
