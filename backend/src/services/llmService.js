/**
 * LLM Service - Handles AI parsing, dynamic question generation,
 * and adaptive interview answer evaluation with OpenAI, Gemini, or intelligent fallback.
 */

const https = require('https');
const http = require('http');

/**
 * Universal fetch helper using Node standard library to avoid external dependencies
 */
function makeHttpRequest(urlStr, options, postData) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const client = url.protocol === 'https:' ? https : http;

    const reqOptions = {
      method: options.method || 'POST',
      headers: options.headers || {},
      timeout: 15000
    };

    const req = client.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data, error: e });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('LLM request timed out'));
    });

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

/**
 * Call OpenAI Chat Completions API
 */
async function callOpenAI(systemPrompt, userPrompt, jsonFormat = true) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const payload = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      ...(jsonFormat ? { response_format: { type: 'json_object' } } : {})
    };

    const res = await makeHttpRequest('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    }, payload);

    if (res.status === 200 && res.data?.choices?.[0]?.message?.content) {
      const content = res.data.choices[0].message.content.trim();
      return jsonFormat ? JSON.parse(content) : content;
    }
    console.warn('[LLM Service] OpenAI responded with non-200 status:', res.status, res.data);
    return null;
  } catch (err) {
    console.warn('[LLM Service] OpenAI call error:', err.message);
    return null;
  }
}

/**
 * Call Google Gemini API
 */
async function callGemini(systemPrompt, userPrompt, jsonFormat = true) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nTask:\n${userPrompt}\n\nReturn clean JSON only.` }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        ...(jsonFormat ? { responseMimeType: 'application/json' } : {})
      }
    };

    const res = await makeHttpRequest(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, payload);

    if (res.status === 200 && res.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      const text = res.data.candidates[0].content.parts[0].text.trim();
      return jsonFormat ? JSON.parse(text) : text;
    }
    return null;
  } catch (err) {
    console.warn('[LLM Service] Gemini call error:', err.message);
    return null;
  }
}

/**
 * AI CV Refinement - Enhances raw parsed CV with deeper taxonomy and structure
 */
async function refineParsedCV(rawText, parsedHeuristic) {
  const systemPrompt = `You are an expert technical talent recruiter and CV parsing engine. 
Extract structured profile data from the candidate's resume text. 
Output format must be strictly a JSON object matching this schema:
{
  "fullName": string,
  "email": string,
  "phone": string,
  "location": string,
  "summary": string,
  "skills": [{"name": string, "proficiency": "Beginner"|"Intermediate"|"Advanced"|"Expert", "yearsOfExperience": number}],
  "education": [{"institution": string, "degree": string, "fieldOfStudy": string, "graduationYear": string}],
  "projects": [{"title": string, "description": string, "technologies": [string]}],
  "certifications": [{"name": string, "issuingOrganization": string, "issueDate": string}]
}`;

  const userPrompt = `Resume text to parse:\n${rawText.slice(0, 4000)}`;

  // Try external LLMs
  const openAIResult = await callOpenAI(systemPrompt, userPrompt, true);
  if (openAIResult && openAIResult.skills) return openAIResult;

  const geminiResult = await callGemini(systemPrompt, userPrompt, true);
  if (geminiResult && geminiResult.skills) return geminiResult;

  // Fallback: return heuristic extraction
  return parsedHeuristic;
}

/**
 * Generates an adaptive interview question tailored to the candidate, role, and current difficulty
 */
async function generateInterviewQuestion({
  mode,
  targetRole,
  currentDifficulty,
  questionIndex,
  candidateSkills = [],
  missingSkills = [],
  weakSkills = [],
  previousQuestions = []
}) {
  const systemPrompt = `You are an elite senior technical hiring manager and interview evaluator for the role of ${targetRole}.
Generate an interview question for mode '${mode}' at difficulty level '${currentDifficulty}' (easy, medium, or hard).
The question should test skills relevant to the role, specifically prioritizing missing or weak skills if technical or CV-based.
Output MUST be strict JSON:
{
  "questionText": string,
  "category": "technical" | "hr" | "cv_based",
  "targetSkill": string,
  "difficulty": "${currentDifficulty}",
  "guidance": string
}`;

  const userPrompt = `Role: ${targetRole}
