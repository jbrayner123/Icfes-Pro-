import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { setGlobalDispatcher, Agent } from "undici";

// Configure global agent with 2 minute timeouts to prevent HeadersTimeoutError
setGlobalDispatcher(new Agent({
  connect: {
    timeout: 60000,
  },
  headersTimeout: 120000,
  bodyTimeout: 120000,
}));

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Support customizable data directory for persistent disk hosting (e.g., Render)
const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(process.cwd(), "src", "data");

// Ensure DATA_DIR exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Path to persistent AI-generated questions
const GENERATED_QUESTIONS_FILE = path.join(DATA_DIR, "generated_questions.json");

// Path to persistent users data
const USERS_FILE = path.join(DATA_DIR, "users.json");

// Ensure the JSON files exist
if (!fs.existsSync(GENERATED_QUESTIONS_FILE)) {
  fs.writeFileSync(GENERATED_QUESTIONS_FILE, JSON.stringify([], null, 2), "utf-8");
}
if (!fs.existsSync(USERS_FILE)) {
  const defaultAdmin = [
    {
      username: "admin",
      password: "admin",
      role: "admin",
      createdAt: new Date().toISOString(),
      scores: {}
    }
  ];
  fs.writeFileSync(USERS_FILE, JSON.stringify(defaultAdmin, null, 2), "utf-8");
}

// Initialise Gemini SDK
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
  console.log("Gemini API Client initialised successfully.");
} else {
  console.log("No GEMINI_API_KEY found in environment variables. Dynamic generation will fall back.");
}

// Map ID to database modulo field names used in mock questions
const getModuloField = (id: string): string => {
  const map: Record<string, string> = {
    "communication": "Communication",
    "quantitative-reasoning": "Quantitative Reasoning",
    "critical-reading": "Critical Reading",
    "citizen-competencies": "Citizen Competencies",
    "english": "English",
    "project-formulation": "Project Formulation",
    "scientific-thinking": "Scientific Thinking",
    "software-design": "Diseño de Software"
  };
  return map[id] || id;
};

// Map ID to Spanish full names
const getModuloSpanishName = (id: string): string => {
  const map: Record<string, string> = {
    "communication": "Comunicación Escrita",
    "quantitative-reasoning": "Razonamiento Cuantitativo",
    "critical-reading": "Lectura Crítica",
    "citizen-competencies": "Competencias Ciudadanas",
    "english": "Inglés",
    "project-formulation": "Formulación de Proyectos",
    "scientific-thinking": "Pensamiento Científico",
    "software-design": "Diseño de Software"
  };
  return map[id] || id;
};

// Import mock questions directly to merge on the server
import { MOCK_QUESTIONS } from "./src/data/questions";

// Helper to read generated questions
function readGeneratedQuestions() {
  try {
    if (fs.existsSync(GENERATED_QUESTIONS_FILE)) {
      const data = fs.readFileSync(GENERATED_QUESTIONS_FILE, "utf-8");
      return JSON.parse(data) || [];
    }
  } catch (error) {
    console.error("Error reading generated questions file:", error);
  }
  return [];
}

