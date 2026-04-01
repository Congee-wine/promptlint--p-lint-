import { useState } from 'react'

const STORAGE_KEY = 'promptlint_history'

export interface HistoryRecord {
  id: string
  content: string
  filename: string
  createdAt: number
}

export function useHistory() {
  const load = (): HistoryRecord[] => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  }

  const [currentContent, setCurrentContent] = useState<string>('')
  const [records, setRecords] = useState<HistoryRecord[]>(load)
  const [activeId, setActiveId] = useState<string | null>(null)

  const persist = (updated: HistoryRecord[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setRecords(updated)
  }

  const importRecord = (content: string, filename: string) => {
    const newRecord: HistoryRecord = {
      id: Date.now().toString(),
      content,
      filename,
      createdAt: Date.now(),
    }
    const updated = [newRecord, ...records].slice(0, 20)
    persist(updated)
    setActiveId(newRecord.id)
  }

  const updateActiveRecord = (content: string) => {
    if (!activeId) return
    const updated = records.map((r) =>
      r.id === activeId ? { ...r, content } : r,
    )
    persist(updated)
  }

  const deleteRecord = (id: string) => {
    const updated = records.filter((r) => r.id !== id)
    persist(updated)
    if (activeId === id) setActiveId(null)
  }

  return {
    records,
    activeId,
    importRecord,
    updateActiveRecord,
    deleteRecord,
    setActiveId,
  }
}
