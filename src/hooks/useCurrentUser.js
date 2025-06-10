'use client';
import { useState, useEffect } from 'react';

const getInitialUser = () =>
  (typeof window !== 'undefined' && localStorage.getItem('selectedUser')) ||
  'ximena';

export default function useCurrentUser() {
  const [user, setUser] = useState(getInitialUser());

  useEffect(() => {
    const handleChange = () => setUser(getInitialUser());
    window.addEventListener('userchange', handleChange);
    return () => window.removeEventListener('userchange', handleChange);
  }, []);

  return user;
}
