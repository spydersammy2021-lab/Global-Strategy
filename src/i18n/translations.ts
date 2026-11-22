import type {
  AiAggressiveness,
  BuildingType,
  CommanderRankId,
  CommodityId,
  DifficultyId,
  IdeologyId,
  Language,
  RankId,
  ScenarioId,
  SeasonId,
  UiMode,
  UnitType,
  WeatherKind,
} from '../game/types';

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English (EN)',
  pl: 'Polski (PL)',
  szl: 'Ślōnsko godka (SZL)',
  csb: 'Kaszëbsczi (CSB)',
};

export const MONTHS: Record<Language, string[]> = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  pl: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'],
  szl: ['Styczyń', 'Luty', 'Marzec', 'Kwieciyń', 'Moj', 'Czyrwiec', 'Lipiec', 'Siyrpiyń', 'Wrzesiyń', 'Paździyrnik', 'Listopad', 'Grudziyń'],
  csb: ['Stëcznik', 'Gromicznik', 'Strëmiannik', 'Łżëkwiôt', 'Môj', 'Czerwińc', 'Lëpińc', 'Zélnik', 'Séwnik', 'Rujan', 'Lëstopadnik', 'Gòdnik'],
};

export const RANK_NAMES: Record<Language, Record<RankId, string>> = {
  en: { rekrut: 'Recruit', kapitan: 'Captain', general: 'General', marszalek: 'Marshal Blocks™' },
  pl: { rekrut: 'Rekrut', kapitan: 'Kapitan', general: 'Generał', marszalek: 'Marszałek Blocks™' },
  szl: { rekrut: 'Rekrut', kapitan: 'Kapitan', general: 'Gyneroł', marszalek: 'Marszołek Blocks™' },
  csb: { rekrut: 'Rekrut', kapitan: 'Kapitón', general: 'Generôł', marszalek: 'Marszôłk Blocks™' },
};

export const COMMANDER_RANK_NAMES: Record<Language, Record<CommanderRankId, string>> = {
  en: {
    cadet: 'Cadet',
    tactician: 'Tactician',
    general: 'General',
    field_marshal: 'Field Marshal',
    world_emperor: 'World Emperor',
    galactic_sovereign: 'Galactic Sovereign',
  },
  pl: {
    cadet: 'Kadet',
    tactician: 'Taktyk',
    general: 'Generał',
    field_marshal: 'Marszałek Polny',
    world_emperor: 'Cesarz Świata',
    galactic_sovereign: 'Suweren Galaktyki',
  },
  szl: {
    cadet: 'Kadet',
    tactician: 'Taktyk',
    general: 'Gyneroł',
    field_marshal: 'Marszołek Polny',
    world_emperor: 'Cysorz Świata',
    galactic_sovereign: 'Galaktyczny Włodca',
  },
  csb: {
    cadet: 'Kadet',
    tactician: 'Taktik',
    general: 'Generôł',
    field_marshal: 'Marszôłk Pòlny',
    world_emperor: 'Cesorz Swiata',
    galactic_sovereign: 'Galakticzny Włodca',
  },
};

export const AI_AGGRESSIVENESS_TEXT: Record<Language, Record<AiAggressiveness, { label: string; desc: string }>> = {
  en: {
    friendly: { label: 'Friendly AI', desc: 'Peace-oriented diplomacy & rare wars' },
    normal: { label: 'Normal AI', desc: 'Balanced opportunistic expansion' },
    aggressive: { label: 'Aggressive AI', desc: 'Frequent border wars & raids' },
    hyper: { label: 'Hyper Chaos AI', desc: 'Relentless global conflicts & sabotage' },
  },
  pl: {
    friendly: { label: 'Przyjazne AI', desc: 'Dyplomacja pokojowa i rzadkie wojny' },
    normal: { label: 'Normalne AI', desc: 'Zbalansowana ekspansja państw' },
    aggressive: { label: 'Agresywne AI', desc: 'Częste wojny graniczne i rajdy' },
    hyper: { label: 'Hiper Chaos AI', desc: 'Nieustanne globalne konflikty i sabotaż' },
  },
  szl: {
    friendly: { label: 'Kamracke AI', desc: 'Pokojowo dyplōmacyjo' },
    normal: { label: 'Normalne AI', desc: 'Rōwno ekspansyjo' },
    aggressive: { label: 'Agresywne AI', desc: 'Cynste wojny graniczne' },
    hyper: { label: 'Hiper Chaos AI', desc: 'Wojny na całym świecie' },
  },
  csb: {
    friendly: { label: 'Przëjazné AI', desc: 'Pòkòjowô diplòmacjô' },
    normal: { label: 'Nòrmalné AI', desc: 'Zrównónô ekspansjô' },
    aggressive: { label: 'Agresywné AI', desc: 'Czãsté wòjnë' },
    hyper: { label: 'Hiper Chaos AI', desc: 'Globalné kònfliktë' },
  },
};

export const UI_MODE_TEXT: Record<Language, Record<UiMode, string>> = {
  en: {
    very_easy: '🟢 VERY EASY',
    easy: '🔵 EASY',
    hard: '🟠 HARD',
    extended: '🟣 EXTENDED',
    ultra_realistic: '☠️ ULTRA REALISTIC',
  },
  pl: {
    very_easy: '🟢 B. ŁATWY UI',
    easy: '🔵 ŁATWY UI',
    hard: '🟠 TRUDNY UI',
    extended: '🟣 ROZSZERZONY',
    ultra_realistic: '☠️ ULTRA REALISTYCZNY',
  },
  szl: {
    very_easy: '🟢 FEST ŁATWY',
    easy: '🔵 ŁATWY',
    hard: '🟠 TRUDNY',
    extended: '🟣 ROZSZERZŌNY',
    ultra_realistic: '☠️ ULTRA REALISTYCZNY',
  },
  csb: {
    very_easy: '🟢 BARO LETCZI',
    easy: '🔵 LETCZI',
    hard: '🟠 TRUDNY',
    extended: '🟣 ROZSZERZÓNY',
    ultra_realistic: '☠️ ULTRA REALISTICZNY',
  },
};

export const IDEOLOGY_NAMES: Record<Language, Record<IdeologyId, string>> = {
  en: { democracy: 'Democracy', republic: 'Federal Republic', monarchy: 'Constitutional Monarchy', technocracy: 'Technocracy', autocracy: 'Stratocracy' },
  pl: { democracy: 'Demokracja', republic: 'Republika', monarchy: 'Monarchia', technocracy: 'Technokracja', autocracy: 'Autokracja' },
  szl: { democracy: 'Dymokracyjo', republic: 'Republika', monarchy: 'Mōnarchijo', technocracy: 'Technokracyjo', autocracy: 'Autokracyjo' },
  csb: { democracy: 'Demòkracjô', republic: 'Repùblika', monarchy: 'Mònarchiô', technocracy: 'Technòkracjô', autocracy: 'Aùtokracjô' },
};

export const COMMODITY_NAMES: Record<Language, Record<CommodityId, string>> = {
  en: { energy: 'Energy', steel: 'Alloy Steel', rare_earths: 'Rare Earths', grain: 'Grain Reserve' },
  pl: { energy: 'Energia', steel: 'Stal Stopowa', rare_earths: 'Ziemie Rzadkie', grain: 'Zboże' },
  szl: { energy: 'Energijo', steel: 'Stal', rare_earths: 'Zymie Rzadke', grain: 'Zboże' },
  csb: { energy: 'Energia', steel: 'Stal', rare_earths: 'Rzadczé Zemie', grain: 'Zbożé' },
};

export const DIFFICULTY_TEXT: Record<Language, Record<DifficultyId, { label: string; desc: string }>> = {
  en: {
    very_easy_plus: { label: 'VERY EASY+', desc: '+150% income, +80% combat power & Emergency Comeback Protocol' },
    very_easy: { label: 'VERY EASY', desc: '+100% income, +50% attack, gentle AI' },
    easy: { label: 'EASY', desc: '+45% income, +25% attack' },
    normal: { label: 'NORMAL', desc: 'Balanced grand-strategy simulation' },
    hard: { label: 'HARD', desc: '+25% AI budget, +12% defense' },
    extreme: { label: 'EXTREME', desc: '+50% AI economy, +35% defense, Article 5 & Liberation' },
    extreme_plus: { label: 'EXTREME+', desc: '+85% AI economy, +55% defense, Article 5 & Coalitions' },
    impossible: { label: 'IMPOSSIBLE', desc: '+120% AI economy, +75% defense, 4-nation coalitions' },
    extreme_ultra_impossible: { label: 'EXTREME ULTRA IMPOSSIBLE', desc: '+165% AI economy, +100% defense, Veto Disabled, 5-nation coalitions' },
    extremely_easy_plus: { label: 'VERY EASY+ (Legacy)', desc: '+120% income & Comeback Protocol' },
    extremely_easy: { label: 'VERY EASY (Legacy)', desc: '+100% income & +50% attack' },
    world_conquest: { label: 'WORLD CONQUEST (Legacy)', desc: '+300% income & climate immunity' },
    auto_pilot: { label: 'SMART AUTO-PILOT', desc: 'Smart AI Commander assists economy & attacks' },
  },
  pl: {
    very_easy_plus: { label: 'VERY EASY+', desc: '+150% dochodu, +80% siły ataku i Protokół Ratunkowy' },
    very_easy: { label: 'VERY EASY', desc: '+100% dochodu, +50% ataku, łagodne AI' },
    easy: { label: 'EASY', desc: '+45% dochodu gracza, +25% ataku' },
    normal: { label: 'NORMAL', desc: 'Zrównoważona symulacja AI' },
    hard: { label: 'HARD', desc: '+25% budżetu i +12% obrony AI' },
    extreme: { label: 'EXTREME', desc: '+50% ekonomii AI, +35% obrony, Art. 5 i Wyzwalanie' },
    extreme_plus: { label: 'EXTREME+', desc: '+85% ekonomii AI, +55% obrony, Art. 5 i Koalicje' },
    impossible: { label: 'IMPOSSIBLE', desc: '+120% ekonomii AI, +75% obrony i 4-państwowe koalicje' },
    extreme_ultra_impossible: { label: 'EXTREME ULTRA IMPOSSIBLE', desc: '+165% ekonomii AI, +100% obrony, Bez Weta, 5-państwowe koalicje' },
    extremely_easy_plus: { label: 'VERY EASY+ (Klasyk)', desc: '+120% dochodu i Protokół Ratunkowy' },
    extremely_easy: { label: 'VERY EASY (Klasyk)', desc: '+100% dochodu i +50% ataku' },
    world_conquest: { label: 'PODBÓJ ŚWIATA', desc: '+300% dochodu i odporność na klimat' },
    auto_pilot: { label: 'SMART AUTO-PILOT', desc: 'Inteligentny Dowódca AI wspomaga państwo' },
  },
  szl: {
    very_easy_plus: { label: 'VERY EASY+', desc: '+150% dochodu, +80% ataku i Protokōł Ratōnkowy' },
    very_easy: { label: 'VERY EASY', desc: '+100% dochodu i +50% siyły' },
    easy: { label: 'EASY', desc: '+45% dochodu gracza' },
    normal: { label: 'NORMAL', desc: 'Rōwno symulacyjo AI' },
    hard: { label: 'HARD', desc: '+25% budżetu AI' },
    extreme: { label: 'EXTREME', desc: '+50% ekōnōmije AI, Art. 5' },
    extreme_plus: { label: 'EXTREME+', desc: '+85% ekōnōmije AI, Art. 5 i Koalicyje' },
    impossible: { label: 'IMPOSSIBLE', desc: '+120% ekōnōmije AI i +75% ôbrōny' },
    extreme_ultra_impossible: { label: 'EXTREME ULTRA IMPOSSIBLE', desc: '+165% ekōnōmije AI, Bez Weta' },
    extremely_easy_plus: { label: 'VERY EASY+', desc: '+120% dochodu' },
    extremely_easy: { label: 'VERY EASY', desc: '+100% dochodu' },
    world_conquest: { label: 'PODBŌJ ŚWIATA', desc: '+300% dochodu' },
    auto_pilot: { label: 'SMART AUTO-PILOT', desc: 'Mōndry Dowōdca AI' },
  },
  csb: {
    very_easy_plus: { label: 'VERY EASY+', desc: '+150% dochòdu, +80% ataku i Ratënk' },
    very_easy: { label: 'VERY EASY', desc: '+100% dochòdu i +50% sëłë' },
    easy: { label: 'EASY', desc: '+45% dochòdu gracza' },
    normal: { label: 'NORMAL', desc: 'Zrównónô symulacjô AI' },
    hard: { label: 'HARD', desc: '+25% budżetu AI' },
    extreme: { label: 'EXTREME', desc: '+50% ekònomii AI, Art. 5' },
    extreme_plus: { label: 'EXTREME+', desc: '+85% ekònomii AI, Art. 5 i Kòalicje' },
    impossible: { label: 'IMPOSSIBLE', desc: '+120% ekònomii AI i +75% òbronë' },
    extreme_ultra_impossible: { label: 'EXTREME ULTRA IMPOSSIBLE', desc: '+165% ekònomii AI, Bez Weta' },
    extremely_easy_plus: { label: 'VERY EASY+', desc: '+120% dochòdu' },
    extremely_easy: { label: 'VERY EASY', desc: '+100% dochòdu' },
    world_conquest: { label: 'PÒDBÓJ SWIATA', desc: '+300% dochòdu' },
    auto_pilot: { label: 'SMART AUTO-PILOT', desc: 'Mądry Dowódca AI' },
  },
};

