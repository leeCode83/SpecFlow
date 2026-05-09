import { SpecType } from '../types';

export const SPEC_TEMPLATES: Record<SpecType, string> = {
  Auth: `# Authentication & Authorization Specification

## Overview
Describe the identity management and security requirements for the application.

## Authentication Methods
- [ ] Email/Password
- [ ] Social Login (Google, GitHub, etc.)
- [ ] Multi-Factor Authentication (MFA)

## Roles & Permissions (RBAC)
- **Admin**: Full system access.
- **User**: Access to own data.
- **Guest**: Read-only access to public pages.

## Protected Routes
- /dashboard
- /settings
- /profile

## Security Requirements
- Password hashing (e.g., Argon2)
- Session management (JWT vs. Cookies)
- Rate limiting on login attempts
`,
  API: `# API Specification

## Service Overview
Define the purpose and structure of the backend services and endpoints.

## Base URL
\`https://api.example.com/v1\`

## Authentication
Bearer Token in Authorization Header.

## Endpoints

### 1. [GET] /resource
- **Description**: Retrieve a list of resources.
- **Parameters**: \`limit\`, \`offset\`, \`filter\`.
- **Response**: \`200 OK\` with JSON array.

### 2. [POST] /resource
- **Description**: Create a new resource.
- **Request Body**: JSON object with required fields.
- **Response**: \`201 Created\`.

## Error Codes
- \`400\`: Bad Request
- \`401\`: Unauthorized
- \`404\`: Not Found
- \`500\`: Internal Server Error
`,
  Frontend: `# Frontend Specification

## Design System
- **Framework**: React / Vite
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui

## Layout Structure
- **Navigation**: Sidebar vs. Top Navbar.
- **Responsive Breakpoints**: Mobile-first design.

## User Journeys
1. **User Landing**: First impressions.
2. **Onboarding**: Login/Sign Up flow.
3. **Core Action**: Primary task completion.

## State Management
- Local State (useState/useReducer)
- Global State (Zustand/Context API)
- Server State (React Query / SWR)

## Accessibility (a11y)
- Screen reader support.
- Keyboard navigation.
`,
  AI: `# AI & LLM Integration Specification

## Model Selection
- Model: Gemini 1.5 Pro / Flash
- Strategy: Zero-shot / Few-shot / CoT

## Prompt Engineering
- **System Instructions**: Set the persona and constraints.
- **Variables**: {{user_input}}, {{context}}.

## Data Pipeline (RAG)
- **Vector Database**: Supabase pgvector / Pinecone.
- **Embedding Model**: text-embedding-004.
- **Chunking Strategy**: Semantic chunking vs. overlaps.

## Safety & Moderation
- Content filtering.
- Hallucination checks.
`,
  Infrastructure: `# Infrastructure & DevOps Specification

## Hosting
- **Platform**: Cloud Run / Vercel / AWS.
- **Database**: PostgreSQL (Supabase) / Redis.

## CI/CD Pipeline
- GitHub Actions for automated builds.
- Staging and Production environments.

## Monitoring & Logging
- Error tracking (Sentry).
- Performance monitoring (LogRocket).

## Scaling Strategy
- Auto-scaling based on CPU/Memory.
- Database read replicas (if needed).
`,
  Custom: `# Specification: [Name]

## Context
Provide background on why this spec is needed.

## Objectives
What are the primary goals?

## Functional Requirements
- Requirement 1
- Requirement 2

## Implementation Details
Initial thoughts on how to build this.

## Open Questions
Items that still need clarification.
`
};
