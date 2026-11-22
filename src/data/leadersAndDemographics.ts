import type {
  CultureId,
  Language,
  MilitaryGeneral,
  ReligionId,
  ResourceKind,
} from '../game/types';

export interface LeaderProfile {
  fullName: string;
  title: Record<Language, string>;
  wikiTitle: string; // Wikipedia REST summary title (e.g. "Donald_Tusk")
}

export const COUNTRY_LEADERS: Record<string, LeaderProfile> = {
  '616': {
    fullName: 'Donald Tusk',
    title: { en: 'Prime Minister of Poland', pl: 'Premier Rzeczypospolitej Polskiej', szl: 'Prymier Polski', csb: 'Premier Pòlsczi' },
    wikiTitle: 'Donald_Tusk',
  },
  '276': {
    fullName: 'Friedrich Merz',
    title: { en: 'Federal Chancellor of Germany', pl: 'Kanclerz Federalny Niemiec', szl: 'Kanclerz Niymiec', csb: 'Kanclerz Miemców' },
    wikiTitle: 'Friedrich_Merz',
  },
  '250': {
    fullName: 'Emmanuel Macron',
    title: { en: 'President of the French Republic', pl: 'Prezydent Republiki Francuskiej', szl: 'Prezydynt Francyje', csb: 'Prezydent Francëji' },
    wikiTitle: 'Emmanuel_Macron',
  },
  '826': {
    fullName: 'Keir Starmer',
    title: { en: 'Prime Minister of the United Kingdom', pl: 'Premier Wielkiej Brytanii', szl: 'Prymier Wielgij Brytanije', csb: 'Premier Wiôldżi Britanii' },
    wikiTitle: 'Keir_Starmer',
  },
  '840': {
    fullName: 'Donald Trump',
    title: { en: 'President of the United States', pl: 'Prezydent Stanów Zjednoczonych', szl: 'Prezydynt USA', csb: 'Prezydent USA' },
    wikiTitle: 'Donald_Trump',
  },
  '804': {
    fullName: 'Volodymyr Zelenskyy',
    title: { en: 'President of Ukraine', pl: 'Prezydent Ukrainy', szl: 'Prezydynt Ukrainy', csb: 'Prezydent Ùkrajinë' },
    wikiTitle: 'Volodymyr_Zelenskyy',
  },
  '380': {
    fullName: 'Giorgia Meloni',
    title: { en: 'Prime Minister of Italy', pl: 'Premier Włoch', szl: 'Prymier Italije', csb: 'Premier Italskô' },
    wikiTitle: 'Giorgia_Meloni',
  },
  '724': {
    fullName: 'Pedro Sánchez',
    title: { en: 'Prime Minister of Spain', pl: 'Premier Hiszpanii', szl: 'Prymier Szpanije', csb: 'Premier Szpańsczi' },
    wikiTitle: 'Pedro_S%C3%A1nchez',
  },
  '124': {
    fullName: 'Mark Carney',
    title: { en: 'Prime Minister of Canada', pl: 'Premier Kanady', szl: 'Prymier Kanady', csb: 'Premier Kanadë' },
    wikiTitle: 'Mark_Carney',
  },
  '203': {
    fullName: 'Petr Pavel',
    title: { en: 'President of Czechia', pl: 'Prezydent Czech', szl: 'Prezydynt Czech', csb: 'Prezydent Czesczi' },
    wikiTitle: 'Petr_Pavel',
  },
  '703': {
    fullName: 'Robert Fico',
    title: { en: 'Prime Minister of Slovakia', pl: 'Premier Słowacji', szl: 'Prymier Słowacyje', csb: 'Premier Słowacëji' },
    wikiTitle: 'Robert_Fico',
  },
  '440': {
    fullName: 'Gitanas Nausėda',
    title: { en: 'President of Lithuania', pl: 'Prezydent Litwy', szl: 'Prezydynt Litwy', csb: 'Prezydent Lëtewsczi' },
    wikiTitle: 'Gitanas_Naus%C4%97da',
  },
  '428': {
    fullName: 'Edgars Rinkēvičs',
    title: { en: 'President of Latvia', pl: 'Prezydent Łotwy', szl: 'Prezydynt Łotwy', csb: 'Prezydent Łotwë' },
    wikiTitle: 'Edgars_Rink%C4%93vi%C4%8Ds',
  },
  '233': {
    fullName: 'Alar Karis',
    title: { en: 'President of Estonia', pl: 'Prezydent Estonii', szl: 'Prezydynt Estōnije', csb: 'Prezydent Estonëji' },
    wikiTitle: 'Alar_Karis',
  },
  '752': {
    fullName: 'Ulf Kristersson',
    title: { en: 'Prime Minister of Sweden', pl: 'Premier Szwecji', szl: 'Prymier Szwecyje', csb: 'Premier Szwecëji' },
    wikiTitle: 'Ulf_Kristersson',
  },
  '246': {
    fullName: 'Alexander Stubb',
    title: { en: 'President of Finland', pl: 'Prezydent Finlandii', szl: 'Prezydynt Finlandyje', csb: 'Prezydent Finów' },
    wikiTitle: 'Alexander_Stubb',
  },
  '578': {
    fullName: 'Jonas Gahr Støre',
    title: { en: 'Prime Minister of Norway', pl: 'Premier Norwegii', szl: 'Prymier Norwegije', csb: 'Premier Norwesczi' },
    wikiTitle: 'Jonas_Gahr_St%C3%B8re',
  },
  '208': {
    fullName: 'Mette Frederiksen',
    title: { en: 'Prime Minister of Denmark', pl: 'Premier Danii', szl: 'Prymier Danije', csb: 'Premier Dëni' },
    wikiTitle: 'Mette_Frederiksen',
  },
  '792': {
    fullName: 'Recep Tayyip Erdoğan',
    title: { en: 'President of Turkey', pl: 'Prezydent Turcji', szl: 'Prezydynt Turcyje', csb: 'Prezydent Tërcëji' },
    wikiTitle: 'Recep_Tayyip_Erdo%C4%9Fan',
  },
  '643': {
    fullName: 'Vladimir Putin',
    title: { en: 'President of Russia', pl: 'Prezydent Rosji', szl: 'Prezydynt Rosyje', csb: 'Prezydent Rësczi' },
    wikiTitle: 'Vladimir_Putin',
  },
  '156': {
    fullName: 'Xi Jinping',
    title: { en: 'President of China', pl: 'Przewodniczący ChRL', szl: 'Prezydynt Chin', csb: 'Prezydent Chin' },
    wikiTitle: 'Xi_Jinping',
  },
  '356': {
    fullName: 'Narendra Modi',
    title: { en: 'Prime Minister of India', pl: 'Premier Indii', szl: 'Prymier Indyji', csb: 'Premier Indiów' },
    wikiTitle: 'Narendra_Modi',
  },
  '392': {
    fullName: 'Shigeru Ishiba',
    title: { en: 'Prime Minister of Japan', pl: 'Premier Japonii', szl: 'Prymier Japōnije', csb: 'Premier Japònëji' },
    wikiTitle: 'Shigeru_Ishiba',
  },
  '076': {
    fullName: 'Luiz Inácio Lula da Silva',
    title: { en: 'President of Brazil', pl: 'Prezydent Brazylii', szl: 'Prezydynt Brazylije', csb: 'Prezydent Brazylëji' },
    wikiTitle: 'Luiz_In%C3%A1cio_Lula_da_Silva',
  },
  '032': {
    fullName: 'Javier Milei',
    title: { en: 'President of Argentina', pl: 'Prezydent Argentyny', szl: 'Prezydynt Argentyny', csb: 'Prezydent Argentinë' },
    wikiTitle: 'Javier_Milei',
  },
  '036': {
    fullName: 'Anthony Albanese',
    title: { en: 'Prime Minister of Australia', pl: 'Premier Australii', szl: 'Prymier Australije', csb: 'Premier Aùstralëji' },
    wikiTitle: 'Anthony_Albanese',
  },
  '499': {
    fullName: 'Jakov Milatović',
    title: { en: 'President of Montenegro', pl: 'Prezydent Czarnogóry', szl: 'Prezydynt Czornogōry', csb: 'Prezydent Czôrnogórë' },
    wikiTitle: 'Jakov_Milatovi%C4%87',
  },
  '196': {
    fullName: 'Nikos Christodoulides',
    title: { en: 'President of Cyprus', pl: 'Prezydent Cypru', szl: 'Prezydynt Cypru', csb: 'Prezydent Cyprë' },
    wikiTitle: 'Nikos_Christodoulides',
  },
  '100': {
    fullName: 'Rumen Radev',
    title: { en: 'President of Bulgaria', pl: 'Prezydent Bułgarii', szl: 'Prezydynt Bułgaryje', csb: 'Prezydent Bùlgarëji' },
    wikiTitle: 'Rumen_Radev',
  },
  '300': {
    fullName: 'Kyriakos Mitsotakis',
    title: { en: 'Prime Minister of Greece', pl: 'Premier Grecji', szl: 'Prymier Grecyje', csb: 'Premier Grecëji' },
    wikiTitle: 'Kyriakos_Mitsotakis',
  },
  '642': {
    fullName: 'Nicușor Dan',
    title: { en: 'President of Romania', pl: 'Prezydent Rumunii', szl: 'Prezydynt Rumunije', csb: 'Prezydent Rëmùńsczi' },
    wikiTitle: 'Nicu%C8%99or_Dan',
  },
  '348': {
    fullName: 'Viktor Orbán',
    title: { en: 'Prime Minister of Hungary', pl: 'Premier Węgier', szl: 'Prymier Wyngier', csb: 'Premier Madżarëji' },
    wikiTitle: 'Viktor_Orb%C3%A1n',
  },
  '528': {
    fullName: 'Dick Schoof',
    title: { en: 'Prime Minister of the Netherlands', pl: 'Premier Holandii', szl: 'Prymier Niderlandōw', csb: 'Premier Niderlandów' },
    wikiTitle: 'Dick_Schoof',
  },
  '304': {
    fullName: 'Jens-Frederik Nielsen',
    title: { en: 'Prime Minister of Greenland', pl: 'Premier Grenlandii', szl: 'Prymier Grynlandyje', csb: 'Premier Grenlandii' },
    wikiTitle: 'Greenland',
  },
  '352': {
    fullName: 'Halla Tómasdóttir',
    title: { en: 'President of Iceland', pl: 'Prezydent Islandii', szl: 'Prezydynt Islandyje', csb: 'Prezydent Islandëji' },
    wikiTitle: 'Halla_T%C3%B3masd%C3%B3ttir',
  },
  '682': {
    fullName: 'Mohammed bin Salman',
    title: { en: 'Crown Prince & PM of Saudi Arabia', pl: 'Premier Arabii Saudyjskiej', szl: 'Prymier Arabije', csb: 'Premier Arabëji' },
    wikiTitle: 'Mohammed_bin_Salman',
  },
  '376': {
    fullName: 'Benjamin Netanyahu',
    title: { en: 'Prime Minister of Israel', pl: 'Premier Izraela', szl: 'Prymier Izraela', csb: 'Premier Izraela' },
    wikiTitle: 'Benjamin_Netanyahu',
  },
  '818': {
    fullName: 'Abdel Fattah el-Sisi',
    title: { en: 'President of Egypt', pl: 'Prezydent Egiptu', szl: 'Prezydynt Egiptu', csb: 'Prezydent Egiptu' },
    wikiTitle: 'Abdel_Fattah_el-Sisi',
  },
  '010_arctowski': {
    fullName: 'Dr. Henryk Arctowski Directorate',
    title: { en: 'Antarctic Polar Command', pl: 'Stacja Polarna PAN', szl: 'Polarno Stacyjo', csb: 'Pòlarnô Stacjô' },
    wikiTitle: 'Henryk_Arctowski_Polish_Antarctic_Station',
  },
};

