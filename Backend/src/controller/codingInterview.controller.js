import { Asynchandler } from "../utils/Asynchandler.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { ApiError } from "../utils/ApiError.js";
import { InterviewSession } from "../models/InterviewSession.model.js";
import { incrementDailyUserCount } from "../utils/dailyCount.js";
import { getAiResponse, hasAnyAiProvider } from "../utils/aiClient.js";

// Judge0: use RapidAPI (judge0.p.rapidapi.com) with JUDGE0_API_KEY, or set JUDGE0_BASE_URL for self-hosted
const JUDGE0_BASE = process.env.JUDGE0_BASE_URL || "https://judge0.p.rapidapi.com";
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || "";
const JUDGE0_RAPIDAPI_HOST = "judge0.p.rapidapi.com";

const LANGUAGE_IDS = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
  go: 60,
};

function parseJsonFromAi(text) {
  const cleaned = (text || "")
    .replace(/^[\s\S]*?```(?:json)?\s*/i, "")
    .replace(/\s*```[\s\S]*$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

/** POST /api/interview/question - Generate coding question via Gemini */
export const generateQuestion = Asynchandler(async (req, res) => {
  if (!hasAnyAiProvider()) throw new ApiError(503, "AI service not configured (no LLM provider key found)");
  const { role, difficulty } = req.body || {};
  if (!role || !difficulty) throw new ApiError(400, "role and difficulty are required");

  const difficultyGuidance =
    difficulty === "Beginner"
      ? "MUST be very easy: simple loops, basic arrays/strings, no complex data structures. Think: sum of array, find max, count occurrences, simple string operations. No recursion, no trees/graphs, no dynamic programming."
      : difficulty === "Intermediate"
        ? "Moderate: can use hash maps, two pointers, simple recursion, basic sorting."
        : difficulty === "Advanced"
          ? "Hard: trees, graphs, dynamic programming, advanced algorithms allowed."
          : "FAANG-level: challenging problems, optimal time/space, multiple approaches.";

  const prompt = `Generate exactly ONE coding interview question in LeetCode style for a ${role} developer.

Difficulty: ${difficulty}. ${difficultyGuidance}

STRICT RULES:
- The question must be fully self-contained. A candidate must NEVER guess missing information.
- All variables in examples must be defined in the description. Examples, constraints, and test cases must be logically consistent.
- Return STRICT VALID JSON ONLY. Do NOT include markdown, code fences, or comments outside the JSON.

INPUT/OUTPUT FORMAT (MANDATORY):
- You MUST include a clear "Input" and "Output" specification in the description.
- For "inputFormat": One-line summary of all parameters (e.g. "nums: number[], target: number" or "s: string").
- For "inputSpec": Provide DETAILED per-parameter info so users understand exactly what they receive. Each parameter: name, type, description (1–2 sentences: what it represents, valid range or meaning, edge cases if relevant). This is the main source of input detail for the user.
- For "outputFormat": One short line for return type and meaning (e.g. "number[] — indices of two numbers that add up to target" or "boolean — true if palindrome").
- In "examples", use consistent parseable format:
  - input: Use the SAME parameter names as the function. Example: "nums = [2,7,11,15], target = 9" or "s = \\"racecar\\"". Multiple params separated by comma. No extra text.
  - output: The exact expected return value: "[0, 1]", "true", "3", "[1,2,3]". Must be parseable (valid JSON or number/boolean).
- In "testCases": "input" and "expectedOutput" must use the EXACT same format as in examples so they can be parsed by a test runner.

Problem Requirements:

1. title
   Short, clear problem name (e.g. "Two Sum", "Valid Palindrome").

2. description
   Complete LeetCode-style problem statement. You MUST include:
   - First paragraph: what the problem is and what the function must do.
   - A clear "Input:" line: list each parameter and its type/meaning.
   - A clear "Output:" or "Return:" line: what the function must return (type and meaning).
   - Any assumptions (e.g. "You may assume exactly one valid answer exists.").
   Use short paragraphs; use bullet points where helpful.

3. inputFormat
   One short line: all parameters with types (e.g. "nums: number[], target: number" or "s: string").

4. inputSpec (DETAILED — for better user experience)
   Array of objects, one per parameter, in order. Each object MUST have:
   - name: Parameter name as used in the function (e.g. "nums", "target", "s").
   - type: Data type (e.g. "number[]", "number", "string", "number[][]", "TreeNode").
   - description: 1–2 sentences explaining what this parameter is: what it represents, valid values or range if relevant, and any edge-case note (e.g. "Array of integers. Can be unsorted. May contain duplicates." or "The target sum. Exactly one valid pair of indices exists.").
   This gives users a clear, detailed input reference.

5. outputFormat
   One short line: exact return type and meaning (e.g. "number[] — indices of two numbers that add up to target" or "boolean — true if palindrome").

6. dataStructure
   One of: Array, String, Hash Map, Stack, Queue, Tree, Graph, Linked List.

7. algorithm
   One of: Two Pointers, Sliding Window, Binary Search, DFS, BFS, Dynamic Programming, Greedy.

8. examples
   Array of 2–4 examples. Each object MUST have:
   - input: Same parameter names, parseable values. Example: "nums = [2,7,11,15], target = 9"
   - output: Exact return value as parseable string: "[0, 1]", "true", "2"
   - explanation: One sentence why this output.

9. constraints
   Array of strings. Use inequality format where applicable, e.g. "2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "Only one valid answer exists."

10. testCases
    Array of 3–5 runnable test cases. Each:
    - input: Same format as examples (e.g. "nums = [3,3], target = 6")
    - expectedOutput: Same format as examples (e.g. "[0, 1]")
    Include edge cases: minimum size, single element, empty if allowed.

Return JSON in EXACTLY this format (no extra fields):

{
  "title": "string",
  "description": "string",
  "inputFormat": "string",
  "inputSpec": [
    { "name": "string", "type": "string", "description": "string" }
  ],
  "outputFormat": "string",
  "dataStructure": "string",
  "algorithm": "string",
  "examples": [
    { "input": "string", "output": "string", "explanation": "string" }
  ],
  "constraints": ["string"],
  "testCases": [
    { "input": "string", "expectedOutput": "string" }
  ]
}`;

  const text = await getAiResponse(prompt);
  const data = parseJsonFromAi(text);
  if (!data || !data.title) throw new ApiError(502, "AI returned invalid question format");

  const normalized = {
    title: data.title,
    description: data.description || "",
    inputFormat: typeof data.inputFormat === "string" ? data.inputFormat : "",
    inputSpec: Array.isArray(data.inputSpec)
      ? data.inputSpec
          .filter((p) => p && (p.name != null || p.type != null))
          .map((p) => ({
            name: String(p?.name ?? "").trim(),
            type: String(p?.type ?? "").trim(),
            description: String(p?.description ?? "").trim(),
          }))
      : [],
    outputFormat: typeof data.outputFormat === "string" ? data.outputFormat : "",
    dataStructure: typeof data.dataStructure === "string" ? data.dataStructure : "",
    algorithm: typeof data.algorithm === "string" ? data.algorithm : "",
    examples: Array.isArray(data.examples)
      ? data.examples.map((ex) => ({
          input: String(ex?.input ?? "").trim(),
          output: String(ex?.output ?? "").trim(),
          explanation: typeof ex?.explanation === "string" ? ex.explanation : "",
        }))
      : [],
    constraints: Array.isArray(data.constraints) ? data.constraints : [],
    testCases: Array.isArray(data.testCases)
      ? data.testCases.map((tc) => ({
          input: String(tc?.input ?? "").trim(),
          expectedOutput: String(tc?.expectedOutput ?? "").trim(),
        }))
      : [],
  };

  return res
    .status(200)
    .json(new ApiResponse(200, normalized, "Question generated"));
});

const QUESTION_COUNT = 15;

/** POST /api/interview-questions - Generate multiple questions (e.g. 15 for full interview) */
export const generateQuestions = Asynchandler(async (req, res) => {
  if (!hasAnyAiProvider()) throw new ApiError(503, "AI service not configured (no LLM provider key found)");
  const { role, difficulty } = req.body || {};
  const count = Math.min(Math.max(Number(req.body?.count) || QUESTION_COUNT, 1), 20);
  if (!role || !difficulty) throw new ApiError(400, "role and difficulty are required");

  const difficultyGuidance =
    difficulty === "Beginner"
      ? "MUST be very easy: simple loops, basic arrays/strings. No recursion, no trees/graphs, no DP."
      : difficulty === "Intermediate"
        ? "Moderate: hash maps, two pointers, simple recursion."
        : difficulty === "Advanced"
          ? "Hard: trees, graphs, DP allowed."
          : "FAANG-level: challenging, optimal time/space.";

  const prompt = `Generate exactly ${count} different coding interview questions in LeetCode style for a ${role} developer. Difficulty: ${difficulty}. ${difficultyGuidance}

For EACH question you MUST provide proper INPUT and OUTPUT specification and consistent examples.

INPUT/OUTPUT RULES (MANDATORY for every question):
- description MUST include a clear "Input:" and "Output:" or "Return:" line.
- inputFormat: One short line with all parameters and types (e.g. "nums: number[], target: number").
- inputSpec: DETAILED per-parameter array for better user experience. Each item: "name", "type", "description" (1–2 sentences: what the parameter is, valid range/meaning, edge cases if relevant). Example: {"name": "nums", "type": "number[]", "description": "Array of integers. Can be unsorted. Exactly one valid pair of indices exists."}.
- outputFormat: One short line for return type and meaning.
- examples: "input" and "output" in same parseable format; testCases match that format.

For EACH question provide:
1. title: Short, clear (e.g. "Two Sum", "Valid Palindrome").
2. description: Full problem statement with explicit Input: and Output: lines; any assumptions.
3. inputFormat: One line with all parameters and types.
4. inputSpec: Array of objects with "name", "type", "description" (detailed, 1–2 sentences per parameter).
5. outputFormat: One line for return type and meaning.
6. dataStructure: One of Array, String, Hash Map, Tree, Stack, Queue, Linked List, Graph.
7. algorithm: One of Two Pointers, Sliding Window, Binary Search, BFS/DFS, DP, Greedy, etc.
8. examples: 2-4 items with "input", "output" (parseable), "explanation".
9. constraints: Array of strings (e.g. "2 <= nums.length <= 10^4").
10. testCases: 3-5 items with "input" and "expectedOutput"; include edge cases.

Return ONLY valid JSON (no markdown, no code fences):
{
  "questions": [
    {
      "title": "string",
      "description": "string",
      "inputFormat": "string",
      "inputSpec": [{"name": "string", "type": "string", "description": "string"}],
      "outputFormat": "string",
      "dataStructure": "string",
      "algorithm": "string",
      "examples": [{"input": "string", "output": "string", "explanation": "string"}],
      "constraints": ["string"],
      "testCases": [{"input": "string", "expectedOutput": "string"}]
    }
  ]
}

Each question must be unique. Provide detailed inputSpec for every question so users get a clear input reference.`;


  const text = await getAiResponse(prompt);
  const data = parseJsonFromAi(text);
  const rawList = data?.questions || (Array.isArray(data) ? data : []);
  const questions = rawList
    .slice(0, count)
    .map((q) => ({
      title: q.title || "Question",
      description: q.description || "",
      inputFormat: typeof q.inputFormat === "string" ? q.inputFormat : "",
      inputSpec: Array.isArray(q.inputSpec)
        ? q.inputSpec
            .filter((p) => p && (p.name != null || p.type != null))
            .map((p) => ({
              name: String(p?.name ?? "").trim(),
              type: String(p?.type ?? "").trim(),
              description: String(p?.description ?? "").trim(),
            }))
        : [],
      outputFormat: typeof q.outputFormat === "string" ? q.outputFormat : "",
      dataStructure: typeof q.dataStructure === "string" ? q.dataStructure : "",
      algorithm: typeof q.algorithm === "string" ? q.algorithm : "",
      examples: Array.isArray(q.examples)
        ? q.examples.map((ex) => ({
            input: String(ex?.input ?? "").trim(),
            output: String(ex?.output ?? "").trim(),
            explanation: typeof ex?.explanation === "string" ? ex.explanation : "",
          }))
        : [],
      constraints: Array.isArray(q.constraints) ? q.constraints : [],
      testCases: Array.isArray(q.testCases)
        ? q.testCases.map((tc) => ({
            input: String(tc?.input ?? "").trim(),
            expectedOutput: String(tc?.expectedOutput ?? "").trim(),
          }))
        : [],
    }));

  if (questions.length === 0) throw new ApiError(502, "AI returned no valid questions");
  return res.status(200).json(new ApiResponse(200, { questions }, "Questions generated"));
});

/** POST /api/run-code - Execute code via Judge0 and evaluate against test cases */
export const runCode = Asynchandler(async (req, res) => {
  const { code, language, testCases } = req.body || {};
  if (!code || !language) throw new ApiError(400, "code and language are required");

  const isRapidApi = JUDGE0_BASE.includes("rapidapi.com");
  if (isRapidApi && !JUDGE0_API_KEY) {
    throw new ApiError(503, "Code execution requires JUDGE0_API_KEY (RapidAPI). Add it to .env.");
  }

  const langId = LANGUAGE_IDS[language.toLowerCase()] ?? LANGUAGE_IDS.javascript;
  const cases = Array.isArray(testCases) && testCases.length > 0 ? testCases : [];

  const runOne = async (stdin, expectedOutput) => {
    const url = `${JUDGE0_BASE}/submissions?base64_encoded=false&wait=true`;
    const headers = {
      "Content-Type": "application/json",
      ...(JUDGE0_API_KEY
        ? { "X-RapidAPI-Key": JUDGE0_API_KEY, "X-RapidAPI-Host": JUDGE0_RAPIDAPI_HOST }
        : {}),
    };
    const body = {
      source_code: code,
      language_id: langId,
      stdin: stdin || "",
    };
    let resp;
    try {
      resp = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
    } catch (err) {
      const msg =
        err.cause?.code === "ENOTFOUND" || err.message?.includes("fetch failed")
          ? "Code execution service unreachable. Set JUDGE0_BASE_URL or use Judge0 on RapidAPI with JUDGE0_API_KEY in .env."
          : err.message || "Code execution request failed.";
      throw new ApiError(503, msg);
    }
    if (!resp.ok) throw new ApiError(502, "Judge0 execution failed");
    const result = await resp.json();
    const stdout = (result.stdout || "").trim();
    const stderr = result.stderr || "";
    const statusId = result.status?.id;
    const isError = statusId >= 6;
    const actual = isError ? (result.message || stderr || "Runtime error") : stdout;
    const passed = !isError && actual === (expectedOutput || "").trim();
    return { passed, actual, expected: expectedOutput, error: isError, message: result.message };
  };

  let passed = 0;
  const results = [];

  if (cases.length > 0) {
    for (const tc of cases) {
      const r = await runOne(tc.input, tc.expectedOutput);
      results.push(r);
      if (r.passed) passed++;
    }
  } else {
    const r = await runOne("", "");
    results.push(r);
    if (r.passed) passed = r.passed ? 1 : 0;
  }

  const total = cases.length || 1;
  const maxScore = 10;
  const score = total > 0 ? Math.round((passed / total) * maxScore) : 0;

  return res.status(200).json(
    new ApiResponse(200, {
      status: "success",
      passed,
      failed: total - passed,
      total,
      score,
      maxScore,
      results,
    })
  );
});

/** POST /api/code-review - AI review of user code */
export const codeReview = Asynchandler(async (req, res) => {
  if (!hasAnyAiProvider()) throw new ApiError(503, "AI service not configured (no LLM provider key found)");
  const { problemDescription, userCode } = req.body || {};
  if (!problemDescription || !userCode) throw new ApiError(400, "problemDescription and userCode required");

  const prompt = `Review this code written for the following problem:

Problem:
${problemDescription}

Code:
\`\`\`
${userCode}
\`\`\`

Return ONLY valid JSON (no markdown, no code fences):
{
  "quality": "brief assessment of code quality",
  "complexity": "time and space complexity",
  "suggestions": ["suggestion 1", "suggestion 2"],
  "edgeCasesMissed": ["edge case 1"]
}`;

  const text = await getAiResponse(prompt);
  const data = parseJsonFromAi(text) || {};
  const feedback = {
    quality: data.quality || "",
    complexity: data.complexity || "",
    suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
    edgeCasesMissed: Array.isArray(data.edgeCasesMissed) ? data.edgeCasesMissed : [],
  };

  return res.status(200).json(new ApiResponse(200, feedback));
});

/** POST /api/follow-up - AI follow-up interview question */
export const followUpQuestion = Asynchandler(async (req, res) => {
  if (!hasAnyAiProvider()) throw new ApiError(503, "AI service not configured (no LLM provider key found)");
  const { problemTitle, userCode, previousQuestions } = req.body || {};
  if (!problemTitle) throw new ApiError(400, "problemTitle required");

  const context = Array.isArray(previousQuestions) && previousQuestions.length > 0
    ? `Previously asked: ${previousQuestions.join(" | ")}. Ask a different follow-up.`
    : "";

  const prompt = `You are an interviewer. The candidate just solved: "${problemTitle}".
${userCode ? `Their code:\n\`\`\`\n${userCode}\n\`\`\`` : ""}
${context}

Generate ONE short interview follow-up question (1-2 sentences). Examples: "Why did you choose this approach?", "What is the time complexity?", "Can this be optimized?", "What happens for large inputs?"

Return ONLY a plain text question, no JSON, no quotes.`;

  const question = (await getAiResponse(prompt) || "").trim();

  return res.status(200).json(new ApiResponse(200, { question }));
});

/** POST /api/interview/save - Save session (optional auth) */
export const saveSession = Asynchandler(async (req, res) => {
  const userId = req.user?._id;
  const body = req.body || {};
  if (!userId) throw new ApiError(401, "Login required to save session");

  const session = await InterviewSession.create({
    userId,
    question: body.question || {},
    code: body.code || "",
    language: body.language || "javascript",
    score: body.score ?? 0,
    maxScore: body.maxScore ?? 10,
    passed: body.passed ?? 0,
    totalTests: body.totalTests ?? 0,
    feedback: body.feedback || "",
    aiReview: body.aiReview || {},
    followUpQa: Array.isArray(body.followUpQa) ? body.followUpQa : [],
    runOutput: body.runOutput || "",
    status: body.status || "submitted",
  });

  return res.status(201).json(new ApiResponse(201, session));
});

/** GET /api/leaderboard - Top coders by total score */
export const getLeaderboard = Asynchandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const agg = await InterviewSession.aggregate([
    { $match: { status: "submitted" } },
    { $group: { _id: "$userId", totalScore: { $sum: "$score" } } },
    { $sort: { totalScore: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        totalScore: 1,
        name: { $concat: ["$user.FirstName", " ", "$user.LastName"] },
      },
    },
  ]);

  const leaderboard = agg.map((r, i) => ({
    rank: i + 1,
    name: r.name || "Anonymous",
    score: r.totalScore,
  }));

  return res.status(200).json(new ApiResponse(200, leaderboard));
});

/** GET /api/interview/history - User's past sessions (optional auth) */
export const getHistory = Asynchandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw new ApiError(401, "Login required");
  const sessions = await InterviewSession.find({ userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .select("question.title score maxScore passed totalTests createdAt language status");
  return res.status(200).json(new ApiResponse(200, sessions));
});

/** POST /api/v1/user/coding-interview - Create coding interview session (verifyJWT). Supports single question or multi-question (attempts array). */
export const createCodingInterview = Asynchandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw new ApiError(401, "Unauthorized");
  const body = req.body || {};
  const attempts = Array.isArray(body.attempts) ? body.attempts : [];
  const totalScore = attempts.length > 0
    ? attempts.reduce((sum, a) => sum + (Number(a.score) || 0), 0)
    : (body.score ?? 0);

  const session = await InterviewSession.create({
    userId,
    question: body.question || {},
    code: body.code || "",
    language: body.language || "javascript",
    score: totalScore,
    maxScore: attempts.length > 0 ? attempts.length * 10 : (body.maxScore ?? 10),
    passed: body.passed ?? 0,
    totalTests: body.totalTests ?? 0,
    feedback: body.feedback || "",
    aiReview: body.aiReview || {},
    followUpQa: Array.isArray(body.followUpQa) ? body.followUpQa : [],
    runOutput: body.runOutput || "",
    status: body.status || "submitted",
    attempts: attempts.length > 0 ? attempts : undefined,
  });
  await incrementDailyUserCount(userId, "codingInterviewsToday", "lastCodingInterviewDate");
  return res.status(201).json(new ApiResponse(201, session));
});

/** GET /api/v1/user/get-coding-interview - Get current user's coding interview sessions */
export const getCodingInterviews = Asynchandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw new ApiError(401, "Unauthorized");
  const sessions = await InterviewSession.find({ userId })
    .sort({ createdAt: -1 })
    .limit(50);
  return res.status(200).json(new ApiResponse(200, sessions));
});

/** PUT /api/v1/user/update-coding-interview/:id - Update session (owner only) */
export const updateCodingInterview = Asynchandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw new ApiError(401, "Unauthorized");
  const session = await InterviewSession.findOne({ _id: req.params.id, userId });
  if (!session) throw new ApiError(404, "Session not found");
  const body = req.body || {};
  const allowed = ["question", "code", "language", "score", "maxScore", "passed", "totalTests", "feedback", "aiReview", "followUpQa", "runOutput", "status"];
  allowed.forEach((key) => {
    if (body[key] !== undefined) session[key] = body[key];
  });
  await session.save();
  return res.status(200).json(new ApiResponse(200, session));
});

/** DELETE /api/v1/user/delete-coding-interview/:id - Delete session (owner only) */
export const deleteCodingInterview = Asynchandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw new ApiError(401, "Unauthorized");
  const session = await InterviewSession.findOneAndDelete({ _id: req.params.id, userId });
  if (!session) throw new ApiError(404, "Session not found");
  return res.status(200).json(new ApiResponse(200, { deleted: true }));
});
