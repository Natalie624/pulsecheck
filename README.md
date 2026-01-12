# 🧠 PulseCheck

As of January 2026, PulseCheck is an AI-powered status report platform that transforms raw meeting notes and scattered updates into polished, professional status reports. It offers two distinct workflows: a simple free version for quick report generation, and an intelligent Agent Mode that uses multi-turn AI classification to guide users through preference selection, confidence-based clarification, and comprehensive session management. Users can generate, edit, export (Markdown/PDF), and maintain a full history of status reports with advanced filtering, making it ideal for tech teams, managers, and async workflows.

V1, Shelved for now (Jan 12, 2026)

## 🚀 Project Goals

- Fast, intuitive UI for generating status & look-back performance review reports
- AI-generated reports with tone control
- Built for tech teams, managers, and async workflows

## 🛠 Tech Stack

### Frontend
- [Next.js 15.5.9](https://nextjs.org/) with App Router
- React 19 (with React DOM 19)
- TypeScript 5
- Tailwind CSS 4 with PostCSS
- Lucide React (icons)
- Radix UI (accessible tooltips)
- React Markdown (report rendering)

### Backend & AI
- Next.js API Routes (serverless)
- OpenAI API 5.8.2 (GPT-4.1 for free version, GPT-4o-mini for Agent Mode)
- LangChain 0.3.29 with @langchain/core 0.3.62 (AI abstraction layer)
- Zod 3.25.74 (schema validation)
- PDFKit 0.17.2 (PDF generation)

### Database & Auth
- PostgreSQL (Neon DB)
- Prisma ORM 6.15.0
- Clerk.dev 6.23.3 (authentication & user management)
- Svix 1.84.1 (webhook handling)

### Analytics & Monitoring
- PostHog 1.257.0 (product analytics)
- Vercel Speed Insights 1.2.0

### Testing
- Vitest 3.2.4 with @vitest/coverage-v8
- @testing-library/react 16.3.0
- @testing-library/jest-dom 6.6.3
- jsdom 26.1.0

### Hosting & Deployment
- Vercel (hosting platform)
- PostgreSQL on Neon (managed database)

## 📦 Getting Started

```bash
git clone https://github.com/YOUR_USERNAME/pulsecheck.git
cd pulsecheck
npm install
npm run dev

```

## Testing Commands
```bash
npx vitest -u
npm run test

```

### Prisma Schema Commands
```bash
npx prisma format
npx prisma validate
npx prisma migrate dev --name init_agent_core

```

## Roadmap
- Structured Metadata & Search
- Roll-ups & Reviews
- Semantic Memory & Saved Search
- Review Packs & Insights
- Team sharing and history (future)
- Posthog Analytics
- Security and performance enhancements 

## 📄 Export Features

PulseCheck supports exporting status reports in two formats:

### Markdown Export (.md)
- Clean, formatted markdown with section headers
- Emoji icons for each status type (Wins, Risks, Blockers, etc.)
- Support for both bullet and paragraph formats
- Low-confidence items marked with asterisks

### PDF Export (.pdf)
- Professional styling with logo and gradient headers
- Brand colors: Cyan (#63DFFA) to Purple (#5a38e0)
- Typography: Helvetica font family with proper sizing
- Section headings with emoji icons
- Low-confidence footnotes
- Page breaks for long reports

## 🔒 Production Considerations 

See [roadmap](https://docs.google.com/document/d/1qKQkpintsT9S_m7iN1RqTXjopjGQMYj2jFZJgU_RQyI/edit?pli=1&tab=t.0#bookmark=id.220otgt60er0) (not publically available)







Built with ❤️ by @Natalie624 