Mode: ${mode}
Difficulty: ${currentDifficulty}
Question Number: ${questionIndex + 1}
Identified Weak/Missing Skills: ${[...missingSkills, ...weakSkills].map(s => s.name || s).join(', ') || 'Core concepts'}
Candidate Skills: ${candidateSkills.map(s => s.name || s).join(', ')}
Previous Questions Asked: ${previousQuestions.map(q => q.questionText).join(' | ')}`;

  const openAIResult = await callOpenAI(systemPrompt, userPrompt, true);
  if (openAIResult?.questionText) return openAIResult;

  const geminiResult = await callGemini(systemPrompt, userPrompt, true);
  if (geminiResult?.questionText) return geminiResult;

  // Built-in intelligent question generator fallback
  return getIntelligentFallbackQuestion(targetRole, mode, currentDifficulty, questionIndex, missingSkills, weakSkills);
}

/**
 * Evaluates a candidate's answer adaptively
 */
async function evaluateInterviewAnswer({
  targetRole,
  questionText,
  targetSkill,
  difficulty,
  studentAnswer
}) {
  if (!studentAnswer || studentAnswer.trim().length < 5) {
    return {
      score: 15,
      instantFeedback: 'The response provided was too brief or incomplete. In an interview, aim to structure your answer with clear explanations, examples, and technical depth.',
      strengths: ['Attempted to respond.'],
      areasToImprove: ['Elaborate on core mechanisms', 'Provide concrete code or architectural examples', 'Address trade-offs'],
      idealAnswerSummary: `A comprehensive answer for ${targetSkill || 'this topic'} should articulate the theoretical concept, standard industry best practices, and real-world project experience.`
    };
  }

  const systemPrompt = `You are a strict, constructive technical interviewer evaluating a student's answer for the role of ${targetRole}.
Evaluate the candidate's answer honestly, assigning an objective score from 0 to 100%.
Output strictly JSON format:
{
  "score": number (0-100),
  "instantFeedback": string (2-3 concise, constructive sentences),
  "strengths": [string, string],
  "areasToImprove": [string, string],
  "idealAnswerSummary": string (Clear, bullet-pointed summary of what a 100% ideal answer covers)
}`;

  const userPrompt = `Question: "${questionText}"
Target Skill: ${targetSkill}
Expected Difficulty: ${difficulty}
Candidate's Answer: "${studentAnswer}"`;

  const openAIResult = await callOpenAI(systemPrompt, userPrompt, true);
  if (openAIResult?.score !== undefined) return openAIResult;

  const geminiResult = await callGemini(systemPrompt, userPrompt, true);
  if (geminiResult?.score !== undefined) return geminiResult;

  // Fallback evaluation engine
  return getIntelligentFallbackEvaluation(questionText, targetSkill, difficulty, studentAnswer);
}

/**
 * Intelligent Fallback Question Bank tailored by role, difficulty, and mode
 */
