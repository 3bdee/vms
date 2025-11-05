import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xgpdthvvecvdttbcuxbo.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhncGR0aHZ2ZWN2ZHR0YmN1eGJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MDczMTksImV4cCI6MjA2OTk4MzMxOX0._u-r04sF-hBumsnPpSwL5t1pnzrisS3FaUXuTRg0QKo";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (!error && data?.user) {
    const { data: schoolData } = await supabase
      .from("user_schools")
      .select("school_id")
      .eq("user_id", data.user.id)
      .single();

    if (schoolData?.school_id) {
      localStorage.setItem("school_id", schoolData.school_id);
    }
  }
  return { data, error };
};

export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

export const getCurrentUserSchool = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("user_schools")
    .select("school_id")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching user school:", error.message);
    return null;
  }

  return data?.school_id || null;
};
export const getSchoolId = () => localStorage.getItem("school_id");
