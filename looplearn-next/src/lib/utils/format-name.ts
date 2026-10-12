/**
 * Formats a student name into proper Title Case.
 * Example: "anuj raturi" -> "Anuj Raturi"
 *          "ANUJ Raturi" -> "Anuj Raturi"
 *          "Anuj  raturi " -> "Anuj Raturi"
 */
export function formatStudentName(name: string): string {
    if (!name) return ''
    return name
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}
