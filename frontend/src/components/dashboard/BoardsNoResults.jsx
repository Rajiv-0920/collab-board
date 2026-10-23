import { SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BoardsNoResults = ({ query, onClear }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-14 text-center">
    <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-muted">
      <SearchX className="size-5 text-muted-foreground" aria-hidden="true" />
    </div>

    <h3 className="text-sm font-medium">No matching boards</h3>

    <p className="mt-1 max-w-xs text-sm text-muted-foreground">
      Nothing matches &quot;{query}&quot;. Try a different word or clear the
      search.
    </p>

    <Button variant="outline" size="sm" className="mt-5" onClick={onClear}>
      Clear search
    </Button>
  </div>
);

export default BoardsNoResults;
