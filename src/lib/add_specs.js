const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://kdlwstunxgbwxwafhvkm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkbHdzdHVueGdid3h3YWZodmttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMjc4MjgsImV4cCI6MjA5MjgwMzgyOH0.bI3uXegL9aHqQh3OFxqHYBHR_NOSYg1zaJOa_8mBs3k'
);

const MODEL_SPECS = {
  // Toyota
  "Camry": ["LE","SE","SE Nightshade","XLE","XLE V6","XSE","XSE V6","TRD","Hybrid LE","Hybrid SE","Hybrid XLE","Hybrid XSE"],
  "Corolla": ["L","LE","SE","XLE","XSE","Apex Edition","Hybrid LE","Hybrid SE","GR Corolla"],
  "RAV4": ["LE","XLE","XLE Premium","Adventure","TRD Off-Road","Limited","Prime SE","Prime XSE","Prime XSE Premium"],
  "Highlander": ["L","LE","XLE","XSE","Limited","Platinum","Hybrid LE","Hybrid XLE","Hybrid Limited","Hybrid Platinum"],
  "Land Cruiser": ["GX","GXR","VX","VXR","EXR","Safari","GR Sport","Heritage Edition","ZX"],
  "Land Cruiser Prado": ["TX","TXL","VX","VXR","GX","GXR"],
  "4Runner": ["SR5","SR5 Premium","TRD Off-Road","TRD Off-Road Premium","Limited","Nightshade","TRD Pro"],
  "Tacoma": ["SR","SR5","TRD Sport","TRD Off-Road","Limited","TRD Pro","Trail Edition"],
  "Tundra": ["SR","SR5","Limited","Platinum","1794 Edition","TRD Pro","Capstone"],
  "Prius": ["LE","XLE","Limited","Prime LE","Prime XLE","Prime Limited","Prime XSE"],
  "Avalon": ["XLE","Limited","Touring","TRD","Hybrid XLE","Hybrid Limited"],
  "Supra": ["2.0","3.0","3.0 Premium","A91-CF Edition","45th Anniversary Edition"],
  "GR86": ["GR86","Premium","Special Edition"],
  "Sienna": ["LE","XLE","XSE","Limited","Platinum"],
  "Sequoia": ["SR5","Limited","Platinum","Capstone","TRD Pro"],
  "Venza": ["LE","XLE","Limited"],
  "C-HR": ["LE","XLE","XLE Premium","Limited","Nightshade"],
  "Crown": ["XLE","Limited","Platinum"],
  "Yaris": ["L","LE","XLE","SE"],
  "FJ Cruiser": ["Base","Trail Teams","Ultimate Edition"],
  "Fortuner": ["EXR","VXR","GR Sport","Legender"],
  "Hilux": ["GL","GLX","Adventure","GR Sport","Invincible","Rogue"],

  // Honda
  "Civic": ["LX","Sport","EX","EX-L","Touring","Si","Type R","Sport Touring"],
  "Accord": ["LX","Sport","Sport-L","EX-L","Touring","Hybrid Sport","Hybrid EX-L","Hybrid Touring"],
  "CR-V": ["LX","EX","EX-L","Touring","Hybrid EX","Hybrid EX-L","Hybrid Touring"],
  "Pilot": ["LX","EX","EX-L","Touring","Elite","TrailSport","Black Edition"],
  "HR-V": ["LX","Sport","EX","EX-L"],
  "Odyssey": ["LX","EX","EX-L","Touring","Elite"],
  "City": ["LX","DX","EX","Sport","Touring"],
  "Jazz": ["S","E","RS","Crosstar"],
  "Fit": ["LX","Sport","EX","EX-L"],
  "Passport": ["Sport","EX-L","Touring","Elite","TrailSport","Black Edition"],
  "Ridgeline": ["Sport","RTL","RTL-E","Black Edition"],

  // BMW
  "3 Series": ["320i","330i","330e","M340i","330d","M3","M3 Competition"],
  "5 Series": ["520i","530i","540i","M550i","530e","M5","M5 Competition"],
  "7 Series": ["740i","750i","760i","M760i","740Li","PHEV","Alpina B7"],
  "X3": ["sDrive20i","xDrive30i","xDrive30e","M40i","M Competition"],
  "X5": ["sDrive40i","xDrive40i","xDrive50e","M60i","M Competition"],
  "X1": ["sDrive18i","xDrive28i","xDrive30e","M35i"],
  "X7": ["xDrive40i","xDrive50i","M60i","Alpina XB7"],
  "M3": ["M3","M3 Competition","M3 CS","M3 Touring"],
  "M5": ["M5","M5 Competition","M5 CS"],
  "i4": ["eDrive35","eDrive40","M50","xDrive40"],
  "iX": ["xDrive40","xDrive50","M60"],
  "i7": ["xDrive60","M70 xDrive"],

  // Mercedes-Benz
  "C-Class": ["C200","C300","C43 AMG","C63 AMG","C63 S AMG","C63 S E Performance"],
  "E-Class": ["E200","E300","E350","E450","E53 AMG","E63 AMG","E63 S AMG"],
  "S-Class": ["S450","S500","S580","S680 Maybach","AMG S63","AMG S65"],
  "GLE": ["GLE300d","GLE350","GLE450","GLE53 AMG","GLE63 AMG","GLE63 S AMG"],
  "GLC": ["GLC200","GLC300","GLC43 AMG","GLC63 AMG","GLC63 S AMG"],
  "GLS": ["GLS450","GLS580","AMG GLS63","Maybach GLS600"],
  "G-Class": ["G500","G63 AMG","G65 AMG"],
  "A-Class": ["A180","A200","A220","A250","AMG A35","AMG A45"],
  "GLA": ["GLA200","GLA250","AMG GLA35","AMG GLA45"],
  "CLA": ["CLA200","CLA250","AMG CLA35","AMG CLA45"],
  "EQS": ["EQS450+","EQS580 4MATIC","AMG EQS53"],
  "EQE": ["EQE300","EQE350","EQE350+","AMG EQE53"],

  // Audi
  "A3": ["S line","Premium","Premium Plus","Prestige","S3","RS3"],
  "A4": ["Premium","Premium Plus","Prestige","S4","RS4"],
  "A5": ["Premium","Premium Plus","Prestige","S5","RS5"],
  "A6": ["Premium","Premium Plus","Prestige","S6","RS6"],
  "A7": ["Premium","Premium Plus","Prestige","S7","RS7"],
  "Q3": ["Premium","Premium Plus","Prestige","RS Q3"],
  "Q5": ["Premium","Premium Plus","Prestige","SQ5","RS Q5"],
  "Q7": ["Premium","Premium Plus","Prestige","SQ7"],
  "Q8": ["Premium","Premium Plus","Prestige","SQ8","RS Q8"],
  "e-tron GT": ["e-tron GT","RS e-tron GT","RS e-tron GT performance"],

  // Nissan
  "Patrol": ["XE","SE","LE","Platinum","Nismo","Super Safari","Titanium"],
  "Altima": ["S","SV","SR","SL","Platinum","SR VC-Turbo"],
  "Maxima": ["S","SV","SR","Platinum"],
  "Sentra": ["S","SV","SR"],
  "Qashqai": ["S","SV","SL","Platinum"],
  "X-Trail": ["S","SV","SL","Platinum","e-POWER"],
  "Pathfinder": ["S","SV","SL","Platinum","Rock Creek"],
  "Armada": ["S","SV","SL","Platinum"],
  "Murano": ["S","SV","SL","Platinum"],
  "GT-R": ["Premium","Track Edition","NISMO"],
  "Leaf": ["S","SV Plus","SL Plus"],

  // Kia
  "Sportage": ["LX","S","EX","SX","SX Prestige","Hybrid EX","X-Pro"],
  "Sorento": ["LX","S","EX","SX","SX Prestige","Hybrid EX","Plug-in Hybrid"],
  "Stinger": ["GT-Line","GT1","GT2","GT-Line AWD"],
  "EV6": ["Standard RWD","Long Range RWD","Long Range AWD","GT"],
  "Telluride": ["LX","S","EX","SX","SX-P","X-Pro","X-Line"],
  "K5": ["LX","LXS","GT-Line","EX","GT"],
  "Carnival": ["LX","EX","SX","SX Prestige"],
  "Cerato": ["EX","SX","GT"],
  "Picanto": ["LX","EX","X-Line","GT-Line"],
  "Ceed": ["S","M","GT-Line","GT"],
  "Soul": ["LX","S","EX","GT-Line","Turbo"],

  // Hyundai
  "Elantra": ["SE","SEL","N Line","Limited","N","Hybrid Blue","Hybrid SEL","Hybrid Limited"],
  "Sonata": ["SE","SEL","SEL Plus","Limited","N Line","Hybrid Blue","Hybrid SEL","Hybrid Limited"],
  "Tucson": ["SE","SEL","N Line","Limited","Hybrid SE","Hybrid SEL","Hybrid N Line","PHEV"],
  "Santa Fe": ["SE","SEL","XRT","Limited","Calligraphy","Hybrid SEL","Hybrid Calligraphy"],
  "Palisade": ["SE","SEL","XRT","Limited","Calligraphy"],
  "Kona": ["SE","SEL","N Line","Limited","Electric Standard","Electric Extended"],
  "Ioniq 5": ["Standard RWD","Standard AWD","Long Range RWD","Long Range AWD","N"],
  "Ioniq 6": ["Standard RWD","Long Range RWD","Long Range AWD","SE","SEL","Limited"],

  // Lexus
  "IS": ["IS300","IS350","IS500 F Sport","IS350 F Sport"],
  "ES": ["ES250","ES300h","ES350","F Sport"],
  "LS": ["LS500","LS500h","LS500 F Sport"],
  "NX": ["NX250","NX350","NX350h","NX450h+","F Sport","Overtrail"],
  "RX": ["RX350","RX350h","RX500h","F Sport","Luxury","Premium"],
  "GX": ["GX460 Premium","GX460 Luxury","GX460 F Sport"],
  "LX": ["LX600 Premium","LX600 Luxury","LX600 F Sport","LX600 Ultra Luxury"],
  "UX": ["UX200","UX250h","F Sport"],
  "LC": ["LC500","LC500h","Inspiration Series"],

  // Land Rover
  "Range Rover": ["S","SE","HSE","Autobiography","SV","PHEV"],
  "Range Rover Sport": ["S","SE","HSE","Dynamic","Autobiography","SVR"],
  "Range Rover Velar": ["S","SE","HSE","R-Dynamic S","R-Dynamic SE","R-Dynamic HSE"],
  "Range Rover Evoque": ["S","SE","HSE","R-Dynamic S","R-Dynamic SE","R-Dynamic HSE","Bronze Collection"],
  "Discovery": ["S","SE","HSE","R-Dynamic S","R-Dynamic SE","R-Dynamic HSE","Metropolitan Edition"],
  "Discovery Sport": ["S","SE","HSE","R-Dynamic S","R-Dynamic SE","R-Dynamic HSE"],
  "Defender 90": ["S","SE","HSE","X","V8","X-Dynamic SE","Carpathian Edition"],
  "Defender 110": ["S","SE","HSE","X","V8","X-Dynamic SE","Outbound"],

  // Jeep
  "Grand Cherokee": ["Laredo","Altitude","Overland","Summit","Trailhawk","SRT","Trackhawk","4xe"],
  "Wrangler": ["Sport","Sport S","Willys","Freedom","Sahara","Rubicon","392","4xe"],
  "Cherokee": ["Latitude","Latitude Plus","Altitude","Trailhawk","Limited","Overland"],
  "Compass": ["Sport","Latitude","Latitude Plus","Altitude","Trailhawk","Limited"],
  "Gladiator": ["Sport","Sport S","Willys","Overland","Rubicon","Mojave"],

  // Ford
  "F-150": ["XL","XLT","Lariat","King Ranch","Platinum","Limited","Raptor","Raptor R","Tremor"],
  "Mustang": ["EcoBoost","EcoBoost Premium","GT","GT Premium","Mach 1","Shelby GT500","Dark Horse"],
  "Explorer": ["Base","XLT","ST-Line","Limited","Timberline","Platinum","ST"],
  "Escape": ["S","SE","SEL","Titanium","PHEV SE","PHEV Titanium"],
  "Ranger": ["XL","XLT","Lariat","Tremor","Raptor"],
  "Bronco": ["Base","Big Bend","Black Diamond","Outer Banks","Badlands","Wildtrak","Everglades","Raptor"],
  "Expedition": ["XLT","Limited","Tremor","Platinum","King Ranch","Timberline","Max"],
  "Maverick": ["XL","XLT","Lariat","Tremor"],
  "Edge": ["SE","SEL","Titanium","ST"],

  // Chevrolet
  "Tahoe": ["LS","LT","RST","Z71","Premier","High Country"],
  "Suburban": ["LS","LT","RST","Z71","Premier","High Country"],
  "Silverado 1500": ["WT","Custom","LT","RST","LTZ","High Country","Trail Boss","ZR2"],
  "Equinox": ["LS","LT","RS","Premier"],
  "Traverse": ["LS","LT","RS","Premier","High Country"],
  "Camaro": ["LS","LT","LT1","SS","ZL1","ZL1 1LE"],
  "Corvette": ["Stingray 1LT","Stingray 2LT","Stingray 3LT","Z06","E-Ray","ZR1"],
  "Colorado": ["WT","LT","Z71","ZR2","Trail Boss"],
  "Blazer": ["LT","RS","Premier"],
  "Trailblazer": ["LS","LT","ACTIV","RS","Premier"],

  // GMC
  "Yukon": ["SLE","SLT","AT4","Denali","Denali Ultimate"],
  "Yukon XL": ["SLE","SLT","AT4","Denali","Denali Ultimate"],
  "Sierra 1500": ["Pro","SLE","SLT","AT4","Denali","AT4X","Denali Ultimate"],
  "Terrain": ["SLE","SLT","AT4","Denali"],
  "Acadia": ["SLE","SLT","AT4","Denali"],
  "Canyon": ["Elevation","AT4","Denali","AT4X"],

  // Dodge
  "Charger": ["SXT","GT","R/T","R/T Scat Pack","SRT 392","SRT Hellcat","SRT Hellcat Widebody","SRT Jailbreak"],
  "Challenger": ["SXT","GT","R/T","R/T Scat Pack","SRT 392","SRT Hellcat","SRT Super Stock","SRT Demon"],
  "Durango": ["SXT","GT","Citadel","R/T","SRT 392","SRT Hellcat"],
  "Ram 1500": ["Tradesman","Big Horn","Lone Star","Laramie","Rebel","Longhorn","Limited","TRX"],
  "Ram 2500": ["Tradesman","Big Horn","Laramie","Power Wagon","Longhorn","Limited"],

  // Mazda
  "Mazda3": ["S","Select","Preferred","Premium","Premium Plus","Turbo Premium","Turbo Premium Plus"],
  "Mazda6": ["Sport","Touring","Grand Touring","Grand Touring Reserve","Signature"],
  "CX-5": ["S","Select","Preferred","Carbon Edition","Premium","Premium Plus","Turbo","Turbo Premium Plus"],
  "CX-9": ["Sport","Touring","Carbon Edition","Grand Touring","Grand Touring Reserve","Signature"],
  "CX-30": ["S","Select","Preferred","Premium","Premium Plus","Turbo","Turbo Premium Plus"],
  "MX-5 Miata": ["Sport","Club","Grand Touring","RF Club","RF Grand Touring"],

  // Volkswagen
  "Golf GTI": ["S","SE","Autobahn","40th Anniversary"],
  "Golf R": ["Golf R","Golf R 20 Years"],
  "Passat": ["S","SE","SEL","R-Line","Limited Edition"],
  "Tiguan": ["S","SE","SEL","SEL Premium","R-Line","R"],
  "Jetta": ["S","Sport","SE","SEL","GLI S","GLI Autobahn","GLI 35th Anniversary"],
  "Arteon": ["SE","SEL","SEL R-Line","SEL Premium","SEL Premium R-Line"],

  // Volvo
  "XC90": ["Core","Plus","Ultimate","Recharge Plus","Recharge Ultimate","R-Design","T8 Recharge"],
  "XC60": ["Core","Plus","Ultimate","Recharge Plus","Recharge Ultimate","R-Design","Polestar"],
  "XC40": ["Core","Plus","Ultimate","Recharge Core","Recharge Plus","Recharge Ultimate","R-Design"],
  "S90": ["Core","Plus","Ultimate","Recharge Plus","Recharge Ultimate"],
  "V90": ["Core","Plus","Ultimate","Cross Country","Cross Country Ultimate"],
  "S60": ["Core","Plus","Ultimate","Recharge Plus","Polestar Engineered"],

  // Mitsubishi
  "Outlander": ["ES","SE","SE Black Edition","SEL","SEL Black Edition","PHEV ES","PHEV SE","PHEV SEL"],
  "Eclipse Cross": ["ES","LE","SE","SEL","PHEV"],
  "Pajero": ["GL","GLX","GLS","GLS Sport","Ultimate"],
  "Pajero Sport": ["GLX","GLS","GT"],
  "Lancer": ["ES","SE","GT","Ralliart","Evolution GSR","Evolution MR"],
  "ASX": ["Invite","Intense","Instyle"],
  "Xpander": ["GLS","Ultimate"],

  // Subaru
  "Outback": ["Base","Premium","Limited","Onyx Edition","Onyx Edition XT","Limited XT","Touring","Wilderness"],
  "Forester": ["Base","Premium","Sport","Limited","Touring","Wilderness"],
  "Impreza": ["Base","Premium","Sport","Limited","RS"],
  "Crosstrek": ["Base","Premium","Sport","Limited","Wilderness","Hybrid"],
  "WRX": ["Base","Premium","GT","WRX TR","STI"],
  "BRZ": ["Premium","Limited","tS"],

  // MG
  "MG ZS": ["Standard","Comfort","Luxury","Trophy","ZS EV Standard","ZS EV Comfort","ZS EV Luxury"],
  "MG HS": ["Standard","Comfort","Luxury","Trophy","PHEV","EHS Luxury"],
  "MG6": ["Standard","Luxury","X-Motion","Trophy"],
  "MG5": ["Standard","Comfort","Luxury","EV Standard","EV Comfort","EV Luxury"],
  "MG RX5": ["Standard","Comfort","Luxury"],
  "MG4 EV": ["Standard","Comfort","Luxury","XPOWER"],
  "MG Mulan": ["Standard RWD","Comfort RWD","Luxury RWD","XPOWER AWD"],

  // Peugeot
  "208": ["Access","Active","Allure","GT","GT Premium","e-208 Active","e-208 Allure","e-208 GT"],
  "308": ["Access","Active","Allure","GT","GT Premium","SW Active","SW GT"],
  "508": ["Active","Allure","GT","GT Premium","SW GT","Hybrid","Plug-in Hybrid GT"],
  "2008": ["Access","Active","Allure","GT","e-2008 Active","e-2008 Allure","e-2008 GT"],
  "3008": ["Active","Allure","GT","GT Premium","Hybrid","Plug-in Hybrid","GT Pack"],
  "5008": ["Active","Allure","GT","GT Premium","Hybrid"],

  // Renault
  "Clio": ["Life","Zen","Intens","RS Line","E-Tech","E-Tech Full Hybrid","RS"],
  "Megane": ["Life","Zen","Intens","RS Line","GT","RS","E-Tech","Trophy"],
  "Captur": ["Life","Zen","Intens","RS Line","E-Tech","Plug-in Hybrid"],
  "Kadjar": ["Life","Zen","Intens","Bose Edition"],
  "Koleos": ["Life","Zen","Intens","Bose Edition","4WD"],
  "Duster": ["Access","Comfort","Prestige","4WD"],
  "Arkana": ["Life","Zen","Intens","RS Line","E-Tech"],
  "Sandero": ["Access","Life","Comfort","Prestige","Stepway"],
  "Logan": ["Access","Life","Comfort","Prestige"],

  // Suzuki
  "Swift": ["GL","GLX","Sport","GLX Turbo"],
  "Vitara": ["GL","GLX","GLX Turbo","Allgrip"],
  "Grand Vitara": ["GL","GLX","Limited","AllGrip"],
  "Jimny": ["GA","JL","JLX","Heritage"],
  "Ertiga": ["GA","GL","GLX","Sport"],
  "Baleno": ["GL","GLX","Delta"],
  "Ciaz": ["GL","GLX","Limited"],

  // Porsche
  "911 Carrera": ["Carrera","Carrera S","Carrera 4","Carrera 4S","GTS","4 GTS"],
  "911 Turbo": ["Turbo","Turbo S"],
  "911 GT3": ["GT3","GT3 RS","GT3 Touring"],
  "718 Cayman": ["718 Cayman","718 Cayman S","718 Cayman GTS 4.0","718 Cayman GT4","718 Cayman GT4 RS"],
  "718 Boxster": ["718 Boxster","718 Boxster S","718 Boxster GTS 4.0","718 Spyder","718 Spyder RS"],
  "Cayenne": ["Cayenne","Cayenne S","Cayenne GTS","Cayenne Turbo","Cayenne Turbo GT","E-Hybrid","Turbo S E-Hybrid"],
  "Macan": ["Macan","Macan S","Macan GTS","Macan Turbo","Electric Standard","Electric Turbo"],
  "Panamera": ["Panamera","Panamera 4","Panamera 4S","Panamera GTS","Panamera Turbo","Turbo S E-Hybrid"],
  "Taycan": ["Taycan","Taycan 4S","Taycan GTS","Taycan Turbo","Taycan Turbo S","Taycan Turbo GT"],

  // Infiniti
  "Q50": ["Pure","Luxe","Sensory","Red Sport 400","Sport"],
  "Q60": ["Pure","Luxe","Sensory","Red Sport 400","Sport","Black S"],
  "QX50": ["Pure","Luxe","Sensory","Autograph"],
  "QX60": ["Pure","Luxe","Sensory","Autograph"],
  "QX80": ["Luxe","Premium Select","Sensory","Autograph"],
  "QX55": ["Pure","Luxe","Sensory"],

  // Chery
  "Tiggo 8 Pro": ["Comfort","Luxury","Supreme","Premium"],
  "Tiggo 8 Plus": ["Comfort","Luxury","Supreme"],
  "Tiggo 7 Pro": ["Comfort","Luxury","Supreme"],
  "Tiggo 4 Pro": ["Comfort","Luxury"],
  "Omoda 5": ["Standard","Comfort","Premium","GT"],
  "Arrizo 5 Pro": ["Comfort","Luxury"],
  "Arrizo 6 Pro": ["Comfort","Luxury","Supreme"],

  // Jetour
  "X70 Plus": ["Comfort","Luxury","Supreme"],
  "X70 Coupe": ["Comfort","Luxury","Supreme"],
  "X90 Plus": ["Comfort","Luxury","Supreme"],
  "Dashing": ["Comfort","Luxury","Supreme","GT"],

  // Tesla
  "Model 3": ["Standard Range","Long Range AWD","Performance","Highland Long Range","Highland Performance"],
  "Model Y": ["Standard Range","Long Range AWD","Performance","Juniper Long Range","Juniper Performance"],
  "Model S": ["Long Range","Plaid"],
  "Model X": ["Long Range","Plaid"],
  "Cybertruck": ["Standard Range AWD","Long Range AWD","Cyberbeast"],

  // Cadillac
  "Escalade": ["Luxury","Premium Luxury","Sport","Premium Luxury Platinum","Sport Platinum","ESV"],
  "XT5": ["Luxury","Premium Luxury","Sport"],
  "XT6": ["Luxury","Premium Luxury","Sport"],
  "CT5": ["Luxury","Premium Luxury","Sport","V","Blackwing"],
  "CT4": ["Luxury","Premium Luxury","Sport","V","Blackwing"],
  "Lyriq": ["Luxury","Technology","Sport","Platinum"],

  // Changan
  "CS75 Plus": ["Standard","Comfort","Luxury","Supreme"],
  "CS55 Plus": ["Standard","Comfort","Luxury"],
  "CS35 Plus": ["Standard","Comfort","Luxury"],
  "Uni-T": ["Standard","Comfort","Luxury","Sport"],
  "Uni-K": ["Standard","Comfort","Luxury","Sport"],
  "Uni-V": ["Standard","Luxury","Sport"],

  // Great Wall / Haval
  "H6": ["Standard","Comfort","Luxury","Supreme","DHT Pro"],
  "Jolion": ["Standard","Comfort","Luxury","Supreme","HEV","PHEV"],
  "Dargo": ["Comfort","Luxury","Supreme","X"],
  "H9": ["Comfort","Luxury","Supreme"],
  "Tank 300": ["Standard","Comfort","Luxury","Off-Road"],
  "Tank 500": ["Standard","Luxury","Supreme","Hi4-T"],
  "Big Dog": ["Standard","Comfort","Luxury"],
};

