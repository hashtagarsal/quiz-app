import { getServiceSupabase } from '../../../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug, token } = req.query;

  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }

  try {
    const supabase = getServiceSupabase();

    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('slug', slug)
      .single();

    if (quizError || !quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    if (quiz.owner_token !== token) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    const { data: attempts, error: attemptsError } = await supabase
      .from('attempts')
      .select('*')
      .eq('quiz_id', quiz.id)
      .order('finished_at', { ascending: false });

    if (attemptsError) throw attemptsError;

    res.status(200).json({
      quiz: {
        id: quiz.id,
        slug: quiz.slug,
        title: quiz.title,
        question_count: quiz.raw_json.length
      },
      attempts
    });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

