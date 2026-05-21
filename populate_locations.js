const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Key is missing from .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const locationData = [
  {
    governorate: 'هەولێر',
    cities: ['هەولێر (ناوەند)', 'سۆران', 'شەقڵاوە', 'کۆیە', 'خەبات', 'چۆمان', 'ڕەواندز', 'مەخمور', 'بنەسڵاوە', 'عەنکاوە', 'مێرگەسۆر', 'پیرمام', 'حەریر']
  },
  {
    governorate: 'سلێمانی',
    cities: ['سلێمانی (ناوەند)', 'چەمچەماڵ', 'کەلار', 'ڕانیە', 'قەڵادزێ', 'دوکان', 'پێنجوێن', 'سەید سادق', 'دەربەندیخان', 'بازیان', 'ماوەت', 'قەرەداغ', 'شارباژێڕ', 'سەنگاو']
  },
  {
    governorate: 'دهۆک',
    cities: ['دهۆک (ناوەند)', 'زاخۆ', 'ئاکرێ', 'ئامێدی', 'بەردەڕەش', 'سێمێل', 'شێخان', 'باتوفە', 'کەلەکچی']
  },
  {
    governorate: 'کەرکوک',
    cities: ['کەرکوک (ناوەند)', 'حەویجە', 'داقوق', 'دوبز', 'ئاڵتون کۆپری']
  },
  {
    governorate: 'هەڵەبجە',
    cities: ['هەڵەبجە (ناوەند)', 'شارەزوور', 'سیروان', 'بیارە', 'تەوێڵە']
  },
  {
    governorate: 'بەغداد',
    cities: ['بەغداد (ناوەند)', 'کەرخ', 'ڕەسافە', 'ئەعزەمیە', 'شاری سەدر', 'کازمێ', 'مەحموودیە', 'ئەبو غرێب', 'تاجی']
  },
  {
    governorate: 'نەینەوا',
    cities: ['موسڵ', 'شەنگال', 'تەلەعفەر', 'تەلکێف', 'حەمدانیە', 'شێخان (دەشتی نەینەوا)', 'بەعشیقە']
  },
  {
    governorate: 'بەسڕە',
    cities: ['بەسڕە (ناوەند)', 'قوڕنە', 'ئەبو خەسیب', 'زوبێر', 'فاو', 'مەدینە']
  },
  {
    governorate: 'ئەنبار',
    cities: ['ڕومادی', 'فەلوجە', 'هیت', 'حەدیسە', 'قائیم', 'ڕوتبە', 'عانە', 'ڕاوە']
  },
  {
    governorate: 'بابیل',
    cities: ['حلە', 'مەحاویل', 'موسەیب', 'هاشمیە', 'قاسم']
  },
  {
    governorate: 'کەربەلا',
    cities: ['کەربەلا (ناوەند)', 'عەین تەمور', 'هندیە']
  },
  {
    governorate: 'نەجەف',
    cities: ['نەجەف (ناوەند)', 'کوفە', 'مەنازەرە', 'حیدەریە']
  },
  {
    governorate: 'واست',
    cities: ['کوت', 'سوێرە', 'حەی', 'عەزیزیە']
  },
  {
    governorate: 'مەیسان',
    cities: ['عەمارە', 'عەلی غەربی', 'مەیموونة', 'قەڵای ساڵح']
  },
  {
    governorate: 'ذی قار',
    cities: ['ناسریە', 'شەترە', 'سوق الشیوخ', 'ڕیفاعی', 'جبایش']
  },
  {
    governorate: 'موسەننا',
    cities: ['سەماوە', 'ڕومەیسە', 'خزر', 'سەلمان']
  },
  {
    governorate: 'قادسیە',
    cities: ['دیوانیە', 'شامیە', 'عەفەک', 'حەمزە']
  },
  {
    governorate: 'سەڵاحەددین',
    cities: ['تکریت', 'سامەڕا', 'بەلەد', 'دوجەیل', 'تووزخورماتوو', 'شێرقات', 'بێجی']
  },
  {
    governorate: 'دیالە',
    cities: ['بەعقوبە', 'خانەقین', 'میقدادیە', 'خالس', 'بەلەدڕوز']
  }
];

async function populate() {
  console.log('Starting population of governorates and cities...');
  
  try {
    // 1. Clear existing cities and governorates to avoid duplicates and starting fresh
    // Note: Since cascade is enabled on delete, deleting governorates will delete cities.
    console.log('Clearing existing data...');
    const { error: deleteCitiesError } = await supabase.from('cities').delete().neq('id', 0);
    if (deleteCitiesError) console.log('Notice on delete cities:', deleteCitiesError.message);

    const { error: deleteGovsError } = await supabase.from('governorates').delete().neq('id', 0);
    if (deleteGovsError) console.log('Notice on delete governorates:', deleteGovsError.message);

    // 2. Insert governorates and cities
    for (const item of locationData) {
      console.log(`Inserting governorate: ${item.governorate}...`);
      
      const { data: govData, error: govError } = await supabase
        .from('governorates')
        .insert({ name: item.governorate })
        .select()
        .single();
        
      if (govError) {
        console.error(`Error inserting governorate ${item.governorate}:`, govError);
        continue;
      }
      
      const govId = govData.id;
      const citiesToInsert = item.cities.map(cityName => ({
        name: cityName,
        governorate_id: govId
      }));
      
      console.log(`Inserting ${citiesToInsert.length} cities for ${item.governorate}...`);
      const { error: citiesError } = await supabase
        .from('cities')
        .insert(citiesToInsert);
        
      if (citiesError) {
        console.error(`Error inserting cities for ${item.governorate}:`, citiesError);
      }
    }
    
    console.log('Successfully completed population!');
  } catch (err) {
    console.error('Fatal error during population:', err);
  }
}

populate();
