import { getServiceSupabase } from '../../../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    const supabase = getServiceSupabase();

    const { data: attempt } = await supabase
      .from('attempts')
      .select('quiz_id')
      .eq('id', id)
      .single();

    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    const { data: quiz } = await supabase
      .from('quizzes')
      .select('raw_json')
      .eq('id', attempt.quiz_id)
      .single();

    const { data: responses } = await supabase
      .from('responses')
      .select('*')
      .eq('attempt_id', id);

    let score = 0;
    responses.forEach(response => {
      const correctAnswer = quiz.raw_json[response.question_idx].answer;
      if (response.selected_option === correctAnswer) {
        score++;
      }
    });

    const { error: updateError } = await supabase
      .from('attempts')
      .update({
        score,
        finished_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) throw updateError;

    res.status(200).json({ success: true, score });
  } catch (error) {
    console.error('Finish attempt error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}