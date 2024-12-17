import { ExerciseDBParser } from './parser';

const SUPABASE_URL = 'https://xgoysxoetcmqkkgjovya.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhnb3lzeG9ldGNtcWtrZ2pvdnlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NTA1MTksImV4cCI6MjA1MDAyNjUxOX0.nb0RMr6eLE8x1VGspLeUf0saDDu_mpDJ1TGWxM2w3LM';
const RAPID_API_KEY = '0567cf985amsha29a9af093e5780p1dfeb9jsn1aabdcbbc527';

async function main() {
  console.log('Starting application...');
  
  try {
    console.log('Creating parser instance...');
    const parser = new ExerciseDBParser(
      SUPABASE_URL,
      SUPABASE_KEY,
      RAPID_API_KEY
    );

    console.log('Starting exercise sync...');
    await parser.fetchExercises();
    console.log('Exercise sync completed');
  } catch (error) {
    console.error('Application error:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

console.log('Program starting...');
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});