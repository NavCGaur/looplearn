import mongoose from "mongoose";
import dotenv from "dotenv";
import GrammarQuestion from "../models/grammarQuestionSchema.js";
import fs from "fs";


dotenv.config();

// Sample data
//const questions = JSON.parse(fs.readFileSync("./quizmcq.json", "utf-8"));
const questions = JSON.parse(fs.readFileSync("./grammerQuizQuestion.json", "utf-8"));


// Connect and upload
const uploadQuizQuestions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    await GrammarQuestion.insertMany(questions);
    console.log("Quiz questions uploaded successfully.");
    mongoose.disconnect();
  } catch (err) {
    console.error("Upload failed:", err);
  }
};
export default uploadQuizQuestions
