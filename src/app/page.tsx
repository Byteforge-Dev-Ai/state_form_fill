import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://nextjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Powered by{' '}
            <Image
              src="/next.svg"
              alt="Next.js Logo"
              width={100}
              height={24}
              style={{ width: 'auto', height: '24px' }}
              priority
            />
          </a>
        </div>
        <div className="flex flex-col items-end justify-center lg:static lg:h-auto">
          <Link href="/api-docs" className="text-blue-600 hover:underline">
            API Documentation
          </Link>
        </div>
      </div>

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-full before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 sm:before:w-[480px] sm:after:w-[240px]">
        <h1 className="text-4xl font-bold text-center mb-6">NC Cigar Sales Form Filler</h1>
      </div>

      <div className="mt-12 max-w-3xl text-center">
        <p className="mb-6">
          Streamline your North Carolina cigar tax reporting with our easy-to-use form filler. Calculate taxes accurately, generate official PDFs, and maintain compliance with state regulations.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">For Business Owners</h2>
            <p className="mb-4">Save time and ensure accurate tax calculations for your cigar sales.</p>
            <Button asChild>
              <Link href="/auth/register">Register Now</Link>
            </Button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Existing Users</h2>
            <p className="mb-4">Access your account to manage forms and submit tax reports.</p>
            <Button variant="secondary" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
        
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-medium">Tax Calculation</h3>
              <p>Automatic tax calculations based on current NC rates</p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-medium">PDF Generation</h3>
              <p>Create official B-A-101 Schedule A PDF forms</p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-medium">Record Keeping</h3>
              <p>Securely store your submission history</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 