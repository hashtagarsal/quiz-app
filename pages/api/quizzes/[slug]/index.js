import { supabase } from '../../../../lib/supabaseClient';
import { getServiceSupabase } from '../../../../lib/supabaseClient';

const MASTER_PASSWORD = process.env.MASTER_PASSWORD || 'quiz2024';

export default async function handler(req, res) {
  const { slug } = req.query;

  // GET method (existing)
  if (req.method === 'GET') {
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

  // DELETE method (NEW)
  else if (req.method === 'DELETE') {
    const { password } = req.body;

    if (password !== MASTER_PASSWORD) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    try {
      const serviceSupabase = getServiceSupabase();

      const { error } = await serviceSupabase
        .from('quizzes')
        .delete()
        .eq('slug', slug);

      if (error) throw error;

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Delete quiz error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}