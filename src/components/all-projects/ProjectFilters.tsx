import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ProjectFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const filters = ['All', 'Startup', 'Hackathon', 'Learning'];

export function ProjectFilters({ searchQuery, onSearchChange, activeFilter, onFilterChange }: ProjectFiltersProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-8 h-10 bg-slate-900/50 border-slate-800 text-sm placeholder:text-slate-500 focus-visible:border-orange-500/50"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={cn(
              'px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
              activeFilter === filter
                ? 'bg-orange-500/10 text-orange-500 border border-orange-500/30'
                : 'bg-slate-900/50 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
            )}
          >
            {filter === 'All' ? 'All Projects' : filter}
          </button>
        ))}
      </div>
    </div>
  );
}
