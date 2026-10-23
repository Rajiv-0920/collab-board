import { Card } from '@/components/ui/card';

const StatCard = ({ title, value, description, icon: Icon }) => {
  return (
    <Card className="gap-1 p-4 shadow-none transition-colors hover:border-primary/30">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {title}
        </span>
        <Icon className="size-3.5 text-muted-foreground/70" />
      </div>

      <div className="text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </div>

      {description && (
        <p className="truncate text-xs text-muted-foreground">{description}</p>
      )}
    </Card>
  );
};

export default StatCard;
