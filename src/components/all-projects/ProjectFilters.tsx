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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-8 h-10 bg-card border-border text-sm placeholder:text-muted-foreground focus-visible:border-primary/50"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                ? 'bg-primary/10 text-primary border border-brand/30'
                : 'bg-card text-muted-foreground border border-border hover:text-foreground hover:border-border/70'
            )}
          >
            {filter === 'All' ? 'All Projects' : filter}
          </button>
        ))}
      </div>
    </div>
  );
}
