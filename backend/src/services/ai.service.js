import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import puppeteer from "puppeteer";

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});

const interviewReportSchema = {
    type: "OBJECT",
    properties: {
        matchScore: {
            type: "NUMBER",
            description: "A score between 0 and 100 indicating how well the candidate's profile matches the job description"
        },
        technicalQuestions: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    question: { type: "STRING", description: "The technical question that can be asked in the interview" },
                    intention: { type: "STRING", description: "The intention of interviewer behind asking this question" },
                    answer: { type: "STRING", description: "How to answer this question, what points to cover, what approach to take etc." }
                },
                required: ["question", "intention", "answer"]
            }
        },
        behavioralQuestions: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    question: { type: "STRING", description: "The behavioral question that can be asked in the interview" },
                    intention: { type: "STRING", description: "The intention of interviewer behind asking this question" },
                    answer: { type: "STRING", description: "How to answer this question, what points to cover, what approach to take etc." }
                },
                required: ["question", "intention", "answer"]
            }
        },
        skillGaps: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    skill: { type: "STRING", description: "The skill which the candidate is lacking" },
                    severity: { type: "STRING", enum: ["low", "medium", "high"], description: "The severity of this skill gap" }
                },
                required: ["skill", "severity"]
            }
        },
        preparationPlan: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    day: { type: "NUMBER", description: "The day number in the preparation plan, starting from 1" },
                    focus: { type: "STRING", description: "The main focus of this day" },
                    tasks: { type: "ARRAY", items: { type: "STRING" }, description: "List of tasks to be done on this day" }
                },
                required: ["day", "focus", "tasks"]
            }
        },
        title: {
            type: "STRING",
            description: "The title of the job for which the interview report is generated"
        }
    },
    required: ["matchScore", "technicalQuestions", "behavioralQuestions", "skillGaps", "preparationPlan", "title"]
};

const resumePdfSchema = {
    type: "OBJECT",
    properties: {
        html: {
            type: "STRING",
            description: "The HTML content of the resume which can be converted to PDF using Puppeteer"
        }
    },
    required: ["html"]
};

/**
 * Execute a Gemini call with automated retry and fallback models for 503 / 429 transient errors
 */
async function callGeminiWithRetry(options, candidateModels = ["gemini-3-flash-preview", "gemini-3.1-flash-lite", "gemini-3.5-flash"]) {
    let lastError = null;

    for (const model of candidateModels) {
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const response = await ai.models.generateContent({
                    ...options,
                    model
                });
                return response;
            } catch (err) {
                lastError = err;
                const errMsg = err.message || "";
                const isTransient = errMsg.includes("503") || errMsg.includes("429") || errMsg.includes("high demand") || errMsg.includes("UNAVAILABLE");

                if (!isTransient || attempt === 3) {
                    break;
                }

                // Progressive backoff before retry (1.5s, 3s)
                const delayMs = attempt * 1500;
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }
    }

    throw lastError;
}

async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription
}) {
    const prompt = `
Generate an interview report for a candidate with the following details:

Resume:
${resume || "None provided"}

Self Description:
${selfDescription || "None provided"}

Job Description:
${jobDescription}
`;

    const response = await callGeminiWithRetry({
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: interviewReportSchema
        }
    });

    const cleanedText = (response.text || "").replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedText);
}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    await page.setContent(htmlContent, {
        waitUntil: "networkidle0"
    });

    const pdfBuffer = await page.pdf({
        format: "A4",
        margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    });

    await browser.close();

    return pdfBuffer;
}

async function generateResumePdf({
    resume,
    selfDescription,
    jobDescription
}) {
    const prompt = `
Generate a resume for a candidate with the following details:

Resume:
${resume || "None provided"}

Self Description:
${selfDescription || "None provided"}

Job Description:
${jobDescription}

The response should be a JSON object with a single field "html"
which contains the HTML content of the resume.

The resume should be tailored for the given job description
and should highlight the candidate's strengths and relevant experience.

The HTML should be well-formatted, professional and ATS friendly.

The resume should ideally be 1-2 pages long.
`;

    const response = await callGeminiWithRetry({
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: resumePdfSchema
        }
    });

    const cleanedText = (response.text || "").replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonContent = JSON.parse(cleanedText);

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html);

    return pdfBuffer;
}

export {
    generateInterviewReport,
    generateResumePdf
};