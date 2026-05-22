export const toastConfig = {
  duration: 4000,
  position: 'top-center' as const,
  style: {
    borderRadius: '8px',
    background: '#363636',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '500',
    padding: '12px 16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    fontFamily: 'var(--font-manrope)',
  },
  success: {
    style: {
      background: '#10B981',
      color: '#fff',
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: '500',
      fontFamily: 'var(--font-manrope)',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#10B981',
    },
  },
  error: {
    style: {
      background: '#EF4444',
      color: '#fff',
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: '500',
      fontFamily: 'var(--font-manrope)',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#EF4444',
    },
  },
  loading: {
    style: {
      background: '#6B7280',
      color: '#fff',
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: '500',
      fontFamily: 'var(--font-manrope)',
    },
  },
} as const;
