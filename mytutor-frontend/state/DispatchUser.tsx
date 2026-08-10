'use client'
import { useEffect } from 'react'
import useAuthentication from '@/components/account/auth/authentication'
import useLoading from '@/components/customs/loading/LoadingHook'

export default function DispatchUser({
  children
}: {
  children: React.ReactNode
}) {
  const authentication = useAuthentication()
  const loading = useLoading(true);

  useEffect(() => {
    loading.startLoading();
    authentication.requireLogin()?.then(loading.stopLoading).catch(loading.stopLoading) || loading.stopLoading() ; 
  }, []);

  return (<>
            {children}
        </>)
}

