export interface LintRuleMatch {
  startLineNumber: number
  startColumn: number
  endLineNumber: number
  endColumn: number
}

export interface LintRule {
  id: string
  severity: 'error' | 'warning' | 'info'
  category: 'structure' | 'clarity' | 'completeness' | 'consistency'
  message: string
  suggest?: string
  scope: 'line' | 'document'
  check: (content: string, lines: string[]) => LintRuleMatch[]
}

export interface LintResult {
  ruleId: string
  severity: 'error' | 'warning' | 'info'
  message: string
  suggest?: string
  startLineNumber: number
  startColumn: number
  endLineNumber: number
  endColumn: number
}
