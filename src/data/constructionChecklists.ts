/*
 * Construction Phase Gate Keeper – Standard Checklists
 * ----------------------------------------------------
 * Generated 2025-07-03 via ChatGPT
 *
 * Two checklists are exported:
 *  1. preworkChecklist  – Voorwerkcontrole vóór stuc- en tegelwerk
 *  2. postworkChecklist – Controle bij afmontage na stuc- en schilderwerk
 *
 * Each checklist is broken down into typed sections so the front-end can
 * map them into forms, accordions, drag-drop kanban columns, whatever.
 */

export interface ChecklistSection {
  /** Section title shown to the user */
  title: string;
  /** Ordered list of checklist lines */
  items: string[];
}

export interface SectionedChecklist {
  /** Unique key */
  id: string;
  /** Human readable checklist title */
  title: string;
  /** Section blocks */
  sections: ChecklistSection[];
}

/* ------------------------------------------------------------------ */
/* 1. Voorwerkcontrole vóór Stuc- en Tegelwerk                        */
/* ------------------------------------------------------------------ */

export const preworkChecklist: SectionedChecklist = {
  id: "prework",
  title: "Voorwerkcontrole vóór Stuc- en Tegelwerk",
  sections: [
    {
      title: "Algemeen (woning breed)",
      items: [
        "Is alle voorbedrading en leidingwerk gereed en gecontroleerd?",
        "Zijn alle leidingen, dozen en aansluitpunten waterpas en recht gemonteerd?",
        "Zijn alle doorvoeringen door vloeren en wanden brand- en geluiddicht?",
        "Zijn alle sparingen correct uitgeboord en stofvrij?",
        "Is aarding overal correct aangebracht en gecontroleerd?",
        "Zijn de posities van contactdozen en lichtpunten conform tekening en NEN1010?",
        "Is het ventilatiekanaal correct gepositioneerd en aangesloten?",
        "Zijn alle leidingen afgeperst en druk getest?",
        "Is de meterkast voorbereid met juiste invoeren en aansluitingen?",
        "Zijn UTP leidingen correct aangelegd en afgetest?",
        "Zijn leidingen voorzien van de juiste kleurcodering en labels?",
        "Is deurbeltrafo gemonteerd in meterkast en bedrading correct?",
        "Zijn alle wandcontactdozen op 300 mm boven afgewerkte vloer (bovenkant inbouwdoos)?",
        "Zijn lichtschakelaars op 1 050 mm hart boven afgewerkte vloer?",
        "Is het loze leidingwerk in wanden correct aangebracht en afgewerkt?",
        "Zijn alle stopcontacten in vochtige ruimten spatwaterdicht type IP44?",
        "Is vloerverwarming getest en aangesloten?",
        "Zijn sleuven dichtgezet met mortel en volledig vlak?",
        "Zijn de bouwtekeningen en installatieschema's ter plekke aanwezig?"
      ]
    },
    {
      title: "Hal / Entree",
      items: [
        "Positie deurbel en intercom bevestigd?",
        "Lichtpunt plafond correct uitgelijnd?",
        "Wandcontactdozen op juiste hoogte (300 mm)?",
        "Thermostaatkabel aanwezig (hart 1 500 mm)?",
        "Netwerk- of UTP-aansluiting bij meterkast?",
        "Ventilatie in- en afvoer voorzien?",
        "Aarding meterkast en stalen kozijnen aanwezig?"
      ]
    },
    {
      title: "Woonkamer",
      items: [
        "Lichtpunten plafond op positie en waterpas?",
        "Wandcontactdozen 300 mm boven vloer?",
        "Dubbele contactdoos per hoek aanwezig?",
        "Netwerkaansluiting per TV-plek (meestal op 450 mm)?",
        "Loze leiding naar plafond (bijv. voor rookmelder)?",
        "Schakelmateriaal 1 050 mm boven vloer, recht en waterpas?",
        "Ventilatievoorziening aanwezig?",
        "UTP en CAI buizen afgemonteerd tot meterkast?",
        "Aarding bij metalen kozijnen?"
      ]
    },
    {
      title: "Keuken",
      items: [
        "Warm- en koudwaterleidingen afgedopt en druk getest? (hoogte warm: 1 150 mm, koud: 1 150 mm)",
        "Afvoer Ø40 mm op 110 mm hart boven vloer?",
        "Wandcontactdozen kookplaat (1 070 mm), koelkast (1 850 mm) en vaatwasser (600 mm)?",
        "Perilex aansluiting kookgroep (1 050 mm)?",
        "Schakelaar afzuigkap (1 800 mm)?",
        "Extra loze leiding naar meterkast?",
        "Ventilatiekanaal voor afzuiging correct aangelegd?",
        "Koof voor afzuigkanaal ingemeten?",
        "Aarding waterleiding gecontroleerd?"
      ]
    },
    {
      title: "Badkamer",
      items: [
        "Warm- en koudwaterleidingen naar wastafel (1 100 mm), douche (1 100 mm en 2 100 mm) en toilet (1 150 mm)",
        "Afvoeren Ø40 mm wastafel, Ø50 mm douche, Ø90 mm toilet",
        "WCD op IP44 en 1 050 mm hoogte",
        "Schakelaar buiten ruimte of pulsschakelaar?",
        "Lichtpunt plafond, waterpas en uitgelijnd",
        "Douchekraan hart 1 100 mm boven vloer",
        "Doucheput aangesloten en waterpas",
        "Ventilatiekanaal 125 mm aanwezig?",
        "Thermostaatdraad naar spiegelverwarming?",
        "Aarding metalen leidingen"
      ]
    },
    {
      title: "Toilet",
      items: [
        "Afvoer Ø90 mm toilet op 180 mm vanaf achterwand",
        "Koudwaterleiding 1 150 mm hart",
        "WCD voor fontein op 1 050 mm",
        "Schakelaar buiten ruimte",
        "Lichtpunt plafond",
        "Ventilatiekanaal aanwezig?"
      ]
    },
    {
      title: "Slaapkamers",
      items: [
        "Lichtpunt plafond waterpas",
        "Schakelmateriaal 1 050 mm",
        "WCD op 300 mm, minimaal 2 per ruimte",
        "Netwerkaansluiting 450 mm",
        "UTP leiding naar meterkast",
        "Loze leiding naar plafond voor rookmelder"
      ]
    },
    {
      title: "Berging / Meterkast",
      items: [
        "Aarding waterleiding",
        "Deurbeltrafo bevestigd",
        "WCD op 1 050 mm",
        "Netwerk switch punt",
        "Aansluiting vloerverwarming",
        "Watermeter en keerklep geplaatst",
        "Afvoer cv overstort",
        "Ventilatie rooster"
      ]
    }
  ]
};