const DEFAULT_SPECS = ["Base", "Standard", "Mid", "Full Option"];

async function run() {
  const { data: brands } = await supabase.from('brands').select('id, name');
  const { data: models } = await supabase.from('models').select('id, name, brand_id');
  const { data: existingSpecs } = await supabase.from('specs').select('model_id');

  const modelWithSpecs = new Set((existingSpecs || []).map(s => s.model_id));
  const modelsNeedingSpecs = models.filter(m => !modelWithSpecs.has(m.id));

  console.log(`Models needing specs: ${modelsNeedingSpecs.length}`);

  let added = 0;
  for (const model of modelsNeedingSpecs) {
    const specList = MODEL_SPECS[model.name] ||
      MODEL_SPECS[Object.keys(MODEL_SPECS).find(k => k.toLowerCase() === model.name.toLowerCase()) || ''] ||
      DEFAULT_SPECS;

    const toInsert = specList.map(name => ({ name, model_id: model.id }));
    const { error } = await supabase.from('specs').insert(toInsert);
    if (error) {
      console.error(`Error for ${model.name}:`, error.message);
    } else {
      added++;
      if (added % 50 === 0) console.log(`Progress: ${added}/${modelsNeedingSpecs.length}`);
    }
  }
  console.log(`\nDone! Added specs for ${added} models.`);
}

run();
