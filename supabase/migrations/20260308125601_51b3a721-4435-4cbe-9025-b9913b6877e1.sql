
-- Team members can INSERT tasks on projects they belong to
CREATE POLICY "Team can insert tasks on their projects"
ON public.tasks
FOR INSERT
TO authenticated
WITH CHECK (
  is_project_member(auth.uid(), project_id)
);

-- Team members can INSERT comments (already have user_id = auth.uid() policy but it's restrictive, need to also check task access)
-- The existing comment insert policy only checks user_id = auth.uid(), which is correct.
-- But we also need team members to be able to insert tasks, which we just added above.

-- Allow team members to update tasks on their projects (not just assigned ones)
CREATE POLICY "Team can update tasks on their projects"
ON public.tasks
FOR UPDATE
TO authenticated
USING (is_project_member(auth.uid(), project_id))
WITH CHECK (is_project_member(auth.uid(), project_id));
