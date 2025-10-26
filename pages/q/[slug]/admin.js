import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import { Users, ExternalLink } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const { slug, token } = router.query;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug && token) {
      loadResults();
    }
  }, [slug, token]);

  const loadResults = async () => {
    try {
      const res = await fetch(`/api/quizzes/${slug}/results?token=${token}`);
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || 'Failed to load results');
      }
      
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Loading...">
        <div className="text-center py-12">Loading results...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Error">
        <div className="max-w-md mx-auto text-center py-12">
          <div className="text-red-600 text-xl font-bold mb-4">Access Denied</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </Layout>
    );
  }

  const { quiz, attempts } = data;
  const completedAttempts = attempts.filter(a => a.finished_at);
  const avgScore = completedAttempts.length > 0
    ? (completedAttempts.reduce((sum, a) => sum + a.score, 0) / completedAttempts.length).toFixed(1)
    : 0;

  return (
    <Layout title={`${quiz.title} - Admin`}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{quiz.title}</h1>
            <p className="text-gray-600">Admin Dashboard</p>
          </div>
          <div className="text-right text-sm">
            <div className="text-gray-600">Quiz Code</div>
            <code className="font-mono font-bold">{slug}</code>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="text-blue-600 font-semibold mb-1">Total Attempts</div>
            <div className="text-3xl font-bold">{completedAttempts.length}</div>
          </div>
          
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <div className="text-green-600 font-semibold mb-1">Avg Score</div>
            <div className="text-3xl font-bold">
              {avgScore}
              <span className="text-lg text-gray-600">/{quiz.question_count}</span>
            </div>
          </div>
          
          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
            <div className="text-purple-600 font-semibold mb-1">Questions</div>
            <div className="text-3xl font-bold">{quiz.question_count}</div>
          </div>
        </div>
        
        {completedAttempts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No completed attempts yet</p>
          </div>
        ) : (
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold">Participant</th>
                  <th className="text-left p-4 font-semibold">Score</th>
                  <th className="text-left p-4 font-semibold">Percentage</th>
                  <th className="text-left p-4 font-semibold">Report</th>
                  <th className="text-left p-4 font-semibold">Completed At</th>
                </tr>
              </thead>
              <tbody>
                {completedAttempts.map((attempt) => {
                  const percentage = ((attempt.score / quiz.question_count) * 100).toFixed(0);
                  const reportUrl = `/report/${attempt.id}`;
                  
                  return (
                    <tr key={attempt.id} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="p-4 font-medium">{attempt.participant_name}</td>
                      <td className="p-4">
                        <span className="font-bold">{attempt.score}</span>
                        <span className="text-gray-600">/{quiz.question_count}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                percentage >= 70 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{percentage}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <a
                          href={reportUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium"
                        >
                          View Report
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(attempt.finished_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}