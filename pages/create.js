import { useState } from 'react';
import Layout from '../components/Layout';
import { Copy, Clock } from 'lucide-react';

export default function CreateQuiz() {
  const [title, setTitle] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [timerMinutes, setTimerMinutes] = useState('');
  const [createdQuiz, setCreatedQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    setError('');
    setLoading(true);
    
    try {
      const rawJson = JSON.parse(jsonInput);
      
      const payload = {
        title,
        raw_json: rawJson
      };
      
      // Add timer if specified
      if (timerMinutes && parseInt(timerMinutes) > 0) {
        payload.timer_minutes = parseInt(timerMinutes);
      }
      
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create quiz');
      }
      
      setCreatedQuiz(data);
      setTitle('');
      setJsonInput('');
      setTimerMinutes('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (createdQuiz) {
    const participantUrl = `${window.location.origin}/q/${createdQuiz.slug}/enter`;
    const adminUrl = `${window.location.origin}/q/${createdQuiz.slug}/admin?token=${createdQuiz.owner_token}`;
    
    return (
      <Layout title="Quiz Created">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold">Quiz Created!</h1>
            <p className="text-gray-600">Share the link with participants</p>
          </div>
          
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 space-y-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Participant Link</div>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={participantUrl}
                  className="flex-1 p-3 bg-white rounded font-mono text-sm"
                />
                <button
                  onClick={() => copyToClipboard(participantUrl)}
                  className="p-3 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600 mb-1">Admin Link (Keep Secret!)</div>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={adminUrl}
                  className="flex-1 p-3 bg-white rounded font-mono text-xs break-all"
                />
                <button
                  onClick={() => copyToClipboard(adminUrl)}
                  className="p-3 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setCreatedQuiz(null)}
            className="w-full p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Create Another Quiz
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Create Quiz">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Create New Quiz</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Quiz Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Awesome Quiz"
              className="w-full p-3 border rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Timer (Optional)
            </label>
            <input
              type="number"
              value={timerMinutes}
              onChange={(e) => setTimerMinutes(e.target.value)}
              placeholder="Leave empty for no timer"
              min="1"
              max="180"
              className="w-full p-3 border rounded-lg"
            />
            <p className="text-sm text-gray-500 mt-1">
              Set time limit in minutes (e.g., 30 for 30 minutes). Leave empty for unlimited time.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Quiz JSON</label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='[{"question":"What is 2+2?","options":["3","4","5"],"answer":"4"}]'
              className="w-full p-3 border rounded-lg font-mono text-sm"
              rows={12}
            />
          </div>
          
          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold disabled:opacity-50"
          >
            {loading ? 'Creating Quiz...' : 'Create Quiz'}
          </button>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg text-sm">
          <div className="font-semibold mb-2">Example Format:</div>
          <pre className="bg-white p-3 rounded overflow-x-auto text-xs">
{`[
  {
    "question": "What is 2+2?",
    "options": ["3", "4", "5", "6"],
    "answer": "4"
  },
  {
    "question": "Capital of France?",
    "options": ["London", "Berlin", "Paris", "Madrid"],
    "answer": "Paris"
  }
]`}
          </pre>
        </div>
      </div>
    </Layout>
  );
}