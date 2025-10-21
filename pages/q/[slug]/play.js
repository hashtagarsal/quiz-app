import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import QuestionCard from '../../../components/QuestionCard';
import { ArrowRight } from 'lucide-react';

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
    if (responses[currentIdx]) return;
    
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
      
      setResponses({ ...responses, [currentIdx]: option });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleNext = async () => {
    if (currentIdx === quiz.questions.length - 1) {
      try {
        await fetch(`/api/attempts/${attempt}/finish`, {
          method: 'POST'
        });
        router.push(`/q/${slug}/complete`);
      } catch (err) {
        alert('Error finishing quiz');
      }
    } else {
      setCurrentIdx(currentIdx + 1);
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
  const isLast = currentIdx === quiz.questions.length - 1;

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
          <button
            onClick={handleNext}
            className="w-full p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold flex items-center justify-center gap-2"
          >
            {isLast ? 'Finish Quiz' : 'Next Question'}
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </Layout>
  );
}

