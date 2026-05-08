/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Mode = 'Learning' | 'Hackathon' | 'Startup';

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string;
  mode: Mode;
  refined_idea_json: IdeaFeedback | null;
  created_at: string;
}

export interface IdeaFeedback {
  originality: number;
  buildability: number; // For Hackathon
  impact: number;      // For Hackathon
  feasibility: number;  // For Learning
  learningValue: number; // For Learning
  marketSize: number;    // For Startup
  monetization: number;  // For Startup
  techStack: {
    frontend: string[];
    backend: string[];
    ai: string[];
    infrastructure: string[];
  };
  summary: string;
  nextSteps: string[];
}

export type SpecType = 'Auth' | 'API' | 'Frontend' | 'AI' | 'Infrastructure' | 'Custom';

export interface Spec {
  id: string;
  project_id: string;
  title: string;
  type: SpecType;
  content: string; // Markdown
  status: 'draft' | 'completed';
  created_at: string;
  embedding?: number[];
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Conversation {
  id: string;
  spec_id: string;
  messages: Message[];
  created_at: string;
}
