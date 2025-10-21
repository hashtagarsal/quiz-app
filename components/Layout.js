import Head from 'next/head';
import Link from 'next/link';

export default function Layout({ children, title = 'Quiz App' }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Quiz App
            </Link>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
      </div>
    </>
  );
}