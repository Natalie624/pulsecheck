# 🧠 PulseCheck

PulseCheck is an AI-powered status report generator that helps teams quickly summarize progress, blockers, and next steps from simple input prompts.

## 🚀 Project Goals

- Fast, intuitive UI for generating reports
- AI-generated status updates with tone control
- Built for tech teams, managers, and async workflows

## 🛠 Tech Stack

- [Next.js 15](https://nextjs.org/)
- TypeScript
- App Router
- Tailwind CSS
- Clerk.dev (Auth)
- OpenAI API with gpt-4.1
- Langchain AI abstraction library 
- Vercel (Hosting)
- Neon DB
- Prisma ORM

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
- ✅ Integrate Clerk.dev for login
- ✅ Build prompt -> report logic via OpenAI API
- ✅ Add tone/style selector
- ✅ Allow export or copy of report
- Team sharing and history (future)

Built with ❤️ by @Natalie624 

