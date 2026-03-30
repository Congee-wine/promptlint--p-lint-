export interface LintRule {
  id: string
  severity: 'error' | 'warning' | 'info'
  message: string
  triggers?: string[]
  conflictsWith?: string[]
  category: 'vague' | 'structure' | 'logic'
}

export interface LintResult {
  ruleId: string
  severity: 'error' | 'warning' | 'info'
  message: string
  startLineNumber: number
  startColumn: number
  endLineNumber: number
  endColumn: number
}
