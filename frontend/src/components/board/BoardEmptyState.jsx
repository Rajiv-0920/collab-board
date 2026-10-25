import { LayoutList } from 'lucide-react';

const BoardEmptyState = ({
  title = 'No lists yet',
  description = 'Create your first list to start organizing your work.',
  className = '',
}) => {
  return (
    <div
      className={`flex min-h-64 w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 px-6 py-10 text-center ${className}`}
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
        <LayoutList
          className="size-8 text-muted-foreground opacity-70"
          aria-hidden="true"
        />
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>

        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default BoardEmptyState;
