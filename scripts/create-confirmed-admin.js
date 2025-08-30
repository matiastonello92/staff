const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=')
      if (key && value) {
        process.env[key] = value
      }
    })
  }
}

loadEnvFile()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function createConfirmedAdmin() {
  console.log('🌱 Creating admin user with auto-confirmation...')

  // Try with a different email that might auto-confirm
  const adminEmail = 'admin@example.com'
  const adminPassword = '123456'
  
  try {
    // First try to sign in to see if user exists
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    })

    if (signInData.user) {
      console.log('✅ Test admin user already exists and can login!')
      console.log('📧 Email:', adminEmail)
      console.log('🔑 Password:', adminPassword)
      await supabase.auth.signOut()
      return
    }

    // Create new user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'Admin',
          role: 'Admin'
        }
      }
    })

    if (authError) {
      console.error('Error creating test admin:', authError.message)
      return
    }

    console.log('✅ Test admin user created!')
    console.log('📧 Email:', adminEmail)
    console.log('🔑 Password:', adminPassword)
    console.log('👤 Name: Test Admin')
    console.log('🛡️ Role: Admin')
    
    if (authData.user && !authData.user.email_confirmed_at) {
      console.log('📬 Email confirmation may be required')
      console.log('💡 Try logging in - some Supabase projects auto-confirm in development')
    }
    
  } catch (error) {
    console.error('Unexpected error:', error.message)
  }
}

createConfirmedAdmin()
