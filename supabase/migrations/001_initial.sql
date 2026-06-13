-- Users table (synced via Supabase Auth webhook or trigger)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  onboarding_assessment jsonb,
  preferred_provider text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.users enable row level security;

create policy "Users can read own data"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can insert own data"
  on public.users for insert
  with check (auth.uid() = id);

create policy "Users can update own data"
  on public.users for update
  using (auth.uid() = id);

-- Trial usage (lifetime 20-request limit)
create table if not exists public.trial_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  request_count int not null default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

alter table public.trial_usage enable row level security;

create policy "Users can read own trial usage"
  on public.trial_usage for select
  using (auth.uid() = user_id);

create policy "Service role can manage trial usage"
  on public.trial_usage for all
  using (true)
  with check (true);

-- Seed skill nodes for roadmap engine
create table if not exists public.skill_nodes (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  tier text not null,
  category text not null,
  name text not null,
  description text,
  order_index int not null default 0,
  estimated_hours int not null default 1,
  prerequisites uuid[] default array[]::uuid[],
  resources jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

alter table public.skill_nodes enable row level security;

create policy "Anyone can read skill nodes"
  on public.skill_nodes for select
  using (true);

-- Seed: SDE → Top Product
insert into public.skill_nodes (role, tier, category, name, description, order_index, estimated_hours) values
('sde', 'top-product', 'dsa', 'Arrays & Hashing', 'Array manipulation, hash maps, two-pointer techniques', 1, 10),
('sde', 'top-product', 'dsa', 'Sliding Window', 'Fixed and variable length sliding window patterns', 2, 6),
('sde', 'top-product', 'dsa', 'Stack & Queue', 'Monotonic stack, queue-based problems', 3, 6),
('sde', 'top-product', 'dsa', 'Binary Search', 'Classic binary search and its variations', 4, 5),
('sde', 'top-product', 'dsa', 'Linked Lists', 'Reversal, fast-slow pointer, merge patterns', 5, 5),
('sde', 'top-product', 'dsa', 'Trees', 'DFS, BFS, BST, LCA, tree construction', 6, 10),
('sde', 'top-product', 'dsa', 'Tries', 'Prefix trees, autocomplete patterns', 7, 4),
('sde', 'top-product', 'dsa', 'Heap / Priority Queue', 'Top-k, merge K sorted, median finding', 8, 5),
('sde', 'top-product', 'dsa', 'Graphs', 'BFS/DFS, topological sort, union-find, Dijkstra', 9, 12),
('sde', 'top-product', 'dsa', 'Dynamic Programming', '1D DP, 2D DP, knapsack, LCS/LIS patterns', 10, 15),
('sde', 'top-product', 'dsa', 'Greedy & Intervals', 'Interval scheduling, greedy proofs', 11, 5),
('sde', 'top-product', 'dsa', 'Bit Manipulation', 'XOR tricks, bit masks, subset generation', 12, 3),
('sde', 'top-product', 'system-design', 'Foundations', 'Load balancing, caching, CDN, DNS', 1, 6),
('sde', 'top-product', 'system-design', 'Database Design', 'Sharding, replication, CAP theorem, indexing', 2, 8),
('sde', 'top-product', 'system-design', 'Distributed Systems', 'Consensus, gossip protocol, consistent hashing', 3, 8),
('sde', 'top-product', 'system-design', 'Design Problems', 'Design URL shortener, chat system, rate limiter, etc.', 4, 12),
('sde', 'top-product', 'cs-fundamentals', 'OS', 'Process/thread, memory management, scheduling', 1, 6),
('sde', 'top-product', 'cs-fundamentals', 'Networking', 'TCP/IP, HTTP/HTTPS, DNS, websockets', 2, 6),
('sde', 'top-product', 'cs-fundamentals', 'DBMS', 'SQL, normalization, transactions, indexes', 3, 5);