export function getLeaderForCountry(countryId: string, countryName: string): LeaderProfile {
  if (COUNTRY_LEADERS[countryId]) return COUNTRY_LEADERS[countryId];
  return {
    fullName: `State Council of ${countryName}`,
    title: {
      en: `Head of State · ${countryName}`,
      pl: `Głowa Państwa · ${countryName}`,
      szl: `Głowa Państwa · ${countryName}`,
      csb: `Przédnik Państwa · ${countryName}`,
    },
    wikiTitle: countryName.replace(/\s+/g, '_'),
  };
}

export const RELIGION_LABELS: Record<
  ReligionId,
  { name: Record<Language, string>; color: string; isAncient?: boolean }
> = {
  catholic: { name: { en: 'Roman Catholic', pl: 'Katolicyzm', szl: 'Katolicyzm', csb: 'Katolicëzm' }, color: '#F59E0B' },
  protestant: { name: { en: 'Protestant', pl: 'Protestantyzm', szl: 'Protestantyzm', csb: 'Pròtestantëzm' }, color: '#3B82F6' },
  orthodox: { name: { en: 'Eastern Orthodox', pl: 'Prawosławie', szl: 'Prawosławie', csb: 'Prawòsławié' }, color: '#8B5CF6' },
  sunni: { name: { en: 'Sunni Islam', pl: 'Islam Sunnicki', szl: 'Islam Sunnicki', csb: 'Sunnicczi Islam' }, color: '#10B981' },
  shia: { name: { en: 'Shia Islam', pl: 'Islam Szyicki', szl: 'Islam Szyicki', csb: 'Szëicczi Islam' }, color: '#059669' },
  hindu: { name: { en: 'Hinduism', pl: 'Hinduizm', szl: 'Hinduizm', csb: 'Hindùizm' }, color: '#F97316' },
  buddhist: { name: { en: 'Buddhism', pl: 'Buddyzm', szl: 'Buddyzm', csb: 'Bùddizm' }, color: '#EAB308' },
  east_asian: { name: { en: 'East Asian Heritage', pl: 'Tradycja Dalekowschodnia', szl: 'Dalekowschodnio', csb: 'Wschòdnioazjacczô' }, color: '#EC4899' },
  judaism: { name: { en: 'Judaism', pl: 'Judaizm', szl: 'Judaizm', csb: 'Jùdaizm' }, color: '#0284C7' },
  secular: { name: { en: 'Secular / Research', pl: 'Świecki / Naukowy', szl: 'Naukowy', csb: 'Naùkòwi' }, color: '#64748B' },
  slavic_rodzimowierstwo: { name: { en: 'Slavic Rodzimowierstwo', pl: 'Rodzimowierstwo Słowiańskie', szl: 'Rodzimowierstwo', csb: 'Słowiańskô Wiara' }, color: '#DC2626', isAncient: true },
  norse_asatru: { name: { en: 'Norse Asatrú', pl: 'Asatrú (Nordycka)', szl: 'Nordycko Wiara', csb: 'Nordicczi Asatrú' }, color: '#06B6D4', isAncient: true },
  hellenic: { name: { en: 'Hellenic Pantheon', pl: 'Panteon Helleński', szl: 'Helleński Panteōn', csb: 'Helleńsczi Panteón' }, color: '#60A5FA', isAncient: true },
  roman_pantheon: { name: { en: 'Roman Pantheon', pl: 'Panteon Rzymski', szl: 'Rzimski Panteōn', csb: 'Rzimsczi Panteón' }, color: '#B91C1C', isAncient: true },
};

