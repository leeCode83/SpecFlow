import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rocket, 
  Mail, 
  Lock, 
  Loader2, 
  Chrome, 
  Github,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase/supabase';
import { toast } from 'sonner';

export function Auth({ onBack }: { onBack?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailAuth = async (type: 'login' | 'signup') => {
    if (!email || !password) return toast.error("Please fill in all fields");
    setLoading(true);
    
    try {
      const { error } = type === 'login' 
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

      if (error) throw error;
      
      if (type === 'signup') {
        toast.success("Registration successful! Check your email if verification is required.");
      } else {
        toast.success("Welcome back!");
      }
    } catch (error: any) {
      if (error.message === 'Invalid login credentials') {
        toast.error("Email tidak terdaftar atau password salah.");
      } else {
        toast.error(error.message || "Authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Use popup for iframe compatibility in AI Studio
          skipBrowserRedirect: true,
          queryParams: {
            access_type: 'offline',
          },
          redirectTo: process.env.APP_URL || window.location.origin,
        },
      });
      if (error) throw error;
      
      if (data?.url) {
        // Open the authorization URL in a new popup window to avoid iframe restrictions
        const popup = window.open(data.url, 'google-oauth', 'width=500,height=600');
        if (!popup) {
          toast.error("Popup blocked! Please allow popups for this site to sign in with Google.");
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGithub = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          skipBrowserRedirect: true,
          scopes: 'public_repo',
          redirectTo: process.env.APP_URL || window.location.origin,
        },
      });
      if (error) throw error;
      
      if (data?.url) {
        const popup = window.open(data.url, 'github-oauth', 'width=500,height=600');
        if (!popup) {
          toast.error("Popup blocked! Please allow popups for this site to sign in with GitHub.");
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-orange-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 relative"
      >
        {onBack && (
          <button 
            onClick={onBack}
            className="absolute -top-12 left-0 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
          >
            ← Back to Home
          </button>
        )}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-orange-500 rounded-2xl mb-4 cursor-pointer hover:scale-105 transition-transform" onClick={onBack}>
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white italic cursor-pointer hover:text-slate-200 transition-colors" onClick={onBack}>IdeaFrame MVP</h1>
          <p className="text-slate-400">Sign in to start building technical blueprints.</p>
        </div>

        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl p-8 rounded-3xl shadow-2xl">
          <Tabs defaultValue="login" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-slate-950/50 p-1 rounded-xl h-12">
              <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-slate-800">Login</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-slate-800">Sign Up</TabsTrigger>
            </TabsList>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input 
                    type="email" 
                    placeholder="name@company.com" 
                    className="pl-10 bg-slate-950/50 border-slate-800 focus:border-orange-500/50 h-12 rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10 bg-slate-950/50 border-slate-800 focus:border-orange-500/50 h-12 rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <TabsContent value="login" className="m-0">
                <Button 
                  className="w-full bg-orange-500 hover:bg-orange-600 h-12 rounded-xl font-bold gap-2"
                  onClick={() => handleEmailAuth('login')}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </TabsContent>

              <TabsContent value="signup" className="m-0">
                <Button 
                  className="w-full bg-orange-500 hover:bg-orange-600 h-12 rounded-xl font-bold gap-2"
                  onClick={() => handleEmailAuth('signup')}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
                  <Rocket className="w-4 h-4" />
                </Button>
              </TabsContent>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0b0e14] px-2 text-slate-500 font-bold tracking-widest">Or continue with</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                variant="outline" 
                className="w-full h-12 rounded-xl border-slate-800 hover:bg-slate-900 gap-3 font-semibold"
                onClick={signInWithGoogle}
                disabled={loading}
              >
                <Chrome className="w-5 h-5 text-red-500" />
                Google Workspace
              </Button>

              <Button 
                variant="outline" 
                className="w-full h-12 rounded-xl border-slate-800 hover:bg-slate-900 gap-3 font-semibold"
                onClick={signInWithGithub}
                disabled={loading}
              >
                <Github className="w-5 h-5 text-white" />
                GitHub (Public Repos)
              </Button>
            </div>
          </Tabs>

          <p className="mt-8 text-center text-xs text-slate-500 leading-relaxed">
            By continuing, you agree to our Terms of Service and Privacy Policy. 
            All specs are stored securely in Supabase.
          </p>
        </Card>

        <div className="flex items-center gap-2 justify-center p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10">
          <AlertCircle className="w-4 h-4 text-orange-500" />
          <p className="text-[10px] text-slate-400 font-medium leading-tight">
            Pro Tip: Use Google Login with your hackathon email for instant workspace access.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
