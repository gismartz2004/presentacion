import { memo } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

interface DashboardSectionProps {
  children: React.ReactNode;
  className?: string;
}

// Layout principal del dashboard
function DashboardLayout({ children, className = "" }: DashboardLayoutProps) {
  return (
    <div className={`flex flex-col gap-6 py-6 px-4 lg:px-6 @container/main ${className}`}>
      {children}
    </div>
  );
}

// Sección para agrupar componentes relacionados
function DashboardSection({ children, className = "" }: DashboardSectionProps) {
  return (
    <section className={className}>
      {children}
    </section>
  );
}

// Header del dashboard
interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

function DashboardHeader({ title, subtitle, actions }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

export { 
  DashboardLayout as Layout, 
  DashboardSection as Section, 
  DashboardHeader as Header 
};

export default memo(DashboardLayout);