export const CULTURE_LABELS: Record<CultureId, { name: Record<Language, string>; color: string }> = {
  west_slavic: { name: { en: 'West Slavic', pl: 'Zachodniosłowiańska', szl: 'Zachodniosłowiańsko', csb: 'Zôpadnosłowiańskô' }, color: '#EF4444' },
  east_slavic: { name: { en: 'East Slavic', pl: 'Wschodniosłowiańska', szl: 'Wschodniosłowiańsko', csb: 'Wschòdnosłowiańskô' }, color: '#8B5CF6' },
  south_slavic: { name: { en: 'South Slavic', pl: 'Południowosłowiańska', szl: 'Połedniowosłowiańsko', csb: 'Pôłniowosłowiańskô' }, color: '#6366F1' },
  germanic: { name: { en: 'Germanic', pl: 'Germańska', szl: 'Germańsko', csb: 'Germańskô' }, color: '#F59E0B' },
  romance: { name: { en: 'Romance', pl: 'Romańska', szl: 'Romańsko', csb: 'Romańskô' }, color: '#EC4899' },
  anglo_celtic: { name: { en: 'Anglo-Celtic', pl: 'Anglosaska', szl: 'Anglosasko', csb: 'Anglosaskô' }, color: '#3B82F6' },
  nordic: { name: { en: 'Nordic', pl: 'Nordycka', szl: 'Nordycko', csb: 'Nordickô' }, color: '#06B6D4' },
  baltic: { name: { en: 'Baltic', pl: 'Bałtycka', szl: 'Bałtycko', csb: 'Bôłtëckô' }, color: '#14B8A6' },
  turkic: { name: { en: 'Turkic', pl: 'Turecka', szl: 'Turecko', csb: 'Tëreckô' }, color: '#DC2626' },
  arabic_semitic: { name: { en: 'Arabic / Semitic', pl: 'Arabska', szl: 'Arabsko', csb: 'Arabskô' }, color: '#10B981' },
  persian: { name: { en: 'Iranian / Persian', pl: 'Perska', szl: 'Persko', csb: 'Perskô' }, color: '#059669' },
  indic: { name: { en: 'Indic', pl: 'Indyjska', szl: 'Indyjsko', csb: 'Indijskô' }, color: '#F97316' },
  sinic: { name: { en: 'Sinic', pl: 'Chińska', szl: 'Chińsko', csb: 'Chińskô' }, color: '#E11D48' },
  japonic_korean: { name: { en: 'Japonic / Korean', pl: 'Japońsko-Koreańska', szl: 'Japōńsko-Korejsko', csb: 'Japòńskò-Kòrejskô' }, color: '#F43F5E' },
  sub_saharan: { name: { en: 'Sub-Saharan', pl: 'Afrykańska', szl: 'Afrykańsko', csb: 'Afrikańskô' }, color: '#84CC16' },
  latin_american: { name: { en: 'Latin American', pl: 'Latynoamerykańska', szl: 'Latynoamerykōńsko', csb: 'Latynoamerikôńskô' }, color: '#22C55E' },
  oceanic: { name: { en: 'Oceanic', pl: 'Oceaniczna', szl: 'Ôceaniczno', csb: 'Òceanicznô' }, color: '#0EA5E9' },
  arctic_research: { name: { en: 'Polar Expedition', pl: 'Polarna', szl: 'Polarno', csb: 'Pòlarnô' }, color: '#E2E8F0' },
};

