// src/config/adminEmails.ts
import { supabase } from '../supabaseClient';

export const adminEmails = async () => {
  const { data, error } = await supabase
    .from('admins')
    .select('name, email');

  if (error) {
    console.error(error);
    return [];
  }
  return data; // [{ name: "John Doe", email: "john@example.com" }, ...]
};
