import dotenv from 'dotenv';
dotenv.config();
import ScienceQuestion from '../../models/scienceQuestionSchema.js';
import axios from 'axios';

import { UserSchema } from '../../models/userSchema.js'; 
import mongoose from 'mongoose';

const User = mongoose.model('User', UserSchema);

// Gemini API client for question generation
const callGeminiAPI = async (prompt, temperature = 0.2, maxTokens = 1500) => {
  try {
    console.log("Calling Gemini API for question generation");
    const geminiApiUrl = process.env.GEMINI_API_URL;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    const response = await axios.post(
      `${geminiApiUrl}?key=${geminiApiKey}`,
      { 
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: temperature,
          maxOutputTokens: maxTokens,
          topP: 0.8,
          topK: 40
        }
      }
    );

    if (response.data && response.data.candidates && response.data.candidates[0]) {
      return response.data.candidates[0].content.parts[0].text;
    }

    throw new Error('Invalid response from Gemini API');
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    if (error.response) {
      console.error('API Error Response:', error.response.data);
    }
    throw new Error(`Gemini API Error: ${error.message}`);
  }
};


export const fetchUserWordsDue = async (userId) => {
  try {
    const user = await User.findOne({ uid: userId }).populate('scienceWords.termId');
    
    if (!user) {
      console.log("No user found with id:", userId);
      throw new Error('User not found');
    }
    
    // Add validation before logging to prevent null reference errors
    if (user.scienceWords && user.scienceWords.length > 0 && user.scienceWords[0].termId) {
      console.log("User found in service:", userId, user.scienceWords.length, user.scienceWords[0].termId.term);
    } else {
      console.log("User found in service:", userId, "but scienceWords is empty or contains invalid entries");
    }
    
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Normalize to start of the day
    
    return user.scienceWords
      .filter(v => {
        // First filter out any entries with null/undefined termId
        return (
          v && v.termId && 
          (!v.nextReviewDate || new Date(v.nextReviewDate).getTime() <= today.getTime())
        );
      })
      .map(v => ({
        term: v.termId.term,
        explanationHindi: v.termId.explanationHindi,
        definition: v.termId.definition,
        simpleExplanation: v.termId.simpleExplanation,
        analogy: v.termId.analogy,
        exampleSentenceHindi: v.termId.exampleSentenceHindi,
        pronunciationUrl: v.termId.pronunciationUrl,
        relatedConcepts: v.termId.relatedConcepts,
        image: v.termId.image,
        category: v.termId.category,
        rating: v.rating,
        nextReviewDate: v.nextReviewDate,
      }));
  } catch (err) {
    console.error("Error in fetchUserWordsDue:", err);
    throw err;
  }
};
 

export const updateMultipleUserWordRatings = async (userId, ratings) => {
  const user = await User.findOne({ uid: userId }).populate('scienceWords.termId');
  if (!user) throw new Error('User not found');

  const now = new Date();

  for (const { word, rating } of ratings) {
    const vocabEntry = user.scienceWords.find(v => v.termId && v.termId.word === word);
    if (vocabEntry) {
      vocabEntry.rating = rating;
      vocabEntry.lastReviewed = now;
      vocabEntry.nextReviewDate = calculateNextReviewDate(rating, now);

    }
  }

  // ✅ Update the latestFeatureAccess timestamp, safe for older users
  user.latestFeatureAccess = {
    ...(user.latestFeatureAccess || {}),  // fallback if undefined
    vocabSpacedRepetition: now
  };

  

  await user.save();
};

/**
 * Calculates the next review date based on the given rating and from date.
 * 
 * @param {number} rating - The rating given to the item (1-5)
 * @param {Date} fromDate - The date from which to calculate the next review date
 * @returns {Date} The calculated next review date
 */
function calculateNextReviewDate(rating, fromDate) {
  // Create a new Date object to avoid modifying the original fromDate
  const next = new Date(fromDate);

  // Determine the number of days to add to the from date based on the rating, currently returning 1 day for all ratings
  // - Rating 5: 1 days
  // - Rating 3: 1 days
  // - All other ratings: 1 day
  const days = rating === 5 ? 1 : rating === 3 ? 1 : 1;

  // Add the calculated number of days to the next date
  next.setDate(next.getDate() + days);

  // Return the calculated next review date
  return next;
}


