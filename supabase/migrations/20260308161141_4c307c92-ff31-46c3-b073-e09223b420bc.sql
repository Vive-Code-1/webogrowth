-- Clean up all related data first
DELETE FROM public.comments;
DELETE FROM public.tasks;
DELETE FROM public.project_members;
DELETE FROM public.projects;
DELETE FROM public.user_roles WHERE user_id != '4c8ccfae-a090-45f1-980e-5102efae61e9';
DELETE FROM public.profiles WHERE id != '4c8ccfae-a090-45f1-980e-5102efae61e9';