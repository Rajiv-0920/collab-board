import { LayoutGrid, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

const BoardsEmptyState = ({ onCreate }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-16 text-center">
    <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-muted">
      <LayoutGrid className="size-5 text-muted-foreground" aria-hidden="true" />
    </div>

    <h3 className="text-sm font-medium">No boards yet</h3>

    <p className="mt-1 max-w-xs text-sm text-muted-foreground">
      Create your first board to organize tasks and collaborate with your team.
    </p>

    {onCreate && (
      <Button size="sm" className="mt-5" onClick={onCreate}>
        <Plus className="mr-1.5 size-4" />
        New board
      </Button>
    )}
  </div>
);

export default BoardsEmptyState;
