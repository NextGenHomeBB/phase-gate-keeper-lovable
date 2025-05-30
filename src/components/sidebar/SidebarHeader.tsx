
import { SidebarHeader, SidebarTrigger } from "@/components/ui/sidebar";
import { useLanguage } from "@/contexts/LanguageContext";

export function AppSidebarHeader() {
  const { t } = useLanguage();

  return (
    <SidebarHeader className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-blue-900">{t('navigation.projectManagement')}</h2>
        <SidebarTrigger className="h-8 w-8 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-md transition-colors duration-200" />
      </div>
    </SidebarHeader>
  );
}
