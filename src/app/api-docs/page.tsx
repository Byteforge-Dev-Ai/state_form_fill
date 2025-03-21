'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ApiDocs() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the Swagger UI route
    router.replace('/api/swagger');
  }, [router]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-center items-center h-40">
        <p>Redirecting to API documentation...</p>
      </div>
    </div>
  );
} 