import { Button } from '../ui/button';
import { Plus } from 'lucide-react';

import { getGreeting } from '../../library/getGreeting';

const DashboardHeader = ({ name, onCreateBoard }) => {
  const greeting = getGreeting();

  return (
    <header className="flex w-full flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
          Overview
        </span>

        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {greeting}, {name}
        </h1>

        <p className="text-sm leading-6 text-muted-foreground sm:text-base">
          Manage projects, collaborate with your team, and keep work moving.
        </p>
      </div>

      <Button className="w-full gap-2 sm:w-auto" onClick={onCreateBoard}>
        <Plus className="size-4" /> Create Board
      </Button>
    </header>
  );
};

export default DashboardHeader;
