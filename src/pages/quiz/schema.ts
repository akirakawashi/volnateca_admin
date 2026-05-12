import { z } from 'zod';

export const optionSchema = z.object({
  option_text: z.string().min(1, 'Вариант не может быть пустым'),
  is_correct: z.boolean(),
});

export const questionSchema = z
  .object({
    question_text: z.string().min(1, 'Текст вопроса обязателен'),
    image_url: z.string().optional(),
    options: z.array(optionSchema).min(2, 'Минимум 2 варианта ответа'),
  })
  .refine((q) => q.options.filter((o) => o.is_correct).length === 1, {
    message: 'Ровно один вариант должен быть правильным',
    path: ['options'],
  });

export const quizFormSchema = z
  .object({
    code: z.string().min(1, 'Код обязателен'),
    task_name: z.string().min(1, 'Название обязательно'),
    description: z.string().optional(),
    points: z.number().int().positive('Очки должны быть > 0'),
    week_number: z.number().int().min(1).max(12).nullable().optional(),
    starts_at: z.string().optional(),
    ends_at: z.string().optional(),
    questions: z.array(questionSchema).min(1, 'Минимум 1 вопрос'),
  })
  .refine(
    (d) => {
      if (d.starts_at && d.ends_at) return new Date(d.starts_at) < new Date(d.ends_at);
      return true;
    },
    { message: 'starts_at должно быть раньше ends_at', path: ['ends_at'] },
  );

export type QuizFormValues = z.infer<typeof quizFormSchema>;

export const defaultQuestion = () => ({
  question_text: '',
  image_url: '',
  options: [
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false },
  ],
});
