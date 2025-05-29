import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { Shield, Lock, UserPlus } from 'lucide-react';

const AdminAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [canRegister, setCanRegister] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Handle rate limiting countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !canRegister) {
      setCanRegister(true);
    }
  }, [timeLeft, canRegister]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast({
          title: "Admin Login Mislukt",
          description: error.message,
          variant: "destructive"
        });
      } else if (data.user) {
        // Check if user has admin role
        const { data: roleData, error: roleError } = await supabase.rpc('get_user_role', {
          _user_id: data.user.id
        });

        if (roleError || roleData !== 'admin') {
          // Sign out the user if they're not an admin
          await supabase.auth.signOut();
          toast({
            title: "Toegang Geweigerd",
            description: "Je hebt geen administrator rechten",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Admin Login Succesvol",
            description: "Welkom terug, Administrator!"
          });
          navigate('/');
        }
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er is iets misgegaan tijdens het inloggen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdminRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canRegister) {
      toast({
        title: "Even Wachten",
        description: `Je kunt pas over ${timeLeft} seconden opnieuw proberen`,
        variant: "destructive"
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Wachtwoord Fout",
        description: "Wachtwoorden komen niet overeen",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Wachtwoord Te Kort",
        description: "Wachtwoord moet minimaal 6 karakters zijn",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        // Handle rate limiting error specifically
        if (error.message.includes("For security purposes, you can only request this after")) {
          const match = error.message.match(/after (\d+) seconds/);
          const seconds = match ? parseInt(match[1]) : 60;
          setTimeLeft(seconds);
          setCanRegister(false);
          
          toast({
            title: "Even Wachten",
            description: `Te veel registratie pogingen. Probeer het over ${seconds} seconden opnieuw`,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Registratie Mislukt",
            description: error.message,
            variant: "destructive"
          });
        }
      } else if (data.user) {
        toast({
          title: "Admin Account Aangemaakt",
          description: "Administrator account is succesvol aangemaakt! Je kunt nu inloggen.",
        });
        setIsRegistering(false);
        // Clear form
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFullName('');
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er is iets misgegaan tijdens de registratie",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto mb-6 w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Administrator Portal</h1>
          <p className="text-blue-200">Beveiligde toegang voor beheerders</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-2 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              {isRegistering ? (
                <UserPlus className="w-6 h-6 text-blue-600" />
              ) : (
                <Lock className="w-6 h-6 text-blue-600" />
              )}
            </div>
            <CardTitle className="text-2xl text-gray-800">
              {isRegistering ? 'Admin Registratie' : 'Admin Login'}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {isRegistering 
                ? 'Maak een nieuwe administrator account aan'
                : 'Voer je administrator gegevens in'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={isRegistering ? handleAdminRegistration : handleAdminLogin} className="space-y-4">
              {isRegistering && (
                <div className="space-y-2">
                  <Label htmlFor="admin-fullname" className="text-gray-700 font-medium">Volledige Naam</Label>
                  <Input
                    id="admin-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jan de Administrator"
                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="admin-email" className="text-gray-700 font-medium">Administrator Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bedrijf.nl"
                  className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password" className="text-gray-700 font-medium">Wachtwoord</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              {isRegistering && (
                <div className="space-y-2">
                  <Label htmlFor="admin-confirm-password" className="text-gray-700 font-medium">Bevestig Wachtwoord</Label>
                  <Input
                    id="admin-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              )}
              
              {!canRegister && timeLeft > 0 && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                  <p className="text-sm text-orange-800">
                    Te veel pogingen. Probeer het over {timeLeft} seconden opnieuw.
                  </p>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg"
                disabled={loading || (isRegistering && !canRegister)}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    {isRegistering ? 'Registreren...' : 'Inloggen...'}
                  </div>
                ) : (
                  <>
                    {isRegistering ? 'Administrator Registreren' : 'Administrator Login'}
                    {isRegistering && !canRegister && ` (${timeLeft}s)`}
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-center space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    // Clear form when switching
                    setEmail('');
                    setPassword('');
                    setConfirmPassword('');
                    setFullName('');
                    // Reset rate limiting
                    setCanRegister(true);
                    setTimeLeft(0);
                  }}
                >
                  {isRegistering ? 'Terug naar Login' : 'Nieuwe Admin Registreren'}
                </Button>
                
                <p className="text-sm text-gray-600 mb-3">Geen administrator account?</p>
                <Button 
                  variant="outline" 
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => navigate('/auth')}
                >
                  Normale Login
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-blue-200 text-sm">
            © 2024 Building Buddy - Administrator Portal
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;