export const RESOURCE_LABELS: Record<ResourceKind, { name: Record<Language, string>; color: string }> = {
  oil_gas: { name: { en: 'Oil & Natural Gas', pl: 'Ropa i Gaz', szl: 'Ropa i Gaz', csb: 'Ròpa i Gaz' }, color: '#F59E0B' },
  coal_steel: { name: { en: 'Coal & Steel Ore', pl: 'Węgiel i Stal', szl: 'Wōngiel i Stal', csb: 'Wãdżel i Stal' }, color: '#94A3B8' },
  rare_earths: { name: { en: 'Rare Earth Metals', pl: 'Ziemie Rzadkie', szl: 'Zymie Rzadke', csb: 'Rzadczé Zemie' }, color: '#A855F7' },
  grain_timber: { name: { en: 'Grain & Timber', pl: 'Zboże i Drewno', szl: 'Zboże i Drzewo', csb: 'Zbożé i Drzewò' }, color: '#22C55E' },
  uranium: { name: { en: 'Uranium', pl: 'Uran', szl: 'Uran', csb: 'Ùran' }, color: '#10B981' },
  hydro_tech: { name: { en: 'High-Tech / Hydro', pl: 'Hydro & Tech', szl: 'Hydro & Tech', csb: 'Hydro & Tech' }, color: '#38BDF8' },
};

