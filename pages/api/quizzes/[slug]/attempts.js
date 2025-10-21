import { getServiceSupabase } from '../../../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug } = req.query;
  const { participant_name } = req.body;

  if (!participant_name) {
    return res.status(400).json({ error: 'participant_name is required' });
  }

  try {
    const supabase = getServiceSupabase();

    const { data: quiz } = await supabase
      .from('quizzes')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const { data: attempt, error } = await supabase
      .from('attempts')
      .insert({
        quiz_id: quiz.id,
        participant_name
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ attempt_id: attempt.id });
  } catch (error) {
    console.error('Create attempt error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

