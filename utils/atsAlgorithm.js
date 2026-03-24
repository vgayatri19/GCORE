/**
 * ATS Scoring Algorithm (V3 - Comprehensive)
 * Features: Regex safety, 8-point analysis criteria, semantic matching, skill gap analysis.
 */

exports.scoreResume = (resumeText, rawKeywords) => {
    // 1. Normalize and prepare text
    const cleanText = resumeText ? resumeText.toLowerCase() : '';

    // Utility: Safely escape string for Regex to prevent Unterminated Group errors
    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Default scoring categories (Fallback)
    const categories = {
        technical: { weight: 0.6, keywords: [
            // Expanded to support Full JD Extraction
            'java', 'python', 'javascript', 'aws', 'docker', 'sql', 'react', 'node', 'mongodb', 'c++', 'html', 'css', 'git', 'ci/cd', 'linux',
            'c#', '.net', 'azure', 'gcp', 'typescript', 'vue', 'angular', 'kubernetes', 'jenkins', 'spring boot', 'django', 'flask', 
            'rest api', 'graphql', 'mysql', 'postgresql', 'redis', 'elasticsearch', 'figma', 'jira', 'confluence', 'terraform', 'ansible', 
            'spark', 'hadoop', 'machine learning', 'artificial intelligence', 'data science', 'excel', 'powerbi', 'tableau', 'php', 'ruby',
            'go', 'golang', 'rust', 'swift', 'kotlin', 'bash', 'shell', 'firebase', 'express', 'spring', 'hibernate', 'kafka',
            'rabbitmq', 'unix', 'windows server', 'macos', 'ios', 'android', 'react native', 'flutter'
        ] },
        soft: { weight: 0.1, keywords: [
            'teamwork', 'communication', 'leadership', 'problem solving', 'agile', 'scrum', 'collaboration', 'critical thinking',
            'adaptability', 'time management', 'project management', 'mentoring', 'analytical', 'interpersonal skills', 'creativity'
        ] },
        experience: { weight: 0.3, keywords: ['internship', 'project', 'certified', 'certification', 'graduate', 'bachelor', 'master', 'experience', 'worked', 'degree'] }
    };

    const results = {
        score: 0,
        categories: {
            technical: { matches: [], missing: [], score: 0 },
            soft: { matches: [], missing: [], score: 0 },
            experience: { matches: [], missing: [], score: 0 }
        },
        matches: [],
        missing: [],
        suggestions: [],
        algorithm: 'GCORE ATS Intelligence (V3)'
    };

    if (!cleanText) {
        results.suggestions.push("The resume appears to be empty or could not be parsed.");
        return results;
    }

    // Dictionary mappings (Synonyms & Keywords)
    const synonyms = {
        'js': 'javascript', 'react.js': 'react', 'reactjs': 'react', 'node.js': 'node', 'nodejs': 'node',
        'k8s': 'kubernetes', 'ml': 'machine learning', 'ai': 'artificial intelligence', 'aws': 'amazon web services',
        'gcp': 'google cloud platform', 'ts': 'typescript', 'vuejs': 'vue', 'vue.js': 'vue', 'golang': 'go'
    };

    // Parse Job Description or Keywords provided by user
    let userKeywords = [];
    if (rawKeywords && rawKeywords.trim()) {
        const rawJD = rawKeywords.toLowerCase();
        
        // If it's a short string with commas, treat as comma-separated list
        if (rawJD.includes(',') && rawJD.length < 200) {
            userKeywords = rawJD.split(',').map(k => k.trim()).filter(k => k.length > 1);
        } else {
            // Treat as Full JD: Extract keywords by intersecting with our massive technical & soft skills dictionary
            const allKnownSkills = [...categories.technical.keywords, ...categories.soft.keywords, ...Object.keys(synonyms)];
            
            allKnownSkills.forEach(skill => {
                const regex = new RegExp(`\\b${escapeRegExp(skill)}\\b`, 'i');
                if (regex.test(rawJD)) {
                    const normalizedSkill = synonyms[skill] || skill;
                    if (!userKeywords.includes(normalizedSkill)) {
                        userKeywords.push(normalizedSkill);
                    }
                }
            });
            
            // Limit extraction to top 25 skills to avoid diluting the score base
            userKeywords = userKeywords.slice(0, 25);
        }
    }

    // --- CRITERIA 1 & 8: ATS Parsing & Machine Readability & Risk Detection ---
    const consecutiveSpacesCount = (cleanText.match(/ {5,}/g) || []).length;
    if (consecutiveSpacesCount > 15) {
        results.suggestions.push("Formatting Risk: Potential multi-column layout or tables detected. Many ATS systems fail to parse these correctly. Prefer standard single-column text.");
    }
    const strangeChars = (resumeText.match(/[^\x00-\x7F]/g) || []).length;
    if (strangeChars > 20) {
        results.suggestions.push("Risk Detection: High volume of non-standard characters (icons/graphics) found. These can confuse ATS parsers.");
    }

    // --- CRITERIA 5: Resume Structure & Sections ---
    const expectedSections = ['summary', 'objective', 'experience', 'employment', 'work history', 'education', 'skills', 'projects', 'certifications'];
    let foundSections = [];
    expectedSections.forEach(sec => {
        const secRegex = new RegExp(`(?:^|\\n)\\s*${sec}\\s*(?:\\n|$)`, 'i');
        if (secRegex.test(cleanText)) foundSections.push(sec);
    });
    
    const hasExp = foundSections.includes('experience') || foundSections.includes('employment') || foundSections.includes('work history');
    const hasEdu = foundSections.includes('education');
    const hasSkills = foundSections.includes('skills');
    
    if (!hasExp || !hasEdu || !hasSkills) {
         results.suggestions.push("Structure Gap: Ensure your resume explicitly uses standard headers like 'Experience', 'Education', and 'Skills' on their own lines.");
    }

    // --- CRITERIA 2: Keyword Matching ---
    const isMatched = (keyword) => {
        const alt = synonyms[keyword] || null;
        const regex = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, 'i');
        const altRegex = alt ? new RegExp(`\\b${escapeRegExp(alt)}\\b`, 'i') : null;
        return regex.test(cleanText) || (altRegex && altRegex.test(cleanText));
    };

    let primaryKeywords = userKeywords.length > 0 ? userKeywords : [...categories.technical.keywords, ...categories.soft.keywords];
    let matchedKeywordsCount = 0;

    primaryKeywords.forEach(k => {
        if (isMatched(k)) {
            results.matches.push(k);
            if (categories.technical.keywords.includes(k)) results.categories.technical.matches.push(k);
            if (categories.soft.keywords.includes(k)) results.categories.soft.matches.push(k);
            if (categories.experience.keywords.includes(k)) results.categories.experience.matches.push(k);
            matchedKeywordsCount++;
        } else {
            results.missing.push(k);
            if (categories.technical.keywords.includes(k)) results.categories.technical.missing.push(k);
            if (categories.soft.keywords.includes(k)) results.categories.soft.missing.push(k);
            if (categories.experience.keywords.includes(k)) results.categories.experience.missing.push(k);
        }
    });

    // --- CRITERIA 6: Skill Gap Analysis ---
    if (results.missing.length > 0) {
        const topMissing = results.missing.slice(0, 5);
        results.suggestions.push(`Skill Gap: You are missing these critical skills for this role: ${topMissing.join(', ')}.`);
    }

    // --- CRITERIA 4: Experience Quality Analysis ---
    const actionVerbs = ['developed', 'built', 'led', 'designed', 'architected', 'created', 'implemented', 'managed', 'improved', 'optimized', 'spearheaded', 'delivered'];
    let actionVerbCount = 0;
    actionVerbs.forEach(verb => {
        if (new RegExp(`\\b${verb}\\b`, 'i').test(cleanText)) actionVerbCount++;
    });

    // Check for numbers indicating quantification
    const numbersCount = (cleanText.match(/\b\d+[%+]?\b/g) || []).length;
    
    if (actionVerbCount < 3) {
        results.suggestions.push("Experience Quality: Use more strong action verbs (e.g., 'Built', 'Led', 'Architected') to begin your bullet points.");
    }
    if (numbersCount < 4) {
        results.suggestions.push("Impact Analysis: Measurable impact is low. Quantify your achievements (e.g., 'Improved performance by 40%').");
    }

    // --- CRITERIA 3: Semantic Matching (Heuristic) ---
    // Look for combination of action verbs + matched technical skills in the same sentence or line
    let semanticMatchCount = 0;
    const sentences = cleanText.split(/[.?!]|\n/);
    sentences.forEach(sentence => {
        if (sentence.length < 10) return;
        const hasVerb = actionVerbs.some(verb => new RegExp(`\\b${verb}\\b`, 'i').test(sentence));
        const hasSkill = results.matches.some(skill => new RegExp(`\\b${escapeRegExp(skill)}\\b`, 'i').test(sentence));
        if (hasVerb && hasSkill) {
            semanticMatchCount++;
        }
    });

    if (semanticMatchCount >= 3) {
        results.suggestions.push("Semantic Match: Excellent! Your experience effectively links action verbs with required skills.");
    } else if (results.matches.length > 0) {
        results.suggestions.push("Semantic Gap: Ensure you describe HOW you applied your skills contextually rather than just listing them.");
    }

    // --- CRITERIA 7: Formatting & Clarity ---
    const wordCount = cleanText.split(/\s+/).length;
    if (wordCount < 250) {
        results.suggestions.push("Clarity Check: Your resume seems too sparse. A standard 1-page resume should have 350-600 words.");
    } else if (wordCount > 1000) {
        results.suggestions.push("Clarity Check: Your resume might be too long and dense. Keep it concise, ideally 1-2 pages.");
    }
    
    // Check keyword stuffing repetition (Keyword density)
    let isStuffed = false;
    results.matches.forEach(m => {
        const count = (cleanText.match(new RegExp(`\\b${escapeRegExp(m)}\\b`, 'gi')) || []).length;
        if (count > 8) isStuffed = true;
    });
    if (isStuffed) {
        results.suggestions.push("Warning: High keyword repetition detected. Avoid 'keyword stuffing' as modern ATS flags this behavior.");
    }

    // --- SCORING ENGINE ---
    let finalScore = 0;

    if (userKeywords.length > 0) {
        // Base score depends primarily on custom keyword matching (Criterion 2)
        const matchRatio = matchedKeywordsCount / userKeywords.length;
        let baseScore = matchRatio * 10;
        
        // Modifiers based on Experience Quality & Structure
        if (!hasExp || !hasEdu || !hasSkills) baseScore -= 1.0;
        if (numbersCount < 3) baseScore -= 0.5;
        if (semanticMatchCount >= 3) baseScore += 1.0;
        
        finalScore = Math.max(0, Math.min(10, baseScore));

        // For UI: Copy the main score to the categories to keep visually balanced donuts
        results.categories.technical.score = Math.round(finalScore * 10) / 10;
        results.categories.soft.score = Math.round(finalScore * 10) / 10;
        results.categories.experience.score = Math.round(finalScore * 10) / 10;
    } else {
        // Fallback Auto-scoring
        let totalWeightedScore = 0;
        Object.keys(categories).forEach(catKey => {
            const cat = categories[catKey];
            const ratio = cat.keywords.filter(k => isMatched(k)).length / cat.keywords.length;
            results.categories[catKey].score = Math.round(ratio * 10 * 10) / 10; 
            totalWeightedScore += ratio * cat.weight;
        });

        let baseScore = totalWeightedScore * 10;
        if (!hasExp || !hasEdu || !hasSkills) baseScore -= 1.0;
        if (numbersCount < 3) baseScore -= 0.5;
        if (semanticMatchCount >= 3) baseScore += 1.0;
        
        finalScore = Math.max(0, Math.min(10, baseScore));
    }

    results.score = Math.round(finalScore * 10) / 10;

    // Top-level feedback
    if (results.score >= 8.0) {
        results.suggestions.unshift("Overall: Stellar! Your resume is highly optimized for this role and system.");
    } else if (results.score < 5.0) {
        results.suggestions.unshift("Overall: Critical rewrite recommended. Core keywords and formatting lack foundational ATS alignment.");
    }

    // Limit noise in arrays (clean for UI)
    results.missing = results.missing.slice(0, 15);
    results.matches = results.matches.slice(0, 15);

    return results;
};
