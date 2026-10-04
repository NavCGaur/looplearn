export interface PhaseDayMapping {
    phaseNumber: number;
    phaseName: string;
    targetDayOfWeek: number; // 1 = Monday, 2 = Tuesday ... 7 = Sunday
    label: string;
}

// Tuesday-to-Monday instructional loop mappings
export const ACTIVE_PILOT_SCHEDULE: PhaseDayMapping[] = [
    { phaseNumber: 1, phaseName: 'Introduction', targetDayOfWeek: 2, label: 'Tuesday' },
    { phaseNumber: 2, phaseName: 'Guided Practice', targetDayOfWeek: 3, label: 'Wednesday' },
    { phaseNumber: 3, phaseName: 'Production & HW', targetDayOfWeek: 4, label: 'Thursday' },
    { phaseNumber: 4, phaseName: 'App Revision', targetDayOfWeek: 5, label: 'Friday' },
    { phaseNumber: 5, phaseName: 'App Practice', targetDayOfWeek: 6, label: 'Saturday' },
    { phaseNumber: 6, phaseName: 'App Challenge', targetDayOfWeek: 7, label: 'Sunday' },
    { phaseNumber: 7, phaseName: 'Assessment', targetDayOfWeek: 1, label: 'Monday' }
];

export function getMappingForDay(dayOfWeek: number): PhaseDayMapping | undefined {
    return ACTIVE_PILOT_SCHEDULE.find(m => m.targetDayOfWeek === dayOfWeek);
}

export function getMappingForPhase(phaseNum: number): PhaseDayMapping | undefined {
    return ACTIVE_PILOT_SCHEDULE.find(m => m.phaseNumber === phaseNum);
}
