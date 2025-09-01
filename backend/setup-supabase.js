#!/usr/bin/env node

/**
 * Supabase Setup Script for InTrack
 * This script helps you test your Supabase connection and verify the setup
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('🚀 InTrack Supabase Setup Script\n');

// Check environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nPlease create a .env file with the required variables.');
  console.error('See env.example for reference.');
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log(`   SUPABASE_URL: ${process.env.SUPABASE_URL}`);
console.log(`   SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY.substring(0, 20)}...\n`);

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Test connection
async function testConnection() {
  try {
    console.log('🔌 Testing Supabase connection...');
    
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('⚠️  Table "users" does not exist yet. This is normal for new projects.');
        console.log('   Run the SQL schema from supabase-schema.sql in your Supabase dashboard.\n');
        return false;
      }
      
      console.error('❌ Connection error:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

// Test basic operations
async function testOperations() {
  try {
    console.log('🧪 Testing basic operations...');
    
    // Test insert (will fail if table doesn't exist, but that's OK)
    const { error: insertError } = await supabase
      .from('users')
      .insert([{
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        mobile_number: '1234567890',
        password_hash: 'test-hash',
        role: 'STUDENT'
      }]);
    
    if (insertError && insertError.code === 'PGRST116') {
      console.log('⚠️  Cannot test operations - tables not created yet.');
      console.log('   Please run the schema setup first.\n');
      return false;
    }
    
    console.log('✅ Basic operations test passed!');
    return true;
  } catch (error) {
    console.error('❌ Operations test failed:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  const connectionOk = await testConnection();
  
  if (connectionOk) {
    await testOperations();
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Go to your Supabase dashboard');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Copy and run the contents of supabase-schema.sql');
  console.log('4. Restart your backend server');
  console.log('5. Test your API endpoints\n');
  
  console.log('📚 For more help, see MIGRATION_GUIDE.md');
}

// Run the script
main().catch(console.error);
