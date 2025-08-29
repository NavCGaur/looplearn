import dotenv from 'dotenv';
dotenv.config();
import Fuse from 'fuse.js'; 
import ScienceQuestion from '../../models/scienceQuestionSchema.js';
import AssignedScienceQuestion from '../../models/assignedScienceQuestions.js';

import axios from 'axios';
import { requestWithRetries } from '../../utility/geminiQuizApi.js';

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

    const response = await requestWithRetries({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature, maxOutputTokens: maxTokens, topP: 0.8, topK: 40 } });

    if (response?.data?.candidates?.[0]) {
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
    
    console.log('Starting question generation with params:', params);
    
    // Step 1: Search for existing questions in MongoDB
    const existingQuestions = await searchExistingQuestions(params);
    const foundCount = existingQuestions.length;
    
    // Step 2: Determine if we need to generate additional questions
    const remainingCount = numberOfQuestions - foundCount;
    
    console.log(`Found ${foundCount} existing questions, need ${remainingCount} more`);
    
    let generatedQuestions = [];
    
    // Step 3: Generate remaining questions with Gemini if needed
    if (remainingCount > 0) {
      console.log(`Generating ${remainingCount} additional questions with Gemini`);
      
      // Create the system prompt for question generation
      const systemPrompt = `You are an expert educator specializing in creating educational content for Indian schools. 
Generate exactly ${remainingCount} ${questionType} questions for students studying ${subject} at ${classStandard} level.

Topic Details:
- Subject: ${subject}
- Chapter: ${chapter}
- Topic: ${topic}
- Question Type: ${questionType}
- Class Standard: ${classStandard}
- Number of questions to generate: ${remainingCount}

Requirements:
1. Create exactly ${remainingCount} ${questionType} questions
2. Questions should be age-appropriate for ${classStandard} students
3. Include mathematical/scientific notation using LaTeX format when needed:
   - Mathematical formulas: $\\pi r^2$, $E=mc^2$, $\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$
   - Chemical formulas: Always wrap in dollar signs: $\\text{H}_2\\text{SO}_4$, $\\text{CO}_2$, $\\text{NaCl}$, $\\text{C}_6\\text{H}_{12}\\text{O}_6$
   - IMPORTANT: Chemical formulas MUST be wrapped in $ signs to render properly
   - Never use raw underscore notation like H_2SO_4, always use $\\text{H}_2\\text{SO}_4$
4. Each question should have a clear blank represented by "____" (for fill-in-blank questions)
5. Provide accurate, concise answers
6. Ensure questions test understanding of ${topic} within ${chapter}
7. Questions should be suitable for Indian curriculum and context
8. Include units where applicable (e.g., meters, seconds, grams)
9. Make sure questions are unique and don't duplicate common knowledge

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

      // Enhance generated questions with metadata
      generatedQuestions = parsedResponse.questions.map((question, index) => ({
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
          questionIndex: foundCount + index + 1
        }
      }));

      console.log(`Successfully generated ${generatedQuestions.length} new questions`);
      
      // Step 4: Save newly generated questions to MongoDB for future use
      if (generatedQuestions.length > 0) {
        try {
          const savedQuestions = await ScienceQuestion.insertMany(generatedQuestions);
          console.log(`Saved ${savedQuestions.length} new questions to MongoDB`);

            // Update generatedQuestions with the saved versions that include _ids
          generatedQuestions = savedQuestions.map(question => ({
            ...question.toObject(), // Convert mongoose document to plain object
            metadata: {
              ...question.metadata,
              source: 'mongodb-new'
            }
          }));

        } catch (saveError) {
          console.error('Error saving generated questions to MongoDB:', saveError);
          // Continue execution even if saving fails
        }
      }
    }

    // Step 5: Combine existing and generated questions
   const allQuestions = [
      ...existingQuestions.map(q => ({
        _id: q._id, // Include existing _id
        questionText: q.questionText,
        answer: q.answer,
        classStandard: q.classStandard,
        subject: q.subject,
        chapter: q.chapter,
        topic: q.topic,
        questionType: q.questionType,
        difficulty: q.difficulty,
        metadata: {
          ...q.metadata,
          source: 'mongodb-existing'
        }
      })),
      ...generatedQuestions.map(q => ({
        _id: q._id, // Include new _id
        ...q
      }))
    ];

    // Step 6: Shuffle questions to mix existing and new ones
    const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);

    console.log(`Total questions returned: ${shuffledQuestions.length} (${foundCount} existing + ${generatedQuestions.length} generated)`);

    return {
      questions: shuffledQuestions,
      totalGenerated: shuffledQuestions.length,
      existingCount: foundCount,
      newlyGenerated: generatedQuestions.length,
      parameters: params,
      searchStrategy: {
        mongodbQuery: {
          classStandard: classStandard,
          subject: getSubjectSearchArray(subject),
          chapter: 'flexible_regex_match',
          topic: 'flexible_regex_match',
          questionType: questionType
        },
        chapterPattern: chapter,
        topicPattern: topic
      }
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

export const fetchAssignedScienceQuestions = async (classStandard) => {
  const assignment = await AssignedScienceQuestion.findOne({ classStandard });

  if (!assignment || !assignment.questionIds.length) {
    return []; // Return empty if nothing is assigned
  }

  const questions = await ScienceQuestion.find({
    _id: { $in: assignment.questionIds }
  });

  console.log(`Fetched ${questions.length} assigned questions for class ${classStandard}, questions are -${questions} `);
  // Optional: format questions if frontend expects specific fields
  return questions.map(q => ({
    id: q._id,
    word: q.questionText.replace('____', '________'), // consistent blank format
    correctAnswer: q.answer,
    type: q.questionType === 'multiple-choice' ? 'mcq' : 'fill-in-blank',
    options: q.options || [],
    definition: q.topic || '', // example fallback
  }));
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

// Helper function to create flexible search patterns for chapter and topic
const createFlexibleSearchPattern = (text) => {
  if (!text) return '';

  const normalized = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ') // Remove all non-alphanumeric characters
    .replace(/\s+/g, ' ')
    .trim();

  const words = normalized.split(' ');
  const pattern = words.map(word => `(?=.*${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`).join('');
  
  return new RegExp(pattern, 'i');
};


// Helper function to create subject search array including related subjects
const getSubjectSearchArray = (subject) => {
  const subjectMap = {
    'physics': ['physics', 'science'],
    'chemistry': ['chemistry', 'science'],
    'biology': ['biology', 'science'],
    'mathematics': ['mathematics'],
    'science': ['science', 'physics', 'chemistry', 'biology']
  };
  
  return subjectMap[subject] || [subject];
};

const normalizeText = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ') // Remove punctuation
    .replace(/\s+/g, ' ')         // Collapse whitespace
    .trim();
};

const searchExistingQuestions = async (params) => {
  try {
    const { classStandard, subject, chapter, questionType, numberOfQuestions } = params;

    const subjectArray = getSubjectSearchArray(subject);

    // Broad MongoDB query — no chapter filtering
    const candidates = await ScienceQuestion.find({
      classStandard,
      subject: { $in: subjectArray },
      questionType 
     }).lean();

    console.log(`Fetched ${candidates.length} candidates from MongoDB`);

    if (!chapter || candidates.length === 0) {
      return candidates.slice(0, numberOfQuestions); // Fallback: return top N
    }

    // Fuse.js fuzzy matching on chapter
    const fuse = new Fuse(candidates, {
      keys: ['chapter'],
      threshold: 0.4, // Lower = stricter match
      ignoreLocation: true,
      minMatchCharLength: 2
    });

    const fuzzyResults = fuse.search(chapter);
    const filtered = fuzzyResults.map(r => r.item);

    console.log(`Fuse.js matched ${filtered.length} questions for chapter "${chapter}"`);

    return filtered.slice(0, numberOfQuestions);
  } catch (error) {
    console.error('Error searching existing questions:', error);
    return [];
  }
};


export const getScienceQuizQuestionsService = async (uid) => {
  try {
    // Get user's class standard
    const user = await User.findOne({ uid }).select('classStandard');
   

    if (!user) {
      throw new Error('User not found');
    }

    // Get science questions matching the user's class standard
    const questions = await ScienceQuestion.aggregate([
      { 
        $match: { 
          classStandard: user.classStandard,
          isActive: true 
        } 
      },
      { $sample: { size: 10 } }, // Get 10 random questions
      {
        $project: {
          _id: 1,
          questionText: 1,
          answer: 1,
          questionType: 1,
          difficulty: 1,
          subject: 1,
          chapter: 1,
          topic: 1
        }
      }
    ]);

    if (questions.length === 0) {
      throw new Error('No questions found for this class standard');
    }

    // Transform questions for frontend
    const transformedQuestions = questions.map((question, index) => {
      const baseQuestion = {
        id: question._id.toString(),
        type: question.questionType,
        question: question.questionText,
        correctAnswer: question.answer,
        difficulty: question.difficulty,
        subject: question.subject,
        chapter: question.chapter,
        topic: question.topic
      };

      return baseQuestion;
    });

    return transformedQuestions;
  } catch (error) {
    throw error;
  }
};


export const assignQuestionsToClassService = async (classStandard, newQuestionIds) => {
  console.log('Assigning questions to class:', classStandard, 'New Questions:', newQuestionIds);

  // Fetch existing assignment
  const existingAssignment = await AssignedScienceQuestion.findOne({ classStandard });

  let updatedQuestionIds;

  if (existingAssignment) {
    const existingIds = new Set(existingAssignment.questionIds.map(id => id.toString()));
    const uniqueNewIds = newQuestionIds.filter(id => !existingIds.has(id.toString()));

    updatedQuestionIds = [...existingAssignment.questionIds, ...uniqueNewIds];
  } else {
    updatedQuestionIds = newQuestionIds;
  }

  // Update or create the assignment
  const updatedAssignment = await AssignedScienceQuestion.findOneAndUpdate(
    { classStandard },
    {
      questionIds: updatedQuestionIds,
      assignedAt: new Date()
    },
    { upsert: true, new: true }
  );

  console.log('Updated assignment:', updatedAssignment);

  return {
    classStandard,
    addedCount: updatedQuestionIds.length - (existingAssignment?.questionIds.length || 0),
    totalCount: updatedQuestionIds.length
  };
};


export const bulkUploadQuestionsService = async (questions) => {
  try {
    // Validate questions format
    const validatedQuestions = questions.map(q => ({
      questionText: q.questionText,
      answer: q.answer,
      classStandard: q.classStandard,
      subject: q.subject,
      chapter: q.chapter,
      topic: q.topic,
      questionType: q.questionType || 'fill-in-blank',
      difficulty: q.difficulty || 'medium'
    }));

    // Save questions to ScienceQuestion collection
    const savedQuestions = await ScienceQuestion.insertMany(validatedQuestions);
    
    // Group questions by class standard for assignment
    const questionsByClass = savedQuestions.reduce((acc, question) => {
      const classStandard = question.classStandard;
      if (!acc[classStandard]) {
        acc[classStandard] = [];
      }
      acc[classStandard].push(question._id);
      return acc;
    }, {});

    // Create or update assignments for each class standard
    const assignmentPromises = Object.entries(questionsByClass).map(async ([classStandard, questionIds]) => {
      try {
        // Check if assignment already exists for this class
        let assignment = await AssignedScienceQuestion.findOne({ classStandard });
        
        if (assignment) {
          // Add new questions to existing assignment (avoid duplicates)
          const newQuestionIds = questionIds.filter(id => 
            !assignment.questionIds.some(existingId => existingId.equals(id))
          );
          
          if (newQuestionIds.length > 0) {
            assignment.questionIds.push(...newQuestionIds);
            assignment.updatedAt = new Date();
            await assignment.save();
          }
          
          return assignment;
        } else {
          // Create new assignment
          const newAssignment = new AssignedScienceQuestion({
            classStandard,
            questionIds,
            assignedAt: new Date()
          });
          
          await newAssignment.save();
          return newAssignment;
        }
      } catch (error) {
        // Handle unique constraint error gracefully
        if (error.code === 11000) {
          // If duplicate key error, try to update existing record
          const assignment = await AssignedScienceQuestion.findOne({ classStandard });
          if (assignment) {
            const newQuestionIds = questionIds.filter(id => 
              !assignment.questionIds.some(existingId => existingId.equals(id))
            );
            
            if (newQuestionIds.length > 0) {
              assignment.questionIds.push(...newQuestionIds);
              assignment.updatedAt = new Date();
              await assignment.save();
            }
            return assignment;
          }
        }
        throw error;
      }
    });

    const assignments = await Promise.all(assignmentPromises);

    return {
      count: savedQuestions.length,
      questions: savedQuestions,
      assignments,
      assignmentCount: assignments.length
    };
  } catch (error) {
    console.error('Service bulk upload error:', error);
    throw new Error(`Failed to bulk upload questions: ${error.message}`);
  }
};

// Get assigned questions for a class with filtering and pagination
export const getAssignedQuestionsService = async (classStandard, filters = {}, options = {}) => {
  try {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    // Get assignment for the class
    const assignment = await AssignedScienceQuestion.findOne({ classStandard });
    if (!assignment || !assignment.questionIds.length) {
      return {
        questions: [],
        totalQuestions: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      };
    }

    // Build query for filtering questions
    const query = {
      _id: { $in: assignment.questionIds },
      isActive: { $ne: false } // Include questions that are not marked as inactive
    };

    // Apply filters
    if (filters.subject) query.subject = filters.subject;
    if (filters.chapter) query.chapter = new RegExp(filters.chapter, 'i');
    if (filters.topic) query.topic = new RegExp(filters.topic, 'i');
    if (filters.questionType) query.questionType = filters.questionType;
    if (filters.difficulty) query.difficulty = filters.difficulty;
    if (filters.search) {
      query.$or = [
        { questionText: new RegExp(filters.search, 'i') },
        { answer: new RegExp(filters.search, 'i') },
        { chapter: new RegExp(filters.search, 'i') },
        { topic: new RegExp(filters.search, 'i') }
      ];
    }

    // Get total count for pagination
    const totalQuestions = await ScienceQuestion.countDocuments(query);
    const totalPages = Math.ceil(totalQuestions / limit);

    // Get filtered questions with pagination
    const questions = await ScienceQuestion.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      questions,
      totalQuestions,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      assignment: {
        classStandard: assignment.classStandard,
        assignedAt: assignment.assignedAt,
        totalAssigned: assignment.questionIds.length
      }
    };

  } catch (error) {
    console.error('Error in getAssignedQuestionsService:', error);
    throw error;
  }
};

// Unassign questions from a class
export const unassignQuestionsService = async (classStandard, questionIds) => {
  try {
    console.log(`Unassigning ${questionIds.length} questions from ${classStandard}`);

    // Find the assignment for this class
    const assignment = await AssignedScienceQuestion.findOne({ classStandard });
    if (!assignment) {
      throw new Error(`No assignment found for class ${classStandard}`);
    }

    // Convert question IDs to ObjectId for comparison
    const questionObjectIds = questionIds.map(id => 
      typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id
    );

    // Remove the specified questions from the assignment
    assignment.questionIds = assignment.questionIds.filter(assignedId => 
      !questionObjectIds.some(removeId => removeId.equals(assignedId))
    );

    // Update the assignment
    assignment.updatedAt = new Date();
    await assignment.save();

    console.log(`Successfully unassigned questions. Remaining: ${assignment.questionIds.length}`);

    return {
      classStandard,
      removedCount: questionIds.length,
      remainingCount: assignment.questionIds.length
    };

  } catch (error) {
    console.error('Error in unassignQuestionsService:', error);
    throw error;
  }
};

// Get available questions for assignment (excluding already assigned ones)
export const getAvailableQuestionsForAssignmentService = async (classStandard, filters = {}, options = {}) => {
  try {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    // Get currently assigned question IDs for this class
    const assignment = await AssignedScienceQuestion.findOne({ classStandard });
    const assignedQuestionIds = assignment ? assignment.questionIds : [];

    // Build query for available questions
    const query = {
      classStandard: classStandard, // Only show questions for the selected class
      isActive: { $ne: false }, // Include questions that are not marked as inactive
      _id: { $nin: assignedQuestionIds } // Exclude already assigned questions
    };

    // Apply filters
    if (filters.subject) query.subject = filters.subject;
    if (filters.chapter) query.chapter = new RegExp(filters.chapter, 'i');
    if (filters.topic) query.topic = new RegExp(filters.topic, 'i');
    if (filters.questionType) query.questionType = filters.questionType;
    if (filters.difficulty) query.difficulty = filters.difficulty;
    if (filters.search) {
      query.$or = [
        { questionText: new RegExp(filters.search, 'i') },
        { answer: new RegExp(filters.search, 'i') },
        { chapter: new RegExp(filters.search, 'i') },
        { topic: new RegExp(filters.search, 'i') }
      ];
    }

    // Get total count for pagination
    const totalQuestions = await ScienceQuestion.countDocuments(query);
    const totalPages = Math.ceil(totalQuestions / limit);

    // Get available questions with pagination
    const questions = await ScienceQuestion.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      questions,
      totalQuestions,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      assignmentInfo: {
        classStandard,
        totalAssigned: assignedQuestionIds.length,
        availableForAssignment: totalQuestions
      }
    };

  } catch (error) {
    console.error('Error in getAvailableQuestionsForAssignmentService:', error);
    throw error;
  }
};

// Assign new questions to a class
export const assignNewQuestionsService = async (classStandard, questionIds) => {
  try {
    console.log(`Assigning ${questionIds.length} new questions to ${classStandard}`);

    // Convert question IDs to ObjectId
    const questionObjectIds = questionIds.map(id => 
      typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id
    );

    // Verify that all questions exist and belong to the correct class
    const questions = await ScienceQuestion.find({
      _id: { $in: questionObjectIds },
      classStandard: classStandard
    });

    if (questions.length !== questionIds.length) {
      throw new Error('Some questions are invalid or do not belong to the specified class');
    }

    // Find or create assignment for this class
    let assignment = await AssignedScienceQuestion.findOne({ classStandard });
    
    if (assignment) {
      // Add new questions to existing assignment (avoid duplicates)
      const newQuestionIds = questionObjectIds.filter(id => 
        !assignment.questionIds.some(existingId => existingId.equals(id))
      );
      
      if (newQuestionIds.length > 0) {
        assignment.questionIds.push(...newQuestionIds);
        assignment.updatedAt = new Date();
        await assignment.save();
      }
      
      return {
        classStandard,
        addedCount: newQuestionIds.length,
        totalAssigned: assignment.questionIds.length,
        skippedDuplicates: questionIds.length - newQuestionIds.length
      };
    } else {
      // Create new assignment
      const newAssignment = new AssignedScienceQuestion({
        classStandard,
        questionIds: questionObjectIds,
        assignedAt: new Date()
      });
      
      await newAssignment.save();
      
      return {
        classStandard,
        addedCount: questionObjectIds.length,
        totalAssigned: questionObjectIds.length,
        skippedDuplicates: 0
      };
    }

  } catch (error) {
    console.error('Error in assignNewQuestionsService:', error);
    throw error;
  }
};