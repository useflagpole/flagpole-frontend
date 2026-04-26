export interface Project {
  id: string;
  name: string;
  env: string[];
  flagCount: number;
  segmentCount: number;
  lastModified: string;
  owner: string;
}

export interface Flag {
  id: string;
  key: string;
  status: 'on' | 'off';
  rollout: number;
  tags: string[];
  desc: string;
  envs: Record<string, number>;
  evals: number;
}

export interface FlagRule {
  id: string;
  type: string;
  op: string;
  attr: string;
  value: string;
  action: string;
}

export interface Segment {
  id: string;
  projectId: string;
  name: string;
  userCount: number;
  desc: string;
  rules: { attr: string; op: string; value: string }[];
}

export interface AuditEntry {
  id: string;
  ts: string;
  actor: string;
  action: string;
  target: string;
  projectId: string;
  project: string;
  detail: string;
  env: string;
}

export interface Org {
  id: string;
  name: string;
  slug: string;
}

export interface SdkKey {
  id: string;
  label: string;
  env: string;
  type: string;
  key: string;
  created: string;
  lastUsed: string;
}

function sparkline(peak: number, noise: number): number[] {
  return Array.from({ length: 28 }, (_, i) => {
    const base = Math.sin(i / 4) * 0.3 + 0.6
    return Math.max(0, Math.round(peak * base * (0.85 + Math.random() * noise)))
  })
}

export const projects: Project[] = [
  {
    id: 'p1',
    name: 'web-app',
    env: ['production', 'staging', 'dev'],
    flagCount: 24,
    segmentCount: 8,
    lastModified: '2 hours ago',
    owner: 'acme',
  },
  {
    id: 'p2',
    name: 'mobile-ios',
    env: ['production', 'staging'],
    flagCount: 11,
    segmentCount: 3,
    lastModified: 'yesterday',
    owner: 'acme',
  },
  {
    id: 'p3',
    name: 'api-gateway',
    env: ['production', 'dev'],
    flagCount: 7,
    segmentCount: 2,
    lastModified: '3 days ago',
    owner: 'acme',
  },
  {
    id: 'p4',
    name: 'admin-panel',
    env: ['production'],
    flagCount: 5,
    segmentCount: 1,
    lastModified: '1 week ago',
    owner: 'acme',
  },
]

