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

// Initialize Supabase client with service role (if available) or anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function confirmAdmin() {
  console.log('🔧 Attempting to confirm admin email...')

  const adminEmail = 'matias@pecoranegra.fr'
  
  try {
    // Try to get user by email and update email_confirmed_at
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.log('⚠️ Cannot access admin functions with current key')
      console.log('💡 For development, you can disable email confirmation in Supabase dashboard:')
      console.log('   1. Go to Authentication > Settings')
      console.log('   2. Disable "Enable email confirmations"')
      return
    }

    const adminUser = users.users.find(user => user.email === adminEmail)
    
    if (!adminUser) {
      console.log('❌ Admin user not found')
      return
    }

    if (adminUser.email_confirmed_at) {
      console.log('✅ Admin email already confirmed')
      return
    }

    // Update user to confirm email
    const { data, error } = await supabase.auth.admin.updateUserById(
      adminUser.id,
      { email_confirm: true }
    )

    if (error) {
      console.error('❌ Error confirming email:', error.message)
      return
    }

    console.log('✅ Admin email confirmed successfully!')
    
  } catch (error) {
    console.error('Unexpected error:', error.message)
  }
}

confirmAdmin()
