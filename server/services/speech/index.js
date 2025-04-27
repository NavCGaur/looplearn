import { 
    SpeechConfig, 
    AudioConfig, 
    SpeechRecognizer, 
    PronunciationAssessmentConfig, 
    PronunciationAssessmentGradingSystem,
    PronunciationAssessmentGranularity,
    PropertyId, 
    ResultReason
 } from 'microsoft-cognitiveservices-speech-sdk';

class SpeechService {
  constructor() {
    this.speechConfig = SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION
    );
  }

  async transcribeAudio(audioBuffer, language) {

    console.log("Inside transcribeAudio service")
    const buffer = Buffer.from(audioBuffer, 'base64');
    console.log("Buffer length:", buffer.length);
    console.log("First 20 bytes:", buffer.slice(0, 20));
    
    // Check if it has WAV header
    const hasRiffHeader = buffer.slice(0, 4).toString('ascii') === 'RIFF';
    console.log("Has RIFF header:", hasRiffHeader);

    this.speechConfig.speechRecognitionLanguage = language;

    const audioConfig = AudioConfig.fromWavFileInput(Buffer.from(audioBuffer, 'base64'));
    const recognizer = new SpeechRecognizer(this.speechConfig, audioConfig);

    return new Promise((resolve, reject) => {
      recognizer.recognizeOnceAsync(
        result => {
          recognizer.close();
          resolve(result.text);
        },
        error => {
          recognizer.close();
          reject(error);
        }
      );
    });
  }

  async analyzePronunciation(audioBuffer, referenceText, language) {
    console.log('[SpeechService] Starting pronunciation analysis', {
        language,
        referenceTextLength: referenceText.length,
        audioBufferLength: audioBuffer.length
    });

    try {
        // Validate inputs
        if (!audioBuffer || !audioBuffer.length) {
            throw new Error('Empty audio buffer provided');
        }
        if (!referenceText || !referenceText.trim()) {
            throw new Error('Empty reference text provided');
        }

        this.speechConfig.speechRecognitionLanguage = language;
        console.log('[SpeechService] Speech config initialized with language:', language);

        // Create audio config
        let audioConfig;
        try {
            console.log('[SpeechService] Creating audio config from buffer');
            audioConfig = AudioConfig.fromWavFileInput(Buffer.from(audioBuffer, 'base64'));
        } catch (audioError) {
            console.error('[SpeechService] Audio config creation failed:', audioError);
            throw new Error('Invalid audio format');
        }

        // Create pronunciation assessment config
        console.log('[SpeechService] Creating pronunciation assessment config');
        const pronunciationConfig = new PronunciationAssessmentConfig(
            referenceText,
            PronunciationAssessmentGradingSystem.HundredMark,
            PronunciationAssessmentGranularity.Phoneme,
            true
        );

        // Create recognizer
        console.log('[SpeechService] Initializing speech recognizer');
        const recognizer = new SpeechRecognizer(this.speechConfig, audioConfig);
        pronunciationConfig.applyTo(recognizer);

        return new Promise((resolve, reject) => {
            recognizer.recognizeOnceAsync(
                async (result) => {
                    try {
                        recognizer.close();
                        
                        if (result.reason !== ResultReason.RecognizedSpeech) {
                            throw new Error(`Recognition failed: ${result.reason}`);
                        }

                        console.log('[SpeechService] Raw result:', result);

                        // Get the full JSON response
                        const jsonResult = result.properties.getProperty(PropertyId.SpeechServiceResponse_JsonResult);
                        console.log('[SpeechService] Full JSON response:', jsonResult);

                        if (!jsonResult) {
                            throw new Error('No JSON result found in response');
                        }

                        const resultData = JSON.parse(jsonResult);
                        
                        // Extract pronunciation assessment from the first NBest entry
                        const pronunciationResult = resultData.NBest?.[0]?.PronunciationAssessment;
                        if (!pronunciationResult) {
                            throw new Error('Pronunciation assessment results not found in NBest entry');
                        }

                        // Extract word-level details
                        const words = resultData.NBest?.[0]?.Words || [];
                        console.log(`[SpeechService] Found ${words.length} words in assessment`);

                        const phonemeResults = [];
                        words.forEach(word => {
                            if (word.Phonemes) {
                                word.Phonemes.forEach(phoneme => {
                                    phonemeResults.push({
                                        word: word.Word,
                                        phoneme: phoneme.Phoneme,
                                        score: phoneme.PronunciationAssessment?.AccuracyScore || 0,
                                        offset: phoneme.Offset,
                                        duration: phoneme.Duration
                                    });
                                });
                            }
                        });

                        const response = {
                            text: resultData.NBest?.[0]?.Display || '',
                            overallScore: pronunciationResult.PronScore,
                            accuracyScore: pronunciationResult.AccuracyScore,
                            fluencyScore: pronunciationResult.FluencyScore,
                            completenessScore: pronunciationResult.CompletenessScore,
                            words: words.map(word => ({
                                word: word.Word,
                                score: word.PronunciationAssessment?.AccuracyScore,
                                errorType: word.PronunciationAssessment?.ErrorType,
                                phonemes: word.Phonemes?.map(p => ({
                                    phoneme: p.Phoneme,
                                    score: p.PronunciationAssessment?.AccuracyScore
                                })) || []
                            })),
                            phonemeResults
                        };

                        console.log('[SpeechService] Analysis completed:', response);
                        resolve(response);
                    } catch (error) {
                        console.error('[SpeechService] Error processing results:', error);
                        reject(error);
                    }
                },
                (error) => {
                    console.error('[SpeechService] Recognition error:', error);
                    recognizer.close();
                    reject(error);
                }
            );
        });

    } catch (error) {
        console.error('[SpeechService] Pronunciation analysis setup failed:', error);
        throw error;
    }
}

