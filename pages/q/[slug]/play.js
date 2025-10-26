import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import QuestionCard from '../../../components/QuestionCard';

export default function PlayQuiz() {
  const router = useRouter();
  const { slug, attempt } = router.query;
  
  const [quiz, setQuiz] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug && attempt) {
      loadQuiz();
    }
  }, [slug, attempt]);

  const loadQuiz = async () => {
    try {
      const res = await fetch(`/api/quizzes/${slug}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setQuiz(data);
      setLoading(false);
    } catch (err) {
      alert(err.message);
      router.push('/');
    }
  };

  const handleAnswer = async (option) => {
    if (responses[currentIdx]) return; // Already answered
    
    try {
      const res = await fetch(`/api/attempts/${attempt}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_idx: currentIdx,
          selected_option: option
        })
      });
      
      if (!res.ok) throw new Error('Failed to save response');
      
      // Mark as answered
      setResponses({ ...responses, [currentIdx]: option });
      
      // Wait 1 second to show selection, then auto-advance
      setTimeout(() => {
        if (currentIdx === quiz.questions.length - 1) {
          // Last question - finish quiz
          finishQuiz();
        } else {
          // Move to next question
          setCurrentIdx(currentIdx + 1);
        }
      }, 500); // 1 second delay
      
    } catch (err) {
      alert(err.message);
    }
  };

  const finishQuiz = async () => {
    try {
      await fetch(`/api/attempts/${attempt}/finish`, {
        method: 'POST'
      });
      router.push(`/q/${slug}/complete`);
    } catch (err) {
      alert('Error finishing quiz');
    }
  };

  if (loading || !quiz) {
    return (
      <Layout title="Loading...">
        <div className="text-center py-12">Loading...</div>
      </Layout>
    );
  }

  const question = quiz.questions[currentIdx];
  const isAnswered = !!responses[currentIdx];

  return (
    <Layout title={quiz.title}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center text-sm">
          <div className="text-gray-600">
            Question {currentIdx + 1} of {quiz.questions.length}
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${((currentIdx + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>
        
        <QuestionCard
          question={question.question}
          options={question.options}
          selectedOption={responses[currentIdx]}
          onSelect={handleAnswer}
          isLocked={isAnswered}
        />
        
        {isAnswered && (
          <div className="text-center text-gray-600 text-sm">
            {currentIdx === quiz.questions.length - 1 
              ? 'Finishing quiz...' 
              : 'Moving to next question...'}
          </div>
        )}
      </div>
    </Layout>
  );
}