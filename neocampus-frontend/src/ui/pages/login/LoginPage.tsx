import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/application/useCases/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Loader2, Info } from 'lucide-react'

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login, loading, error, language, setLanguage } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      console.error('Login failed:', err)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="w-full min-h-screen flex flex-col justify-between items-center py-12 bg-[#f9f9f9] font-sans">
      <div /> {/* Top spacing helper */}
      
      {/* Central Login Card Container */}
      <div className="w-full max-w-[440px] px-6 space-y-8 animate-fade-in flex flex-col">
        
        {/* Header Logo & Title */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white font-black text-lg">
              NC
            </div>
            <span className="text-xl font-bold tracking-tight text-black">
              NeoCampus
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight text-center">
            {language === 'fr' ? 'Connexion' : 'Login'}
          </h2>
          <p className="mt-2 text-sm text-neutral-500 text-center">
            {language === 'fr' 
              ? 'Accédez à votre espace de gestion' 
              : 'Access your management portal'}
          </p>
        </div>

        {/* Form Card */}
        <Card className="bg-white border border-neutral-100 shadow-lg rounded-[28px] overflow-hidden p-8">
          <CardContent className="p-0">
            <form onSubmit={handleLogin} className="space-y-6">
              
              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium border border-red-100">
                  {error}
                </div>
              )}

              {/* Info box for simulated fallback */}
              <div className="p-3 bg-blue-50/50 text-blue-800 rounded-xl text-[11px] leading-relaxed border border-blue-100 flex items-start gap-2">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <strong>Test Tips:</strong> Type <code className="bg-white px-1 py-0.5 rounded border">teacher</code>, <code className="bg-white px-1 py-0.5 rounded border">parent</code>, <code className="bg-white px-1 py-0.5 rounded border">student</code>, or <code className="bg-white px-1 py-0.5 rounded border">comptable</code> in the email to instantly test the corresponding role dashboard.
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold tracking-wider text-neutral-400 uppercase">
                  {language === 'fr' ? 'Adresse E-mail' : 'Email Address'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nom@exemple.com"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-xs font-bold tracking-wider text-neutral-400 uppercase">
                    {language === 'fr' ? 'Mot de passe' : 'Password'}
                  </Label>
                  <a href="#" className="text-xs text-neutral-400 hover:underline">
                    {language === 'fr' ? 'Mot de passe oublié ?' : 'Forgot password?'}
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 pl-4 pr-10 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-black hover:bg-neutral-900 text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-sm border-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {language === 'fr' ? 'Connexion...' : 'Logging in...'}
                  </>
                ) : (
                  language === 'fr' ? 'Se connecter' : 'Log in'
                )}
              </Button>
            </form>

            {/* Separator */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-neutral-100" />
              </div>
              <span className="relative px-3 bg-white text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                {language === 'fr' ? 'Nouveau sur NeoCampus ?' : 'New to NeoCampus?'}
              </span>
            </div>
            <div className="text-center">
              <a href="#" className="text-xs font-semibold text-black hover:underline">
                {language === 'fr' ? 'Créer un compte établissement' : 'Register institution'}
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Language Switcher */}
      <footer className="w-full flex items-center justify-center gap-4 text-xs font-bold text-neutral-400 tracking-wider">
        <button
          onClick={() => setLanguage('fr')}
          className={`hover:text-black transition cursor-pointer ${language === 'fr' ? 'text-black font-extrabold' : ''}`}
        >
          FR
        </button>
        <span className="text-neutral-200">|</span>
        <button
          onClick={() => setLanguage('en')}
          className={`hover:text-black transition cursor-pointer ${language === 'en' ? 'text-black font-extrabold' : ''}`}
        >
          EN
        </button>
      </footer>
    </div>
  )
}

export default LoginPage
