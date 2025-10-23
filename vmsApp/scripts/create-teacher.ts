import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTeacher(email: string, password: string, name: string) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    console.error('Error creating auth user:', authError.message);
    return;
  }

  if (!authData.user) {
    console.error('No user returned from signup');
    return;
  }

  const { error: teacherError } = await supabase
    .from('teachers')
    .insert([
      {
        id: authData.user.id,
        email,
        name,
      },
    ]);

  if (teacherError) {
    console.error('Error creating teacher record:', teacherError.message);
    return;
  }

  console.log('Teacher account created successfully!');
  console.log('Email:', email);
  console.log('Name:', name);
}

const email = process.argv[2];
const password = process.argv[3];
const name = process.argv[4];

if (!email || !password || !name) {
  console.log('Usage: npx tsx scripts/create-teacher.ts <email> <password> <name>');
  console.log('Example: npx tsx scripts/create-teacher.ts prof@school.com password123 "Marie Dupont"');
  process.exit(1);
}

createTeacher(email, password, name);
