import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  ArrowUpDown,
  LayoutGrid,
  List,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
import BoardPagination from './BoardPagination';
import FilterDropdown from './FilterDropdown';

import { getId } from '@/lib/ids';

const VIEW_STORAGE_KEY = 'boards:view';
const SEARCH_DEBOUNCE_MS = 400;

const TYPE_OPTIONS = [
  { value: 'all', label: 'All Boards' },
  { value: 'mine', label: 'My Boards' },
  { value: 'shared', label: 'Shared with Me' },
];

const SORT_OPTIONS = [
  { value: 'updated', label: 'Recently updated' },
  { value: 'created', label: 'Recently created' },
  { value: 'name_asc', label: 'Name (A–Z)' },
];

const ROLE_OPTIONS = [
  { value: '', label: 'All roles' },
  { value: 'owner', label: 'Owner' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Viewer' },
];

const VIEW_OPTIONS = [
  { value: 'grid', label: 'Grid view', icon: LayoutGrid },
  { value: 'list', label: 'List view', icon: List },
];

export const DEFAULT_FILTERS = {
  search: '',
  type: 'all',
  role: '',
  sort: 'updated',
};

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

const isBoardOwner = (board, user) =>
  Boolean(user) && getId(board.ownerId) === getId(user._id);

const isRoleDisabled = (role, type) =>
  (type === 'shared' && role === 'owner') ||
  (type === 'mine' && (role === 'editor' || role === 'viewer'));

const BoardsSection = ({
  boards = [],
  pagination,
  onPage,
  filters = DEFAULT_FILTERS,
  onFilterChange,
  onClearFilters,
  isLoading = false,
  isFetching = false,
  onEdit,
  onCreate,
}) => {
  const currentUser = useSelector(selectCurrentUser);
  const [view, setView] = useState(readStoredView);

  const [searchInput, setSearchInput] = useState(filters.search ?? '');

  const [boardToDelete, setBoardToDelete] = useState(null);
  const [deleteBoard, { isLoading: isBoardDeleting }] =
    useDeleteBoardMutation();

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = searchInput.trim();
      if (next !== (filters.search ?? '')) onFilterChange('search', next);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer); // cancel the old timer on every keystroke
  }, [searchInput, filters.search, onFilterChange]);

  /* ---- Filter handlers ---- */
  const handleTypeChange = (type) => {
    onFilterChange('type', type);
    // Drop a role that can't exist under the new type (e.g. Owner + Shared)
    if (isRoleDisabled(filters.role, type)) onFilterChange('role', '');
  };

  const clearSearch = () => {
    setSearchInput('');
    onFilterChange('search', '');
  };

  const clearAllFilters = () => {
    setSearchInput('');
    onClearFilters();
  };

  const hasActiveFilters =
    Boolean(filters.search) ||
    filters.type !== DEFAULT_FILTERS.type ||
    Boolean(filters.role) ||
    filters.sort !== DEFAULT_FILTERS.sort;

  /* ---- View + delete ---- */
  const changeView = (next) => {
    setView(next);
    storeView(next);
  };

  const canManageBoard = (board) => isBoardOwner(board, currentUser);
  const deletingBoardId = isBoardDeleting ? boardToDelete?._id : undefined;

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

  const hasBoards = boards.length > 0;
  const hasNoMatches = !isLoading && !hasBoards && hasActiveFilters;
  const matchCount = pagination?.totalBoards ?? boards.length;

  let content;
  if (hasNoMatches) {
    content = (
      <BoardsNoResults query={filters.search} onClear={clearAllFilters} />
    );
  } else if (view === 'list' && isLoading) {
    content = <RowSkeletons />;
  } else if (view === 'list' && !hasBoards) {
    content = <BoardsEmptyState onCreate={onCreate} />;
  } else if (view === 'list') {
    content = (
      <ul className="divide-y overflow-hidden rounded-xl border bg-card">
        {boards.map((board) => (
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
        boards={boards}
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

      {/* Board type tabs: All / Mine / Shared */}
      <div
        role="group"
        aria-label="Board type"
        className="flex w-fit items-center gap-0.5 rounded-md border p-0.5"
      >
        {TYPE_OPTIONS.map(({ value, label }) => (
          <Button
            key={value}
            type="button"
            size="sm"
            variant={filters.type === value ? 'secondary' : 'ghost'}
            aria-pressed={filters.type === value}
            disabled={isLoading}
            onClick={() => handleTypeChange(value)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search (title) */}
        <div className="relative w-full sm:max-w-xs sm:flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="text"
            value={searchInput}
            // Only disabled on the very first load. Never disable it while
            // fetching, or the input loses focus after every search.
            disabled={isLoading}
            placeholder="Search boards by title or description..."
            aria-label="Search boards by title or description"
            className="px-9"
            onChange={(event) => setSearchInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape' && searchInput) {
                event.preventDefault();
                clearSearch();
              }
            }}
          />
          {searchInput && (
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
          {/* Role */}
          <FilterDropdown
            icon={ShieldCheck}
            ariaLabel="Filter by role"
            options={ROLE_OPTIONS}
            value={filters.role}
            disabled={isLoading}
            isOptionDisabled={(role) => isRoleDisabled(role, filters.type)}
            onChange={(role) => onFilterChange('role', role)}
          />

          {/* Sort */}
          <FilterDropdown
            icon={ArrowUpDown}
            ariaLabel="Sort boards"
            options={SORT_OPTIONS}
            value={filters.sort}
            disabled={isLoading}
            onChange={(sort) => onFilterChange('sort', sort)}
          />

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

      {/* Result count + clear (announced to screen readers) */}
      {hasActiveFilters && !isLoading && (
        <div className="flex items-center gap-3">
          <p
            aria-live="polite"
            className="text-xs tabular-nums text-muted-foreground"
          >
            {matchCount} {matchCount === 1 ? 'board' : 'boards'} found
          </p>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs"
            onClick={clearAllFilters}
          >
            Clear filters
          </Button>
        </div>
      )}

      {/* Dim the old results while the new ones load (no empty flash) */}
      <div
        className={cn(
          'transition-opacity',
          isFetching && !isLoading && 'pointer-events-none opacity-60',
        )}
      >
        {content}
      </div>

      {/* One delete dialog serves both grid and list view */}
      <DeleteBoardDialog
        open={Boolean(boardToDelete)}
        onOpenChange={handleDeleteOpenChange}
        board={boardToDelete}
        onConfirm={confirmDeleteBoard}
        isDeleting={isBoardDeleting}
      />

      <BoardPagination {...pagination} onPageChange={onPage} />
    </section>
  );
};

export default BoardsSection;
