const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://kdlwstunxgbwxwafhvkm.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkbHdzdHVueGdid3h3YWZodmttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMjc4MjgsImV4cCI6MjA5MjgwMzgyOH0.bI3uXegL9aHqQh3OFxqHYBHR_NOSYg1zaJOa_8mBs3k');

async function run() {
    const { data: brands, error: bError } = await supabase.from('brands').select('id, name');
    if (bError) {
        console.error('Error fetching brands:', bError);
        return;
    }

    const brandModels = {
        "Chery": [
            "Tiggo 2", "Tiggo 3", "Tiggo 4", "Tiggo 7", "Tiggo 8", "Arrizo 5", "Arrizo 6", "Omoda 5", "EQ1", "EQ5", 
            "Tiggo 5x", "Tiggo 3xe", "Tiggo e", "Arrizo GX", "Arrizo 5 Plus", "Arrizo 5 Pro", "Tiggo 8 Plus", "Tiggo 8 Pro", 
            "Tiggo 7 Pro", "Tiggo 4 Pro", "E3", "E5", "Fulwin 2", "QQ", "QQ3", "QQ6", "Tiggo 3x", "Tiggo 5", "Tiggo 7 Plus", 
            "Tiggo 8 Plus Kunpeng Edition", "Arrizo 3", "Arrizo 7", "Cowin 1", "Cowin 2", "Cowin 3", "Cowin 5", "Eastar", 
            "Karry", "Riich G5", "Riich G6", "Riich M1", "Riich X1"
        ],
        "Great Wall / Haval": [
            "H6", "Jolion", "H9", "Dargo", "F7", "F7x", "H2", "H4", "M6", "Big Dog", "Shenshou", "Chitu", "Cool Dog", 
            "Poer", "Cannon", "Steed", "Wingle 7", "Tank 300", "Tank 500", "Ora Good Cat", "Wingle 5", "Wingle 6", 
            "Voleex C30", "Deer", "Safe", "H1", "H3", "H5", "H7", "H8", "M1", "M2", "M4", "Voleex C10", "Voleex C20R", 
            "Voleex C50", "Florid", "Coolbear", "Peri"
        ],
        "Infiniti": [
            "Q50", "Q60", "Q70", "QX30", "QX50", "QX55", "QX60", "QX70", "QX80", "G35", "G37", "M35", "M37", "EX35", 
            "FX35", "FX50", "JX35", "Q45", "I30", "I35", "QX4", "QX56", "QX70 Limited", "J30", "QX80 Limited", "M30", 
            "QX70S", "Q50S", "Q60S", "QX60 Monograph", "Q80 Inspiration", "Q30"
        ],
        "Jetour": [
            "X70", "X70 Plus", "X70 Coupe", "X70M", "X70S", "X90", "X90 Plus", "X95", "Dashing", "Traveler", "T-1", 
            "Ice Cream", "X70 PRO", "X90 PRO", "X70 PLUS Special Edition", "Shanhai L9", "Shanhai T2", "X-1", "X-2", 
            "Jetour Dasheng", "Jetour T-2"
        ],
        "MG": [
            "MG3", "MG5", "MG6", "MG ZS", "MG ZS EV", "MG HS", "MG EHS", "MG RX5", "MG RX8", "MG GT", "MG4 EV", "MG5 EV", 
            "MG Marvel R", "MG One", "MG Hector", "MG Gloster", "MG Astor", "MG Mulan", "MG Cyberster", "MG350", "MG550", 
            "MG750", "MG Magnette", "MG MGB", "MG MGC", "MG Midget", "MG RV8", "MG TF", "MG ZR", "MG ZS (Old)", "MG ZT"
        ],
        "Peugeot": [
            "108", "208", "308", "408", "508", "2008", "3008", "4008", "5008", "RCZ", "Partner", "Rifter", "Expert", 
            "Traveller", "Boxer", "301", "107", "207", "206", "407", "607", "807", "Bipper", "Hoggar", "106", "205", 
            "305", "306", "307", "405", "406", "605", "RCZ R", "1007", "4007"
        ],
        "Porsche": [
            "911 Carrera", "911 Targa", "911 Turbo", "911 GT3", "718 Boxster", "718 Cayman", "718 Spyder", "Panamera", 
            "Panamera Sport Turismo", "Macan", "Macan S", "Macan GTS", "Cayenne", "Cayenne Coupe", "Taycan", 
            "Taycan Cross Turismo", "Taycan Sport Turismo", "918 Spyder", "Carrera GT", "924", "944", "928", "968", 
            "356", "550 Spyder", "904", "912", "914", "959", "Cayman GT4", "911 GT2 RS"
        ],
        "Renault": [
            "Clio", "Megane", "Megane E-Tech", "Talisman", "Captur", "Kadjar", "Koleos", "Arkana", "Zoe", "Twingo", 
            "Scenic", "Grand Scenic", "Espace", "Kangoo", "Trafic", "Master", "Duster", "Kwid", "Sandero", "Logan", 
            "Symbol", "Fluence", "Safrane", "Dokker", "4", "5", "9", "11", "12", "14", "15", "16", "17", "18", "19", 
            "20", "21", "25", "30", "Fuego", "Laguna", "Vel Satis", "Wind"
        ],
        "Suzuki": [
            "Swift", "Swift Sport", "Vitara", "Grand Vitara", "Jimny", "Baleno", "Ciaz", "Ertiga", "Dzire", "SX4 S-Cross", 
            "Ignis", "Alto", "Celerio", "Wagon R", "S-Presso", "Carry", "APV", "Kizashi", "XL7", "Samurai", "Aerio", 
            "Cappuccino", "Cultus", "Equator", "Esteem", "Forenza", "Liana", "Reno", "Sidekick", "Verona", "X-90"
        ],
        "Tesla": [
            "Model S", "Model 3", "Model X", "Model Y", "Cybertruck", "Roadster", "Semi", "Model S Plaid", "Model X Plaid", 
            "Model 3 Highland", "Roadster (Original)", "Cybertruck Prototype"
        ]
    };

    for (const [brandName, models] of Object.entries(brandModels)) {
        const brand = brands.find(b => 
            b.name.toLowerCase().trim() === brandName.toLowerCase().trim()
        );

        if (!brand) {
            console.log(`Brand not found: ${brandName}`);
            continue;
        }

        console.log(`Checking models for ${brand.name} (${brand.id})...`);
        
        const { data: existingModels } = await supabase.from('models').select('name').eq('brand_id', brand.id);
        const existingNames = (existingModels || []).map(m => m.name.toLowerCase().trim());

        const toAdd = models
            .filter(name => !existingNames.includes(name.toLowerCase().trim()))
            .map(name => ({ name, brand_id: brand.id }));

        if (toAdd.length > 0) {
            const { error: iError } = await supabase.from('models').insert(toAdd);
            if (iError) console.error(`Error adding models for ${brandName}:`, iError);
            else console.log(`Added ${toAdd.length} NEW models for ${brandName}`);
        } else {
            console.log(`All models already exist for ${brandName}`);
        }
    }
}

run();
