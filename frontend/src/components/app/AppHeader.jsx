import { SidebarTrigger } from '@/components/ui/sidebar';
import { useLocation } from 'react-router';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

const AppHeader = () => {
  const location = useLocation();

  let title = location.pathname
    .replace(/^\//, '')
    .replace(/\//g, ' ')
    .replace(/^(\w)/, (_, c) => c.toUpperCase());

  if (location.pathname.startsWith('/boards/')) {
    title = 'Board';
  }

  return (
    <header className="flex h-14 items-center gap-3 border-b px-4">
      <SidebarTrigger />

      <div className="h-5 w-px bg-border" />

      <h1 className="text-sm font-medium">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden w-64 md:block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input placeholder="Search..." className="pl-9" />
        </div>

        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell />
        </Button>
      </div>
    </header>
  );
};

export default AppHeader;
