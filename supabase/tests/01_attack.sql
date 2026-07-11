-- Adversarial test of the foundation. Every check must PASS.
--
-- NOTE ON METHOD: uses session-level `set role`, NOT `set local`. In psql's
-- autocommit mode `set local` outside an explicit transaction is silently a
-- no-op, so the role never changes and every "attack" runs as superuser —
-- which bypasses RLS and all grants, making the whole suite meaningless.
-- Below, `set role authenticated` genuinely drops privilege, and a sanity
-- check asserts current_user actually changed before any attack runs.

\set ON_ERROR_STOP on

create or replace function tap(label text, passed boolean)
returns void language plpgsql as $$
begin
  raise notice '%  %', case when passed then 'PASS' else 'FAIL  <<<<<<' end, label;
end $$;

create or replace function as_user(u uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', u::text, false);
end $$;

-- These two are test scaffolding, not product. They need explicit grants
-- because 0002 makes the schema deny-by-default for functions — which is the
-- whole point, and it caught these on the first run.
grant execute on function tap(text, boolean) to anon, authenticated;
grant execute on function as_user(uuid)      to anon, authenticated;

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'victim@example.com',   '{"username":"victim"}'),
  ('22222222-2222-2222-2222-222222222222', 'attacker@example.com', '{"username":"attacker"}');

do $$ begin
  perform tap('signup trigger creates profile',   (select count(*) from public.profiles) = 2);
  perform tap('signup trigger creates vip_progress (0002 fix)', (select count(*) from public.vip_progress) = 2);
end $$;

-- Fund the victim through the legitimate server-side path.
select public.adjust_balance('11111111-1111-1111-1111-111111111111', 500);
insert into public.bills (user_id, transaction_type, trx_amount)
  values ('11111111-1111-1111-1111-111111111111', 'deposit', 500);

do $$ begin
  perform tap('service-side adjust_balance credits',
    (select balance from public.profiles where email='victim@example.com') = 500);
end $$;

-- =====================================================================
-- Become a logged-in browser session (the attacker).
-- =====================================================================
set role authenticated;
select public.as_user('22222222-2222-2222-2222-222222222222');

-- Guard: if the role did not actually change, every result below is a lie.
do $$ begin
  perform tap('[harness] role really is `authenticated`', current_user = 'authenticated');
  perform tap('[harness] auth.uid() resolves to the attacker',
    auth.uid() = '22222222-2222-2222-2222-222222222222');
end $$;

-- ATTACK 1 — the Day 1 hole: mint money via the RPC.
do $$ declare denied boolean := false; begin
  begin perform public.adjust_balance('22222222-2222-2222-2222-222222222222', 1000000);
  exception when insufficient_privilege then denied := true; when others then denied := false; end;
  perform tap('ATTACK mint via adjust_balance RPC is DENIED', denied);
end $$;

-- ATTACK 2 — drain another user via the RPC.
do $$ declare denied boolean := false; begin
  begin perform public.adjust_balance('11111111-1111-1111-1111-111111111111', -500);
  exception when insufficient_privilege then denied := true; when others then denied := false; end;
  perform tap('ATTACK drain another user via RPC is DENIED', denied);
end $$;

-- ATTACK 3 — bypass the RPC entirely, write the column.
do $$ declare blocked boolean := false; begin
  begin update public.profiles set balance = 999999 where id = auth.uid();
  exception when others then blocked := true; end;
  perform tap('ATTACK direct UPDATE of own balance is BLOCKED', blocked);
end $$;

-- ATTACK 4 — self-promote to admin by writing the column.
do $$ declare still_not_admin boolean; begin
  begin update public.profiles set is_admin = true, admin_role = 'super_admin' where id = auth.uid();
  exception when others then null; end;
  select not coalesce(is_admin, false) into still_not_admin
    from public.profiles where id = '22222222-2222-2222-2222-222222222222';
  perform tap('ATTACK self-promote to admin via UPDATE fails', still_not_admin);
end $$;

-- ATTACK 5 — call the promotion RPC directly.
do $$ declare denied boolean := false; begin
  begin perform public.promote_to_admin('attacker@example.com', 'super_admin');
  exception when insufficient_privilege then denied := true; when others then denied := false; end;
  perform tap('ATTACK promote_to_admin RPC is DENIED', denied);
end $$;

-- ATTACK 6/7 — read other users' rows.
do $$ begin
  perform tap('RLS: cannot read another user''s profile',
    (select count(*) from public.profiles where id='11111111-1111-1111-1111-111111111111') = 0);
  perform tap('RLS: CAN read own profile',
    (select count(*) from public.profiles where id = auth.uid()) = 1);
  perform tap('RLS: cannot read another user''s bills', (select count(*) from public.bills) = 0);
end $$;

-- ATTACK 8 — post to chat impersonating someone else.
do $$ declare denied boolean := false; begin
  begin insert into public.chat (user_id, username, content)
        values ('11111111-1111-1111-1111-111111111111', 'victim', 'i am the victim');
  exception when others then denied := true; end;
  perform tap('ATTACK chat post as another user is DENIED', denied);
end $$;

-- ATTACK 9 — call the internal trigger function as an RPC.
do $$ declare denied boolean := false; begin
  begin perform public.handle_new_user();
  exception when insufficient_privilege then denied := true; when others then denied := false; end;
  perform tap('ATTACK calling trigger fn handle_new_user() is DENIED', denied);
end $$;

-- Legitimate action still works.
do $$ declare ok boolean := false; begin
  begin update public.profiles set username = 'renamed' where id = auth.uid(); ok := true;
  exception when others then ok := false; end;
  perform tap('user CAN still update own non-money fields', ok);
end $$;

-- KNOWN ISSUE — public_profiles ignores hidden_from_public.
reset role;
update public.profiles set hidden_from_public = true where id='11111111-1111-1111-1111-111111111111';
set role anon;
do $$ declare leaked boolean; begin
  select exists(select 1 from public.public_profiles where username='victim') into leaked;
  perform tap('public_profiles hides opted-out users', not leaked);
end $$;

-- =====================================================================
-- Back to the server side: the legitimate path must still work.
-- =====================================================================
reset role;
do $$ begin
  perform tap('victim balance untouched by all attacks (still 500)',
    (select balance from public.profiles where id='11111111-1111-1111-1111-111111111111') = 500);
  perform tap('attacker balance still zero',
    (select balance from public.profiles where id='22222222-2222-2222-2222-222222222222') = 0);
  perform tap('attacker is still not an admin',
    (select not is_admin from public.profiles where id='22222222-2222-2222-2222-222222222222'));
end $$;

do $$ begin
  perform public.adjust_balance('11111111-1111-1111-1111-111111111111', 100);
  perform tap('service_role path still credits correctly',
    (select balance from public.profiles where id='11111111-1111-1111-1111-111111111111') = 600);
end $$;

do $$ declare raised boolean := false; begin
  begin perform public.adjust_balance('11111111-1111-1111-1111-111111111111', -99999);
  exception when others then raised := true; end;
  perform tap('overdraw rejected (insufficient_balance)', raised);
  perform tap('balance unchanged after failed overdraw',
    (select balance from public.profiles where id='11111111-1111-1111-1111-111111111111') = 600);
end $$;

-- promote_to_admin works from the server side.
do $$ begin
  perform public.promote_to_admin('victim@example.com', 'super_admin');
  perform tap('service-side promote_to_admin works',
    (select is_admin from public.profiles where id='11111111-1111-1111-1111-111111111111'));
end $$;
