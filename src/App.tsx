import React, { useState, useEffect, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  Zap, 
  Wand2, 
  BarChart3, 
  Layout, 
  ChevronRight,
  CheckCircle2,
  XCircle,
  Download
} from 'lucide-react';
import { cn } from './lib/utils';
import { lintPrompt, deepAnalyzePrompt, autoFixPrompt } from './services/lintService';
import { type LintResult } from './types';

export default function App() {
  const [content, setContent] = useState('# Role: \n# Task: \n# AC: \n\n');
  const [lintResults, setLintResults] = useState<LintResult[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // Initial lint
    runLint(content);
  };

  const runLint = async (val: string) => {
    const results = await lintPrompt(val);
    setLintResults(results);

    if (monacoRef.current && editorRef.current) {
      const markers = results.map(res => ({
        severity: res.severity === 'error' ? monacoRef.current.MarkerSeverity.Error : 
                  res.severity === 'warning' ? monacoRef.current.MarkerSeverity.Warning : 
                  monacoRef.current.MarkerSeverity.Info,
        message: res.message,
        startLineNumber: res.startLineNumber,
        startColumn: res.startColumn,
        endLineNumber: res.endLineNumber,
        endColumn: res.endColumn,
      }));
      monacoRef.current.editor.setModelMarkers(editorRef.current.getModel(), 'linter', markers);
    }
  };

  const handleDeepAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await deepAnalyzePrompt(content);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleAutoFix = async () => {
    setIsFixing(true);
    const fixed = await autoFixPrompt(content);
    setContent(fixed);
    setIsFixing(false);
    runLint(fixed);
  };

  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prompt.prompt';
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      runLint(content);
    }, 500);
    return () => clearTimeout(timer);
  }, [content]);

  const score = analysis?.score || (100 - lintResults.length * 10);
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-green-500';
    if (s >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden">
      {/* Sidebar - Dashboard */}
      <div className="w-80 border-r border-white/10 flex flex-col bg-[#0f0f0f]">
        <div className="p-6 border-bottom border-white/10 flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">PromptLint</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Score Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-white/50 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> 健壮性得分
              </h2>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={cn("text-6xl font-bold tracking-tighter", getScoreColor(score))}>
                {Math.max(0, score)}
              </span>
              <span className="text-white/30 text-sm">/ 100</span>
            </div>
          </section>

          {/* Lint Summary */}
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
                  <div key={i} className={cn(
                    "p-3 rounded-lg border text-sm flex gap-3",
                    res.severity === 'error' ? "bg-red-400/10 border-red-400/20 text-red-400" :
                    res.severity === 'warning' ? "bg-yellow-400/10 border-yellow-400/20 text-yellow-400" :
                    "bg-blue-400/10 border-blue-400/20 text-blue-400"
                  )}>
                    {res.severity === 'error' ? <XCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
                    <div>
                      <div className="font-semibold mb-1">L{res.startLineNumber}: {res.ruleId}</div>
                      <div className="opacity-80 leading-relaxed">{res.message}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* AI Analysis */}
          {analysis && (
            <section className="space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-white/50 flex items-center gap-2">
                <Zap className="w-4 h-4" /> AI 深度评审
              </h2>
              <div className="space-y-3">
                {analysis.logicalConflicts?.map((c: string, i: number) => (
                  <div key={i} className="text-sm text-red-400 bg-red-400/5 p-2 rounded border border-red-400/10 flex gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" /> {c}
                  </div>
                ))}
                {analysis.suggestions?.map((s: string, i: number) => (
                  <div key={i} className="text-sm text-blue-300 bg-blue-400/5 p-2 rounded border border-blue-400/10 flex gap-2">
                    <Info className="w-4 h-4 shrink-0" /> {s}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="p-4 border-t border-white/10 space-y-2">
          <button 
            onClick={handleDeepAnalyze}
            disabled={isAnalyzing}
            className="w-full py-2.5 px-4 bg-white text-black rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition-colors disabled:opacity-50"
          >
            {isAnalyzing ? "分析中..." : <><Zap className="w-4 h-4" /> AI 深度评审</>}
          </button>
          <button 
            onClick={handleAutoFix}
            disabled={isFixing}
            className="w-full py-2.5 px-4 bg-white/10 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/20 transition-colors border border-white/10 disabled:opacity-50"
          >
            {isFixing ? "修复中..." : <><Wand2 className="w-4 h-4" /> 一键结构化重构</>}
          </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-[#0a0a0a]">
          <div className="flex items-center gap-2 text-sm text-white/50 font-mono">
            <span>Editor</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white/80">prompt.md</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-white/30 font-mono">
              {content.length} characters | {content.split('\n').length} lines
            </div>
            <button 
              onClick={handleExport}
              className="p-2 hover:bg-white/10 rounded-md transition-colors text-white/50 hover:text-white"
              title="Export as .prompt"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex-1">
          <Editor
            height="100%"
            defaultLanguage="markdown"
            theme="vs-dark"
            value={content}
            onChange={(val) => setContent(val || '')}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 16,
              lineHeight: 24,
              padding: { top: 20 },
              wordWrap: 'on',
              fontFamily: 'JetBrains Mono, Menlo, Monaco, Courier New, monospace',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              glyphMargin: true,
              lightbulb: { enabled: true },
            }}
          />
        </div>
      </div>
    </div>
  );
}