export function getCountryDemographics(countryId: string): {
  religion: ReligionId;
  adherence: number;
  culture: CultureId;
  resource: ResourceKind;
} {
  const map: Record<string, { religion: ReligionId; adherence: number; culture: CultureId; resource: ResourceKind }> = {
    '616': { religion: 'catholic', adherence: 86, culture: 'west_slavic', resource: 'coal_steel' },
    '203': { religion: 'secular', adherence: 72, culture: 'west_slavic', resource: 'coal_steel' },
    '703': { religion: 'catholic', adherence: 74, culture: 'west_slavic', resource: 'hydro_tech' },
    '440': { religion: 'catholic', adherence: 78, culture: 'baltic', resource: 'grain_timber' },
    '428': { religion: 'protestant', adherence: 64, culture: 'baltic', resource: 'grain_timber' },
    '233': { religion: 'secular', adherence: 68, culture: 'nordic', resource: 'hydro_tech' },
    '276': { religion: 'protestant', adherence: 56, culture: 'germanic', resource: 'coal_steel' },
    '040': { religion: 'catholic', adherence: 70, culture: 'germanic', resource: 'hydro_tech' },
    '756': { religion: 'catholic', adherence: 62, culture: 'germanic', resource: 'hydro_tech' },
    '528': { religion: 'secular', adherence: 58, culture: 'germanic', resource: 'hydro_tech' },
    '250': { religion: 'catholic', adherence: 61, culture: 'romance', resource: 'uranium' },
    '380': { religion: 'catholic', adherence: 82, culture: 'romance', resource: 'hydro_tech' },
    '724': { religion: 'catholic', adherence: 73, culture: 'romance', resource: 'grain_timber' },
    '620': { religion: 'catholic', adherence: 84, culture: 'romance', resource: 'grain_timber' },
    '826': { religion: 'protestant', adherence: 60, culture: 'anglo_celtic', resource: 'oil_gas' },
    '372': { religion: 'catholic', adherence: 79, culture: 'anglo_celtic', resource: 'grain_timber' },
    '840': { religion: 'protestant', adherence: 65, culture: 'anglo_celtic', resource: 'oil_gas' },
    '124': { religion: 'catholic', adherence: 58, culture: 'anglo_celtic', resource: 'uranium' },
    '036': { religion: 'protestant', adherence: 55, culture: 'oceanic', resource: 'rare_earths' },
    '554': { religion: 'protestant', adherence: 54, culture: 'oceanic', resource: 'grain_timber' },
    '752': { religion: 'protestant', adherence: 66, culture: 'nordic', resource: 'coal_steel' },
    '578': { religion: 'protestant', adherence: 72, culture: 'nordic', resource: 'oil_gas' },
    '246': { religion: 'protestant', adherence: 71, culture: 'nordic', resource: 'grain_timber' },
    '208': { religion: 'protestant', adherence: 75, culture: 'nordic', resource: 'hydro_tech' },
    '352': { religion: 'protestant', adherence: 78, culture: 'nordic', resource: 'hydro_tech' },
    '304': { religion: 'protestant', adherence: 84, culture: 'nordic', resource: 'rare_earths' },
    '804': { religion: 'orthodox', adherence: 82, culture: 'east_slavic', resource: 'grain_timber' },
    '112': { religion: 'orthodox', adherence: 79, culture: 'east_slavic', resource: 'grain_timber' },
    '643': { religion: 'orthodox', adherence: 74, culture: 'east_slavic', resource: 'oil_gas' },
    '642': { religion: 'orthodox', adherence: 85, culture: 'romance', resource: 'oil_gas' },
    '100': { religion: 'orthodox', adherence: 81, culture: 'south_slavic', resource: 'coal_steel' },
    '300': { religion: 'orthodox', adherence: 90, culture: 'south_slavic', resource: 'grain_timber' },
    '688': { religion: 'orthodox', adherence: 85, culture: 'south_slavic', resource: 'coal_steel' },
    '499': { religion: 'orthodox', adherence: 75, culture: 'south_slavic', resource: 'hydro_tech' },
    '191': { religion: 'catholic', adherence: 86, culture: 'south_slavic', resource: 'grain_timber' },
    '196': { religion: 'orthodox', adherence: 76, culture: 'south_slavic', resource: 'hydro_tech' },
    '792': { religion: 'sunni', adherence: 89, culture: 'turkic', resource: 'coal_steel' },
    '682': { religion: 'sunni', adherence: 95, culture: 'arabic_semitic', resource: 'oil_gas' },
    '818': { religion: 'sunni', adherence: 90, culture: 'arabic_semitic', resource: 'oil_gas' },
    '364': { religion: 'shia', adherence: 92, culture: 'persian', resource: 'oil_gas' },
    '376': { religion: 'judaism', adherence: 78, culture: 'arabic_semitic', resource: 'hydro_tech' },
    '356': { religion: 'hindu', adherence: 80, culture: 'indic', resource: 'coal_steel' },
    '156': { religion: 'east_asian', adherence: 68, culture: 'sinic', resource: 'rare_earths' },
    '158': { religion: 'east_asian', adherence: 74, culture: 'sinic', resource: 'hydro_tech' },
    '392': { religion: 'east_asian', adherence: 76, culture: 'japonic_korean', resource: 'hydro_tech' },
    '410': { religion: 'east_asian', adherence: 58, culture: 'japonic_korean', resource: 'hydro_tech' },
    '076': { religion: 'catholic', adherence: 69, culture: 'latin_american', resource: 'grain_timber' },
    '032': { religion: 'catholic', adherence: 74, culture: 'latin_american', resource: 'grain_timber' },
    '484': { religion: 'catholic', adherence: 80, culture: 'latin_american', resource: 'oil_gas' },
    '010': { religion: 'secular', adherence: 100, culture: 'arctic_research', resource: 'hydro_tech' },
    '010_arctowski': { religion: 'catholic', adherence: 75, culture: 'arctic_research', resource: 'hydro_tech' },
    '010_amundsen': { religion: 'secular', adherence: 95, culture: 'arctic_research', resource: 'hydro_tech' },
    '010_vostok': { religion: 'orthodox', adherence: 70, culture: 'arctic_research', resource: 'uranium' },
    '010_concordia': { religion: 'secular', adherence: 95, culture: 'arctic_research', resource: 'hydro_tech' },
  };
  if (map[countryId]) return map[countryId];
  return { religion: 'secular', adherence: 62, culture: 'sub_saharan', resource: 'grain_timber' };
}

