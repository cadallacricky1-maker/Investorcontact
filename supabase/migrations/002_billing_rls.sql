alter table public.profiles enable row level security;
alter table public.stripe_customers enable row level security;
alter table public.subscriptions enable row level security;
alter table public.offers enable row level security;
alter table public.contact_requests enable row level security;

create policy "profiles own select"
on public.profiles for select
using (auth.uid() = id);

create policy "profiles own insert"
on public.profiles for insert
with check (auth.uid() = id);

create policy "profiles own update"
on public.profiles for update
using (auth.uid() = id);

create policy "stripe customers own select"
on public.stripe_customers for select
using (auth.uid() = user_id);

create policy "subscriptions own select"
on public.subscriptions for select
using (auth.uid() = user_id);

create policy "offers read public or own"
on public.offers for select
using (is_public = true or auth.uid() = owner_id);

create policy "offers insert own"
on public.offers for insert
with check (auth.uid() = owner_id);

create policy "offers update own"
on public.offers for update
using (auth.uid() = owner_id);

create policy "requests select requester or owner"
on public.contact_requests for select
using (auth.uid() = requester_id or auth.uid() = owner_id);

create policy "requests insert requester"
on public.contact_requests for insert
with check (auth.uid() = requester_id);

create policy "requests update owner"
on public.contact_requests for update
using (auth.uid() = owner_id);