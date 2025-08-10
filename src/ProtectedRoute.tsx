// src/ProtectedRoute.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { adminEmails } from './config/adminEmails';

export default function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    (async () => {
      console.log('🛡️ ProtectedRoute checking access...');
      console.log('🔐 Admin only mode:', adminOnly);

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.log('❌ No user found or error:', error);
        navigate('/'); // not logged in
        return;
      }

      console.log('✅ User found:', user.email);
      const allowedDomain = 'hyderabad.bits-pilani.ac.in';

      if (!user.email?.endsWith(`@${allowedDomain}`)) {
        console.log('❌ User domain not allowed:', user.email);
        await supabase.auth.signOut();
        navigate('/');
        return;
      }

      console.log('✅ User domain is valid');

      if (adminOnly) {
        console.log('🔍 Checking admin status...');
        const adminEmailList = await adminEmails();
        if (!adminEmailList.includes(user.email)) {
          console.log(
            '❌ User is not an admin, redirecting to MaintenancePortal'
          );
          navigate('/MaintenancePortal'); // not admin
          return;
        }
        console.log('✅ User is an admin');
      }

      console.log('✅ Access granted - rendering protected content');
      setIsChecking(false); // user passed all checks
    })();
  }, [navigate, adminOnly]);

  if (isChecking) {
    return <div className='p-8 text-center'>🔐 Checking access...</div>;
  }

  return <>{children}</>;
}
