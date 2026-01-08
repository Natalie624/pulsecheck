import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/app/lib/db'
import { StatusType } from '@prisma/client'
import { AgentPreferences } from '@/app/lib/llm/types'
import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'

// Status type configuration matching ResultsPanel
const STATUS_TYPE_CONFIG = {
  WINS: { label: 'Wins', icon: '🎉' },
  RISKS: { label: 'Risks', icon: '⚠️' },
  BLOCKERS: { label: 'Blockers', icon: '🚧' },
  DEPENDENCY: { label: 'Dependencies', icon: '🔗' },
  NEXT_STEPS: { label: 'Next Steps', icon: '➡️' },
}

// Ordered status types for consistent output
const ORDERED_TYPES: StatusType[] = ['WINS', 'RISKS', 'BLOCKERS', 'DEPENDENCY', 'NEXT_STEPS']

// Low confidence threshold
function isLowConfidence(confidence?: number): boolean {
  return (confidence ?? 1) < 0.7
}

// Zod schema for query parameter validation
const ExportQuerySchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  format: z.enum(['md', 'pdf'], {
    errorMap: () => ({ message: 'Format must be md or pdf' }),
  }),
})

// Type for classified items
interface ClassifiedItem {
  type: StatusType
  text: string
  confidence?: number
}

/**
 * Generate Markdown report from classified items
 */
function generateMarkdownReport(
  groupedItems: Record<StatusType, ClassifiedItem[]>,
  preferences: Partial<AgentPreferences>
): string {
  let text = '# Status Report\n\n'

  const isParagraph = preferences.format === 'paragraph'

  ORDERED_TYPES.forEach((statusType) => {
    const items = groupedItems[statusType]
    if (items && items.length > 0) {
      const config = STATUS_TYPE_CONFIG[statusType]
      text += `## ${config.icon} ${config.label}\n\n`

      if (isParagraph) {
        // Paragraph format: join items with proper punctuation
        const sentences = items.map((item) => {
          const trimmed = item.text.trim()
          const hasEnding = /[.!?]$/.test(trimmed)
          const asterisk = isLowConfidence(item.confidence) ? '*' : ''
          return hasEnding ? trimmed + asterisk : trimmed + '.' + asterisk
        })
        text += sentences.join(' ') + '\n\n'
      } else {
        // Bullet format
        items.forEach((item) => {
          const asterisk = isLowConfidence(item.confidence) ? '*' : ''
          text += `• ${item.text}${asterisk}\n`
        })
        text += '\n'
      }
    }
  })

  // Add footnote if there are low confidence items
  const hasLowConfidenceItems = Object.values(groupedItems)
    .flat()
    .some((item) => isLowConfidence(item.confidence))

  if (hasLowConfidenceItems) {
    text += '---\n\n'
    text += '*Items marked with an asterisk have lower confidence and may require manual review.\n'
  }

  return text
}

/**
 * Generate PDF report from classified items using PDFKit
 */
