/** Supabase's error text, reworded where it would confuse people. */
export function friendly(message: string): string {
  if (/invalid login credentials/i.test(message)) return "That email and password don't match. Try again or reset your password.";
  if (/email not confirmed/i.test(message)) return "Confirm your email first: open the link we sent you.";
  if (/already registered|already been registered/i.test(message)) return "There is already an account with that email. Log in instead.";
  if (/rate limit/i.test(message)) return "Too many emails in a short time. Wait a few minutes and try again.";
  if (/token has expired|expired or is invalid/i.test(message)) return "That code has expired. Send yourself a new one.";
  if (/invalid token|otp_expired/i.test(message)) return "That code is not right. Check the email and try again.";
  return message;
}

/** Shortest password Supabase will accept for this project. */
export const MIN_PASSWORD = 8;
