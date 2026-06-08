import { useState } from 'react'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import logoBlue from '../assets/logo-blue.png'
import { Icon } from '../components/Icon'

interface SignupProps {
  onDone: () => void
}

function isValidEmail(v: string) {
  return v.includes('@') && v.includes('.')
}

// Inline SVG brand logos for Apple / Google (prototype-quality)
function AppleLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.42c1.27.07 2.14.74 2.9.8.92-.19 1.8-.89 2.82-.94 2.21-.1 3.87 1.23 4.67 3.08-4.03 2.41-3.03 7.54 1.1 9-.46 1.33-1.17 2.64-2.48 2.9zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  )
}

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21.35 11.1H12.18v2.73h5.25c-.5 2.5-2.67 4.44-5.25 4.44a6.27 6.27 0 0 1 0-12.54c1.6 0 3.04.59 4.14 1.55l1.96-1.96A9.4 9.4 0 0 0 12.18 3a9.27 9.27 0 1 0 0 18.54c5.35 0 9.12-3.67 9.12-9.17 0-.57-.06-1.18-.95-1.27z" fill="#4285F4" />
      <path d="M3 12a9.18 9.18 0 0 1 .54-3.09l-2.32-1.8A9.26 9.26 0 0 0 2.9 12c0 1.49.36 2.89.99 4.13l2.3-1.78A9.2 9.2 0 0 1 3 12z" fill="#34A853" />
      <path d="M12.18 21c2.5 0 4.64-.83 6.19-2.24l-2.18-1.69a5.67 5.67 0 0 1-4 1.42 6.27 6.27 0 0 1-5.93-4.35L3.9 15.89A9.27 9.27 0 0 0 12.18 21z" fill="#FBBC05" />
      <path d="M21.35 11.1c0-.57-.06-1.12-.15-1.64H12.18v2.73h5.25a5.27 5.27 0 0 1-2.27 3.27l2.18 1.7A9.27 9.27 0 0 0 21.35 11.1z" fill="#EA4335" />
    </svg>
  )
}

interface FieldProps {
  label: string
  id: string
  type: string
  value: string
  error?: string
  placeholder?: string
  autoComplete?: string
  icon: React.ReactNode
  suffix?: React.ReactNode
  onChange: (v: string) => void
  onBlur?: () => void
}

function Field({ label, id, type, value, error, placeholder, autoComplete, icon, suffix, onChange, onBlur }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-text">
        {label}
      </label>
      <div className={`flex items-center border rounded-xl px-3 h-12 gap-2 bg-card transition-colors focus-within:ring-2 focus-within:ring-primary-soft ${error ? 'border-error' : 'border-surface'}`}>
        <span className="text-text-muted shrink-0">{icon}</span>
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className="flex-1 text-sm text-text bg-transparent outline-none placeholder:text-text-muted"
        />
        {suffix}
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
}

export default function Signup({ onDone }: SignupProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [emailErr, setEmailErr] = useState('')
  const [pwErr, setPwErr] = useState('')

  function validateEmail() {
    if (email && !isValidEmail(email)) setEmailErr('Enter a valid email address')
    else setEmailErr('')
  }

  function validatePassword() {
    if (password && password.length < 6) setPwErr('Password must be at least 6 characters')
    else setPwErr('')
  }

  function handleSignUp() {
    // Show any obvious errors, then always proceed — never hard-block the demo.
    validateEmail()
    validatePassword()
    onDone()
  }

  return (
    <div className="fixed inset-0 bg-card overflow-y-auto">
      <div className="min-h-full flex flex-col items-center justify-start px-6 py-10 max-w-sm mx-auto gap-8 animate-fade-in">

        {/* Wordmark */}
        <div className="flex flex-col items-center gap-2 pt-4">
          <img
            src={logoBlue}
            alt="Agend.AI"
            className="w-14 h-14 object-contain"
          />
          <span className="font-logo text-2xl font-semibold text-text tracking-tight">
            Agend.AI
          </span>
        </div>

        {/* Heading */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-text">Create account</h1>
          <p className="text-sm text-text-muted mt-1">Get started — it's free</p>
        </div>

        {/* Fields */}
        <div className="w-full flex flex-col gap-4">
          <Field
            id="name"
            label="Full name"
            type="text"
            value={name}
            placeholder="Your name"
            autoComplete="name"
            icon={<Icon icon={User} size={18} />}
            onChange={setName}
          />
          <Field
            id="email"
            label="Email"
            type="email"
            value={email}
            error={emailErr}
            placeholder="you@example.com"
            autoComplete="email"
            icon={<Icon icon={Mail} size={18} />}
            onChange={setEmail}
            onBlur={validateEmail}
          />
          <Field
            id="password"
            label="Password"
            type={showPw ? 'text' : 'password'}
            value={password}
            error={pwErr}
            placeholder="Min. 6 characters"
            autoComplete="new-password"
            icon={<Icon icon={Lock} size={18} />}
            suffix={
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="text-text-muted hover:text-text transition-colors shrink-0"
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                <Icon icon={showPw ? EyeOff : Eye} size={18} />
              </button>
            }
            onChange={setPassword}
            onBlur={validatePassword}
          />
        </div>

        {/* Sign Up CTA */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={handleSignUp}
            className="w-full h-14 bg-primary text-white font-semibold text-base rounded-2xl hover:bg-primary/90 transition-colors active:scale-[0.98]"
          >
            Sign Up
          </button>

          <p className="text-center text-sm text-text-muted">
            Already have an account?{' '}
            <button
              onClick={onDone}
              className="text-primary font-medium hover:underline"
            >
              Log in
            </button>
          </p>
        </div>

        {/* Divider */}
        <div className="w-full flex items-center gap-3">
          <div className="flex-1 h-px bg-surface" />
          <span className="text-xs text-text-muted">or continue with</span>
          <div className="flex-1 h-px bg-surface" />
        </div>

        {/* Social buttons */}
        <div className="w-full flex flex-col gap-3 pb-4">
          <button
            onClick={onDone}
            className="w-full h-12 bg-black text-white font-medium text-sm rounded-2xl flex items-center justify-center gap-3 hover:bg-black/90 transition-colors active:scale-[0.98]"
          >
            <AppleLogo className="w-5 h-5" />
            Continue with Apple
          </button>
          <button
            onClick={onDone}
            className="w-full h-12 bg-card text-text font-medium text-sm rounded-2xl border border-surface flex items-center justify-center gap-3 hover:bg-surface transition-colors active:scale-[0.98]"
          >
            <GoogleLogo className="w-5 h-5" />
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  )
}
