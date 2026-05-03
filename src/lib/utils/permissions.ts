// Permission catalogue for organization roles
// Mirrors backend pkg/permissions with additional frontend-only permissions

export interface PermissionItem {
  code: string
  label: string
}

export interface PermissionGroup {
  group: string
  items: PermissionItem[]
}

export const PERMS: PermissionGroup[] = [
  { group: 'Feature Flags', items: [
    { code: 'flag.create',  label: 'Create flag' },
    { code: 'flag.update',  label: 'Edit flag value and description' },
    { code: 'flag.toggle',  label: 'Enable or disable flag' },
    { code: 'flag.delete',  label: 'Delete flag' },
    { code: 'flag.rename',  label: 'Rename flag' },
    { code: 'flag.rollout', label: 'Edit rollout %' },
    { code: 'flag.rules',   label: 'Edit targeting rules' },
    { code: 'flag.archive', label: 'Archive flag' },
  ]},
  { group: 'Segments', items: [
    { code: 'segment.create', label: 'Create segment' },
    { code: 'segment.edit',   label: 'Edit segment rules' },
    { code: 'segment.delete', label: 'Delete segment' },
  ]},
  { group: 'Projects', items: [
    { code: 'project.create',     label: 'Create project' },
    { code: 'project.rename',     label: 'Rename project' },
    { code: 'project.archive',    label: 'Archive project' },
    { code: 'project.unarchive',  label: 'Unarchive project' },
  ]},
  { group: 'Environments', items: [
    { code: 'environment.create', label: 'Create environment' },
    { code: 'environment.rename', label: 'Rename environment' },
    { code: 'environment.delete', label: 'Delete environment' },
  ]},
  { group: 'Members', items: [
    { code: 'member.invite', label: 'Invite member to organization' },
    { code: 'member.remove', label: 'Remove member from organization' },
    { code: 'member.role',   label: 'Change member role' },
  ]},
  { group: 'Organization', items: [
    { code: 'org.rename', label: 'Rename organization' },
    { code: 'org.roles',  label: 'Manage roles and permissions' },
  ]},
  { group: 'SDK & Keys', items: [
    { code: 'sdk.view',   label: 'View SDK keys' },
    { code: 'sdk.create', label: 'Create SDK key' },
    { code: 'sdk.revoke', label: 'Revoke SDK key' },
  ]},
]

export const TOTAL_PERMS = PERMS.reduce((n, g) => n + g.items.length, 0)
