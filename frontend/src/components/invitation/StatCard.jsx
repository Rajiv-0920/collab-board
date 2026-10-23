import { Card, CardContent } from '@/components/ui/card';
import { Clock, Check, X, MailCheck } from 'lucide-react';

const statusConfig = {
  pending: { label: 'Pending', icon: Clock },
  accepted: { label: 'Accepted', icon: Check },
  declined: { label: 'Declined', icon: X },
  expired: { label: 'Expired', icon: MailCheck },
};

const StatCard = ({ status, value }) => {
  const { label, icon: Icon } = statusConfig[status];

  return (
    <Card className="shadow-none">
      <CardContent className="flex items-center justify-between p-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tabular-nums">{value}</p>
        </div>
        <div className="rounded-lg bg-muted p-2.5">
          <Icon className="size-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
