import dotenv from 'dotenv';
dotenv.config(); 
import { UserSchema } from '../../models/userSchema.js'; 
import Word from '../../models/wordSchema.js';
import Quiz from '../../models/quizSchema.js';
import mongoose from 'mongoose';
 
const User = mongoose.model('User', UserSchema);
import axios from 'axios';
import { getGeminiWordData, getGeminiWordsData, getGeminiStats } from '../../utility/geminiQuizApi.js';

// Gemini client for all word processing tasks (uses centralized rate-limited requester)
import { requestWithRetries } from '../../utility/geminiQuizApi.js';

const callGeminiAPI = async (prompt, temperature = 0.2, maxTokens = 150) => {
  try {
    console.log("gemini api url", process.env.GEMINI_API_URL);
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    const response = await requestWithRetries({ contents: [{ parts: [{ text: prompt }] }] });
    if (response?.data?.candidates?.[0]) {
      return response.data.candidates[0].content.parts[0].text;
    }

    throw new Error('Invalid response from Gemini API');
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
};

// Fetch word definition and part of speech using Gemini
const getWordDefinition = async (word) => {
  try {
    const prompt = `You are a language tutor for Indian school students. Provide the meaning/definition and part of speech for the word "${word}". 
    Choose the most common part of speech and meaning for an Indian school student.
    Return the response in this exact JSON format:
    {
      "partOfSpeech": "noun/adjective/verb/etc",
      "definition": "simple definition here"
    }`;
    
    const result = await callGeminiAPI(prompt);
    
    try {
      // Extract JSON from the result - handles case where model might add text before/after JSON
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Could not parse JSON from Gemini response');
    } catch (parseError) {
      console.error('Error parsing definition JSON:', parseError);
      // Fallback response
      return {
        partOfSpeech: 'noun',
        definition: `A word meaning ${word}`
      };
    }
  } catch (error) {
    console.error('Error getting word definition:', error);
    throw error;
  }
};

// Generate example sentence using Gemini
const generateExampleSentence = async (word, partOfSpeech, definition) => {
  console.log('Generating example sentence using Gemini...', word, partOfSpeech, definition);
  try {
    const prompt = `Generate a simple example sentence using the word "${word}" as a ${partOfSpeech}, with this definition: "${definition}". 
    The example should be relatable and suitable for Indian school students.
    Return only the example sentence without any explanation or additional text.`;
    
    const exampleSentence = await callGeminiAPI(prompt, 0.3);
    return exampleSentence.trim().replace(/^Example:?\s*/i, '').replace(/^["']|["']$/g, '');
  } catch (error) {
    console.error('Error generating example sentence:', error);
    return `The students use the word "${word}" in their daily conversation.`;
  }
};

// Translate text to Hindi using Gemini
const translateToHindi = async (text) => {
  try {
    if (!text) return '';
    
    const prompt = `Translate the following text from English to Hindi. 
    Provide only the Hindi translation without any explanation:
    
    "${text}"`;
    
    const translation = await callGeminiAPI(prompt);
    return translation.trim();
  } catch (error) {
    console.error('Error translating to Hindi:', error);
    return '';
  }
};

// Get translations for word data
const getTranslations = async (word, definition, exampleSentence) => {
  try {
    // Use JSON format to ensure proper structure
    const prompt = `Translate the following from English to Hindi:
    
    Word: ${word}
    Definition: ${definition}
    Example Sentence: ${exampleSentence}
    
    Return the response in this exact JSON format:
    {
      "wordHindi": "Hindi translation of word",
      "definitionHindi": "Hindi translation of definition",
      "exampleSentenceHindi": "Hindi translation of example sentence"
    }`;
    
    const result = await callGeminiAPI(prompt);
    
    try {
      // Extract JSON from the result
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Could not parse JSON from Gemini translation response');
    } catch (parseError) {
      console.error('Error parsing translation JSON:', parseError);
      // Fallback with individual translations
      const wordHindi = await translateToHindi(word);
      const definitionHindi = await translateToHindi(definition);
      const exampleSentenceHindi = await translateToHindi(exampleSentence);
      
      return {
        wordHindi,
        definitionHindi,
        exampleSentenceHindi
      };
    }
  } catch (error) {
    console.error('Error getting translations:', error);
    return {
      wordHindi: '',
      definitionHindi: '',
      exampleSentenceHindi: ''
    };
  }
};

export const getAllUsers = async () => {
  try {
    const users = await User.find()
      .select('uid email displayName vocabulary latestFeatureAccess classStandard')
      .lean();
      
    // Transform users to include count of assigned words and feature access
    return users.map(user => ({
      id: user.uid,
      name: user.displayName || 'Unnamed User',
      email: user.email,
      vocabulary: user.vocabulary || [],
      classStandard: user.classStandard,
      vocabularyCount: user.vocabulary?.length || 0,
      latestFeatureAccess: user.latestFeatureAccess || {}
    }));
  } catch (error) {
    throw new Error(`Error fetching users: ${error.message}`);
  }
};

export const getUserById = async (userId) => {
  try {
    const user = await User.findOne({ uid: userId })
      .select('uid email displayName vocabulary')
      .lean();
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // For each word in vocabulary, get the full word details
    const wordIds = user.vocabulary.map(item => item.wordId);
    const words = await Word.find({ _id: { $in: wordIds } }).lean();
    
    // Create a map for quick lookup
    const wordMap = {};
    words.forEach(word => {
      wordMap[word._id.toString()] = word;
    });
    
    // Combine the user vocabulary with word details
    const enrichedVocabulary = user.vocabulary.map(item => {
      const wordInfo = wordMap[item.wordId.toString()];
      return {
        ...item,
        word: wordInfo?.word || 'Unknown',
        definition: wordInfo?.definition || 'Not available',
        wordHindi: wordInfo?.wordHindi || '',
        definitionHindi: wordInfo?.definitionHindi || '',
        exampleSentence: wordInfo?.exampleSentence || '',
        exampleSentenceHindi: wordInfo?.exampleSentenceHindi || '',
        partOfSpeech: wordInfo?.partOfSpeech || '',
        pronunciationUrl: wordInfo?.pronunciationUrl || ''
      };
    });
    
    return {
      id: user.uid,
      name: user.displayName || 'Unnamed User',
      email: user.email,
      vocabulary: enrichedVocabulary
    };
  } catch (error) {
    throw new Error(`Error fetching user: ${error.message}`);
  }
};

export const assignWordToUser = async (userId, wordData) => {
  try {
    const words = wordData.word.split(',').map(w => w.trim().toLowerCase()).filter(Boolean);
    const subject = wordData.subject || 'English';
    console.log('Assigning words to user in service:', userId, 'Words:', words, 'Subject:', subject);
    const results = [];

    for (const word of words) {
      try {
        let wordDoc = await Word.findOne({ word });

        // If word doesn't exist, fetch and create it
        if (!wordDoc) {
          let pronunciationUrl = '';
          try {
            const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
            const response = await axios.get(apiUrl);
            const phoneticWithAudio = response?.data?.[0]?.phonetics?.find(p => p.audio?.trim());
            if (phoneticWithAudio) {
              pronunciationUrl = phoneticWithAudio.audio.startsWith('//')
                ? `https:${phoneticWithAudio.audio}`
                : phoneticWithAudio.audio;
            }
          } catch (err) {
            console.warn(`Failed to fetch pronunciation for ${word}`);
          }

          // Try the combined Gemini call first to reduce number of outbound requests
          const combined = await getGeminiWordData(word);
          if (combined) {
            const translations = combined.translations || { wordHindi: '', definitionHindi: '', exampleSentenceHindi: '' };
            const exampleSentence = combined.exampleSentence || '';

            wordDoc = new Word({
              word,
              definition: combined.definition || '',
              wordHindi: translations.wordHindi,
              definitionHindi: translations.definitionHindi,
              exampleSentence,
              exampleSentenceHindi: translations.exampleSentenceHindi,
              partOfSpeech: combined.partOfSpeech || '',
              pronunciationUrl,
              difficulty: 1
            });
            wordDoc = await wordDoc.save();

            // Persist quiz if returned
            if (combined.quiz) {
              try {
                const quizDoc = new Quiz({
                  wordId: wordDoc._id,
                  word,
                  mcq: combined.quiz.mcq || null,
                  fillInTheBlank: combined.quiz.fillInTheBlank || null
                });
                await quizDoc.save();
              } catch (quizSaveErr) {
                console.warn('Failed to save quiz for word', word, quizSaveErr.message || quizSaveErr);
              }
            }
          } else {
            // Fallback to old multi-call flow
            const wordInfo = await getWordDefinition(word);
            const exampleSentence = await generateExampleSentence(word, wordInfo.partOfSpeech, wordInfo.definition);
            const translations = await getTranslations(word, wordInfo.definition, exampleSentence);

            wordDoc = new Word({
              word,
              definition: wordInfo.definition,
              wordHindi: translations.wordHindi,
              definitionHindi: translations.definitionHindi,
              exampleSentence,
              exampleSentenceHindi: translations.exampleSentenceHindi,
              partOfSpeech: wordInfo.partOfSpeech,
              pronunciationUrl,
              difficulty: 1
            });
            wordDoc = await wordDoc.save();
          }
        }

        // Check if already assigned
        const userHasWord = await User.findOne({
          uid: userId,
          'vocabulary.wordId': wordDoc._id
        });

        if (!userHasWord) {
          await User.findOneAndUpdate(
            { uid: userId },
            {
              $push: {
                vocabulary: {
                  wordId: wordDoc._id,
                  addedAt: new Date()
                }
              }
            }
          );

          results.push({
            word,
            userId,
            success: true,
            message: 'Word assigned successfully'
          });
        } else {
          results.push({
            word,
            userId,
            success: true, // ✅ Treat as success
            message: 'Word already assigned'
          });
        }
      } catch (err) {
        results.push({ word, success: false, error: err.message });
      }
    }

    return results;
  } catch (error) {
    throw new Error(`Error assigning words: ${error.message}`);
  }
};

export const assignWordToBulkUsers = async (userIds, wordData) => {
  console.log('Assigning words to bulk users in service:', userIds, 'Word Data:', wordData, 'Subject:', wordData.subject);

  const results = [];
  let successCount = 0;
  let failureCount = 0;

  const words = wordData.word.split(',').map(w => w.trim().toLowerCase()).filter(Boolean);
  const subject = wordData.subject || 'English';

  const users = await User.find({ uid: { $in: userIds } });

  console.log('Found users:', users); 

  const foundUserIds = users.map(user => user.uid);

  console.log('Found user IDs:', foundUserIds);
  
  const missingUserIds = userIds.filter(id => !foundUserIds.includes(id));

  missingUserIds.forEach(userId => {
    results.push({
      userId,
      userName: 'Unknown User',
      success: false,
      error: 'User not found'
    });
    failureCount++;
  });

  console.log('Missing user IDs:', missingUserIds);

  // Collect words to create in batch
  const wordsToCreate = [];
  const existingDocsMap = {};

  for (const w of words) {
    const doc = await Word.findOne({ word: w });
    if (!doc) wordsToCreate.push(w);
    else existingDocsMap[w] = doc;
  }

  // Fetch batched data for missing words
  let batchResults = [];
  if (wordsToCreate.length > 0) {
    console.log('Fetching batched Gemini data for words:', wordsToCreate);
    batchResults = await getGeminiWordsData(wordsToCreate);
    console.log('Gemini batch fetched:', batchResults.map(b => b.word));
  }

  // Create documents for batch results
  for (const item of batchResults) {
    try {
      const translations = item.translations || { wordHindi: '', definitionHindi: '', exampleSentenceHindi: '' };
      const wordDoc = new Word({
        word: item.word,
        definition: item.definition || '',
        wordHindi: translations.wordHindi,
        definitionHindi: translations.definitionHindi,
        exampleSentence: item.exampleSentence || '',
        exampleSentenceHindi: translations.exampleSentenceHindi,
        partOfSpeech: item.partOfSpeech || '',
        pronunciationUrl: '',
        difficulty: 1
      });
      const saved = await wordDoc.save();
      existingDocsMap[item.word] = saved;

      // Save quiz
      if (item.quiz) {
        try {
          const quizDoc = new Quiz({
            wordId: saved._id,
            word: item.word,
            mcq: item.quiz.mcq || null,
            fillInTheBlank: item.quiz.fillInTheBlank || null
          });
          await quizDoc.save();
        } catch (qe) {
          console.warn('Failed to save quiz for', item.word, qe.message || qe);
        }
      }
    } catch (err) {
      console.warn('Failed to create word from batch for', item.word, err.message || err);
    }
  }

  // Now proceed over original words list using existingDocsMap
  for (const word of words) {
    let wordDocument = existingDocsMap[word];
    console.log('Processing word:', word, 'Found document:', wordDocument ? 'Yes' : 'No');

    // If still not present, fallback to single-create logic
    if (!wordDocument) {
      try {
        let pronunciationUrl = '';
        try {
          const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
          const response = await axios.get(apiUrl);
          const phoneticWithAudio = response?.data?.[0]?.phonetics?.find(p => p.audio?.trim());
          if (phoneticWithAudio) {
            pronunciationUrl = phoneticWithAudio.audio.startsWith('//')
              ? `https:${phoneticWithAudio.audio}`
              : phoneticWithAudio.audio;
          }
        } catch (dictApiError) {
          console.warn(`Failed to fetch pronunciation for ${word}`);
        }
        
        // Try combined Gemini helper first to minimize API calls for single word
        const combined = await getGeminiWordData(word);
        if (combined) {
          const translations = combined.translations || { wordHindi: '', definitionHindi: '', exampleSentenceHindi: '' };
          const exampleSentence = combined.exampleSentence || '';

          wordDocument = new Word({
            word,
            definition: combined.definition || '',
            wordHindi: translations.wordHindi,
            definitionHindi: translations.definitionHindi,
            exampleSentence,
            exampleSentenceHindi: translations.exampleSentenceHindi,
            partOfSpeech: combined.partOfSpeech || '',
            pronunciationUrl,
            difficulty: 1
          });

          console.log('Creating new word document (combined) in service:', wordDocument);
          wordDocument = await wordDocument.save();

          // Save quiz if provided
          if (combined.quiz) {
            try {
              const quizDoc = new Quiz({
                wordId: wordDocument._id,
                word,
                mcq: combined.quiz.mcq || null,
                fillInTheBlank: combined.quiz.fillInTheBlank || null
              });
              await quizDoc.save();
            } catch (quizSaveErr) {
              console.warn('Failed to save quiz for word', word, quizSaveErr.message || quizSaveErr);
            }
          }
        } else {
          // Fallback to legacy flow
          const wordInfo = await getWordDefinition(word);
          const exampleSentence = await generateExampleSentence(word, wordInfo.partOfSpeech, wordInfo.definition);
          const translations = await getTranslations(word, wordInfo.definition, exampleSentence);

          wordDocument = new Word({
            word,
            definition: wordInfo.definition,
            wordHindi: translations.wordHindi,
            definitionHindi: translations.definitionHindi,
            exampleSentence,
            exampleSentenceHindi: translations.exampleSentenceHindi,
            partOfSpeech: wordInfo.partOfSpeech,
            pronunciationUrl,
            difficulty: 1
          });

          console.log('Creating new word document in service (fallback):', wordDocument);
          wordDocument = await wordDocument.save();
        }
      } catch (error) {
        users.forEach(user => {
          results.push({
            userId: user.uid,
            userName: user.name,
            success: false,
            error: `Failed to create word "${word}": ${error.message}`
          });
          failureCount++;
        });
        continue; // Skip this word for all users
      }
    }

    for (const user of users) {
      console.log('Assigning word to user:', user.uid, 'Word:', word);
      try {
        const alreadyAssigned = await User.findOne({
          uid: user.uid,
          'vocabulary.wordId': wordDocument._id
        });

        if (alreadyAssigned) {
          results.push({
            userId: user.uid,
            userName: user.name,
            success: true,
            message: `Word "${word}" was already assigned`
          });
          successCount++; // ✅ Treat as success
          continue;
        }

        await User.findOneAndUpdate(
          { uid: user.uid },
          {
            $push: {
              vocabulary: {
                wordId: wordDocument._id,
                addedAt: new Date()
              }
            }
          }
        );

        results.push({
          userId: user.uid,
          userName: user.name,
          success: true,
          error: null
        });
        successCount++;
      } catch (error) {
        results.push({
          userId: user.uid,
          userName: user.name,
          success: false,
          error: `Failed to assign word "${word}": ${error.message}`
        });
        failureCount++;
      }
    }
  }

  return {
    results,
    successCount,
    failureCount
  };
};

export const removeWordFromUser = async (userId, wordId) => {
  try {
    const updated = await User.findOneAndUpdate(
      { uid: userId },
      { $pull: { vocabulary: { wordId: new mongoose.Types.ObjectId(wordId) } } },
      { new: true }
    );
    
    if (!updated) {
      throw new Error('User not found or word not assigned');
    }
    
    return { success: true };
  } catch (error) {
    throw new Error(`Error removing word: ${error.message}`);
  }
};

// DELETE single user by Firebase UID
export const deleteUserById = async (uid) => {
  try {
    const deletedUser = await User.findOneAndDelete({ uid });
    return deletedUser;
  } catch (error) {
    console.error('Error deleting user by UID:', error);
    throw new Error('Failed to delete user');
  }
};

// DELETE multiple users by Firebase UID
export const deleteUsersByIds = async (userIds) => {
  try {
    // Find users that match the given Firebase UIDs
    const users = await User.find({ uid: { $in: userIds } });
    const foundUids = users.map((user) => user.uid);

    const deleted = await User.deleteMany({ uid: { $in: foundUids } });

    const notFoundIds = userIds.filter((id) => !foundUids.includes(id));
    return {
      deletedCount: deleted.deletedCount,
      deletedIds: foundUids,
      notFoundIds,
    };
  } catch (error) {
    console.error('Error deleting users:', error);
    throw new Error('Failed to delete users');
  }
};

// Add points to a user
export const addPointsService = async (userId, points, reason) => {
  if (!userId || !points || points <= 0) {
    throw new Error("Invalid point update request");
  }

  const user = await User.findOne({ uid: userId });
  if (!user) {
    throw new Error("User not found");
  }

  user.points += points;

  // Optional: log reason (e.g., for analytics or debugging)
  console.log(`[POINT LOG] ${user.email} earned ${points} for: ${reason}`);

  await user.save();
  return user;
};

export const getUserPointsService = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const user = await User.findOne({ uid: userId });
  if (!user) {
    throw new Error("User not found");
  }

  return {
    uid: user.uid,
    name: user.displayName || 'Unnamed User',
    points: user.points || 0
  };
};

export const getLeaderboardService = async () => {
  try {
    const users = await User.find()
      .select('uid displayName points')
      .sort({ points: -1 })
      .lean();
      
    if (!users || users.length === 0) {
      throw new Error('No users found');
    }

    return users.map(user => ({
      uid: user.uid,
      name: user.displayName || 'Unnamed User',
      points: user.points || 0
    }));
  } catch (error) {
    throw new Error(`Error fetching leaderboard: ${error.message}`);
  }
};

export const getQuizQuestionsService = async (uid) => {
  try {
    // Get user's vocabulary words
    const user = await User.findOne({ uid }).populate('vocabulary.wordId');
    if (!user) {
      throw new Error('User not found');
    }

    // Get word IDs from user's vocabulary
    const wordIds = user.vocabulary.map(item => item.wordId._id);

    // Get quiz questions for these words
    const quizQuestions = await Quiz.find({ wordId: { $in: wordIds } });

    // Transform the questions to match the frontend format
    const transformedQuestions = quizQuestions.flatMap(quiz => {
      const questions = [];

      if (quiz.mcq) {
        questions.push({
          id: quiz._id.toString() + '-mcq',
          type: 'mcq',
          question: quiz.mcq.question,
          word: quiz.word,
          options: quiz.mcq.options,
          correctAnswer: quiz.mcq.correctAnswer,
          difficulty: 'medium'
        });
      }

      if (quiz.fillInTheBlank) {
        questions.push({
          id: quiz._id.toString() + '-fill',
          type: 'fillBlank',
          question: quiz.fillInTheBlank.question,
          word: quiz.word,
          correctAnswer: quiz.fillInTheBlank.answer,
          difficulty: 'medium'
        });
      }

      return questions;
    }).filter(Boolean); // Remove any undefined entries

    return transformedQuestions;
  } catch (error) {
    throw error;
  }
};

// Get users by class standard
export const getUsersByClassService = async (classStandard) => {
  try {
    const users = await User.find({ classStandard })
      .select('uid email displayName vocabulary classStandard')
      .lean();
      
    // Transform users to include count of assigned words
    return users.map(user => ({
      id: user.uid,
      name: user.displayName || 'Unnamed User',
      email: user.email,
      classStandard: user.classStandard,
      assignedWords: user.vocabulary || [],
      vocabularyCount: user.vocabulary ? user.vocabulary.length : 0
    }));
  } catch (error) {
    throw new Error(`Error fetching users by class: ${error.message}`);
  }
};

// Assign word to all users in a class
export const assignWordToClassService = async (classStandard, wordData) => {
  try {
    // Get all users in the class
    const users = await User.find({ classStandard });
    
    if (users.length === 0) {
      throw new Error(`No users found in class ${classStandard}`);
    }

    const userIds = users.map(user => user.uid);
    
    // Use existing bulk assign function
    const result = await assignWordToBulkUsers(userIds, wordData);
    
    return {
      ...result,
      classStandard,
      totalUsersInClass: users.length,
      message: `Words assigned to all users in class ${classStandard}`
    };
  } catch (error) {
    throw new Error(`Error assigning words to class: ${error.message}`);
  }
};

// Update user's class standard
export const updateUserClassService = async (userId, classStandard) => {
  try {
    const updated = await User.findOneAndUpdate(
      { uid: userId },
      { classStandard },
      { new: true }
    ).select('uid displayName email classStandard');
    
    if (!updated) {
      throw new Error('User not found');
    }
    
    return {
      id: updated.uid,
      name: updated.displayName,
      email: updated.email,
      classStandard: updated.classStandard,
      message: `User class updated to ${classStandard}`
    };
  } catch (error) {
    throw new Error(`Error updating user class: ${error.message}`);
  }
};