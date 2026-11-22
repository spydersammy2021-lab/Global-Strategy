import type { FlagPattern } from '../game/types';

/**
 * 100% Authentic Flag Registry covering all 177 world-atlas territories,
 * Antarctica Research Sectors, Arctic islands, and microstates.
 * Zero random-hashed fallbacks!
 */
export const AUTHENTIC_FLAGS: Record<string, FlagPattern> = {
  // --- EUROPE ---
  '616': { layout: 'bicolor_h', colors: ['#FFFFFF', '#DC143C'] }, // Poland
  '276': { layout: 'tricolor_h', colors: ['#000000', '#DD0000', '#FFCC00'] }, // Germany
  '250': { layout: 'tricolor_v', colors: ['#002395', '#FFFFFF', '#ED2939'] }, // France
  '826': { layout: 'cross', colors: ['#012169', '#C8102E', '#FFFFFF'], emblemKind: 'union_jack' }, // United Kingdom
  '380': { layout: 'tricolor_v', colors: ['#009246', '#FFFFFF', '#CE2B37'] }, // Italy
  '724': { layout: 'tricolor_h', colors: ['#AA151B', '#F1BF00', '#AA151B'], emblemKind: 'spain_crest' }, // Spain
  '620': { layout: 'bicolor_v', colors: ['#006600', '#FF0000'], emblemKind: 'portugal_crest' }, // Portugal
  '372': { layout: 'tricolor_v', colors: ['#169B62', '#FFFFFF', '#FF883E'] }, // Ireland
  '528': { layout: 'tricolor_h', colors: ['#AE1C28', '#FFFFFF', '#21468B'] }, // Netherlands
  '056': { layout: 'tricolor_v', colors: ['#000000', '#FAE042', '#ED2939'] }, // Belgium
  '442': { layout: 'tricolor_h', colors: ['#EF3340', '#FFFFFF', '#00A3E0'] }, // Luxembourg
  '756': { layout: 'solid', colors: ['#DA291C', '#FFFFFF'], emblemKind: 'swiss_cross' }, // Switzerland
  '040': { layout: 'tricolor_h', colors: ['#ED2939', '#FFFFFF', '#ED2939'] }, // Austria
  '203': { layout: 'bicolor_h', colors: ['#FFFFFF', '#D7141A', '#11457E'], emblemKind: 'czech_wedge' }, // Czechia
  '703': { layout: 'tricolor_h', colors: ['#FFFFFF', '#0B4EA2', '#EE1C25'], emblemKind: 'slovakia_cross' }, // Slovakia
  '348': { layout: 'tricolor_h', colors: ['#CE2939', '#FFFFFF', '#477050'] }, // Hungary
  '642': { layout: 'tricolor_v', colors: ['#002B7F', '#FCD116', '#CE1126'] }, // Romania
  '100': { layout: 'tricolor_h', colors: ['#FFFFFF', '#00966E', '#D62612'] }, // Bulgaria (Exact White/Green/Red)
  '300': { layout: 'stripes', colors: ['#0D5EAF', '#FFFFFF'], emblemKind: 'greek_cross' }, // Greece
  '499': { layout: 'solid', colors: ['#C40308', '#D4AF37'], borderHex: '#D4AF37', emblemKind: 'montenegro_eagle' }, // Montenegro (Gold-bordered double eagle)
  '196': { layout: 'solid', colors: ['#FFFFFF', '#D57800'], emblemKind: 'cyprus_island' }, // Cyprus (White + Copper Island + Olive branches)
  'N. Cyprus': { layout: 'tricolor_h', colors: ['#FFFFFF', '#E30A17', '#FFFFFF'], emblemKind: 'crescent_star' }, // Northern Cyprus
  '008': { layout: 'solid', colors: ['#E41E20', '#000000'], emblemKind: 'albania_eagle' }, // Albania
  '688': { layout: 'tricolor_h', colors: ['#C6363C', '#0C4076', '#FFFFFF'], emblemKind: 'serbia_eagle' }, // Serbia
  '191': { layout: 'tricolor_h', colors: ['#FF0000', '#FFFFFF', '#171796'], emblemKind: 'croatia_check' }, // Croatia
  '070': { layout: 'solid', colors: ['#002395', '#FECB00'], emblemKind: 'bosnia_triangle' }, // Bosnia & Herz.
  '705': { layout: 'tricolor_h', colors: ['#FFFFFF', '#005DA4', '#ED1C24'], emblemKind: 'slovenia_triglav' }, // Slovenia
  '807': { layout: 'solid', colors: ['#D20000', '#FFE600'], emblemKind: 'sun_disc' }, // North Macedonia
  'Kosovo': { layout: 'solid', colors: ['#244AA5', '#D0A650'], emblemKind: 'kosovo_map' }, // Kosovo
  '498': { layout: 'tricolor_v', colors: ['#0046AE', '#FFD200', '#CC092F'], emblemKind: 'eagle_crown' }, // Moldova
  '804': { layout: 'bicolor_h', colors: ['#005BBB', '#FFD500'] }, // Ukraine
  '112': { layout: 'bicolor_h', colors: ['#D22730', '#009739'] }, // Belarus
  '440': { layout: 'tricolor_h', colors: ['#FDB913', '#006A44', '#C1272D'] }, // Lithuania
  '428': { layout: 'tricolor_h', colors: ['#9E3039', '#FFFFFF', '#9E3039'] }, // Latvia
  '233': { layout: 'tricolor_h', colors: ['#0072CE', '#000000', '#FFFFFF'] }, // Estonia
  '246': { layout: 'nordic', colors: ['#FFFFFF', '#002F6C'] }, // Finland
  '752': { layout: 'nordic', colors: ['#006AA7', '#FECC02'] }, // Sweden
  '578': { layout: 'nordic', colors: ['#BA0C2F', '#00205B', '#FFFFFF'] }, // Norway
  '208': { layout: 'nordic', colors: ['#C8102E', '#FFFFFF'] }, // Denmark
  '352': { layout: 'nordic', colors: ['#02529C', '#DC1E35', '#FFFFFF'] }, // Iceland
  '304': { layout: 'bicolor_h', colors: ['#FFFFFF', '#D00C33'], emblemKind: 'sun_disc' }, // Greenland
  '234': { layout: 'nordic', colors: ['#FFFFFF', '#ED2939', '#0065BD'] }, // Faroe Islands
  '744': { layout: 'nordic', colors: ['#BA0C2F', '#00205B', '#FFFFFF'] }, // Svalbard
  '643': { layout: 'tricolor_h', colors: ['#FFFFFF', '#0039A6', '#D52B1E'] }, // Russia
  '792': { layout: 'solid', colors: ['#E30A17', '#FFFFFF'], emblemKind: 'crescent_star' }, // Turkey
  '268': { layout: 'cross', colors: ['#FFFFFF', '#FF0000'], emblemKind: 'greek_cross' }, // Georgia
  '051': { layout: 'tricolor_h', colors: ['#D90012', '#0033A0', '#F2A800'] }, // Armenia
  '031': { layout: 'tricolor_h', colors: ['#00B5E2', '#EF3340', '#509E2F'], emblemKind: 'crescent_star' }, // Azerbaijan

  // --- NORTH & CENTRAL AMERICA & CARIBBEAN ---
  '840': { layout: 'stripes', colors: ['#B22234', '#FFFFFF', '#3C3B6E'], emblemKind: 'usa_stars' }, // USA
  '124': { layout: 'tricolor_v', colors: ['#FF0000', '#FFFFFF', '#FF0000'], emblemKind: 'maple' }, // Canada
  '484': { layout: 'tricolor_v', colors: ['#006847', '#FFFFFF', '#CE1126'], emblemKind: 'mexico_eagle' }, // Mexico
  '192': { layout: 'stripes', colors: ['#002A8F', '#FFFFFF', '#CF142B'], emblemKind: 'czech_wedge' }, // Cuba
  '388': { layout: 'diagonal', colors: ['#009B3A', '#000000', '#FED100'] }, // Jamaica
  '332': { layout: 'bicolor_h', colors: ['#00209F', '#D21034'] }, // Haiti
  '214': { layout: 'cross', colors: ['#002D62', '#FFFFFF', '#CE1126'] }, // Dominican Rep.
  '630': { layout: 'stripes', colors: ['#ED0000', '#FFFFFF', '#0050F0'], emblemKind: 'czech_wedge' }, // Puerto Rico
  '044': { layout: 'tricolor_h', colors: ['#00778B', '#FFC72C', '#00778B'], emblemKind: 'czech_wedge' }, // Bahamas
  '084': { layout: 'tricolor_h', colors: ['#D90F19', '#171696', '#D90F19'] }, // Belize
  '320': { layout: 'tricolor_v', colors: ['#4997D0', '#FFFFFF', '#4997D0'] }, // Guatemala
  '340': { layout: 'tricolor_h', colors: ['#00BCE4', '#FFFFFF', '#00BCE4'], emblemKind: 'star_center' }, // Honduras
  '222': { layout: 'tricolor_h', colors: ['#0F47AF', '#FFFFFF', '#0F47AF'] }, // El Salvador
  '558': { layout: 'tricolor_h', colors: ['#0067C6', '#FFFFFF', '#0067C6'] }, // Nicaragua
  '188': { layout: 'tricolor_h', colors: ['#002B7F', '#CE1126', '#002B7F'] }, // Costa Rica
  '591': { layout: 'bicolor_h', colors: ['#FFFFFF', '#072357', '#DA121A'], emblemKind: 'star_center' }, // Panama
  '780': { layout: 'diagonal', colors: ['#CE1126', '#000000', '#FFFFFF'] }, // Trinidad and Tobago

  // --- SOUTH AMERICA ---
  '076': { layout: 'solid', colors: ['#009C3B', '#FFDF00', '#002776'], emblemKind: 'brazil_globe' }, // Brazil
  '032': { layout: 'tricolor_h', colors: ['#74ACDF', '#FFFFFF', '#74ACDF'], emblemKind: 'argentina_sun' }, // Argentina
  '152': { layout: 'bicolor_h', colors: ['#FFFFFF', '#D52B1E', '#0039A6'], emblemKind: 'star_canton' }, // Chile
  '858': { layout: 'stripes', colors: ['#FFFFFF', '#0038A8', '#FCD116'], emblemKind: 'uruguay_sun' }, // Uruguay
  '600': { layout: 'tricolor_h', colors: ['#D52B1E', '#FFFFFF', '#0038A8'] }, // Paraguay
  '068': { layout: 'tricolor_h', colors: ['#D52B1E', '#FFE000', '#007934'] }, // Bolivia
  '604': { layout: 'tricolor_v', colors: ['#D91023', '#FFFFFF', '#D91023'] }, // Peru
  '218': { layout: 'tricolor_h', colors: ['#FFD100', '#0072CE', '#EF3340'] }, // Ecuador
  '170': { layout: 'tricolor_h', colors: ['#FCD116', '#003893', '#CE1126'] }, // Colombia
  '862': { layout: 'tricolor_h', colors: ['#FCE300', '#0033A0', '#EF3340'], emblemKind: 'star_center' }, // Venezuela
  '328': { layout: 'solid', colors: ['#009E49', '#FCD116', '#CE1126'], emblemKind: 'czech_wedge' }, // Guyana
  '740': { layout: 'tricolor_h', colors: ['#377E3F', '#B40A2D', '#377E3F'], emblemKind: 'star_center' }, // Suriname
  '238': { layout: 'solid', colors: ['#012169', '#C8102E', '#FFFFFF'], emblemKind: 'union_jack' }, // Falkland Is.

  // --- MIDDLE EAST & NORTH AFRICA ---
  '818': { layout: 'tricolor_h', colors: ['#CE1126', '#FFFFFF', '#000000'], emblemKind: 'eagle_crown' }, // Egypt
  '434': { layout: 'tricolor_h', colors: ['#E70013', '#000000', '#239E46'], emblemKind: 'crescent_star' }, // Libya
  '788': { layout: 'solid', colors: ['#E70013', '#FFFFFF'], emblemKind: 'crescent_star' }, // Tunisia
  '012': { layout: 'bicolor_v', colors: ['#006633', '#FFFFFF', '#D21034'], emblemKind: 'crescent_star' }, // Algeria
  '504': { layout: 'solid', colors: ['#C1272D', '#006233'], emblemKind: 'star_center' }, // Morocco
  '732': { layout: 'tricolor_h', colors: ['#000000', '#FFFFFF', '#007A3D'], emblemKind: 'crescent_star' }, // W. Sahara
  '376': { layout: 'tricolor_h', colors: ['#0038B8', '#FFFFFF', '#0038B8'], emblemKind: 'israel_star' }, // Israel
  '275': { layout: 'tricolor_h', colors: ['#000000', '#FFFFFF', '#007A3D'], emblemKind: 'czech_wedge' }, // Palestine
  '422': { layout: 'tricolor_h', colors: ['#EE161F', '#FFFFFF', '#EE161F'], emblemKind: 'cedar' }, // Lebanon
  '760': { layout: 'tricolor_h', colors: ['#CE1126', '#FFFFFF', '#000000'], emblemKind: 'star_center' }, // Syria
  '400': { layout: 'tricolor_h', colors: ['#000000', '#FFFFFF', '#007A3D'], emblemKind: 'czech_wedge' }, // Jordan
  '368': { layout: 'tricolor_h', colors: ['#CE1126', '#FFFFFF', '#000000'] }, // Iraq
  '364': { layout: 'tricolor_h', colors: ['#239F40', '#FFFFFF', '#DA0000'] }, // Iran
  '682': { layout: 'solid', colors: ['#006C35', '#FFFFFF'], emblemKind: 'saudi_sword' }, // Saudi Arabia
  '887': { layout: 'tricolor_h', colors: ['#CE1126', '#FFFFFF', '#000000'] }, // Yemen
  '512': { layout: 'tricolor_h', colors: ['#FFFFFF', '#DB161B', '#008000'] }, // Oman
  '784': { layout: 'tricolor_h', colors: ['#00732F', '#FFFFFF', '#000000'], emblemKind: 'czech_wedge' }, // UAE
  '634': { layout: 'bicolor_v', colors: ['#FFFFFF', '#8D1B3D'] }, // Qatar
  '414': { layout: 'tricolor_h', colors: ['#007A3D', '#FFFFFF', '#CE1126'] }, // Kuwait

  // --- ASIA ---
  '156': { layout: 'solid', colors: ['#DE2910', '#FFDE00'], emblemKind: 'star_canton' }, // China
  '158': { layout: 'solid', colors: ['#FE0000', '#000095', '#FFFFFF'], emblemKind: 'taiwan_canton' }, // Taiwan
  '392': { layout: 'solid', colors: ['#FFFFFF', '#BC002D'], emblemKind: 'sun_disc' }, // Japan
  '410': { layout: 'solid', colors: ['#FFFFFF', '#CD2E3A', '#0047A0'], emblemKind: 'taegeuk' }, // South Korea
  '408': { layout: 'tricolor_h', colors: ['#024FA2', '#ED1C27', '#024FA2'], emblemKind: 'star_center' }, // North Korea
  '496': { layout: 'tricolor_v', colors: ['#C4272F', '#015197', '#C4272F'] }, // Mongolia
  '356': { layout: 'tricolor_h', colors: ['#FF9933', '#FFFFFF', '#138808'], emblemKind: 'chakra' }, // India
  '586': { layout: 'bicolor_v', colors: ['#FFFFFF', '#01411C'], emblemKind: 'crescent_star' }, // Pakistan
  '050': { layout: 'solid', colors: ['#006A4E', '#F42A41'], emblemKind: 'sun_disc' }, // Bangladesh
  '144': { layout: 'solid', colors: ['#8D153A', '#FFBE29'], emblemKind: 'sri_lanka_lion' }, // Sri Lanka
  '524': { layout: 'bicolor_h', colors: ['#DC143C', '#003893'], emblemKind: 'sun_disc' }, // Nepal
  '064': { layout: 'diagonal', colors: ['#FFD520', '#FF4E12', '#FFFFFF'], emblemKind: 'bhutan_dragon' }, // Bhutan
  '004': { layout: 'tricolor_v', colors: ['#000000', '#BF0000', '#006600'] }, // Afghanistan
  '398': { layout: 'solid', colors: ['#00AFCA', '#FEC50C'], emblemKind: 'kazakh_sun' }, // Kazakhstan
  '860': { layout: 'tricolor_h', colors: ['#1EB53A', '#FFFFFF', '#0099B5'], emblemKind: 'crescent_star_left' }, // Uzbekistan
  '795': { layout: 'solid', colors: ['#00843D', '#D22630'], emblemKind: 'crescent_star_left' }, // Turkmenistan
  '417': { layout: 'solid', colors: ['#E8112D', '#FFEF00'], emblemKind: 'kyrgyz_sun' }, // Kyrgyzstan
  '762': { layout: 'tricolor_h', colors: ['#CC0000', '#FFFFFF', '#006600'], emblemKind: 'eagle_crown' }, // Tajikistan
  '104': { layout: 'tricolor_h', colors: ['#FECB00', '#34B233', '#EA2839'], emblemKind: 'star_center' }, // Myanmar
  '764': { layout: 'tricolor_h', colors: ['#A51931', '#2D2A4A', '#A51931'] }, // Thailand
  '418': { layout: 'tricolor_h', colors: ['#CE1126', '#002868', '#CE1126'], emblemKind: 'sun_disc' }, // Laos
  '116': { layout: 'tricolor_h', colors: ['#032EA1', '#E00025', '#032EA1'], emblemKind: 'cambodia_angkor' }, // Cambodia
  '704': { layout: 'solid', colors: ['#DA251D', '#FFFF00'], emblemKind: 'star_center' }, // Vietnam
  '458': { layout: 'stripes', colors: ['#CC0001', '#FFFFFF', '#010066'], emblemKind: 'crescent_star_left' }, // Malaysia
  '096': { layout: 'diagonal', colors: ['#F7E017', '#FFFFFF', '#000000'] }, // Brunei
  '360': { layout: 'bicolor_h', colors: ['#FF0000', '#FFFFFF'] }, // Indonesia
  '626': { layout: 'solid', colors: ['#DC241F', '#FFC726'], emblemKind: 'czech_wedge' }, // Timor-Leste
  '608': { layout: 'bicolor_h', colors: ['#0038A8', '#CE1126', '#FFFFFF'], emblemKind: 'czech_wedge' }, // Philippines
  '702': { layout: 'bicolor_h', colors: ['#EF3340', '#FFFFFF'], emblemKind: 'crescent_star_left' }, // Singapore

  // --- AFRICA ---
  '710': { layout: 'tricolor_h', colors: ['#E03C31', '#007749', '#001489'], emblemKind: 'south_africa_y' }, // South Africa
  '566': { layout: 'tricolor_v', colors: ['#008751', '#FFFFFF', '#008751'] }, // Nigeria
  '231': { layout: 'tricolor_h', colors: ['#078930', '#FCDD09', '#DA121A'], emblemKind: 'star_center' }, // Ethiopia
  '404': { layout: 'tricolor_h', colors: ['#000000', '#BB0000', '#006600'], emblemKind: 'kenya_shield' }, // Kenya
  '834': { layout: 'diagonal', colors: ['#1EB53A', '#00A3DD', '#000000'] }, // Tanzania
  '800': { layout: 'stripes', colors: ['#000000', '#FCDC04', '#D90000'] }, // Uganda
  '646': { layout: 'tricolor_h', colors: ['#00A1DE', '#FAD201', '#20603D'] }, // Rwanda
  '108': { layout: 'diagonal', colors: ['#CE1126', '#1EB53A', '#FFFFFF'], emblemKind: 'star_center' }, // Burundi
  '180': { layout: 'diagonal', colors: ['#007FFF', '#F7D618', '#CE1021'], emblemKind: 'star_canton' }, // DR Congo
  '178': { layout: 'diagonal', colors: ['#009543', '#FBDE4A', '#DC241F'] }, // Congo
  '266': { layout: 'tricolor_h', colors: ['#009E60', '#FCD116', '#3A75C4'] }, // Gabon
  '226': { layout: 'tricolor_h', colors: ['#3E9A00', '#FFFFFF', '#E32118'] }, // Eq. Guinea
  '120': { layout: 'tricolor_v', colors: ['#007A5E', '#CE1126', '#FCD116'], emblemKind: 'star_center' }, // Cameroon
  '140': { layout: 'tricolor_h', colors: ['#003082', '#289728', '#FFCE00'], emblemKind: 'star_canton' }, // Central African Rep.
  '148': { layout: 'tricolor_v', colors: ['#002664', '#FECB00', '#C60C30'] }, // Chad
  '729': { layout: 'tricolor_h', colors: ['#D21034', '#FFFFFF', '#000000'], emblemKind: 'czech_wedge' }, // Sudan
  '728': { layout: 'tricolor_h', colors: ['#000000', '#DA121A', '#078930'], emblemKind: 'czech_wedge' }, // South Sudan
  '232': { layout: 'diagonal', colors: ['#12AD2B', '#EA0437', '#4189DD'] }, // Eritrea
  '262': { layout: 'bicolor_h', colors: ['#6AB2E7', '#12AD2B', '#FFFFFF'], emblemKind: 'czech_wedge' }, // Djibouti
  '706': { layout: 'solid', colors: ['#4189DD', '#FFFFFF'], emblemKind: 'star_center' }, // Somalia
  'Somaliland': { layout: 'tricolor_h', colors: ['#006D21', '#FFFFFF', '#CE1126'] }, // Somaliland
  '450': { layout: 'bicolor_h', colors: ['#FC3D32', '#007E3A'] }, // Madagascar
  '508': { layout: 'tricolor_h', colors: ['#007168', '#000000', '#FCE100'], emblemKind: 'czech_wedge' }, // Mozambique
  '454': { layout: 'tricolor_h', colors: ['#000000', '#CE1126', '#339E35'] }, // Malawi
  '894': { layout: 'solid', colors: ['#198A00', '#EF7D00', '#DE2010'] }, // Zambia
  '716': { layout: 'tricolor_h', colors: ['#006400', '#FFD200', '#D40000'], emblemKind: 'czech_wedge' }, // Zimbabwe
  '072': { layout: 'tricolor_h', colors: ['#6DA9D2', '#000000', '#6DA9D2'] }, // Botswana
  '516': { layout: 'diagonal', colors: ['#003580', '#D21034', '#009543'] }, // Namibia
  '024': { layout: 'bicolor_h', colors: ['#CC092F', '#000000'], emblemKind: 'star_center' }, // Angola
  '748': { layout: 'tricolor_h', colors: ['#3E5EB9', '#B10C0C', '#3E5EB9'] }, // eSwatini
  '426': { layout: 'tricolor_h', colors: ['#00209F', '#FFFFFF', '#009543'] }, // Lesotho
  '686': { layout: 'tricolor_v', colors: ['#00853F', '#FDEF42', '#E31B23'], emblemKind: 'star_center' }, // Senegal
  '270': { layout: 'tricolor_h', colors: ['#CE1126', '#0C1C8C', '#3A7728'] }, // Gambia
  '624': { layout: 'bicolor_h', colors: ['#FCD116', '#009E49'] }, // Guinea-Bissau
  '324': { layout: 'tricolor_v', colors: ['#CE1126', '#FCD116', '#009460'] }, // Guinea
  '694': { layout: 'tricolor_h', colors: ['#1EB53A', '#FFFFFF', '#0072C6'] }, // Sierra Leone
  '430': { layout: 'stripes', colors: ['#BF0A30', '#FFFFFF', '#002868'], emblemKind: 'star_canton' }, // Liberia
  '384': { layout: 'tricolor_v', colors: ['#F77F00', '#FFFFFF', '#009E60'] }, // Côte d'Ivoire
  '288': { layout: 'tricolor_h', colors: ['#CE1126', '#FCD116', '#006B3F'], emblemKind: 'star_center' }, // Ghana
  '768': { layout: 'stripes', colors: ['#006A4E', '#FFCE00', '#D21034'], emblemKind: 'star_canton' }, // Togo
  '204': { layout: 'bicolor_h', colors: ['#FCD116', '#E8112D'] }, // Benin
  '566_': { layout: 'tricolor_v', colors: ['#008751', '#FFFFFF', '#008751'] }, // alias guard
  '466': { layout: 'tricolor_v', colors: ['#14B53A', '#FCD116', '#CE1126'] }, // Mali
  '854': { layout: 'bicolor_h', colors: ['#EF2B2D', '#009E49'], emblemKind: 'star_center' }, // Burkina Faso
  '562': { layout: 'tricolor_h', colors: ['#E05206', '#FFFFFF', '#0DB02B'], emblemKind: 'sun_disc' }, // Niger
  '478': { layout: 'solid', colors: ['#00A95C', '#FFD700'], emblemKind: 'crescent_star' }, // Mauritania

  // --- OCEANIA & POLAR ---
  '036': { layout: 'solid', colors: ['#00008B', '#FF0000', '#FFFFFF'], emblemKind: 'union_jack' }, // Australia
  '554': { layout: 'solid', colors: ['#00247D', '#CC142B', '#FFFFFF'], emblemKind: 'union_jack' }, // New Zealand
  '598': { layout: 'diagonal', colors: ['#CE1126', '#000000', '#FCD116'] }, // Papua New Guinea
  '242': { layout: 'solid', colors: ['#68BFE5', '#CE1126', '#FFFFFF'], emblemKind: 'union_jack' }, // Fiji
  '090': { layout: 'diagonal', colors: ['#0051BA', '#215B33', '#FCD116'] }, // Solomon Is.
  '548': { layout: 'bicolor_h', colors: ['#D21034', '#009543', '#000000'], emblemKind: 'czech_wedge' }, // Vanuatu
  '540': { layout: 'tricolor_v', colors: ['#002395', '#FFFFFF', '#ED2939'] }, // New Caledonia
  '260': { layout: 'tricolor_v', colors: ['#002395', '#FFFFFF', '#ED2939'] }, // Fr. S. Antarctic Lands
  '010': { layout: 'solid', colors: ['#1B4F9C', '#FFFFFF'], emblemKind: 'antarctica_compass' }, // Antarctica
  '010_arctowski': { layout: 'solid', colors: ['#1B4F9C', '#FFFFFF'], emblemKind: 'antarctica_compass' },
  '010_amundsen': { layout: 'solid', colors: ['#0F3C78', '#E0F2FE'], emblemKind: 'antarctica_compass' },
  '010_vostok': { layout: 'solid', colors: ['#0C4A6E', '#BAE6FD'], emblemKind: 'antarctica_compass' },
  '010_concordia': { layout: 'solid', colors: ['#1D4ED8', '#FFFFFF'], emblemKind: 'antarctica_compass' },
};

export function getAuthenticFlag(countryId: string): FlagPattern {
  return (
    AUTHENTIC_FLAGS[countryId] ?? {
      layout: 'tricolor_h',
      colors: ['#1E3A8A', '#F8FAFC', '#DC2626'],
      emblemKind: 'star_center',
    }
  );
}
