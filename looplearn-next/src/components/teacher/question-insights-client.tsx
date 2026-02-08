'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { QuestionPerformance } from '@/app/actions/analytics'
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

interface Props {
    questions: QuestionPerformance[]
}

type SortField = 'question_text' | 'subject' | 'difficulty' | 'total_attempts' | 'avg_quality' | 'struggle_rate'
type SortDirection = 'asc' | 'desc'

export function QuestionInsightsClient({ questions }: Props) {
    const [searchTerm, setSearchTerm] = useState('')
    const [subjectFilter, setSubjectFilter] = useState('')
    const [difficultyFilter, setDifficultyFilter] = useState('')
    const [sortField, setSortField] = useState<SortField>('avg_quality')
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 20

    // Filter and sort questions
    const filteredQuestions = useMemo(() => {
        let filtered = questions.filter(q => {
            const matchesSearch = q.question_text.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesSubject = !subjectFilter || q.subject === subjectFilter
            const matchesDifficulty = !difficultyFilter || q.difficulty === difficultyFilter
            return matchesSearch && matchesSubject && matchesDifficulty
        })

        // Sort
        filtered.sort((a, b) => {
            let aVal = a[sortField]
            let bVal = b[sortField]

            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase()
                bVal = (bVal as string).toLowerCase()
            }

            if (sortDirection === 'asc') {
                return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
            } else {
                return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
            }
        })

        return filtered
    }, [questions, searchTerm, subjectFilter, difficultyFilter, sortField, sortDirection])

    // Pagination
    const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage)
    const paginatedQuestions = filteredQuestions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
    }

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ArrowUpDown className="w-4 h-4 text-gray-400" />
        return sortDirection === 'asc' ?
            <ArrowUp className="w-4 h-4 text-indigo-600" /> :
            <ArrowDown className="w-4 h-4 text-indigo-600" />
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-gray-800">
                                    Question Insights
                                </h1>
                                <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full">
                                    BETA
                                </span>
                            </div>
                            <p className="text-sm text-gray-600">
                                Detailed performance analysis for all your questions
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                href="/teacher/analytics"
                                className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                            >
                                ← Back to Analytics
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Search Questions</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by question text..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
                            <select
                                value={subjectFilter}
                                onChange={(e) => setSubjectFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">All Subjects</option>
                                <option value="mathematics">Mathematics</option>
                                <option value="physics">Physics</option>
                                <option value="chemistry">Chemistry</option>
                                <option value="biology">Biology</option>
                                <option value="science">Science</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Difficulty</label>
                            <select
                                value={difficultyFilter}
                                onChange={(e) => setDifficultyFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">All Levels</option>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Showing {paginatedQuestions.length} of {filteredQuestions.length} questions
                        </p>
                        <button
                            onClick={() => {
                                setSearchTerm('')
                                setSubjectFilter('')
                                setDifficultyFilter('')
                            }}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th
                                        className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('question_text')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Question
                                            <SortIcon field="question_text" />
                                        </div>
                                    </th>
                                    <th
                                        className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('subject')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Subject
                                            <SortIcon field="subject" />
                                        </div>
                                    </th>
                                    <th
                                        className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('difficulty')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Difficulty
                                            <SortIcon field="difficulty" />
                                        </div>
                                    </th>
                                    <th
                                        className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('total_attempts')}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            Attempts
                                            <SortIcon field="total_attempts" />
                                        </div>
                                    </th>
                                    <th
                                        className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('avg_quality')}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            Avg Quality
                                            <SortIcon field="avg_quality" />
                                        </div>
                                    </th>
                                    <th
                                        className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('struggle_rate')}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            Struggle Rate
                                            <SortIcon field="struggle_rate" />
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paginatedQuestions.map((q) => (
                                    <tr key={q.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 max-w-md">
                                            <p className="text-sm text-gray-900 line-clamp-2">{q.question_text}</p>
                                            {q.chapter && (
                                                <p className="text-xs text-gray-500 mt-1">Chapter: {q.chapter}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-gray-700 capitalize">{q.subject}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${q.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                                q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {q.difficulty}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-sm font-medium text-gray-900">{q.total_attempts}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`text-sm font-bold ${q.avg_quality >= 2.5 ? 'text-green-600' :
                                                q.avg_quality >= 1.5 ? 'text-yellow-600' :
                                                    'text-red-600'
                                                }`}>
                                                {q.avg_quality.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`text-sm font-medium ${q.struggle_rate > 50 ? 'text-red-600' :
                                                q.struggle_rate > 25 ? 'text-orange-600' :
                                                    'text-green-600'
                                                }`}>
                                                {q.struggle_rate.toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Link
                                                href={`/teacher/questions?highlight=${q.id}`}
                                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-600">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
