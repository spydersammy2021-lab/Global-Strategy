import type { CountryMeta, FlagPattern } from '../game/types';
import { AUTHENTIC_FLAGS, getAuthenticFlag } from './flags';

const c = (
  id: string,
  alpha2: string,
  pl: string,
  en: string,
  areaKm2: number,
  populationM: number,
  color: string,
  flag: FlagPattern,
  startingArmy2026: number,
  provinceNames?: string[],
  szl?: string,
  csb?: string,
  gdpFactor = 1.0,
): CountryMeta => ({
  id,
  alpha2,
  name: {
    pl,
    en,
    szl: szl ?? pl,
    csb: csb ?? pl,
  },
  areaKm2,
  populationM,
  color,
  flag: AUTHENTIC_FLAGS[id] ?? flag,
  startingArmy2026,
  provinceNames,
  gdpFactor,
});

export const CORE_COUNTRIES: CountryMeta[] = [
  // Central & Eastern Europe (Mandatory & Detailed)
  c(
    '616',
    'PL',
    'Polska',
    'Poland',
    312696,
    37.6,
    '#E11D48',
    { type: 'h2', colors: ['#FFFFFF', '#DC2626'] },
    83000,
    [
      'Mazowieckie',
      'Śląskie',
      'Małopolskie',
      'Wielkopolskie',
      'Dolnośląskie',
      'Pomorskie',
      'Zachodniopomorskie',
      'Kujawsko-Pomorskie',
      'Łódzkie',
      'Lubelskie',
      'Podkarpackie',
      'Podlaskie',
      'Warmińsko-Mazurskie',
      'Lubuskie',
      'Opolskie',
      'Świętokrzyskie',
    ],
    'Polsko',
    'Pòlskô',
    1.35,
  ),
  c('276', 'DE', 'Niemcy', 'Germany', 357588, 84.4, '#475569', { type: 'h3', colors: ['#111827', '#DC2626', '#FACC15'] }, 140000, ['Brandenburgia', 'Bawaria', 'Nadrenia', 'Saksonia', 'Dolna Saksonia'], 'Niymce', 'Miemcë', 2.4),
  c('203', 'CZ', 'Czechy', 'Czechia', 78866, 10.8, '#0284C7', { type: 'canton', colors: ['#FFFFFF', '#DC2626', '#1D4ED8'] }, 28000, ['Bohemia', 'Morawy'], 'Czechy', 'Czeskô', 1.3),
  c('703', 'SK', 'Słowacja', 'Slovakia', 49035, 5.4, '#6366F1', { type: 'h3', colors: ['#FFFFFF', '#1D4ED8', '#DC2626'], emblemColor: '#DC2626' }, 19000, ['Zachodnia Słowacja', 'Wschodnia Słowacja'], 'Słowacyjo', 'Słowackô', 1.1),
  c('440', 'LT', 'Litwa', 'Lithuania', 65300, 2.8, '#D97706', { type: 'h3', colors: ['#FACC15', '#15803D', '#DC2626'] }, 22000, ['Auksztota', 'Żmudź'], 'Litwa', 'Lëtewskô', 1.15),
  c('428', 'LV', 'Łotwa', 'Latvia', 64589, 1.9, '#9F1239', { type: 'h3', colors: ['#9F1239', '#FFFFFF', '#9F1239'] }, 17000, ['Liwonia', 'Kurlandia'], 'Łotwa', 'Łotewskô', 1.1),
  c('233', 'EE', 'Estonia', 'Estonia', 45339, 1.4, '#2563EB', { type: 'h3', colors: ['#2563EB', '#111827', '#FFFFFF'] }, 8500, ['Estonia Północna', 'Estonia Południowa'], 'Estōnijo', 'Estoniô', 1.2),
  c('112', 'BY', 'Białoruś', 'Belarus', 207600, 9.2, '#15803D', { type: 'h2', colors: ['#DC2626', '#16A34A'] }, 62000, ['Mińsk', 'Grodno', 'Brześć'], 'Biołoruś', 'Biôłorëskô', 0.85),
  c('804', 'UA', 'Ukraina', 'Ukraine', 603628, 36.7, '#EAB308', { type: 'h2', colors: ['#2563EB', '#FACC15'] }, 420000, ['Kijów', 'Lwów', 'Odessa', 'Charków', 'Dnipro'], 'Ukraina', 'Ùkrajina', 0.95),
  c('643', 'RU', 'Rosja', 'Russia', 17098242, 144.2, '#166534', { type: 'h3', colors: ['#FFFFFF', '#1D4ED8', '#DC2626'] }, 350000, ['Moskwa', 'Petersburg', 'Wołga', 'Ural', 'Syberia', 'Daleki Wschód'], 'Rusyjo', 'Ruskô', 1.5),

  // Western & Southern Europe
  c('250', 'FR', 'Francja', 'France', 551695, 68.1, '#1D4ED8', { type: 'v3', colors: ['#1D4ED8', '#FFFFFF', '#DC2626'] }, 205000, ['Île-de-France', 'Normandia', 'Akwitania', 'Prowansja'], 'Francyjo', 'Francëjô', 2.2),
  c('826', 'GB', 'Wielka Brytania', 'United Kingdom', 243610, 67.7, '#DC2626', { type: 'cross', colors: ['#1E3A8A', '#DC2626', '#FFFFFF'] }, 184000, ['Anglia', 'Szkocja', 'Walia'], 'Wielgo Brytanijo', 'Wiôlgô Britanijô', 2.2),
  c('380', 'IT', 'Włochy', 'Italy', 301340, 58.8, '#10B981', { type: 'v3', colors: ['#16A34A', '#FFFFFF', '#DC2626'] }, 165000, ['Lombardia', 'Lacjum', 'Sycylia'], 'Włochy', 'Włochë', 1.9),
  c('724', 'ES', 'Hiszpania', 'Spain', 505990, 48.3, '#F59E0B', { type: 'h3', colors: ['#DC2626', '#FACC15', '#DC2626'] }, 122000, ['Kastylia', 'Katalonia', 'Andaluzja'], 'Szpanijo', 'Szpaniô', 1.7),
  c('620', 'PT', 'Portugalia', 'Portugal', 92212, 10.5, '#059669', { type: 'v3', colors: ['#15803D', '#DC2626', '#DC2626'], emblemColor: '#FACC15' }, 32000, ['Lizbona', 'Porto'], 'Portugalijo', 'Pòrtugalskô', 1.3),
  c('528', 'NL', 'Holandia', 'Netherlands', 41543, 17.9, '#EA580C', { type: 'h3', colors: ['#DC2626', '#FFFFFF', '#1D4ED8'] }, 41000, ['Holandia'], 'Niderlandy', 'Niderlandzkô', 2.1),
  c('056', 'BE', 'Belgia', 'Belgium', 30689, 11.7, '#CA8A04', { type: 'v3', colors: ['#111827', '#FACC15', '#DC2626'] }, 26000, ['Flandria i Walonia'], 'Belgijo', 'Belgiô', 1.9),
  c('756', 'CH', 'Szwajcaria', 'Switzerland', 41285, 8.8, '#EF4444', { type: 'cross', colors: ['#DC2626', '#FFFFFF'] }, 24000, ['Alpy Szwajcarskie'], 'Szwajcaryjo', 'Szwajcarskô', 2.5),
  c('040', 'AT', 'Austria', 'Austria', 83879, 9.1, '#B91C1C', { type: 'h3', colors: ['#DC2626', '#FFFFFF', '#DC2626'] }, 22000, ['Wiedeń', 'Tyrol'], 'Austryjo', 'Aùstriô', 1.8),
  c('348', 'HU', 'Węgry', 'Hungary', 93030, 9.6, '#0D9488', { type: 'h3', colors: ['#DC2626', '#FFFFFF', '#15803D'] }, 34000, ['Budapeszt', 'Wielka Nizina'], 'Wyngry', 'Wãgrë', 1.2),
  c('642', 'RO', 'Rumunia', 'Romania', 238397, 19.0, '#FBBF24', { type: 'v3', colors: ['#1D4ED8', '#FACC15', '#DC2626'] }, 71000, ['Wołoszczyzna', 'Transylwania', 'Mołdawia'], 'Rōmunijo', 'Rumùńskô', 1.15),
  c('100', 'BG', 'Bułgaria', 'Bulgaria', 110994, 6.4, '#22C55E', { type: 'h3', colors: ['#FFFFFF', '#16A34A', '#DC2626'] }, 37000, ['Sofia', 'Tracka'], 'Bułgaryjo', 'Bùłgarskô', 1.0),
  c('300', 'GR', 'Grecja', 'Greece', 131957, 10.4, '#38BDF8', { type: 'canton', colors: ['#0284C7', '#FFFFFF', '#0284C7'] }, 142000, ['Attyka', 'Macedonia'], 'Grecyjo', 'Grecjô', 1.25),
  c('752', 'SE', 'Szwecja', 'Sweden', 450295, 10.5, '#0369A1', { type: 'cross', colors: ['#1D4ED8', '#FACC15'] }, 38000, ['Sztokholm', 'Götaland', 'Norrland'], 'Szwecyjo', 'Szwedzkô', 2.0),
  c('578', 'NO', 'Norwegia', 'Norway', 385207, 5.5, '#BE123C', { type: 'cross', colors: ['#DC2626', '#1E3A8A', '#FFFFFF'] }, 25000, ['Oslo', 'Finnmark'], 'Norwegijo', 'Norweskô', 2.3),
  c('246', 'FI', 'Finlandia', 'Finland', 338455, 5.6, '#60A5FA', { type: 'cross', colors: ['#FFFFFF', '#1D4ED8'] }, 31000, ['Helsinki', 'Laponia'], 'Finlandyjo', 'Fińskô', 1.9),
  c('208', 'DK', 'Dania', 'Denmark', 42933, 5.9, '#E11D48', { type: 'cross', colors: ['#DC2626', '#FFFFFF'] }, 21000, ['Zelandia (Kopenhaga)', 'Jutlandia'], 'Danijo', 'Dëńskô', 2.0),
  c('372', 'IE', 'Irlandia', 'Ireland', 70273, 5.1, '#34D399', { type: 'v3', colors: ['#16A34A', '#FFFFFF', '#F97316'] }, 9000, ['Dublin'], 'Irlandyjo', 'Irlandiô', 2.1),
  c('688', 'RS', 'Serbia', 'Serbia', 77474, 6.6, '#7C3AED', { type: 'h3', colors: ['#DC2626', '#1D4ED8', '#FFFFFF'] }, 28000, ['Belgrad'], 'Serbijo', 'Serbiô', 0.9),
  c('191', 'HR', 'Chorwacja', 'Croatia', 56594, 3.8, '#EC4899', { type: 'h3', colors: ['#DC2626', '#FFFFFF', '#1D4ED8'] }, 15000, ['Dalmacja'], 'Chorwacyjo', 'Chòrwackô', 1.15),
  c('792', 'TR', 'Turcja', 'Turkey', 783562, 85.3, '#B91C1C', { type: 'circle', colors: ['#DC2626', '#FFFFFF'] }, 425000, ['Stambuł', 'Anatolia', 'Wschodnia Turcja'], 'Turcyjo', 'Tëreckô', 1.4),

  // Major Global Powers
  c('840', 'US', 'USA', 'United States', 9833517, 334.9, '#2563EB', { type: 'canton', colors: ['#DC2626', '#FFFFFF', '#1E3A8A'] }, 1390000, ['Wschodnie Wybrzeże', 'Środkowy Zachód', 'Teksas', 'Kalifornia', 'Alaska'], 'USA', 'USA', 3.0),
  c('124', 'CA', 'Kanada', 'Canada', 9984670, 40.1, '#F43F5E', { type: 'v3', colors: ['#DC2626', '#FFFFFF', '#DC2626'], emblemColor: '#DC2626' }, 68000, ['Ontario', 'Quebec', 'Kolumbia Brytyjska', 'Terytoria Północne'], 'Kanada', 'Kanada', 2.1),
  c('484', 'MX', 'Meksyk', 'Mexico', 1964375, 128.5, '#16A34A', { type: 'v3', colors: ['#15803D', '#FFFFFF', '#DC2626'], emblemColor: '#92400E' }, 250000, ['Meksyk', 'Sonora', 'Jukatan'], 'Meksyk', 'Meksyk', 1.25),
  c('076', 'BR', 'Brazylia', 'Brazil', 8515767, 216.4, '#22C55E', { type: 'circle', colors: ['#16A34A', '#FACC15', '#1D4ED8'] }, 360000, ['Brasília', 'São Paulo', 'Amazonia', 'Bahia'], 'Brazylijo', 'Brazylijô', 1.45),
  c('032', 'AR', 'Argentyna', 'Argentina', 2780400, 46.6, '#38BDF8', { type: 'h3', colors: ['#38BDF8', '#FFFFFF', '#38BDF8'], emblemColor: '#FACC15' }, 83000, ['Buenos Aires', 'Patagonia', 'Cordoba'], 'Argyntyna', 'Argentinëjô', 1.1),
  c('156', 'CN', 'Chiny', 'China', 9596961, 1410.0, '#DC2626', { type: 'canton', colors: ['#DC2626', '#FACC15', '#DC2626'] }, 2035000, ['Pekin', 'Szanghaj', 'Kanton', 'Syczuan', 'Sinciang', 'Tybet'], 'Chiny', 'Chinë', 2.8),
  c('356', 'IN', 'Indie', 'India', 3287263, 1428.6, '#F97316', { type: 'h3', colors: ['#F97316', '#FFFFFF', '#16A34A'], emblemColor: '#1E3A8A' }, 1455000, ['Delhi', 'Bombaj', 'Bengal', 'Dekkan'], 'Indyje', 'Indie', 2.1),
  c('392', 'JP', 'Japonia', 'Japan', 377975, 123.3, '#FB7185', { type: 'circle', colors: ['#FFFFFF', '#DC2626'] }, 247000, ['Honsiu', 'Hokkaido', 'Kiusiu'], 'Japōnijo', 'Japòniô', 2.3),
  c('410', 'KR', 'Korea Południowa', 'South Korea', 100210, 51.7, '#3B82F6', { type: 'circle', colors: ['#FFFFFF', '#DC2626', '#1D4ED8'] }, 500000, ['Seul'], 'Połedniowo Korejo', 'Pôłniowô Kòreja', 2.0),
  c('408', 'KP', 'Korea Północna', 'North Korea', 120538, 26.1, '#991B1B', { type: 'h3', colors: ['#1D4ED8', '#DC2626', '#1D4ED8'], emblemColor: '#FFFFFF' }, 1280000, ['Pjongjang'], 'Pōłnocno Korejo', 'Nordowô Kòreja', 0.45),
  c('036', 'AU', 'Australia', 'Australia', 7692024, 26.6, '#0EA5E9', { type: 'canton', colors: ['#1E3A8A', '#FFFFFF', '#DC2626'] }, 60000, ['Nowa Południowa Walia', 'Queensland', 'Australia Zachodnia', 'Terytorium Północne'], 'Australijo', 'Aùstraliô', 2.0),
  c('682', 'SA', 'Arabia Saudyjska', 'Saudi Arabia', 2149690, 36.9, '#15803D', { type: 'h2', colors: ['#15803D', '#15803D'], emblemColor: '#FFFFFF' }, 257000, ['Rijad', 'Hidżaz'], 'Arabijo Saudyjsko', 'Saudëjskô Arabiô', 1.8),
  c('364', 'IR', 'Iran', 'Iran', 1648195, 89.2, '#047857', { type: 'h3', colors: ['#16A34A', '#FFFFFF', '#DC2626'] }, 610000, ['Teheran', 'Isfahan', 'Chorasan'], 'Iran', 'Iran', 1.15),
  c('376', 'IL', 'Izrael', 'Israel', 22072, 9.7, '#2563EB', { type: 'h3', colors: ['#2563EB', '#FFFFFF', '#2563EB'], emblemColor: '#2563EB' }, 170000, ['Jerozolima'], 'Izrael', 'Izrael', 1.9),
  c('818', 'EG', 'Egipt', 'Egypt', 1002450, 112.7, '#D97706', { type: 'h3', colors: ['#DC2626', '#FFFFFF', '#111827'], emblemColor: '#FACC15' }, 440000, ['Kair', 'Górny Egipt'], 'Egipt', 'Egipt', 1.1),
  c('710', 'ZA', 'RPA', 'South Africa', 1221037, 60.4, '#10B981', { type: 'canton', colors: ['#15803D', '#DC2626', '#1D4ED8'] }, 74000, ['Pretoria', 'Kapsztad'], 'RPA', 'Pôłniowô Afrika', 1.15),
  c('566', 'NG', 'Nigeria', 'Nigeria', 923768, 223.8, '#059669', { type: 'v3', colors: ['#15803D', '#FFFFFF', '#15803D'] }, 230000, ['Abudża', 'Lagos'], 'Nigeryjo', 'Nigeriô', 0.95),
  c('586', 'PK', 'Pakistan', 'Pakistan', 881913, 240.5, '#065F46', { type: 'v3', colors: ['#FFFFFF', '#15803D', '#15803D'], emblemColor: '#FFFFFF' }, 654000, ['Islamabad', 'Pendżab', 'Sindh'], 'Pakistan', 'Pakistan', 0.95),
  c('360', 'ID', 'Indonezja', 'Indonesia', 1904569, 277.5, '#E11D48', { type: 'h2', colors: ['#DC2626', '#FFFFFF'] }, 400000, ['Jawa', 'Sumatra', 'Borneo'], 'Indōnezyjo', 'Indonezjô', 1.3),
  c('704', 'VN', 'Wietnam', 'Vietnam', 331212, 98.9, '#EF4444', { type: 'circle', colors: ['#DC2626', '#FACC15'] }, 482000, ['Hanoi', 'Ho Chi Minh'], 'Wietnam', 'Wietnam', 1.1),
  c('764', 'TH', 'Tajlandia', 'Thailand', 513120, 71.8, '#4F46E5', { type: 'h3', colors: ['#DC2626', '#FFFFFF', '#1E3A8A'] }, 360000, ['Bangkok', 'Chiang Mai'], 'Tajlandyjo', 'Tajlandiô', 1.2),
  c('608', 'PH', 'Filipiny', 'Philippines', 300000, 117.3, '#0EA5E9', { type: 'canton', colors: ['#1D4ED8', '#DC2626', '#FFFFFF'] }, 150000, ['Luzon', 'Mindanao'], 'Filipiny', 'Filipinë', 1.05),
  c('170', 'CO', 'Kolumbia', 'Colombia', 1141748, 52.1, '#EAB308', { type: 'h3', colors: ['#FACC15', '#1D4ED8', '#DC2626'] }, 293000, ['Bogota', 'Antioquia'], 'Kolumbijo', 'Kòlumbiô', 1.05),
  c('604', 'PE', 'Peru', 'Peru', 1285216, 34.4, '#DC2626', { type: 'v3', colors: ['#DC2626', '#FFFFFF', '#DC2626'] }, 95000, ['Lima', 'Cusco'], 'Peru', 'Peru', 1.0),
  c('152', 'CL', 'Chile', 'Chile', 756102, 19.6, '#2563EB', { type: 'canton', colors: ['#FFFFFF', '#DC2626', '#1D4ED8'] }, 80000, ['Santiago', 'Patagonia'], 'Chile', 'Chile', 1.25),
  c('862', 'VE', 'Wenezuela', 'Venezuela', 916445, 28.8, '#F59E0B', { type: 'h3', colors: ['#FACC15', '#1D4ED8', '#DC2626'] }, 123000, ['Caracas', 'Orinoko'], 'Wenezuela', 'Wenezuela', 0.8),
  c('398', 'KZ', 'Kazachstan', 'Kazakhstan', 2724900, 19.6, '#06B6D4', { type: 'circle', colors: ['#06B6D4', '#FACC15'] }, 45000, ['Astana', 'Ałmaty', 'Stepy Zachodnie'], 'Kazachstan', 'Kazachstón', 1.15),
  c('012', 'DZ', 'Algieria', 'Algeria', 2381741, 45.6, '#16A34A', { type: 'v3', colors: ['#15803D', '#FFFFFF', '#FFFFFF'], emblemColor: '#DC2626' }, 130000, ['Algier', 'Sahara'], 'Algeryjo', 'Algeriô', 1.0),
  c('504', 'MA', 'Maroko', 'Morocco', 446550, 37.8, '#B91C1C', { type: 'circle', colors: ['#DC2626', '#15803D'] }, 195000, ['Rabat', 'Marrakesz'], 'Maroko', 'Marokò', 1.05),
  c('231', 'ET', 'Etiopia', 'Ethiopia', 1104300, 126.5, '#15803D', { type: 'h3', colors: ['#16A34A', '#FACC15', '#DC2626'] }, 162000, ['Addis Abeba', 'Amhara'], 'Etiopijo', 'Etiopiô', 0.75),
  c('180', 'CD', 'DR Konga', 'DR Congo', 2344858, 102.3, '#0284C7', { type: 'diagonal', colors: ['#0284C7', '#FACC15', '#DC2626'] }, 134000, ['Kinszasa', 'Katanga'], 'DR Kōnga', 'DR Kòngò', 0.7),
  c('729', 'SD', 'Sudan', 'Sudan', 1861484, 48.1, '#DC2626', { type: 'h3', colors: ['#DC2626', '#FFFFFF', '#111827'], emblemColor: '#15803D' }, 105000, ['Chartum', 'Darfur'], 'Sudan', 'Sudan', 0.65),
  c('434', 'LY', 'Libia', 'Libya', 1759540, 6.9, '#111827', { type: 'h3', colors: ['#DC2626', '#111827', '#15803D'] }, 30000, ['Trypolis', 'Cyrenajka'], 'Libijo', 'Libiô', 0.9),
  c('368', 'IQ', 'Irak', 'Iraq', 438317, 45.5, '#B91C1C', { type: 'h3', colors: ['#DC2626', '#FFFFFF', '#111827'] }, 193000, ['Bagdad', 'Basra'], 'Irak', 'Irak', 0.95),
  c('004', 'AF', 'Afganistan', 'Afghanistan', 652864, 42.2, '#334155', { type: 'v3', colors: ['#111827', '#DC2626', '#15803D'] }, 110000, ['Kabul', 'Kandahar'], 'Afganistan', 'Afganistón', 0.55),
  c('104', 'MM', 'Mjanma', 'Myanmar', 676578, 54.6, '#CA8A04', { type: 'h3', colors: ['#FACC15', '#16A34A', '#DC2626'] }, 150000, ['Rangun', 'Mandalaj'], 'Mjanma', 'Mjanma', 0.75),
  c('458', 'MY', 'Malezja', 'Malaysia', 330803, 34.3, '#1D4ED8', { type: 'canton', colors: ['#DC2626', '#FFFFFF', '#1E3A8A'] }, 113000, ['Półwysep Malajski', 'Sarawak'], 'Malezyjo', 'Malezjô', 1.35),
  c('554', 'NZ', 'Nowa Zelandia', 'New Zealand', 268021, 5.2, '#0F766E', { type: 'canton', colors: ['#1E3A8A', '#FFFFFF', '#DC2626'] }, 10000, ['Wyspa Północna', 'Wyspa Południowa'], 'Nowo Zelandyo', 'Nowô Zelandiô', 1.7),
  c('304', 'GL', 'Grenlandia', 'Greenland', 2166086, 0.06, '#E2E8F0', { type: 'h2', colors: ['#FFFFFF', '#DC2626'] }, 2000, ['Nuuk'], 'Grynlandyjo', 'Grenlandiô', 1.0),
];

