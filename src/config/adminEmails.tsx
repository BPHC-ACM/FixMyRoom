// src/config/adminEmails.ts
import { supabase } from '../supabaseClient';

export const adminEmails = async () => {
  const { data, error } = await supabase.from('admins').select('email_id');

  if (error) {
    console.error('Error fetching admin emails:', error);
    return [];
  }
  return data?.map((admin: { email_id: string }) => admin.email_id) || [];
};
