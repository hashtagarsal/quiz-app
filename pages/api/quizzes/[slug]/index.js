import { supabase } from '../../../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug } = req.query;

  try {
    const { data, error } = await supabase
      .from('quizzes')
      .select('id, slug, title, raw_json, timer_minutes')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const questions = data.raw_json.map(q => ({
      question: q.question,
      options: q.options
    }));

    res.status(200).json({
      id: data.id,
      slug: data.slug,
      title: data.title,
      questions,
      timer_minutes: data.timer_minutes
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}