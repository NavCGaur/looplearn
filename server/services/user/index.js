import dotenv from 'dotenv';
dotenv.config(); 
import { UserSchema } from '../../models/userSchema.js'; 
import Word from '../../models/wordSchema.js';
import mongoose from 'mongoose';
 
const User = mongoose.model('User', UserSchema);
import axios from 'axios';

// Gemini client for all word processing tasks
const callGeminiAPI = async (prompt, temperature = 0.2, maxTokens = 150) => {
  try {

    console.log("gemini api url", process.env.GEMINI_API_URL);
    const geminiApiUrl = process.env.GEMINI_API_URL;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }
    
    const response = await axios.post(
      `${process.env.GEMINI_API_URL}?key=${geminiApiKey}`,
      { contents: [{ parts: [{ text: prompt }] }] }
    );
    
    if (response.data && response.data.candidates && response.data.candidates[0]) {
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
      .select('uid email displayName vocabulary')
      .lean();
    
    // Transform users to include count of assigned words
    return users.map(user => ({
      id: user.uid,
      name: user.displayName || 'Unnamed User',
      email: user.email,
      assignedWords: user.vocabulary || []
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
    const { word } = wordData;
    
    // Check if word already exists in database
    const existingWord = await Word.findOne({ word: word.toLowerCase() });
    
    if (existingWord) {
      // Check if user already has this word
      const user = await User.findOne({ 
        uid: userId,
        'vocabulary.wordId': existingWord._id 
      });
      
      if (user) {
        throw new Error('This word is already in the user\'s vocabulary');
      }
      
      // Assign existing word to user
      await User.findOneAndUpdate(
        { uid: userId },
        { 
          $push: { 
            vocabulary: { 
              wordId: existingWord._id,
              addedAt: new Date()
            } 
          } 
        }
      );
      
      return existingWord;
    }
    
    // Only use Free Dictionary API for pronunciation URL
    let pronunciationUrl = '';
    try {
      const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
      const response = await axios.get(apiUrl);
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const wordInfo = response.data[0];
        
        // Extract phonetics
        if (wordInfo.phonetics && wordInfo.phonetics.length > 0) {
          // Find the first phonetic with audio
          const phoneticWithAudio = wordInfo.phonetics.find(p => p.audio && p.audio.trim() !== '');
          if (phoneticWithAudio) {
            // Ensure URL has proper protocol
            pronunciationUrl = phoneticWithAudio.audio.startsWith('//') 
              ? `https:${phoneticWithAudio.audio}` 
              : phoneticWithAudio.audio;
          }
        }
      }
    } catch (dictApiError) {
      console.error('Error fetching pronunciation from Dictionary API:', dictApiError);
      // Continue without pronunciation if API fails
    }
    
    // Get definition and part of speech using Gemini
    const wordInfo = await getWordDefinition(word);
    
    // Generate example sentence using Gemini
    const exampleSentence = await generateExampleSentence(
      word, 
      wordInfo.partOfSpeech, 
      wordInfo.definition
    );
    
    // Get Hindi translations for word, definition, and example
    const translations = await getTranslations(word, wordInfo.definition, exampleSentence);
    
    console.log("Gemini translations:", translations);
    
    // Create new word with data
    const newWord = new Word({
      word: word.toLowerCase(),
      definition: wordInfo.definition,
      wordHindi: translations.wordHindi,
      definitionHindi: translations.definitionHindi,
      exampleSentence: exampleSentence,
      exampleSentenceHindi: translations.exampleSentenceHindi,
      partOfSpeech: wordInfo.partOfSpeech,
      pronunciationUrl: pronunciationUrl,
      difficulty: 1 // default difficulty level
    });
    
    const savedWord = await newWord.save();
    
    console.log("Saved word:", savedWord);
    
    // Assign word to the user
    await User.findOneAndUpdate(
      { uid: userId },
      { 
        $push: { 
          vocabulary: { 
            wordId: savedWord._id,
            addedAt: new Date()
          } 
        } 
      }
    );
    
    return {
      id: savedWord._id,
      word: savedWord.word,
      definition: savedWord.definition,
      wordHindi: savedWord.wordHindi,
      definitionHindi: savedWord.definitionHindi,
      exampleSentence: savedWord.exampleSentence,
      exampleSentenceHindi: savedWord.exampleSentenceHindi,
      partOfSpeech: savedWord.partOfSpeech,
      pronunciationUrl: savedWord.pronunciationUrl
    };
  } catch (error) {
    // Improve error handling
    if (error.response && error.response.status === 404) {
      throw new Error(`Word "${wordData.word}" not found in dictionary`);
    }
    
    throw new Error(`Error assigning word: ${error.message}`);
  }
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