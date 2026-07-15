export interface Option {
  letra: string; // 'A', 'B', 'C', 'D'
  texto: string;
  es_correcta: boolean;
}

export interface Question {
  id_pregunta: string | number;
  modulo: string; // e.g., "Diseño de Software", "Inglés", "Lectura Crítica", etc.
  enunciado: string;
  opciones: Option[];
  explicacion_retroalimentacion: string;
  tema?: string; // e.g., "Patrones de Diseño", "Arquitectura", etc.
}

export interface ModuleInfo {
  id: string;
  name: string;
  icon: string;
}

export interface UserScore {
  score: number;
  completed: number;
  totalQuestions: number;
  updatedAt: string;
}

export interface User {
  username: string;
  password?: string; // Stored in plain text for this simple mock simulator
  role: "admin" | "user";
  scores: Record<string, UserScore>; // moduleId -> score details
  answers?: Record<string, string>; // questionId -> selectedOptionLetra
  createdAt: string;
}
