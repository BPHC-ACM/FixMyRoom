// src/config/adminEmails.ts
import { supabase } from '../supabaseClient';

export const adminEmails = async () => {
  const { data, error } = await supabase
    .from('admins')
    .select('email');

  if (error) {
    console.error('Error fetching admin emails:', error);
    return [];
  }
  return data?.map((admin: { email: string }) => admin.email) || [];
};
