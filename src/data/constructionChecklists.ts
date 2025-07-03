/**
 * Standardised phase-gate checklists for NextGenHome projects.
 * Generated on 3 July 2025. Edit in one place and import wherever you need
 * checklist data (React UI, API seeders, Supabase tables, etc.).
 */

// ---------------------------------------------------------------------------
// 🔌 Types
// ---------------------------------------------------------------------------

export type PhaseCode = "voorwerk" | "afmontage";

export interface ChecklistItem {
  /** Descriptive yes/no question (Dutch). */
  description: string;
}

export interface ChecklistSection {
  /** Human-readable name, e.g. "Hal / Entree" */
  name: string;
  items: ChecklistItem[];
}

export interface PhaseChecklist {
  /** Stable identifier used in code & database */
  code: PhaseCode;
  /** Friendly title shown to the user */
  name: string;
  /** Sections, typically "Algemeen" + room-specific blocks */
  sections: ChecklistSection[];
}

// Legacy interface for backward compatibility
export interface SectionedChecklist {
  /** Unique key */
  id: string;
  /** Human readable checklist title */
  title: string;
  /** Section blocks */
  sections: {
    title: string;
    items: string[];
  }[];
}

// ---------------------------------------------------------------------------
// 📋 Data
// ---------------------------------------------------------------------------

