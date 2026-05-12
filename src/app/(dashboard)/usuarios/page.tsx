import { createAdminClient } from '@/lib/supabase/admin';
import { UsuariosTabs } from './usuarios-tabs';
import type { User } from '@/types/app';

// Mock data for development
const MOCK_USERS: User[] = [];

async function getUsers(): Promise<User[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);
    if (error) throw error;
    return data?.length ? data : MOCK_USERS;
  } catch {
    return MOCK_USERS;
  }
}

export default async function UsuariosPage() {
  const users = await getUsers();

  return <UsuariosTabs users={users} />;
}
