import { type LintResult } from '@/types'
import { cn } from '@/lib/utils'
import {
  ShieldCheck,
  AlertTriangle,
  Info,
  Zap,
  Wand2,
  BarChart3,
  Layout,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

interface SidebarProps {
  score: number
  lintResults: LintResult[]
  analysis: any

  onAnalyze: () => void
  onFix: () => void

  isAnalyzing: boolean
  isFixing: boolean
}

export default function Sidebar(props: SidebarProps) {
  const {
    score,
    lintResults,
    analysis,
    onAnalyze,
    onFix,
    isAnalyzing,
    isFixing,
  } = props

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-green-500'
    if (s >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className="w-80 border-r border-white/10 flex flex-col bg-[#0f0f0f]">
      <div className="p-6 border-bottom border-white/10 flex items-center gap-3">
        <div className="p-2 bg-blue-600 rounded-lg">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">PromptLint</h1>
      </div>

      {/* 得分区域 */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-white/50 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> 健壮性得分
          </h2>
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              'text-6xl font-bold tracking-tighter',
              getScoreColor(score),
            )}
          >
            {Math.max(0, score)}
          </span>
          <span className="text-white/30 text-sm">/ 100</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* 代码检查摘要区域 */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-white/50 flex items-center gap-2">
            <Layout className="w-4 h-4" /> 实时扫描结果
          </h2>
          <div className="space-y-2">
            {lintResults.length === 0 ? (
              <div className="flex items-center gap-2 text-green-400 text-sm bg-green-400/10 p-3 rounded-lg border border-green-400/20">
                <CheckCircle2 className="w-4 h-4" /> 暂无静态扫描问题
              </div>
            ) : (
              lintResults.map((res, i) => (
                <div
                  key={i}
                  className={cn(
                    'p-3 rounded-lg border text-sm flex gap-3',
                    res.severity === 'error'
                      ? 'bg-red-400/10 border-red-400/20 text-red-400'
                      : res.severity === 'warning'
                        ? 'bg-yellow-400/10 border-yellow-400/20 text-yellow-400'
                        : 'bg-blue-400/10 border-blue-400/20 text-blue-400',
                  )}
                >
                  {res.severity === 'error' ? (
                    <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-semibold mb-1">
                      L{res.startLineNumber}: {res.ruleId}
                    </div>
                    <div className="opacity-80 leading-relaxed">
                      {res.message}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* AI 深度评审区域 */}
        {analysis && (
          <section className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-white/50 flex items-center gap-2">
              <Zap className="w-4 h-4" /> AI 深度评审
            </h2>
            <div className="space-y-3">
              {analysis.logicalConflicts?.map((c: string, i: number) => (
                <div
                  key={i}
                  className="text-sm text-red-400 bg-red-400/5 p-2 rounded border border-red-400/10 flex gap-2"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {c}
                </div>
              ))}
              {analysis.suggestions?.map((s: string, i: number) => (
                <div
                  key={i}
                  className="text-sm text-blue-300 bg-blue-400/5 p-2 rounded border border-blue-400/10 flex gap-2"
                >
                  <Info className="w-4 h-4 shrink-0" /> {s}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="p-4 border-t border-white/10 space-y-2">
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="w-full py-2.5 px-4 bg-white text-black rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition-colors disabled:opacity-50"
        >
          {isAnalyzing ? (
            '分析中...'
          ) : (
            <>
              <Zap className="w-4 h-4" /> AI 深度评审
            </>
          )}
        </button>
        <button
          onClick={onFix}
          disabled={isFixing}
          className="w-full py-2.5 px-4 bg-white/10 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/20 transition-colors border border-white/10 disabled:opacity-50"
        >
          {isFixing ? (
            '修复中...'
          ) : (
            <>
              <Wand2 className="w-4 h-4" /> 一键结构化重构
            </>
          )}
        </button>
      </div>
    </div>
  )
}
