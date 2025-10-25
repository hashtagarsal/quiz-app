import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { CheckCircle, XCircle, Download } from 'lucide-react';

export default function ParticipantReport() {
  const router = useRouter();
  const { attemptId } = router.query;
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (attemptId) {
      loadReport();
    }
  }, [attemptId]);

  const loadReport = async () => {
    try {
      const res = await fetch(`/api/attempts/${attemptId}/report`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load report');
      }
      
      setReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const printReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <Layout title="Loading Report...">
        <div className="text-center py-12">Loading report...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Error">
        <div className="max-w-md mx-auto text-center py-12">
          <div className="text-red-600 text-xl font-bold mb-4">Error</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </Layout>
    );
  }

  const percentage = ((report.score / report.total_questions) * 100).toFixed(0);

  return (
    <Layout title={`Report - ${report.participant_name}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{report.quiz_title}</h1>
              <p className="text-xl text-gray-600 mt-2">Report for {report.participant_name}</p>
            </div>
            <button
              onClick={printReport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 print:hidden"
            >
              <Download className="w-4 h-4" />
              Print/Save PDF
            </button>
          </div>

          {/* Score Summary */}
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="text-blue-600 font-semibold mb-1">Final Score</div>
              <div className="text-3xl font-bold">
                {report.score}/{report.total_questions}
              </div>
            </div>
            
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <div className="text-green-600 font-semibold mb-1">Percentage</div>
              <div className="text-3xl font-bold">{percentage}%</div>
            </div>
            
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
              <div className="text-purple-600 font-semibold mb-1">Completed</div>
              <div className="text-sm font-medium">
                {new Date(report.completed_at).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Questions Report */}
        <div className="space-y-4">
          {report.questions.map((q, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-lg shadow p-6 border-l-4 ${
                q.is_correct ? 'border-green-500' : 'border-red-500'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {q.is_correct ? (
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-500" />
                  )}
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Question {q.question_number}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        q.is_correct
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {q.is_correct ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 text-base">{q.question}</p>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-600">Options:</div>
                    <div className="space-y-1">
                      {q.options.map((option, optIdx) => (
                        <div
                          key={optIdx}
                          className={`p-2 rounded ${
                            option === q.correct_answer
                              ? 'bg-green-50 border border-green-300'
                              : option === q.user_answer && !q.is_correct
                              ? 'bg-red-50 border border-red-300'
                              : 'bg-gray-50'
                          }`}
                        >
                          <span className="text-sm">
                            {option}
                            {option === q.correct_answer && (
                              <span className="ml-2 text-green-600 font-semibold">
                                ✓ Correct Answer
                              </span>
                            )}
                            {option === q.user_answer && option !== q.correct_answer && (
                              <span className="ml-2 text-red-600 font-semibold">
                                ✗ Your Answer
                              </span>
                            )}
                            {option === q.user_answer && option === q.correct_answer && (
                              <span className="ml-2 text-green-600 font-semibold">
                                ✓ Your Answer
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary at Bottom */}
        <div className="bg-gray-50 rounded-lg p-6 text-center print:hidden">
          <p className="text-gray-600">
            You got <span className="font-bold text-gray-900">{report.score}</span> out of{' '}
            <span className="font-bold text-gray-900">{report.total_questions}</span> questions correct
            ({percentage}%)
          </p>
        </div>
      </div>
    </Layout>
  );
}