export interface AncientFaithDecision {
  religionId: ReligionId;
  name: Record<Language, string>;
  costDp: number;
  costPln: number;
  bonusText: Record<Language, string>;
}

export const ANCIENT_FAITH_DECISIONS: AncientFaithDecision[] = [
  {
    religionId: 'slavic_rodzimowierstwo',
    name: { en: 'Resurrect Slavic Rodzimowierstwo', pl: 'Odrodzić Rodzimowierstwo Słowiańskie', szl: 'Ôdrodzić Rodzimowierstwo', csb: 'Òdrodzëc Słowiańską Wiarã' },
    costDp: 4,
    costPln: 30,
    bonusText: { en: '+10% Defense & +8 Stability', pl: '+10% Obrony i +8 Stabilności', szl: '+10% Ôbrōny i +8 Stabilności', csb: '+10% Òbronë i +8 Stabilnoscë' },
  },
  {
    religionId: 'norse_asatru',
    name: { en: 'Resurrect Norse Asatrú', pl: 'Odrodzić Wiarę Nordycką Asatrú', szl: 'Ôdrodzić Asatrú', csb: 'Òdrodzëc Nordicczi Asatrú' },
    costDp: 4,
    costPln: 30,
    bonusText: { en: '+12% Naval & Cold Immunity', pl: '+12% Floty i Odporność na Mróz', szl: '+12% Floty i Mrōz', csb: '+12% Flotë i Mróz' },
  },
  {
    religionId: 'hellenic',
    name: { en: 'Resurrect Hellenic Pantheon', pl: 'Odrodzić Panteon Helleński', szl: 'Ôdrodzić Panteōn Helleński', csb: 'Òdrodzëc Helleńsczi Panteón' },
    costDp: 4,
    costPln: 30,
    bonusText: { en: '+15% Research & +10% Trade', pl: '+15% Badań i +10% Handlu', szl: '+15% Badań i +10% Handlu', csb: '+15% Badérowaniô i Handlu' },
  },
  {
    religionId: 'roman_pantheon',
    name: { en: 'Resurrect Roman Pantheon', pl: 'Odrodzić Panteon Rzymski', szl: 'Ôdrodzić Rzimski Panteōn', csb: 'Òdrodzëc Rzimsczi Panteón' },
    costDp: 4,
    costPln: 35,
    bonusText: { en: '+12% Attack & +50 Legacy Pts', pl: '+12% Ataku i +50 Pkt Dziedzictwa', szl: '+12% Ataku i +50 Dziedzictwa', csb: '+12% Ataku i +50 Dzedzëctwa' },
  },
];

export interface HistoricEmpireDecision {
  id: string;
  name: Record<Language, string>;
  eligibleCountryIds: string[];
  requiredProvincesOwned: number;
  costPln: number;
  costDp: number;
  newColorHex: string;
  bonusText: Record<Language, string>;
}

