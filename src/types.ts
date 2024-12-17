export interface Exercise {
  id: string;
  name: string;
  category: string;
  target: string;
  equipment: string;
  body_parts: string[];
  secondary_muscles: string[];
  description?: string;
  instructions: string[];
  is_custom: boolean;
  user_id?: string;
  gif_url?: string;
}

export interface ApiExercise {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  secondaryMuscles: string[];
  instructions: string[];
  equipment: string;
  gifUrl: string;
}
