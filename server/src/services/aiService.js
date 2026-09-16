import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { config } from '../config.js';
import { jsonrepair } from 'jsonrepair';

const fallbackCategories = ['Urban Mobility', 'Healthcare', 'Education', 'Environment', 'Public Safety'];

const geminiPrompt = (problemInput) => `You are an expert government innovation procurement analyst.
Analyze this problem and return ONLY valid JSON, with no markdown fences, using exactly these keys:
category (string), technologies (string array), requirements (string array), suggestedKpis (string array), pilotDuration (string), complexity (one of Low, Medium, High), innovationPotential (string percentage), risks (string array).
Problem input:
${JSON.stringify(problemInput)}`;

const analysisSchema = {
    type: 'OBJECT',
    properties: {
        category: { type: 'STRING' },
        technologies: { type: 'ARRAY', items: { type: 'STRING' } },
        requirements: { type: 'ARRAY', items: { type: 'STRING' } },
        suggestedKpis: { type: 'ARRAY', items: { type: 'STRING' } },
        pilotDuration: { type: 'STRING' },
        complexity: { type: 'STRING', enum: ['Low', 'Medium', 'High'] },
        innovationPotential: { type: 'STRING' },
        risks: { type: 'ARRAY', items: { type: 'STRING' } }
    },
    required: ['category', 'technologies', 'requirements', 'suggestedKpis', 'pilotDuration', 'complexity', 'innovationPotential', 'risks']
};

const parseStructuredJson = (text) => {
    const cleaned = text.replace(/^```(?:json)?\s*|\s*```$/gi, '').trim();
    try {
        return JSON.parse(cleaned);
    } catch {
        const start = cleaned.indexOf('{');
        const end = cleaned.lastIndexOf('}');
        if (start >= 0 && end > start) {
            try {
                return JSON.parse(cleaned.slice(start, end + 1));
            } catch {
                try {
                    return JSON.parse(jsonrepair(cleaned.slice(start)));
                } catch {
                    throw new Error('AI returned incomplete JSON. Please retry the analysis.');
                }
            }
        }
        try {
            return JSON.parse(jsonrepair(cleaned));
        } catch {
            throw new Error('AI returned incomplete JSON. Please retry the analysis.');
        }
    }
};

const analyzeWithGemini = async (problemInput) => {
    if (!config.aiApiKey) throw new Error('AI_API_KEY is not configured. Add a free Gemini API key to server/.env.');

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${config.aiModel}:generateContent?key=${encodeURIComponent(config.aiApiKey)}`;
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: geminiPrompt(problemInput) }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 1200, responseMimeType: 'application/json', responseSchema: analysisSchema }
        })
    });

    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error?.message || `Gemini request failed with ${response.status}`);

    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Gemini returned an empty analysis');
    const parsed = parseStructuredJson(text);

    return { ...parsed, provider: 'gemini', model: config.aiModel, generatedAt: new Date().toISOString() };
};

const analyzeWithBlackbox = async (problemInput) => {
    if (!config.aiApiKey) throw new Error('AI_API_KEY is not configured. Add a Blackbox API key to server/.env.');

    const response = await fetch('https://api.blackbox.ai/chat/completions', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${config.aiApiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: config.aiModel,
            temperature: 0.2,
            max_tokens: 1600,
            messages: [
                { role: 'system', content: 'You are a government innovation procurement analyst. Return one complete compact JSON object only. Never use markdown, commentary, or trailing text.' },
                { role: 'user', content: `${geminiPrompt(problemInput)} Keep every array to at most 3 short items.` }
            ]
        })
    });

    const payload = await response.json();
    if (!response.ok) {
        const providerMessage = typeof payload.error === 'string' ? payload.error : payload.error?.message;
        throw new Error(providerMessage || payload.message || `Blackbox request failed with ${response.status}`);
    }

    const text = payload.choices?.[0]?.message?.content;
    if (!text) throw new Error('Blackbox returned an empty analysis');
    const parsed = parseStructuredJson(text);
    return { ...parsed, provider: 'blackbox', model: config.aiModel, generatedAt: new Date().toISOString() };
};

const fallbackAnalyzeProblem = (problemInput) => {
    const title = problemInput.title || 'Innovation challenge';
    const description = problemInput.description || '';
    const lower = `${title} ${description}`.toLowerCase();

    const category = fallbackCategories.find((item) => lower.includes(item.toLowerCase().split(' ')[0])) || 'Public Sector Innovation';

    const techMap = [
        { keyword: 'ai', tech: 'AI/ML' },
        { keyword: 'vision', tech: 'Computer Vision' },
        { keyword: 'gps', tech: 'Geospatial Analytics' },
        { keyword: 'cloud', tech: 'Cloud' },
        { keyword: 'iot', tech: 'IoT' },
        { keyword: 'route', tech: 'Route Optimization' },
        { keyword: 'safety', tech: 'Risk Analytics' },
        { keyword: 'education', tech: 'Learning Analytics' }
    ];

    const technologies = techMap
        .filter((item) => lower.includes(item.keyword))
        .map((item) => item.tech);

    const suggestedKpis = [
        'Processing time reduction: 30%',
        'Cost reduction: 20%',
        'Citizen satisfaction improvement: 15%'
    ];

    const complexity = /route|mobility|transport|safety|health|education/i.test(lower) ? 'Medium' : 'Low';
    const innovationPotential = 82 + (title.length % 12);
    const pilotDuration = lower.includes('waste') || lower.includes('route') ? '12 weeks' : '8 weeks';

    return {
        provider: 'node-fallback',
        category,
        technologies: technologies.length ? technologies : ['AI/ML', 'Cloud'],
        requirements: [
            'Proven implementation capability',
            'Clear success metrics and deployment plan',
            'Ability to integrate with existing public systems'
        ],
        suggestedKpis,
        pilotDuration,
        complexity,
        innovationPotential: `${Math.min(95, innovationPotential)}%`,
        risks: ['Data quality', 'Interoperability', 'Change management'],
        generatedAt: new Date().toISOString()
    };
};

const runPythonAnalyzer = (problemInput) => new Promise((resolve, reject) => {
    const scriptPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../ai/analyzer.py');
    const python = spawn(process.platform === 'win32' ? 'python' : 'python3', [scriptPath]);
    let output = '';
    let errorOutput = '';

    python.stdout.on('data', (chunk) => { output += chunk.toString(); });
    python.stderr.on('data', (chunk) => { errorOutput += chunk.toString(); });
    python.on('error', reject);
    python.on('close', (code) => {
        if (code !== 0) return reject(new Error(errorOutput || 'Python analyzer failed'));
        try {
            resolve(JSON.parse(output));
        } catch (error) {
            reject(error);
        }
    });

    python.stdin.write(JSON.stringify(problemInput));
    python.stdin.end();
    setTimeout(() => {
        python.kill();
        reject(new Error('Python analyzer timed out'));
    }, 3000);
});

export const analyzeProblem = async (problemInput) => {
    if (config.aiProvider === 'blackbox') {
        return analyzeWithBlackbox(problemInput);
    }

    if (config.aiProvider === 'gemini') {
        return analyzeWithGemini(problemInput);
    }

    try {
        return await runPythonAnalyzer(problemInput);
    } catch {
        return fallbackAnalyzeProblem(problemInput);
    }
};
