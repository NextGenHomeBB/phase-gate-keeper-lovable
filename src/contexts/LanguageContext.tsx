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
    'auth.signup': 'Registreren',
    'auth.welcome': 'Welkom',
    'auth.loginOrCreateAccount': 'Log in op je account of maak een nieuw account aan',
    'auth.email': 'Email',
    'auth.password': 'Wachtwoord',
    'auth.fullName': 'Volledige naam',
    'auth.emailPlaceholder': 'je@email.com',
    'auth.fullNamePlaceholder': 'Je volledige naam',
    'auth.loggingIn': 'Inloggen...',
    'auth.creatingAccount': 'Account aanmaken...',
    'auth.createAccount': 'Account aanmaken',
    'auth.orLoginWith': 'Of log in met',
    'auth.administratorLogin': 'Administrator Login',
    'auth.projectManagementTool': 'Je projectmanagement tool',
    'auth.loginFailed': 'Login mislukt',
    'auth.signupFailed': 'Registratie mislukt',
    'auth.loginSuccess': 'Succesvol ingelogd',
    'auth.welcomeBack': 'Welkom terug!',
    'auth.accountCreated': 'Account aangemaakt',
    'auth.canNowLogin': 'Je kunt nu inloggen met je gegevens',
    'auth.somethingWentWrong': 'Er is iets misgegaan',
    
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
    
    // ProjectDetail specific translations
    'projectDetail.allTasksCompleted': 'Alle taken voltooid!',
    'projectDetail.allTasksCompletedDesc': 'Alle taken in',
    'projectDetail.automaticallyMarked': 'zijn automatisch als voltooid gemarkeerd',
    'projectDetail.phaseNameUpdated': 'Fase naam bijgewerkt',
    'projectDetail.phaseRenamed': 'Fase hernoemd naar',
    'projectDetail.checklistItemUpdated': 'Checklist item bijgewerkt',
    'projectDetail.descriptionUpdated': 'De beschrijving is succesvol bijgewerkt',
    'projectDetail.phaseCompleted': 'Fase Voltooid!',
    'projectDetail.successfullyCompleted': 'is succesvol afgerond',
    'projectDetail.photoAdded': 'Foto toegevoegd',
    'projectDetail.photoAddedSuccess': 'De foto is succesvol toegevoegd aan het checklist item.',
    'projectDetail.projectFile': 'Project Bestand',
    'projectDetail.fileAdded': 'Bestand toegevoegd',
    'projectDetail.fileAddedSuccess': 'Het bestand is succesvol toegevoegd aan het project.',
    'projectDetail.fileUploadError': 'Kon bestand niet uploaden',
    'projectDetail.fileProcessError': 'Kon bestand niet verwerken',
    'projectDetail.fileRemoved': 'Bestand verwijderd',
    'projectDetail.fileRemovedSuccess': 'Het bestand is succesvol verwijderd.',
    'projectDetail.fileDeleteError': 'Kon bestand niet verwijderen',
    'projectDetail.photoRemoved': 'Foto verwijderd',
    'projectDetail.photoRemovedSuccess': 'De foto is succesvol verwijderd.',
    'projectDetail.backToPhases': 'Terug naar Fases',
    'projectDetail.backToDashboard': 'Terug naar Dashboard',
    'projectDetail.editProjectName': 'Project naam bewerken',
    'projectDetail.projectDescriptionPlaceholder': 'Project beschrijving...',
    'projectDetail.noDescription': 'Geen beschrijving',
    'projectDetail.completedPhases': 'Voltooide fases',
    'projectDetail.completed': 'voltooid',
    'projectDetail.files': 'Bestanden',
    'projectDetail.filesLoading': 'Bestanden laden...',
    'projectDetail.pdfPreview': 'PDF voorvertoning',
    'projectDetail.openFile': 'Bestand openen',
    'projectDetail.removeFile': 'Bestand verwijderen',
    'projectDetail.noFilesAdded': 'Nog geen bestanden toegevoegd',
    'projectDetail.noTeamMembers': 'Geen teamleden toegewezen',
    'projectDetail.projectPhotoGallery': 'Project Foto Galerij',
    'projectDetail.projectPhases': 'Project Fases',
    'projectDetail.completeAllTasks': 'Alle taken voltooien',
    'projectDetail.active': 'Actief',
    'projectDetail.available': 'Beschikbaar',
    'projectDetail.tasksCompleted': 'taken voltooid',
    'projectDetail.checklist': 'Checklist',
    'projectDetail.inProgress': 'In Uitvoering',
    'projectDetail.checklistDescription': 'Vul alle verplichte items in om naar de volgende fase te gaan. Dubbelklik op een item om de beschrijving te bewerken.',
    'projectDetail.editTask': 'Taak bewerken',
    'projectDetail.required': 'Verplicht',
    'projectDetail.photo': 'Foto',
    'projectDetail.tip': 'Tip',
    'projectDetail.tipDescription': 'Alle verplichte items moeten worden voltooid voordat je naar de volgende fase kunt gaan. Je kunt foto\'s maken, afbeeldingen uploaden of PDF-bestanden toevoegen om je voortgang te documenteren. Dubbelklik op een checklist item om de beschrijving te bewerken.',
    'projectDetail.photosFor': 'Foto\'s voor',
    'projectDetail.openInNewTab': 'Openen in nieuw tabblad',
    'projectDetail.projectNameUpdated': 'Project naam bijgewerkt',
    'projectDetail.projectRenamed': 'Project hernoemd naar',
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
    'auth.signup': 'Sign Up',
    'auth.welcome': 'Welcome',
    'auth.loginOrCreateAccount': 'Log in to your account or create a new account',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.fullName': 'Full name',
    'auth.emailPlaceholder': 'your@email.com',
    'auth.fullNamePlaceholder': 'Your full name',
    'auth.loggingIn': 'Logging in...',
    'auth.creatingAccount': 'Creating account...',
    'auth.createAccount': 'Create Account',
    'auth.orLoginWith': 'Or log in with',
    'auth.administratorLogin': 'Administrator Login',
    'auth.projectManagementTool': 'Your project management tool',
    'auth.loginFailed': 'Login failed',
    'auth.signupFailed': 'Sign up failed',
    'auth.loginSuccess': 'Successfully logged in',
    'auth.welcomeBack': 'Welcome back!',
    'auth.accountCreated': 'Account created',
    'auth.canNowLogin': 'You can now log in with your credentials',
    'auth.somethingWentWrong': 'Something went wrong',
    
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
    
    // ProjectDetail specific translations
    'projectDetail.allTasksCompleted': 'All tasks completed!',
    'projectDetail.allTasksCompletedDesc': 'All tasks in',
    'projectDetail.automaticallyMarked': 'have been automatically marked as completed',
    'projectDetail.phaseNameUpdated': 'Phase name updated',
    'projectDetail.phaseRenamed': 'Phase renamed to',
    'projectDetail.checklistItemUpdated': 'Checklist item updated',
    'projectDetail.descriptionUpdated': 'The description has been successfully updated',
    'projectDetail.phaseCompleted': 'Phase Completed!',
    'projectDetail.successfullyCompleted': 'has been successfully completed',
    'projectDetail.photoAdded': 'Photo added',
    'projectDetail.photoAddedSuccess': 'The photo has been successfully added to the checklist item.',
    'projectDetail.projectFile': 'Project File',
    'projectDetail.fileAdded': 'File added',
    'projectDetail.fileAddedSuccess': 'The file has been successfully added to the project.',
    'projectDetail.fileUploadError': 'Could not upload file',
    'projectDetail.fileProcessError': 'Could not process file',
    'projectDetail.fileRemoved': 'File removed',
    'projectDetail.fileRemovedSuccess': 'The file has been successfully removed.',
    'projectDetail.fileDeleteError': 'Could not delete file',
    'projectDetail.photoRemoved': 'Photo removed',
    'projectDetail.photoRemovedSuccess': 'The photo has been successfully removed.',
    'projectDetail.backToPhases': 'Back to Phases',
    'projectDetail.backToDashboard': 'Back to Dashboard',
    'projectDetail.editProjectName': 'Edit project name',
    'projectDetail.projectDescriptionPlaceholder': 'Project description...',
    'projectDetail.noDescription': 'No description',
    'projectDetail.completedPhases': 'Completed phases',
    'projectDetail.completed': 'completed',
    'projectDetail.files': 'Files',
    'projectDetail.filesLoading': 'Loading files...',
    'projectDetail.pdfPreview': 'PDF preview',
    'projectDetail.openFile': 'Open file',
    'projectDetail.removeFile': 'Remove file',
    'projectDetail.noFilesAdded': 'No files added yet',
    'projectDetail.noTeamMembers': 'No team members assigned',
    'projectDetail.projectPhotoGallery': 'Project Photo Gallery',
    'projectDetail.projectPhases': 'Project Phases',
    'projectDetail.completeAllTasks': 'Complete all tasks',
    'projectDetail.active': 'Active',
    'projectDetail.available': 'Available',
    'projectDetail.tasksCompleted': 'tasks completed',
    'projectDetail.checklist': 'Checklist',
    'projectDetail.inProgress': 'In Progress',
    'projectDetail.checklistDescription': 'Complete all required items to proceed to the next phase. Double-click on an item to edit the description.',
    'projectDetail.editTask': 'Edit task',
    'projectDetail.required': 'Required',
    'projectDetail.photo': 'Photo',
    'projectDetail.tip': 'Tip',
    'projectDetail.tipDescription': 'All required items must be completed before you can proceed to the next phase. You can take photos, upload images, or add PDF files to document your progress. Double-click on a checklist item to edit the description.',
    'projectDetail.photosFor': 'Photos for',
    'projectDetail.openInNewTab': 'Open in new tab',
    'projectDetail.projectNameUpdated': 'Project name updated',
    'projectDetail.projectRenamed': 'Project renamed to',
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
    'auth.signup': 'Rejestracja',
    'auth.welcome': 'Witamy',
    'auth.loginOrCreateAccount': 'Zaloguj się na swoje konto lub utwórz nowe konto',
    'auth.email': 'Email',
    'auth.password': 'Hasło',
    'auth.fullName': 'Pełne imię i nazwisko',
    'auth.emailPlaceholder': 'twoj@email.com',
    'auth.fullNamePlaceholder': 'Twoje pełne imię i nazwisko',
    'auth.loggingIn': 'Logowanie...',
    'auth.creatingAccount': 'Tworzenie konta...',
    'auth.createAccount': 'Utwórz konto',
    'auth.orLoginWith': 'Lub zaloguj się za pomocą',
    'auth.administratorLogin': 'Logowanie Administratora',
    'auth.projectManagementTool': 'Twoje narzędzie do zarządzania projektami',
    'auth.loginFailed': 'Logowanie nie powiodło się',
    'auth.signupFailed': 'Rejestracja nie powiodła się',
    'auth.loginSuccess': 'Pomyślnie zalogowano',
    'auth.welcomeBack': 'Witaj ponownie!',
    'auth.accountCreated': 'Konto utworzone',
    'auth.canNowLogin': 'Możesz teraz zalogować się swoimi danymi',
    'auth.somethingWentWrong': 'Coś poszło nie tak',
    
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
    
    // ProjectDetail specific translations
    'projectDetail.allTasksCompleted': 'Wszystkie zadania ukończone!',
    'projectDetail.allTasksCompletedDesc': 'Wszystkie zadania w',
    'projectDetail.automaticallyMarked': 'zostały automatycznie oznaczone jako ukończone',
    'projectDetail.phaseNameUpdated': 'Nazwa fazy zaktualizowana',
    'projectDetail.phaseRenamed': 'Faza przemianowana na',
    'projectDetail.checklistItemUpdated': 'Element listy kontrolnej zaktualizowany',
    'projectDetail.descriptionUpdated': 'Opis został pomyślnie zaktualizowany',
    'projectDetail.phaseCompleted': 'Faza Ukończona!',
    'projectDetail.successfullyCompleted': 'została pomyślnie ukończona',
    'projectDetail.photoAdded': 'Zdjęcie dodane',
    'projectDetail.photoAddedSuccess': 'Zdjęcie zostało pomyślnie dodane do elementu listy kontrolnej.',
    'projectDetail.projectFile': 'Plik Projektu',
    'projectDetail.fileAdded': 'Plik dodany',
    'projectDetail.fileAddedSuccess': 'Plik został pomyślnie dodany do projektu.',
    'projectDetail.fileUploadError': 'Nie można przesłać pliku',
    'projectDetail.fileProcessError': 'Nie można przetworzyć pliku',
    'projectDetail.fileRemoved': 'Plik usunięty',
    'projectDetail.fileRemovedSuccess': 'Plik został pomyślnie usunięty.',
    'projectDetail.fileDeleteError': 'Nie można usunąć pliku',
    'projectDetail.photoRemoved': 'Zdjęcie usunięte',
    'projectDetail.photoRemovedSuccess': 'Zdjęcie zostało pomyślnie usunięte.',
    'projectDetail.backToPhases': 'Powrót do Faz',
    'projectDetail.backToDashboard': 'Powrót do Panelu',
    'projectDetail.editProjectName': 'Edytuj nazwę projektu',
    'projectDetail.projectDescriptionPlaceholder': 'Opis projektu...',
    'projectDetail.noDescription': 'Brak opisu',
    'projectDetail.completedPhases': 'Ukończone fazy',
    'projectDetail.completed': 'ukończono',
    'projectDetail.files': 'Pliki',
    'projectDetail.filesLoading': 'Ładowanie plików...',
    'projectDetail.pdfPreview': 'Podgląd PDF',
    'projectDetail.openFile': 'Otwórz plik',
    'projectDetail.removeFile': 'Usuń plik',
    'projectDetail.noFilesAdded': 'Nie dodano jeszcze plików',
    'projectDetail.noTeamMembers': 'Nie przypisano członków zespołu',
    'projectDetail.projectPhotoGallery': 'Galeria Zdjęć Projektu',
    'projectDetail.projectPhases': 'Fazy Projektu',
    'projectDetail.completeAllTasks': 'Ukończ wszystkie zadania',
    'projectDetail.active': 'Aktywna',
    'projectDetail.available': 'Dostępna',
    'projectDetail.tasksCompleted': 'zadań ukończonych',
    'projectDetail.checklist': 'Lista kontrolna',
    'projectDetail.inProgress': 'W trakcie',
    'projectDetail.checklistDescription': 'Wypełnij wszystkie wymagane elementy, aby przejść do następnej fazy. Kliknij dwukrotnie na element, aby edytować opis.',
    'projectDetail.editTask': 'Edytuj zadanie',
    'projectDetail.required': 'Wymagane',
    'projectDetail.photo': 'Zdjęcie',
    'projectDetail.tip': 'Wskazówka',
    'projectDetail.tipDescription': 'Wszystkie wymagane elementy muszą być ukończone przed przejściem do następnej fazy. Możesz robić zdjęcia, przesyłać obrazy lub dodawać pliki PDF, aby dokumentować swój postęp. Kliknij dwukrotnie na element listy kontrolnej, aby edytować opis.',
    'projectDetail.photosFor': 'Zdjęcia dla',
    'projectDetail.openInNewTab': 'Otwórz w nowej karcie',
    'projectDetail.projectNameUpdated': 'Nazwa projektu zaktualizowana',
    'projectDetail.projectRenamed': 'Projekt przemianowany na',
  },
};

const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get initial language from localStorage, default to 'nl'
  const getInitialLanguage = (): Language => {
    try {
      const saved = localStorage.getItem('language');
      return (saved as Language) || 'nl';
    } catch (error) {
      console.error('Error reading language from localStorage:', error);
      return 'nl';
    }
  };

  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    try {
      localStorage.setItem('language', language);
    } catch (error) {
      console.error('Error saving language to localStorage:', error);
    }
  }, [language]);

  const t = (key: string): string => {
    try {
      return translations[language]?.[key] || key;
    } catch (error) {
      console.error('Error getting translation:', error, { key, language });
      return key;
    }
  };

  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export { LanguageProvider, useLanguage };