function getIntelligentFallbackQuestion(role, mode, difficulty, index, missingSkills = [], weakSkills = []) {
  const roleKey = (role || 'Software Developer').toLowerCase();
  const diff = difficulty || 'medium';

  // Bank of questions structured by role and difficulty
  const questionPool = {
    'software-developer': {
      easy: [
        { text: 'Can you explain the difference between stack and heap memory, and when each is utilized in execution?', skill: 'Data Structures & Algorithms', cat: 'technical' },
        { text: 'What are the fundamental principles of Object-Oriented Programming, and can you provide a quick real-world example of polymorphism?', skill: 'Object-Oriented Programming (OOP)', cat: 'technical' },
        { text: 'How do you structure Git workflows when collaborating with a distributed engineering team?', skill: 'Git & Version Control', cat: 'technical' }
      ],
      medium: [
        { text: 'Explain how hashing works under the hood in a Hash Map, and how hash collisions are typically resolved in standard libraries.', skill: 'Data Structures & Algorithms', cat: 'technical' },
        { text: 'Design a RESTful API for an e-commerce checkout flow. What HTTP verbs, status codes, and idempotency guarantees would you apply?', skill: 'RESTful API Design', cat: 'technical' },
        { text: 'Compare optimistic vs pessimistic concurrency control in database transactions, and explain when to use each.', skill: 'Database Management', cat: 'technical' }
      ],
      hard: [
        { text: 'How would you architect a distributed caching layer using Redis for a read-heavy system handling 50k requests per second without cache stampedes?', skill: 'System Design Basics', cat: 'technical' },
        { text: 'Walk through how you would optimize a slow relational database query involving millions of rows and multiple JOIN operations. How do you analyze an execution plan?', skill: 'Database Management', cat: 'technical' },
        { text: 'Explain how you would implement a circuit breaker pattern in a microservices ecosystem to prevent cascading failures.', skill: 'System Design Basics', cat: 'technical' }
      ]
    },
    'python-developer': {
      easy: [
        { text: 'What is the Python Global Interpreter Lock (GIL), and how does it impact multi-threaded CPU-bound programs?', skill: 'Python Core & Advanced', cat: 'technical' },
        { text: 'What is the difference between a list and a tuple in Python, and in what scenarios would you strictly choose one over the other?', skill: 'Python Core & Advanced', cat: 'technical' },
        { text: 'How do Python virtual environments work, and why are tools like Poetry or venv essential for production dependency isolation?', skill: 'Docker & Virtual Environments', cat: 'technical' }
      ],
      medium: [
        { text: 'Explain the internal mechanism of Python generators, the yield keyword, and how they help in processing large memory-intensive datasets.', skill: 'Python Core & Advanced', cat: 'technical' },
        { text: 'In FastAPI or Django, how do you handle asynchronous request processing, database connection pooling, and background worker offloading with Celery?', skill: 'Django / FastAPI / Flask', cat: 'technical' },
        { text: 'How do Python decorators work under the hood? Write or explain the conceptual implementation of an execution-timing decorator.', skill: 'Python Core & Advanced', cat: 'technical' }
      ],
      hard: [
        { text: 'How does Python handle memory management and garbage collection with reference counting and cyclic garbage detection? How do you diagnose memory leaks in a production service?', skill: 'Python Core & Advanced', cat: 'technical' },
        { text: 'Design a resilient distributed task processing pipeline using Python, Redis, and Celery that guarantees at-least-once task delivery and handles retry backoffs.', skill: 'Celery / Redis / Async Queues', cat: 'technical' }
      ]
    },
    'web-developer': {
      easy: [
        { text: 'Explain the difference between let, const, and var in JavaScript, and what "hoisting" means in the execution context.', skill: 'JavaScript / TypeScript', cat: 'technical' },
        { text: 'What is the Virtual DOM in React, and how does React’s reconciliation algorithm determine what DOM nodes need updating?', skill: 'React.js', cat: 'technical' },
        { text: 'How does CSS Flexbox differ from CSS Grid, and what are their respective sweet spots in responsive interface layouts?', skill: 'CSS3 / Tailwind CSS', cat: 'technical' }
      ],
      medium: [
        { text: 'Explain the JavaScript Event Loop, Microtask Queue vs Macrotask Queue, and how async/await or Promises interact with it.', skill: 'JavaScript / TypeScript', cat: 'technical' },
        { text: 'In React, how do you prevent unnecessary re-renders of heavy child components? Contrast useMemo, useCallback, and React.memo.', skill: 'React.js', cat: 'technical' },
        { text: 'How do you safeguard a modern single-page application against Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF)?', skill: 'Web Performance & Security Basics', cat: 'technical' }
      ],
      hard: [
        { text: 'Walk through how Server-Side Rendering (SSR) and Client Hydration work in modern frameworks like Next.js, and how you diagnose hydration mismatch errors.', skill: 'React.js / Next.js', cat: 'technical' },
        { text: 'How would you architect a zero-runtime CSS system or optimize critical rendering path to achieve 95+ Core Web Vitals (LCP, FID/INP, CLS) on mobile networks?', skill: 'Web Performance & Security Basics', cat: 'technical' }
      ]
    },
    'data-analyst': {
      easy: [
        { text: 'What is the difference between WHERE and HAVING clauses in SQL, and in what order does the SQL query engine evaluate them?', skill: 'SQL & Advanced Querying', cat: 'technical' },
        { text: 'Explain the difference between inner join, left outer join, and full outer join with a quick scenario.', skill: 'SQL & Advanced Querying', cat: 'technical' },
        { text: 'How do you handle missing values or outliers in a customer dataset using Pandas in Python?', skill: 'Python for Data Analysis', cat: 'technical' }
      ],
      medium: [
        { text: 'Explain how SQL Window functions (like ROW_NUMBER, RANK, DENSE_RANK, and LAG/LEAD) work, and give an example of finding top 3 spenders per region.', skill: 'SQL & Advanced Querying', cat: 'technical' },
        { text: 'How do you design an A/B test for an e-commerce checkout page? How do you calculate sample size, statistical significance, and p-value?', skill: 'Applied Statistics & Probability', cat: 'technical' },
        { text: 'In Power BI or Tableau, how do you establish star schemas versus snowflake schemas, and how do they impact dashboard query performance?', skill: 'Data Visualization', cat: 'technical' }
      ],
      hard: [
        { text: 'A key business KPI suddenly dropped by 22% week-over-week. Walk me through your step-by-step analytical framework to isolate the root cause and present findings to leadership.', skill: 'Business Acumen & Communication', cat: 'technical' },
        { text: 'How do you optimize an analytical SQL query that scans 100 million records across multiple partitioned fact tables and dimension tables?', skill: 'SQL & Advanced Querying', cat: 'technical' }
      ]
    },
    'java-developer': {
      easy: [
        { text: 'What is the difference between String, StringBuilder, and StringBuffer in Java, and why is String immutable?', skill: 'Core Java', cat: 'technical' },
        { text: 'Explain the difference between abstract classes and interfaces in modern Java (Java 8+).', skill: 'Core Java', cat: 'technical' },
        { text: 'What is Dependency Injection in Spring Boot, and how does the ApplicationContext manage bean lifecycles?', skill: 'Spring Boot', cat: 'technical' }
      ],
      medium: [
        { text: 'How does the Java Streams API work with map, filter, and collectors? Compare sequential stream vs parallel stream performance and thread safety.', skill: 'Core Java', cat: 'technical' },
        { text: 'In Spring Data JPA / Hibernate, what is the N+1 select problem, and what strategies (e.g. JOIN FETCH, EntityGraph, BatchSize) do you use to resolve it?', skill: 'Spring Data JPA / Hibernate', cat: 'technical' },
        { text: 'How does Spring Security implement JWT authentication and filter chains for stateless microservice endpoints?', skill: 'Spring Boot', cat: 'technical' }
      ],
      hard: [
        { text: 'Explain the JVM Memory Model (Eden, Survivor, Old Gen, Metaspace) and how Garbage Collection algorithms like G1 or ZGC manage latency vs throughput.', skill: 'Core Java & Multi-threading', cat: 'technical' },
        { text: 'How would you implement distributed transactions across multiple Spring Boot microservices using the Saga pattern with RabbitMQ or Kafka?', skill: 'Microservices Architecture', cat: 'technical' }
      ]
    }
  };

  // HR Questions Bank
  const hrQuestions = [
    { text: 'Tell me about a challenging technical or team obstacle you encountered during a project. How did you diagnose it, collaborate, and what was the outcome?', skill: 'Collaboration & Problem Solving', cat: 'hr' },
    { text: 'How do you prioritize competing deadlines when a critical production bug emerges while you are working on a high-stakes sprint deliverable?', skill: 'Time Management', cat: 'hr' },
    { text: 'Describe a situation where you had a technical disagreement with a peer or team lead. How did you present your case and reach a resolution?', skill: 'Conflict Resolution', cat: 'hr' },
    { text: 'Where do you see your technical trajectory in the next 2-3 years, and what specific technical or leadership competencies are you actively sharpening?', skill: 'Career Goals', cat: 'hr' }
  ];

  // CV-Based Questions Bank
  const cvQuestions = [
    { text: `Looking at your target role in ${role}, what was the most complex architecture or feature you engineered in your projects, and what trade-offs did you make?`, skill: 'Project Architecture', cat: 'cv_based' },
    { text: 'Can you walk through your automated testing and quality assurance approach for the key project highlighted in your profile?', skill: 'Testing & Reliability', cat: 'cv_based' }
  ];

  // Determine which pool to pull from based on mode
  if (mode === 'hr') {
    const q = hrQuestions[index % hrQuestions.length];
    return { questionText: q.text, category: 'hr', targetSkill: q.skill, difficulty: diff };
  }

  if (mode === 'cv_based') {
    const q = cvQuestions[index % cvQuestions.length];
    return { questionText: q.text, category: 'cv_based', targetSkill: q.skill, difficulty: diff };
  }

  if (mode === 'mixed' && index % 2 === 1) {
    const q = hrQuestions[index % hrQuestions.length];
    return { questionText: q.text, category: 'hr', targetSkill: q.skill, difficulty: diff };
  }

  // Find role pool or default to software-developer
  let roleMatch = Object.keys(questionPool).find(k => roleKey.includes(k.split('-')[0])) || 'software-developer';
  const roleQuestions = questionPool[roleMatch] || questionPool['software-developer'];
  const pool = roleQuestions[diff] || roleQuestions['medium'];
  const chosen = pool[index % pool.length];

  return {
    questionText: chosen.text,
    category: chosen.cat || 'technical',
    targetSkill: chosen.skill,
    difficulty: diff
  };
}