// Generate questions using AI
export const generateQuestionsService = async (params) => {
  try {
    const { classStandard, subject, chapter, topic, questionType, numberOfQuestions } = params;

    // Create the system prompt for question generation
    const systemPrompt = `You are an expert educator specializing in creating educational content for Indian schools. 
Generate exactly ${numberOfQuestions} fill-in-the-blank questions for students studying ${subject} at ${classStandard} level.

Topic Details:
- Subject: ${subject}
- Chapter: ${chapter}
- Topic: ${topic}
- Question Type: ${questionType}
- Class Standard: ${classStandard}

Requirements:
1. Create exactly ${numberOfQuestions} fill-in-the-blank questions
2. Questions should be age-appropriate for ${classStandard} students
3. Include mathematical/scientific notation using LaTeX format when needed:
   - Mathematical formulas: $\\pi r^2$, $E=mc^2$, $\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$
   - Chemical formulas: Always wrap in dollar signs: $\\text{H}_2\\text{SO}_4$, $\\text{CO}_2$, $\\text{NaCl}$, $\\text{C}_6\\text{H}_{12}\\text{O}_6$
   - IMPORTANT: Chemical formulas MUST be wrapped in $ signs to render properly
   - Never use raw underscore notation like H_2SO_4, always use $\\text{H}_2\\text{SO}_4$
4. Each question should have a clear blank represented by "____"
5. Provide accurate, concise answers
6. Ensure questions test understanding of ${topic} within ${chapter}
7. Questions should be suitable for Indian curriculum and context
8. Include units where applicable (e.g., meters, seconds, grams)

Respond with JSON in this exact format:
{
  "questions": [
    {
      "questionText": "The formula for the area of a circle is ____, where r is the radius.",
      "answer": "$\\pi r^2$"
    },
    {
      "questionText": "The molecular formula for sulfuric acid is ____.",
      "answer": "$\\text{H}_2\\text{SO}_4$"
    }
  ]
}

IMPORTANT: Return only the JSON response, no additional text or explanations.`;

    console.log('Generating questions with prompt length:', systemPrompt.length);
    
    const geminiResponse = await callGeminiAPI(systemPrompt, 0.3, 2000);
    
    console.log('Raw Gemini response:', geminiResponse);

    // Parse the JSON response
    let parsedResponse;
    try {
      // Extract JSON from the response - handles case where model might add text before/after JSON
      const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in Gemini response');
      }
    } catch (parseError) {
      console.error('Error parsing Gemini JSON response:', parseError);
      console.error('Response was:', geminiResponse);
      throw new Error('Failed to parse AI response. Please try again.');
    }

    // Validate the response structure
    if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
      throw new Error('Invalid response format from AI. Expected questions array.');
    }

    // Enhance questions with metadata
    const enhancedQuestions = parsedResponse.questions.map((question, index) => ({
      ...question,
      classStandard,
      subject,
      chapter,
      topic,
      questionType,
      difficulty: getDifficultyByClass(classStandard),
      metadata: {
        generationMethod: 'ai-generated',
        aiModel: 'gemini',
        generationTimestamp: new Date(),
        questionIndex: index + 1
      }
    }));

    console.log(`Successfully generated ${enhancedQuestions.length} questions`);

    return {
      questions: enhancedQuestions,
      totalGenerated: enhancedQuestions.length,
      parameters: params
    };

  } catch (error) {
    console.error('Error in generateQuestionsService:', error);
    throw error;
  }
};