async function generatePDFReport(
  groupedItems: Record<StatusType, ClassifiedItem[]>,
  preferences: Partial<AgentPreferences>
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Create PDF document
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 60, bottom: 60, left: 60, right: 60 },
        bufferPages: true,
        autoFirstPage: false,
      })

      // Buffer to collect PDF chunks
      const chunks: Buffer[] = []

      // Handle data stream
      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      // Start first page
      doc.addPage()

      // Add logo at top-left
      const logoPath = path.join(process.cwd(), 'public', 'logo.png')
      let currentY = 40
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 60, currentY, { width: 120 })
        // Logo height is proportional to width (assuming square-ish logo)
        currentY += 80 // Space for logo + padding
      }

      // Add gradient header bar below logo (with 22px spacing)
      const gradientY = currentY + 22
      doc
        .rect(60, gradientY, 492, 3)
        .fillColor('#63DFFA')
        .fill()

      doc
        .rect(60, gradientY, 246, 3)
        .fillColor('#5a38e0')
        .fillOpacity(0.5)
        .fill()

      doc.fillOpacity(1) // Reset opacity

      // Add title below gradient line
      doc
        .fontSize(24)
        .fillColor('#1f2937') // gray-900
        .font('Helvetica-Bold')
        .text('Status Report', 60, gradientY + 20)
        .moveDown(1.5)

      const isParagraph = preferences.format === 'paragraph'

      // Render each status type section
      ORDERED_TYPES.forEach((statusType) => {
        const items = groupedItems[statusType]
        if (!items || items.length === 0) return

        const config = STATUS_TYPE_CONFIG[statusType]

        // Check if we need a new page
        if (doc.y > 650) {
          doc.addPage()
        }

        // Section heading (no emoji - PDFKit doesn't render Unicode emojis well)
        doc
          .fontSize(16)
          .fillColor('#5a38e0') // brand purple
          .font('Helvetica-Bold')
          .text(config.label, { continued: false })
          .moveDown(0.5)

        // Section content
        doc
          .fontSize(11)
          .fillColor('#374151') // gray-700
          .font('Helvetica')

        if (isParagraph) {
          // Paragraph format
          const sentences = items.map((item) => {
            const trimmed = item.text.trim()
            const hasEnding = /[.!?]$/.test(trimmed)
            const asterisk = isLowConfidence(item.confidence) ? '*' : ''
            return hasEnding ? trimmed + asterisk : trimmed + '.' + asterisk
          })
          doc.text(sentences.join(' '), {
            align: 'justify',
            paragraphGap: 8,
          })
        } else {
          // Bullet format
          items.forEach((item) => {
            const asterisk = isLowConfidence(item.confidence) ? '*' : ''
            const text = `• ${item.text}${asterisk}`

            // Check if we need a new page mid-list
            if (doc.y > 700) {
              doc.addPage()
            }

            doc.text(text, { paragraphGap: 4 })
          })
        }

        doc.moveDown(1)
      })

      // Add low confidence footnote if needed
      const hasLowConfidenceItems = Object.values(groupedItems)
        .flat()
        .some((item) => isLowConfidence(item.confidence))

      if (hasLowConfidenceItems) {
        // Ensure we have space for footnote
        if (doc.y > 680) {
          doc.addPage()
        }

        doc
          .moveDown(2)
          .strokeColor('#e5e7eb')
          .lineWidth(1)
          .moveTo(60, doc.y)
          .lineTo(552, doc.y)
          .stroke()
          .moveDown(0.5)

        doc
          .fontSize(9)
          .fillColor('#6b7280') // gray-500
          .font('Helvetica-Oblique')
          .text('* Items marked with an asterisk have lower confidence and may require manual review.')
      }

      // Finalize PDF
      doc.end()
    } catch (err) {
      reject(err)
    }
  })
}

/**
 * GET handler for export endpoint
 * Query params: sessionId (string), format (md|pdf)
 */
export async function GET(request: NextRequest) {
  try {
    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams
    const parsed = ExportQuerySchema.safeParse({
      sessionId: searchParams.get('sessionId'),
      format: searchParams.get('format'),
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { sessionId, format } = parsed.data

    // Fetch session data from database
    const sessionData = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        statusItems: {
          orderBy: { createdAt: 'asc' },
        },
        Preference: true,
      },
    })

    if (!sessionData) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Transform Prisma data to grouped format
    const groupedItems = sessionData.statusItems.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = []
      }
      acc[item.type].push({
        type: item.type,
        text: item.content,
        confidence: item.confidence,
      })
      return acc
    }, {} as Record<StatusType, ClassifiedItem[]>)

    // Extract preferences (database stores as strings, cast to proper types)
    const preferences: Partial<AgentPreferences> = sessionData.Preference
      ? {
          pov: sessionData.Preference.pov as AgentPreferences['pov'],
          format: sessionData.Preference.format as AgentPreferences['format'],
          tone: sessionData.Preference.tone as AgentPreferences['tone'],
          thirdPersonName: sessionData.Preference.thirdPersonName ?? undefined,
        }
      : {}

    // Generate export based on format
    if (format === 'md') {
      const markdown = generateMarkdownReport(groupedItems, preferences)
      return new Response(markdown, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Content-Disposition': `attachment; filename="status-report-${sessionId}.md"`,
        },
      })
    } else {
      // PDF format
      const pdfBuffer = await generatePDFReport(groupedItems, preferences)
      return new Response(new Uint8Array(pdfBuffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="status-report-${sessionId}.pdf"`,
        },
      })
    }
  } catch (err) {
    console.error('[API /export] Error:', err)
    return NextResponse.json(
      { error: 'Failed to generate export' },
      { status: 500 }
    )
  }
}
