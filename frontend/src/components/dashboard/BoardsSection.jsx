import { useDeferredValue, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { ArrowUpDown, Check, LayoutGrid, List, Search, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';

import { selectCurrentUser } from '../../store/authSlice';
import { useDeleteBoardMutation } from '../../services/boardsApi';

import RowSkeletons from './skeleton/RowSkeletons';
import BoardGrid from './BoardGrid';
import BoardRow from './BoardRow';
import BoardsNoResults from './BoardsNoResults';
import BoardsEmptyState from './BoardsEmptyState';
import DeleteBoardDialog from './DeleteBoardDialog';

/* -------------------------------- Constants ------------------------------- */

const VIEW_STORAGE_KEY = 'boards:view';

const SORT_OPTIONS = [
  { value: 'updated', label: 'Recently updated' },
  { value: 'name', label: 'Name (A–Z)' },
];

const VIEW_OPTIONS = [
  { value: 'grid', label: 'Grid view', icon: LayoutGrid },
  { value: 'list', label: 'List view', icon: List },
];

const SORTERS = {
  updated: (a, b) =>
    (Date.parse(b.updatedAt) || 0) - (Date.parse(a.updatedAt) || 0),
  name: (a, b) =>
    (a.title ?? '').localeCompare(b.title ?? '', undefined, {
      sensitivity: 'base',
      numeric: true,
    }),
};

/* -------------------------------- Helpers --------------------------------- */

const readStoredView = () => {
  try {
    return localStorage.getItem(VIEW_STORAGE_KEY) === 'list' ? 'list' : 'grid';
  } catch {
    return 'grid';
  }
};

const storeView = (view) => {
  try {
    localStorage.setItem(VIEW_STORAGE_KEY, view);
  } catch {
    // Storage can be blocked; the view just won't be remembered.
  }
};

// Every word must appear in the title or the description.
const matchesTerms = (board, terms) => {
  if (terms.length === 0) return true;
  const haystack =
    `${board.title ?? ''} ${board.description ?? ''}`.toLowerCase();
  return terms.every((term) => haystack.includes(term));
};

// Works whether ownerId is a plain id string or a populated { _id } object.
const getId = (value) => String(value?._id ?? value ?? '');

const isBoardOwner = (board, user) =>
  Boolean(user) && getId(board.ownerId) === getId(user._id);

/* ------------------------------- Component -------------------------------- */

const BoardsSection = ({
  boards = [],
  isLoading = false,
  onEdit,
  onCreate,
}) => {
  const currentUser = useSelector(selectCurrentUser);

  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('updated');
  const [view, setView] = useState(readStoredView);

  const [boardToDelete, setBoardToDelete] = useState(null);
  const [deleteBoard, { isLoading: isBoardDeleting }] =
    useDeleteBoardMutation();

  const deferredQuery = useDeferredValue(query);
  const trimmedQuery = deferredQuery.trim();

  const visibleBoards = useMemo(() => {
    const terms = trimmedQuery.toLowerCase().split(/\s+/).filter(Boolean);
    return boards
      .filter((board) => matchesTerms(board, terms))
      .sort(SORTERS[sort]);
  }, [boards, trimmedQuery, sort]);

  const canManageBoard = (board) => isBoardOwner(board, currentUser);
  const deletingBoardId = isBoardDeleting ? boardToDelete?._id : undefined;

  const changeView = (next) => {
    setView(next);
    storeView(next);
  };

  const clearSearch = () => setQuery('');

  const handleDeleteOpenChange = (open) => {
    if (!open && !isBoardDeleting) setBoardToDelete(null);
  };

  const confirmDeleteBoard = async (board) => {
    try {
      await deleteBoard(board._id).unwrap();
      toast.add({
        type: 'success',
        description: 'Board deleted successfully!',
      });
      setBoardToDelete(null);
    } catch (error) {
      toast.add({
        type: 'error',
        description:
          error?.data?.message || 'Failed to delete board. Please try again.',
      });
    }
  };

  const currentSort = SORT_OPTIONS.find((option) => option.value === sort);
  const hasBoards = boards.length > 0;
  const isSearching = trimmedQuery.length > 0;
  const hasNoMatches = !isLoading && hasBoards && visibleBoards.length === 0;

  let content;
  if (hasNoMatches) {
    content = <BoardsNoResults query={trimmedQuery} onClear={clearSearch} />;
  } else if (view === 'list' && isLoading) {
    content = <RowSkeletons />;
  } else if (view === 'list' && !hasBoards) {
    content = <BoardsEmptyState onCreate={onCreate} />;
  } else if (view === 'list') {
    content = (
      <ul className="divide-y overflow-hidden rounded-xl border bg-card">
        {visibleBoards.map((board) => (
          <li
            key={board._id}
            className={cn(
              'transition-opacity',
              deletingBoardId === board._id && 'pointer-events-none opacity-50',
            )}
          >
            <BoardRow
              board={board}
              canManage={canManageBoard(board)}
              onEdit={onEdit}
              onDelete={setBoardToDelete}
            />
          </li>
        ))}
      </ul>
    );
  } else {
    content = (
      <BoardGrid
        boards={visibleBoards}
        isLoading={isLoading}
        onEdit={onEdit}
        onDelete={setBoardToDelete}
        onCreate={onCreate}
        canManageBoard={canManageBoard}
        deletingBoardId={deletingBoardId}
      />
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Your Boards</h2>
        <p className="text-sm text-muted-foreground">
          Your projects and shared workspaces.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs sm:flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="text"
            value={query}
            disabled={isLoading}
            placeholder="Search boards..."
            aria-label="Search boards by title or description"
            className="px-9"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape' && query) {
                event.preventDefault();
                clearSearch();
              }
            }}
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Clear search"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 size-7 -translate-y-1/2 text-muted-foreground"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  aria-label={`Sort boards: ${currentSort.label}`}
                />
              }
            >
              <ArrowUpDown className="size-4 sm:mr-2" aria-hidden="true" />
              <span className="hidden sm:inline">{currentSort.label}</span>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              {SORT_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSort(option.value)}
                >
                  {option.label}
                  <Check
                    className={cn(
                      'ml-auto size-4',
                      sort !== option.value && 'invisible',
                    )}
                    aria-hidden="true"
                  />
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View toggle */}
          <div
            role="group"
            aria-label="Board layout"
            className="flex items-center gap-0.5 rounded-md border p-0.5"
          >
            {VIEW_OPTIONS.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                type="button"
                variant={view === value ? 'secondary' : 'ghost'}
                size="icon"
                aria-label={label}
                aria-pressed={view === value}
                onClick={() => changeView(value)}
                className="size-8"
              >
                <Icon className="size-4" />
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Result count (announced to screen readers) */}
      {isSearching && !isLoading && (
        <p
          aria-live="polite"
          className="text-xs tabular-nums text-muted-foreground"
        >
          {visibleBoards.length} of {boards.length}{' '}
          {boards.length === 1 ? 'board' : 'boards'}
        </p>
      )}

      {content}

      {/* One delete dialog serves both grid and list view */}
      <DeleteBoardDialog
        open={Boolean(boardToDelete)}
        onOpenChange={handleDeleteOpenChange}
        board={boardToDelete}
        onConfirm={confirmDeleteBoard}
        isDeleting={isBoardDeleting}
      />
    </section>
  );
};

export default BoardsSection;
