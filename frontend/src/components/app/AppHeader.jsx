import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Search, Bell, X } from 'lucide-react';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useGetBoardsQuery } from '@/services/boardsApi';

const AppHeader = () => {
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const { data: boardsResponse, isLoading } = useGetBoardsQuery();

  const boards = Array.isArray(boardsResponse)
    ? boardsResponse
    : (boardsResponse?.boards ?? boardsResponse?.data ?? []);

  const query = search.trim().toLowerCase();

  const results = query
    ? boards.filter((board) => board.title?.toLowerCase().includes(query))
    : [];

  const boardId = location.pathname.split('/')[2];

  let title = location.pathname
    .replace(/^\//, '')
    .replace(/\//g, ' ')
    .replace(/^(\w)/, (_, c) => c.toUpperCase());

  return (
    <header className="flex h-14 items-center gap-3 border-b px-4">
      <SidebarTrigger />
      <div className="h-5 w-px bg-border" />

      <h1 className="truncate text-sm font-medium">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        {/* Board search */}
        <div className="relative hidden w-64 md:block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setSearch('');
                setSearchOpen(false);
              }
            }}
            placeholder="Search boards..."
            className="pl-9 pr-9"
            aria-label="Search boards"
          />

          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSearchOpen(false);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}

          {searchOpen && query && (
            <>
              <button
                type="button"
                aria-label="Close search results"
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setSearchOpen(false)}
              />

              <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border bg-popover p-2 shadow-lg">
                <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Search results
                </p>

                {isLoading ? (
                  <p className="p-3 text-sm text-muted-foreground">
                    Searching boards...
                  </p>
                ) : results.length > 0 ? (
                  results.slice(0, 8).map((board) => (
                    <Link
                      key={board._id}
                      to={`/boards/${board._id}`}
                      onClick={() => {
                        setSearch('');
                        setSearchOpen(false);
                      }}
                      className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
                    >
                      <span className="block truncate font-medium">
                        {board.title}
                      </span>
                      {board.description && (
                        <span className="block truncate text-xs text-muted-foreground">
                          {board.description}
                        </span>
                      )}
                    </Link>
                  ))
                ) : (
                  <p className="p-3 text-sm text-muted-foreground">
                    No boards found.
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Notification dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" aria-label="Notifications" />
            }
          >
            <Bell className="size-4" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-80 p-0">
            <div className="border-b px-4 py-3">
              <h2 className="text-sm font-semibold">Notifications</h2>
              <p className="text-xs text-muted-foreground">
                Your recent updates
              </p>
            </div>

            <div className="p-6 text-center">
              <Bell className="mx-auto mb-2 size-6 text-muted-foreground" />
              <p className="text-sm font-medium">No notifications yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Updates and invitations will appear here.
              </p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AppHeader;