export const flags: Record<string, Flag[]> = {
  p1: [
    {
      id: 'f1',
      key: 'new-checkout-v2',
      status: 'on',
      rollout: 100,
      tags: ['checkout'],
      desc: 'New redesigned checkout flow.',
      envs: { production: 100, staging: 100, dev: 100 },
      evals: 182400,
    },
    {
      id: 'f2',
      key: 'dark-mode',
      status: 'on',
      rollout: 74,
      tags: ['ui'],
      desc: 'Dark mode toggle for authenticated users.',
      envs: { production: 74, staging: 100, dev: 100 },
      evals: 94200,
    },
    {
      id: 'f3',
      key: 'ai-summaries',
      status: 'off',
      rollout: 0,
      tags: ['ai'],
      desc: 'AI-generated invoice summaries.',
      envs: { production: 0, staging: 10, dev: 100 },
      evals: 0,
    },
    {
      id: 'f4',
      key: 'rate-limit-v3',
      status: 'on',
      rollout: 30,
      tags: ['infra'],
      desc: 'New rate limiting algorithm at 30%.',
      envs: { production: 30, staging: 100, dev: 100 },
      evals: 54800,
    },
    {
      id: 'f5',
      key: 'billing-weekly',
      status: 'on',
      rollout: 12,
      tags: ['billing'],
      desc: 'Weekly billing cycle for Pro plans.',
      envs: { production: 12, staging: 100, dev: 100 },
      evals: 21000,
    },
    {
      id: 'f6',
      key: 'referral-program',
      status: 'off',
      rollout: 0,
      tags: ['growth'],
      desc: 'New referral incentive program.',
      envs: { production: 0, staging: 0, dev: 0 },
      evals: 0,
    },
    {
      id: 'f7',
      key: 'onboarding-split-a',
      status: 'on',
      rollout: 50,
      tags: ['growth'],
      desc: 'A/B test: new vs classic onboarding.',
      envs: { production: 50, staging: 100, dev: 100 },
      evals: 8800,
    },
    {
      id: 'f8',
      key: 'sentry-replay',
      status: 'on',
      rollout: 100,
      tags: ['obs'],
      desc: 'Session replay for all sessions.',
      envs: { production: 100, staging: 100, dev: 0 },
      evals: 182000,
    },
    {
      id: 'f9',
      key: 'csv-export-v2',
      status: 'off',
      rollout: 0,
      tags: ['export'],
      desc: 'CSV export with custom column selection.',
      envs: { production: 0, staging: 50, dev: 100 },
      evals: 0,
    },
    {
      id: 'f10',
      key: 'multi-currency',
      status: 'on',
      rollout: 8,
      tags: ['billing'],
      desc: 'Multi-currency pricing for EU/APAC.',
      envs: { production: 8, staging: 100, dev: 100 },
      evals: 14200,
    },
  ],
  p2: [
    {
      id: 'f11',
      key: 'push-redesign',
      status: 'on',
      rollout: 60,
      tags: ['ui'],
      desc: 'Redesigned push notification flow.',
      envs: { production: 60, staging: 100 },
      evals: 44200,
    },
    {
      id: 'f12',
      key: 'offline-mode',
      status: 'off',
      rollout: 0,
      tags: ['infra'],
      desc: 'Offline-first with local SQLite cache.',
      envs: { production: 0, staging: 20 },
      evals: 0,
    },
    {
      id: 'f13',
      key: 'widget-home-v2',
      status: 'on',
      rollout: 100,
      tags: ['ui'],
      desc: 'New home screen widget layout.',
      envs: { production: 100, staging: 100 },
      evals: 88400,
    },
  ],
  p3: [
    {
      id: 'f14',
      key: 'graphql-beta',
      status: 'on',
      rollout: 20,
      tags: ['api'],
      desc: 'GraphQL endpoint (beta) for early access.',
      envs: { production: 20, dev: 100 },
      evals: 18000,
    },
    {
      id: 'f15',
      key: 'response-cache-v2',
      status: 'off',
      rollout: 0,
      tags: ['infra'],
      desc: 'Edge cache with stale-while-revalidate.',
      envs: { production: 0, dev: 100 },
      evals: 0,
    },
  ],
  p4: [
    {
      id: 'f16',
      key: 'new-users-table',
      status: 'on',
      rollout: 100,
      tags: ['ui'],
      desc: 'Rebuilt users table with virtual scroll.',
      envs: { production: 100 },
      evals: 4200,
    },
  ],
}

export const flagRules: Record<string, FlagRule[]> = {
  f1: [
    {
      id: 'r1',
      type: 'segment',
      op: 'in',
      attr: 'segment',
      value: 'beta-users',
      action: 'on',
    },
    {
      id: 'r2',
      type: 'attr',
      op: 'equals',
      attr: 'plan',
      value: 'pro',
      action: 'on',
    },
    {
      id: 'r3',
      type: 'attr',
      op: 'not_in',
      attr: 'region',
      value: 'cn',
      action: 'off',
    },
  ],
  f2: [
    {
      id: 'r4',
      type: 'attr',
      op: 'in',
      attr: 'plan',
      value: 'pro, enterprise',
      action: 'on',
    },
  ],
  f7: [
    {
      id: 'r5',
      type: 'attr',
      op: 'lt',
      attr: 'account_age_days',
      value: '30',
      action: 'variant:new',
    },
    {
      id: 'r6',
      type: 'attr',
      op: 'gte',
      attr: 'account_age_days',
      value: '30',
      action: 'variant:control',
    },
  ],
}