const EXTRA_METADATA: Record<string, { pl: string; alpha2: string; areaKm2: number; popM: number; army: number }> = {
  '242': { pl: 'Fidżi', alpha2: 'FJ', areaKm2: 18274, popM: 0.9, army: 4000 },
  '834': { pl: 'Tanzania', alpha2: 'TZ', areaKm2: 945087, popM: 67.4, army: 27000 },
  '732': { pl: 'Sahara Zachodnia', alpha2: 'EH', areaKm2: 266000, popM: 0.6, army: 8000 },
  '860': { pl: 'Uzbekistan', alpha2: 'UZ', areaKm2: 447400, popM: 35.6, army: 48000 },
  '598': { pl: 'Papua-Nowa Gwinea', alpha2: 'PG', areaKm2: 462840, popM: 10.3, army: 4500 },
  '706': { pl: 'Somalia', alpha2: 'SO', areaKm2: 637657, popM: 18.1, army: 20000 },
  '404': { pl: 'Kenia', alpha2: 'KE', areaKm2: 580367, popM: 55.1, army: 24000 },
  '148': { pl: 'Czad', alpha2: 'TD', areaKm2: 1284000, popM: 18.3, army: 33000 },
  '332': { pl: 'Haiti', alpha2: 'HT', areaKm2: 27750, popM: 11.7, army: 5000 },
  '214': { pl: 'Dominikana', alpha2: 'DO', areaKm2: 48671, popM: 11.3, army: 56000 },
  '044': { pl: 'Bahamy', alpha2: 'BS', areaKm2: 13943, popM: 0.4, army: 1500 },
  '238': { pl: 'Falklandy', alpha2: 'FK', areaKm2: 12173, popM: 0.004, army: 1200 },
  '260': { pl: 'Francuskie Terytoria Południowe', alpha2: 'TF', areaKm2: 7747, popM: 0.001, army: 500 },
  '626': { pl: 'Timor Wschodni', alpha2: 'TL', areaKm2: 14874, popM: 1.4, army: 2200 },
  '426': { pl: 'Lesotho', alpha2: 'LS', areaKm2: 30355, popM: 2.3, army: 2000 },
  '858': { pl: 'Urugwaj', alpha2: 'UY', areaKm2: 176215, popM: 3.4, army: 22000 },
  '068': { pl: 'Boliwia', alpha2: 'BO', areaKm2: 1098581, popM: 12.4, army: 34000 },
  '591': { pl: 'Panama', alpha2: 'PA', areaKm2: 75417, popM: 4.5, army: 26000 },
  '188': { pl: 'Kostaryka', alpha2: 'CR', areaKm2: 51100, popM: 5.2, army: 10000 },
  '558': { pl: 'Nikaragua', alpha2: 'NI', areaKm2: 130373, popM: 7.0, army: 12000 },
  '340': { pl: 'Honduras', alpha2: 'HN', areaKm2: 112492, popM: 10.6, army: 15000 },
  '222': { pl: 'Salwador', alpha2: 'SV', areaKm2: 21041, popM: 6.4, army: 25000 },
  '320': { pl: 'Gwatemala', alpha2: 'GT', areaKm2: 108889, popM: 18.1, army: 22000 },
  '084': { pl: 'Belize', alpha2: 'BZ', areaKm2: 22966, popM: 0.4, army: 1500 },
  '328': { pl: 'Gujana', alpha2: 'GY', areaKm2: 214969, popM: 0.8, army: 3400 },
  '740': { pl: 'Surinam', alpha2: 'SR', areaKm2: 163820, popM: 0.6, army: 2000 },
  '218': { pl: 'Ekwador', alpha2: 'EC', areaKm2: 283561, popM: 18.2, army: 41000 },
  '630': { pl: 'Portoryko', alpha2: 'PR', areaKm2: 9104, popM: 3.2, army: 5000 },
  '388': { pl: 'Jamajka', alpha2: 'JM', areaKm2: 10991, popM: 2.8, army: 4000 },
  '192': { pl: 'Kuba', alpha2: 'CU', areaKm2: 109884, popM: 11.2, army: 49000 },
  '716': { pl: 'Zimbabwe', alpha2: 'ZW', areaKm2: 390757, popM: 16.7, army: 29000 },
  '072': { pl: 'Botswana', alpha2: 'BW', areaKm2: 581730, popM: 2.7, army: 9000 },
  '516': { pl: 'Namibia', alpha2: 'NA', areaKm2: 825615, popM: 2.6, army: 9500 },
  '686': { pl: 'Senegal', alpha2: 'SN', areaKm2: 196722, popM: 17.8, army: 17000 },
  '466': { pl: 'Mali', alpha2: 'ML', areaKm2: 1240192, popM: 23.3, army: 22000 },
  '478': { pl: 'Mauretania', alpha2: 'MR', areaKm2: 1030700, popM: 4.9, army: 15800 },
  '204': { pl: 'Benin', alpha2: 'BJ', areaKm2: 114763, popM: 13.7, army: 7300 },
  '562': { pl: 'Niger', alpha2: 'NE', areaKm2: 1267000, popM: 27.2, army: 10000 },
  '120': { pl: 'Kamerun', alpha2: 'CM', areaKm2: 475442, popM: 28.6, army: 25000 },
  '768': { pl: 'Togo', alpha2: 'TG', areaKm2: 56785, popM: 9.1, army: 8500 },
  '288': { pl: 'Ghana', alpha2: 'GH', areaKm2: 238533, popM: 34.1, army: 15500 },
  '384': { pl: 'Wybrzeże Kości Słoniowej', alpha2: 'CI', areaKm2: 322463, popM: 28.9, army: 27000 },
  '324': { pl: 'Gwinea', alpha2: 'GN', areaKm2: 245857, popM: 14.2, army: 9700 },
  '624': { pl: 'Gwinea Bissau', alpha2: 'GW', areaKm2: 36125, popM: 2.2, army: 4400 },
  '430': { pl: 'Liberia', alpha2: 'LR', areaKm2: 111369, popM: 5.4, army: 2100 },
  '694': { pl: 'Sierra Leone', alpha2: 'SL', areaKm2: 71740, popM: 8.8, army: 8500 },
  '854': { pl: 'Burkina Faso', alpha2: 'BF', areaKm2: 274222, popM: 23.3, army: 12000 },
  '140': { pl: 'Republika Środkowoafrykańska', alpha2: 'CF', areaKm2: 622984, popM: 5.7, army: 9000 },
  '178': { pl: 'Kongo', alpha2: 'CG', areaKm2: 342000, popM: 6.1, army: 10000 },
  '266': { pl: 'Gabon', alpha2: 'GA', areaKm2: 267668, popM: 2.4, army: 4700 },
  '226': { pl: 'Gwinea Równikowa', alpha2: 'GQ', areaKm2: 28051, popM: 1.7, army: 1450 },
  '894': { pl: 'Zambia', alpha2: 'ZM', areaKm2: 752618, popM: 20.6, army: 15100 },
  '454': { pl: 'Malawi', alpha2: 'MW', areaKm2: 118484, popM: 20.9, army: 10700 },
  '508': { pl: 'Mozambik', alpha2: 'MZ', areaKm2: 801590, popM: 33.9, army: 11200 },
  '748': { pl: 'Eswatini', alpha2: 'SZ', areaKm2: 17364, popM: 1.2, army: 3000 },
  '024': { pl: 'Angola', alpha2: 'AO', areaKm2: 1246700, popM: 36.7, army: 107000 },
  '108': { pl: 'Burundi', alpha2: 'BI', areaKm2: 27834, popM: 13.2, army: 30000 },
  '422': { pl: 'Liban', alpha2: 'LB', areaKm2: 10452, popM: 5.4, army: 60000 },
  '450': { pl: 'Madagaskar', alpha2: 'MG', areaKm2: 587041, popM: 30.3, army: 13500 },
  '275': { pl: 'Palestyna', alpha2: 'PS', areaKm2: 6020, popM: 5.4, army: 12000 },
  '270': { pl: 'Gambia', alpha2: 'GM', areaKm2: 11295, popM: 2.8, army: 4100 },
  '788': { pl: 'Tunezja', alpha2: 'TN', areaKm2: 163610, popM: 12.5, army: 35800 },
  '400': { pl: 'Jordania', alpha2: 'JO', areaKm2: 89342, popM: 11.3, army: 100500 },
  '784': { pl: 'ZEA', alpha2: 'AE', areaKm2: 83600, popM: 9.5, army: 63000 },
  '634': { pl: 'Katar', alpha2: 'QA', areaKm2: 11586, popM: 2.7, army: 16500 },
  '414': { pl: 'Kuwejt', alpha2: 'KW', areaKm2: 17818, popM: 4.3, army: 17500 },
  '512': { pl: 'Oman', alpha2: 'OM', areaKm2: 309500, popM: 4.6, army: 42600 },
  '548': { pl: 'Vanuatu', alpha2: 'VU', areaKm2: 12189, popM: 0.3, army: 600 },
  '116': { pl: 'Kambodża', alpha2: 'KH', areaKm2: 181035, popM: 16.9, army: 124000 },
  '418': { pl: 'Laos', alpha2: 'LA', areaKm2: 236800, popM: 7.6, army: 29100 },
  '496': { pl: 'Mongolia', alpha2: 'MN', areaKm2: 1564116, popM: 3.4, army: 9700 },
  '050': { pl: 'Bangladesz', alpha2: 'BD', areaKm2: 147570, popM: 173.0, army: 163000 },
  '064': { pl: 'Bhutan', alpha2: 'BT', areaKm2: 38394, popM: 0.8, army: 8000 },
  '524': { pl: 'Nepal', alpha2: 'NP', areaKm2: 147181, popM: 30.9, army: 96600 },
  '762': { pl: 'Tadżykistan', alpha2: 'TJ', areaKm2: 143100, popM: 10.1, army: 9500 },
  '417': { pl: 'Kirgistan', alpha2: 'KG', areaKm2: 199951, popM: 6.7, army: 12300 },
  '795': { pl: 'Turkmenistan', alpha2: 'TM', areaKm2: 488100, popM: 6.5, army: 36500 },
  '760': { pl: 'Syria', alpha2: 'SY', areaKm2: 185180, popM: 23.2, army: 130000 },
  '051': { pl: 'Armenia', alpha2: 'AM', areaKm2: 29743, popM: 2.8, army: 42900 },
  '498': { pl: 'Mołdawia', alpha2: 'MD', areaKm2: 33846, popM: 2.5, army: 5150 },
  '008': { pl: 'Albania', alpha2: 'AL', areaKm2: 28748, popM: 2.8, army: 8000 },
  '442': { pl: 'Luksemburg', alpha2: 'LU', areaKm2: 2586, popM: 0.66, army: 950 },
  '540': { pl: 'Nowa Kaledonia', alpha2: 'NC', areaKm2: 18575, popM: 0.29, army: 1200 },
  '090': { pl: 'Wyspy Salomona', alpha2: 'SB', areaKm2: 28896, popM: 0.74, army: 1000 },
  '144': { pl: 'Sri Lanka', alpha2: 'LK', areaKm2: 65610, popM: 21.9, army: 255000 },
  '158': { pl: 'Tajwan', alpha2: 'TW', areaKm2: 36197, popM: 23.9, army: 169000 },
  '352': { pl: 'Islandia', alpha2: 'IS', areaKm2: 103000, popM: 0.39, army: 1200 },
  '031': { pl: 'Azerbejdżan', alpha2: 'AZ', areaKm2: 86600, popM: 10.4, army: 126400 },
  '268': { pl: 'Gruzja', alpha2: 'GE', areaKm2: 69700, popM: 3.7, army: 20650 },
  '096': { pl: 'Brunei', alpha2: 'BN', areaKm2: 5765, popM: 0.45, army: 7200 },
  '705': { pl: 'Słowenia', alpha2: 'SI', areaKm2: 20273, popM: 2.1, army: 7250 },
  '232': { pl: 'Erytrea', alpha2: 'ER', areaKm2: 117600, popM: 3.7, army: 201750 },
  '600': { pl: 'Paragwaj', alpha2: 'PY', areaKm2: 406752, popM: 6.9, army: 14000 },
  '887': { pl: 'Jemen', alpha2: 'YE', areaKm2: 527968, popM: 34.4, army: 66700 },
  '196': { pl: 'Cypr', alpha2: 'CY', areaKm2: 9251, popM: 1.26, army: 12000 },
  '262': { pl: 'Dżibuti', alpha2: 'DJ', areaKm2: 23200, popM: 1.14, army: 10450 },
  '800': { pl: 'Uganda', alpha2: 'UG', areaKm2: 241038, popM: 48.6, army: 45000 },
  '646': { pl: 'Rwanda', alpha2: 'RW', areaKm2: 26338, popM: 14.1, army: 33000 },
  '070': { pl: 'Bośnia i Hercegowina', alpha2: 'BA', areaKm2: 51197, popM: 3.2, army: 10500 },
  '807': { pl: 'Macedonia Północna', alpha2: 'MK', areaKm2: 25713, popM: 1.8, army: 8000 },
  '499': { pl: 'Czarnogóra', alpha2: 'ME', areaKm2: 13812, popM: 0.62, army: 2350 },
  '780': { pl: 'Trynidad i Tobago', alpha2: 'TT', areaKm2: 5131, popM: 1.53, army: 4000 },
  '728': { pl: 'Sudan Południowy', alpha2: 'SS', areaKm2: 644329, popM: 11.1, army: 185000 },
  'N. Cyprus': { pl: 'Cypr Północny', alpha2: 'CY', areaKm2: 3355, popM: 0.38, army: 5000 },
  'Somaliland': { pl: 'Somaliland', alpha2: 'SO', areaKm2: 176120, popM: 5.7, army: 12000 },
  'Kosovo': { pl: 'Kosowo', alpha2: 'XK', areaKm2: 10887, popM: 1.8, army: 4000 },
  '744': { pl: 'Svalbard (Arktyka)', alpha2: 'SJ', areaKm2: 61022, popM: 0.003, army: 1200 },
  '234': { pl: 'Wyspy Owcze', alpha2: 'FO', areaKm2: 1393, popM: 0.054, army: 800 },
  '702': { pl: 'Singapur', alpha2: 'SG', areaKm2: 734, popM: 5.9, army: 51000 },
  '010': { pl: 'Antarktyda', alpha2: 'AQ', areaKm2: 14200000, popM: 0.005, army: 3000 },
  '010_arctowski': { pl: 'Sektor Arctowski (Antarktyda)', alpha2: 'AQ', areaKm2: 2400000, popM: 0.002, army: 2200 },
  '010_amundsen': { pl: 'Sektor Amundsen-Scott (Biegun)', alpha2: 'AQ', areaKm2: 3900000, popM: 0.002, army: 2600 },
  '010_vostok': { pl: 'Sektor Wostok (Antarktyda)', alpha2: 'AQ', areaKm2: 4100000, popM: 0.002, army: 2400 },
  '010_concordia': { pl: 'Sektor Concordia (Antarktyda)', alpha2: 'AQ', areaKm2: 3800000, popM: 0.002, army: 2200 },
};

