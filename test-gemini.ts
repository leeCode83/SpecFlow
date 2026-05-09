import { analyzeIdea } from './lib/gemini/gemini-ideation';
import * as dotenv from 'dotenv';
dotenv.config();
analyzeIdea("app for fitness tracking", "Hackathon").then(res => console.log(JSON.stringify(res, null, 2))).catch(console.error);
