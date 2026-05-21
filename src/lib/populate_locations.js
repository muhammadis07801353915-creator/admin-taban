import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kdlwstunxgbwxwafhvkm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkbHdzdHVueGdid3h3YWZodmttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMjc4MjgsImV4cCI6MjA5MjgwMzgyOH0.bI3uXegL9aHqQh3OFxqHYBHR_NOSYg1zaJOa_8mBs3k';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const data = [
  {
    name: 'هەولێر',
    cities: ['هەولێر', 'سۆران', 'ڕانیە', 'شەقڵاوە', 'کویە', 'چومان', 'مەرگەسووڕ', 'بەرزنجی', 'دیانە', 'ئەقرێ']
  },
  {
    name: 'سلێمانی',
    cities: ['سلێمانی', 'کەلار', 'شاڕەزوور', 'دەربەندیخان', 'پشدەر', 'چواردووڵ', 'سەیدسادق', 'دوکان', 'ئەسکەڵان', 'مەوەت', 'بینجوین']
  },
  {
    name: 'دهۆک',
    cities: ['دهۆک', 'زاخۆ', 'ئامێدی', 'باتیفە', 'شێخان', 'عەقرە', 'بەرواری بالا', 'سۆمەل', 'دیشە', 'سینونی']
  },
  {
    name: 'هەڵەبجە',
    cities: ['هەڵەبجە', 'شاربازێر', 'خورماڵ', 'بیارە']
  },
  {
    name: 'کەرکوک',
    cities: ['کەرکوک', 'داقووق', 'چەمچەماڵ', 'دوبز', 'تازەخورماتو', 'ڕیاض']
  },
  {
    name: 'بەغدا',
    cities: ['بەغدا', 'کاظمیە', 'ئەعظەمیە', 'کەرخ', 'رصافە', 'شووعلە', 'صدر سیتی']
  },
  {
    name: 'بەسرە',
    cities: ['بەسرە', 'ئەبوو خەسیب', 'قورنە', 'مەدینە', 'فاو', 'شەتتولعەرەب', 'زبیر']
  },
  {
    name: 'نەینەوا',
    cities: ['موسڵ', 'تەلعەفەر', 'سینجار', 'زوومار', 'شێخان', 'ئەقرا', 'حەمدانیە', 'بعاج']
  },
  {
    name: 'ئەنبار',
    cities: ['ڕامادی', 'فەڵووجە', 'هیت', 'ئەنا', 'خالیدیە', 'رووتبە', 'قائیم', 'حدیثە']
  },
  {
    name: 'کەربەلا',
    cities: ['کەربەلا', 'عەینکاوە', 'هیندیە']
  },
  {
    name: 'نەجەف',
    cities: ['نەجەف', 'کووفە', 'حیڵڵە', 'مەناذیر']
  },
  {
    name: 'بابڵ',
    cities: ['حیڵڵە', 'مسەییب', 'مەحاویل', 'هاشمیە', 'قاسم']
  },
  {
    name: 'دیالە',
    cities: ['بەعقووبە', 'خانقین', 'مەندەلی', 'بەلەدروز', 'ئەبوو سەیدا']
  },
  {
    name: 'سەڵاحەدین',
    cities: ['تیکریت', 'سامەڕا', 'بیجی', 'تووزخورماتو', 'شرقات']
  },
  {
    name: 'واسەت',
    cities: ['کووت', 'نووعمانیە', 'عەزیزیە', 'حایی']
  },
  {
    name: 'میسان',
    cities: ['عەماڕە', 'قەڵعەت سالیح', 'علی گەرب', 'مجر کەبیر']
  },
  {
    name: 'قادیسیە',
    cities: ['دیوانیە', 'عەفک', 'شامیە', 'حمزە']
  },
  {
    name: 'ذیقار',
    cities: ['ناصریە', 'شەتتە', 'رفاعی', 'جبایش']
  },
  {
    name: 'موسەنا',
    cities: ['سەماوە', 'رومیثە', 'خضر']
  },
];

async function populate() {
  console.log('Deleting existing data...');
  await supabase.from('cities').delete().neq('id', 0);
  await supabase.from('governorates').delete().neq('id', 0);

  console.log('Inserting governorates and cities...');
  for (const gov of data) {
    const { data: govData, error: govErr } = await supabase
      .from('governorates')
      .insert({ name: gov.name })
      .select()
      .single();

    if (govErr) {
      console.error(`Error inserting governorate ${gov.name}:`, govErr);
      continue;
    }

    console.log(`✓ Governorate: ${gov.name} (id: ${govData.id})`);

    const cityRows = gov.cities.map(c => ({ name: c, governorate_id: govData.id }));
    const { error: citiesErr } = await supabase.from('cities').insert(cityRows);
    if (citiesErr) {
      console.error(`Error inserting cities for ${gov.name}:`, citiesErr);
    } else {
      console.log(`  → ${gov.cities.length} cities inserted`);
    }
  }

  console.log('\nDone!');
}

populate();