export const CHECKLISTS: PhaseChecklist[] = [
  {
    code: "voorwerk",
    name: "Voorwerkcontrole vóór stucen en tegelen",
    sections: [
      {
        name: "Algemeen",
        items: [
          { description: "Is alle voorbedrading en leidingwerk gereed en gecontroleerd?" },
          { description: "Zijn alle leidingen, dozen en aansluitpunten waterpas en recht gemonteerd?" },
          { description: "Zijn alle doorvoeringen door vloeren en wanden brand- en geluiddicht?" },
          { description: "Zijn alle sparingen correct uitgeboord en stofvrij?" },
          { description: "Is aarding overal correct aangebracht en gecontroleerd?" },
          { description: "Zijn de posities van contactdozen en lichtpunten conform tekening en NEN1010?" },
          { description: "Is het ventilatiekanaal correct gepositioneerd en aangesloten?" },
          { description: "Zijn alle leidingen afgeperst en druk getest?" },
          { description: "Is de meterkast voorbereid met juiste invoeren en aansluitingen?" },
          { description: "Zijn UTP leidingen correct aangelegd en afgetest?" },
          { description: "Zijn leidingen voorzien van de juiste kleurcodering en labels?" },
          { description: "Is deurbeltrafo gemonteerd in meterkast en bedrading correct?" },
          { description: "Zijn alle wandcontactdozen op 300mm boven afgewerkte vloer (bovenkant inbouwdoos)?" },
          { description: "Zijn lichtschakelaars op 1050mm hart boven afgewerkte vloer?" },
          { description: "Is het loze leidingwerk in wanden correct aangebracht en afgewerkt?" },
          { description: "Zijn alle stopcontacten in vochtige ruimten spatwaterdicht type IP44?" },
          { description: "Is vloerverwarming getest en aangesloten?" },
          { description: "Zijn sleuven dichtgezet met mortel en volledig vlak?" },
          { description: "Zijn de bouwtekeningen en installatieschema's ter plekke aanwezig?" },
        ],
      },
      {
        name: "Hal / Entree",
        items: [
          { description: "Positie deurbel en intercom bevestigd?" },
          { description: "Lichtpunt plafond correct uitgelijnd?" },
          { description: "Wandcontactdozen op juiste hoogte (300mm)?" },
          { description: "Thermostaatkabel aanwezig (hart 1500mm)?" },
          { description: "Netwerk- of UTP-aansluiting bij meterkast?" },
          { description: "Ventilatie in- en afvoer voorzien?" },
          { description: "Aarding meterkast en stalen kozijnen aanwezig?" },
        ],
      },
      {
        name: "Woonkamer",
        items: [
          { description: "Lichtpunten plafond op positie en waterpas?" },
          { description: "Wandcontactdozen 300mm boven vloer?" },
          { description: "Dubbele contactdoos per hoek aanwezig?" },
          { description: "Netwerkaansluiting per TV-plek (meestal op 450mm)?" },
          { description: "Loze leiding naar plafond (bijv. voor rookmelder)?" },
          { description: "Schakelmateriaal 1050mm boven vloer, recht en waterpas?" },
          { description: "Ventilatievoorziening aanwezig?" },
          { description: "UTP en CAI buizen afgemonteerd tot meterkast?" },
          { description: "Aarding bij metalen kozijnen?" },
        ],
      },
      {
        name: "Keuken",
        items: [
          { description: "Warm- en koudwaterleidingen afgedopt en druk getest? (hoogte warm: 1150mm, koud: 1150mm)" },
          { description: "Afvoer Ø40mm op 110mm hart boven vloer?" },
          { description: "Wandcontactdozen kookplaat (1070mm), koelkast (1850mm) en vaatwasser (600mm)?" },
          { description: "Perilex aansluiting kookgroep (1050mm)?" },
          { description: "Schakelaar afzuigkap (1800mm)?" },
          { description: "Extra loze leiding naar meterkast?" },
          { description: "Ventilatiekanaal voor afzuiging correct aangelegd?" },
          { description: "Koof voor afzuigkanaal ingemeten?" },
          { description: "Aarding waterleiding gecontroleerd?" },
        ],
      },
      {
        name: "Badkamer",
        items: [
          { description: "Warm- en koudwater leidingen naar wastafel (1100mm), douche (1100mm en 2100mm) en toilet (1150mm)" },
          { description: "Afvoeren Ø40mm wastafel, Ø50mm douche, Ø90mm toilet" },
          { description: "WCD op IP44 en 1050mm hoogte" },
          { description: "Schakelaar buiten ruimte of pulsschakelaar?" },
          { description: "Lichtpunt plafond, waterpas en uitgelijnd" },
          { description: "Douchekraan hart 1100mm boven vloer" },
          { description: "Doucheput aangesloten en waterpas" },
          { description: "Ventilatiekanaal 125mm aanwezig?" },
          { description: "Thermostaatdraad naar spiegelverwarming?" },
          { description: "Aarding metalen leidingen" },
        ],
      },
      {
        name: "Toilet",
        items: [
          { description: "Afvoer Ø90mm toilet op 180mm vanaf achterwand" },
          { description: "Koudwaterleiding 1150mm hart" },
          { description: "WCD voor fontein op 1050mm" },
          { description: "Schakelaar buiten ruimte" },
          { description: "Lichtpunt plafond" },
          { description: "Ventilatiekanaal aanwezig?" },
        ],
      },
      {
        name: "Slaapkamers",
        items: [
          { description: "Lichtpunt plafond waterpas" },
          { description: "Schakelmateriaal 1050mm" },
          { description: "WCD op 300mm, minimaal 2 per ruimte" },
          { description: "Netwerkaansluiting 450mm" },
          { description: "UTP leiding naar meterkast" },
          { description: "Loze leiding naar plafond voor rookmelder" },
        ],
      },
      {
        name: "Berging / Meterkast",
        items: [
          { description: "Aarding waterleiding" },
          { description: "Deurbeltrafo bevestigd" },
          { description: "WCD op 1050mm" },
          { description: "Netwerk switch punt" },
          { description: "Aansluiting vloerverwarming" },
          { description: "Watermeter en keerklep geplaatst" },
          { description: "Afvoer cv overstort" },
          { description: "Ventilatie rooster" },
        ],
      },
    ],
  },

  {
    code: "afmontage",
    name: "Afmontage na stuc- en schilderwerk",
    sections: [
      {
        name: "Algemeen",
        items: [
          { description: "Controle of alle dozen vrij zijn van stuc" },
          { description: "Water- en elektra aansluitingen bereikbaar" },
          { description: "Afvoeren open en niet verstopt" },
          { description: "Leidingen vrij van cement/mortel resten" },
          { description: "Aarding zichtbaar en aangesloten" },
          { description: "Ventilatie openingen vrij" },
          { description: "Alle sleuven correct hersteld en glad" },
          { description: "Afdoppluggen verwijderd" },
        ],
      },
      {
        name: "Hal / Entree",
        items: [
          { description: "Deurbel werkend" },
          { description: "Intercom aangesloten" },
          { description: "Lichtschakelaar functioneel" },
          { description: "WCD getest" },
        ],
      },
      {
        name: "Woonkamer",
        items: [
          { description: "Wandcontactdozen gemonteerd" },
          { description: "Netwerkcontacten afgemonteerd" },
          { description: "Lichtpunten bevestigd en werkend" },
          { description: "Schakelaars aangesloten" },
          { description: "Rookmelder geplaatst" },
          { description: "Afdekramen recht en vlak" },
        ],
      },
      {
        name: "Keuken",
        items: [
          { description: "Kookplaat aangesloten (perilex)" },
          { description: "Afzuigkap functioneel" },
          { description: "Waterkranen gemonteerd en getest" },
          { description: "Afvoer gecontroleerd op lekkage" },
          { description: "Stopcontacten getest" },
          { description: "Thermostaat aangesloten" },
          { description: "Ventilatie werkend" },
        ],
      },
      {
        name: "Badkamer",
        items: [
          { description: "Douchekraan gemonteerd en getest" },
          { description: "Wastafelkraan en sifon aangesloten" },
          { description: "Toilet gemonteerd en werkend" },
          { description: "Ventilatie gecontroleerd" },
          { description: "Spiegelverlichting aangesloten" },
          { description: "IP44 stopcontact gemonteerd en getest" },
        ],
      },
      {
        name: "Toilet",
        items: [
          { description: "Fonteinkraan aangesloten" },
          { description: "Afvoer functioneert" },
          { description: "WCD gemonteerd" },
          { description: "Lichtschakelaar werkend" },
        ],
      },
      {
        name: "Slaapkamers",
        items: [
          { description: "Stopcontacten gemonteerd" },
          { description: "Netwerkaansluiting getest" },
          { description: "Lichtpunt en schakelaar functioneel" },
          { description: "Rookmelder bevestigd" },
        ],
      },
      {
        name: "Berging / Meterkast",
        items: [
          { description: "Aarding gemonteerd" },
          { description: "WCD's aangesloten" },
          { description: "Deurbeltrafo werkend" },
          { description: "Ventilatieroosters open" },
          { description: "UTP switch actief" },
          { description: "Cv-afvoer aangesloten" },
        ],
      },
    ],
  },
];

