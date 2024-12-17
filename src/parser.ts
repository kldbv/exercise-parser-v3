import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import type { Exercise, ApiExercise } from './types';

export class ExerciseDBParser {
  private supabase;
  private apiClient;

  constructor(
    private supabaseUrl: string,
    private supabaseKey: string,
    private rapidApiKey: string
  ) {
    console.log('Initializing connections...');
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.apiClient = axios.create({
      baseURL: 'https://exercisedb.p.rapidapi.com',
      headers: {
        'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
        'x-rapidapi-key': rapidApiKey
      }
    });
  }

  private transformExerciseData(apiExercise: ApiExercise): Partial<Exercise> {
    return {
      id: apiExercise.id,
      name: apiExercise.name,
      category: apiExercise.bodyPart,
      target: apiExercise.target,
      equipment: apiExercise.equipment,
      body_parts: [
        apiExercise.bodyPart,
        apiExercise.target
      ].filter(Boolean),
      secondary_muscles: apiExercise.secondaryMuscles || [],
      description: `${apiExercise.name} is a ${apiExercise.bodyPart} exercise targeting ${apiExercise.target} using ${apiExercise.equipment}. Secondary muscles: ${apiExercise.secondaryMuscles.join(', ')}`,
      instructions: apiExercise.instructions || [],
      is_custom: false
    };
  }

  private async checkExistingGif(exerciseId: string): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('exercises')
      .select('gif_url')
      .eq('id', exerciseId)
      .single();

    if (error || !data) {
      return null;
    }

    return data.gif_url || null;
  }

  async fetchExercises(): Promise<void> {
    try {
      console.log('Starting to fetch exercises from ExerciseDB...');
      
      const response = await this.apiClient.get<ApiExercise[]>('/exercises', {
        params: { limit: 10000 }
      });

      const exercises = response.data;
      console.log(`Fetched ${exercises.length} exercises from API`);

      const batchSize = 50;
      let successCount = 0;
      let errorCount = 0;
      let skippedGifs = 0;

      for (let i = 0; i < exercises.length; i += batchSize) {
        try {
          const batchExercises = exercises.slice(i, i + batchSize);
          const batch = await Promise.all(
            batchExercises.map(async (exercise: ApiExercise) => {
              const existingUrl = await this.checkExistingGif(exercise.id);
              const baseData = this.transformExerciseData(exercise);
              
              if (existingUrl) {
                skippedGifs++;
                return {
                  ...baseData,
                  gif_url: existingUrl
                };
              }
              
              return {
                ...baseData,
                gif_url: exercise.gifUrl
              };
            })
          );

          console.log(`Processing batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(exercises.length/batchSize)}...`);

          const { error } = await this.supabase
            .from('exercises')
            .upsert(batch, {
              onConflict: 'id'
            });

          if (error) {
            console.error(`Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error);
            errorCount += batch.length;
            continue;
          }

          successCount += batch.length;
          console.log(`Completed batch ${Math.floor(i/batchSize) + 1} (${successCount} exercises processed, ${skippedGifs} GIFs skipped)`);

        } catch (error) {
          console.error(`Error processing batch ${Math.floor(i/batchSize) + 1}:`, error);
          errorCount += batchSize;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log(`
Sync completed:
- Total exercises: ${exercises.length}
- Successfully saved: ${successCount}
- Failed: ${errorCount}
- GIFs skipped: ${skippedGifs}
      `);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      throw error;
    }
  }
}