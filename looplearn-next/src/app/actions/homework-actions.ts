'use server'

import * as homeworkService from './homework'

export async function saveHomeworkPlan(params: {
    class_standard: number
    subject: string
    day_of_week: number
    week_start: string
    hw_number: number
    task_description: string
    due_time?: string
}) {
    return homeworkService.saveHomeworkPlan(params)
}

export async function updateStudentPhone(studentId: string, phone: string | null) {
    return homeworkService.updateStudentPhone(studentId, phone)
}

export async function getNextHwNumber(classStandard: number, subject: string) {
    return homeworkService.getNextHwNumber(classStandard, subject)
}
