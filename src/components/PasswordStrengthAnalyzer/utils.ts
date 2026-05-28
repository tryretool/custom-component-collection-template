export const calculateStrength = (password: string): number => {
    let score = 0
    if (!password) return 0

    if (password.length > 8) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    return score
}