async calculateWER(transcription, referenceText) {
    // Start logging with timestamp
    console.log(`[${new Date().toISOString()}] [WER] Starting calculation`);
    console.log('[WER] Input:', {
        transcription: transcription?.length > 50 ? `${transcription.substring(0, 50)}...` : transcription,
        referenceText: referenceText?.length > 50 ? `${referenceText.substring(0, 50)}...` : referenceText
    });

    try {
        // Validate inputs
        if (!transcription || typeof transcription !== 'string') {
            throw new Error('Invalid transcription: must be a non-empty string');
        }
        if (!referenceText || typeof referenceText !== 'string') {
            throw new Error('Invalid referenceText: must be a non-empty string');
        }

        // Normalize and split words
        const transcriptWords = transcription.toLowerCase().split(/\s+/).filter(Boolean);
        const referenceWords = referenceText.toLowerCase().split(/\s+/).filter(Boolean);

        console.log('[WER] Word counts:', {
            transcriptWords: transcriptWords.length,
            referenceWords: referenceWords.length
        });

        // Handle edge cases
        if (referenceWords.length === 0) {
            console.warn('[WER] Warning: Empty reference text after processing');
            return 1; // Maximum possible error if no reference
        }
        if (transcriptWords.length === 0) {
            console.warn('[WER] Warning: Empty transcription after processing');
            return 1; // Maximum possible error if no transcription
        }

        // Initialize DP matrix for Levenshtein distance
        const startTime = process.hrtime.bigint();
        const dp = Array(transcriptWords.length + 1).fill().map(() => 
            Array(referenceWords.length + 1).fill(0)
        );

        // Base cases
        for (let i = 0; i <= transcriptWords.length; i++) dp[i][0] = i;
        for (let j = 0; j <= referenceWords.length; j++) dp[0][j] = j;

        // Fill DP matrix
        for (let i = 1; i <= transcriptWords.length; i++) {
            for (let j = 1; j <= referenceWords.length; j++) {
                if (transcriptWords[i-1] === referenceWords[j-1]) {
                    dp[i][j] = dp[i-1][j-1];
                } else {
                    dp[i][j] = Math.min(
                        dp[i-1][j] + 1,    // Deletion
                        dp[i][j-1] + 1,    // Insertion
                        dp[i-1][j-1] + 1   // Substitution
                    );
                }
            }
        }

        const edits = dp[transcriptWords.length][referenceWords.length];
        const wer = referenceWords.length > 0 ? edits / referenceWords.length : 1;
        const endTime = process.hrtime.bigint();
        const processingTimeMs = Number(endTime - startTime) / 1e6;

        console.log('[WER] Calculation completed:', {
            wordErrorRate: wer.toFixed(3),
            editDistance: edits,
            referenceWordCount: referenceWords.length,
            processingTimeMs: processingTimeMs.toFixed(2)
        });

        return wer;
    } catch (error) {
        console.error(`[${new Date().toISOString()}] [WER] Error:`, {
            error: error.message,
            stack: error.stack
        });
        throw error; // Re-throw after logging
    }
}
}

export default new SpeechService();
