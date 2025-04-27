import { fetchGrammerQuestions, evaluateGrammerAnswers } from '../services/grammerQuestion/index.js';

export const getGrammerQuestions = async (req, res) => {
    console.log("inside grammer controller", req.query)
    const {userId} = req.query; 
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

  try {

    const questions = await fetchGrammerQuestions(userId);
    res.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error.message);
    res.status(500).json({ message: "Internal Server Error. Please try again later." });
  }
};

export const submitGrammerAnswers = async (req, res) => {
  try {
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Invalid answers format. Must be an array." });
    }

    const result = await evaluateGrammerAnswers(answers);
    res.json(result);
  } catch (error) {
    console.error("Error submitting answers:", error.message);
    res.status(500).json({ message: "Internal Server Error. Please try again later." });
  }
};
