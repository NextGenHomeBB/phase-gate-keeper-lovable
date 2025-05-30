
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'nl' | 'en';

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
    
    // Auth
    'auth.login': 'Inloggen',
    
    // Projects
    'project.updated': 'Project bijgewerkt',
    'project.updateSuccess': 'Het project is succesvol bijgewerkt',
    'project.updateError': 'Kon project niet bijwerken',
    'project.reorderError': 'Kon project volgorde niet bijwerken',
    'project.adminOnly': 'Alleen administrators kunnen projecten toevoegen',
    'project.newProject': 'Nieuw Project',
    'project.newProjectDescription': 'Beschrijving van het nieuwe project',
    'project.added': 'Project toegevoegd',
    'project.addSuccess': 'Het nieuwe project is succesvol aangemaakt',
    'project.addError': 'Kon project niet toevoegen',
    
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
    
    // Auth
    'auth.login': 'Login',
    
    // Projects
    'project.updated': 'Project updated',
    'project.updateSuccess': 'The project has been successfully updated',
    'project.updateError': 'Could not update project',
    'project.reorderError': 'Could not update project order',
    'project.adminOnly': 'Only administrators can add projects',
    'project.newProject': 'New Project',
    'project.newProjectDescription': 'Description of the new project',
    'project.added': 'Project added',
    'project.addSuccess': 'The new project has been successfully created',
    'project.addError': 'Could not add project',
    
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
