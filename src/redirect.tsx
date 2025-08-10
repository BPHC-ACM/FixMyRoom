import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { adminEmails } from './config/adminEmails';

export default function RedirectPage() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const allowedDomain = 'hyderabad.bits-pilani.ac.in';
    let hasHandledRedirect = false;
    const handleUserRedirect = async (user: any) => {
      if (hasHandledRedirect) return;
      hasHandledRedirect = true;

      try {
        if (!user?.email || !user.email.endsWith(`@${allowedDomain}`)) {
          await supabase.auth.signOut();

          navigate('/');
          return;
        }

        const emails = await adminEmails();

        const isAdmin = emails.includes(user.email);

        setIsProcessing(false);

        if (isAdmin) {
          navigate('/AdminDashboard');
        } else {
          navigate('/MaintenancePortal');
        }
      } catch (err) {
        console.error('💥 Error in handleUserRedirect:', err);
        setError('Failed to process user authentication');
        setIsProcessing(false);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await handleUserRedirect(session.user);
      } else if (event === 'SIGNED_OUT') {
        navigate('/');
      }
    });

    const timeout = setTimeout(() => {
      if (isProcessing) {
        setError('Authentication timeout. Please try again.');
      }
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate]);

  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center max-w-md'>
          <div className='text-red-500 text-6xl mb-4'>⚠️</div>
          <h1 className='text-2xl font-semibold text-gray-700 mb-4'>
            Authentication Error
          </h1>
          <p className='text-gray-500 mb-6'>{error}</p>
          <button
            onClick={() => navigate('/')}
            className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='text-center'>
        <div className='w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto'></div>
        <h1 className='mt-4 text-2xl font-semibold text-gray-700'>
          {isProcessing ? 'Finalizing your login...' : 'Redirecting...'}
        </h1>
        <p className='text-gray-500'>
          Please wait, we're processing your authentication.
        </p>
      </div>
    </div>
  );
}
