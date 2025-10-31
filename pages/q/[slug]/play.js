import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import QuestionCard from '../../../components/QuestionCard';
import { Clock, AlertCircle } from 'lucide-react';

export default function PlayQuiz() {
  const router = useRouter();
  const { slug, attempt } = router.query;
  
  const [quiz, setQuiz] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [startTime] = useState(Date.now());
  
  const timerRef = useRef(null);

  useEffect(() => {
    if (slug && attempt) {
      loadQuiz();
    }
    
    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [slug, attempt]);

  useEffect(() => {
    // Start timer if quiz has time limit
    if (quiz && quiz.timer_minutes) {
      const totalSeconds = quiz.timer_minutes * 60;
      setTimeRemaining(totalSeconds);
      
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up!
            clearInterval(timerRef.current);
            finishQuiz(true); // Auto-submit
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [quiz]);

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
      
      setTimeout(() => {
        if (currentIdx === quiz.questions.length - 1) {
          finishQuiz(false);
        } else {
          setCurrentIdx(currentIdx + 1);
        }
      }, 800);
      
    } catch (err) {
      alert(err.message);
    }
  };

  const finishQuiz = async (timedOut = false) => {
  if (timerRef.current) {
    clearInterval(timerRef.current);
  }
  
  const timeTaken = Math.floor((Date.now() - startTime) / 1000);
  
  try {
    const res = await fetch(`/api/attempts/${attempt}/finish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ time_taken: timeTaken })
    });
    
    const data = await res.json();
    
    if (!res.ok) throw new Error('Failed to finish quiz');
    
    // Pass attempt ID to complete page
    if (timedOut) {
      router.push(`/q/${slug}/complete?timeout=true&attempt=${attempt}`);
    } else {
      router.push(`/q/${slug}/complete?attempt=${attempt}`);
    }
  } catch (err) {
    alert('Error finishing quiz');
  }
};
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
  const isWarning = timeRemaining !== null && timeRemaining < 60; // Last minute warning

  return (
    <Layout title={quiz.title}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center text-sm">
          <div className="text-gray-600">
            Question {currentIdx + 1} of {quiz.questions.length}
          </div>
          
          {timeRemaining !== null && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
              isWarning ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              <Clock className="w-4 h-4" />
              {formatTime(timeRemaining)}
            </div>
          )}
        </div>
        
        {isWarning && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">
              Less than 1 minute remaining! Quiz will auto-submit when time runs out.
            </p>
          </div>
        )}
        
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