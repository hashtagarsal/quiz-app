import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import Link from 'next/link';
import { Clock } from 'lucide-react';

export default function Complete() {
  const router = useRouter();
  const { timeout } = router.query;
  const isTimeout = timeout === 'true';

  return (
    <Layout title="Quiz Complete">
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
          isTimeout ? 'bg-yellow-500' : 'bg-green-500'
        }`}>
          {isTimeout ? (
            <Clock className="w-12 h-12 text-white" />
          ) : (
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        
        <h1 className="text-4xl font-bold">
          {isTimeout ? 'Time\'s Up!' : 'Quiz Complete!'}
        </h1>
        
        <p className="text-xl text-gray-600">
          {isTimeout 
            ? 'The quiz timer has expired and your answers have been submitted.'
            : 'Thank you for participating!'
          }
        </p>
        
        <p className="text-gray-500">
          Your responses have been submitted. The quiz creator will review the results.
        </p>
        
        <Link
          href="/"
          className="inline-block w-full p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Back to Home
        </Link>
      </div>
    </Layout>
  );
}