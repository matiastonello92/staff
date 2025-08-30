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

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  console.error('URL:', supabaseUrl ? '✓' : '✗')
  console.error('Key:', supabaseServiceKey ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedAdmin() {
  console.log('🌱 Starting admin user seed...')

  const adminEmail = 'matias@pecoranegra.fr'
  const adminPassword = '123456'
  
  try {
    // Try to sign up the user (this will work with anon key)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          first_name: 'Matias',
          last_name: 'Tonello',
          role: 'Admin'
        }
      }
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('✅ Admin user already exists:', adminEmail)
        return
      }
      console.error('Error creating admin user:', authError.message)
      return
    }

    console.log('✅ Admin user created successfully!')
    console.log('📧 Email:', adminEmail)
    console.log('🔑 Password:', adminPassword)
    console.log('👤 Name: Matias Tonello')
    console.log('🛡️ Role: Admin')
    
    if (authData.user && !authData.user.email_confirmed_at) {
      console.log('📬 Please check email for confirmation link')
    }
    
  } catch (error) {
    console.error('Unexpected error:', error.message)
  }
}

// Run the seed function
seedAdmin()