export const REFORMABLE_EMPIRES: HistoricEmpireDecision[] = [
  {
    id: 'polish_lithuanian_commonwealth',
    name: { en: 'Reform Polish-Lithuanian Commonwealth', pl: 'Odtwórz Rzeczpospolitą Obojga Narodów', szl: 'Rzeczpospolito Ôbōjga Narodōw', csb: 'Rzeczpòspòlitô Òbù Nôrodów' },
    eligibleCountryIds: ['616', '440', '804', '112'],
    requiredProvincesOwned: 18,
    costPln: 55,
    costDp: 4,
    newColorHex: '#DC143C',
    bonusText: { en: '+15 Stability, +60k Manpower, +80 Legacy Pts', pl: '+15 Stabilności, +60k Rezerw, +80 Dziedzictwa', szl: '+15 Stabilności i +60k Wojska', csb: '+15 Stabilnoscë i +60k Rezerwów' },
  },
  {
    id: 'great_lechia',
    name: { en: 'Proclaim Empire of Great Lechia', pl: 'Ogłoś Imperium Wielkiej Lechii', szl: 'Imperium Wielgij Lechije', csb: 'Imperium Wiôldżi Lechii' },
    eligibleCountryIds: ['616', '203', '703'],
    requiredProvincesOwned: 20,
    costPln: 65,
    costDp: 5,
    newColorHex: '#E11D48',
    bonusText: { en: '+20% Tax, +10% Attack & +100 Legacy Pts', pl: '+20% Podatków, +10% Ataku i +100 Dziedzictwa', szl: '+20% Podatków i +100 Dziedzictwa', csb: '+20% Pòdatków i +100 Dzedzëctwa' },
  },
  {
    id: 'roman_empire',
    name: { en: 'Restore the Roman Empire (SPQR)', pl: 'Przywróć Cesarstwo Rzymskie (SPQR)', szl: 'Cesarstwo Rzimske (SPQR)', csb: 'Rzimsczé Cesorstwò (SPQR)' },
    eligibleCountryIds: ['380', '250', '724', '300', '792'],
    requiredProvincesOwned: 12,
    costPln: 75,
    costDp: 5,
    newColorHex: '#991B1B',
    bonusText: { en: '+20% Legions Power & +120 Legacy Pts', pl: '+20% Siły Legionów i +120 Dziedzictwa', szl: '+20% Legionōw i +120 Dziedzictwa', csb: '+20% Legionów i +120 Dzedzëctwa' },
  },
  {
    id: 'kievan_rus',
    name: { en: 'Unite the Kievan Rus', pl: 'Zjednocz Ruś Kijowską', szl: 'Ruś Kijowsko', csb: 'Kijowskô Rëscz' },
    eligibleCountryIds: ['804', '112', '643'],
    requiredProvincesOwned: 12,
    costPln: 60,
    costDp: 4,
    newColorHex: '#7C3AED',
    bonusText: { en: '+50k Manpower, +12 Stability & +80 Legacy Pts', pl: '+50k Rezerw, +12 Stabilności i +80 Dziedzictwa', szl: '+50k Rezerw i +80 Dziedzictwa', csb: '+50k Rezerwów i +80 Dzedzëctwa' },
  },
  {
    id: 'nordic_union',
    name: { en: 'Form Kalmar Nordic Union', pl: 'Unia Kalmarska (Skandynawia)', szl: 'Unijo Kalmarsko', csb: 'Kalmarskô Ùniô' },
    eligibleCountryIds: ['752', '578', '208', '246', '352'],
    requiredProvincesOwned: 8,
    costPln: 50,
    costDp: 4,
    newColorHex: '#0284C7',
    bonusText: { en: '+20% Naval Trade & Arctic Supremacy', pl: '+20% Handlu Morskiego i Arktyka', szl: '+20% Handlu Morskiego', csb: '+20% Mòrsczégò Handlu' },
  },
];

export interface LegacyPerkDef {
  id: string;
  costLegacy: number;
  name: Record<Language, string>;
  effect: Record<Language, string>;
}

