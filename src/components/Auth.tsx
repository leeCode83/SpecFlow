import { useState, useEffect } from 'react';
import { PageTransition } from '@/components/ui/page-transition';
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
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthIllustration } from '@/components/ui/illustrations';

export function Auth() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const onBack = () => navigate('/');

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);
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
          redirectTo: (process.env.APP_URL || window.location.origin) + '/auth/callback',
        },
      });
      if (error) throw error;
      
      if (data?.url) {
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
          redirectTo: (process.env.APP_URL || window.location.origin) + '/auth/callback',
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full" />
        <AuthIllustration className="w-full max-w-lg opacity-60" />
      </div>

      <PageTransition className="max-w-md w-full space-y-8 relative">
        <button 
          onClick={onBack}
          aria-label="Back to home page"
          className="absolute -top-12 left-0 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
        >
          ← Back to Home
        </button>
        <div className="text-center space-y-2">
          <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') onBack(); }} className="inline-flex p-3 bg-primary rounded-2xl mb-4 cursor-pointer hover:scale-105 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" onClick={onBack}>
            <Rocket className="w-8 h-8 text-foreground" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground italic">IdeaFrame MVP</h1>
          <p className="text-muted-foreground">Sign in to start building technical blueprints.</p>
        </div>

        <Card className="bg-card border-border backdrop-blur-xl p-8 rounded-3xl shadow-2xl">
          <Tabs defaultValue="login" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-background/50 p-1 rounded-xl h-12">
              <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-muted">Login</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-muted">Sign Up</TabsTrigger>
            </TabsList>

            <form onSubmit={(e) => { e.preventDefault(); }}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    <Input 
                      type="email" 
                      placeholder="name@company.com" 
                      aria-label="Email address"
                      className="pl-10 bg-background/50 border-border focus:border-primary/50 h-12 rounded-xl"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      aria-label="Password"
                      className="pl-10 bg-background/50 border-border focus:border-primary/50 h-12 rounded-xl"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <TabsContent value="login" className="m-0">
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 h-12 rounded-xl font-bold gap-2"
                    onClick={() => handleEmailAuth('login')}
                    disabled={loading}
                    type="submit"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : "Sign In"}
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </TabsContent>

                <TabsContent value="signup" className="m-0">
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 h-12 rounded-xl font-bold gap-2"
                    onClick={() => handleEmailAuth('signup')}
                    disabled={loading}
                    type="submit"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : "Create Account"}
                    <Rocket className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </TabsContent>
              </div>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0b0e14] px-2 text-muted-foreground font-bold tracking-widest">Or continue with</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                variant="outline" 
                className="w-full h-12 rounded-xl border-border hover:bg-card gap-3 font-semibold"
                onClick={signInWithGoogle}
                disabled={loading}
              >
                <Chrome className="w-5 h-5 text-red-500" aria-hidden="true" />
                Google
              </Button>

              <Button 
                variant="outline" 
                className="w-full h-12 rounded-xl border-border hover:bg-card gap-3 font-semibold"
                onClick={signInWithGithub}
                disabled={loading}
              >
                <Github className="w-5 h-5 text-foreground" aria-hidden="true" />
                Github
              </Button>
            </div>
          </Tabs>

          <p className="mt-8 text-center text-xs text-muted-foreground leading-relaxed">
            By continuing, you agree to our Terms of Service and Privacy Policy. 
            All specs are stored securely in Supabase.
          </p>
        </Card>

        <div className="flex items-center gap-2 justify-center p-4 bg-primary/5 rounded-2xl border border-primary/10">
          <AlertCircle className="w-4 h-4 text-primary" aria-hidden="true" />
          <p className="text-[10px] text-muted-foreground font-medium leading-tight">
            Pro Tip: Use Google Login with your hackathon email for instant workspace access.
          </p>
        </div>
      </PageTransition>
    </div>
  );
}
