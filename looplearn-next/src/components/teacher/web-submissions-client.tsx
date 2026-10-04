'use client'

import { useState, useMemo } from 'react'
import { WebSubmissionRecord } from '@/app/actions/web-submit'
import { Search, Filter, RefreshCw, CheckCircle2, XCircle, FileText, Image as ImageIcon, Award, Sparkles, BookOpen, User, Calendar, TrendingUp, AlertTriangle, Copy, Check, ListChecks } from 'lucide-react'

function formatErrorMessage(msg: string | null): string {
    if (!msg) return 'Evaluation failed'
    if (msg.includes('429') || msg.includes('quota')) {
        return 'Quota / Rate limit exceeded on AI model (429)'
    }
    if (msg.includes('404') || msg.includes('no longer available')) {
        return 'Legacy model no longer available (404)'
    }
    if (msg.includes('503') || msg.includes('temporarily busy')) {
        return 'AI model busy temporarily (503)'
    }
    if (msg.includes('dictation format') || msg.includes('JSON')) {
        return 'Unreadable photo or non-standard dictation format'
    }
    return msg.split('\n')[0].slice(0, 120)
}

export function WebSubmissionsClient({ initialSubmissions }: { initialSubmissions: WebSubmissionRecord[] }) {
    const [submissions, setSubmissions] = useState<WebSubmissionRecord[]>(initialSubmissions)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedType, setSelectedType] = useState<'all' | 'dictation' | 'homework'>('all')
    const [selectedClass, setSelectedClass] = useState<number | 'all'>('all')
    const [selectedStudent, setSelectedStudent] = useState<string | 'all'>('all')
    const [selectedDateRange, setSelectedDateRange] = useState<'all' | 'today' | 'yesterday' | '7days'>('all')
    const [selectedSub, setSelectedSub] = useState<WebSubmissionRecord | null>(null)
    const [activeTab, setActiveTab] = useState<'submissions' | 'vocab_bank'>('submissions')
    const [vocabFilterMode, setVocabFilterMode] = useState<'all' | 'weak'>('all')
    const [copyFormat, setCopyFormat] = useState<'numbered' | 'comma'>('numbered')
    const [copied, setCopied] = useState(false)

    // Extract unique student names dynamically for the dropdown
    const uniqueStudents = useMemo(() => {
        const set = new Set<string>()
        submissions.forEach(s => {
            if (s.student_name?.trim()) set.add(s.student_name.trim())
        })
        return Array.from(set).sort()
    }, [submissions])

    // Metric summary computations
    const metrics = useMemo(() => {
        const total = submissions.length
        const okSubs = submissions.filter(s => s.status === 'ok')
        const dictationSubs = okSubs.filter(s => s.submission_type === 'dictation')
        const homeworkSubs = okSubs.filter(s => s.submission_type === 'homework')

        const totalWords = dictationSubs.reduce((sum, s) => sum + (s.total_words || 0), 0)
        
        let avgPercent = 0
        if (okSubs.length > 0) {
            const sumPct = okSubs.reduce((acc, s) => {
                if (s.max_score && s.max_score > 0 && s.score != null) {
                    return acc + Math.max(0, (s.score / s.max_score) * 100)
                }
                return acc
            }, 0)
            avgPercent = Math.round(sumPct / okSubs.length)
        }

        const errors = submissions.filter(s => s.status === 'error').length

        return { total, okCount: okSubs.length, dictationCount: dictationSubs.length, homeworkCount: homeworkSubs.length, totalWords, avgPercent, errors }
    }, [submissions])

    // Filter logic
    const filtered = useMemo(() => {
        const now = new Date()
        const todayStr = new Date().toISOString().split('T')[0]
        
        const yesterday = new Date(now)
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]

        const sevenDaysAgo = new Date(now)
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        return submissions.filter(s => {
            if (selectedType !== 'all' && s.submission_type !== selectedType) return false
            if (selectedClass !== 'all' && s.class_standard !== selectedClass) return false
            if (selectedStudent !== 'all' && s.student_name?.trim().toLowerCase() !== selectedStudent.toLowerCase()) return false
            
            // Date filtering
            if (selectedDateRange === 'today') {
                if (!s.created_at.startsWith(todayStr)) return false
            } else if (selectedDateRange === 'yesterday') {
                if (!s.created_at.startsWith(yesterdayStr)) return false
            } else if (selectedDateRange === '7days') {
                if (new Date(s.created_at) < sevenDaysAgo) return false
            }

            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim()
                const name = (s.student_name || '').toLowerCase()
                const chapter = (s.ai_result?.detected_chapter || '').toLowerCase()
                const subject = (s.ai_result?.detected_subject || '').toLowerCase()
                if (!name.includes(q) && !chapter.includes(q) && !subject.includes(q)) return false
            }
            return true
        })
    }, [submissions, selectedType, selectedClass, selectedStudent, selectedDateRange, searchQuery])

    // Class-Wide Master Vocabulary Bank (ALL unique words attempted)
    const classMasterVocab = useMemo(() => {
        const vocabMap: Record<string, {
            correct_spelling: string
            misspellings: Set<string>
            total_count: number
            incorrect_count: number
            correct_count: number
            students: Set<string>
            weak_students: Set<string>
        }> = {}

        filtered.forEach(sub => {
            if (sub.status === 'ok' && sub.submission_type === 'dictation' && sub.ai_result?.words) {
                sub.ai_result.words.forEach((w: any) => {
                    const correct = (w.correct_spelling || w.word_written || '').trim()
                    const written = (w.word_written || '').trim()
                    const key = correct.toLowerCase()

                    if (key) {
                        if (!vocabMap[key]) {
                            vocabMap[key] = {
                                correct_spelling: correct,
                                misspellings: new Set(),
                                total_count: 0,
                                incorrect_count: 0,
                                correct_count: 0,
                                students: new Set(),
                                weak_students: new Set()
                            }
                        }

                        vocabMap[key].total_count++
                        if (sub.student_name) vocabMap[key].students.add(sub.student_name.trim())

                        if (!w.is_correct) {
                            vocabMap[key].incorrect_count++
                            if (written) vocabMap[key].misspellings.add(written)
                            if (sub.student_name) vocabMap[key].weak_students.add(sub.student_name.trim())
                        } else {
                            vocabMap[key].correct_count++
                        }
                    }
                })
            }
        })

        const allList = Object.values(vocabMap).map(item => ({
            correct_spelling: item.correct_spelling,
            misspellings: Array.from(item.misspellings),
            total_count: item.total_count,
            incorrect_count: item.incorrect_count,
            correct_count: item.correct_count,
            students: Array.from(item.students),
            weak_students: Array.from(item.weak_students),
            is_weak: item.incorrect_count > 0
        }))

        // Sort: weak words first (by incorrect count desc), then by total count desc
        allList.sort((a, b) => {
            if (b.incorrect_count !== a.incorrect_count) {
                return b.incorrect_count - a.incorrect_count
            }
            return b.total_count - a.total_count
        })

        return allList
    }, [filtered])

    // Filter displayed vocabulary list (All Unique Words vs Weak Words Only)
    const displayedVocab = useMemo(() => {
        if (vocabFilterMode === 'weak') {
            return classMasterVocab.filter(v => v.is_weak)
        }
        return classMasterVocab
    }, [classMasterVocab, vocabFilterMode])

    // Copy word list handler (Supports Numbered & Comma-Separated output)
    const handleCopyWordList = () => {
        if (displayedVocab.length === 0) return

        let textToCopy = ''
        const title = vocabFilterMode === 'weak'
            ? `📌 Class Weak Vocabulary Re-Practice List (${displayedVocab.length} words)`
            : `📌 Master Class Vocabulary Word Bank (${displayedVocab.length} unique words)`

        if (copyFormat === 'numbered') {
            const formatted = displayedVocab.map((item, idx) => `${idx + 1}. ${item.correct_spelling}`).join('\n')
            textToCopy = `${title}:\n\n${formatted}`
        } else {
            const formatted = displayedVocab.map(item => item.correct_spelling).join(', ')
            textToCopy = `${title}:\n\n${formatted}`
        }

        navigator.clipboard.writeText(textToCopy)
        setCopied(true)
        setTimeout(() => setCopied(false), 3000)
    }

    // Student-specific Multi-Day Analytics (When a single student is selected)
    const studentAnalytics = useMemo(() => {
        if (selectedStudent === 'all') return null

        const studentSubs = submissions.filter(s => s.student_name?.trim().toLowerCase() === selectedStudent.toLowerCase())
        const okSubs = studentSubs.filter(s => s.status === 'ok')
        const totalAttempted = studentSubs.length

        // Total words across all dictations
        const totalWords = okSubs
            .filter(s => s.submission_type === 'dictation')
            .reduce((sum, s) => sum + (s.total_words || 0), 0)

        // Aggregated misspelled words frequency
        const mistakeFreq: Record<string, { count: number; correct_spelling: string }> = {}
        okSubs.forEach(s => {
            if (s.submission_type === 'dictation' && s.ai_result?.words) {
                s.ai_result.words.forEach((w: any) => {
                    if (!w.is_correct) {
                        const written = (w.word_written || '').toLowerCase().trim()
                        if (written) {
                            if (!mistakeFreq[written]) {
                                mistakeFreq[written] = { count: 0, correct_spelling: w.correct_spelling }
                            }
                            mistakeFreq[written].count++
                        }
                    }
                })
            }
        })

        const topMisspelledWords = Object.entries(mistakeFreq)
            .map(([word_written, data]) => ({ word_written, ...data }))
            .sort((a, b) => b.count - a.count)

        // Average %
        let avgPct = 0
        if (okSubs.length > 0) {
            const sum = okSubs.reduce((acc, s) => {
                if (s.max_score && s.max_score > 0 && s.score != null) {
                    return acc + Math.max(0, (s.score / s.max_score) * 100)
                }
                return acc
            }, 0)
            avgPct = Math.round(sum / okSubs.length)
        }

        // Submissions grouped by date
        const groupedByDate: Record<string, WebSubmissionRecord[]> = {}
        studentSubs.forEach(s => {
            const dateKey = new Date(s.created_at).toLocaleDateString('en-IN', {
                timeZone: 'Asia/Kolkata',
                weekday: 'short',
                month: 'short',
                day: 'numeric',
            })
            if (!groupedByDate[dateKey]) groupedByDate[dateKey] = []
            groupedByDate[dateKey].push(s)
        })

        return {
            studentName: studentSubs[0]?.student_name || selectedStudent,
            classStandard: studentSubs[0]?.class_standard || 'N/A',
            totalAttempted,
            okCount: okSubs.length,
            totalWords,
            avgPct,
            topMisspelledWords,
            groupedByDate
        }
    }, [selectedStudent, submissions])

    return (
        <div className="space-y-6">
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-center justify-between text-gray-500 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">Total Submissions</span>
                        <FileText className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div className="text-3xl font-black text-gray-900">{metrics.total}</div>
                    <div className="text-xs text-gray-400 mt-1">
                        {metrics.dictationCount} Dictation · {metrics.homeworkCount} Homework
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-center justify-between text-gray-500 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">Words Evaluated</span>
                        <BookOpen className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="text-3xl font-black text-purple-600">{metrics.totalWords}</div>
                    <div className="text-xs text-gray-400 mt-1">Across dictation sheets</div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-center justify-between text-gray-500 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">Total Unique Words</span>
                        <ListChecks className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="text-3xl font-black text-amber-600">{classMasterVocab.length}</div>
                    <div className="text-xs text-gray-400 mt-1">
                        {classMasterVocab.filter(v => v.is_weak).length} Weak Words · {classMasterVocab.filter(v => !v.is_weak).length} Mastered
                    </div>
                </div>

                <div className={`rounded-2xl border p-5 shadow-sm ${metrics.errors > 0 ? 'bg-red-50/50 border-red-100' : 'bg-white border-gray-100'}`}>
                    <div className="flex items-center justify-between text-gray-500 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">Failed Runs</span>
                        <XCircle className={`w-5 h-5 ${metrics.errors > 0 ? 'text-red-500' : 'text-gray-400'}`} />
                    </div>
                    <div className={`text-3xl font-black ${metrics.errors > 0 ? 'text-red-600' : 'text-gray-900'}`}>{metrics.errors}</div>
                    <div className="text-xs text-gray-400 mt-1">{metrics.total > 0 ? `${Math.round((metrics.errors / metrics.total) * 100)}% error rate` : '0 errors'}</div>
                </div>
            </div>

            {/* View Switcher Tabs (All Submissions vs Master Vocabulary Bank) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('submissions')}
                        className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                            activeTab === 'submissions'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                        📋 All Student Submissions ({filtered.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('vocab_bank')}
                        className={`px-4 py-2 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
                            activeTab === 'vocab_bank'
                                ? 'bg-amber-600 text-white shadow-sm'
                                : 'bg-white text-gray-600 hover:bg-amber-50 hover:text-amber-700 border border-gray-200'
                        }`}
                    >
                        📚 Master Vocabulary Word Bank ({classMasterVocab.length})
                    </button>
                </div>

                {activeTab === 'vocab_bank' && (
                    <div className="flex items-center gap-2">
                        {/* Copy format toggle */}
                        <div className="bg-gray-100 p-0.5 rounded-xl flex items-center text-xs font-semibold text-gray-600">
                            <button
                                onClick={() => setCopyFormat('numbered')}
                                className={`px-2.5 py-1 rounded-lg transition-all ${copyFormat === 'numbered' ? 'bg-white text-gray-900 shadow-sm font-bold' : 'hover:text-gray-900'}`}
                            >
                                1. Numbered List
                            </button>
                            <button
                                onClick={() => setCopyFormat('comma')}
                                className={`px-2.5 py-1 rounded-lg transition-all ${copyFormat === 'comma' ? 'bg-white text-gray-900 shadow-sm font-bold' : 'hover:text-gray-900'}`}
                            >
                                , Comma List
                            </button>
                        </div>

                        <button
                            onClick={handleCopyWordList}
                            className={`px-4 py-2 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 ${
                                copied ? 'bg-emerald-600 text-white' : 'bg-gray-900 text-white hover:bg-gray-800'
                            }`}
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            <span>{copied ? 'Copied to Clipboard!' : `📋 Copy ${displayedVocab.length} Words`}</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3 lg:space-y-0 lg:flex lg:items-center lg:justify-between gap-3">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search name, word, subject..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 transition-colors"
                    />
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Student Select Filter */}
                    <div className="relative">
                        <select
                            value={selectedStudent}
                            onChange={e => setSelectedStudent(e.target.value)}
                            className="px-3 py-2 text-sm bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold rounded-xl focus:outline-none focus:border-indigo-400 max-w-[180px]"
                        >
                            <option value="all">👤 All Students ({uniqueStudents.length})</option>
                            {uniqueStudents.map(st => (
                                <option key={st} value={st}>👤 {st}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date Range Filter */}
                    <select
                        value={selectedDateRange}
                        onChange={e => setSelectedDateRange(e.target.value as any)}
                        className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700 focus:outline-none focus:border-indigo-400"
                    >
                        <option value="all">📅 All Dates</option>
                        <option value="today">Today</option>
                        <option value="yesterday">Yesterday</option>
                        <option value="7days">Past 7 Days</option>
                    </select>

                    {/* Type Filter */}
                    <select
                        value={selectedType}
                        onChange={e => setSelectedType(e.target.value as any)}
                        className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700 focus:outline-none focus:border-indigo-400"
                    >
                        <option value="all">All Types</option>
                        <option value="dictation">✏️ Dictation</option>
                        <option value="homework">📝 Q&amp;A Homework</option>
                    </select>

                    {/* Class Filter */}
                    <select
                        value={selectedClass}
                        onChange={e => setSelectedClass(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700 focus:outline-none focus:border-indigo-400"
                    >
                        <option value="all">All Classes</option>
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(c => (
                            <option key={c} value={c}>Class {c}</option>
                        ))}
                    </select>

                    {(selectedStudent !== 'all' || selectedDateRange !== 'all' || selectedType !== 'all' || selectedClass !== 'all' || searchQuery) && (
                        <button
                            onClick={() => {
                                setSelectedStudent('all')
                                setSelectedDateRange('all')
                                setSelectedType('all')
                                setSelectedClass('all')
                                setSearchQuery('')
                            }}
                            className="text-xs text-indigo-600 hover:underline px-2 py-1 font-semibold"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Student Multi-Day Analytics Panel (Shown when a single student is selected) */}
            {studentAnalytics && (
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-700/50 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-2xl">
                                🎓
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white font-fredoka">{studentAnalytics.studentName}</h2>
                                <p className="text-xs text-indigo-200">
                                    Class {studentAnalytics.classStandard} · Multi-Day Performance Profile
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedStudent('all')}
                            className="self-start sm:self-auto text-xs bg-white/10 hover:bg-white/20 text-white font-semibold px-3 py-1.5 rounded-xl transition-all"
                        >
                            ✕ Clear Student Filter
                        </button>
                    </div>

                    {/* Student Quick Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                            <p className="text-xs text-indigo-200">Tests Attempted</p>
                            <p className="text-2xl font-black text-white mt-1">{studentAnalytics.totalAttempted}</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                            <p className="text-xs text-indigo-200">Total Words</p>
                            <p className="text-2xl font-black text-purple-300 mt-1">{studentAnalytics.totalWords}</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                            <p className="text-xs text-indigo-200">Avg Accuracy</p>
                            <p className="text-2xl font-black text-emerald-400 mt-1">{studentAnalytics.avgPct}%</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                            <p className="text-xs text-indigo-200">Days Active</p>
                            <p className="text-2xl font-black text-amber-300 mt-1">{Object.keys(studentAnalytics.groupedByDate).length}</p>
                        </div>
                    </div>

                    {/* Recurring Misspelled Words Breakdown */}
                    {studentAnalytics.topMisspelledWords.length > 0 && (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                                <AlertTriangle className="w-4 h-4" />
                                <span>Recurring Spelling Mistakes Across Tests ({studentAnalytics.topMisspelledWords.length})</span>
                            </div>
                            <p className="text-xs text-indigo-200">Words this student repeatedly struggled with in dictation evaluations:</p>
                            <div className="flex flex-wrap gap-2 pt-1">
                                {studentAnalytics.topMisspelledWords.map((item, idx) => (
                                    <div key={idx} className="bg-red-500/20 border border-red-500/30 text-white rounded-xl px-3 py-1.5 text-xs flex items-center gap-2">
                                        <span className="line-through text-red-300 font-medium">{item.word_written}</span>
                                        <span className="text-gray-400">→</span>
                                        <span className="font-bold text-emerald-300">{item.correct_spelling}</span>
                                        {item.count > 1 && (
                                            <span className="bg-red-500/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                                {item.count}x
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* View Tab 1: All Submissions List */}
            {activeTab === 'submissions' && (
                filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                        <div className="text-4xl mb-3">🔍</div>
                        <h3 className="font-bold text-gray-800 text-lg">No submissions match your filters</h3>
                        <p className="text-gray-400 text-sm mt-1">Try clearing search keywords or selecting all students.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map(sub => {
                            const dateObj = new Date(sub.created_at)
                            const formattedTime = dateObj.toLocaleString('en-IN', {
                                timeZone: 'Asia/Kolkata',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })

                            const pct = sub.max_score && sub.max_score > 0 && sub.score != null
                                ? Math.round((sub.score / sub.max_score) * 100)
                                : null

                            const isDictation = sub.submission_type === 'dictation'

                            return (
                                <div
                                    key={sub.id}
                                    onClick={() => setSelectedSub(sub)}
                                    className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer flex flex-col justify-between"
                                >
                                    <div>
                                        {/* Card Header */}
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                                                isDictation
                                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                            }`}>
                                                {isDictation ? '✏️ Dictation' : '📝 Homework'}
                                            </span>
                                            <span className="text-xs text-gray-400">{formattedTime}</span>
                                        </div>

                                        {/* Student Info */}
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-gray-900 text-base">{sub.student_name}</h3>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setSelectedStudent(sub.student_name)
                                                }}
                                                className="text-[11px] font-bold text-indigo-600 hover:underline bg-indigo-50 px-2 py-0.5 rounded-lg"
                                            >
                                                Filter Student
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-3">Class {sub.class_standard}</p>

                                        {/* Evaluation details */}
                                        {sub.status === 'ok' ? (
                                            <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-xs text-gray-700">
                                                {isDictation ? (
                                                    <>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500">Words Attempted:</span>
                                                            <span className="font-semibold text-gray-900">{sub.total_words ?? sub.ai_result?.total_words ?? 0}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500">Correct:</span>
                                                            <span className="font-semibold text-emerald-600">{sub.ai_result?.correct_count ?? 0}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500">Misspelled:</span>
                                                            <span className="font-semibold text-red-500">{sub.ai_result?.wrong_count ?? 0}</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500">Subject:</span>
                                                            <span className="font-semibold text-gray-900">{sub.ai_result?.detected_subject || 'Unknown'}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500">Chapter:</span>
                                                            <span className="font-semibold text-gray-900">{sub.ai_result?.detected_chapter || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500">Questions:</span>
                                                            <span className="font-semibold text-gray-900">{sub.ai_result?.questions?.length || 0}</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-600 font-medium overflow-hidden">
                                                <p className="font-bold flex items-center gap-1 mb-0.5">⚠️ Evaluation Failed</p>
                                                <p className="line-clamp-2 text-red-500 font-normal">{formatErrorMessage(sub.error_message)}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Footer / Score */}
                                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-xs text-indigo-600 font-semibold">
                                            <span>Click to view details</span>
                                        </div>
                                        {sub.status === 'ok' && (
                                            <div className="text-right">
                                                <span className="text-sm font-black text-gray-900">{sub.score}</span>
                                                <span className="text-xs text-gray-400">/{sub.max_score}</span>
                                                {pct !== null && (
                                                    <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded-full ${
                                                        pct >= 75 ? 'bg-emerald-100 text-emerald-700' : pct >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {pct}%
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )
            )}

            {/* View Tab 2: Class-Wide Master Vocabulary Word Bank (ALL Unique Words) */}
            {activeTab === 'vocab_bank' && (
                <div className="space-y-4">
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="font-bold text-amber-900 text-lg flex items-center gap-2 font-fredoka">
                                <BookOpen className="w-5 h-5 text-amber-600" /> Master Class Vocabulary Word Bank
                            </h3>
                            <p className="text-xs text-amber-800 mt-1">
                                Deduplicated master list of all unique words attempted by students. Toggle between <span className="font-bold">All Unique Words</span> or <span className="font-bold text-red-700">Weak Words Only</span>.
                            </p>
                        </div>

                        {/* Vocabulary Filter Toggle (All Unique vs Weak Words Only) */}
                        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-amber-200 shadow-sm shrink-0">
                            <button
                                onClick={() => setVocabFilterMode('all')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    vocabFilterMode === 'all'
                                        ? 'bg-amber-600 text-white shadow-sm'
                                        : 'text-gray-600 hover:text-amber-700'
                                }`}
                            >
                                All Unique Words ({classMasterVocab.length})
                            </button>
                            <button
                                onClick={() => setVocabFilterMode('weak')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    vocabFilterMode === 'weak'
                                        ? 'bg-red-600 text-white shadow-sm'
                                        : 'text-gray-600 hover:text-red-700'
                                }`}
                            >
                                Weak Words Only ({classMasterVocab.filter(v => v.is_weak).length})
                            </button>
                        </div>
                    </div>

                    {displayedVocab.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                            <div className="text-4xl mb-3">🎉</div>
                            <h3 className="font-bold text-gray-800 text-lg">No vocabulary words found!</h3>
                            <p className="text-gray-400 text-sm mt-1">No dictation submissions match the current filters.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {displayedVocab.map((item, idx) => (
                                <div key={idx} className={`bg-white rounded-2xl border p-5 shadow-sm space-y-3 ${item.is_weak ? 'border-amber-200' : 'border-gray-100'}`}>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <span className="text-xs font-bold text-gray-400">Word #{idx + 1}</span>
                                            <h4 className="text-xl font-black text-gray-900">{item.correct_spelling}</h4>
                                        </div>
                                        {item.is_weak ? (
                                            <span className="bg-red-100 text-red-700 text-xs font-black px-2.5 py-1 rounded-full">
                                                Missed {item.incorrect_count}x / {item.total_count}
                                            </span>
                                        ) : (
                                            <span className="bg-emerald-100 text-emerald-700 text-xs font-black px-2.5 py-1 rounded-full">
                                                ✅ Mastered ({item.total_count}x)
                                            </span>
                                        )}
                                    </div>

                                    {item.misspellings.length > 0 && (
                                        <div className="text-xs space-y-1 bg-red-50/50 p-2.5 rounded-xl border border-red-100">
                                            <p className="text-gray-500 font-semibold">Common Misspellings Seen:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {item.misspellings.map((m, mIdx) => (
                                                    <span key={mIdx} className="line-through text-red-600 font-mono bg-white px-1.5 py-0.5 rounded border border-red-200">
                                                        {m}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-2 border-t border-gray-100 text-xs text-gray-500 flex items-center justify-between">
                                        <span>Attempted by:</span>
                                        <div className="flex flex-wrap justify-end gap-1">
                                            {item.students.map((st, stIdx) => {
                                                const isWeakStudent = item.weak_students.includes(st)
                                                return (
                                                    <button
                                                        key={stIdx}
                                                        onClick={() => setSelectedStudent(st)}
                                                        className={`font-bold px-2 py-0.5 rounded-md transition-colors ${
                                                            isWeakStudent
                                                                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                                                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                                                        }`}
                                                    >
                                                        {st} {isWeakStudent ? '❌' : '✓'}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Modal Drawer for Detailed View */}
            {selectedSub && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
                        {/* Header */}
                        <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                            <div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                    selectedSub.submission_type === 'dictation'
                                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                }`}>
                                    {selectedSub.submission_type === 'dictation' ? '✏️ Dictation Sheet' : '📝 Q&A Homework'}
                                </span>
                                <h2 className="text-2xl font-bold text-gray-900 mt-2">{selectedSub.student_name}</h2>
                                <p className="text-xs text-gray-500">
                                    Class {selectedSub.class_standard} · {new Date(selectedSub.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedSub(null)}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Image Preview Link */}
                        {selectedSub.image_url && (
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <ImageIcon className="w-5 h-5 text-indigo-600" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">Uploaded Notebook Image</p>
                                        <p className="text-xs text-gray-400">Stored in Supabase Storage</p>
                                    </div>
                                </div>
                                <a
                                    href={selectedSub.image_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl transition-colors"
                                >
                                    👁️ View Photo
                                </a>
                            </div>
                        )}

                        {/* Evaluation Breakdown */}
                        {selectedSub.submission_type === 'dictation' && selectedSub.ai_result?.words && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-purple-50 border border-purple-100 rounded-2xl p-4">
                                    <div>
                                        <p className="text-xs text-purple-600 font-semibold uppercase">Dictation Score</p>
                                        <p className="text-2xl font-black text-purple-900">{selectedSub.score} / {selectedSub.max_score}</p>
                                    </div>
                                    <div className="text-right text-xs text-gray-600 space-y-0.5">
                                        <p>Total Words: <span className="font-bold">{selectedSub.ai_result.total_words}</span></p>
                                        <p className="text-emerald-600">Correct: <span className="font-bold">{selectedSub.ai_result.correct_count}</span></p>
                                        <p className="text-red-500">Misspelled: <span className="font-bold">{selectedSub.ai_result.wrong_count}</span></p>
                                    </div>
                                </div>

                                <h4 className="font-bold text-gray-900 text-sm">Word List &amp; Corrections ({selectedSub.ai_result.words.length})</h4>
                                <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden text-sm max-h-80 overflow-y-auto">
                                    {selectedSub.ai_result.words.map((w: any, idx: number) => (
                                        <div key={idx} className={`flex items-center justify-between p-3 ${w.is_correct ? 'bg-white' : 'bg-red-50/40'}`}>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-bold text-gray-400 w-6">{idx + 1}.</span>
                                                {w.is_correct ? (
                                                    <span className="font-semibold text-gray-800">{w.word_written}</span>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="line-through text-red-600 font-medium">{w.word_written}</span>
                                                        <span className="text-gray-400">→</span>
                                                        <span className="font-bold text-gray-900">{w.correct_spelling}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${w.is_correct ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                                                {w.marks > 0 ? `+${w.marks}` : w.marks}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedSub.submission_type === 'homework' && selectedSub.ai_result?.questions && (
                            <div className="space-y-4">
                                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex justify-between items-center">
                                    <div>
                                        <p className="text-xs text-indigo-600 font-semibold uppercase">{selectedSub.ai_result.detected_subject || 'Homework'}</p>
                                        <p className="text-2xl font-black text-indigo-900">{selectedSub.score} / {selectedSub.max_score}</p>
                                    </div>
                                    <div className="text-right text-xs text-gray-600">
                                        <p>Chapter: <span className="font-bold">{selectedSub.ai_result.detected_chapter || 'N/A'}</span></p>
                                        <p>Questions: <span className="font-bold">{selectedSub.ai_result.questions.length}</span></p>
                                    </div>
                                </div>

                                <h4 className="font-bold text-gray-900 text-sm">Question Evaluation Breakdown</h4>
                                <div className="space-y-3">
                                    {selectedSub.ai_result.questions.map((q: any, idx: number) => (
                                        <div key={idx} className="border border-gray-100 rounded-2xl p-4 space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-gray-900">Question {q.question_number}</span>
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                                    q.marks_awarded === q.max_marks
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : q.marks_awarded === 0
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {q.marks_awarded} / {q.max_marks} marks
                                                </span>
                                            </div>

                                            {q.what_was_correct && (
                                                <div className="text-xs text-emerald-700 bg-emerald-50/50 p-2 rounded-xl">
                                                    ✅ <span className="font-semibold">Correct:</span> {q.what_was_correct}
                                                </div>
                                            )}

                                            {q.what_was_wrong && (
                                                <div className="text-xs text-red-700 bg-red-50/50 p-2 rounded-xl whitespace-pre-line">
                                                    ❌ <span className="font-semibold">Mistakes:</span> {q.what_was_wrong}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedSub.status === 'error' && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-3">
                                <h4 className="font-bold text-red-800 text-sm flex items-center gap-2">
                                    <XCircle className="w-5 h-5 text-red-600" /> Evaluation Error Details
                                </h4>
                                <p className="text-xs text-red-700 font-semibold">Summary: {formatErrorMessage(selectedSub.error_message)}</p>
                                <div className="bg-white border border-red-200 rounded-xl p-3 max-h-48 overflow-y-auto">
                                    <p className="text-[11px] font-mono text-red-600 whitespace-pre-wrap break-all">{selectedSub.error_message || 'No additional error logs.'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