export const segments: Segment[] = [
  // web-app (p1)
  {
    id: 's1',
    projectId: 'p1',
    name: 'beta-users',
    userCount: 1240,
    desc: 'Early access users opted into beta features.',
    rules: [{ attr: 'beta_opt_in', op: 'equals', value: 'true' }],
  },
  {
    id: 's2',
    projectId: 'p1',
    name: 'pro-plan',
    userCount: 8420,
    desc: 'All users on the Pro subscription tier.',
    rules: [{ attr: 'plan', op: 'equals', value: 'pro' }],
  },
  {
    id: 's3',
    projectId: 'p1',
    name: 'enterprise',
    userCount: 340,
    desc: 'Enterprise accounts.',
    rules: [{ attr: 'plan', op: 'equals', value: 'enterprise' }],
  },
  {
    id: 's4',
    projectId: 'p1',
    name: 'us-east',
    userCount: 22100,
    desc: 'Users in US Eastern timezone.',
    rules: [{ attr: 'region', op: 'in', value: 'us-east-1, us-east-2' }],
  },
  {
    id: 's5',
    projectId: 'p1',
    name: 'new-signups',
    userCount: 880,
    desc: 'Accounts created in the last 30 days.',
    rules: [{ attr: 'account_age_days', op: 'lt', value: '30' }],
  },
  {
    id: 's6',
    projectId: 'p1',
    name: 'internal-team',
    userCount: 38,
    desc: 'flagpole internal team for dogfooding.',
    rules: [{ attr: 'email', op: 'ends_with', value: '@flagpole.dev' }],
  },
  {
    id: 's7',
    projectId: 'p1',
    name: 'high-volume',
    userCount: 2800,
    desc: 'Users with > 1000 API calls/day.',
    rules: [{ attr: 'api_calls_daily', op: 'gt', value: '1000' }],
  },
  {
    id: 's8',
    projectId: 'p1',
    name: 'churned-risk',
    userCount: 610,
    desc: 'Users inactive for > 14 days with no recent session.',
    rules: [
      { attr: 'last_seen_days', op: 'gt', value: '14' },
      { attr: 'session_count_30d', op: 'lt', value: '2' },
    ],
  },
  // mobile-ios (p2)
  {
    id: 's9',
    projectId: 'p2',
    name: 'ios-17-plus',
    userCount: 31400,
    desc: 'Devices running iOS 17 or later.',
    rules: [{ attr: 'os_version', op: 'gte', value: '17' }],
  },
  {
    id: 's10',
    projectId: 'p2',
    name: 'push-enabled',
    userCount: 24800,
    desc: 'Users with push notifications enabled.',
    rules: [{ attr: 'push_permission', op: 'equals', value: 'granted' }],
  },
  {
    id: 's11',
    projectId: 'p2',
    name: 'paid-subscribers',
    userCount: 5100,
    desc: 'Active in-app purchase subscribers.',
    rules: [{ attr: 'iap_active', op: 'equals', value: 'true' }],
  },
  // api-gateway (p3)
  {
    id: 's12',
    projectId: 'p3',
    name: 'early-access-api',
    userCount: 88,
    desc: 'Partners with early access to new API endpoints.',
    rules: [{ attr: 'partner_tier', op: 'equals', value: 'early-access' }],
  },
  {
    id: 's13',
    projectId: 'p3',
    name: 'high-rps',
    userCount: 42,
    desc: 'Clients averaging > 500 req/s.',
    rules: [{ attr: 'avg_rps', op: 'gt', value: '500' }],
  },
  // admin-panel (p4)
  {
    id: 's14',
    projectId: 'p4',
    name: 'super-admins',
    userCount: 6,
    desc: 'Users with super-admin role.',
    rules: [{ attr: 'role', op: 'equals', value: 'super-admin' }],
  },
]

