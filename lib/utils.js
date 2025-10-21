export const generateSlug = () => {
  return Math.random().toString(36).substring(2, 10);
};

export const generateToken = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

export const validateQuizJson = (json) => {
  if (!Array.isArray(json)) {
    throw new Error('Quiz must be an array');
  }
  
  if (json.length === 0) {
    throw new Error('Quiz must have at least one question');
  }
  
  json.forEach((q, idx) => {
    if (!q.question || typeof q.question !== 'string') {
      throw new Error(`Question ${idx + 1}: missing question field`);
    }
    if (!Array.isArray(q.options) || q.options.length < 2) {
      throw new Error(`Question ${idx + 1}: must have at least 2 options`);
    }
    if (!q.answer || typeof q.answer !== 'string') {
      throw new Error(`Question ${idx + 1}: missing answer field`);
    }
    if (!q.options.includes(q.answer)) {
      throw new Error(`Question ${idx + 1}: answer must be one of the options`);
    }
  });
  
  return true;
};