/**
 * Intelligent Fallback Evaluation based on response length, keywords, structure, and depth
 */
function getIntelligentFallbackEvaluation(question, skill, difficulty, answer) {
  const words = answer.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  let baseScore = 65;

  // Length heuristic
  if (wordCount < 15) {
    baseScore = 38;
  } else if (wordCount < 30) {
    baseScore = 55;
  } else if (wordCount >= 30 && wordCount < 80) {
    baseScore = 75;
  } else if (wordCount >= 80 && wordCount < 180) {
    baseScore = 86;
  } else {
    baseScore = 92;
  }

  // Keyword check
  const technicalKeywords = [
    'because', 'architecture', 'performance', 'scalability', 'complexity',
    'memory', 'cpu', 'trade-off', 'for example', 'optimization', 'latency',
    'security', 'database', 'transaction', 'async', 'index', 'cache', 'pattern'
  ];
  const matchedKeywords = technicalKeywords.filter(k => answer.toLowerCase().includes(k));
  if (matchedKeywords.length >= 3) {
    baseScore = Math.min(96, baseScore + 6);
  } else if (matchedKeywords.length === 0 && wordCount > 20) {
    baseScore = Math.max(50, baseScore - 8);
  }

  let feedback = '';
  let strengths = [];
  let areasToImprove = [];

  if (baseScore >= 80) {
    feedback = `Outstanding response! You demonstrated a deep conceptual grasp of ${skill}, articulated key trade-offs, and structured your reasoning logically.`;
    strengths = [
      `Clear explanation of core mechanics relating to ${skill}`,
      'Good technical vocabulary and practical perspective',
      'Logical structure with proactive consideration of trade-offs'
    ];
    areasToImprove = [
      'In a live interview, consider supplementing with exact edge case metrics or benchmarking numbers.'
    ];
  } else if (baseScore >= 60) {
    feedback = `Good foundational response. You covered the core definition of ${skill}, but can stand out further by discussing edge cases, memory/computational complexity, or production failure modes.`;
    strengths = [
      `Identified the correct purpose and standard implementation of ${skill}`,
      'Adequate clarity and understandable communication flow'
    ];
    areasToImprove = [
      'Include deeper architectural trade-offs (e.g. memory vs speed)',
      'Reference a concrete production scenario or practical bug you resolved'
    ];
  } else {
    feedback = `The response touches on ${skill} but lacks the required technical depth for this question level. Be sure to explain how the mechanism functions internally rather than just what it does.`;
    strengths = [
      'Acknowledged the question topic'
    ];
    areasToImprove = [
      `Flesh out the internal architecture and runtime execution of ${skill}`,
      'Use the STAR method (Situation, Task, Action, Result) for structured clarity',
      'Avoid high-level summaries without concrete technical mechanisms'
    ];
  }

  return {
    score: baseScore,
    instantFeedback: feedback,
    strengths,
    areasToImprove,
    idealAnswerSummary: `A comprehensive answer for "${skill}" covers: 1) Underlying architecture and data flow, 2) Performance implications (Big-O / latency), 3) Comparison of trade-offs against alternative approaches, and 4) Practical hands-on examples.`
  };
}

module.exports = {
  refineParsedCV,
  generateInterviewQuestion,
  evaluateInterviewAnswer
};
