// Resusable, fillable prompt templates for LLMs

export const promptTemplates = {
    wins: (team: string, timeframe: string, input: string) => `Summarize the key wins for ${team} during ${timeframe}.
    Include completed deliverables, key milestones, or measurable impacts on team or product goals.
    Input: ${input}`,

    risks: (project: string, timeframe: string, input: string) => `
    List current or emerging risks for ${project} as of ${timeframe}.
    Include technical, resource, or alignment risks. Input: ${input}
  `,

  blockers: (team: string, timeframe: string, input: string) => `
    Identify active blockers for ${team} during ${timeframe}.
    Describe affected deliverables and whether resolution is in progress.
    Input: ${input}
  `,

  dependencies: (project: string, timeframe: string, input: string) => `
    Summarize the cross-team or external dependencies impacting ${project} this ${timeframe}.
    Note owners, current status, and any coordination efforts.
    Input: ${input}
  `,

  nextSteps: (team: string, nextTimeframe: string, input: string) => `
    Outline key next steps planned for ${team} during ${nextTimeframe}.
    Include major deliverables, meetings, or decisions ahead.
    Input: ${input}
  `,
}