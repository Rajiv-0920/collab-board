import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const StatCard = ({ title, value, description, icon: Icon }) => {
  return (
    <Card className="transition-colors hover:border-primary/30">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>

        <div className="flex size-9 items-center justify-center rounded-md border bg-muted/50">
          <Icon className="size-4 text-muted-foreground" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-3xl font-semibold tracking-tight">{value}</div>

        <p className="mt-1.5 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default StatCard;
