'use client'

interface FilterBarProps {
    filters: {
        classStandard: string
        subject: string
        search: string
        chapter: string
        questionType: string
    }
    onFilterChange: (key: string, value: string) => void
}

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                    <input
                        type="text"
                        placeholder="Search questions..."
                        value={filters.search}
                        onChange={(e) => onFilterChange('search', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                </div>
            </div>

            {/* Class Filter */}
            <select
                value={filters.classStandard}
                onChange={(e) => onFilterChange('classStandard', e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
                <option value="">All Classes</option>
                {[6, 7, 8, 9, 10, 11, 12].map(c => (
                    <option key={c} value={c}>Class {c}</option>
                ))}
            </select>

            {/* Subject Filter */}
            <select
                value={filters.subject}
                onChange={(e) => onFilterChange('subject', e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
                <option value="">All Subjects</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
            </select>

            {/* Chapter Filter */}
            <div className="min-w-[150px]">
                <input
                    type="text"
                    placeholder="Filter by Chapter..."
                    value={filters.chapter}
                    onChange={(e) => onFilterChange('chapter', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
            </div>

            {/* Type Filter */}
            <select
                value={filters.questionType}
                onChange={(e) => onFilterChange('questionType', e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
                <option value="">All Types</option>
                <option value="mcq">MCQ</option>
                <option value="fillblank">Fill Blank</option>
                <option value="truefalse">True/False</option>
            </select>
        </div>
    )
}