export const auditLog: AuditEntry[] = [
  // web-app (p1)
  {
    id: 'a1',
    ts: '2026-04-19 14:32',
    actor: 'sarah@acme.co',
    action: 'flag.toggle',
    target: 'new-checkout-v2',
    projectId: 'p1',
    project: 'web-app',
    detail: 'Enabled in production',
    env: 'production',
  },
  {
    id: 'a2',
    ts: '2026-04-19 13:18',
    actor: 'dan@acme.co',
    action: 'flag.rollout',
    target: 'dark-mode',
    projectId: 'p1',
    project: 'web-app',
    detail: 'Rollout changed 50% → 74%',
    env: 'production',
  },
  {
    id: 'a3',
    ts: '2026-04-19 11:45',
    actor: 'dan@acme.co',
    action: 'flag.create',
    target: 'csv-export-v2',
    projectId: 'p1',
    project: 'web-app',
    detail: 'Flag created',
    env: 'staging',
  },
  {
    id: 'a4',
    ts: '2026-04-19 10:02',
    actor: 'api-key',
    action: 'flag.eval',
    target: 'rate-limit-v3',
    projectId: 'p1',
    project: 'web-app',
    detail: '54,800 evaluations in last hour',
    env: 'production',
  },
  {
    id: 'a5',
    ts: '2026-04-18 17:50',
    actor: 'sarah@acme.co',
    action: 'segment.edit',
    target: 'beta-users',
    projectId: 'p1',
    project: 'web-app',
    detail: 'Added rule: email ends_with @partner.io',
    env: '—',
  },
  {
    id: 'a6',
    ts: '2026-04-18 16:22',
    actor: 'jay@acme.co',
    action: 'flag.toggle',
    target: 'ai-summaries',
    projectId: 'p1',
    project: 'web-app',
    detail: 'Disabled in production',
    env: 'production',
  },
  {
    id: 'a7',
    ts: '2026-04-18 14:00',
    actor: 'jay@acme.co',
    action: 'flag.rollout',
    target: 'billing-weekly',
    projectId: 'p1',
    project: 'web-app',
    detail: 'Rollout changed 5% → 12%',
    env: 'production',
  },
  {
    id: 'a8',
    ts: '2026-04-18 11:30',
    actor: 'sarah@acme.co',
    action: 'flag.rules',
    target: 'new-checkout-v2',
    projectId: 'p1',
    project: 'web-app',
    detail: 'Added targeting rule: plan = pro',
    env: 'production',
  },
  {
    id: 'a9',
    ts: '2026-04-17 09:45',
    actor: 'api-key',
    action: 'segment.eval',
    target: 'pro-plan',
    projectId: 'p1',
    project: 'web-app',
    detail: '8,420 users matched',
    env: '—',
  },
  {
    id: 'a10',
    ts: '2026-04-16 11:20',
    actor: 'sarah@acme.co',
    action: 'flag.create',
    target: 'referral-program',
    projectId: 'p1',
    project: 'web-app',
    detail: 'Flag created',
    env: 'dev',
  },
  // mobile-ios (p2)
  {
    id: 'a11',
    ts: '2026-04-19 09:15',
    actor: 'dan@acme.co',
    action: 'flag.create',
    target: 'push-redesign',
    projectId: 'p2',
    project: 'mobile-ios',
    detail: 'Flag created',
    env: 'staging',
  },
  {
    id: 'a12',
    ts: '2026-04-18 15:40',
    actor: 'jay@acme.co',
    action: 'flag.toggle',
    target: 'widget-home-v2',
    projectId: 'p2',
    project: 'mobile-ios',
    detail: 'Enabled in production',
    env: 'production',
  },
  {
    id: 'a13',
    ts: '2026-04-18 12:00',
    actor: 'dan@acme.co',
    action: 'flag.rollout',
    target: 'push-redesign',
    projectId: 'p2',
    project: 'mobile-ios',
    detail: 'Rollout changed 20% → 60%',
    env: 'production',
  },
  {
    id: 'a14',
    ts: '2026-04-17 10:30',
    actor: 'sarah@acme.co',
    action: 'segment.edit',
    target: 'ios-17-plus',
    projectId: 'p2',
    project: 'mobile-ios',
    detail: 'Updated OS version threshold to 17',
    env: '—',
  },
  {
    id: 'a15',
    ts: '2026-04-16 16:00',
    actor: 'api-key',
    action: 'flag.eval',
    target: 'widget-home-v2',
    projectId: 'p2',
    project: 'mobile-ios',
    detail: '88,400 evaluations in last hour',
    env: 'production',
  },
  // api-gateway (p3)
  {
    id: 'a16',
    ts: '2026-04-19 08:00',
    actor: 'dan@acme.co',
    action: 'flag.toggle',
    target: 'graphql-beta',
    projectId: 'p3',
    project: 'api-gateway',
    detail: 'Enabled in production',
    env: 'production',
  },
  {
    id: 'a17',
    ts: '2026-04-18 09:10',
    actor: 'jay@acme.co',
    action: 'flag.rollout',
    target: 'graphql-beta',
    projectId: 'p3',
    project: 'api-gateway',
    detail: 'Rollout changed 5% → 20%',
    env: 'production',
  },
  {
    id: 'a18',
    ts: '2026-04-17 14:55',
    actor: 'sarah@acme.co',
    action: 'segment.edit',
    target: 'high-rps',
    projectId: 'p3',
    project: 'api-gateway',
    detail: 'Threshold updated: avg_rps > 500',
    env: '—',
  },
  // admin-panel (p4)
  {
    id: 'a19',
    ts: '2026-04-19 11:00',
    actor: 'sarah@acme.co',
    action: 'flag.toggle',
    target: 'new-users-table',
    projectId: 'p4',
    project: 'admin-panel',
    detail: 'Enabled in production',
    env: 'production',
  },
  {
    id: 'a20',
    ts: '2026-04-17 13:30',
    actor: 'jay@acme.co',
    action: 'flag.create',
    target: 'new-users-table',
    projectId: 'p4',
    project: 'admin-panel',
    detail: 'Flag created',
    env: 'dev',
  },
]

