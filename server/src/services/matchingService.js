export const computeMatchScore = (problem, startup) => {
    const problemTechnologies = (problem.technologyRequirements || '').split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);
    const startupTechnologies = (startup.technologies || '').split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);

    const technologyMatch = problemTechnologies.length
        ? Math.min(100, Math.round((startupTechnologies.filter((tech) => problemTechnologies.includes(tech)).length / Math.max(problemTechnologies.length, 1)) * 100))
        : 100;

    const domainMatch = problem.category && startup.industry
        ? Math.min(100, Math.max(50, 80 + (problem.category.toLowerCase().includes(startup.industry.toLowerCase().split(' ')[0]) ? 10 : 0)))
        : 80;

    const budgetCompatibility = 75 + (startup.verified ? 10 : 0) + (startup.teamSize && startup.teamSize > 10 ? 8 : 0);
    const experience = startup.verified ? 86 : 72;
    const eligibility = startup.verified ? 90 : 74;
    const previousPilotExperience = startup.verified ? 88 : 70;

    const overall = Math.min(100, Math.round(
        (technologyMatch * 0.3) +
        (domainMatch * 0.2) +
        (budgetCompatibility * 0.15) +
        (experience * 0.15) +
        (eligibility * 0.1) +
        (previousPilotExperience * 0.1)
    ));

    const reasons = [
        technologyMatch >= 80 ? '✓ Uses required AI technology' : '• Technology fit is moderate',
        domainMatch >= 80 ? '✓ Works in the required domain' : '• Domain alignment needs review',
        budgetCompatibility >= 80 ? '✓ Budget is compatible' : '• Budget fit requires validation',
        previousPilotExperience >= 80 ? '✓ Has completed similar projects' : '• Prior pilot experience is limited'
    ];

    return {
        overall,
        technologyMatch,
        domainMatch: Math.min(100, domainMatch),
        budgetCompatibility: Math.min(100, Math.round(budgetCompatibility)),
        experience,
        eligibility,
        previousPilotExperience,
        reasons
    };
};
