-- RAG Match Specs Function
create or replace function match_specs(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter_user_id uuid,
  filter_type text default null
)
returns table (
  id uuid,
  title text,
  content text,
  type text,
  similarity float
)
language plpgsql
security definer
as $$
begin
  return query
  select
    s.id,
    s.title,
    s.content,
    s.type,
    1 - (s.embedding <=> query_embedding) as similarity
  from specs s
  join projects p on p.id = s.project_id
  where p.user_id = filter_user_id
  and (filter_type is null or s.type = filter_type)
  and s.embedding is not null
  and 1 - (s.embedding <=> query_embedding) > match_threshold
  order by s.embedding <=> query_embedding
  limit match_count;
end;
$$;
