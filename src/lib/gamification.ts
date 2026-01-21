// Level thresholds for gamification
export const LEVEL_THRESHOLDS = [
    { level: 1, name: "Mubtadi'", minPoints: 0 },
    { level: 2, name: "Mutawassith", minPoints: 501 },
    { level: 3, name: "Mutaqaddim", minPoints: 1501 },
    { level: 4, name: "Hafidz Muda", minPoints: 3001 },
    { level: 5, name: "Hafidz", minPoints: 5001 },
];

export function calculateLevel(points: number): { level: number; name: string; progress: number; nextLevel: number | null } {
    let currentLevel = LEVEL_THRESHOLDS[0];
    let nextLevel: typeof LEVEL_THRESHOLDS[0] | null = LEVEL_THRESHOLDS[1];

    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (points >= LEVEL_THRESHOLDS[i].minPoints) {
            currentLevel = LEVEL_THRESHOLDS[i];
            nextLevel = LEVEL_THRESHOLDS[i + 1] || null;
            break;
        }
    }

    const progress = nextLevel
        ? ((points - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
        : 100;

    return {
        level: currentLevel.level,
        name: currentLevel.name,
        progress: Math.min(progress, 100),
        nextLevel: nextLevel?.minPoints || null,
    };
}
