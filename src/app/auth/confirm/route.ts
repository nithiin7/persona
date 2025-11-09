import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/home'

  const supabase = await createClient()

  // Handle PKCE flow (code parameter) - newer Supabase auth flow
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // redirect user to specified redirect URL or home
      redirect(next)
    } else {
      console.error('Error exchanging code for session:', error)
      redirect('/login?error=email_confirmation')
    }
  }
  
  // Handle OTP flow (token_hash and type) - older Supabase auth flow
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      // redirect user to specified redirect URL or home
      redirect(next)
    } else {
      console.error('Error verifying OTP:', error)
      redirect('/login?error=email_confirmation')
    }
  }

  // If neither code nor token_hash is present, redirect to login with error
  redirect('/login?error=email_confirmation')
}