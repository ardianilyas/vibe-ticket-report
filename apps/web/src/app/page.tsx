'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-3xl mx-auto">
        <div className="mb-8">
          <span className="text-6xl">🎫</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
          Ticket Report System
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
          Submit reports, track issues, and get support. Our team is here to help you resolve any problems quickly.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/register">Create Account</Link>
          </Button>
        </div>
      </div>
      <footer className="absolute bottom-8 text-center text-sm text-muted-foreground">
        Built with Next.js, Express, and TypeScript
      </footer>
    </main>
  );
}