// Helper to write generated questions
function writeGeneratedQuestions(questions: any[]) {
  try {
    fs.writeFileSync(GENERATED_QUESTIONS_FILE, JSON.stringify(questions, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing generated questions file:", error);
  }
}

// Helper to check if a question is primarily in English
function isQuestionEnglish(q: any): boolean {
  const text = (q.enunciado || "") + " " + (q.opciones || []).map((o: any) => o.texto || "").join(" ");
  const englishWords = [" the ", " of ", " and ", " to ", " in ", " is ", " that ", " with ", " for ", " was ", " are ", " it ", " on ", " have ", " you ", " this "];
  const spanishWords = [" de ", " la ", " que ", " el ", " en ", " los ", " del ", " con ", " para ", " por ", " una ", " un ", " como ", " este ", " esta ", " las "];
  
  let englishCount = 0;
  let spanishCount = 0;
  
  const lower = text.toLowerCase();
  for (const word of englishWords) {
    if (lower.includes(word)) englishCount++;
  }
  for (const word of spanishWords) {
    if (lower.includes(word)) spanishCount++;
  }
  
  return englishCount > spanishCount;
}

// API: Get questions for a modulo
app.get("/api/questions", (req, res) => {
  const { modulo } = req.query;
  const targetModulo = modulo as string;

  if (!targetModulo) {
    return res.status(400).json({ error: "Modulo is required parameter" });
  }

  const normalizedTarget = getModuloField(targetModulo);
  
  // Merge mock questions and generated questions
  const baseQuestions = MOCK_QUESTIONS.filter(
    (q) => q.modulo.toLowerCase() === normalizedTarget.toLowerCase()
  );
  
  const generatedQuestions = readGeneratedQuestions().filter(
    (q: any) => q.modulo.toLowerCase() === normalizedTarget.toLowerCase() || q.modulo.toLowerCase() === getModuloSpanishName(targetModulo).toLowerCase()
  );

  const merged = [...baseQuestions, ...generatedQuestions];

  // Remove duplicates based on id_pregunta
  const uniqueQuestions: any[] = [];
  const seenIds = new Set();
  for (const q of merged) {
    if (!seenIds.has(q.id_pregunta)) {
      seenIds.add(q.id_pregunta);
      uniqueQuestions.push(q);
    }
  }

  // Filter based on language constraint
  const isTargetEnglish = targetModulo.toLowerCase() === "english";
  const languageFiltered = uniqueQuestions.filter((q) => {
    const isEng = isQuestionEnglish(q);
    return isTargetEnglish ? isEng : !isEng;
  });

  // Ensure every module has up to 60 questions (pad by duplicating if fewer, limit to 60)
  let finalQuestions = [...languageFiltered];
  if (finalQuestions.length > 0 && finalQuestions.length < 60) {
    const originalLength = finalQuestions.length;
    let dupIndex = 0;
    while (finalQuestions.length < 60) {
      const originalQ = originalLength === 1 ? finalQuestions[0] : finalQuestions[dupIndex % originalLength];
      // Clone the question with a new unique ID
      const clonedQ = {
        ...originalQ,
        id_pregunta: `dup_${Math.floor(finalQuestions.length / originalLength)}_${originalQ.id_pregunta}`
      };
      finalQuestions.push(clonedQ);
      dupIndex++;
    }
  }
  // Max 60 questions limit
  finalQuestions = finalQuestions.slice(0, 60);

  res.json(finalQuestions);
});

// API: Generate new questions using Gemini or DeepSeek
app.post("/api/questions/generate", async (req, res) => {
  const { moduloId, count = 3, provider = "deepseek" } = req.body;

  if (!moduloId) {
    return res.status(400).json({ error: "moduloId is required" });
  }

  try {
    const generated = await generateAndSave(moduloId, count, provider);
    if (generated && generated.length > 0) {
      return res.json({ success: true, count: generated.length, questions: generated, providerUsed: provider });
    } else {
      return res.status(500).json({ error: "No se pudieron generar preguntas con la IA. Por favor, vuelve a intentarlo." });
    }
  } catch (error: any) {
    console.error(`Error generating questions with ${provider}:`, error);
    res.status(500).json({ error: error.message || "Error interno al generar preguntas con IA" });
  }
});

// API: Check status of questions (how many we have per subject)
app.get("/api/stats", (req, res) => {
  const modulesList = [
    "communication", "quantitative-reasoning", "critical-reading", "citizen-competencies",
    "english", "project-formulation", "scientific-thinking", "software-design"
  ];

  const currentGenerated = readGeneratedQuestions();
  const stats = modulesList.map(id => {
    const field = getModuloField(id);
    const mockCount = MOCK_QUESTIONS.filter(q => q.modulo.toLowerCase() === field.toLowerCase()).length;
    const genCount = currentGenerated.filter((q: any) => q.modulo.toLowerCase() === field.toLowerCase() || q.modulo.toLowerCase() === getModuloSpanishName(id).toLowerCase()).length;
    const uniqueCount = mockCount + genCount;
    return {
      id,
      name: getModuloSpanishName(id),
      total: uniqueCount > 0 ? 60 : 0, // Since we pad questions to exactly 60
      mockCount,
      genCount,
      uniqueCount
    };
  });

  res.json({
    stats,
    geminiConfigured: !!ai,
    deepseekConfigured: !!process.env.DEEPSEEK_API_KEY
  });
});

// API: Get all users
app.get("/api/users", (req, res) => {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, "utf-8");
      const users = JSON.parse(data);
      return res.json(users);
    }
  } catch (error) {
    console.error("Error reading users file:", error);
  }
  return res.json([]);
});

