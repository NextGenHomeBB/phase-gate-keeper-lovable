
import { Home, BarChart3, Users, Settings, ClipboardList, Plus } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

interface NavigationMenuProps {
  currentView: 'dashboard' | 'team' | 'reports' | 'settings';
  onViewChange: (view: 'dashboard' | 'team' | 'reports' | 'settings') => void;
  onSelectProject: (project: any | null) => void;
}

export function NavigationMenu({ currentView, onViewChange, onSelectProject }: NavigationMenuProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleNavigationClick = (view: 'dashboard' | 'team' | 'reports' | 'settings') => {
    onViewChange(view);
    onSelectProject(null);
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t('navigation.navigation')}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={() => handleNavigationClick('dashboard')}
              className={currentView === 'dashboard' ? "bg-blue-100 text-blue-700" : ""}
            >
              <Home className="w-4 h-4" />
              <span>{t('navigation.dashboard')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => navigate('/easy-checklist')}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Quick Checklist</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => navigate('/checklist-creator')}
            >
              <Plus className="w-4 h-4" />
              <span>Checklist Creator</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => handleNavigationClick('reports')}
              className={currentView === 'reports' ? "bg-blue-100 text-blue-700" : ""}
            >
              <BarChart3 className="w-4 h-4" />
              <span>{t('navigation.reports')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => handleNavigationClick('team')}
              className={currentView === 'team' ? "bg-blue-100 text-blue-700" : ""}
            >
              <Users className="w-4 h-4" />
              <span>{t('navigation.team')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => handleNavigationClick('settings')}
              className={currentView === 'settings' ? "bg-blue-100 text-blue-700" : ""}
            >
              <Settings className="w-4 h-4" />
              <span>{t('navigation.settings')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
