import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { getStunningGreeting } from '@/lib/getGreeting';

export const DashboardHeader = ({ name, onCreateBoard, className = '' }) => {
  const [greetingData, setGreetingData] = useState(() =>
    getStunningGreeting(name),
  );

  useEffect(() => {
    setGreetingData(getStunningGreeting(name));
  }, [name]);

  const { greeting, subtext, badgeText, Icon } = greetingData;

  return (
    <header
      className={`flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="space-y-1.5">
        {/* Minimal Badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {Icon && <Icon className="size-3.5" />}
            {badgeText}
          </span>
        </div>

        {/* Clean Header Title */}
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {greeting}
        </h1>

        {/* Dynamic Subtext */}
        <p className="text-sm text-muted-foreground max-w-2xl">{subtext}</p>
      </div>

      {/* Action Button */}
      {onCreateBoard && (
        <Button
          className="w-full sm:w-auto gap-2 shrink-0"
          onClick={onCreateBoard}
        >
          <Plus className="size-4" />
          Create Board
        </Button>
      )}
    </header>
  );
};

export default DashboardHeader;
