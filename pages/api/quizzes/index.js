import { getServiceSupabase } from '../../../lib/supabaseClient';
import { generateSlug, generateToken, validateQuizJson } from '../../../lib/utils';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, raw_json, timer_minutes } = req.body;

    if (!raw_json) {
      return res.status(400).json({ error: 'raw_json is required' });
    }

    validateQuizJson(raw_json);

    const slug = generateSlug();
    const ownerToken = generateToken();
    const supabase = getServiceSupabase();

    const quizData = {
      slug,
      title: title || 'Untitled Quiz',
      raw_json,
      owner_token: ownerToken
    };

    // Add timer if provided
    if (timer_minutes && timer_minutes > 0) {
      quizData.timer_minutes = timer_minutes;
    }

    const { data, error } = await supabase
      .from('quizzes')
      .insert(quizData)
      .select()sss
      .single();

    if (error) throw error;

    res.status(201).json({
      slug: data.slug,
      owner_token: data.owner_token
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(400).json({ error: error.message });
  }
}