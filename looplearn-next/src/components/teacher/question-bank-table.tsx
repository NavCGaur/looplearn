'use client'

import { useState, useEffect, useCallback } from 'react'
import { getQuestions, deleteQuestions } from '@/app/actions/bank'
import { FilterBar } from './filter-bar'
import { QuestionPreviewModal } from './question-preview-modal'
import { FormulaText } from '@/components/ui/formula-text'

export function QuestionBankTable() {
    // Data State
    const [questions, setQuestions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)

    // Filter State
    const [filters, setFilters] = useState({
        classStandard: '',
        subject: '',
        search: '',
        chapter: '',
        questionType: ''
    })
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(40)

    // Selection State
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [deleting, setDeleting] = useState(false)

    // Preview State
    const [previewQuestion, setPreviewQuestion] = useState<any>(null)

    // Fetch Data
    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await getQuestions({
                classStandard: filters.classStandard ? Number(filters.classStandard) : undefined,
                subject: filters.subject || undefined,
                search: filters.search || undefined,
                chapter: filters.chapter || undefined,
                questionType: filters.questionType || undefined,
                page,
                pageSize
            })
            setQuestions(res.questions)
            setTotal(res.total)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [filters, page, pageSize])

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData()
        }, 500)
        return () => clearTimeout(timer)
    }, [fetchData])

    // Handlers
    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }))
        setPage(1) // Reset page on filter change
    }

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds)
        if (newSet.has(id)) newSet.delete(id)
        else newSet.add(id)
        setSelectedIds(newSet)
    }

    const toggleAll = () => {
        if (selectedIds.size === questions.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(questions.map(q => q.id)))
        }
    }

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedIds.size} questions?`)) return

        setDeleting(true)
        try {
            await deleteQuestions(Array.from(selectedIds))
            setSelectedIds(new Set())
            fetchData() // Refresh
        } catch (err) {
            alert('Failed to delete questions')
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">
                    Question Bank <span className="text-gray-400 text-lg font-normal">({total})</span>
                </h1>

                {selectedIds.size > 0 && (
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-red-700 transition-all flex items-center gap-2 animate-in zoom-in"
                    >
                        {deleting ? 'Deleting...' : `🗑️ Delete (${selectedIds.size})`}
                    </button>
                )}
            </div>

            <FilterBar filters={filters} onFilterChange={handleFilterChange} />

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-4 w-12">
                                    <input
                                        type="checkbox"
                                        onChange={toggleAll}
                                        checked={questions.length > 0 && selectedIds.size === questions.length}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                                    />
                                </th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Question</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Type</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Class</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Subject</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                // Skeleton Loading
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="p-4"><div className="h-4 w-4 bg-gray-200 rounded"></div></td>
                                        <td className="p-4"><div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div><div className="h-3 w-1/2 bg-gray-100 rounded"></div></td>
                                        <td className="p-4"><div className="h-6 w-20 bg-gray-200 rounded-full"></div></td>
                                        <td className="p-4"><div className="h-4 w-12 bg-gray-200 rounded"></div></td>
                                        <td className="p-4"><div className="h-4 w-20 bg-gray-200 rounded"></div></td>
                                        <td className="p-4"><div className="h-8 w-8 bg-gray-200 rounded-full"></div></td>
                                    </tr>
                                ))
                            ) : questions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-gray-500">
                                        No questions found. Try changing filters or generate new ones!
                                    </td>
                                </tr>
                            ) : (
                                questions.map((q) => (
                                    <tr
                                        key={q.id}
                                        className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedIds.has(q.id) ? 'bg-indigo-50/50' : ''}`}
                                        onClick={() => toggleSelection(q.id)}
                                    >
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(q.id)}
                                                onChange={() => toggleSelection(q.id)}
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                                            />
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-gray-900 line-clamp-2 max-w-xl">
                                                <FormulaText>{q.question_text}</FormulaText>
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1 capitalize">{q.difficulty} • {q.chapter}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                ${q.question_type === 'mcq' ? 'bg-blue-100 text-blue-800' :
                                                    q.question_type === 'fillblank' ? 'bg-orange-100 text-orange-800' :
                                                        'bg-green-100 text-green-800'}`}>
                                                {q.question_type === 'fillblank' ? 'Fill Blank' : q.question_type === 'truefalse' ? 'T/F' : 'MCQ'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600 font-medium">Class {q.class_standard}</td>
                                        <td className="p-4 text-sm text-gray-600 capitalize">{q.subject}</td>
                                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => setPreviewQuestion(q)}
                                                className="text-gray-400 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-gray-100 cursor-pointer"
                                                title="Preview as Student"
                                            >
                                                👁️
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Stats */}
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-sm text-gray-500 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <span>Showing {questions.length} of {total} results</span>

                        <div className="flex items-center gap-2">
                            <label htmlFor="pageSize" className="text-xs uppercase font-bold text-gray-400">Rows per page:</label>
                            <select
                                id="pageSize"
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value))
                                    setPage(1)
                                }}
                                className="bg-transparent border-none focus:ring-0 cursor-pointer font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                            >
                                <option value={20}>20</option>
                                <option value={40}>40</option>
                                <option value={60}>60</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer"
                        >Previous</button>
                        <button
                            disabled={questions.length < pageSize}
                            onClick={() => setPage(p => p + 1)}
                            className="px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer"
                        >Next</button>
                    </div>
                </div>
            </div>

            <QuestionPreviewModal
                isOpen={!!previewQuestion}
                onClose={() => setPreviewQuestion(null)}
                question={previewQuestion}
            />
        </div>
    )
}
