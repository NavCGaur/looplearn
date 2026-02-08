'use client'

import { FormulaText } from '@/components/ui/formula-text'

interface QuestionPreviewModalProps {
    isOpen: boolean
    onClose: () => void
    question: any
}

export function QuestionPreviewModal({ isOpen, onClose, question }: QuestionPreviewModalProps) {
    if (!isOpen || !question) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <span>👁️</span> Student View Preview
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    {/* Simulation of Quiz Card */}
                    <div className="bg-white border-2 border-indigo-50 rounded-xl p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                {question.subject} • Class {question.class_standard}
                            </span>
                            <span className="text-gray-400 text-sm font-medium capitalize">
                                {question.difficulty}
                            </span>
                        </div>

                        <h2 className="text-xl font-bold text-gray-800 mb-6 leading-relaxed">
                            <FormulaText>{question.question_text}</FormulaText>
                        </h2>

                        <div className="space-y-3">
                            {question.question_type === 'mcq' && question.question_options?.sort((a: any, b: any) => a.display_order - b.display_order).map((opt: any, idx: number) => (
                                <div
                                    key={opt.id}
                                    className={`p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${opt.is_correct ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-gray-50'}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${opt.is_correct ? 'bg-green-200 text-green-700' : 'bg-white border border-gray-200 text-gray-500'}`}>
                                        {String.fromCharCode(65 + idx)}
                                    </div>
                                    <div className="font-medium text-gray-700">
                                        <FormulaText>{opt.option_text}</FormulaText>
                                    </div>
                                    {opt.is_correct && <span className="ml-auto text-green-600 text-sm font-bold">✔</span>}
                                </div>
                            ))}

                            {question.question_type === 'truefalse' && question.question_options?.map((opt: any) => (
                                <div
                                    key={opt.id}
                                    className={`p-4 rounded-xl border-2 transition-all text-center font-bold ${opt.is_correct ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-100 text-gray-500'}`}
                                >
                                    {opt.option_text}
                                </div>
                            ))}

                            {question.question_type === 'fillblank' && (
                                <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200 border-dashed text-center text-gray-500 font-mono">
                                    [ Student Types Answer Here ]
                                    <div className="mt-2 text-green-600 font-bold text-sm">
                                        Correct Answer: {question.fillblank_answers?.[0]?.accepted_answer}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Explanation Preview */}
                    <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                        <h4 className="text-sm font-bold text-yellow-800 mb-1">💡 Explanation (Shown after answering)</h4>
                        <p className="text-yellow-700 text-sm">
                            {question.question_options?.find((o: any) => o.is_correct)?.explanation || "No explanation provided."}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition-colors"
                    >
                        Close Preview
                    </button>
                </div>
            </div>
        </div>
    )
}
