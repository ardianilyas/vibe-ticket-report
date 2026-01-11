// Pastel colors for status badges
export const getStatusStyle = (status: string) => {
  const baseClasses = 'px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border rounded-full transition-all duration-200';
  switch (status) {
    case 'open':
      return `${baseClasses} bg-amber-50 text-amber-700 border-amber-200/50 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50`;
    case 'in_progress':
      return `${baseClasses} bg-blue-50 text-blue-700 border-blue-200/50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50`;
    case 'resolved':
      return `${baseClasses} bg-emerald-50 text-emerald-700 border-emerald-200/50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50`;
    case 'closed':
      return `${baseClasses} bg-slate-50 text-slate-600 border-slate-200/50 hover:bg-slate-100 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700/50`;
    default:
      return baseClasses;
  }
};

// Pastel colors for priority badges
export const getPriorityStyle = (priority: string) => {
  const baseClasses = 'px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border rounded-full transition-all duration-200';
  switch (priority) {
    case 'urgent':
      return `${baseClasses} bg-rose-50 text-rose-700 border-rose-200/50 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/50 shadow-[0_0_8px_rgba(225,29,72,0.1)]`;
    case 'high':
      return `${baseClasses} bg-orange-50 text-orange-700 border-orange-200/50 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/50`;
    case 'medium':
      return `${baseClasses} bg-yellow-50 text-yellow-700 border-yellow-200/50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800/50`;
    case 'low':
      return `${baseClasses} bg-slate-50 text-slate-600 border-slate-200/50 hover:bg-slate-100 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700/50`;
    default:
      return baseClasses;
  }
};

// Pastel colors for category badges
export const getCategoryStyle = (_color?: string | null) => {
  const baseClasses = 'px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border rounded-full transition-all duration-200';

  // Custom logic for some seed colors if needed, but for now a nice indigo theme fits all
  return `${baseClasses} bg-indigo-50 text-indigo-700 border-indigo-200/50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800/50`;
};

// Pastel colors for user roles
export const getRoleStyle = (role: string) => {
  const baseClasses = 'px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border rounded-full transition-all duration-200';
  switch (role) {
    case 'admin':
      return `${baseClasses} bg-purple-50 text-purple-700 border-purple-200/50 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/50`;
    case 'user':
      return `${baseClasses} bg-teal-50 text-teal-700 border-teal-200/50 hover:bg-teal-100 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800/50`;
    default:
      return baseClasses;
  }
};