export const CIVILIZATION_LEGACY_PERKS: LegacyPerkDef[] = [
  {
    id: 'leg_iron_discipline',
    costLegacy: 25,
    name: { en: 'Iron Martial Discipline', pl: 'Żelazna Dyscyplina', szl: 'Żelazno Dyscyplina', csb: 'Żelaznô Discëplina' },
    effect: { en: '+10% All Military Attack & Defense', pl: '+10% Ataku i Obrony Armii', szl: '+10% Ataku i Ôbrōny', csb: '+10% Ataku i Òbronë' },
  },
  {
    id: 'leg_merchant_guild',
    costLegacy: 25,
    name: { en: 'Grand Mercantile Charter', pl: 'Wielka Karta Kupiecka', szl: 'Wielgo Karta Kupiecko', csb: 'Wiôlgô Kôrta Kùpieckô' },
    effect: { en: '+15% Tax & Trade Output', pl: '+15% Dochodów z Podatków i Handlu', szl: '+15% Podatków i Handlu', csb: '+15% Pòdatków i Handlu' },
  },
  {
    id: 'leg_academy_patron',
    costLegacy: 30,
    name: { en: 'Royal Academy Patronage', pl: 'Mecenat Akademii Królewskiej', szl: 'Mecenat Akademije', csb: 'Mecenat Akademii' },
    effect: { en: '+25% Monthly Research Points', pl: '+25% Punktów Badań', szl: '+25% Badań', csb: '+25% Badérowaniô' },
  },
  {
    id: 'leg_civic_harmony',
    costLegacy: 30,
    name: { en: 'Civic Harmony & Assimilation', pl: 'Zgoda Obywatelska i Asymilacja', szl: 'Zgoda i Asymilacyjo', csb: 'Òbëwatelskô Zgòda' },
    effect: { en: '+2x Assimilation Speed & +6 Stability', pl: '2x Szybsza Asymilacja i +6 Stabilności', szl: '2x Asymilacyjo i +6 Stabilności', csb: '2x Chùtszô Asymilacjô' },
  },
  {
    id: 'leg_orbital_ambition',
    costLegacy: 45,
    name: { en: 'Imperium Ad Astra', pl: 'Imperium Ad Astra', szl: 'Imperium Ad Astra', csb: 'Imperium Ad Astra' },
    effect: { en: '+30% Space Income & +50% Commander XP', pl: '+30% Dochodów z Kosmosu i +50% XP', szl: '+30% Kosmos i +50% XP', csb: '+30% Kòsmòs i +50% XP' },
  },
];

export const DYNAMIC_GRAFFITI_SLOGANS: Record<string, string> = {
  '616': 'POLSKA GÓRĄ!',
  '276': 'DEUTSCHLAND VORAN!',
  '250': 'VIVE LA FRANCE!',
  '826': 'RULE BRITANNIA!',
  '840': 'USA SUPREMACY!',
  '804': 'СЛАВА УКРАЇНІ!',
  '203': 'PRAHA VLÁDNE!',
  '703': 'SLOVENSKO VPRED!',
  '440': 'LIETUVA VALDO!',
  '428': 'LATVIJA UZVAR!',
  '233': 'EESTI JÕUD!',
  '380': 'FORZA ITALIA!',
  '724': 'ESPAÑA INVICTA!',
  '752': 'SVERIGE FÖRST!',
  '578': 'NORGE STYRER!',
  '246': 'SISU FINLAND!',
  '643': 'MOSCOW ASCENDANT!',
  '156': 'DRAGON REIGNS!',
  '392': 'NIPPON BANZAI!',
  '410': 'SEOUL VICTORY!',
  '356': 'JAI HIND!',
  '076': 'BRASIL CAMPEÃO!',
  '792': 'TÜRKİYE ZİRVEDE!',
  '499': 'CRNA GORA!',
  '196': 'CYPRUS FOREVER!',
  '100': 'БЪЛГАРИЯ НАД ВСИЧКО!',
  '010_arctowski': 'ARCTOWSKI POLAR HQ!',
};

export function getCountryGraffitiSlogan(
  attackerId: string,
  attackerName: string,
  customOverride?: string,
): string {
  const cleaned = customOverride?.trim();
  if (cleaned) return cleaned.slice(0, 36).toUpperCase();
  if (DYNAMIC_GRAFFITI_SLOGANS[attackerId]) return DYNAMIC_GRAFFITI_SLOGANS[attackerId];
  const base = attackerName.replace(/\(.*?\)/g, '').trim().toUpperCase();
  return `${base || 'EMPIRE'} RULES!`;
}

const GENERAL_FIRST_NAMES = [
  'Gen. Stanisław',
  'Marshal Jan',
  'Gen. Elena',
  'Field Marshal Marcus',
  'Gen. Kazuki',
  'Gen. Astrid',
  'Gen. Viktor',
  'Gen. Sofia',
];

const GENERAL_LAST_NAMES = [
  'Sobieski',
  'Kowalski',
  'Vance',
  'Lindqvist',
  'Kuroda',
  'Marek',
  'Orlov',
  'Valenti',
];

export function generateGeneralForCountry(
  countryId: string,
  specialty: MilitaryGeneral['specialty'],
  seedIndex: number,
): MilitaryGeneral {
  const fn = GENERAL_FIRST_NAMES[(seedIndex + countryId.charCodeAt(0)) % GENERAL_FIRST_NAMES.length];
  const ln = GENERAL_LAST_NAMES[(seedIndex * 3 + countryId.length) % GENERAL_LAST_NAMES.length];
  const attackBonus = specialty === 'armor' || specialty === 'infantry' ? 0.1 : specialty === 'siege' ? 0.12 : 0.06;
  const defenseBonus = specialty === 'artillery' || specialty === 'infantry' ? 0.1 : 0.06;
  const speedBonus = specialty === 'logistics' ? 0.2 : 0.05;
  return {
    id: `gen_${countryId}_${Date.now()}_${seedIndex}`,
    name: `${fn} ${ln}`,
    countryId,
    level: 1,
    xp: 0,
    specialty,
    attackBonus,
    defenseBonus,
    speedBonus,
  };
}
