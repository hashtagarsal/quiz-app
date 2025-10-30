import { getServiceSupabase } from '../../../lib/supabaseClient';

const MASTER_PASSWORD = process.env.MASTER_PASSWORD || 'quiz2024';

export default async function handler(req, res) {
  const { slug } = req.query;

  // Existing GET method
  if (req.method === 'GET') {
    // ... existing code ...
  }

  // NEW: DELETE method
  if (req.method === 'DELETE') {
    const { password } = req.body;

    if (password !== MASTER_PASSWORD) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    try {
      const supabase = getServiceSupabase();

      // Delete quiz (cascades to attempts and responses)
      const { error } = await supabase
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
}