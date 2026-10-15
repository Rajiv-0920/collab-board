import { SearchX, MailCheck } from 'lucide-react';

const EmptyState = ({ activeTab, search, onClearSearch }) => {
  const hasSearch = !!search.trim();
  const Icon = hasSearch ? SearchX : MailCheck;

  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed px-6 text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <Icon className="size-6 text-muted-foreground" />
      </div>

      <h3 className="font-medium">
        {hasSearch ? 'No matching invitations' : `No ${activeTab} invitations`}
      </h3>

      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {hasSearch
          ? 'Try another board name or inviter.'
          : activeTab === 'pending'
            ? "You're all caught up. New invitations will appear here."
            : 'Invitations in this category will appear here.'}
      </p>

      {hasSearch && (
        <Button variant="ghost" className="mt-2" onClick={onClearSearch}>
          Clear search
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