export const SEASON_NAMES: Record<Language, Record<SeasonId, string>> = {
  en: { spring: 'Spring', summer: 'Summer', autumn: 'Autumn', winter: 'Winter' },
  pl: { spring: 'Wiosna', summer: 'Lato', autumn: 'Jesień', winter: 'Zima' },
  szl: { spring: 'Wiosna', summer: 'Lato', autumn: 'Jesiyń', winter: 'Zima' },
  csb: { spring: 'Zymk', summer: 'Lato', autumn: 'Jeséń', winter: 'Zëma' },
};

export const WEATHER_NAMES: Record<Language, Record<WeatherKind, { label: string; effect: string }>> = {
  en: {
    sunny: { label: 'Clear', effect: '+15% Farm yield, optimal maneuvers' },
    rain: { label: 'Heavy Rain', effect: '-15% Tanks, Artillery & Aviation attack' },
    snow: { label: 'Blizzard / Frost', effect: '+25% defense, +1 MP march cost' },
    fog: { label: 'Dense Fog', effect: '+10% province defense' },
  },
  pl: {
    sunny: { label: 'Słonecznie', effect: '+15% plonów z Farm, idealny marsz' },
    rain: { label: 'Ulewny deszcz', effect: '-15% siły czołgów, artylerii i lotnictwa' },
    snow: { label: 'Śnieżyca / Mróz', effect: '+25% obrony, +1 PR kosztu marszu' },
    fog: { label: 'Gęsta mgła', effect: '+10% obrony prowincji' },
  },
  szl: {
    sunny: { label: 'Słōnecznie', effect: '+15% z Farm, dobry marsz' },
    rain: { label: 'Srogi dyszcz', effect: '-15% pancyrōw, artyleryje i lotnictwa' },
    snow: { label: 'Śnieżyca / Mrōz', effect: '+25% ôbrōny, droższy marsz (+1 PR)' },
    fog: { label: 'Mgła', effect: '+10% ôbrōny prowincyje' },
  },
  csb: {
    sunny: { label: 'Słoneczno', effect: '+15% z Farmów, dobri marsz' },
    rain: { label: 'Ùlewny deszcz', effect: '-15% czôłgów, artilerii i lëtnictwa' },
    snow: { label: 'Snieżëca / Mróz', effect: '+25% òbronë, +1 PR kòsztu marszu' },
    fog: { label: 'Gãstô mgła', effect: '+10% òbronë prowincëji' },
  },
};

export const SCENARIO_TEXT: Record<Language, Record<ScenarioId, { title: string; subtitle: string }>> = {
  en: {
    '2026': { title: '2026 · Modern World', subtitle: 'Contemporary geopolitics, orbital shields & Mars' },
    sandbox: { title: '2026 · Free Sandbox', subtitle: 'Open world diplomacy with zero initial wars or alliances' },
    '1939': { title: '1939 · World War II', subtitle: 'Global clash of superpowers' },
    '1918': { title: '1918 · Rebirth', subtitle: 'Post-Great War European order' },
    '1619': { title: '1619 · Golden Age', subtitle: 'Polish-Lithuanian Commonwealth at its zenith' },
    '1410': { title: '1410 · The Great War', subtitle: 'Kingdom of Poland, Lithuania & Teutonic Order' },
    '966': { title: '966 · Baptism of Poland', subtitle: 'Mieszko I’s Realm & Early Medieval Europe' },
  },
  pl: {
    '2026': { title: '2026 · Współczesny Świat', subtitle: 'Nowoczesna geopolityka i program kosmiczny' },
    sandbox: { title: '2026 · Wolny Sandbox', subtitle: 'Otwarty świat bez wymuszonych wojen i sojuszy na starcie' },
    '1939': { title: '1939 · II Wojna Światowa', subtitle: 'Globalny konflikt mocarstw świata' },
    '1918': { title: '1918 · Odrodzenie', subtitle: 'Nowy ład Europy po Wielkiej Wojnie' },
    '1619': { title: '1619 · Złoty Wiek', subtitle: 'Potęga Rzeczypospolitej Obojga Narodów' },
    '1410': { title: '1410 · Wielka Wojna', subtitle: 'Korona Polska, Litwa i Zakon Krzyżacki' },
    '966': { title: '966 · Chrzest Polski', subtitle: 'Państwo Polan Mieszka I i wczesna Europa' },
  },
  szl: {
    '2026': { title: '2026 · Dzisiejszy Świat', subtitle: 'Terōźno geopolitika i ôbrōna' },
    sandbox: { title: '2026 · Wolny Sandbox', subtitle: 'Ôtwarty świat bez wojen na starcie' },
    '1939': { title: '1939 · II Wojna Światowo', subtitle: 'Globalny kōnflikt mocarstw' },
    '1918': { title: '1918 · Ôdrodzynie', subtitle: 'Nowy porzōndek Ojropy po Wielgij Wojnie' },
    '1619': { title: '1619 · Złoty Wiek', subtitle: 'Siyła Rzeczpospolityj Ôbōjga Narodōw' },
    '1410': { title: '1410 · Wielgo Wojna', subtitle: 'Korōna Polsko, Litwa a Krziżoki' },
    '966': { title: '966 · Chrzest Polski', subtitle: 'Państwo Polan Mieszka I i wczesno Ojropa' },
  },
  csb: {
    '2026': { title: '2026 · Dzysdniowi Swiat', subtitle: 'Nowòczasnô geòpòlitika i òbrona' },
    sandbox: { title: '2026 · Wòlny Sandbox', subtitle: 'Òtemkłi swiat bez wòjnów na pòczątkù' },
    '1939': { title: '1939 · II Swiatowô Wòjna', subtitle: 'Swiatowi kònflikt mòcarstwów' },
    '1918': { title: '1918 · Òdrodzenié', subtitle: 'Nowi pòrządk Eùropë pò Wiôldżi Wòjnie' },
    '1619': { title: '1619 · Złoti Wiek', subtitle: 'Mòc Rzeczpòspòlitëj Òbù Nôrodów' },
    '1410': { title: '1410 · Wiôlgô Wòjna', subtitle: 'Pòlskô Kòróna, Lëtewskô a Krzëżôcë' },
    '966': { title: '966 · Chrzest Pòlsczi', subtitle: 'Państwò Pòlanów Mieszka I' },
  },
};

export const UNIT_NAMES: Record<Language, Record<UnitType, string>> = {
  en: {
    infantry: 'Infantry',
    tanks: 'Main Battle Tanks',
    rocket_artillery: 'Rocket Artillery',
    anti_air: 'Air Defense',
    aviation: 'Air Force',
    naval_fleet: 'Naval Fleet',
    armored_train: 'Armored Train',
    archers: 'Archers / Musketeers',
    cavalry: 'Cavalry / Hussars',
    artillery: 'Artillery',
  },
  pl: {
    infantry: 'Piechota',
    tanks: 'Czołgi',
    rocket_artillery: 'Artyleria Rakietowa',
    anti_air: 'Obrona Przeciwlotnicza',
    aviation: 'Lotnictwo',
    naval_fleet: 'Flota Morska',
    armored_train: 'Pociąg Pancerny',
    archers: 'Łucznicy / Muszkieterowie',
    cavalry: 'Kawaleria / Husaria',
    artillery: 'Artyleria',
  },
  szl: {
    infantry: 'Piechota',
    tanks: 'Pancyry (Czołgi)',
    rocket_artillery: 'Rakietowo Artyleryjo',
    anti_air: 'Przeciwlotniczo Ôbrōna',
    aviation: 'Lotnictwo',
    naval_fleet: 'Flota Morska',
    armored_train: 'Cug Pancyrny',
    archers: 'Łuczniki / Muszkietyry',
    cavalry: 'Kawaleryjo / Husaryjo',
    artillery: 'Artyleryjo',
  },
  csb: {
    infantry: 'Piechòta',
    tanks: 'Czôłdżi',
    rocket_artillery: 'Rakietowô Artileria',
    anti_air: 'Przecëwlëtnicznô Òbrona',
    aviation: 'Lëtnictwò',
    naval_fleet: 'Mòrskô Flota',
    armored_train: 'Pòcãg Pancerzë',
    archers: 'Łëcznicë / Mùszkieterowie',
    cavalry: 'Kawaleria / Hùsaria',
    artillery: 'Artileria',
  },
};

