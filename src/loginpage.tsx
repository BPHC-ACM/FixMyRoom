'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './components/button';
import { Card, CardContent } from './components/card';
import { Building } from 'lucide-react';
import { supabase } from './supabaseClient';

export default function LoginPage() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🚀 Starting Google OAuth login...');

      // Clear any existing auth state to prevent conflicts
      console.log('🧹 Clearing existing auth state...');
      await supabase.auth.signOut();
      console.log('✅ Auth state cleared');

      // Use configured redirect URL or fallback to current origin
      const redirectTo =
        import.meta.env.VITE_REDIRECT_URL ||
        `${window.location.origin}/redirect`;
      console.log('🔗 Redirect URL:', redirectTo);
      console.log('🏫 Domain restriction: hyderabad.bits-pilani.ac.in');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            prompt: 'consent',
            access_type: 'offline',
            hd: 'hyderabad.bits-pilani.ac.in',
          },
        },
      });

      console.log('📋 OAuth response data:', data);
      console.log('❌ OAuth response error:', error);

      if (error) {
        console.error('💥 Login error:', error.message);
        setError('Login failed: ' + error.message);
        setIsLoading(false);
      } else {
        console.log(
          '✅ OAuth initiated successfully, redirecting to Google...'
        );
      }
    } catch (err) {
      console.error('💥 Unexpected error during login:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex flex-col'>
      {/* Header with BPHC branding */}
      <header className='bg-blue-800 text-white py-4 px-6'>
        <div className='container mx-auto flex items-center'>
          <div className='flex items-center space-x-2'>
            <Building className='h-6 w-6' />
            <span className='font-bold text-lg'>Fix My Room</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className='flex-grow flex items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white'>
        <div className='absolute inset-0 overflow-hidden z-0 pointer-events-none'>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%22100%22 height=%22100%22 viewBox=%220 0 100 100%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z%22 fill=%22%233b82f6%22 fillOpacity=%220.05%22 fillRule=%22evenodd%22/%3E%3C/svg%3E')] opacity-70"></div>

          {/* Campus building silhouettes */}
          <div
            className='absolute bottom-0 left-0 right-0 h-48 bg-contain bg-bottom bg-no-repeat'
            style={{
              backgroundImage: "url('/placeholder.svg?height=200&width=1200')",
            }}
          ></div>
        </div>

        <Card className='w-full max-w-md shadow-xl relative z-10 border-blue-100'>
          <div className='bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-t-lg text-white text-center'>
            <div className='flex justify-center mb-3'>
              <Building className='w-8 h-8' />
            </div>
            <h1 className='text-2xl font-bold'>Fix My Room</h1>
            <p className='text-blue-100 mt-1'>
              Sign in to report and track maintenance issues
            </p>
          </div>

          <CardContent className='p-8 space-y-6'>
            <div className='text-center mb-6'>
              <div className='bg-blue-50 p-4 rounded-lg mb-6'>
                <div className='flex items-center justify-center space-x-2 text-blue-800'>
                  <span className='font-medium'>Hostel Maintenance Portal</span>
                </div>
                <p className='text-sm text-gray-600 mt-2'>
                  Report maintenance issues in your hostel room and track their
                  resolution status
                </p>
              </div>

              {error && (
                <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
                  <p className='text-sm text-red-700'>{error}</p>
                </div>
              )}

              <Button
                onClick={loginWithGoogle}
                className='w-full py-6 text-base flex items-center justify-center space-x-3'
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></div>
                ) : (
                  <svg className='w-5 h-5 mr-2 text-white' viewBox='0 0 24 24'>
                    <path
                      fill='currentColor'
                      d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                    />
                    <path
                      fill='currentColor'
                      d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                    />
                    <path
                      fill='currentColor'
                      d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                    />
                    <path
                      fill='currentColor'
                      d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                    />
                    <path fill='none' d='M1 1h22v22H1z' />
                  </svg>
                )}
                <span className='text-white'>
                  {isLoading ? 'Signing in...' : 'Sign in with Google'}
                </span>
              </Button>

              <p className='text-sm text-gray-500 mt-6'>
                Use your BITS email to access Fix My Room
              </p>
            </div>

            <div className='border-t border-gray-200 pt-4 text-center'>
              <p className='text-sm text-gray-600'>
                For assistance, contact the hostel administration office
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className='bg-gray-100 py-4 px-6 text-sm text-gray-600'>
        <div className='container m-auto flex flex-col items-center justify-center h-full text-center space-y-1'>
          <p className='mb-0'>
            © {new Date().getFullYear()} ACM BITS Hyderabad
          </p>
          <p className='mb-0 text-xs text-gray-500'>
            Sudheendra Rao | K Vikashh Adaikalavan
          </p>
        </div>
      </footer>
    </div>
  );
}
