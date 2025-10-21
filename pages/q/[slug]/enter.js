import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';

export default function EnterQuiz() {
  const router = useRouter();
  const { slug } = router.query;
  
  const [quiz, setQuiz] = useState(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      loadQuiz();
    }
  }, [slug]);

  const loadQuiz = async () => {
    try {
      const res = await fetch(`/api/quizzes/${slug}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Quiz not found');
      }
      
      setQuiz(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }
    
    try {
      const res = await fetch(`/api/quizzes/${slug}/attempts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participant_name: name.trim() })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error);
      }
      
      router.push(`/q/${slug}/play?attempt=${data.attempt_id}`);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <Layout title="Loading...">
        <div className="text-center py-12">Loading quiz...</div>
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

  return (
    <Layout title={quiz?.title || 'Quiz'}>
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">{quiz.title}</h1>
          <p className="text-gray-600">{quiz.questions?.length || 0} questions</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-3 border rounded-lg"
              onKeyPress={(e) => e.key === 'Enter' && handleStart()}
            />
          </div>
          
          <button
            onClick={handleStart}
            className="w-full p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
          >
            Start Quiz
          </button>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
          <strong>Note:</strong> You can only answer each question once. No going back!
        </div>
      </div>
    </Layout>
  );
}