export const evalSeries: Record<string, number[]> = {
  total:             sparkline(9800,  0.3),
  'new-checkout-v2': sparkline(7200,  0.15),
  'dark-mode':       sparkline(3800,  0.25),
  'sentry-replay':   sparkline(7000,  0.12),
  'rate-limit-v3':   sparkline(2200,  0.35),
  'billing-weekly':  sparkline(850,   0.4),
}

export const orgs: Org[] = [
  {
    id: 'o1',
    name: 'Acme Corp',
    slug: 'acme',
  },
  {
    id: 'o2',
    name: 'Globex Inc',
    slug: 'globex',
  },
  {
    id: 'o3',
    name: 'Initech',
    slug: 'initech',
  },
]

export const sdkKeys: SdkKey[] = [
  {
    id: 'k1',
    label: 'production — server',
    env: 'production',
    type: 'server',
    key: 'fp_live_sk_prod_3xK9mNpQrTvWxYzA',
    created: '2025-11-01',
    lastUsed: '2 min ago',
  },
  {
    id: 'k2',
    label: 'production — client',
    env: 'production',
    type: 'client',
    key: 'fp_live_pk_prod_7bHjLsFuGdEwVoCi',
    created: '2025-11-01',
    lastUsed: '4 min ago',
  },
  {
    id: 'k3',
    label: 'staging — server',
    env: 'staging',
    type: 'server',
    key: 'fp_test_sk_stg_9nMkPzQaBcDeRfGh',
    created: '2025-11-01',
    lastUsed: '1 hour ago',
  },
  {
    id: 'k4',
    label: 'dev — server',
    env: 'dev',
    type: 'server',
    key: 'fp_test_sk_dev_2jKlXyZwVuTsRqPo',
    created: '2025-12-14',
    lastUsed: '3 days ago',
  },
]
