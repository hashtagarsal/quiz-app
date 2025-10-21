import { getServiceSupabase } from '../../../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { question_idx, selected_option } = req.body;

  if (question_idx === undefined || !selected_option) {
    return res.status(400).json({ error: 'question_idx and selected_option are required' });
  }

  try {
    const supabase = getServiceSupabase();

    const { data: existing } = await supabase
      .from('responses')
      .select('id')
      .eq('attempt_id', id)
      .eq('question_idx', question_idx)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Question already answered' });
    }

    const { data, error } = await supabase
      .from('responses')
      .insert({
        attempt_id: id,
        question_idx,
        selected_option,
        is_locked: true
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Save response error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