const PALETTE = [
  '#0D9488', '#2563EB', '#D97706', '#9333EA', '#E11D48', '#16A34A',
  '#0284C7', '#EA580C', '#7C3AED', '#059669', '#DB2777', '#CA8A04',
  '#4F46E5', '#15803D', '#BE123C', '#0891B2',
];

const CORE_MAP = new Map<string, CountryMeta>(CORE_COUNTRIES.map((item) => [item.id, item]));

function hashStr(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function getCountryMeta(rawId: string, rawEnglishName: string): CountryMeta {
  const core = CORE_MAP.get(rawId);
  if (core) return core;

  const extra = EXTRA_METADATA[rawId];
  const h = hashStr(rawId + rawEnglishName);
  const color = rawId.startsWith('010') ? '#38BDF8' : PALETTE[h % PALETTE.length];

  return {
    id: rawId,
    alpha2: extra?.alpha2 ?? rawEnglishName.slice(0, 2).toUpperCase(),
    name: {
      pl: extra?.pl ?? rawEnglishName,
      en: rawEnglishName,
      szl: extra?.pl ?? rawEnglishName,
      csb: extra?.pl ?? rawEnglishName,
    },
    areaKm2: extra?.areaKm2 ?? 120000,
    populationM: extra?.popM ?? 8.0,
    color,
    flag: getAuthenticFlag(rawId),
    startingArmy2026: extra?.army ?? 15000,
    gdpFactor: rawId.startsWith('010') ? 0.65 : 0.9,
  };
}

// Strategic sea lanes linking key coastal/island countries so UK, Japan, USA, Australia, Indonesia, etc. are fully playable
export const SEA_LANE_PAIRS: Array<[string, string]> = [
  ['826', '250'], // UK - France
  ['826', '372'], // UK - Ireland
  ['826', '578'], // UK - Norway
  ['826', '840'], // UK - USA
  ['616', '752'], // Poland - Sweden
  ['276', '752'], // Germany - Sweden
  ['276', '208'], // Germany - Denmark
  ['752', '246'], // Sweden - Finland
  ['246', '233'], // Finland - Estonia
  ['380', '300'], // Italy - Greece
  ['380', '788'], // Italy - Tunisia
  ['724', '504'], // Spain - Morocco
  ['392', '410'], // Japan - South Korea
  ['392', '156'], // Japan - China
  ['392', '840'], // Japan - USA
  ['392', '608'], // Japan - Philippines
  ['156', '158'], // China - Taiwan
  ['158', '608'], // Taiwan - Philippines
  ['608', '360'], // Philippines - Indonesia
  ['360', '458'], // Indonesia - Malaysia
  ['360', '036'], // Indonesia - Australia
  ['036', '554'], // Australia - New Zealand
  ['840', '192'], // USA - Cuba
  ['840', '076'], // USA - Brazil
  ['620', '076'], // Portugal - Brazil
  ['356', '144'], // India - Sri Lanka
  ['356', '682'], // India - Saudi Arabia
  ['818', '682'], // Egypt - Saudi Arabia
  ['352', '578'], // Iceland - Norway
  ['352', '304'], // Iceland - Greenland
  ['304', '124'], // Greenland - Canada
  ['450', '508'], // Madagascar - Mozambique
  ['744', '578'], // Svalbard - Norway
  ['744', '304'], // Svalbard - Greenland
  ['744', '643'], // Svalbard - Russia
  ['234', '826'], // Faroe Islands - UK
  ['234', '352'], // Faroe Islands - Iceland
  ['234', '578'], // Faroe Islands - Norway
  ['702', '458'], // Singapore - Malaysia
  ['702', '360'], // Singapore - Indonesia
  ['196', '300'], // Cyprus - Greece
  ['196', '792'], // Cyprus - Turkey
  ['010_arctowski', '032'], // Antarctica Arctowski - Argentina
  ['010_arctowski', '152'], // Antarctica Arctowski - Chile
  ['010_arctowski', '010_amundsen'],
  ['010_amundsen', '710'], // Antarctica Amundsen - South Africa
  ['010_amundsen', '010_vostok'],
  ['010_vostok', '036'], // Antarctica Vostok - Australia
  ['010_vostok', '010_concordia'],
  ['010_concordia', '554'], // Antarctica Concordia - New Zealand
  ['010_concordia', '010_arctowski'],
];