export const BUILDING_NAMES: Record<Language, Record<BuildingType, { name: string; desc: string }>> = {
  en: {
    factory: { name: 'Industrial Factory', desc: '+4.5 PLN / month' },
    workshop: { name: 'Artisan Workshop', desc: '+2.6 PLN / month' },
    farm: { name: 'Granary & Farm', desc: '+population growth & supply' },
    barracks: { name: 'Military Barracks', desc: '-20% recruit cost' },
    port: { name: 'Naval Port', desc: '+3.0 PLN / month & convoys' },
    fort: { name: 'Fortress', desc: '+35% province defense' },
    castle: { name: 'Bastion Castle', desc: '+35% defense & local prestige' },
    university: { name: 'University', desc: '+3.5 Research / month' },
    library: { name: 'Grand Library', desc: '+1.8 Research / month' },
    railway: { name: 'Strategic Railway', desc: '3x troop speed & Armored Trains' },
    coastal_defense: { name: 'Coastal Defense', desc: '+28% vs naval landings' },
    airbase: { name: 'Air Force Base', desc: 'Enables rapid strategic airlifts' },
    armory: { name: 'Heavy Armory', desc: 'Boosts mechanized readiness' },
    nuclear_reactor: { name: 'Nuclear Reactor', desc: '+7.2 PLN / month & clean power' },
    missile_silo: { name: 'Missile Silo', desc: 'Enables ballistic & nuclear launches' },
    spaceport: { name: 'Spaceport', desc: 'Required for Moon & Mars colonies' },
  },
  pl: {
    factory: { name: 'Fabryka Przemysłowa', desc: '+4.5 PLN / m-c' },
    workshop: { name: 'Warsztat Rzemieślniczy', desc: '+2.6 PLN / m-c' },
    farm: { name: 'Spichlerz i Farma', desc: '+populacja i zaopatrzenie' },
    barracks: { name: 'Koszary', desc: '-20% koszt rekrutacji' },
    port: { name: 'Port Morski', desc: '+3.0 PLN / m-c i konwoje' },
    fort: { name: 'Fort', desc: '+35% obrony prowincji' },
    castle: { name: 'Zamek Bastionowy', desc: '+35% obrony i prestiż' },
    university: { name: 'Uniwersytet', desc: '+3.5 pkt Badań / m-c' },
    library: { name: 'Wielka Biblioteka', desc: '+1.8 pkt Badań / m-c' },
    railway: { name: 'Kolej Strategiczna', desc: '3x szybszy marsz i Pociągi Pancerne' },
    coastal_defense: { name: 'Obrona Wybrzeża', desc: '+28% przeciw desantom' },
    airbase: { name: 'Baza Lotnicza', desc: 'Wspiera szybki przerzut wojsk' },
    armory: { name: 'Zbrojownia', desc: 'Wzmacnia gotowość pancerną' },
    nuclear_reactor: { name: 'Reaktor Jądrowy', desc: '+7.2 PLN / m-c i czysta energia' },
    missile_silo: { name: 'Silos Rakietowy', desc: 'Umożliwia ataki rakietowe i jądrowe' },
    spaceport: { name: 'Kosmodrom', desc: 'Wymagany do kolonizacji kosmosu' },
  },
  szl: {
    factory: { name: 'Fabryka', desc: '+4.5 PLN / m-c' },
    workshop: { name: 'Warsztat', desc: '+2.6 PLN / m-c' },
    farm: { name: 'Farma', desc: '+ludzie i jydzynie' },
    barracks: { name: 'Koszary', desc: '-20% koszt werbōnku' },
    port: { name: 'Port Morski', desc: '+3.0 PLN / m-c i flota' },
    fort: { name: 'Fort', desc: '+35% ôbrōny prowincyje' },
    castle: { name: 'Zōmek', desc: '+35% ôbrōny' },
    university: { name: 'Uniwersytet', desc: '+3.5 Badań / m-c' },
    library: { name: 'Biblioteka', desc: '+1.8 Badań / m-c' },
    railway: { name: 'Kolej', desc: '3x szybszy marsz a Cugi Pancyrne' },
    coastal_defense: { name: 'Ôbrōna Brzegu', desc: '+28% na desant' },
    airbase: { name: 'Lotnisko Wojskowe', desc: 'Desanty powietrzne' },
    armory: { name: 'Zbrojownia', desc: 'Siła pancyrno' },
    nuclear_reactor: { name: 'Reaktor Atomowy', desc: '+7.2 PLN / m-c' },
    missile_silo: { name: 'Silos Rakietowy', desc: 'Ataki rakietowe' },
    spaceport: { name: 'Kosmodrom', desc: 'Kolōnizacyjo kosmosu' },
  },
  csb: {
    factory: { name: 'Fabrika', desc: '+4.5 PLN / m-c' },
    workshop: { name: 'Wersztat', desc: '+2.6 PLN / m-c' },
    farm: { name: 'Bùr / Farma', desc: '+lëdztwò i zapòtrzebòwanié' },
    barracks: { name: 'Kòszarë', desc: '-20% kòszt rekrùtacji' },
    port: { name: 'Pòrt Mòrsczi', desc: '+3.0 PLN / m-c i flota' },
    fort: { name: 'Fòrt', desc: '+35% òbronë prowincëji' },
    castle: { name: 'Zómk', desc: '+35% òbronë' },
    university: { name: 'Ùniwersytet', desc: '+3.5 Badérowaniô / m-c' },
    library: { name: 'Biblioteka', desc: '+1.8 Badérowaniô / m-c' },
    railway: { name: 'Kòlej Strategicznô', desc: '3x chùtszi marsz i Pòcãdżi' },
    coastal_defense: { name: 'Òbrona Brzegu', desc: '+28% procëm desantowi' },
    airbase: { name: 'Lëtniskò', desc: 'Przerzët wòjsków' },
    armory: { name: 'Zbrojownia', desc: 'Mòc pancerzô' },
    nuclear_reactor: { name: 'Reaktór Atomòwi', desc: '+7.2 PLN / m-c' },
    missile_silo: { name: 'Rakietowi Silos', desc: 'Ataczi rakietowé' },
    spaceport: { name: 'Kòsmòdróm', desc: 'Kòlonizacjô kòsmòsu' },
  },
};