// API: Save/update all users
app.post("/api/users", (req, res) => {
  try {
    const users = req.body;
    if (Array.isArray(users)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
      return res.json({ success: true });
    }
    return res.status(400).json({ error: "Invalid users array payload" });
  } catch (error: any) {
    console.error("Error writing users file:", error);
    return res.status(500).json({ error: error.message || "Failed to save users" });
  }
});

// Helper to generate questions with Gemini/DeepSeek and save them to disk
async function generateAndSave(moduloId: string, count: number, provider: string = "gemini"): Promise<any[]> {
  const actualCount = Math.min(count, 3); // Cap at 3 for fast response and avoiding timeouts
  const moduloSpanishName = getModuloSpanishName(moduloId);
  const targetField = getModuloField(moduloId);
  
  const isGeneral = ["communication", "quantitative-reasoning", "critical-reading", "citizen-competencies", "english"].includes(moduloId);
  
  const isEnglish = moduloId === "english";
  const langInstruction = isEnglish
    ? "CRÍTICO: El cuestionario completo, incluyendo los enunciados, las opciones de respuesta, las explicaciones y las retroalimentaciones DEBEN estar escritos completamente en INGLÉS académico de nivel avanzado (C1/C2)."
    : "CRÍTICO: El cuestionario completo, incluyendo los enunciados, las opciones de respuesta, las explicaciones y las retroalimentaciones DEBEN estar escritos completamente en ESPAÑOL académico. Absolutamente nada debe estar en inglés.";

  const systemInstruction = (isGeneral
    ? "Eres un experto de élite en el diseño de pruebas de estado académicas y miembro de comités de evaluación del ICFES para el examen Pro Icfes en Colombia. Tu objetivo absoluto es redactar preguntas de opción múltiple de DIFICULTAD MÁXIMA (Nivel 4 / Avanzado). Las preguntas deben evaluar pensamiento analítico de alto nivel, lógica deductiva, deconstrucción crítica y resolución de dilemas complejos mediante textos y contextos extensos, rigurosos y desafiantes académicos."
    : "Eres un diseñador senior de exámenes académicos estatales y profesor emérito de Ingeniería de Sistemas y Computación. Tu objetivo es formular reactivos de opción múltiple de DIFICULTAD MÁXIMA (nivel ICFES Pro Icfes) para Ingeniería. Las preguntas deben evaluar conocimientos sumamente avanzados y prácticos de nivel profesional (e.g., asincronía en sistemas distribuidos, optimización de algoritmos complejos NP-hard, tolerancias a fallos de base de datos, arquitectura limpia empresarial, heurísticas metodológicas y diseño lógico riguroso).") + "\n\n" + langInstruction;

  const prompt = isGeneral ? (
    `Genera exactamente ${actualCount} preguntas de opción múltiple de competencia GENÉRICA de NIVEL EXTREMADAMENTE ALTO (Dificultad Nivel 4 / Pro Icfes) para el módulo oficial colombiano de '${moduloSpanishName}'.\n\n` +
    `NORMAS METODOLÓGICAS ESTRICTAS:\n` +
    `1. CONTEXTO EXTENSO: El enunciado DEBE comenzar con una lectura analítica, fragmento filosófico, escenario sociopolítico o problema matemático/gráfico de longitud considerable (entre 120 y 250 palabras). El texto debe exigir una lectura crítica minuciosa y activa.\n` +
    `2. COGNICIÓN COMPLEJA: No evalúes memorización ni conceptos simples. Diseña preguntas que requieran analizar supuestos, identificar sesgos implícitos, ponderar argumentos opuestos, o realizar análisis de lógica compleja.\n` +
    `3. DISTRACTORES ALTAMENTE PLAUSIBLES Y SUTILES: Las 3 opciones incorrectas NO deben ser absurdas; deben representar malentendidos comunes, errores de lógica comunes, respuestas correctas para una premisa diferente, o falacias argumentativas extremadamente convincentes.\n` +
    `4. EXPLICACIÓN PROFUNDA: La retroalimentación debe desglosar por qué la opción correcta es la única lógicamente válida bajo rigor académico, y explicar minuciosamente el error de razonamiento exacto de cada uno de los 3 distractores.\n\n` +
    `Cada pregunta debe tener 4 opciones (A, B, C, D) con una sola correcta (es_correcta = true), un tema y un id único.\n\n` +
    `Devuelve un array de objetos JSON con la estructura exacta:\n` +
    `[\n` +
    `  {\n` +
    `    "id_pregunta": "gen_${moduloId}_" + string aleatorio único,\n` +
    `    "modulo": "${targetField}",\n` +
    `    "enunciado": "...",\n` +
    `    "opciones": [\n` +
    `      { "letra": "A", "texto": "...", "es_correcta": false },\n` +
    `      { "letra": "B", "texto": "...", "es_correcta": true },\n` +
    `      { "letra": "C", "texto": "...", "es_correcta": false },\n` +
    `      { "letra": "D", "texto": "...", "es_correcta": false }\n` +
    `    ],\n` +
    `    "explicacion_retroalimentacion": "...",\n` +
    `    "tema": "..."\n` +
    `  }\n` +
    `]\n\n` +
    `Asegúrate de responder únicamente con el array de JSON válido, sin bloques de código markdown.`
  ) : (
    `Genera exactamente ${actualCount} preguntas de opción múltiple de competencia ESPECÍFICA PROFESIONAL de NIVEL EXTREMADAMENTE ALTO (Dificultad Nivel 4 / Pro Icfes) para Ingeniería de Sistemas en el módulo '${moduloSpanishName}'.\n\n` +
    `NORMAS METODOLÓGICAS ESTRICTAS:\n` +
    `1. CONTEXTO EXIGENTE: El enunciado DEBE presentar un reto técnico real de ingeniería (e.g., resolución de problemas de consistencia eventual en BDs NoSQL, balance de trade-offs de latencia/rendimiento bajo arquitectura microservicios, deducción lógica de diagramas UML abstractos, fallas de concurrencia de semáforos, o estimaciones críticas de viabilidad de proyectos con fórmulas de retorno de inversión o valor ganado en proyectos TI).\n` +
    `2. COGNICIÓN COMPLEJA: Se debe evaluar la capacidad de tomar decisiones arquitectónicas complejas, justificar trade-offs, diagnosticar errores lógicos sutiles en pseudo-código de algoritmos avanzados, o formular metodologías de investigación científica cuantitativa.\n` +
    `3. DISTRACTORES ALTAMENTE PLAUSIBLES Y SUTILES: Las 3 opciones incorrectas deben basarse en sesgos habituales de programadores (e.g., ignorar condiciones de carrera, confundir patrones estructurados con de comportamiento, fallas en el cálculo de holguras críticas, etc.).\n` +
    `4. EXPLICACIÓN PROFUNDA: La retroalimentación debe justificar la respuesta correcta mediante principios de ingeniería oficiales e invalidar detalladamente cada distractor.\n\n` +
    `Cada pregunta debe tener 4 opciones (A, B, C, D) con una sola correcta (es_correcta = true), un tema y un id único.\n\n` +
    `Devuelve un array de objetos JSON con la estructura exacta:\n` +
    `[\n` +
    `  {\n` +
    `    "id_pregunta": "gen_${moduloId}_" + string aleatorio único,\n` +
    `    "modulo": "${targetField}",\n` +
    `    "enunciado": "...",\n` +
    `    "opciones": [\n` +
    `      { "letra": "A", "texto": "...", "es_correcta": false },\n` +
    `      { "letra": "B", "texto": "...", "es_correcta": true },\n` +
    `      { "letra": "C", "texto": "...", "es_correcta": false },\n` +
    `      { "letra": "D", "texto": "...", "es_correcta": false }\n` +
    `    ],\n` +
    `    "explicacion_retroalimentacion": "...",\n` +
    `    "tema": "..."\n` +
    `  }\n` +
    `]\n\n` +
    `Asegúrate de responder únicamente con el array de JSON válido, sin bloques de código markdown.`
  );

  if (provider === "deepseek") {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error("No se ha configurado la clave DEEPSEEK_API_KEY en el entorno.");
    }

    console.log(`[DeepSeek] Invocando generación para módulo '${moduloId}'...`);
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: prompt + "\n\nIMPORTANTE: Devuelve únicamente un JSON array puro y directo sin bloques de marcado markdown ```json." }
        ],
        response_format: {
          type: "json_object"
        },
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Error de API de DeepSeek (${response.status}): ${errBody}`);
    }

    const data: any = await response.json();
    let textOutput = data.choices?.[0]?.message?.content || "[]";
    textOutput = textOutput.trim();

    // Clean markdown blocks if returned despite instruction
    if (textOutput.startsWith("```json")) {
      textOutput = textOutput.substring(7);
    } else if (textOutput.startsWith("```")) {
      textOutput = textOutput.substring(3);
    }
    if (textOutput.endsWith("```")) {
      textOutput = textOutput.substring(0, textOutput.length - 3);
    }
    textOutput = textOutput.trim();

    // Sometimes deepseek JSON mode wraps array in an object like {"questions": [...]} or {"data": [...]} or just returns the array.
    // Let's handle both!
    let parsed: any;
    try {
      parsed = JSON.parse(textOutput);
    } catch (e: any) {
      console.error("DeepSeek content parsing failed on raw string, trying cleanups.", e);
      throw new Error("Error al analizar el formato de respuesta JSON recibido de DeepSeek.");
    }

    let parsedQuestions: any[] = [];
    if (Array.isArray(parsed)) {
      parsedQuestions = parsed;
    } else if (parsed && typeof parsed === "object") {
      // Find any array property inside
      const keyWithArray = Object.keys(parsed).find(k => Array.isArray(parsed[k]));
      if (keyWithArray) {
        parsedQuestions = parsed[keyWithArray];
      } else {
        parsedQuestions = [parsed]; // Single object
      }
    }

    if (parsedQuestions.length > 0) {
      // Clean and standardise schema fields
      const formattedQuestions = parsedQuestions.map((q: any, idx: number) => ({
        id_pregunta: q.id_pregunta || `gen_ds_${moduloId}_${Math.random().toString(36).substring(2, 9)}_${idx}`,
        modulo: targetField,
        enunciado: q.enunciado || "",
        opciones: (q.opciones || []).map((o: any) => ({
          letra: o.letra || "",
          texto: o.texto || "",
          es_correcta: !!o.es_correcta
        })),
        explicacion_retroalimentacion: q.explicacion_retroalimentacion || q.explicacion || "",
        tema: q.tema || "General"
      }));

      const currentGenerated = readGeneratedQuestions();
      const updatedList = [...currentGenerated, ...formattedQuestions];
      writeGeneratedQuestions(updatedList);
      return formattedQuestions;
    }
    return [];
  }

  // Fallback / Gemini
  if (!ai) {
    throw new Error("El cliente de IA Gemini no está configurado o no tiene API Key activa.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id_pregunta: { type: Type.STRING },
              modulo: { type: Type.STRING },
              enunciado: { type: Type.STRING },
              opciones: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    letra: { type: Type.STRING },
                    texto: { type: Type.STRING },
                    es_correcta: { type: Type.BOOLEAN }
                  },
                  required: ["letra", "texto", "es_correcta"]
                }
              },
              explicacion_retroalimentacion: { type: Type.STRING },
              tema: { type: Type.STRING }
            },
            required: ["id_pregunta", "modulo", "enunciado", "opciones", "explicacion_retroalimentacion", "tema"]
          }
        }
      }
    });

    const textOutput = response.text || "[]";
    const parsedQuestions = JSON.parse(textOutput.trim());
    if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
      const currentGenerated = readGeneratedQuestions();
      const updatedList = [...currentGenerated, ...parsedQuestions];
      writeGeneratedQuestions(updatedList);
      return parsedQuestions;
    }
  } catch (error: any) {
    const isRateLimit = error.message?.includes("503") || error.status === 503 || error.message?.includes("demand");
    const isTimeout = error.message?.includes("Timeout") || error.message?.includes("fetch");
    if (isRateLimit) {
      console.warn(`[AI Info] Gemini API is currently experiencing high demand. Skipping background generation for '${moduloId}' to avoid overload.`);
    } else if (isTimeout) {
      console.warn(`[AI Info] Network/Headers Timeout connecting to Gemini for '${moduloId}'. Skipping background generation.`);
    } else {
      console.warn(`[AI Info] Failed to generate questions for '${moduloId}':`, error.message || error);
    }
    throw error;
  }
  return [];
}


