export interface QuestionOption {
    id: string
    option_text: string
    display_order: number
    is_correct: boolean
    question_id?: string
}

export interface FillBlankAnswer {
    id: string
    accepted_answer: string
    is_case_sensitive: boolean
    is_primary: boolean
    question_id?: string
}

export interface QuizQuestion {
    id: string
    question_text: string
    question_type: 'mcq' | 'multiple_choice' | 'true_false' | 'fill_blank'
    class_standard: number
    subject: string
    difficulty: 'easy' | 'medium' | 'hard'
    points: number
    chapter?: string
    is_active: boolean
    created_at?: string
    question_options?: QuestionOption[]
    fillblank_answers?: FillBlankAnswer[]
    [key: string]: any // Fallback
}

export type Database = any // Stub if needed
