import { getServiceSupabase } from '../../lib/supabaseClient';

const MASTER_PASSWORD = process.env.MASTER_PASSWORD || 'quiz2024';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;

  // Check password
  if (password !== MASTER_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  try {
    const supabase = getServiceSupabase();

    // Get all quizzes with question count
    const { data: quizzes, error } = await supabase
      .from('quizzes')
      .select('id, slug, title, owner_token, timer_minutes, created_at, raw_json')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Add question count to each quiz
    const quizzesWithCount = quizzes.map(quiz => ({
      id: quiz.id,
      slug: quiz.slug,
      title: quiz.title,
      owner_token: quiz.owner_token,
      timer_minutes: quiz.timer_minutes,
      created_at: quiz.created_at,
      question_count: quiz.raw_json.length
    }));

    res.status(200).json({ quizzes: quizzesWithCount });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}