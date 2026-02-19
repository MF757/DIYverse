import { Outlet } from 'react-router-dom';
import { config } from '../lib/config';
import { SetupRequired } from './SetupRequired';

/**
 * Renders SetupRequired when Supabase is not configured; otherwise renders the child route (Outlet).
 */
export function ConfigGate() {
  if (!config.supabaseConfigured) {
    return <SetupRequired />;
  }
  return <Outlet />;
}
