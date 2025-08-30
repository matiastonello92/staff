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
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigrations() {
  console.log('🚀 Applying RBAC migrations...')

  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations')
  const migrationFiles = fs.readdirSync(migrationsDir).sort()

  for (const file of migrationFiles) {
    if (!file.endsWith('.sql')) continue

    console.log(`📄 Applying migration: ${file}`)
    
    const migrationPath = path.join(migrationsDir, file)
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })
      
      if (error) {
        console.error(`❌ Error applying ${file}:`, error.message)
        // Continue with other migrations
      } else {
        console.log(`✅ Successfully applied ${file}`)
      }
    } catch (err) {
      console.error(`❌ Unexpected error applying ${file}:`, err.message)
    }
  }

  console.log('🎉 Migration process completed!')
}

// Create exec_sql function if it doesn't exist
async function createExecSqlFunction() {
  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION exec_sql(sql text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$;
  `

  try {
    const { error } = await supabase.rpc('exec', { sql: createFunctionSQL })
    if (error) {
      console.log('Note: exec_sql function may already exist or need manual creation')
    }
  } catch (err) {
    console.log('Note: Will try to apply migrations directly')
  }
}

async function main() {
  await createExecSqlFunction()
  await applyMigrations()
}

main()