// Function to seed offline mock/generated questions from seed files
function seedOfflineOnStartup() {
  try {
    const seedFiles = [
      "seed_questions.json",
      "seed_questions_com.json",
      "seed_questions_rc.json",
      "seed_questions_lc.json",
      "seed_questions_cc.json",
      "seed_questions_en.json",
      "seed_questions_pf.json",
      "seed_questions_st.json",
      "seed_questions_sd.json"
    ];
    
    let allSeedQuestions: any[] = [];
    for (const fileName of seedFiles) {
      const seedFilePath = path.join(process.cwd(), "src", "data", fileName);
      if (fs.existsSync(seedFilePath)) {
        const seedData = fs.readFileSync(seedFilePath, "utf-8");
        const parsed = JSON.parse(seedData);
        if (Array.isArray(parsed)) {
          allSeedQuestions = [...allSeedQuestions, ...parsed];
        }
      }
    }
    
    const currentGenerated = readGeneratedQuestions();
    const existingIds = new Set(currentGenerated.map((q: any) => q.id_pregunta));
    const toAdd = allSeedQuestions.filter((q: any) => !existingIds.has(q.id_pregunta));
    
    if (toAdd.length > 0) {
      const updatedList = [...currentGenerated, ...toAdd];
      writeGeneratedQuestions(updatedList);
      console.log(`Auto-seeded ${toAdd.length} questions offline from seed files on startup.`);
    } else {
      console.log("No new offline seeds to apply on startup.");
    }
  } catch (err) {
    console.error("Error running offline startup seed:", err);
  }
}

