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
- ✅ Allow export or copy of report (MD/PDF exports with PDFKit)
- Team sharing and history (future)

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

### API Endpoint
```
GET /api/export?sessionId={id}&format={md|pdf}
```

## 🔒 Production Considerations

### Security

#### Authentication (TODO)
Currently, the export API does not verify user ownership of sessions. **Before production deployment:**

```typescript
// Add to src/app/api/export/route.ts
import { auth } from '@clerk/nextjs'

export async function GET(request: NextRequest) {
  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify session belongs to user
  const sessionData = await prisma.session.findUnique({
    where: {
      id: sessionId,
      userId: userId  // Ensure user owns the session
    },
    // ...
  })
}
```

**Why:** Prevents unauthorized users from exporting other users' sessions via URL manipulation.

#### Input Validation
- ✅ Session ID format validated with Zod
- ✅ Format parameter restricted to 'md' | 'pdf' enum
- ✅ SQL injection prevented via Prisma ORM parameterization
- ✅ No path traversal risk (sessionId not used for file paths)

### Performance

#### Current Performance Characteristics
- **Small sessions (10 items):** <100ms generation time
- **Medium sessions (50 items):** <500ms generation time
- **Large sessions (200 items):** <2s generation time

#### Optimization Opportunities

**1. Caching Strategy**
```typescript
// Future enhancement: Cache generated exports
const cacheKey = `export:${sessionId}:${preferencesHash}:${format}`
// Store in Redis with 1-hour TTL
// Invalidate on session updates
```

**2. Background Job Processing**
For very large exports (>100 items):
- Queue export job in background worker
- Provide download link when ready
- Use polling or WebSockets for status updates

**3. Streaming Response**
PDFKit supports streaming, but Next.js Response API doesn't easily support it. Consider for future optimization.

### Deployment

#### Serverless Environments (Vercel, AWS Lambda)

**File System Access:**
- ✅ Logo file (`public/logo.png`) must be committed to repository
- ✅ Vercel includes `public/` files in deployment automatically
- ✅ `process.cwd()` correctly resolves to project root in Next.js

**PDFKit Fonts:**
- ✅ Using built-in fonts (Helvetica, Helvetica-Bold, Helvetica-Oblique)
- ✅ No custom font files required
- ⚠️ If adding custom fonts, include them in deployment package

**Memory Limits:**
- ✅ Vercel default: 1GB (sufficient for 500-item reports)
- ✅ AWS Lambda: 128MB-10GB configurable
- ⚠️ Monitor memory usage for very large sessions

**Testing:**
- Deploy to staging environment before production
- Test exports with various session sizes
- Verify logo renders correctly in deployed environment

#### Environment Variables
No additional environment variables required for export functionality.

### Monitoring & Logging

#### Recommended Production Logging
```typescript
// Add to src/app/api/export/route.ts
console.log('[Export] Request:', {
  sessionId,
  format,
  itemCount: statusItems.length,
  userId
})

console.log('[Export] Generated:', {
  format,
  bytes: buffer.length,
  duration: Date.now() - startTime
})
```

#### Metrics to Track
- Export request volume (by format: MD vs PDF)
- Average generation time by session size
- Error rate (404 Not Found, 500 Server Error)
- File sizes generated
- User engagement with exports vs copy-to-clipboard

#### Alerting
- Set up alerts for error rate >5%
- Alert if generation time >5s (indicates performance issues)
- Monitor failed exports (network errors, blob creation failures)

### Error Handling

#### Handled Edge Cases
1. **Session not found** → 404 response
2. **Missing sessionId in UI** → Export buttons disabled
3. **Logo file missing** → PDF generates without logo (graceful fallback)
4. **Empty status items** → Exports generate with headers only
5. **Invalid format parameter** → 400 with Zod validation error
6. **Network errors** → Export button returns to normal state
7. **Large sessions (500+ items)** → May take 2-3s but completes successfully

#### Cross-Browser Testing
- ✅ Chrome/Edge (Chromium) - Primary target
- ✅ Firefox - Blob download handling tested
- ⚠️ Safari - Test strict download policies
- ⚠️ iOS Safari - Test file downloads behavior
- ⚠️ Chrome Android - Test download manager integration

### Future Enhancements

#### Short-Term
- [ ] Add timestamp header to exports (Generated on: ...)
- [ ] Show user preferences as metadata in exports
- [ ] Email export feature (send PDF as attachment)
- [ ] Export history tracking in database

#### Medium-Term
- [ ] Bulk export multiple sessions as ZIP
- [ ] Custom PDF templates
- [ ] Excel export (.xlsx) for data analysis
- [ ] Scheduled auto-exports (weekly reports)

#### Long-Term
- [ ] Collaboration features (share exports with team)
- [ ] Analytics charts in PDF exports
- [ ] Version control for exports
- [ ] Programmatic export API for integrations

Built with ❤️ by @Natalie624 

