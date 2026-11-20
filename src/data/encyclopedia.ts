import type { Language } from '../game/types';

export interface CountryEncyclopediaEntry {
  capital: { pl: string; en: string };
  government: { pl: string; en: string };
  facts: { pl: [string, string, string]; en: [string, string, string] };
}

const ENCYCLOPEDIA_DATA: Record<string, CountryEncyclopediaEntry> = {
  '616': {
    capital: { pl: 'Warszawa', en: 'Warsaw' },
    government: { pl: 'Republika parlamentarna', en: 'Parliamentary republic' },
    facts: {
      pl: [
        'W 966 roku książę Mieszko I przyjął chrzest, włączając państwo Polan w krąg cywilizacji łacińskiej.',
        'Rzeczpospolita Obojga Narodów była w XVII wieku jednym z największych państw Europy pod względem powierzchni.',
        'W 1791 roku uchwalono Konstytucję 3 maja — pierwszą nowoczesną konstytucję w Europie i drugą na świecie.',
      ],
      en: [
        'In 966 AD, Duke Mieszko I was baptized, bringing Poland into Western Christendom.',
        'The 17th-century Polish-Lithuanian Commonwealth was among the largest states in Europe.',
        'Poland adopted the Constitution of 3 May 1791, Europe’s first modern codified constitution.',
      ],
    },
  },
  '276': {
    capital: { pl: 'Berlin', en: 'Berlin' },
    government: { pl: 'Republika federalna', en: 'Federal republic' },
    facts: {
      pl: [
        'Największa gospodarka Unii Europejskiej z kluczowym przemysłem motoryzacyjnym, maszynowym i chemicznym.',
        'System federalny składa się z 16 krajów związkowych (Landów) o szerokiej autonomii.',
        'Historycznie ziemie niemieckie były podzielone między setki księstw Świętego Cesarstwa Rzymskiego.',
      ],
      en: [
        'Europe’s largest national economy, anchored by automotive, engineering, and chemical industries.',
        'Organized as a federation of 16 Bundesländer with significant regional autonomy.',
        'Historically fragmented into hundreds of states within the Holy Roman Empire until 1871.',
      ],
    },
  },
  '440': {
    capital: { pl: 'Wilno', en: 'Vilnius' },
    government: { pl: 'Republika semiprezydencka', en: 'Semi-presidential republic' },
    facts: {
      pl: [
        'Wielkie Księstwo Litewskie sięgało w XV wieku od Morza Bałtyckiego aż po wybrzeża Morza Czarnego.',
        'Unia w Krewie (1385) i Unia Lubelska (1569) połączyły Litwę z Polską na ponad dwa stulecia.',
        'Język litewski zachował jedne z najbardziej archaicznych form wśród języków indoeuropejskich.',
      ],
      en: [
        'In the 15th century, the Grand Duchy of Lithuania stretched from the Baltic to the Black Sea.',
        'The Union of Lublin (1569) joined Lithuania and Poland into the Commonwealth.',
        'Lithuanian preserves some of the most archaic features of any living Indo-European language.',
      ],
    },
  },
  '804': {
    capital: { pl: 'Kijów', en: 'Kyiv' },
    government: { pl: 'Republika semiprezydencka', en: 'Semi-presidential republic' },
    facts: {
      pl: [
        'Średniowieczna Ruś Kijowska była jednym z najpotężniejszych i najbardziej rozwiniętych państw wczesnej Europy.',
        'Żyzne czarnoziemy sprawiają, że kraj należy do najważniejszych producentów zbóż na świecie.',
        'Dniepr dzieli kraj na Prawobrzeże i Lewobrzeże, będąc główną arterią komunikacyjną i energetyczną.',
      ],
      en: [
        'Medieval Kyivan Rus’ was one of the largest and wealthiest realms in early Europe.',
        'Deep black chernozem soils make the nation one of the world’s top grain breadbaskets.',
        'The Dnipro River forms the country’s central geographic and hydro-energetic spine.',
      ],
    },
  },
  '643': {
    capital: { pl: 'Moskwa', en: 'Moscow' },
    government: { pl: 'Republika federalna', en: 'Federal republic' },
    facts: {
      pl: [
        'Największe państwo świata pod względem powierzchni (ponad 17 mln km²), rozciągające się przez 11 stref czasowych.',
        'Posiada ogromne złoża surowców energetycznych, w tym gazu ziemnego, ropy naftowej oraz niklu.',
        'Kolej Transsyberyjska łączy europejską część kraju z portami nad Oceanem Spokojnym.',
      ],
      en: [
        'The world’s largest country by area (over 17 million km²), spanning 11 time zones.',
        'Rich in vast reserves of natural gas, crude oil, timber, and strategic minerals.',
        'The Trans-Siberian Railway links Moscow with Pacific ports across Eurasia.',
      ],
    },
  },
  '250': {
    capital: { pl: 'Paryż', en: 'Paris' },
    government: { pl: 'Republika semiprezydencka', en: 'Semi-presidential republic' },
    facts: {
      pl: [
        'Jedyne państwo Unii Europejskiej posiadające własne odstraszanie nuklearne i stałe miejsce w Radzie Bezpieczeństwa ONZ.',
        'Około 70% energii elektrycznej wytwarzane jest w rozbudowanej sieci elektrowni jądrowych.',
        'Kultura francuska wywarła ogromny wpływ na dyplomację, prawo i sztukę nowożytną.',
      ],
      en: [
        'The EU’s sole nuclear-armed state and a permanent member of the UN Security Council.',
        'Nuclear reactors generate roughly 70% of national electricity output.',
        'French language and jurisprudence profoundly shaped modern diplomacy and civil law.',
      ],
    },
  },
  '826': {
    capital: { pl: 'Londyn', en: 'London' },
    government: { pl: 'Monarchia konstytucyjna', en: 'Constitutional monarchy' },
    facts: {
      pl: [
        'Kolebka rewolucji przemysłowej XVIII wieku i światowego systemu parlamentarnego (Magna Carta z 1215 r.).',
        'Royal Navy przez stulecia zapewniała bezpieczeństwo strategicznych szlaków morskich na całym globie.',
        'Londyn pozostaje jednym z najważniejszych centrów finansowych i ubezpieczeniowych świata.',
      ],
      en: [
        'Birthplace of the Industrial Revolution and parliamentary traditions dating back to Magna Carta (1215).',
        'The Royal Navy historically secured maritime trade corridors across every ocean.',
        'London remains one of the world’s premier banking and financial hubs.',
      ],
    },
  },
  '840': {
    capital: { pl: 'Waszyngton', en: 'Washington, D.C.' },
    government: { pl: 'Republika prezydencka', en: 'Federal presidential republic' },
    facts: {
      pl: [
        'Największa gospodarka nominalna świata oraz lider innowacji technologicznych, lotniczych i kosmicznych.',
        'Konstytucja Stanów Zjednoczonych z 1787 roku jest najdłużej nieprzerwanie obowiązującą konstytucją spisaną.',
        'Dostęp do Oceanu Atlantyckiego i Spokojnego daje państwu naturalną przewagę morską na obu półkulach.',
      ],
      en: [
        'The world’s largest nominal economy and leader in aerospace, computing, and defense tech.',
        'The 1787 US Constitution is the longest-standing written national constitution still in force.',
        'Two-ocean geography along the Atlantic and Pacific underpins global naval reach.',
      ],
    },
  },
  '156': {
    capital: { pl: 'Pekin', en: 'Beijing' },
    government: { pl: 'Republika ludowa', en: 'Unitary socialist republic' },
    facts: {
      pl: [
        'Jedna z najstarszych nieprzerwanych cywilizacji świata — kolebka druku, prochu, papieru i kompasu.',
        'Posiada największą sieć kolei dużych prędkości na Ziemi oraz wiodący sektor produkcyjny.',
        'Wielki Mur Chiński rozciąga się na tysiące kilometrów wzdłuż północnych granic dawnych dynastii.',
      ],
      en: [
        'One of the world’s oldest continuous civilizations, birthplace of paper, printing, compass, and gunpowder.',
        'Operates the largest high-speed rail network and industrial manufacturing base on Earth.',
        'The Great Wall stretches thousands of kilometers across northern China’s historic frontier.',
      ],
    },
  },
  '392': {
    capital: { pl: 'Tokio', en: 'Tokyo' },
    government: { pl: 'Monarchia konstytucyjna', en: 'Constitutional monarchy' },
    facts: {
      pl: [
        'Archipelag złożony z ponad 6800 wysp na pacyficznym Pierścieniu Ognia.',
        'Światowy pionier robotyki, elektroniki precyzyjnej i kolei dużych prędkości Shinkansen.',
        'Aglomeracja Tokio jest najludniejszym obszarem metropolitalnym na świecie.',
      ],
      en: [
        'An archipelago of over 6,800 islands located along the Pacific Ring of Fire.',
        'Global pioneer in robotics, precision electronics, and Shinkansen bullet trains.',
        'Greater Tokyo is the most populous metropolitan area on Earth.',
      ],
    },
  },
  '356': {
    capital: { pl: 'Nowe Delhi', en: 'New Delhi' },
    government: { pl: 'Republika federalna', en: 'Federal parliamentary republic' },
    facts: {
      pl: [
        'Najludniejsze państwo świata i największa demokracja na globie.',
        'Dynamicznie rozwijający się sektor IT, farmaceutyczny oraz własny program kosmiczny ISRO.',
        'Himalaje na północy stanowią naturalną barierę klimatyczną i strategiczną przed mrozami Azji Środkowej.',
      ],
      en: [
        'The world’s most populous nation and largest democratic electorate.',
        'Home to a booming IT sector, pharmaceutical industry, and the ISRO space program.',
        'The Himalayas form a towering northern climatic and strategic shield.',
      ],
    },
  },
  '203': {
    capital: { pl: 'Praga', en: 'Prague' },
    government: { pl: 'Republika parlamentarna', en: 'Parliamentary republic' },
    facts: {
      pl: [
        'Historyczna korona Czech była jednym z najbogatszych i najbardziej uprzemysłowionych regionów Europy Środkowej.',
        'W 1348 roku w Pradze założono pierwszy uniwersytet w Europie Środkowej (Uniwersytet Karola).',
        'Kraj posiada jedno z najwyższych zagęszczeń zamków i pałaców na kilometr kwadratowy na świecie.',
      ],
      en: [
        'Bohemia and Moravia have long stood among Central Europe’s most industrialized heartlands.',
        'Charles University in Prague (1348) was Central Europe’s first university.',
        'Czechia boasts one of the highest densities of historic castles in the world.',
      ],
    },
  },
  '792': {
    capital: { pl: 'Ankara', en: 'Ankara' },
    government: { pl: 'Republika prezydencka', en: 'Presidential republic' },
    facts: {
      pl: [
        'Kraj położony na styku Europy i Azji, kontrolujący strategiczne cieśniny Bosfor i Dardanele.',
        'Stambuł (dawny Konstantynopol) był przez ponad tysiąc lat stolicą Cesarstwa Bizantyńskiego i Osmańskiego.',
        'Przemysł obronny Turcji słynie z nowoczesnych bezzałogowców i okrętów wojennych.',
      ],
      en: [
        'Straddles Europe and Asia, controlling the vital Bosporus and Dardanelles maritime straits.',
        'Istanbul served for over a millennium as imperial capital of Byzantium and the Ottomans.',
        'Turkey operates a rapidly expanding domestic aerospace and naval defense industry.',
      ],
    },
  },
  '076': {
    capital: { pl: 'Brasília', en: 'Brasília' },
    government: { pl: 'Republika federalna', en: 'Federal presidential republic' },
    facts: {
      pl: [
        'Największe państwo Ameryki Południowej i piąty co do wielkości kraj na Ziemi.',
        'Na jego terytorium leży około 60% puszczy amazońskiej — największego lasu deszczowego świata.',
        'Czołowy eksporter żywności, rudy żelaza oraz samolotów regionalnych Embraer.',
      ],
      en: [
        'South America’s largest country and the fifth-largest nation on Earth.',
        'Contains roughly 60% of the Amazon rainforest, Earth’s richest terrestrial biome.',
        'Major global exporter of agriculture, iron ore, and Embraer commercial aircraft.',
      ],
    },
  },
};

