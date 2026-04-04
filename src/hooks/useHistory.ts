import { useState } from 'react'

const STORAGE_KEY = 'promptlint_history'
const ACTIVE_ID_KEY = 'promptlint_active_id'

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

  const loadActiveId = (): string | null => {
    return localStorage.getItem(ACTIVE_ID_KEY)
  }

  const initialRecords = load()
  const initialActiveId = loadActiveId()

  const initialContent =
    initialRecords.find((r) => r.id === initialActiveId)?.content ??
    '# Role: \n\n# Task: \n\n# AC: \n'

  const initialFilename =
    initialRecords.find((r) => r.id === initialActiveId)?.filename ??
    'prompt.md'

  const [records, setRecords] = useState<HistoryRecord[]>(initialRecords)
  const [activeId, setActiveIdState] = useState<string | null>(initialActiveId)

  const persist = (updated: HistoryRecord[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setRecords(updated)
  }

  const setActiveId = (id: string | null) => {
    if (id) {
      localStorage.setItem(ACTIVE_ID_KEY, id)
    } else {
      localStorage.removeItem(ACTIVE_ID_KEY)
    }
    setActiveIdState(id)
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
    initialContent,
    initialFilename,
    setActiveId,
    importRecord,
    updateActiveRecord,
    deleteRecord,
  }
}
