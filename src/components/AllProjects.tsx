import { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getProjectsPaginated } from '@/lib/supabase/supabase-projects';
import { Project } from '@/lib/types';
import { ProjectCard } from './all-projects/ProjectCard';
import { ProjectFilters } from './all-projects/ProjectFilters';
import { ProjectEmptyState } from './all-projects/ProjectEmptyState';
import { useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 20;

export function AllProjects() {
  const navigate = useNavigate();
  const onSelectProject = (id: string) => navigate('/projects/' + id);
  const onCreateProject = () => navigate('/projects/new');
  const [projects, setProjects] = useState<Project[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeFilter]);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const mode = activeFilter === 'All' ? undefined : activeFilter;
      const result = await getProjectsPaginated(page, ITEMS_PER_PAGE, {
        search: debouncedSearch || undefined,
        mode,
      });
      setProjects(result.data);
      setCount(result.count);
      setTotalPages(Math.max(1, Math.ceil(result.count / ITEMS_PER_PAGE)));
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, activeFilter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-5 h-5 text-orange-500" />
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              All Projects
            </h1>
          </div>
          {!loading && (
            <p className="text-sm text-slate-500 ml-8">
              {count} {count === 1 ? 'project' : 'projects'} total
            </p>
          )}
        </div>
        <Button
          variant="default"
          className="bg-orange-500 hover:bg-orange-600 text-white"
          onClick={onCreateProject}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          New Project
        </Button>
      </div>

      <ProjectFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} size="sm" className="border-slate-800 bg-slate-900/50">
              <div className="p-4 flex flex-col gap-4">
                <Skeleton className="w-10 h-10 rounded-xl bg-slate-800" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-3/4 bg-slate-800" />
                  <Skeleton className="h-4 w-full bg-slate-800" />
                  <Skeleton className="h-4 w-2/3 bg-slate-800" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-20 rounded-full bg-slate-800" />
                  <Skeleton className="h-4 w-24 bg-slate-800" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={onSelectProject}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <ProjectEmptyState
              onCreateProject={onCreateProject}
              isSearching={!!(debouncedSearch || activeFilter !== 'All')}
              searchQuery={debouncedSearch}
            />
          )}

          {totalPages > 1 && projects.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
              <span className="text-sm text-slate-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border-slate-800 text-slate-400 hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="border-slate-800 text-slate-400 hover:text-white"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
