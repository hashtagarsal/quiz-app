import { useState } from 'react';
import Layout from '../components/Layout';
import { Lock, Eye, EyeOff, Copy, ExternalLink, Trash2 } from 'lucide-react';

export default function MyQuizzes() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/my-quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid password');
      }

      setQuizzes(data.quizzes);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  const deleteQuiz = async (quizId, slug) => {
    if (!confirm('Are you sure you want to delete this quiz? This cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/quizzes/${slug}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (!res.ok) {
        throw new Error('Failed to delete quiz');
      }

      // Remove from list
      setQuizzes(quizzes.filter(q => q.id !== quizId));
      alert('Quiz deleted successfully');
    } catch (err) {
      alert(err.message);
    }
  };

  // Login View
  if (!isAuthenticated) {
    return (
      <Layout title="My Quizzes">
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold">My Quizzes</h1>
            <p className="text-gray-600">Enter master password to view all quizzes</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Master Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Enter password"
                  className="w-full p-3 border rounded-lg pr-12"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading || !password}
              className="w-full p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'View My Quizzes'}
            </button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Don't have the password? Contact the administrator.</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Quiz List View
  return (
    <Layout title="My Quizzes">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">My Quizzes</h1>
            <p className="text-gray-600">{quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''} created</p>
          </div>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Logout
          </button>
        </div>

        {quizzes.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No quizzes created yet</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {quizzes.map((quiz) => {
              const participantUrl = `${window.location.origin}/q/${quiz.slug}/enter`;
              const adminUrl = `${window.location.origin}/q/${quiz.slug}/admin?token=${quiz.owner_token}`;

              return (
                <div key={quiz.id} className="bg-white border-2 rounded-lg p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{quiz.title}</h3>
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        <span>Code: <span className="font-mono font-semibold">{quiz.slug}</span></span>
                        <span>Questions: {quiz.question_count}</span>
                        {quiz.timer_minutes && (
                          <span>Timer: {quiz.timer_minutes} min</span>
                        )}
                        <span>Created: {new Date(quiz.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteQuiz(quiz.id, quiz.slug)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Delete Quiz"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    {/* Participant Link */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">Participant Link</div>
                      <div className="flex gap-2">
                        <input
                          readOnly
                          value={participantUrl}
                          className="flex-1 p-2 bg-gray-50 border rounded text-sm font-mono"
                        />
                        <button
                          onClick={() => copyToClipboard(participantUrl, 'Participant link')}
                          className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
                          title="Copy Link"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <a
                          href={participantUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                          title="Open Link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    {/* Admin Link */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-red-700">Admin Link (Secret)</div>
                      <div className="flex gap-2">
                        <input
                          readOnly
                          value={adminUrl}
                          className="flex-1 p-2 bg-red-50 border border-red-200 rounded text-xs font-mono"
                        />
                        <button
                          onClick={() => copyToClipboard(adminUrl, 'Admin link')}
                          className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                          title="Copy Link"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <a
                          href={adminUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-gray-700 text-white rounded hover:bg-gray-800"
                          title="Open Admin"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}