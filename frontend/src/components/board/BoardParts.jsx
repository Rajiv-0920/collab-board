import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { ROLE_META, getInitials } from './boardUtils';

/* One user's avatar with initials fallback */
export const UserAvatar = ({ user, className }) => (
  <Avatar className={cn('size-7', className)} title={user?.name}>
    <AvatarImage src={user?.avatarUrl || undefined} alt={user?.name ?? ''} />
    <AvatarFallback className="text-[10px] font-medium">
      {getInitials(user?.name)}
    </AvatarFallback>
  </Avatar>
);

/* Overlapping avatars with a "+N" chip for the rest */
export const AvatarStack = ({ users = [], max = 3, className }) => {
  const shown = users.slice(0, max);
  const extra = users.length - shown.length;

  return (
    <div className={cn('flex items-center -space-x-2', className)}>
      {shown.map((user) => (
        <UserAvatar
          key={user._id}
          user={user}
          className="size-6 ring-2 ring-background"
        />
      ))}
      {extra > 0 && (
        <span className="relative flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-medium ring-2 ring-background">
          +{extra}
        </span>
      )}
    </div>
  );
};

export const RoleBadge = ({ role, className }) => {
  const meta = ROLE_META[role] ?? ROLE_META.viewer;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        meta.className,
        className,
      )}
    >
      {meta.label}
    </span>
  );
};
