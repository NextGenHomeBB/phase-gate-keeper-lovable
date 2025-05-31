
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'nl' | 'en' | 'pl';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionaries
const translations = {
  nl: {
    // Common
    'common.error': 'Fout',
    'common.loading': 'Laden...',
    'common.noAccess': 'Geen toegang',
    
    // Navigation
    'navigation.dashboard': 'Dashboard',
    'navigation.team': 'Team',
    'navigation.reports': 'Rapportages',
    'navigation.settings': 'Instellingen',
    'navigation.projectManagement': 'ProjectBeheer',
    'navigation.navigation': 'Navigatie',
    'navigation.projects': 'Projecten',
    'navigation.projectInfo': 'Project Info',
    
    // Auth
    'auth.login': 'Inloggen',
    
    // Projects
    'project.updated': 'Project bijgewerkt',
    'project.updateSuccess': 'Het project is succesvol bijgewerkt',
    'project.updateError': 'Kon project niet bijwerken',
    'project.loadError': 'Kon projecten niet laden',
    'project.reorderError': 'Kon project volgorde niet bijwerken',
    'project.adminOnly': 'Alleen administrators kunnen projecten toevoegen',
    'project.newProject': 'Nieuw Project',
    'project.newProjectDescription': 'Beschrijving van het nieuwe project',
    'project.added': 'Project toegevoegd',
    'project.addSuccess': 'Het nieuwe project is succesvol aangemaakt',
    'project.addError': 'Kon project niet toevoegen',
    'project.progress': 'Voortgang',
    'project.currentPhase': 'Huidige fase',
    'project.startDate': 'Startdatum',
    'project.teamMembers': 'Team leden',
    'project.phase': 'Fase',
    'project.phasesCompleted': 'fases voltooid',
    
    // Dashboard
    'dashboard.title': 'Project Dashboard',
    'dashboard.subtitle': 'Overzicht van al je actieve projecten',
    'dashboard.adminRights': 'Administrator rechten actief',
    'dashboard.newProject': 'Nieuw Project',
    'dashboard.noProjects': 'Geen projecten gevonden',
    'dashboard.noProjectsSubtitle': 'Begin met het toevoegen van je eerste project om te starten.',
    'dashboard.noProjectsUser': 'Er zijn nog geen projecten beschikbaar.',
    'dashboard.addFirstProject': 'Eerste Project Toevoegen',
    'dashboard.loading': 'Projecten laden...',
    'dashboard.projectNameUpdated': 'Project naam bijgewerkt',
    'dashboard.projectRenamed': 'Project hernoemd naar',
    'dashboard.projectDescriptionUpdated': 'Project beschrijving bijgewerkt',
    'dashboard.descriptionUpdateSuccess': 'De beschrijving is succesvol bijgewerkt',
    'dashboard.projectCopied': 'Project gekopieerd',
    'dashboard.projectCopySuccess': 'is succesvol aangemaakt',
    'dashboard.copyError': 'Kon project niet kopiëren',
    'dashboard.dragStarted': 'Drag gestart',
    'dashboard.dragInstruction': 'Sleep het project naar de gewenste positie',
    'dashboard.projectMoved': 'Project verplaatst',
    'dashboard.projectMovedSuccess': 'is verplaatst',
    'dashboard.progress': 'Voortgang',
    'dashboard.start': 'Start',
    'dashboard.teamMembers': 'teamleden',
    'dashboard.currentPhase': 'HUIDIGE FASE',
    
    // Team
    'team.management': 'Team Beheer',
    'team.description': 'Beheer je teamleden en hun rollen binnen projecten',
    'team.adminRights': 'Administrator rechten actief',
    'team.inviteUser': 'Gebruiker Uitnodigen',
    'team.inviteNew': 'Nieuwe gebruiker uitnodigen',
    'team.inviteDescription': 'Stuur een uitnodiging om een nieuw account aan te maken',
    'team.emailAddress': 'Email adres',
    'team.cancel': 'Annuleren',
    'team.sendInvite': 'Uitnodiging Versturen',
    'team.sending': 'Verzenden...',
    'team.newMember': 'Nieuw Teamlid',
    'team.members': 'Teamleden',
    'team.addMember': 'Teamlid Toevoegen',
    'team.loading': 'Teamleden laden...',
    'team.noMembers': 'Geen teamleden',
    'team.noMembersAdmin': 'Voeg je eerste teamlid toe om te beginnen met samenwerken.',
    'team.noMembersUser': 'Er zijn nog geen teamleden toegevoegd.',
    'team.addFirst': 'Eerste teamlid toevoegen',
    'team.name': 'Naam',
    'team.email': 'Email',
    'team.role': 'Rol',
    'team.phone': 'Telefoon',
    'team.startDate': 'Startdatum',
    'team.actions': 'Acties',
    'team.remove': 'Verwijder',
    'team.memberAdded': 'Teamlid toegevoegd',
    'team.memberAddedSuccess': 'is succesvol toegevoegd aan het team',
    'team.memberAddError': 'Kon teamlid niet toevoegen',
    'team.memberRemoved': 'Teamlid verwijderd',
    'team.memberRemovedSuccess': 'Het teamlid is succesvol verwijderd',
    'team.memberRemoveError': 'Kon teamlid niet verwijderen',
    'team.inviteSent': 'Uitnodiging verzonden',
    'team.inviteSentSuccess': 'Een uitnodiging is verzonden naar',
    'team.inviteError': 'Kon uitnodiging niet verzenden',
    'team.invalidEmail': 'Vul een geldig email adres in',
    'team.loadError': 'Kon teamleden niet laden',
    
    // Reports
    'reports.comingSoon': 'Rapportage functionaliteit komt binnenkort...',
    
    // Settings
    'settings.userInfo': 'Gebruiker Informatie',
    'settings.email': 'Email',
    'settings.name': 'Naam',
    'settings.role': 'Rol',
    'settings.accountCreated': 'Account aangemaakt',
    'settings.notSet': 'Niet ingesteld',
    
    // Language
    'language.dutch': 'Nederlands',
    'language.english': 'Engels',
    'language.polish': 'Pools',
    
    // Loading
    'loading.text': 'Laden...',
  },
  en: {
    // Common
    'common.error': 'Error',
    'common.loading': 'Loading...',
    'common.noAccess': 'No access',
    
    // Navigation
    'navigation.dashboard': 'Dashboard',
    'navigation.team': 'Team',
    'navigation.reports': 'Reports',
    'navigation.settings': 'Settings',
    'navigation.projectManagement': 'Project Management',
    'navigation.navigation': 'Navigation',
    'navigation.projects': 'Projects',
    'navigation.projectInfo': 'Project Info',
    
    // Auth
    'auth.login': 'Login',
    
    // Projects
    'project.updated': 'Project updated',
    'project.updateSuccess': 'The project has been successfully updated',
    'project.updateError': 'Could not update project',
    'project.loadError': 'Could not load projects',
    'project.reorderError': 'Could not update project order',
    'project.adminOnly': 'Only administrators can add projects',
    'project.newProject': 'New Project',
    'project.newProjectDescription': 'Description of the new project',
    'project.added': 'Project added',
    'project.addSuccess': 'The new project has been successfully created',
    'project.addError': 'Could not add project',
    'project.progress': 'Progress',
    'project.currentPhase': 'Current phase',
    'project.startDate': 'Start date',
    'project.teamMembers': 'Team members',
    'project.phase': 'Phase',
    'project.phasesCompleted': 'phases completed',
    
    // Dashboard
    'dashboard.title': 'Project Dashboard',
    'dashboard.subtitle': 'Overview of all your active projects',
    'dashboard.adminRights': 'Administrator rights active',
    'dashboard.newProject': 'New Project',
    'dashboard.noProjects': 'No projects found',
    'dashboard.noProjectsSubtitle': 'Start by adding your first project to get started.',
    'dashboard.noProjectsUser': 'No projects are available yet.',
    'dashboard.addFirstProject': 'Add First Project',
    'dashboard.loading': 'Loading projects...',
    'dashboard.projectNameUpdated': 'Project name updated',
    'dashboard.projectRenamed': 'Project renamed to',
    'dashboard.projectDescriptionUpdated': 'Project description updated',
    'dashboard.descriptionUpdateSuccess': 'The description has been successfully updated',
    'dashboard.projectCopied': 'Project copied',
    'dashboard.projectCopySuccess': 'has been successfully created',
    'dashboard.copyError': 'Could not copy project',
    'dashboard.dragStarted': 'Drag started',
    'dashboard.dragInstruction': 'Drag the project to the desired position',
    'dashboard.projectMoved': 'Project moved',
    'dashboard.projectMovedSuccess': 'has been moved',
    'dashboard.progress': 'Progress',
    'dashboard.start': 'Start',
    'dashboard.teamMembers': 'team members',
    'dashboard.currentPhase': 'CURRENT PHASE',
    
    // Team
    'team.management': 'Team Management',
    'team.description': 'Manage your team members and their roles within projects',
    'team.adminRights': 'Administrator rights active',
    'team.inviteUser': 'Invite User',
    'team.inviteNew': 'Invite new user',
    'team.inviteDescription': 'Send an invitation to create a new account',
    'team.emailAddress': 'Email address',
    'team.cancel': 'Cancel',
    'team.sendInvite': 'Send Invitation',
    'team.sending': 'Sending...',
    'team.newMember': 'New Team Member',
    'team.members': 'Team Members',
    'team.addMember': 'Add Team Member',
    'team.loading': 'Loading team members...',
    'team.noMembers': 'No team members',
    'team.noMembersAdmin': 'Add your first team member to start collaborating.',
    'team.noMembersUser': 'No team members have been added yet.',
    'team.addFirst': 'Add first team member',
    'team.name': 'Name',
    'team.email': 'Email',
    'team.role': 'Role',
    'team.phone': 'Phone',
    'team.startDate': 'Start date',
    'team.actions': 'Actions',
    'team.remove': 'Remove',
    'team.memberAdded': 'Team member added',
    'team.memberAddedSuccess': 'has been successfully added to the team',
    'team.memberAddError': 'Could not add team member',
    'team.memberRemoved': 'Team member removed',
    'team.memberRemovedSuccess': 'The team member has been successfully removed',
    'team.memberRemoveError': 'Could not remove team member',
    'team.inviteSent': 'Invitation sent',
    'team.inviteSentSuccess': 'An invitation has been sent to',
    'team.inviteError': 'Could not send invitation',
    'team.invalidEmail': 'Please enter a valid email address',
    'team.loadError': 'Could not load team members',
    
    // Reports
    'reports.comingSoon': 'Report functionality coming soon...',
    
    // Settings
    'settings.userInfo': 'User Information',
    'settings.email': 'Email',
    'settings.name': 'Name',
    'settings.role': 'Role',
    'settings.accountCreated': 'Account created',
    'settings.notSet': 'Not set',
    
    // Language
    'language.dutch': 'Dutch',
    'language.english': 'English',
    'language.polish': 'Polish',
    
    // Loading
    'loading.text': 'Loading...',
  },
  pl: {
    // Common
    'common.error': 'Błąd',
    'common.loading': 'Ładowanie...',
    'common.noAccess': 'Brak dostępu',
    
    // Navigation
    'navigation.dashboard': 'Panel główny',
    'navigation.team': 'Zespół',
    'navigation.reports': 'Raporty',
    'navigation.settings': 'Ustawienia',
    'navigation.projectManagement': 'Zarządzanie Projektami',
    'navigation.navigation': 'Nawigacja',
    'navigation.projects': 'Projekty',
    'navigation.projectInfo': 'Informacje o projekcie',
    
    // Auth
    'auth.login': 'Zaloguj się',
    
    // Projects
    'project.updated': 'Projekt zaktualizowany',
    'project.updateSuccess': 'Projekt został pomyślnie zaktualizowany',
    'project.updateError': 'Nie można zaktualizować projektu',
    'project.loadError': 'Nie można załadować projektów',
    'project.reorderError': 'Nie można zaktualizować kolejności projektów',
    'project.adminOnly': 'Tylko administratorzy mogą dodawać projekty',
    'project.newProject': 'Nowy Projekt',
    'project.newProjectDescription': 'Opis nowego projektu',
    'project.added': 'Projekt dodany',
    'project.addSuccess': 'Nowy projekt został pomyślnie utworzony',
    'project.addError': 'Nie można dodać projektu',
    'project.progress': 'Postęp',
    'project.currentPhase': 'Aktualna faza',
    'project.startDate': 'Data rozpoczęcia',
    'project.teamMembers': 'Członkowie zespołu',
    'project.phase': 'Faza',
    'project.phasesCompleted': 'faz ukończonych',
    
    // Dashboard
    'dashboard.title': 'Panel Projektów',
    'dashboard.subtitle': 'Przegląd wszystkich aktywnych projektów',
    'dashboard.adminRights': 'Uprawnienia administratora aktywne',
    'dashboard.newProject': 'Nowy Projekt',
    'dashboard.noProjects': 'Nie znaleziono projektów',
    'dashboard.noProjectsSubtitle': 'Zacznij od dodania pierwszego projektu.',
    'dashboard.noProjectsUser': 'Nie ma jeszcze dostępnych projektów.',
    'dashboard.addFirstProject': 'Dodaj Pierwszy Projekt',
    'dashboard.loading': 'Ładowanie projektów...',
    'dashboard.projectNameUpdated': 'Nazwa projektu zaktualizowana',
    'dashboard.projectRenamed': 'Projekt przemianowany na',
    'dashboard.projectDescriptionUpdated': 'Opis projektu zaktualizowany',
    'dashboard.descriptionUpdateSuccess': 'Opis został pomyślnie zaktualizowany',
    'dashboard.projectCopied': 'Projekt skopiowany',
    'dashboard.projectCopySuccess': 'został pomyślnie utworzony',
    'dashboard.copyError': 'Nie można skopiować projektu',
    'dashboard.dragStarted': 'Przeciąganie rozpoczęte',
    'dashboard.dragInstruction': 'Przeciągnij projekt do żądanej pozycji',
    'dashboard.projectMoved': 'Projekt przeniesiony',
    'dashboard.projectMovedSuccess': 'został przeniesiony',
    'dashboard.progress': 'Postęp',
    'dashboard.start': 'Start',
    'dashboard.teamMembers': 'członków zespołu',
    'dashboard.currentPhase': 'AKTUALNA FAZA',
    
    // Team
    'team.management': 'Zarządzanie Zespołem',
    'team.description': 'Zarządzaj członkami zespołu i ich rolami w projektach',
    'team.adminRights': 'Uprawnienia administratora aktywne',
    'team.inviteUser': 'Zaproś Użytkownika',
    'team.inviteNew': 'Zaproś nowego użytkownika',
    'team.inviteDescription': 'Wyślij zaproszenie do utworzenia nowego konta',
    'team.emailAddress': 'Adres email',
    'team.cancel': 'Anuluj',
    'team.sendInvite': 'Wyślij Zaproszenie',
    'team.sending': 'Wysyłanie...',
    'team.newMember': 'Nowy Członek Zespołu',
    'team.members': 'Członkowie Zespołu',
    'team.addMember': 'Dodaj Członka Zespołu',
    'team.loading': 'Ładowanie członków zespołu...',
    'team.noMembers': 'Brak członków zespołu',
    'team.noMembersAdmin': 'Dodaj pierwszego członka zespołu, aby rozpocząć współpracę.',
    'team.noMembersUser': 'Nie dodano jeszcze członków zespołu.',
    'team.addFirst': 'Dodaj pierwszego członka zespołu',
    'team.name': 'Nazwa',
    'team.email': 'Email',
    'team.role': 'Rola',
    'team.phone': 'Telefon',
    'team.startDate': 'Data rozpoczęcia',
    'team.actions': 'Akcje',
    'team.remove': 'Usuń',
    'team.memberAdded': 'Członek zespołu dodany',
    'team.memberAddedSuccess': 'został pomyślnie dodany do zespołu',
    'team.memberAddError': 'Nie można dodać członka zespołu',
    'team.memberRemoved': 'Członek zespołu usunięty',
    'team.memberRemovedSuccess': 'Członek zespołu został pomyślnie usunięty',
    'team.memberRemoveError': 'Nie można usunąć członka zespołu',
    'team.inviteSent': 'Zaproszenie wysłane',
    'team.inviteSentSuccess': 'Zaproszenie zostało wysłane do',
    'team.inviteError': 'Nie można wysłać zaproszenia',
    'team.invalidEmail': 'Wprowadź prawidłowy adres email',
    'team.loadError': 'Nie można załadować członków zespołu',
    
    // Reports
    'reports.comingSoon': 'Funkcjonalność raportów dostępna wkrótce...',
    
    // Settings
    'settings.userInfo': 'Informacje o Użytkowniku',
    'settings.email': 'Email',
    'settings.name': 'Nazwa',
    'settings.role': 'Rola',
    'settings.accountCreated': 'Konto utworzone',
    'settings.notSet': 'Nie ustawiono',
    
    // Language
    'language.dutch': 'Holenderski',
    'language.english': 'Angielski',
    'language.polish': 'Polski',
    
    // Loading
    'loading.text': 'Ładowanie...',
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'nl';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
