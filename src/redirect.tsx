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

    const handleUserRedirect = async (user: any) => {
      try {
        console.log('Processing user:', user.email);
        
        if (!user?.email || !user.email.endsWith(`@${allowedDomain}`)) {
          console.log('User email not allowed:', user?.email);
          await supabase.auth.signOut();
          navigate('/');
          return;
        }
        
        const emails = await adminEmails();
        console.log('Admin emails:', emails);
        console.log('User email:', user.email);
        
        if (emails.includes(user.email)) {
          console.log('Redirecting to admin dashboard');
          navigate('/AdminDashboard');
        } else {
          console.log('Redirecting to maintenance portal');
          navigate('/MaintenancePortal');
        }
      } catch (err) {
        console.error('Error in handleUserRedirect:', err);
        setError('Failed to process user authentication');
      }
    };

    const tryGetSession = async () => {
      try {
        console.log('Getting session...');
        const { data, error } = await supabase.auth.getSession();
        const session = data.session;
        
        if (error) {
          console.error('Session error:', error);
          setError(`Session error: ${error.message}`);
          navigate('/');
          return;
        }
        
        if (session?.user) {
          console.log('Session found, processing user...');
          await handleUserRedirect(session.user);
        } else {
          console.log('No session found, waiting for auth state change...');
          // Don't redirect immediately, wait for auth state change
        }
      } catch (err) {
        console.error('Error getting session:', err);
        setError('Failed to get session');
      }
    };

    tryGetSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session?.user) {
        await handleUserRedirect(session.user);
      } else if (event === 'SIGNED_OUT') {
        navigate('/');
      }
    });

    // Set a timeout to show error if nothing happens
    const timeout = setTimeout(() => {
      if (isProcessing) {
        console.log('Timeout reached, no authentication completed');
        setError('Authentication timeout. Please try again.');
      }
    }, 10000); // 10 seconds timeout

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate, isProcessing]);

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