export interface Translations {
  ecosystemSubtitle: string;
  publicBeta: string;
  developedBy: string;
  splashContinue: string;
  gameModeLabel: string;
  playerModeLabel: string;
  botModeLabel: string;
  botModeDesc: string;
  botModeBanner: string;
  speedPaused: string;
  speed1x: string;
  speed2x: string;
  speed3x: string;
  speed5x: string;
  startGame: string;
  loadGame: string;
  scenarioEditorBtn: string;
  settings: string;
  tutorial: string;
  accountBtn: string;
  playAsGuest: string;
  selectScenario: string;
  selectDifficulty: string;
  selectCountry: string;
  searchCountry: string;
  yourCountry: string;
  treasury: string;
  perTurn: string;
  army: string;
  manpowerLabel: string;
  research: string;
  stability: string;
  population: string;
  turn: string;
  movementPts: string;
  diplomacyPts: string;
  techTreeBtn: string;
  spaceOceanBtn: string;
  councilMarketBtn: string;
  advisorTitle: string;
  advisorLabel: string;
  advisorOn: string;
  advisorOff: string;
  allies: string;
  noAllies: string;
  topCountries: string;
  selectedCountry: string;
  areaLabel: string;
  yourArmy: string;
  enemyArmy: string;
  exactArmyTotal: string;
  tacticalWarningStronger: string;
  tacticalBalanced: string;
  tacticalAdvantage: string;
  declareWar: string;
  proposeAlliance: string;
  proposeNap: string;
  proposeAccess: string;
  sendUltimatum: string;
  proposeVassal: string;
  sendSpy: string;
  blackOpsLabel: string;
  sabotageOp: string;
  rebelsOp: string;
  stealTechOp: string;
  strategicStrikeOp: string;
  nuclearStrikeOp: string;
  sendAid25: string;
  sendAid50: string;
  proposePeace: string;
  atWarBadge: string;
  allyBadge: string;
  truceBadge: string;
  napBadge: string;
  accessBadge: string;
  vassalBadge: string;
  diplomacyTab: string;
  encyclopediaTab: string;
  capitalLabel: string;
  capitalPrefix: string;
  governmentLabel: string;
  curiositiesLabel: string;
  provincePanel: string;
  buildingsTab: string;
  recruitTab: string;
  marchTab: string;
  techTab: string;
  arsenalTab: string;
  build: string;
  built: string;
  recruit: string;
  recruit10k: string;
  recruitMax: string;
  assimilateBtn: string;
  assimilatedBadge: string;
  unassimilatedWarn: string;
  winChanceLabel: string;
  selectTargetProvince: string;
  seaLandingTag: string;
  armySplit: string;
  issueOrder: string;
  queuedOrders: string;
  cancelOrder: string;
  treasuryModalTitle: string;
  budgetRevenues: string;
  budgetExpenses: string;
  taxIncomeLabel: string;
  factoryPortIncomeLabel: string;
  tradeIncomeLabel: string;
  vassalIncomeLabel: string;
  spaceIncomeLabel: string;
  armyUpkeepLabel: string;
  buildingUpkeepLabel: string;
  loanPaymentsLabel: string;
  vassalPaidLabel: string;
  netBalanceLabel: string;
  taxRateLabel: string;
  taxWarningHigh: string;
  taxBonusLow: string;
  stateBankTitle: string;
  takeLoan60: string;
  takeLoan150: string;
  repayLoan: string;
  noLoans: string;
  leaderboardBtn: string;
  leaderboardTitle: string;
  powersTab: string;
  chronicleTab: string;
  hallOfFameTab: string;
  timelapseTab: string;
  sortPower: string;
  sortArea: string;
  sortArmy: string;
  sortTreasury: string;
  noChronicle: string;
  noHallOfFame: string;
  randomEventPrompt: string;
  accountTitle: string;
  loginTab: string;
  registerTab: string;
  profileTab: string;
  nickname: string;
  emailOptional: string;
  chooseAvatar: string;
  securityMethodPrompt: string;
  passwordMethod: string;
  pinMethod: string;
  passwordLabel: string;
  pinLabel: string;
  pinLengthHint: string;
  createAccount: string;
  loginAccount: string;
  logout: string;
  exportAccount: string;
  importAccount: string;
  verifySecretToUnlock: string;
  careerStats: string;
  turnsPlayed: string;
  warsWon: string;
  largestTerritory: string;
  rankLabel: string;
  saveGame: string;
  loadSlot: string;
  deleteSlot: string;
  noSaves: string;
  saveLabelPlaceholder: string;
  languageLabel: string;
  performanceMode: string;
  perfAuto: string;
  perfUltra: string;
  perfMedium: string;
  perfLight: string;
  soundLabel: string;
  soundOn: string;
  soundOff: string;
  backToMenu: string;
  close: string;
  victoryTitle: string;
  victorySubtitle: string;
  defeatTitle: string;
  defeatSubtitle: string;
  playAgain: string;
  tutorialTitle: string;
  tutorialDisclaimer: string;
  tutorialSteps: Array<{ title: string; body: string }>;
  tutorialNext: string;
  tutorialPrev: string;
  tutorialFinish: string;
  pauseNotificationHint: string;
  researchMilitary: string;
  researchEconomy: string;
  researchLogistics: string;
  upgradeTech: string;
  uiModeLabel: string;
  uiVeryEasy: string;
  uiEasy: string;
  uiHard: string;
  battlesLabel: string;
  cityReconBtn: string;
  grandStrategistMedalTitle: string;
  grandStrategistMedalDesc: string;
  timelapseReplayLabel: string;
  liveBattleLogLabel: string;
  noBattlesYet: string;
  guidedRecruitTip: string;
  guidedAttackTip: string;
  fpsLimitLabel: string;
  fpsUnlimited: string;
  globalWarmingLabel: string;
  autoPilotActive: string;
  autoPilotToggle: string;
  voiceAiLabel: string;
  voiceOn: string;
  voiceOff: string;
  speakBriefing: string;
  mobileTabCommand: string;
  mobileTabProvince: string;
  mobileTabWar: string;
  comebackProtocolTitle: string;
  politicalView: string;
  thermalView: string;
  logisticsView: string;
  reconstructCityBtn: string;
  spySatelliteBtn: string;
  unitDesignerTitle: string;
  straitBlockadeTitle: string;
  autoPilotAirliftingCountdown: string;
  climateAttritionWarn: string;
  peacefulStartLabel: string;
  peacefulStartDesc: string;
  customNationBtn: string;
  aiAggressivenessLabel: string;
  continueEternalEmpireBtn: string;
  peaceConferenceBtn: string;
  graffitiMissionBtn: string;
  mapModeReligions: string;
  mapModeCultures: string;
  mapModeEconomy: string;
  mapModeResources: string;
  mapModeDiplomacy: string;
  commanderXpLabel: string;
  worldConquestProgressLabel: string;
  developProvinceBtn: string;
  plunderProvinceBtn: string;
  missionariesBtn: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    ecosystemSubtitle: 'Blocks™ Ecosystem • Official Software',
    publicBeta: 'VERSION 4.0 · APEX EDITION',
    developedBy: 'Developed by Blocks™ (Mateusz Bednorz) • Copyright © 2026 Blocks™. All rights reserved.',
    splashContinue: 'Click or press Enter to continue',
    gameModeLabel: 'Game Mode',
    playerModeLabel: 'Player Campaign',
    botModeLabel: 'Bot Mode (AI Simulation)',
    botModeDesc: 'Every world nation is commanded by honest AI — watch empires clash in real time.',
    botModeBanner: 'BOT MODE: Watch autonomous AI nations wage wars, sign treaties, and expand live.',
    speedPaused: 'Pause',
    speed1x: '1x',
    speed2x: '2x',
    speed3x: '3x',
    speed5x: '5x',
    startGame: 'Launch Campaign',
    loadGame: 'Load Game',
    scenarioEditorBtn: 'Scenario Editor',
    settings: 'Settings',
    tutorial: 'Tutorial',
    accountBtn: 'Blocks™ Account',
    playAsGuest: 'Play as Guest',
    selectScenario: 'Select Historical Scenario',
    selectDifficulty: 'Difficulty Level',
    selectCountry: 'Select Starting Nation',
    searchCountry: 'Search nation...',
    yourCountry: 'Your nation',
    treasury: 'Treasury',
    perTurn: 'mo',
    army: 'Army',
    manpowerLabel: 'Manpower',
    research: 'Research',
    stability: 'Stability',
    population: 'Population',
    turn: 'Month',
    movementPts: 'MP',
    diplomacyPts: 'DP',
    techTreeBtn: 'Tech Tree',
    spaceOceanBtn: 'Space & Ocean',
    councilMarketBtn: 'Council & Market',
    advisorTitle: 'Blocks™ Tactical AI',
    advisorLabel: 'Tactical AI Advisor',
    advisorOn: 'Enabled',
    advisorOff: 'Disabled',
    allies: 'Allies',
    noAllies: 'No active alliances',
    topCountries: 'World Powers',
    selectedCountry: 'Selected Nation',
    areaLabel: 'Territory',
    yourArmy: 'Your army',
    enemyArmy: 'Total nation army',
    exactArmyTotal: 'Sum across provinces & marches',
    tacticalWarningStronger: 'Tactical warning: Target holds numerical superiority! Mobilize or secure allies before attacking.',
    tacticalBalanced: 'Forces are evenly matched. Leverage weather, forts, and unit composition.',
    tacticalAdvantage: 'You hold a decisive military advantage over this nation.',
    declareWar: 'Declare War',
    proposeAlliance: 'Alliance',
    proposeNap: 'Non-Aggression',
    proposeAccess: 'Military Access',
    sendUltimatum: 'Ultimatum',
    proposeVassal: 'Vassalize',
    sendSpy: 'Deploy Spy (12 PLN)',
    blackOpsLabel: 'Covert Black Ops',
    sabotageOp: 'Sabotage Forts',
    rebelsOp: 'Foment Rebels',
    stealTechOp: 'Steal Tech (+18 RP)',
    strategicStrikeOp: 'Ballistic Strike',
    nuclearStrikeOp: 'Nuclear Strike',
    sendAid25: 'Send Aid 25%',
    sendAid50: 'Send Aid 50%',
    proposePeace: 'Propose Peace',
    atWarBadge: 'AT WAR',
    allyBadge: 'ALLY',
    truceBadge: 'TRUCE',
    napBadge: 'NON-AGGRESSION',
    accessBadge: 'MIL. ACCESS',
    vassalBadge: 'YOUR VASSAL',
    diplomacyTab: 'Diplomacy',
    encyclopediaTab: 'Dossier & Facts',
    capitalLabel: 'Capital',
    capitalPrefix: 'Capital',
    governmentLabel: 'Government',
    curiositiesLabel: 'Historical & strategic dossier',
    provincePanel: 'Province Command',
    buildingsTab: 'Buildings',
    recruitTab: 'Recruit',
    marchTab: 'March',
    techTab: 'Tech Tree',
    arsenalTab: 'Arsenal',
    build: 'Build',
    built: 'Built',
    recruit: 'Recruit',
    recruit10k: '+10,000',
    recruitMax: 'Max',
    assimilateBtn: 'Assimilate Province (10 PLN)',
    assimilatedBadge: 'Assimilated',
    unassimilatedWarn: 'Unassimilated (-25% income & defense)',
    winChanceLabel: 'Pre-War Battle Odds',
    selectTargetProvince: 'Choose destination province (land or sea lane)',
    seaLandingTag: 'Naval Landing',
    armySplit: 'Force Split',
    issueOrder: 'Launch Real-Time March',
    queuedOrders: 'Active Marches',
    cancelOrder: 'Recall',
    treasuryModalTitle: 'Treasury, Taxes & State Bank',
    budgetRevenues: 'Monthly Revenues',
    budgetExpenses: 'Monthly Expenses',
    taxIncomeLabel: 'Citizen Taxes',
    factoryPortIncomeLabel: 'Factories, Ports & Farms',
    tradeIncomeLabel: 'Trade & Infrastructure',
    vassalIncomeLabel: 'Vassal Tribute',
    spaceIncomeLabel: 'Space, Ocean & Megaprojects',
    armyUpkeepLabel: 'Army Upkeep',
    buildingUpkeepLabel: 'Building Upkeep',
    loanPaymentsLabel: 'Bank Loan Installments',
    vassalPaidLabel: 'Tribute Paid',
    netBalanceLabel: 'Net Balance / Month',
    taxRateLabel: 'Tax Rate',
    taxWarningHigh: 'High taxes (>25%) erode national stability!',
    taxBonusLow: 'Low taxes (<=14%) boost stability and public support.',
    stateBankTitle: 'State Bank (Loans)',
    takeLoan60: 'Loan +60 PLN (10 mo)',
    takeLoan150: 'Loan +150 PLN (10 mo)',
    repayLoan: 'Repay Early',
    noLoans: 'No active bank loans.',
    leaderboardBtn: 'Ranking & Chronicle',
    leaderboardTitle: 'World Powers, War Chronicle, Timelapse & Hall of Fame',
    powersTab: 'World Powers',
    chronicleTab: 'War Chronicle',
    hallOfFameTab: 'Blocks™ Hall of Fame',
    timelapseTab: 'Timelapse Replay',
    sortPower: 'Power',
    sortArea: 'Territory',
    sortArmy: 'Army',
    sortTreasury: 'Treasury',
    noChronicle: 'No chronicle entries yet — unpause the clock to make history.',
    noHallOfFame: 'No recorded Blocks™ Account milestones yet.',
    randomEventPrompt: 'Strategic Event — Choose Response',
    accountTitle: 'Blocks™ Account',
    loginTab: 'Sign In',
    registerTab: 'Create Account',
    profileTab: 'Profile & Transfer',
    nickname: 'Commander Nickname',
    emailOptional: 'E-mail (optional)',
    chooseAvatar: 'Select Avatar Emblem',
    securityMethodPrompt: 'Choose how to secure your account:',
    passwordMethod: 'Password',
    pinMethod: 'PIN Code',
    passwordLabel: 'Your text password',
    pinLabel: 'PIN Code (4 or 6 digits)',
    pinLengthHint: 'Use the numeric pad or keys 0–9',
    createAccount: 'Create Blocks™ Account',
    loginAccount: 'Sign In',
    logout: 'Sign Out',
    exportAccount: 'Export Blocks Account',
    importAccount: 'Import Account',
    verifySecretToUnlock: 'Enter your Password or PIN to unlock transfer:',
    careerStats: 'Blocks™ Career Statistics',
    turnsPlayed: 'Months played',
    warsWon: 'Wars won',
    largestTerritory: 'Largest territory',
    rankLabel: 'Blocks™ Rank',
    saveGame: 'Save Campaign',
    loadSlot: 'Load',
    deleteSlot: 'Delete',
    noSaves: 'No saved campaigns for this account.',
    saveLabelPlaceholder: 'Save name (e.g. Poland 2026)',
    languageLabel: 'Game Language',
    performanceMode: 'Performance Mode (Liquid Glass & Weather)',
    perfAuto: 'Auto (Hardware Detect)',
    perfUltra: 'Ultra Mode (Full Liquid Glass & Weather)',
    perfMedium: 'Medium Mode (Balanced)',
    perfLight: 'Light Mode (Streamlined Glass)',
    soundLabel: 'Battle & UI Audio (45% Limiter)',
    soundOn: 'Enabled',
    soundOff: 'Muted',
    backToMenu: 'Main Menu',
    close: 'Close',
    victoryTitle: 'STRATEGIC VICTORY!',
    victorySubtitle: 'A dominant superpower has achieved global & orbital supremacy.',
    defeatTitle: 'NATION DEFEATED',
    defeatSubtitle: 'All of your provinces have fallen to rival powers.',
    playAgain: 'New Campaign',
    tutorialTitle: 'Commander Tutorial — Global Strategy: APEX EDITION (VERSION 4.0)',
    tutorialDisclaimer: 'Notice: All PLN values shown in the treasury, budget, and global market are purely fictional virtual game currency and are not real money.',
    tutorialSteps: [
      {
        title: '1. Real-Time Simulation & Active Pause (1x–5x)',
        body: 'Global Strategy: APEX EDITION runs in continuous real time with Active Pause (Spacebar). Plan troop marches, diplomacy, and research while paused, then run 1x, 2x, 3x, or 5x speed.',
      },
      {
        title: '2. Interactive Visual Tech Tree',
        body: 'Open the Tech Tree from the top bar to plan multi-tier paths across Military, Economic, and Logistics branches—unlocking Missile Silos, Orbital Shields, Thermonuclear Warheads, and Spaceflight.',
      },
      {
        title: '3. 16 Polish Voivodeships, City Recon & Water Alerts',
        body: 'Zoom into Poland or the world to click major city pins for free Satellite Recon & Street View, command 16 Polish voivodeships, and monitor Maritime Water Alerts.',
      },
      {
        title: '4. Space & Ocean Agency + Council & Market',
        body: 'Expand beyond Earth Orbit to the Moon, Mars, Asteroid Belt, Jupiter, and Deep Ocean & Europa bases while appointing Cabinet Ministers and trading on the Global Market.',
      },
    ],
    tutorialNext: 'Next',
    tutorialPrev: 'Back',
    tutorialFinish: 'Begin Command',
    pauseNotificationHint: 'Hover to pause timer',
    researchMilitary: 'Military Doctrine (+8% strength)',
    researchEconomy: 'Industrial Economy (+10% income)',
    researchLogistics: 'Logistics (+1 MP, -8% unit cost)',
    upgradeTech: 'Upgrade (25 RP)',
    uiModeLabel: 'Visual Interface Mode',
    uiVeryEasy: '🟢 Very Easy UI',
    uiEasy: '🔵 Easy UI',
    uiHard: '🔴 Hard / Pro UI',
    battlesLabel: 'Battles',
    cityReconBtn: 'City Recon',
    grandStrategistMedalTitle: 'Honorary Grand Strategist Medal',
    grandStrategistMedalDesc: 'Awarded for Unmatched Tactical Genius!',
    timelapseReplayLabel: 'Campaign Timelapse Replay',
    liveBattleLogLabel: 'Live Battle Log',
    noBattlesYet: 'No clashes recorded yet — launch an offensive to log combat telemetry.',
    guidedRecruitTip: '➕ Recruit Soldiers',
    guidedAttackTip: '⚔️ Click Red Enemy Province to Attack',
    fpsLimitLabel: 'Frame Rate Limit (Hz Refresh)',
    fpsUnlimited: 'Unlimited / Native Hz',
    globalWarmingLabel: 'Warming Index',
    autoPilotActive: 'SMART AUTO-PILOT ON',
    autoPilotToggle: 'Smart Auto-Pilot',
    voiceAiLabel: 'Speaking Voice AI Advisor',
    voiceOn: 'Voice ON',
    voiceOff: 'Voice OFF',
    speakBriefing: 'Speak Briefing',
    mobileTabCommand: 'Empire',
    mobileTabProvince: 'Province',
    mobileTabWar: 'Warfare',
    comebackProtocolTitle: 'Emergency Comeback Protocol',
    politicalView: 'Political',
    thermalView: 'Thermal °C',
    logisticsView: 'Rail & Trade',
    reconstructCityBtn: 'Rebuild City (14 PLN)',
    spySatelliteBtn: 'Spy Satellite (22 PLN)',
    unitDesignerTitle: 'Custom Unit Forge',
    straitBlockadeTitle: 'Strait Blockades',
    autoPilotAirliftingCountdown: 'Smart Auto-Pilot: Airlifting to Front ({s}s)',
    climateAttritionWarn: 'Extreme Climate Attrition — Research Logistics Lv.1',
    peacefulStartLabel: 'Peaceful Start & War Acceptance',
    peacefulStartDesc: 'Prevent automatic turn-1 wars and require your approval (accept or diplomatic veto) before AI declares war.',
    customNationBtn: 'Create Custom Nation',
    aiAggressivenessLabel: 'AI Aggressiveness',
    continueEternalEmpireBtn: 'CONTINUE PLAYING (ETERNAL EMPIRE MODE)',
    peaceConferenceBtn: 'Peace Conference',
    graffitiMissionBtn: 'Covert Graffiti',
    mapModeReligions: 'Religions',
    mapModeCultures: 'Cultures',
    mapModeEconomy: 'Economy',
    mapModeResources: 'Resources',
    mapModeDiplomacy: 'Diplomacy',
    commanderXpLabel: 'Commander XP',
    worldConquestProgressLabel: 'World Conquest',
    developProvinceBtn: 'Develop (+Dev)',
    plunderProvinceBtn: 'Plunder',
    missionariesBtn: 'Missionaries',
  },
  pl: {
    ecosystemSubtitle: 'Blocks™ Ecosystem • Official Software',
    publicBeta: 'WERSJA 4.0 · APEX EDITION',
    developedBy: 'Developed by Blocks™ (Mateusz Bednorz) • Copyright © 2026 Blocks™. All rights reserved.',
    splashContinue: 'Kliknij lub naciśnij Enter, aby wejść',
    gameModeLabel: 'Tryb Rozgrywki',
    playerModeLabel: 'Kampania Gracza',
    botModeLabel: 'Tryb Botów (Symulacja AI)',
    botModeDesc: 'Wszystkimi państwami na świecie steruje uczciwe AI — obserwuj wojny i sojusze w czasie rzeczywistym.',
    botModeBanner: 'TRYB BOTÓW: Oglądaj na żywo, jak autonomiczne państwa AI prowadzą wojny i dyplomację.',
    speedPaused: 'Pauza',
    speed1x: '1x',
    speed2x: '2x',
    speed3x: '3x',
    speed5x: '5x',
    startGame: 'Rozpocznij Kampanię',
    loadGame: 'Wczytaj Grę',
    scenarioEditorBtn: 'Edytor Scenariusza',
    settings: 'Ustawienia',
    tutorial: 'Samouczek',
    accountBtn: 'Konto Blocks™',
    playAsGuest: 'Graj jako Gość',
    selectScenario: 'Wybierz Scenariusz Historyczny',
    selectDifficulty: 'Poziom Trudności',
    selectCountry: 'Wybierz Państwo Startowe',
    searchCountry: 'Szukaj państwa...',
    yourCountry: 'Twój kraj',
    treasury: 'Skarbiec',
    perTurn: 'm-c',
    army: 'Armia',
    manpowerLabel: 'Zasoby Ludzkie',
    research: 'Badania',
    stability: 'Stabilność',
    population: 'Populacja',
    turn: 'Miesiąc',
    movementPts: 'PR',
    diplomacyPts: 'PD',
    techTreeBtn: 'Drzewko Tech.',
    spaceOceanBtn: 'Kosmos i Ocean',
    councilMarketBtn: 'Rada i Rynek',
    advisorTitle: 'Blocks™ Doradca AI',
    advisorLabel: 'Taktyczny Doradca AI',
    advisorOn: 'Włączony',
    advisorOff: 'Wyłączony',
    allies: 'Sojusznicy',
    noAllies: 'Brak aktywnych sojuszy',
    topCountries: 'Mocarstwa Świata',
    selectedCountry: 'Wybrane Państwo',
    areaLabel: 'Powierzchnia',
    yourArmy: 'Twoja armia',
    enemyArmy: 'Całkowita armia państwa',
    exactArmyTotal: 'Suma w prowincjach i marszu',
    tacticalWarningStronger: 'Uwaga taktyczna: Przeciwnik ma przewagę liczebną! Zrekrutuj wojsko lub zawrzyj sojusz.',
    tacticalBalanced: 'Siły są wyrównane. Wykorzystaj pogodę, fortyfikacje i wsparcie floty.',
    tacticalAdvantage: 'Masz wyraźną przewagę militarną nad tym państwem.',
    declareWar: 'Wypowiedz wojnę',
    proposeAlliance: 'Sojusz',
    proposeNap: 'Pakt o nieagresji',
    proposeAccess: 'Dostęp wojskowy',
    sendUltimatum: 'Ultimatum',
    proposeVassal: 'Wasalizuj',
    sendSpy: 'Wyślij Szpiega (12 PLN)',
    blackOpsLabel: 'Operacje Specjalne (Black Ops)',
    sabotageOp: 'Sabotaż Fortów',
    rebelsOp: 'Bunt Ludności',
    stealTechOp: 'Kradzież Tech. (+18 PB)',
    strategicStrikeOp: 'Atak Rakietowy',
    nuclearStrikeOp: 'Uderzenie Jądrowe',
    sendAid25: 'Wsparcie 25%',
    sendAid50: 'Wsparcie 50%',
    proposePeace: 'Zaproponuj pokój',
    atWarBadge: 'STAN WOJNY',
    allyBadge: 'SOJUSZNIK',
    truceBadge: 'ROZEJM',
    napBadge: 'PAKT NIEAGRESJI',
    accessBadge: 'DOSTĘP WOJSK.',
    vassalBadge: 'TWÓJ WASAL',
    diplomacyTab: 'Dyplomacja',
    encyclopediaTab: 'Info i Ciekawostki',
    capitalLabel: 'Stolica',
    capitalPrefix: 'Stolica',
    governmentLabel: 'Ustrój',
    curiositiesLabel: 'Ciekawostki strategiczne i historyczne',
    provincePanel: 'Zarządzanie Prowincją',
    buildingsTab: 'Budynki',
    recruitTab: 'Rekrutacja',
    marchTab: 'Marsz',
    techTab: 'Badania',
    arsenalTab: 'Arsenał',
    build: 'Zbuduj',
    built: 'Zbudowano',
    recruit: 'Rekrutuj',
    recruit10k: '+10 000',
    recruitMax: 'Maks.',
    assimilateBtn: 'Asymiluj prowincję (10 PLN)',
    assimilatedBadge: 'Zasymilowana',
    unassimilatedWarn: 'Niestabilna (-25% dochodu i obrony)',
    winChanceLabel: 'Kalkulator szansy przed atakiem',
    selectTargetProvince: 'Wybierz prowincję docelową (ląd lub desant morski)',
    seaLandingTag: 'Desant Morski',
    armySplit: 'Podział oddziału',
    issueOrder: 'Rozpocznij Marsz na Żywo',
    queuedOrders: 'Aktywne marsze',
    cancelOrder: 'Zawróć',
    treasuryModalTitle: 'Skarbiec, Podatki i Bank Państwowy',
    budgetRevenues: 'Przychody miesięczne',
    budgetExpenses: 'Wydatki miesięczne',
    taxIncomeLabel: 'Podatki obywatelskie',
    factoryPortIncomeLabel: 'Fabryki, Porty i Farmy',
    tradeIncomeLabel: 'Handel i infrastruktura',
    vassalIncomeLabel: 'Danina od wasali',
    spaceIncomeLabel: 'Kosmos, Ocean i Megaprojekty',
    armyUpkeepLabel: 'Utrzymanie armii',
    buildingUpkeepLabel: 'Utrzymanie budynków',
    loanPaymentsLabel: 'Raty kredytów',
    vassalPaidLabel: 'Trybut lenny',
    netBalanceLabel: 'Bilans netto / m-c',
    taxRateLabel: 'Stawka podatkowa',
    taxWarningHigh: 'Wysokie podatki (>25%) obniżają stabilność państwa!',
    taxBonusLow: 'Niskie podatki (<=14%) wzmacniają poparcie i stabilność.',
    stateBankTitle: 'Bank Państwowy (Pożyczki)',
    takeLoan60: 'Pożyczka +60 PLN (10 m-cy)',
    takeLoan150: 'Pożyczka +150 PLN (10 m-cy)',
    repayLoan: 'Spłać wcześniej',
    noLoans: 'Brak aktywnych pożyczek bankowych.',
    leaderboardBtn: 'Ranking & Kronika',
    leaderboardTitle: 'Ranking Światowy, Kronika, Timelapse i Galeria Sław',
    powersTab: 'Mocarstwa Świata',
    chronicleTab: 'Kronika Wojny',
    hallOfFameTab: 'Galeria Sław Blocks™',
    timelapseTab: 'Powtórka Timelapse',
    sortPower: 'Potęga',
    sortArea: 'Terytorium',
    sortArmy: 'Armia',
    sortTreasury: 'Skarbiec',
    noChronicle: 'Brak wpisów w Kronice — odblokuj pauzę czasu, aby ruszyć kampanię.',
    noHallOfFame: 'Brak zapisanych rekordów Kont Blocks™.',
    randomEventPrompt: 'Wydarzenie Strategiczne — Wybierz Decyzję',
    accountTitle: 'Konto Blocks™',
    loginTab: 'Logowanie',
    registerTab: 'Nowe Konto',
    profileTab: 'Profil & Transfer',
    nickname: 'Nick gracza',
    emailOptional: 'E-mail (opcjonalny)',
    chooseAvatar: 'Wybierz ikonę awatara',
    securityMethodPrompt: 'Wybierz, w jaki sposób chcesz zabezpieczyć swoje konto:',
    passwordMethod: 'Hasło',
    pinMethod: 'Kod PIN',
    passwordLabel: 'Twoje hasło tekstowe',
    pinLabel: 'Kod PIN (4 lub 6 cyfr)',
    pinLengthHint: 'Użyj klawiatury numerycznej lub klawiszy 0–9',
    createAccount: 'Utwórz Konto Blocks™',
    loginAccount: 'Zaloguj się',
    logout: 'Wyloguj',
    exportAccount: 'Eksportuj Konto Blocks',
    importAccount: 'Wczytaj Konto',
    verifySecretToUnlock: 'Wpisz swoje Hasło lub Kod PIN, aby odblokować transfer:',
    careerStats: 'Statystyki Ekosystemu Blocks™',
    turnsPlayed: 'Rozegrane miesiące',
    warsWon: 'Wygrane wojny',
    largestTerritory: 'Największe terytorium',
    rankLabel: 'Ranga Blocks™',
    saveGame: 'Zapisz Kampanię',
    loadSlot: 'Wczytaj',
    deleteSlot: 'Usuń',
    noSaves: 'Brak zapisanych gier dla tego konta.',
    saveLabelPlaceholder: 'Nazwa zapisu (np. Polska 2026)',
    languageLabel: 'Język gry',
    performanceMode: 'Tryb wydajności (Liquid Glass & Pogoda)',
    perfAuto: 'Auto (Wykryj sprzęt)',
    perfUltra: 'Tryb Ultra (Pełne Liquid Glass i Pogoda)',
    perfMedium: 'Tryb Średni (Zbalansowany)',
    perfLight: 'Tryb Lekki (Szybkie Szkło)',
    soundLabel: 'Dźwięk i efekty bitwy (Limiter 45%)',
    soundOn: 'Włączony',
    soundOff: 'Wyciszony',
    backToMenu: 'Menu Główne',
    close: 'Zamknij',
    victoryTitle: 'ZWYCIĘSTWO STRATEGICZNE!',
    victorySubtitle: 'Dominująca potęga przejęła kontrolę nad Ziemią i orbitą.',
    defeatTitle: 'PAŃSTWO ZOSTAŁO PODBITĘ',
    defeatSubtitle: 'Utraciłeś wszystkie swoje prowincje na rzecz wrogich mocarstw.',
    playAgain: 'Nowa Kampania',
    tutorialTitle: 'Samouczek Dowódcy — Global Strategy: APEX EDITION (VERSION 4.0)',
    tutorialDisclaimer: 'Informacja: Wszystkie złote (PLN) widoczne w skarbcu, budżecie i na rynku światowym są wyłącznie fikcyjną walutą wirtualną służącą do rozgrywki i nie są prawdziwymi pieniędzmi.',
    tutorialSteps: [
      {
        title: '1. Czas Rzeczywisty i Aktywna Pauza (1x–5x)',
        body: 'Global Strategy działa w płynnym czasie rzeczywistym z Aktywną Pauzą (Spacja). Wydawaj rozkazy podczas pauzy, a potem przyspiesz czas 1x, 2x, 3x lub 5x.',
      },
      {
        title: '2. Interaktywne Drzewko Technologii',
        body: 'Otwórz Drzewko Technologii z górnego paska, by planować ścieżki badań (Wojsko, Ekonomia, Logistyka) i odblokować Silosy Rakietowe, Tarcze Orbitalne oraz Loty Kosmiczne.',
      },
      {
        title: '3. 16 Województw Polski, Podgląd Miast i Alerty Wodne',
        body: 'Przybliż mapę Polski lub świata i klikaj znaczniki miast, aby otworzyć darmowy podgląd satelitarny i Street View. Dowódź 16 województwami i śledź Alerty Wodne.',
      },
      {
        title: '4. Auto-Pilot, Klimat i Doradca Głosowy',
        body: 'Włącz Tryb Auto-Pilot (AI Naczelnego Dowódcy z mostami powietrznymi co 5s), kontroluj Indeks Globalnego Ocieplenia i słuchaj Mówiącego Doradcy AI.',
      },
    ],
    tutorialNext: 'Dalej',
    tutorialPrev: 'Wstecz',
    tutorialFinish: 'Rozpocznij Dowodzenie',
    pauseNotificationHint: 'Najedź myszką, aby zatrzymać',
    researchMilitary: 'Doktryna Wojskowa (+8% siły)',
    researchEconomy: 'Ekonomia Przemysłowa (+10% dochodu)',
    researchLogistics: 'Logistyka (+1 PR, -8% koszt wojsk)',
    upgradeTech: 'Ulepsz (25 PB)',
    uiModeLabel: 'Tryb Interfejsu',
    uiVeryEasy: '🟢 B. Łatwy UI',
    uiEasy: '🔵 Łatwy UI',
    uiHard: '🔴 Trudny / Pro UI',
    battlesLabel: 'Bitwy',
    cityReconBtn: 'Zwiad Miasta',
    grandStrategistMedalTitle: 'Honorowy Medal Wielkiego Stratega',
    grandStrategistMedalDesc: 'Przyznany za niezrównany geniusz taktyczny!',
    timelapseReplayLabel: 'Powtórka Timelapse Kampanii',
    liveBattleLogLabel: 'Dziennik Bitew na Żywo',
    noBattlesYet: 'Brak zarejestrowanych starć — rozpocznij ofensywę, aby zobaczyć logi.',
    guidedRecruitTip: '➕ Rekrutuj Żołnierzy',
    guidedAttackTip: '⚔️ Kliknij Czerwoną Prowincję Wroga, aby Zaatakować',
    fpsLimitLabel: 'Limit Klatek na Sekundę (Hz)',
    fpsUnlimited: 'Bez Limitu / Natywne Hz',
    globalWarmingLabel: 'Ocieplenie',
    autoPilotActive: 'SMART AUTO-PILOT AKTYWNY',
    autoPilotToggle: 'Smart Auto-Pilot',
    voiceAiLabel: 'Mówiący Doradca Głosowy AI',
    voiceOn: 'Głos WŁ.',
    voiceOff: 'Głos WYŁ.',
    speakBriefing: 'Odczytaj Raport',
    mobileTabCommand: 'Państwo',
    mobileTabProvince: 'Prowincja',
    mobileTabWar: 'Wojna',
    comebackProtocolTitle: 'Protokół Ratunkowy',
    politicalView: 'Polityczna',
    thermalView: 'Termiczna °C',
    logisticsView: 'Kolej i Handel',
    reconstructCityBtn: 'Odbuduj Miasto (14 PLN)',
    spySatelliteBtn: 'Satelita Szpieg. (22 PLN)',
    unitDesignerTitle: 'Kuźnia Jednostek',
    straitBlockadeTitle: 'Blokada Cieśnin',
    autoPilotAirliftingCountdown: 'Smart Auto-Pilot: Przerzut na Front ({s}s)',
    climateAttritionWarn: 'Ekstremalny Klimat — Zbadaj Logistykę Poz. 1',
    peacefulStartLabel: 'Pokojowy Start i Akceptacja Wojen',
    peacefulStartDesc: 'Blokuj wojny na starcie i wymagaj Twojej zgody (akceptacja lub weto) przed wypowiedzeniem wojny przez AI.',
    customNationBtn: 'Własne Państwo',
    aiAggressivenessLabel: 'Agresywność AI',
    continueEternalEmpireBtn: 'GRAJ DALEJ (TRYB WIECZNEGO IMPERIUM)',
    peaceConferenceBtn: 'Konferencja Pokojowa',
    graffitiMissionBtn: 'Tajne Graffiti',
    mapModeReligions: 'Religie',
    mapModeCultures: 'Kultury',
    mapModeEconomy: 'Ekonomia',
    mapModeResources: 'Surowce',
    mapModeDiplomacy: 'Dyplomacja',
    commanderXpLabel: 'Doświadczenie Dowódcy',
    worldConquestProgressLabel: 'Podbój Świata',
    developProvinceBtn: 'Rozwiń (+Rozwój)',
    plunderProvinceBtn: 'Złup',
    missionariesBtn: 'Misjonarze',
  },
  szl: {
    ecosystemSubtitle: 'Blocks™ Ecosystem • Official Software',
    publicBeta: 'WERSYJO 4.0 · APEX EDITION',
    developedBy: 'Developed by Blocks™ (Mateusz Bednorz) • Copyright © 2026 Blocks™. All rights reserved.',
    splashContinue: 'Kliknij abo naćiś Enter, coby wlyźć',
    gameModeLabel: 'Tryb Gry',
    playerModeLabel: 'Kampanijo Gracza',
    botModeLabel: 'Tryb Botōw (Symulacyjo AI)',
    botModeDesc: 'Wszyjske państwa grajōm same na żywo — ôglōndej wojny i sojusze.',
    botModeBanner: 'TRYB BOTŌW: Ôglōndej, jak boty (AI) grajōm same ze sobōm na mapie świata.',
    speedPaused: 'Pauza',
    speed1x: '1x',
    speed2x: '2x',
    speed3x: '3x',
    speed5x: '5x',
    startGame: 'Zacznij Kampanijo',
    loadGame: 'Wczytej Gra',
    scenarioEditorBtn: 'Edytor Scynariusza',
    settings: 'Sztelōnki',
    tutorial: 'Samōuczek',
    accountBtn: 'Kōnto Blocks™',
    playAsGuest: 'Grej jako Gość',
    selectScenario: 'Wybier Scynariusz Historyczny',
    selectDifficulty: 'Poziōm Trudności',
    selectCountry: 'Wybier Państwo Startowe',
    searchCountry: 'Szukej państwa...',
    yourCountry: 'Twōj kraj',
    treasury: 'Skarbnik',
    perTurn: 'm-c',
    army: 'Armijo',
    manpowerLabel: 'Rezerwy Ludzi',
    research: 'Badania',
    stability: 'Stabilność',
    population: 'Ludność',
    turn: 'Miesiōnc',
    movementPts: 'PR',
    diplomacyPts: 'PD',
    techTreeBtn: 'Drzewko Tech.',
    spaceOceanBtn: 'Kosmos i Ocean',
    councilMarketBtn: 'Rada i Rynek',
    advisorTitle: 'Blocks™ Doradca AI',
    advisorLabel: 'Doradca Taktyczny AI',
    advisorOn: 'Załōnczōny',
    advisorOff: 'Wyłōnczōny',
    allies: 'Kamraty (Sojusz)',
    noAllies: 'Żodnych sojuszy',
    topCountries: 'Ranking Mocarstw',
    selectedCountry: 'Wybrane Państwo',
    areaLabel: 'Plac',
    yourArmy: 'Twoja armijo',
    enemyArmy: 'Całkowito armijo państwa',
    exactArmyTotal: 'Razym we prowincyjach i marszu',
    tacticalWarningStronger: 'Dej pozōr: Przeciwnik mo wyncyj wojska!',
    tacticalBalanced: 'Siyły sōm rōwne. Postow forty a bacz na pogoda.',
    tacticalAdvantage: 'Mosz srogo przewoga nad tym państwym.',
    declareWar: 'Wypowiedz wojna',
    proposeAlliance: 'Sojusz',
    proposeNap: 'Pakt ô nieagresyji',
    proposeAccess: 'Dostymp wojskowy',
    sendUltimatum: 'Ultimatum',
    proposeVassal: 'Wasalizuj',
    sendSpy: 'Wyślij Szpiega (12 PLN)',
    blackOpsLabel: 'Tajne Akcyje (Black Ops)',
    sabotageOp: 'Sabotaż Fortōw',
    rebelsOp: 'Bunt',
    stealTechOp: 'Kradzież Tech. (+18 PB)',
    strategicStrikeOp: 'Atak Rakietowy',
    nuclearStrikeOp: 'Atak Jōndrowy',
    sendAid25: 'Wsparcie 25%',
    sendAid50: 'Wsparcie 50%',
    proposePeace: 'Zaproponuj pokōj',
    atWarBadge: 'WOJNA',
    allyBadge: 'SOJUSZ',
    truceBadge: 'ROZEJM',
    napBadge: 'PAKT NIEAGRESYJI',
    accessBadge: 'DOSTYMP WOJSK.',
    vassalBadge: 'TWŌJ WASAL',
    diplomacyTab: 'Dyplomacyjo',
    encyclopediaTab: 'Informacyje',
    capitalLabel: 'Stolica',
    capitalPrefix: 'Stolica',
    governmentLabel: 'Ustrōj',
    curiositiesLabel: 'Ciekawostki ô państwie',
    provincePanel: 'Rządzynie Prowincyjo',
    buildingsTab: 'Budynki',
    recruitTab: 'Werbōnek',
    marchTab: 'Marsz',
    techTab: 'Tech.',
    arsenalTab: 'Arsenał',
    build: 'Postow',
    built: 'Stoji',
    recruit: 'Werbuj',
    recruit10k: '+10 000',
    recruitMax: 'Maks.',
    assimilateBtn: 'Asymiluj prowincyjo (10 PLN)',
    assimilatedBadge: 'Zasymilowano',
    unassimilatedWarn: 'Niespokojno (-25% dochodu i ôbrōny)',
    winChanceLabel: 'Szansa na wygrano',
    selectTargetProvince: 'Wybier prowincyjo docelowo',
    seaLandingTag: 'Desant Morski',
    armySplit: 'Podzioł ôddziału',
    issueOrder: 'Wyznacz Marsz na Żywo',
    queuedOrders: 'Aktywne marsze',
    cancelOrder: 'Cōfnij',
    treasuryModalTitle: 'Skarbnik, Podatki i Bank',
    budgetRevenues: 'Przychody na miesiōnc',
    budgetExpenses: 'Wydatki na miesiōnc',
    taxIncomeLabel: 'Podatki ôbywatelske',
    factoryPortIncomeLabel: 'Fabryki, Porty i Farmy',
    tradeIncomeLabel: 'Handel i drogi',
    vassalIncomeLabel: 'Danina ôd wasali',
    spaceIncomeLabel: 'Kosmos i Megaprojekty',
    armyUpkeepLabel: 'Utrzymanie wojska',
    buildingUpkeepLabel: 'Utrzymanie budynkōw',
    loanPaymentsLabel: 'Raty kredytōw',
    vassalPaidLabel: 'Trybut lenny',
    netBalanceLabel: 'Bilans netto / m-c',
    taxRateLabel: 'Stawka podatkowo',
    taxWarningHigh: 'Sroge podatki (>25%) psujōm stabilność!',
    taxBonusLow: 'Niske podatki (<=14%) poprawiajōm stabilność.',
    stateBankTitle: 'Bank Państwowy (Pożyczki)',
    takeLoan60: 'Pożyczka +60 PLN (10 m-cy)',
    takeLoan150: 'Pożyczka +150 PLN (10 m-cy)',
    repayLoan: 'Spłać teroz',
    noLoans: 'Żodnych pożyczek.',
    leaderboardBtn: 'Ranking & Krōnika',
    leaderboardTitle: 'Ranking Świata, Krōnika, Timelapse i Galeryjo Sław',
    powersTab: 'Mocarstwa Świata',
    chronicleTab: 'Krōnika Wojny',
    hallOfFameTab: 'Galeryjo Sław Blocks™',
    timelapseTab: 'Timelapse',
    sortPower: 'Siyła',
    sortArea: 'Plac',
    sortArmy: 'Armijo',
    sortTreasury: 'Skarbnik',
    noChronicle: 'Żodnych wpisōw w Krōnice.',
    noHallOfFame: 'Żodnych rekordōw Kont Blocks™.',
    randomEventPrompt: 'Wydarzynie Strategiczne',
    accountTitle: 'Kōnto Blocks™',
    loginTab: 'Logowanie',
    registerTab: 'Nowe Kōnto',
    profileTab: 'Profil & Transfer',
    nickname: 'Nick gracza',
    emailOptional: 'E-mail (nieobowiązkowy)',
    chooseAvatar: 'Wybier ikōna awatara',
    securityMethodPrompt: 'Wybier, jak chcesz zabezpieczyć swoje kōnto:',
    passwordMethod: 'Hasło',
    pinMethod: 'Kod PIN',
    passwordLabel: 'Twoje hasło tekstowe',
    pinLabel: 'Kod PIN (4 abo 6 cyfer)',
    pinLengthHint: 'Użyj klawiatury numerycznej abo 0–9',
    createAccount: 'Zrób Kōnto Blocks™',
    loginAccount: 'Zaloguj sie',
    logout: 'Wyloguj',
    exportAccount: 'Eksportuj Kōnto Blocks',
    importAccount: 'Wczytej Kōnto',
    verifySecretToUnlock: 'Wpisz Hasło abo Kod PIN, coby ôdblokować:',
    careerStats: 'Statystyki Kōnta Blocks™',
    turnsPlayed: 'Rozegrane miesiōnce',
    warsWon: 'Wygrane wojny',
    largestTerritory: 'Nojwiynkszy plac',
    rankLabel: 'Ranga Blocks™',
    saveGame: 'Zapisz Kampanijo',
    loadSlot: 'Wczytej',
    deleteSlot: 'Wyciep',
    noSaves: 'Żodnych zapisanych gier.',
    saveLabelPlaceholder: 'Miano zapisu (np. Polska 2026)',
    languageLabel: 'Godka gry',
    performanceMode: 'Tryb szwungu (Liquid Glass & Pogoda)',
    perfAuto: 'Auto (Mōndry)',
    perfUltra: 'Tryb Ultra (Pełno pogoda i szkło)',
    perfMedium: 'Tryb Strzedni (Rōwny)',
    perfLight: 'Tryb Lekki (Szybsze Szkło)',
    soundLabel: 'Klang a dyńki bitwy (Limiter 45%)',
    soundOn: 'Załōnczōny',
    soundOff: 'Wyciszōny',
    backToMenu: 'Głōwne Menu',
    close: 'Zawrzij',
    victoryTitle: 'WIELGO WYGRANO!',
    victorySubtitle: 'Twoje państwo rzōndzi na całym świecie.',
    defeatTitle: 'PAŃSTWO PRZEGRAŁO',
    defeatSubtitle: 'Straciyłeś wszyjske prowincyje na rzecz wrogōw.',
    playAgain: 'Nowo Kampanijo',
    tutorialTitle: 'Samōuczek Dowōdcy — Global Strategy: APEX EDITION (VERSION 4.0)',
    tutorialDisclaimer: 'Informacyjo: Wszyjske złoté (PLN) widoczne w skarbniku sōm ino wirtualnōm walutōm do gry i niy sōm prowdywymi piniyndzami.',
    tutorialSteps: [
      { title: '1. Czas Rzeczywisty i Pauza (1x–5x)', body: 'Steruj wojskym na żywo z aktywnōm pauzōm (Spacyjo).' },
      { title: '2. Drzewko Technologii', body: 'Planuj badania wojskowe, ekōnōmiczne i kosmiczne.' },
      { title: '3. 16 Wojewōdztw Polski i Zwiad Miast', body: 'Dowodź 16 wojewōdztwami i ôglōndej miasta na mapie.' },
      { title: '4. Auto-Pilot i Klimat', body: 'Używej Auto-Pilota i gōdajōncego doradcy AI.' },
    ],
    tutorialNext: 'Dalij',
    tutorialPrev: 'Nazôd',
    tutorialFinish: 'Zacznij Dowodzynie',
    pauseNotificationHint: 'Najedź myszkōm, coby zatrzymać',
    researchMilitary: 'Doktryna Wojskowo (+8% siyły)',
    researchEconomy: 'Przemysł (+10% dochodu)',
    researchLogistics: 'Logistyka (+1 PR, -8% koszt)',
    upgradeTech: 'Ulepsz (25 PB)',
    uiModeLabel: 'Tryb Interfejsu',
    uiVeryEasy: '🟢 Fest Łatwy UI',
    uiEasy: '🔵 Łatwy UI',
    uiHard: '🔴 Pro / Weteran UI',
    battlesLabel: 'Bitwy',
    cityReconBtn: 'Zwiad Miasta',
    grandStrategistMedalTitle: 'Hōnorowy Medal Wielgiego Stratega',
    grandStrategistMedalDesc: 'Za niyzrównany gyniuz taktyczny!',
    timelapseReplayLabel: 'Powtōrka Timelapse Kampanije',
    liveBattleLogLabel: 'Dziynnik Bitew na Żywo',
    noBattlesYet: 'Żodnych bitew jeszcze niy było.',
    guidedRecruitTip: '➕ Werbuj Wojsko',
    guidedAttackTip: '⚔️ Kliknij Czerwōno Prowincyjo Wroga, coby Atakować',
    fpsLimitLabel: 'Limit Klatek (Hz)',
    fpsUnlimited: 'Bez Limitu / Natywne Hz',
    globalWarmingLabel: 'Ôcieplynie',
    autoPilotActive: 'SMART AUTO-PILOT WŁ.',
    autoPilotToggle: 'Smart Auto-Pilot',
    voiceAiLabel: 'Gōdajōncy Doradca AI',
    voiceOn: 'Głos WŁ.',
    voiceOff: 'Głos WYŁ.',
    speakBriefing: 'Czytej Raport',
    mobileTabCommand: 'Państwo',
    mobileTabProvince: 'Prowincyjo',
    mobileTabWar: 'Wojna',
    comebackProtocolTitle: 'Protokōł Ratōnkowy',
    politicalView: 'Polityczno',
    thermalView: 'Termiczno °C',
    logisticsView: 'Kolej i Handel',
    reconstructCityBtn: 'Ôdbuduj Miasto (14 PLN)',
    spySatelliteBtn: 'Satelita (22 PLN)',
    unitDesignerTitle: 'Kuźnia Jednostek',
    straitBlockadeTitle: 'Blokada Ciyśnin',
    autoPilotAirliftingCountdown: 'Smart Auto-Pilot: Desant na Frōnt ({s}s)',
    climateAttritionWarn: 'Srogi Klimat — Zbadej Logistyka 1',
    peacefulStartLabel: 'Pokojowy Start i Zgoda na Wojny',
    peacefulStartDesc: 'Blokuj wojny na starcie i pytaj ô zgoda przed wypowiedziyniym wojny.',
    customNationBtn: 'Włosne Państwo',
    aiAggressivenessLabel: 'Agresywność AI',
    continueEternalEmpireBtn: 'GREJ DALIJ (WIECZNE IMPERIUM)',
    peaceConferenceBtn: 'Kōnferencyjo Pokojowo',
    graffitiMissionBtn: 'Tajne Graffiti',
    mapModeReligions: 'Religije',
    mapModeCultures: 'Kultury',
    mapModeEconomy: 'Ekōnōmijo',
    mapModeResources: 'Surowce',
    mapModeDiplomacy: 'Dyplomacyjo',
    commanderXpLabel: 'XP Dowōdcy',
    worldConquestProgressLabel: 'Podbōj Świata',
    developProvinceBtn: 'Rozwiń',
    plunderProvinceBtn: 'Złup',
    missionariesBtn: 'Misyjonarze',
  },
  csb: {
    ecosystemSubtitle: 'Blocks™ Ecosystem • Official Software',
    publicBeta: 'WERSJÔ 4.0 · APEX EDITION',
    developedBy: 'Developed by Blocks™ (Mateusz Bednorz) • Copyright © 2026 Blocks™. All rights reserved.',
    splashContinue: 'Klëkni abò wcësni Enter, żebë weńc',
    gameModeLabel: 'Trib Grë',
    playerModeLabel: 'Kampaniô Gracza',
    botModeLabel: 'Trib Bòtów (Symulacjô AI)',
    botModeDesc: 'Wszëtczima państwama rządzë autonomné AI na żëwò.',
    botModeBanner: 'TRIB BÒTÓW: Òglądôj na żëwò, jak bòtë (AI) grają na mapie swiata.',
    speedPaused: 'Pauza',
    speed1x: '1x',
    speed2x: '2x',
    speed3x: '3x',
    speed5x: '5x',
    startGame: 'Rozpòczni Kampaniã',
    loadGame: 'Wczëtôj Grã',
    scenarioEditorBtn: 'Editora Scenariusza',
    settings: 'Nastôwë',
    tutorial: 'Ùczbòwnik',
    accountBtn: 'Kònto Blocks™',
    playAsGuest: 'Grôj jakò Gòsc',
    selectScenario: 'Wëbierzë Scenariusz',
    selectDifficulty: 'Równia Trudnoscë',
    selectCountry: 'Wëbierzë Państwò',
    searchCountry: 'Szëkôj państwa...',
    yourCountry: 'Twój krôj',
    treasury: 'Skôrb',
    perTurn: 'm-c',
    army: 'Armia',
    manpowerLabel: 'Lëdzczé Rezerwë',
    research: 'Badérowanié',
    stability: 'Stabilnosc',
    population: 'Lëdztwò',
    turn: 'Miesąc',
    movementPts: 'PR',
    diplomacyPts: 'PD',
    techTreeBtn: 'Drzéwiã Tech.',
    spaceOceanBtn: 'Kòsmòs i Òcean',
    councilMarketBtn: 'Rada i Rënk',
    advisorTitle: 'Blocks™ Doradzca AI',
    advisorLabel: 'Takticzny Doradzca AI',
    advisorOn: 'Włączony',
    advisorOff: 'Wëłączony',
    allies: 'Sojusznicë',
    noAllies: 'Felënk sojuszów',
    topCountries: 'Ranking Mòcarstwów',
    selectedCountry: 'Wëbróné Państwò',
    areaLabel: 'Wiéchrzëzna',
    yourArmy: 'Twòja armia',
    enemyArmy: 'Całô armia państwa',
    exactArmyTotal: 'Razã we prowincëjach i marszu',
    tacticalWarningStronger: 'Bôczënk: Przecëwnik mô wiksze wòjskò!',
    tacticalBalanced: 'Sëłë są równé. Bùdëj fòrtë i bôcz na pògòdã.',
    tacticalAdvantage: 'Môsz przëwôgã wòjskòwą nad tim państwã.',
    declareWar: 'Wëpòwiedzë wòjnã',
    proposeAlliance: 'Sojusz',
    proposeNap: 'Pakt ò nieagresëji',
    proposeAccess: 'Przëstãp wòjskòwi',
    sendUltimatum: 'Ùltimatum',
    proposeVassal: 'Wasalizëj',
    sendSpy: 'Wëslë Szpiega (12 PLN)',
    blackOpsLabel: 'Krëjné Òperacje',
    sabotageOp: 'Sabòtaż Fòrtów',
    rebelsOp: 'Bùnt',
    stealTechOp: 'Kradzéż Tech. (+18 PB)',
    strategicStrikeOp: 'Rakietowi Atac',
    nuclearStrikeOp: 'Atomòwi Atac',
    sendAid25: 'Pòmòc 25%',
    sendAid50: 'Pòmòc 50%',
    proposePeace: 'Zapròpònëj pòkój',
    atWarBadge: 'WÒJNA',
    allyBadge: 'SOJUSZ',
    truceBadge: 'PÒKÓJ',
    napBadge: 'PAKT NIEAGRESËJI',
    accessBadge: 'PRZËSTÃP WÒJSK.',
    vassalBadge: 'TWÓJ WASAL',
    diplomacyTab: 'Diplòmacjô',
    encyclopediaTab: 'Wëdowiédzô',
    capitalLabel: 'Stolëca',
    capitalPrefix: 'Stolëca',
    governmentLabel: 'Ùstrój',
    curiositiesLabel: 'Cëkawòstczi ò państwie',
    provincePanel: 'Sprôwianié Prowincëją',
    buildingsTab: 'Bùdinczi',
    recruitTab: 'Rekrùtacjô',
    marchTab: 'Marsz',
    techTab: 'Tech.',
    arsenalTab: 'Arsenał',
    build: 'Zbùdëj',
    built: 'Zbùdowóné',
    recruit: 'Rekrùtëj',
    recruit10k: '+10 000',
    recruitMax: 'Maks.',
    assimilateBtn: 'Asymilëj prowincëjã (10 PLN)',
    assimilatedBadge: 'Zasymilowónô',
    unassimilatedWarn: 'Niespòkójnô (-25% dochòdu i òbronë)',
    winChanceLabel: 'Szansa na wëgróną',
    selectTargetProvince: 'Wëbierzë prowincëjã célową',
    seaLandingTag: 'Mòrsczi Desant',
    armySplit: 'Pòdzél òddzału',
    issueOrder: 'Wëznaczë Marsz na Żëwò',
    queuedOrders: 'Aktiwné marsze',
    cancelOrder: 'Òdrzëcë',
    treasuryModalTitle: 'Skôrb, Pòdatczi i Bank',
    budgetRevenues: 'Miesãczné przëchòdë',
    budgetExpenses: 'Miesãczné wëdatczi',
    taxIncomeLabel: 'Pòdatczi òbëwatelsczé',
    factoryPortIncomeLabel: 'Fabryki, Pòrtë i Farmë',
    tradeIncomeLabel: 'Handel i infrastruktura',
    vassalIncomeLabel: 'Danina òd wasalów',
    spaceIncomeLabel: 'Kòsmòs i Megaprójektë',
    armyUpkeepLabel: 'Ùtrzëmanié wòjska',
    buildingUpkeepLabel: 'Ùtrzëmanié bùdinków',
    loanPaymentsLabel: 'Ratë kredytów',
    vassalPaidLabel: 'Trybut lenny',
    netBalanceLabel: 'Bilans netto / m-c',
    taxRateLabel: 'Stôwka pòdatkòwô',
    taxWarningHigh: 'Wësoczé pòdatczi (>25%) òbniżają stabilnosc!',
    taxBonusLow: 'Nisczé pòdatczi (<=14%) wzmacniają stabilnosc.',
    stateBankTitle: 'Państwòwi Bank (Pòżëczczi)',
    takeLoan60: 'Pòżëczka +60 PLN (10 m-cy)',
    takeLoan150: 'Pòżëczka +150 PLN (10 m-cy)',
    repayLoan: 'Spłacë wczasni',
    noLoans: 'Felënk pòżëczków.',
    leaderboardBtn: 'Ranking & Krónika',
    leaderboardTitle: 'Swiatowi Ranking, Krónika, Timelapse i Galeriô Sław',
    powersTab: 'Mòcarstwa Swiata',
    chronicleTab: 'Krónika Wòjnë',
    hallOfFameTab: 'Galeriô Sław Blocks™',
    timelapseTab: 'Timelapse',
    sortPower: 'Mòc',
    sortArea: 'Wiéchrzëzna',
    sortArmy: 'Armia',
    sortTreasury: 'Skôrb',
    noChronicle: 'Felënk wpisów w Krónice.',
    noHallOfFame: 'Felënk rekordów Kònt Blocks™.',
    randomEventPrompt: 'Strategiczné Wëdarzenié',
    accountTitle: 'Kònto Blocks™',
    loginTab: 'Logòwanié',
    registerTab: 'Nowé Kònto',
    profileTab: 'Profil & Transfer',
    nickname: 'Miono gracza',
    emailOptional: 'E-mail (nieòbòwiązkòwi)',
    chooseAvatar: 'Wëbierzë ikònã awatara',
    securityMethodPrompt: 'Wëbierzë zabezpieczenié kònta:',
    passwordMethod: 'Hasło',
    pinMethod: 'Kòd PIN',
    passwordLabel: 'Twòje hasło',
    pinLabel: 'Kòd PIN (4 abò 6 cyfrów)',
    pinLengthHint: 'Ùżëj klawiaturë 0–9',
    createAccount: 'Zrobic Kònto Blocks™',
    loginAccount: 'Zalogùjë sã',
    logout: 'Wëlogùjë',
    exportAccount: 'Ekspòrtëj Kònto Blocks',
    importAccount: 'Wczëtôj Kònto',
    verifySecretToUnlock: 'Wpiszë Hasło abò Kòd PIN:',
    careerStats: 'Statysticzi Kònta Blocks™',
    turnsPlayed: 'Rozegróné miesące',
    warsWon: 'Wëgróné wòjnë',
    largestTerritory: 'Nôwikszô wiéchrzëzna',
    rankLabel: 'Ranga Blocks™',
    saveGame: 'Zapiszë Kampaniã',
    loadSlot: 'Wczëtôj',
    deleteSlot: 'Rëmi',
    noSaves: 'Felënk zapisónëch grów.',
    saveLabelPlaceholder: 'Miono zapisu',
    languageLabel: 'Jãzëk grë',
    performanceMode: 'Trib wëdajnoscë (Liquid Glass & Pògòda)',
    perfAuto: 'Aùto (Wëkrëj sprzãt)',
    perfUltra: 'Trib Ultra',
    perfMedium: 'Trib Strzédny',
    perfLight: 'Trib Letczi (Chùtczé Szkło)',
    soundLabel: 'Zwãk i efektë bitwë (Limiter 45%)',
    soundOn: 'Włączony',
    soundOff: 'Wëcëszony',
    backToMenu: 'Przédné Menu',
    close: 'Zamkni',
    victoryTitle: 'WIÔLGÔ WËGRÓNÔ!',
    victorySubtitle: 'Twòje państwò rządzë na całim swiece.',
    defeatTitle: 'PAŃSTWÒ PÒDBITÉ',
    defeatSubtitle: 'Stracëłes wszëtczé prowincëje.',
    playAgain: 'Nowô Kampania',
    tutorialTitle: 'Ùczbòwnik — Global Strategy: APEX EDITION (VERSION 4.0)',
    tutorialDisclaimer: 'Wëdowiédzô: Wszëtczé złoté (PLN) w grze są blós wirtualną walutą i nie są prôwdzëwima piniãdzama.',
    tutorialSteps: [
      { title: '1. Czas Rzeczëwisti i Pauza (1x–5x)', body: 'Rządzë wòjskã na żëwò z aktywną pauzą.' },
      { title: '2. Drzéwiã Technologii', body: 'Planëj badérowanié wòjskòwé, ekònomiczné i kòsmiczné.' },
      { title: '3. 16 Wòjewództw Pòlsczi i Zwiad Miast', body: 'Przëblëżë Pòlskã, òglądôj miasta i bôcz na sztormë.' },
      { title: '4. Aùto-Pilot i Klimat', body: 'Ùżëwôj Aùto-Pilota i gôdającégò doradzcë AI.' },
    ],
    tutorialNext: 'Dali',
    tutorialPrev: 'Nazôd',
    tutorialFinish: 'Zaczni Rządzëc',
    pauseNotificationHint: 'Najedzë mëszą, żebë zatrzëmac',
    researchMilitary: 'Doktrina Wòjskòwô (+8% sëłë)',
    researchEconomy: 'Ekònomiô (+10% dochòdu)',
    researchLogistics: 'Logistika (+1 PR, -8% kòsztu)',
    upgradeTech: 'Ùlepszë (25 PB)',
    uiModeLabel: 'Trib Interfejsu',
    uiVeryEasy: '🟢 Baro Letczi UI',
    uiEasy: '🔵 Letczi UI',
    uiHard: '🔴 Pro / Weteran UI',
    battlesLabel: 'Bitwë',
    cityReconBtn: 'Zwiad Miasta',
    grandStrategistMedalTitle: 'Hònorowi Medal Wiôldżégò Stratega',
    grandStrategistMedalDesc: 'Za nôwikszi takticzny talent!',
    timelapseReplayLabel: 'Pòwtórka Timelapse Kampanii',
    liveBattleLogLabel: 'Dziénnik Bitwów na Żëwò',
    noBattlesYet: 'Felënk zarejestrowónëch bitwów.',
    guidedRecruitTip: '➕ Rekrùtëj Wòjskò',
    guidedAttackTip: '⚔️ Klëkni Czerwòną Prowincëjã Wroga, żebë Atakòwac',
    fpsLimitLabel: 'Limit Klatków (Hz)',
    fpsUnlimited: 'Bez Limitu / Natywné Hz',
    globalWarmingLabel: 'Òceplenié',
    autoPilotActive: 'SMART AÙTO-PILOT WŁ.',
    autoPilotToggle: 'Smart Aùto-Pilot',
    voiceAiLabel: 'Gôdający Doradzca AI',
    voiceOn: 'Głos WŁ.',
    voiceOff: 'Głos WËŁ.',
    speakBriefing: 'Czëtôj Raport',
    mobileTabCommand: 'Państwò',
    mobileTabProvince: 'Prowincëjô',
    mobileTabWar: 'Wòjna',
    comebackProtocolTitle: 'Protokół Ratënkòwi',
    politicalView: 'Pòliticznô',
    thermalView: 'Termicznô °C',
    logisticsView: 'Kòlej i Handel',
    reconstructCityBtn: 'Òdbùdëj Miasto (14 PLN)',
    spySatelliteBtn: 'Satelita (22 PLN)',
    unitDesignerTitle: 'Kùżniô Jednostków',
    straitBlockadeTitle: 'Blokada Cesnin',
    autoPilotAirliftingCountdown: 'Smart Aùto-Pilot: Przerzët na Frónt ({s}s)',
    climateAttritionWarn: 'Ekstremalny Klimat — Zbadôj Logistikã 1',
    peacefulStartLabel: 'Spòkójny Start i Zgòda na Wòjnë',
    peacefulStartDesc: 'Zatrzymôj wòjnë na pòczątkù i pitôj ò zgòdã przed atakã AI.',
    customNationBtn: 'Swòjé Państwò',
    aiAggressivenessLabel: 'Agresëwnosc AI',
    continueEternalEmpireBtn: 'GRAJ DALI (WIECZNÉ IMPERIUM)',
    peaceConferenceBtn: 'Kònferencëjô Pòkòjowô',
    graffitiMissionBtn: 'Tajné Graffiti',
    mapModeReligions: 'Religie',
    mapModeCultures: 'Kùlturë',
    mapModeEconomy: 'Ekònomiô',
    mapModeResources: 'Sërowce',
    mapModeDiplomacy: 'Diplòmacjô',
    commanderXpLabel: 'XP Dówódcë',
    worldConquestProgressLabel: 'Pòdbój Swiata',
    developProvinceBtn: 'Rozwini',
    plunderProvinceBtn: 'Złëp',
    missionariesBtn: 'Misjonarze',
  },
};
