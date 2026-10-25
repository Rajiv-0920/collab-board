/* Small helpers shared by the board page components. No React in here. */

export const ROLE_META = {
  owner: { label: 'Owner', className: 'bg-primary/10 text-primary' },
  editor: {
    label: 'Editor',
    className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  },
  viewer: { label: 'Viewer', className: 'bg-muted text-muted-foreground' },
};

export const getInitials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

/* "3 hours ago" without pulling in a date library */
export const timeAgo = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];

  for (const [name, size] of units) {
    const count = Math.floor(seconds / size);
    if (count >= 1) return `${count} ${name}${count > 1 ? 's' : ''} ago`;
  }
  return 'just now';
};

/* ------------------------------- Due dates -------------------------------- */

export const DUE_TONES = {
  overdue: 'bg-destructive/10 text-destructive',
  soon: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  normal: 'bg-muted text-muted-foreground',
};

export const getDueStatus = (dueDate) => {
  if (!dueDate) return null;

  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const diffDays = Math.round((due - today) / 86400000);
  const label = due.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  });

  if (diffDays < 0) return { label, tone: 'overdue' };
  if (diffDays === 0) return { label: 'Today', tone: 'soon' };
  if (diffDays === 1) return { label: 'Tomorrow', tone: 'soon' };
  return { label, tone: 'normal' };
};

/* <input type="date"> wants "YYYY-MM-DD" */
export const toDateInputValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};

/* -------------------------------- Labels ---------------------------------- */

// Full class names (not built dynamically) so Tailwind can see them.
const LABEL_STYLES = [
  'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  'bg-rose-500/15 text-rose-700 dark:text-rose-300',
  'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300',
  'bg-orange-500/15 text-orange-700 dark:text-orange-300',
  'bg-pink-500/15 text-pink-700 dark:text-pink-300',
];

// Labels are plain strings in your API, so the same word always gets the same colour.
export const labelStyle = (label = '') => {
  let hash = 0;
  for (const char of label) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return LABEL_STYLES[hash % LABEL_STYLES.length];
};

/* ------------------------------- Activity --------------------------------- */

// Turns an activity record into a sentence. Add more cases as your API logs more actions.
export const describeActivity = ({ action, meta = {} }) => {
  switch (action) {
    case 'board:updated':
      return 'updated the board details';
    case 'list:created':
      return `created the list “${meta.listTitle}”`;
    case 'list:updated':
      return `renamed the list “${meta.oldListTitle}” to “${meta.newListTitle}”`;
    case 'board:member:invited':
      return `invited ${meta.invitedUserName} as ${meta.role}`;
    default:
      return action.replace(/[:_]/g, ' ');
  }
};
