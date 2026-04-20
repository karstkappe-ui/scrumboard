import type { User } from '@/types';

export const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Alex Chen',
    email: 'alex.chen@scrumboard.dev',
    initials: 'AC',
    color: '#4F46E5',
    role: 'developer',
  },
  {
    id: 'user-2',
    name: 'Sarah Kim',
    email: 'sarah.kim@scrumboard.dev',
    initials: 'SK',
    color: '#7C3AED',
    role: 'developer',
  },
  {
    id: 'user-3',
    name: 'Mike Torres',
    email: 'mike.torres@scrumboard.dev',
    initials: 'MT',
    color: '#059669',
    role: 'designer',
  },
  {
    id: 'user-4',
    name: 'Lisa Park',
    email: 'lisa.park@scrumboard.dev',
    initials: 'LP',
    color: '#D97706',
    role: 'tester',
  },
  {
    id: 'user-5',
    name: 'David Johnson',
    email: 'david.johnson@scrumboard.dev',
    initials: 'DJ',
    color: '#DC2626',
    role: 'admin',
  },
];
