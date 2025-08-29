import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, selectedRole, clearStorage } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const success = await login(data.email, data.password);
      if (success) {
        toast({
          title: 'Welcome back!',
          description: 'You have been successfully logged in.',
        });
        
        // Redirect based on role
        if (selectedRole === 'STUDENT') {
          navigate('/student');
        } else if (selectedRole === 'ADMIN') {
          navigate('/admin');
        } else if (selectedRole === 'COMPANY') {
          navigate('/company');
        }
      } else {
        toast({
          title: 'Login failed',
          description: 'Invalid email or password. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const demoCredentials = {
    STUDENT: { email: 'student@intrack.app', password: 'Student@123' },
    ADMIN: { email: 'admin@intrack.app', password: 'Admin@123' },
    COMPANY: { email: 'company@intrack.app', password: 'Company@123' },
  };

  const roleCredentials = selectedRole ? demoCredentials[selectedRole] : null;

  return (
    <div className="min-h-screen bg-gradient-surface flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to role selection
        </Button>

        <Card className="shadow-large border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>
              Sign in to your {selectedRole?.toLowerCase().replace('_', ' ')} account
            </CardDescription>
          </CardHeader>
          <CardContent>
                         {roleCredentials && (
               <div className="mb-6 p-4 bg-accent rounded-lg">
                 <p className="text-sm font-medium text-accent-foreground mb-2">Demo Credentials:</p>
                 <div className="space-y-1 text-xs text-muted-foreground">
                   <div>Email: {roleCredentials.email}</div>
                   <div>Password: {roleCredentials.password}</div>
                 </div>
                 <p className="text-xs text-muted-foreground mt-2 italic">
                   Note: Password must contain the role name (e.g., "Student", "Admin", "Company")
                 </p>
               </div>
             )}

                         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
               <Button
                 type="button"
                 variant="outline"
                 onClick={() => {
                   clearStorage();
                   toast({
                     title: 'Storage cleared',
                     description: 'Please try logging in again.',
                   });
                 }}
                 className="w-full mb-4"
               >
                 Clear Storage & Retry
               </Button>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register('email')}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    {...register('password')}
                    className={errors.password ? 'border-destructive' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-primary hover:underline font-medium"
                >
                  Create one
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;