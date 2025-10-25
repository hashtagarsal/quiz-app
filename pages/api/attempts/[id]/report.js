import { getServiceSupabase } from '../../../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    const supabase = getServiceSupabase();

    // Get attempt details
    const { data: attempt, error: attemptError } = await supabase
      .from('attempts')
      .select('*')
      .eq('id', id)
      .single();

    if (attemptError || !attempt) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    // Get quiz with all questions
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', attempt.quiz_id)
      .single();

    if (quizError) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Get all responses
    const { data: responses, error: responsesError } = await supabase
      .from('responses')
      .select('*')
      .eq('attempt_id', id)
      .order('question_idx', { ascending: true });

    if (responsesError) throw responsesError;

    // Build detailed report
    const report = quiz.raw_json.map((question, idx) => {
      const response = responses.find(r => r.question_idx === idx);
      const isCorrect = response?.selected_option === question.answer;

      return {
        question_number: idx + 1,
        question: question.question,
        options: question.options,
        correct_answer: question.answer,
        user_answer: response?.selected_option || 'Not answered',
        is_correct: isCorrect
      };
    });

    res.status(200).json({
      participant_name: attempt.participant_name,
      quiz_title: quiz.title,
      score: attempt.score,
      total_questions: quiz.raw_json.length,
      completed_at: attempt.finished_at,
      questions: report
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}