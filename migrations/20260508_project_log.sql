-- Create project_log table
CREATE TABLE IF NOT EXISTS public.project_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_project_log_project_id ON public.project_log(project_id);
CREATE INDEX IF NOT EXISTS idx_project_log_created_at ON public.project_log(created_at DESC);

-- Enable RLS
ALTER TABLE public.project_log ENABLE ROW LEVEL SECURITY;

-- 1. Selection Policy: Only owner and teammates can view logs
CREATE POLICY "Users can view logs of their projects" 
ON public.project_log FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_log.project_id
        AND (p.user_id = auth.uid() OR auth.uid() = ANY(p.teammates))
    )
);

-- We do NOT create an INSERT policy for authenticated users, 
-- effectively preventing manual inserts by the client.

-- 2. Security Definer Function: System/Triggers can insert logs bypassing RLS
CREATE OR REPLACE FUNCTION public.log_project_event(
    p_project_id UUID,
    p_action TEXT,
    p_details JSONB,
    p_user_id UUID DEFAULT auth.uid()
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.project_log (project_id, user_id, action, details)
    VALUES (p_project_id, p_user_id, p_action, p_details)
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Trigger Function for specs actions
CREATE OR REPLACE FUNCTION public.trigger_log_spec_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM public.log_project_event(
            NEW.project_id, 
            'CREATE_SPEC', 
            jsonb_build_object('spec_id', NEW.id, 'title', NEW.title, 'type', NEW.type)
        );
    ELSIF TG_OP = 'UPDATE' THEN
        -- Only log if title, type or status changed
        IF NEW.title IS DISTINCT FROM OLD.title OR NEW.status IS DISTINCT FROM OLD.status OR NEW.type IS DISTINCT FROM OLD.type THEN
            PERFORM public.log_project_event(
                NEW.project_id, 
                'EDIT_SPEC', 
                jsonb_build_object('spec_id', NEW.id, 'title', NEW.title, 'status', NEW.status)
            );
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM public.log_project_event(
            OLD.project_id, 
            'DELETE_SPEC', 
            jsonb_build_object('spec_id', OLD.id, 'title', OLD.title)
        );
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to specs table
DROP TRIGGER IF EXISTS trg_log_spec_changes ON public.specs;
CREATE TRIGGER trg_log_spec_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.specs
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_log_spec_changes();
