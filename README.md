# Exercise Parser V3

Optimized parser for ExerciseDB API that fetches exercise data and stores it in Supabase database.

## Features

- Fetches exercise data from ExerciseDB API efficiently
- Stores exercise information in Supabase database
- Optimized GIF handling - skips already downloaded GIFs
- Stores secondary muscles data
- Batch processing with rate limiting
- Detailed error handling and logging

## Database Setup

```sql
CREATE TABLE public.exercises (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    target TEXT,
    equipment TEXT,
    body_parts TEXT[] NOT NULL,
    secondary_muscles TEXT[] DEFAULT '{}',
    description TEXT,
    instructions TEXT[],
    is_custom BOOLEAN DEFAULT false,
    user_id UUID,
    gif_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_exercises_category ON public.exercises(category);
CREATE INDEX idx_exercises_target ON public.exercises(target);
CREATE INDEX idx_exercises_body_parts ON public.exercises USING gin(body_parts);
CREATE INDEX idx_exercises_secondary_muscles ON public.exercises USING gin(secondary_muscles);
