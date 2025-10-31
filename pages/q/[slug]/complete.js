import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import Link from 'next/link';
import { Clock, ExternalLink } from 'lucide-react';

export default function Complete() {
  const router = useRouter();
  const { slug, timeout, attempt } = router.query;
  const isTimeout = timeout === 'true';
  
  const [attemptData, setAttemptData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (attempt) {
      loadAttemptData();
    } else {
      setLoading(false);
    }
  }, [attempt]);

  const loadAttemptData = async () => {
    try {
      const res = await fetch(`/api/attempts/${attempt}/report`);
      const data = await res.json();
      
      if (res.ok) {
        setAttemptData(data);
      }
    } catch (err) {
      console.error('Error loading attempt data:', err);
    } finally {
      setLoading(false);
    }
  };

  const reportUrl = attempt ? `/report/${attempt}` : null;
  const percentage = attemptData 
    ? ((attemptData.score / attemptData.total_questions) * 100).toFixed(0)
    : null;

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
        
        {loading ? (
          <div className="text-gray-600">Loading your results...</div>
        ) : attemptData ? (
          <>
            <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
              <div className="text-gray-600">Your Score</div>
              <div className="text-5xl font-bold text-blue-600">
                {attemptData.score}/{attemptData.total_questions}
              </div>
              <div className="text-2xl font-semibold text-gray-700">
                {percentage}%
              </div>
              
              {/* Score visualization */}
              <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
                <div
                  className={`h-3 rounded-full transition-all ${
                    percentage >= 70 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              <div className="text-sm text-gray-500 mt-2">
                {percentage >= 70 ? '🎉 Excellent work!' : percentage >= 50 ? '👍 Good job!' : '💪 Keep practicing!'}
              </div>
            </div>

            {reportUrl && (
              <a
                href={reportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 w-full p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold justify-center"
              >
                View Detailed Report
                <ExternalLink className="w-5 h-5" />
              </a>
            )}

            <p className="text-gray-500 text-sm">
              Review your answers and see which questions you got right or wrong
            </p>
          </>
        ) : (
          <p className="text-xl text-gray-600">
            {isTimeout 
              ? 'The quiz timer has expired and your answers have been submitted.'
              : 'Thank you for participating!'
            }
          </p>
        )}
        
        <Link
          href="/"
          className="inline-block w-full p-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
        >
          Back to Home
        </Link>
      </div>
    </Layout>
  );
}