/* ------------------------------------------------------------------ */
/* 2. Afmontage na Stuc- en Schilderwerk                              */
/* ------------------------------------------------------------------ */

export const postworkChecklist: SectionedChecklist = {
  id: "postwork",
  title: "Controle bij afmontage na stuc- en schilderwerk",
  sections: [
    {
      title: "Algemeen",
      items: [
        "Controle of alle dozen vrij zijn van stuc",
        "Water- en elektra aansluitingen bereikbaar",
        "Afvoeren open en niet verstopt",
        "Leidingen vrij van cement/mortel resten",
        "Aarding zichtbaar en aangesloten",
        "Ventilatie openingen vrij",
        "Alle sleuven correct hersteld en glad",
        "Afdoppluggen verwijderd"
      ]
    },
    {
      title: "Hal / Entree",
      items: [
        "Deurbel werkend",
        "Intercom aangesloten",
        "Lichtschakelaar functioneel",
        "WCD getest"
      ]
    },
    {
      title: "Woonkamer",
      items: [
        "Wandcontactdozen gemonteerd",
        "Netwerkcontacten afgemonteerd",
        "Lichtpunten bevestigd en werkend",
        "Schakelaars aangesloten",
        "Rookmelder geplaatst",
        "Afdekramen recht en vlak"
      ]
    },
    {
      title: "Keuken",
      items: [
        "Kookplaat aangesloten (perilex)",
        "Afzuigkap functioneel",
        "Waterkranen gemonteerd en getest",
        "Afvoer gecontroleerd op lekkage",
        "Stopcontacten getest",
        "Thermostaat aangesloten",
        "Ventilatie werkend"
      ]
    },
    {
      title: "Badkamer",
      items: [
        "Douchekraan gemonteerd en getest",
        "Wastafelkraan en sifon aangesloten",
        "Toilet gemonteerd en werkend",
        "Ventilatie gecontroleerd",
        "Spiegelverlichting aangesloten",
        "IP44 stopcontact gemonteerd en getest"
      ]
    },
    {
      title: "Toilet",
      items: [
        "Fonteinkraan aangesloten",
        "Afvoer functioneert",
        "WCD gemonteerd",
        "Lichtschakelaar werkend"
      ]
    },
    {
      title: "Slaapkamers",
      items: [
        "Stopcontacten gemonteerd",
        "Netwerkaansluiting getest",
        "Lichtpunt en schakelaar functioneel",
        "Rookmelder bevestigd"
      ]
    },
    {
      title: "Berging / Meterkast",
      items: [
        "Aarding gemonteerd",
        "WCD's aangesloten",
        "Deurbeltrafo werkend",
        "Ventilatieroosters open",
        "UTP switch actief",
        "Cv-afvoer aangesloten"
      ]
    }
  ]
};

/* ------------------------------------------------------------------ */
/* Convenience re-export                                              */
/* ------------------------------------------------------------------ */

export const constructionChecklists = {
  prework: preworkChecklist,
  postwork: postworkChecklist
};

// Utility function to convert sectioned checklist to flat checklist format
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