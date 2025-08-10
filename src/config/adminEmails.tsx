import { supabase } from '../supabaseClient';

export const adminEmails = async () => {
  const { data } = await supabase.from('admins').select('email_id');
  return data?.map(a => a.email_id) || [];
};