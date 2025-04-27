// uploadWords.js
/*import mongoose from "mongoose";
import fs from "fs";
import dotenv from "dotenv";
import Word from "../models/wordSchema.js";

dotenv.config();

async function uploadWords() {
  try {
    
    await mongoose.connect(process.env.MONGO_URL);
      console.log("MongoDB connected");

      const data = JSON.parse(fs.readFileSync("./words.json", "utf-8"));

 

    // Insert new data
    await Word.insertMany(data);
    console.log("Words inserted successfully");

    process.exit();
  } catch (error) {
    console.error("Error uploading words:", error);
    process.exit(1);
  }
}

export default uploadWords;
*/