export default CHECKLISTS;

// Legacy exports for backward compatibility
export const preworkChecklist: SectionedChecklist = {
  id: CHECKLISTS[0].code,
  title: CHECKLISTS[0].name,
  sections: CHECKLISTS[0].sections.map(section => ({
    title: section.name,
    items: section.items.map(item => item.description)
  }))
};

export const postworkChecklist: SectionedChecklist = {
  id: CHECKLISTS[1].code,
  title: CHECKLISTS[1].name,
  sections: CHECKLISTS[1].sections.map(section => ({
    title: section.name,
    items: section.items.map(item => item.description)
  }))
};

export const constructionChecklists = {
  prework: preworkChecklist,
  postwork: postworkChecklist
};

// Utility functions
export function convertPhaseChecklistToFlat(phaseChecklist: PhaseChecklist, category: 'safety' | 'inspection' | 'material' | 'equipment' | 'quality' | 'environmental' = 'inspection'): import('../pages/ChecklistCreator').Checklist {
  const flatItems = phaseChecklist.sections.flatMap((section, sectionIndex) => 
    section.items.map((item, itemIndex) => ({
      id: `${phaseChecklist.code}-${sectionIndex}-${itemIndex}`,
      text: item.description,
      completed: false,
      notes: `Section: ${section.name}`
    }))
  );

  return {
    id: phaseChecklist.code,
    title: phaseChecklist.name,
    description: `Construction checklist with ${phaseChecklist.sections.length} sections`,
    category,
    trade: 'general',
    projectPhase: phaseChecklist.code === 'voorwerk' ? 'planning' : 'finishing',
    items: flatItems,
    tags: ['construction', 'dutch', phaseChecklist.code],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: '',
    isTemplate: true
  };
}

// Legacy function for backward compatibility
export function convertSectionedToFlat(sectionedChecklist: SectionedChecklist, category: 'safety' | 'inspection' | 'material' | 'equipment' | 'quality' | 'environmental' = 'inspection'): import('../pages/ChecklistCreator').Checklist {
  const flatItems = sectionedChecklist.sections.flatMap((section, sectionIndex) => 
    section.items.map((item, itemIndex) => ({
      id: `${sectionedChecklist.id}-${sectionIndex}-${itemIndex}`,
      text: item,
      completed: false,
      notes: `Section: ${section.title}`
    }))
  );

  return {
    id: sectionedChecklist.id,
    title: sectionedChecklist.title,
    description: `Construction checklist with ${sectionedChecklist.sections.length} sections`,
    category,
    trade: 'general',
    projectPhase: sectionedChecklist.id === 'prework' ? 'planning' : 'finishing',
    items: flatItems,
    tags: ['construction', 'dutch', sectionedChecklist.id],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: '',
    isTemplate: true
  };
}