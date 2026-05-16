export interface CreateQuizOptionPayload {
  option_text: string;
  is_correct: boolean;
  sort_order: number;
}

export interface CreateQuizQuestionPayload {
  question_text: string;
  image_attachment: string | null;
  options: CreateQuizOptionPayload[];
}

export interface CreateQuizPayload {
  task_name: string;
  description: string | null;
  points: number;
  week_number: number | null;
  starts_at: string | null;
  ends_at: string | null;
  questions: CreateQuizQuestionPayload[];
}

export interface CreatedQuizOption {
  quiz_question_options_id: number;
  option_text: string;
  is_correct: boolean;
  sort_order: number;
}

export interface CreatedQuizQuestion {
  quiz_questions_id: number;
  question_text: string;
  image_attachment: string | null;
  image_url: string | null;
  options: CreatedQuizOption[];
}

export interface CreatedQuiz {
  tasks_id: number;
  code: string;
  task_name: string;
  questions: CreatedQuizQuestion[];
}