export function getCountryEncyclopedia(
  countryId: string,
  displayName: string,
  areaKm2: number,
  population: number,
  lang: Language,
): { capital: string; government: string; facts: [string, string, string] } {
  const useEn = lang === 'en';
  const entry = ENCYCLOPEDIA_DATA[countryId];
  if (entry) {
    return {
      capital: useEn ? entry.capital.en : entry.capital.pl,
      government: useEn ? entry.government.en : entry.government.pl,
      facts: useEn ? entry.facts.en : entry.facts.pl,
    };
  }

  const popM = (population / 1_000_000).toFixed(1);
  if (useEn) {
    return {
      capital: `${displayName} City`,
      government: areaKm2 > 1_000_000 ? 'Federal republic' : 'Constitutional republic',
      facts: [
        `${displayName} spans ${areaKm2.toLocaleString('en-US')} km² with an estimated population of ${popM}M citizens.`,
        'Strategic terrain, climate seasons, and trade routes shape its regional military posture.',
        'Building Universities and Factories accelerates both research output and state tax revenue.',
      ],
    };
  }

  return {
    capital: `Stolica (${displayName})`,
    government: areaKm2 > 1_000_000 ? 'Republika federalna' : 'Republika konstytucyjna',
    facts: [
      `${displayName} obejmuje obszar ${areaKm2.toLocaleString('pl-PL')} km² i liczy ok. ${popM} mln mieszkańców.`,
      'Położenie geograficzne, klimat i sieć prowincji decydują o kosztach zaopatrzenia i obrony.',
      'Rozbudowa Uniwersytetów i Fabryk pozwala szybko wyprzedzić sąsiadów technologicznie oraz budżetowo.',
    ],
  };
}
