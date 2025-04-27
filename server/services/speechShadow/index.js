import sdk from 'microsoft-cognitiveservices-speech-sdk';
import { v4 as uuidv4 } from 'uuid';
import { bucket } from '../../config/firebase/index.js';

export const speechShadowService = () => {
  const analysisResults = new Map();

  const speechConfig = sdk.SpeechConfig.fromSubscription(
    process.env.AZURE_SPEECH_KEY,
    process.env.AZURE_SPEECH_REGION
  );

  speechConfig.speechSynthesisVoiceName = 'en-US-JennyNeural';
  speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Riff24Khz16BitMonoPcm;

  const uploadToFirebase = async (buffer, filename, contentType) => {
    const file = bucket.file(`speech-shadow/${filename}`);
    await file.save(buffer, {
      metadata: {
        contentType,
        firebaseStorageDownloadTokens: uuidv4(),
      },
      public: true,
    });

    const url = `https://storage.googleapis.com/${bucket.name}/speech-shadow/${filename}`;
    return url;
  };

  const textToSpeech = async (text) => {
    console.log(`🗣️ Synthesizing speech for text: "${text}"`);
    return new Promise((resolve, reject) => {
      const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

      synthesizer.speakTextAsync(
        text,
        async (result) => {
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            console.log("✅ Speech synthesis successful.");
            const audioBuffer = Buffer.from(result.audioData);
            synthesizer.close();

            const fileName = `native_${uuidv4()}.wav`;
            const audioUrl = await uploadToFirebase(audioBuffer, fileName, 'audio/wav');
            resolve(audioUrl);
          } else {
            const errorMsg = `❌ Speech synthesis failed: ${result.errorDetails}`;
            console.error(errorMsg);
            synthesizer.close();
            reject(new Error(errorMsg));
          }
        },
        (error) => {
          console.error("❌ Error during synthesis:", error);
          synthesizer.close();
          reject(error);
        }
      );
    });
  };


  // 🔍 Mock analysis
  const mockPhonemeAnalysis = async (text, recordingUrl) => {
    console.log(`🧪 Running mock analysis on text: "${text}"`);
    const words = text.split(/\s+/);
    const mispronunciations = [];
    const stressIssues = [];

    for (let i = 0; i < words.length; i++) {
      if (Math.random() < 0.2 && words[i].length > 3) {
        mispronunciations.push({
          phoneme: words[i],
          timePosition: i / words.length,
          duration: 0.05 + Math.random() * 0.1,
          suggestion: `Emphasize the ${Math.random() > 0.5 ? 'first' : 'last'} syllable of "${words[i]}".`
        });
      }
    }

    if (words.length > 5) {
      stressIssues.push({
        timePosition: Math.random() * 0.5,
        duration: 0.1,
        details: "Flat intonation detected. Try more pitch variation."
      });

      if (Math.random() > 0.5) {
        stressIssues.push({
          timePosition: 0.5 + Math.random() * 0.5,
          duration: 0.15,
          details: "Speech is too fast. Slow down for clarity."
        });
      }
    }

    const totalIssues = mispronunciations.length + stressIssues.length;
    const overallScore = Math.max(70, 95 - (totalIssues * 5));

    const suggestions = [];
    let generalFeedback;

    if (overallScore >= 90) {
      generalFeedback = "Excellent pronunciation! Almost native-like.";
      suggestions.push("Maintain natural rhythm and tackle complex phrases.");
    } else if (overallScore >= 80) {
      generalFeedback = "Good work! A few areas to improve.";
      suggestions.push("Improve on highlighted pronunciation issues.");
      suggestions.push("Use more varied intonation.");
    } else {
      generalFeedback = "Focus on improving clarity and stress.";
      suggestions.push("Slow down and break down tricky words.");
      suggestions.push("Practice mimicking native intonation patterns.");
    }

    return {
      overallScore,
      mispronunciations,
      stressIssues,
      generalFeedback,
      suggestions,
      analysisDate: new Date().toISOString()
    };
  };

  // 📩 Submit for analysis
  const submitForAnalysis = async (text, recordingUrl) => {
    const analysisId = uuidv4();
    console.log(`🔍 Submitting audio for analysis [${analysisId}]`);

    setTimeout(async () => {
      try {
        const results = await mockPhonemeAnalysis(text, recordingUrl);
        analysisResults.set(`${text}:${recordingUrl}`, results);
        console.log("✅ Mock analysis stored.");
      } catch (err) {
        console.error("❌ Error in mock phoneme analysis:", err);
      }
    }, 2000);

    return analysisId;
  };

  // 📥 Retrieve analysis result
  const getAnalysisResults = async (textId, recordingId) => {
    console.log(`📄 Fetching analysis for [${textId}:${recordingId}]`);
    return analysisResults.get(`${textId}:${recordingId}`);
  };

  return {
    textToSpeech,
    submitForAnalysis,
    getAnalysisResults
  };
};