// Background auto-seeding with Gemini if key is active
async function autoSeedWithAI() {
  if (!ai) {
    console.log("Auto-seeding with AI skipped: GEMINI_API_KEY is not defined.");
    return;
  }
  
  const modulesList = [
    "communication", "quantitative-reasoning", "critical-reading", "citizen-competencies",
    "english", "project-formulation", "scientific-thinking", "software-design"
  ];
  
  console.log("Checking question counts for auto-seeding...");
  
  // Wait 15 seconds after server startup before checking the first module
  await new Promise(resolve => setTimeout(resolve, 15000));
  
  for (const id of modulesList) {
    if (!ai) break; // If API key was removed in the meantime
    
    const field = getModuloField(id);
    const mockCount = MOCK_QUESTIONS.filter(q => q.modulo.toLowerCase() === field.toLowerCase()).length;
    const currentGenerated = readGeneratedQuestions();
    const genCount = currentGenerated.filter((q: any) => q.modulo.toLowerCase() === field.toLowerCase() || q.modulo.toLowerCase() === getModuloSpanishName(id).toLowerCase()).length;
    
    const total = mockCount + genCount;
    if (total < 20) {
      const needed = Math.min(2, 20 - total); // Generate in manageable, ultra-fast chunks of max 2 at a time
      console.log(`Auto-seeding AI: Module '${id}' has only ${total} questions. Generating ${needed} more with Gemini...`);
      try {
        const generated = await generateAndSave(id, needed);
        if (generated && generated.length > 0) {
          console.log(`Auto-seeded ${generated.length} new questions for ${id}.`);
        }
      } catch (err: any) {
        console.warn(`[AI Info] Failed to auto-seed module ${id} in background:`, err.message || err);
      }
      
      // Wait 30 seconds between modules to prevent rate limiting (429/503) and avoid overlapping requests
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
  }
  console.log("Auto-seeding check complete.");
}

// Mount Vite middleware or static server
async function startServer() {
  // First seed offline to ensure rich immediate content
  seedOfflineOnStartup();

  // Asynchronously check and seed with Gemini in background
  autoSeedWithAI().catch(err => console.error("Error in background auto-seeding:", err));

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