// Save questions to database
export const saveQuestionsService = async (questions) => {
  try {
    console.log(`Attempting to save ${questions.length} questions to database`);

    const savedQuestions = [];
    let duplicateCount = 0;

    for (const questionData of questions) {
      try {
        // Check for duplicates based on questionText and answer
        const existingQuestion = await ScienceQuestion.findOne({
          questionText: questionData.questionText,
          answer: questionData.answer,
          isActive: true
        });

        if (existingQuestion) {
          console.log('Duplicate question found, skipping:', questionData.questionText.substring(0, 50));
          duplicateCount++;
          continue;
        }

        // Create new question
        const newQuestion = new ScienceQuestion({
          ...questionData,
          isActive: true,
          metadata: {
            ...questionData.metadata,
            savedAt: new Date()
          }
        });

        const saved = await newQuestion.save();
        savedQuestions.push(saved);
        console.log(`Saved question: ${saved._id}`);

      } catch (saveError) {
        console.error('Error saving individual question:', saveError);
        // Continue with other questions even if one fails
      }
    }

    console.log(`Successfully saved ${savedQuestions.length} questions, ${duplicateCount} duplicates skipped`);

    return {
      savedQuestions,
      savedCount: savedQuestions.length,
      duplicates: duplicateCount,
      totalProcessed: questions.length
    };

  } catch (error) {
    console.error('Error in saveQuestionsService:', error);
    throw error;
  }
};

// Get all questions with pagination
export const getAllQuestionsService = async (options) => {
  try {
    const { page, limit, sortBy, sortOrder } = options;
    const skip = (page - 1) * limit;

    const questions = await ScienceQuestion.find({ isActive: true })
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalQuestions = await ScienceQuestion.countDocuments({ isActive: true });
    const totalPages = Math.ceil(totalQuestions / limit);

    return {
      questions,
      totalQuestions,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };

  } catch (error) {
    console.error('Error in getAllQuestionsService:', error);
    throw error;
  }
};

// Get questions by filters
export const getQuestionsByFiltersService = async (filters, options) => {
  try {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    // Build query object
    const query = { isActive: true };

    if (filters.classStandard) query.classStandard = filters.classStandard;
    if (filters.subject) query.subject = filters.subject;
    if (filters.chapter) query.chapter = new RegExp(filters.chapter, 'i');
    if (filters.topic) query.topic = new RegExp(filters.topic, 'i');
    if (filters.questionType) query.questionType = filters.questionType;

    // Add search functionality
    if (filters.search) {
      query.$or = [
        { questionText: new RegExp(filters.search, 'i') },
        { answer: new RegExp(filters.search, 'i') },
        { chapter: new RegExp(filters.search, 'i') },
        { topic: new RegExp(filters.search, 'i') }
      ];
    }

    const questions = await ScienceQuestion.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalQuestions = await ScienceQuestion.countDocuments(query);
    const totalPages = Math.ceil(totalQuestions / limit);

    return {
      questions,
      totalQuestions,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };

  } catch (error) {
    console.error('Error in getQuestionsByFiltersService:', error);
    throw error;
  }
};

// Update a question
export const updateQuestionService = async (questionId, updateData) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      throw new Error('Invalid question ID');
    }

    const updatedQuestion = await ScienceQuestion.findByIdAndUpdate(
      questionId,
      { 
        ...updateData,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    return updatedQuestion;

  } catch (error) {
    console.error('Error in updateQuestionService:', error);
    throw error;
  }
};

// Delete a question (soft delete)
export const deleteQuestionService = async (questionId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      throw new Error('Invalid question ID');
    }

    const deletedQuestion = await ScienceQuestion.findByIdAndUpdate(
      questionId,
      { 
        isActive: false,
        deletedAt: new Date()
      },
      { new: true }
    );

    return deletedQuestion;

  } catch (error) {
    console.error('Error in deleteQuestionService:', error);
    throw error;
  }
};

// Get question statistics
export const getQuestionStatsService = async () => {
  try {
    const totalQuestions = await ScienceQuestion.countDocuments({ isActive: true });
    
    const subjectStats = await ScienceQuestion.getStatsBySubject();
    
    const classStats = await ScienceQuestion.aggregate([
      { $match: { isActive: true } },
      { $group: {
        _id: '$classStandard',
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    const recentQuestions = await ScienceQuestion.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('questionText chapter topic createdAt')
      .lean();

    return {
      totalQuestions,
      subjectBreakdown: subjectStats,
      classBreakdown: classStats,
      recentQuestions,
      generatedAt: new Date()
    };

  } catch (error) {
    console.error('Error in getQuestionStatsService:', error);
    throw error;
  }
};

// Helper function to determine difficulty based on class
const getDifficultyByClass = (classStandard) => {
  const classNumber = parseInt(classStandard.split('-')[1]);
  if (classNumber <= 7) return 'easy';
  if (classNumber <= 9) return 'medium';
  return 'hard';
};