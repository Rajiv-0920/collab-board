import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, Check, Clock, LayoutGrid, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/formatDate';
import { cn } from '@/lib/utils';
import { avatarInitials } from '@/lib/avatarInitials';

const InvitationCard = ({
  invitation,
  isProcessing = false,
  onAccept,
  onDecline,
  className,
}) => {
  const avatar = invitation.invitedBy?.avatarUrl ?? '';
  const boardTitle = invitation.boardId?.title ?? 'Untitled board';
  const inviterName = invitation.invitedBy?.name ?? 'Someone';
  const expiry = formatDate(invitation.expiresAt);
  const isPending = invitation.status === 'pending';

  return (
    <Card
      className={cn(
        'group relative gap-0 overflow-hidden py-0 transition-all duration-200',
        'hover:shadow-md',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        className,
      )}
    >
      <Badge
        variant="secondary"
        className="absolute right-4 top-4 z-10 shrink-0 capitalize"
      >
        {invitation.role}
      </Badge>

      <CardHeader className="p-5 pb-0">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <LayoutGrid className="size-5" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-semibold leading-tight">
              {boardTitle}
            </h3>
            <p className="text-xs text-muted-foreground">Board invitation</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex items-center gap-3 p-5">
        <Avatar className="size-8">
          <AvatarImage src={avatar} alt={inviterName} />
          <AvatarFallback className="bg-muted text-xs font-medium">
            {avatarInitials(inviterName)}
          </AvatarFallback>
        </Avatar>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{inviterName}</span>{' '}
          wants to collaborate with you.
        </p>
      </CardContent>

      <Separator />

      <CardFooter className="items-center justify-between gap-2 p-4">
        {expiry ? (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3.5" />
                Expires {expiry}
              </TooltipTrigger>
              <TooltipContent>
                This invitation expires on {expiry}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <span className="text-xs text-muted-foreground">No expiration</span>
        )}

        {isPending ? (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={isProcessing}
              onClick={() => onDecline?.(invitation._id)}
              className="text-muted-foreground"
            >
              <X className="size-4" />
              Decline
            </Button>
            <Button
              size="sm"
              disabled={isProcessing}
              onClick={() => onAccept?.(invitation._id)}
              className="gap-1.5"
            >
              <Check className="size-4" />
              {isProcessing ? 'Processing…' : 'Accept'}
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (invitation.boardId?._id) {
                window.location.href = `/boards/${invitation.boardId._id}`;
              }
            }}
            className="gap-1.5"
          >
            Open Board
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default InvitationCard;
