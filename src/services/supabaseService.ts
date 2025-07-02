// Enhanced user profile validation and creation
static async ensureUserProfileExists(userId: string, email: string, name: string) {
  try {
    // First, check if user profile exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(`Failed to check user profile: ${checkError.message}`);
    }

    if (existingUser) {
      return existingUser;
    }

    // User profile doesn't exist, create it
    const profileData = {
      id: userId, // This must match the authenticated user's id!
      email: email.toLowerCase().trim(),
      name: name.trim(),
      subscription: 'free',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert(profileData)
      .select()
      .single();

    if (createError) {
      // If it's a unique constraint violation, the user might have been created by another process
      if (createError.code === '23505') {
        const { data: fetchedUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
        if (fetchError) throw new Error(`Failed to fetch user profile after creation: ${fetchError.message}`);
        return fetchedUser;
      }
      throw new Error(`Failed to create user profile: ${createError.message}`);
    }

    return newUser;
  } catch (error: any) {
    throw error;
  }
}

// Sign up with Supabase Auth, then create user profile
static async signUp(email: string, password: string, name: string) {
  try {
    if (!email || !password || !name) throw new Error('All fields are required');
    if (password.length < 6) throw new Error('Password must be at least 6 characters');
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email)) throw new Error('Invalid email format');
    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();

    // 1. Create the user account with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          name: cleanName,
          display_name: cleanName
        }
      }
    });

    if (error) {
      if (error.message.includes('User already registered')) {
        return await this.signIn(cleanEmail, password);
      } else if (error.message.includes('Password should be at least')) {
        throw new Error('Password must be at least 6 characters long');
      } else if (error.message.includes('Invalid email')) {
        throw new Error('Please enter a valid email address');
      } else {
        throw new Error(`Account creation failed: ${error.message}`);
      }
    }

    // 2. Get the new user's id from Supabase Auth
    const userId = data.user?.id;
    if (!userId) throw new Error('No user ID returned from sign up');

    // 3. Insert into users table as the authenticated user
    await this.ensureUserProfileExists(userId, cleanEmail, cleanName);

    return data;
  } catch (error: any) {
    throw error;
  }
}