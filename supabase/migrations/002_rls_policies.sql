-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presence ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Groups policies
CREATE POLICY "Users can view their groups"
  ON public.groups FOR SELECT
  USING (
    id IN (
      SELECT group_id FROM public.group_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create groups"
  ON public.groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group admins can update groups"
  ON public.groups FOR UPDATE
  USING (
    id IN (
      SELECT group_id FROM public.group_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Group members policies
CREATE POLICY "Users can view group members"
  ON public.group_members FOR SELECT
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert themselves as members"
  ON public.group_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can delete members"
  ON public.group_members FOR DELETE
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Games policies
CREATE POLICY "Users can view games in their groups"
  ON public.games FOR SELECT
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Group admins can create games"
  ON public.games FOR INSERT
  WITH CHECK (
    group_id IN (
      SELECT group_id FROM public.group_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
    AND auth.uid() = created_by
  );

CREATE POLICY "Game creators can update games"
  ON public.games FOR UPDATE
  USING (created_by = auth.uid());

-- Squares policies
CREATE POLICY "Users can view squares in their games"
  ON public.squares FOR SELECT
  USING (
    game_id IN (
      SELECT g.id FROM public.games g
      INNER JOIN public.group_members gm ON g.group_id = gm.group_id
      WHERE gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can claim squares"
  ON public.squares FOR UPDATE
  USING (
    game_id IN (
      SELECT g.id FROM public.games g
      INNER JOIN public.group_members gm ON g.group_id = gm.group_id
      WHERE gm.user_id = auth.uid() AND g.status = 'open'
    )
    AND user_id IS NULL
  )
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Game creators can insert squares"
  ON public.squares FOR INSERT
  WITH CHECK (
    game_id IN (
      SELECT id FROM public.games
      WHERE created_by = auth.uid()
    )
  );

-- Presence policies
CREATE POLICY "Users can view presence in their games"
  ON public.presence FOR SELECT
  USING (
    game_id IN (
      SELECT g.id FROM public.games g
      INNER JOIN public.group_members gm ON g.group_id = gm.group_id
      WHERE gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own presence"
  ON public.presence FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presence"
  ON public.presence FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own presence"
  ON public.presence FOR DELETE
  USING (auth.uid() = user_id);
