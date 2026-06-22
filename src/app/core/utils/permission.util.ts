import { PermissionMatrixModule } from '../interfaces/permission.interface';

type MatrixAction = 'view' | 'create' | 'edit' | 'delete';

function actionKey(mod: PermissionMatrixModule, action: MatrixAction): string | null {
  return mod.permissions[action]?.key ?? null;
}

function moduleHas(selected: Set<string>, mod: PermissionMatrixModule, action: MatrixAction): boolean {
  const key = actionKey(mod, action);
  return key ? selected.has(key) : false;
}

/** Client-side matrix normalization — mirrors backend rules for instant UI feedback. */
export function normalizeMatrixSelection(
  modules: PermissionMatrixModule[],
  keys: string[],
): string[] {
  const input = new Set(keys);
  const result = new Set<string>();

  for (const mod of modules) {
    const viewKey = actionKey(mod, 'view');
    const viewSelected = viewKey ? input.has(viewKey) || moduleHas(input, mod, 'view') : false;

    if (moduleHas(input, mod, 'delete')) {
      if (viewKey) result.add(viewKey);
      const ck = actionKey(mod, 'create');
      const ek = actionKey(mod, 'edit');
      const dk = actionKey(mod, 'delete');
      if (ck) result.add(ck);
      if (ek) result.add(ek);
      if (dk) result.add(dk);
      continue;
    }

    if (moduleHas(input, mod, 'edit')) {
      if (viewKey) result.add(viewKey);
      const ek = actionKey(mod, 'edit');
      if (ek) result.add(ek);
      continue;
    }

    if (moduleHas(input, mod, 'create')) {
      if (viewKey) result.add(viewKey);
      const ck = actionKey(mod, 'create');
      if (ck) result.add(ck);
      continue;
    }

    if (viewSelected && viewKey) {
      result.add(viewKey);
    }
  }

  return [...result].sort();
}

export function getDefaultPermittedRoute(
  navigation: Array<{ route: string; permission: string }>,
  has: (p: string) => boolean,
): string | null {
  for (const item of navigation) {
    if (has(item.permission)) return item.route;
  }
  return null;
}
