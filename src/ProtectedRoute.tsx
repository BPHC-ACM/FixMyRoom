// src/ProtectedRoute.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { adminEmails } from "./config/adminEmails";

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
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        navigate('/'); // not logged in
        return;
      }

      const allowedDomain = 'hyderabad.bits-pilani.ac.in';
      

      if (!user.email?.endsWith(`@${allowedDomain}`)) {
        await supabase.auth.signOut();
        navigate('/');
        return;
      }

      const adminEmailList = await adminEmails();
      if (
        adminOnly &&
        !adminEmailList.some((admin: { email: string }) => admin.email === user.email)
      ) {
        navigate('/MaintenancePortal'); // not admin
        return;
      }

      setIsChecking(false); // user passed all checks
    })();
  }, [navigate]);

  if (isChecking) {
    return <div className='p-8 text-center'>🔐 Checking access...</div>;
  }

  return <>{children}</>;
}
