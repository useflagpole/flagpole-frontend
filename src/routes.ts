import type { Component } from 'svelte'
import App      from './App.svelte'
import Auth     from './lib/Auth.svelte'
import AppShell from './lib/app/AppShell.svelte'

export const routes: Record<string, Component<any>> = {
  '#/':       App,
  '#/login':  Auth,
  '#/signup': Auth,
  '#/app':    AppShell,
}

export function resolve(hash: string): Component<any> {
  if (hash.startsWith('#/app')) return AppShell
  return routes[hash] ?? App
}
