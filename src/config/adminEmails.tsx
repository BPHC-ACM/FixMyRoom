// src/config/adminEmails.ts
import { supabase } from '../supabaseClient';

export const adminEmails = async () => {
  console.log('🔍 Fetching admin emails from database...');
  const { data, error } = await supabase.from('admins').select('email_id');

  if (error) {
    console.error('❌ Error fetching admin emails:', error);
    return [];
  }
  console.log('✅ Admin emails fetched successfully:', data);
  const emailList =
    data?.map((admin: { email_id: string }) => admin.email_id) || [];
  console.log('📋 Processed admin email list:', emailList);
  return emailList;
};
