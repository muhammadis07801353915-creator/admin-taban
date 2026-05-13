"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Plus, Trash2, Edit2, Loader2, 
  Image as ImageIcon, Check, X, 
  ChevronRight, ChevronLeft, Layers, 
  CheckCircle2, Download, Search
} from "lucide-react";

const COMMON_BRANDS = ["Toyota", "Honda", "Ford", "Chevrolet", "Nissan", "BMW", "Mercedes-Benz", "Kia", "Hyundai", "Volkswagen", "Audi", "Lexus", "Land Rover", "Jeep", "GMC", "Dodge", "Mazda", "Subaru", "Volvo", "Mitsubishi"].slice(0, 50);

const COMMON_MODELS: Record<string, string[]> = {
  "Toyota": ["Camry", "Corolla", "RAV4", "Highlander", "Tacoma", "Tundra", "Prius", "Avalon", "Sienna", "4Runner", "Sequoia", "Land Cruiser", "Supra", "GR86", "Venza", "C-HR", "Crown", "Yaris", "FJ Cruiser", "Land Cruiser Prado"],
  "Honda": ["Civic", "Accord", "City", "Jazz", "Fit", "CR-V", "HR-V", "Pilot", "Passport", "Odyssey", "Ridgeline", "Insight", "ZR-V", "BR-V", "Freed", "Brio", "Amaze", "Elevate", "CR-Z", "S2000", "NSX"],
  "BMW": ["1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "6 Series", "7 Series", "8 Series", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "M2", "M3", "M4", "M5", "M8", "Z4", "i3", "i4", "i5", "i7", "iX", "iX1", "iX3"],
  "Audi": ["A1", "A3", "A4", "A5", "A6", "A7", "A8", "Q2", "Q3", "Q4 e-tron", "Q5", "Q6", "Q7", "Q8", "Q8 e-tron", "R8", "TT", "TTS", "RS3", "RS4", "RS5", "RS6", "RS7", "RS Q3", "RS Q8", "S3", "S4", "S5", "S6", "S7", "e-tron", "e-tron GT"],
  "Mercedes-Benz": ["A-Class", "B-Class", "C-Class", "E-Class", "S-Class", "GLA", "GLB", "GLC", "GLE", "GLS", "G-Class", "CLA", "CLS", "SL", "AMG GT", "EQA", "EQB", "EQC", "EQE", "EQS", "Maybach S-Class"],
  "Volkswagen": ["Polo", "Golf", "Golf GTI", "Golf R", "Jetta", "Passat", "Arteon", "Tiguan", "T-Roc", "T-Cross", "Touareg", "Touran", "ID.3", "ID.4", "ID.5", "ID.7", "ID. Buzz", "Beetle", "Up!", "Sharan", "Caddy", "Amarok", "Taigo"],
  "Ford": ["Fiesta", "Focus", "Fusion", "Taurus", "Mustang", "EcoSport", "Escape", "Edge", "Explorer", "Expedition", "Ranger", "F-150", "F-250", "F-350", "Maverick", "Bronco", "Bronco Sport", "Puma", "Kuga", "Mach-E", "Transit", "Everest"],
  "Chevrolet": ["Spark", "Aveo", "Cruze", "Malibu", "Impala", "Camaro", "Corvette", "Sonic", "Trax", "Equinox", "Blazer", "Traverse", "Tahoe", "Suburban", "Colorado", "Silverado 1500", "Silverado 2500", "Trailblazer", "Bolt EV", "Bolt EUV"],
  "Nissan": ["Micra", "Versa", "Sentra", "Altima", "Maxima", "370Z", "400Z", "GT-R", "Juke", "Kicks", "Qashqai", "X-Trail", "Murano", "Pathfinder", "Patrol", "Armada", "Frontier", "Navara", "Titan", "Leaf", "Ariya"],
  "Kia": ["Picanto", "Rio", "Ceed", "Pro Ceed", "Xceed", "Stinger", "Cerato", "Forte", "K5", "K8", "K9", "Sportage", "Sorento", "Telluride", "Carnival", "Mohave", "EV6", "EV9", "Niro", "Soul", "Seltos", "Stonic"],
  "Hyundai": ["i10", "i20", "i30", "i40", "Accent", "Elantra", "Sonata", "Azera", "Kona", "Tucson", "ix35", "Santa Fe", "Santa Cruz", "Palisade", "Venue", "Ioniq", "Ioniq 5", "Ioniq 6", "Nexo", "Staria", "Creta", "Bayon", "Veloster"],
  "Lexus": ["IS", "IS F", "ES", "GS", "LS", "LS 500", "NX", "NX 350h", "RX", "RX 350", "RX 500h", "GX", "LX", "LC", "LC 500", "UX", "UX 250h", "RZ", "CT", "RC", "RC F", "LFA", "LM"],
  "Land Rover": ["Defender 90", "Defender 110", "Defender 130", "Discovery", "Discovery Sport", "Discovery 3", "Discovery 4", "Range Rover", "Range Rover Sport", "Range Rover Velar", "Range Rover Evoque", "Range Rover SV", "Freelander", "Freelander 2", "LR2", "LR3", "LR4"],
  "Jeep": ["Renegade", "Compass", "Cherokee", "Grand Cherokee", "Grand Cherokee L", "Wrangler", "Gladiator", "Wagoneer", "Grand Wagoneer", "Avenger", "Commander", "Patriot", "Liberty", "Scrambler"],
  "GMC": ["Terrain", "Acadia", "Yukon", "Yukon XL", "Sierra 1500", "Sierra 2500", "Sierra 3500", "Canyon", "Envoy", "Envision", "Hummer EV", "Savana", "Jimmy"],
  "Dodge": ["Charger", "Challenger", "Durango", "Journey", "Ram 1500", "Ram 2500", "Ram 3500", "Grand Caravan", "Dakota", "Viper", "Dart", "Avenger", "Nitro", "Caliber", "Neon", "Magnum"],
  "Mazda": ["Mazda2", "Mazda3", "Mazda6", "CX-3", "CX-30", "CX-5", "CX-8", "CX-9", "CX-50", "CX-60", "CX-90", "MX-5 Miata", "MX-30", "RX-7", "RX-8", "BT-50", "323", "626"],
  "Subaru": ["Impreza", "Legacy", "Forester", "Outback", "XV", "WRX", "BRZ", "Ascent", "Crosstrek", "Solterra", "Levorg", "Tribeca"],
  "Volvo": ["S40", "S60", "S60 Cross Country", "S90", "V40", "V60", "V60 Cross Country", "V90", "V90 Cross Country", "XC40", "XC40 Recharge", "XC60", "XC70", "XC90", "C30", "C70", "C40 Recharge", "EX30", "EX90", "EC40"],
  "Mitsubishi": ["Mirage", "Mirage G4", "Lancer", "Lancer Evolution", "Galant", "ASX", "Eclipse Cross", "Outlander", "Outlander PHEV", "Pajero", "Pajero Sport", "L200", "Triton", "Delica", "Colt", "Grandis", "RVR", "3000GT", "Space Star", "Xpander"],
  "Cadillac": ["ATS", "CT4", "CT5", "CT6", "CTS", "DTS", "Escalade", "Escalade ESV", "SRX", "XT4", "XT5", "XT6", "XTS", "Lyriq", "Celestiq", "Optiq", "STS", "DeVille", "Eldorado", "Fleetwood"],
  "Changan": ["CS15", "CS35", "CS35 Plus", "CS55", "CS55 Plus", "CS75", "CS75 Plus", "CS85", "CS95", "Alsvin", "Eado", "Eado Plus", "Raeton", "Hunter", "Uni-T", "Uni-K", "Uni-V", "Uni-Z", "Deepal S7", "Deepal L7", "Lumin EV", "Auchan X5", "Auchan X7"],
  "Chery": ["Tiggo 2", "Tiggo 3", "Tiggo 4", "Tiggo 5", "Tiggo 5x", "Tiggo 7", "Tiggo 7 Pro", "Tiggo 8", "Tiggo 8 Plus", "Tiggo 8 Pro", "Tiggo 4 Pro", "Arrizo 3", "Arrizo 5", "Arrizo 5 Plus", "Arrizo 5 Pro", "Arrizo 6", "Arrizo 7", "Arrizo GX", "Omoda 5", "EQ1", "EQ5", "QQ", "QQ6", "Fulwin 2"],
  "Great Wall / Haval": ["H6", "Jolion", "H9", "Dargo", "F7", "F7x", "H2", "H4", "M6", "Big Dog", "Shenshou", "Chitu", "Cool Dog", "Poer", "Cannon", "Steed", "Wingle 7", "Tank 300", "Tank 500", "Ora Good Cat"],
  "Infiniti": ["Q50", "Q60", "Q70", "QX30", "QX50", "QX55", "QX60", "QX70", "QX80", "G35", "G37", "M35", "M37", "EX35", "FX35", "FX50", "JX35", "Q45", "I30", "I35"],
  "Jetour": ["X70", "X70 Plus", "X70 Coupe", "X70M", "X70S", "X90", "X90 Plus", "X95", "Dashing", "Traveler", "T-1", "Ice Cream"],
  "MG": ["MG3", "MG5", "MG6", "MG ZS", "MG ZS EV", "MG HS", "MG EHS", "MG RX5", "MG RX8", "MG GT", "MG4 EV", "MG5 EV", "MG Marvel R", "MG One", "MG Hector", "MG Gloster", "MG Astor", "MG Mulan", "MG Cyberster"],
  "Peugeot": ["108", "208", "308", "408", "508", "2008", "3008", "4008", "5008", "RCZ", "Partner", "Rifter", "Expert", "Traveller", "Boxer", "301", "107", "207", "206", "407"],
  "Porsche": ["911 Carrera", "911 Targa", "911 Turbo", "911 GT3", "718 Boxster", "718 Cayman", "718 Spyder", "Panamera", "Panamera Sport Turismo", "Macan", "Macan S", "Macan GTS", "Cayenne", "Cayenne Coupe", "Taycan", "Taycan Cross Turismo", "Taycan Sport Turismo", "918 Spyder", "Carrera GT"],
  "Renault": ["Clio", "Megane", "Megane E-Tech", "Talisman", "Captur", "Kadjar", "Koleos", "Arkana", "Zoe", "Twingo", "Scenic", "Grand Scenic", "Espace", "Kangoo", "Trafic", "Master", "Duster", "Kwid", "Sandero", "Logan"],
  "Suzuki": ["Swift", "Swift Sport", "Vitara", "Grand Vitara", "Jimny", "Baleno", "Ciaz", "Ertiga", "Dzire", "SX4 S-Cross", "Ignis", "Alto", "Celerio", "Wagon R", "S-Presso", "Carry", "APV"],
  "Tesla": ["Model S", "Model S Plaid", "Model 3", "Model 3 Highland", "Model X", "Model X Plaid", "Model Y", "Cybertruck", "Roadster", "Semi"]
};

const COMMON_SPECS = ["Standard", "Full Option", "Half Option", "Base"];

const MODEL_SPECS: Record<string, string[]> = {
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

type ViewState = 'brands' | 'models' | 'specs';

export default function BrandsPage() {
  const [view, setView] = useState<ViewState>('brands');
  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState<any>(null);

  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [specs, setSpecs] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isEditingLogo, setIsEditingLogo] = useState<any>(null);
  const [newLogoUrl, setNewLogoUrl] = useState('');
  const [newItemName, setNewItemName] = useState('');

  useEffect(() => {
    if (view === 'brands') fetchBrands();
    else if (view === 'models' && selectedBrand) fetchModels(selectedBrand.id);
    else if (view === 'specs' && selectedModel) fetchSpecs(selectedModel.id);
  }, [view, selectedBrand, selectedModel]);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('brands').select('*').order('name');
      if (error) throw error;
      setBrands(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchModels = async (brandId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('models').select('*').eq('brand_id', brandId).order('name');
      if (error) throw error;
      setModels(data || []);
      
      // Auto-bulk if empty and common models exist
      if (data && data.length === 0 && selectedBrand) {
        const list = COMMON_MODELS[selectedBrand.name] || COMMON_MODELS[Object.keys(COMMON_MODELS).find(k => k.toLowerCase() === selectedBrand.name.toLowerCase()) || ''] || [];
        if (list.length > 0) {
          handleBulk(true);
        }
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchSpecs = async (modelId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('specs').select('*').eq('model_id', modelId).order('name');
      if (error) throw error;
      setSpecs(data || []);

      // Auto-bulk if empty
      if (data && data.length === 0 && selectedModel) {
        const list = MODEL_SPECS[selectedModel.name] || MODEL_SPECS[Object.keys(MODEL_SPECS).find(k => k.toLowerCase() === selectedModel.name.toLowerCase()) || ''] || COMMON_SPECS;
        if (list.length > 0) {
          handleBulk(true);
        }
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleBulk = async (silent = false) => {
    if (!silent && !confirm('Proceed with bulk import?')) return;
    setLoading(true);
    try {
      if (view === 'brands') {
        const existing = brands.map(b => b.name.toLowerCase());
        const toAdd = COMMON_BRANDS.filter(b => !existing.includes(b.toLowerCase())).map(name => ({ name }));
        if (toAdd.length > 0) await supabase.from('brands').insert(toAdd);
        await fetchBrands();
      } else if (view === 'models' && selectedBrand) {
        const list = COMMON_MODELS[selectedBrand.name] || COMMON_MODELS[Object.keys(COMMON_MODELS).find(k => k.toLowerCase() === selectedBrand.name.toLowerCase()) || ''] || [];
        const existing = models.map(m => m.name.toLowerCase());
        const toAdd = list.filter(m => !existing.includes(m.toLowerCase())).map(name => ({ name, brand_id: selectedBrand.id }));
        if (toAdd.length > 0) await supabase.from('models').insert(toAdd);
        await fetchModels(selectedBrand.id);
      } else if (view === 'specs' && selectedModel) {
        const list = MODEL_SPECS[selectedModel.name] || MODEL_SPECS[Object.keys(MODEL_SPECS).find(k => k.toLowerCase() === selectedModel.name.toLowerCase()) || ''] || COMMON_SPECS;
        const existing = specs.map(s => s.name.trim().toLowerCase());
        const toAdd = list.filter(s => !existing.includes(s.trim().toLowerCase())).map(name => ({ name: name.trim(), model_id: selectedModel.id }));
        if (toAdd.length > 0) await supabase.from('specs').insert(toAdd);
        await fetchSpecs(selectedModel.id);
      }
    } catch (e) { if (!silent) alert('Error during bulk import'); }
    finally { setLoading(false); }
  };

  const handleAdd = async () => {
    if (!newItemName) return;
    setLoading(true);
    try {
      let res;
      if (view === 'brands') res = await supabase.from('brands').insert([{ name: newItemName }]);
      else if (view === 'models') res = await supabase.from('models').insert([{ name: newItemName, brand_id: selectedBrand.id }]);
      else if (view === 'specs') res = await supabase.from('specs').insert([{ name: newItemName, model_id: selectedModel.id }]);
      
      if (res?.error) throw res.error;
      setNewItemName('');
      setIsAdding(false);
      if (view === 'brands') await fetchBrands();
      else if (view === 'models') await fetchModels(selectedBrand.id);
      else await fetchSpecs(selectedModel.id);
    } catch (e) { alert('Error adding item'); }
    finally { setLoading(false); }
  };

  const updateLogo = async () => {
    if (!isEditingLogo) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('brands').update({ image_url: newLogoUrl }).eq('id', isEditingLogo.id);
      if (error) {
        if (error.message.includes('image_url')) {
          alert("Error: The 'brands' table does not have an 'image_url' column. Please add it in Supabase dashboard first.");
        } else throw error;
      } else {
        setBrands(brands.map(b => b.id === isEditingLogo.id ? { ...b, image_url: newLogoUrl } : b));
        setIsEditingLogo(null);
        setNewLogoUrl('');
      }
    } catch (e) { alert('Error updating logo'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    const table = view === 'brands' ? 'brands' : view === 'models' ? 'models' : 'specs';
    await supabase.from(table).delete().eq('id', id);
    if (view === 'brands') fetchBrands();
    else if (view === 'models') fetchModels(selectedBrand.id);
    else fetchSpecs(selectedModel.id);
  };

  const filteredItems = (view === 'brands' ? brands : view === 'models' ? models : specs).filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const suggestions = (view === 'models' && selectedBrand) ? (
    (COMMON_MODELS[selectedBrand.name] || COMMON_MODELS[Object.keys(COMMON_MODELS).find(k => k.toLowerCase() === selectedBrand.name.toLowerCase()) || ''] || [])
    .filter(name => !models.some(m => m.name.trim().toLowerCase() === name.trim().toLowerCase()))
  ) : (view === 'specs' && selectedModel) ? (
    (MODEL_SPECS[selectedModel.name] || MODEL_SPECS[Object.keys(MODEL_SPECS).find(k => k.toLowerCase() === selectedModel.name.toLowerCase()) || ''] || COMMON_SPECS)
    .filter(name => !specs.some(s => s.name.trim().toLowerCase() === name.trim().toLowerCase()))
  ) : [];

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {view !== 'brands' && (
            <button onClick={() => { setView(view === 'specs' ? 'models' : 'brands'); setSearchQuery(''); }} className="bg-slate-100 p-3 rounded-2xl"><ChevronLeft size={24} /></button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {view === 'brands' ? 'Brands' : view === 'models' ? `${selectedBrand?.name} Models` : `${selectedModel?.name} Specs`}
            </h1>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input placeholder="Search..." className="w-full bg-slate-50 border border-slate-100 h-12 rounded-2xl pl-12 pr-4 font-bold outline-none" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={() => handleBulk(false)} className="flex-1 bg-slate-900 text-white h-12 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-slate-500/20"><Download size={18} /> Bulk</button>
            <button onClick={() => setIsAdding(true)} className="flex-1 bg-[#CC222F] text-white h-12 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"><Plus size={18} /> Add</button>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      {view !== 'brands' && (
        <div className="flex items-center gap-2 text-sm font-bold">
          <span className="text-slate-400 cursor-pointer" onClick={() => { setView('brands'); setSearchQuery(''); }}>Brands</span>
          <ChevronRight size={14} className="text-slate-300" />
          {view === 'specs' ? (
            <>
              <span className="text-slate-400 cursor-pointer" onClick={() => { setView('models'); setSearchQuery(''); }}>{selectedBrand?.name}</span>
              <ChevronRight size={14} className="text-slate-300" />
              <span className="text-[#CC222F]">{selectedModel?.name}</span>
            </>
          ) : <span className="text-[#CC222F]">{selectedBrand?.name}</span>}
        </div>
      )}

      {/* Suggestions */}
      {(view === 'models' || view === 'specs') && suggestions.length > 0 && !loading && (
        <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 animate-in fade-in slide-in-from-top-2">
          <p className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">Suggested {view === 'models' ? 'Models' : 'Specs'}</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 15).map(name => (
              <button 
                key={name} 
                onClick={async () => {
                  setLoading(true);
                  try {
                    if (view === 'models') {
                      await supabase.from('models').insert([{ name, brand_id: selectedBrand.id }]);
                      await fetchModels(selectedBrand.id);
                    } else {
                      await supabase.from('specs').insert([{ name, model_id: selectedModel.id }]);
                      await fetchSpecs(selectedModel.id);
                    }
                  } catch (e) { console.error(e); }
                  finally { setLoading(false); }
                }}
                className="bg-white px-5 py-2.5 rounded-2xl text-sm font-bold border border-slate-200 hover:border-[#CC222F] hover:text-[#CC222F] hover:shadow-lg hover:shadow-red-500/5 transition-all"
              >
                + {name}
              </button>
            ))}
            {suggestions.length > 15 && <span className="text-xs text-slate-400 flex items-center ml-2">and {suggestions.length - 15} more...</span>}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center"><Loader2 className="animate-spin text-[#CC222F]" size={40} /></div>
        ) : (
          filteredItems.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative group cursor-pointer hover:border-[#CC222F] transition-all" onClick={() => {
              if (view === 'brands') { setSelectedBrand(item); setView('models'); }
              else if (view === 'models') { setSelectedModel(item); setView('specs'); }
            }}>
              <div className="aspect-square bg-slate-50 rounded-2xl flex items-center justify-center mb-4 overflow-hidden">
                {view === 'brands' && item.image_url ? (
                  <img src={item.image_url} className="w-16 h-16 object-contain" />
                ) : (
                  view === 'brands' ? <ImageIcon size={32} className="text-slate-200" /> : 
                  view === 'models' ? <Layers size={32} className="text-slate-200" /> : <CheckCircle2 size={32} className="text-slate-200" />
                )}
              </div>
              <p className="text-center font-bold text-slate-900">{item.name}</p>
              
              <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
                {view === 'brands' && (
                  <button onClick={(e) => { e.stopPropagation(); setIsEditingLogo(item); setNewLogoUrl(item.image_url || ''); }} className="p-2 text-slate-200 hover:text-blue-500 bg-white/80 rounded-full shadow-sm"><Edit2 size={16} /></button>
                )}
                <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="p-2 text-slate-200 hover:text-red-500 bg-white/80 rounded-full shadow-sm"><Trash2 size={16} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {(isAdding || isEditingLogo) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-slate-900 mb-6">{isEditingLogo ? 'Edit Logo' : 'Add New'}</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 ml-2">{isEditingLogo ? 'External Image URL' : 'Name'}</label>
                <input 
                  autoFocus 
                  value={isEditingLogo ? newLogoUrl : newItemName} 
                  onChange={e => isEditingLogo ? setNewLogoUrl(e.target.value) : setNewItemName(e.target.value)} 
                  className="w-full bg-slate-50 border-none h-14 rounded-2xl px-6 font-bold outline-none" 
                  placeholder={isEditingLogo ? "https://..." : "Name..."} 
                />
              </div>
              <div className="flex gap-4">
                <button onClick={isEditingLogo ? updateLogo : handleAdd} className="flex-1 bg-[#CC222F] text-white h-14 rounded-2xl font-black">Save</button>
                <button onClick={() => { setIsAdding(false); setIsEditingLogo(null); setNewItemName(''); }} className="flex-1 bg-slate-100 text-slate-400 h-14 rounded-2xl font-black">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
