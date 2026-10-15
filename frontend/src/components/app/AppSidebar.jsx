import { Link, useLocation, useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from '../../store/authSlice';
import { useTheme } from '../utils/ThemeProvider';
import {
  LayoutDashboard,
  KanbanSquare,
  Mail,
  Settings,
  LogOut,
  User,
  ChevronsUpDown,
  ClipboardList,
  Clock,
  Moon,
  Sun,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

import { useLogoutMutation } from '@/services/authApi';
import { setCredentials } from '@/store/authSlice';
import { baseApi } from '@/services/baseApi';
import { useGetInvitesQuery } from '@/services/inviteApi';
import { useGetBoardsQuery } from '@/services/boardsApi';
import { avatarInitials } from '@/lib/avatarInitials';

// ---------------------------------------------------------------------------
// Shared nav button style
// ---------------------------------------------------------------------------

const navButtonClass = cn(
  'h-9 gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground',
  'transition-colors hover:bg-sidebar-accent hover:text-foreground',
  'data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-medium',
  'group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0',
  '[&>svg]:size-4 [&>svg]:shrink-0',
);

// ---------------------------------------------------------------------------
// NavItem
// ---------------------------------------------------------------------------

function NavItem({ item, isActive }) {
  const Icon = item.icon;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={item.title}
        isActive={isActive}
        className={navButtonClass}
        render={<Link to={item.url} />}
      >
        <Icon />
        <span>{item.title}</span>
      </SidebarMenuButton>

      {item.badge > 0 && (
        <SidebarMenuBadge
          className={cn(
            'right-2 min-w-5 justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground',
            // Keep the text color when the menu button is hovered or active
            'peer-hover/menu-button:text-primary-foreground peer-data-[active=true]/menu-button:text-primary-foreground',
            'group-data-[collapsible=icon]:right-1 group-data-[collapsible=icon]:top-1',
            'group-data-[collapsible=icon]:size-2 group-data-[collapsible=icon]:min-w-0',
            'group-data-[collapsible=icon]:overflow-hidden group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:text-[0px]',
          )}
        >
          {item.badge > 99 ? '99+' : item.badge}
        </SidebarMenuBadge>
      )}
    </SidebarMenuItem>
  );
}

// ---------------------------------------------------------------------------
// AppSidebar
// ---------------------------------------------------------------------------

const AppSidebar = () => {
  const location = useLocation();
  const { isMobile } = useSidebar();
  const user = useSelector(selectCurrentUser);
  const { theme, setTheme } = useTheme();
  const [logout, { isLoading: isLogoutLoading }] = useLogoutMutation();
  const { data: invites, isLoading: isInvitesLoading } = useGetInvitesQuery();
  const pendingInvites = invites?.filter((i) => i.status === 'pending');

  const {
    data,
    isLoading: isBoardsLoading,
    errors: boardsError,
    isFetching: isBoardsFetching,
    isError: isBoardsError,
    refetch,
  } = useGetBoardsQuery({ page: 1, limit: 6 });
  const boards = data?.boards ?? [];

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isUserLoading = user === undefined;

  const recentBoards =
    boards?.map((board) => ({
      url: `/boards/${board._id}`,
      ...board,
    })) ?? [];

  const workspaceItems = [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'My Boards', url: '/boards', icon: KanbanSquare },
    {
      title: 'Invitations',
      url: '/invitations',
      icon: Mail,
      badge: pendingInvites?.length,
    },
  ];

  const accountItems = [
    { title: 'Settings', url: '/settings', icon: Settings },
  ];

  const isActive = (url) =>
    location.pathname === url || location.pathname.startsWith(`${url}/`);

  const userInitials = avatarInitials() || 'U';

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(setCredentials(null));
      dispatch(baseApi.util.resetApiState());
      sessionStorage.setItem(
        'logout_message',
        'You have been logged out successfully.',
      );
      navigate('/auth/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      {/* Header */}
      <SidebarHeader className="pb-2 border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="rounded-lg hover:bg-transparent"
              render={<Link to="/dashboard" />}
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ClipboardList className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">CollabBoard</span>
                <span className="truncate text-xs text-muted-foreground">
                  Workspace
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="px-2 py-2">
        {/* Workspace */}
        <SidebarGroup className="py-1">
          <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {workspaceItems.map((item) => (
                <NavItem
                  key={item.title}
                  item={item}
                  isActive={isActive(item.url)}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Recent */}
        {recentBoards && recentBoards.length > 0 && (
          <SidebarGroup className="py-1">
            <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground">
              Recent
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {recentBoards.map((board) => (
                  <SidebarMenuItem key={board.url}>
                    <SidebarMenuButton
                      tooltip={board.title}
                      isActive={isActive(board.url)}
                      className={navButtonClass}
                      render={<Link to={board.url} />}
                    >
                      <Clock className="size-4 text-muted-foreground" />
                      <span className="truncate">{board.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Account */}
        <SidebarGroup className="py-1">
          <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {accountItems.map((item) => (
                <NavItem
                  key={item.title}
                  item={item}
                  isActive={isActive(item.url)}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer – User */}
      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    tooltip="Account"
                    className="rounded-lg data-[popup-open]:bg-sidebar-accent"
                  />
                }
              >
                {isUserLoading ? (
                  <>
                    <Skeleton className="size-8 rounded-lg" />
                    <div className="grid flex-1 gap-1">
                      <Skeleton className="h-3.5 w-20" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </>
                ) : (
                  <>
                    <Avatar className="size-8 rounded-lg">
                      <AvatarImage
                        src={user?.avatarUrl}
                        alt={user?.name || 'User'}
                      />
                      <AvatarFallback className="rounded-lg bg-primary/10 text-xs font-medium text-primary">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {user?.name || 'User'}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user?.email || ''}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
                  </>
                )}
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                side={isMobile ? 'bottom' : 'right'}
                sideOffset={8}
                className="w-56 rounded-lg"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-2 py-1.5">
                      <Avatar className="size-8 rounded-lg">
                        <AvatarImage
                          src={user?.avatarUrl}
                          alt={user?.name || 'User'}
                        />
                        <AvatarFallback className="rounded-lg bg-primary/10 text-xs font-medium text-primary">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">
                          {user?.name || 'User'}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {user?.email || ''}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem render={<Link to="/profile" />}>
                    <User className="size-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link to="/settings" />}>
                    <Settings className="size-4" />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                {/* Theme */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    {theme === 'dark' ? (
                      <Moon className="size-4" />
                    ) : (
                      <Sun className="size-4" />
                    )}
                    Theme
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <div className="pb-0.5">
                        <DropdownMenuItem
                          onClick={() => setTheme('light')}
                          className={cn(theme === 'light' && 'bg-accent')}
                        >
                          <Sun className="size-4" />
                          Light
                          {theme === 'light' && (
                            <span className="ml-auto text-xs opacity-60">
                              ✓
                            </span>
                          )}
                        </DropdownMenuItem>
                      </div>

                      <div className="pt-0.5">
                        <DropdownMenuItem
                          onClick={() => setTheme('dark')}
                          className={cn(theme === 'dark' && 'bg-accent')}
                        >
                          <Moon className="size-4" />
                          Dark
                          {theme === 'dark' && (
                            <span className="ml-auto text-xs opacity-60">
                              ✓
                            </span>
                          )}
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut className="size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

export default AppSidebar;
