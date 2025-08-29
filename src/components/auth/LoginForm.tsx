import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, Sparkles } from 'lucide-react';

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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Floating particles for background
    const particles: Array<{x: number, y: number, vx: number, vy: number, size: number, opacity: number, color: string}> = [];
    for (let i = 0; i < 60; i++) {
      const colors = [
        'hsla(238, 54%, 55%, 0.4)',
        'hsla(160, 84%, 39%, 0.4)',
        'hsla(238, 64%, 70%, 0.4)',
        'hsla(160, 74%, 50%, 0.4)'
      ];
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.6 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    // Floating geometric shapes
    const shapes = [
      { x: 100, y: 100, size: 30, rotation: 0, speed: 0.02, type: 'circle' },
      { x: canvas.width - 150, y: 80, size: 25, rotation: 0, speed: 0.03, type: 'square' },
      { x: 200, y: canvas.height - 120, size: 35, rotation: 0, speed: 0.025, type: 'triangle' },
      { x: canvas.width - 200, y: canvas.height - 100, size: 28, rotation: 0, speed: 0.035, type: 'circle' },
    ];

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Enhanced gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'hsl(238, 100%, 98%)');
      gradient.addColorStop(0.3, 'hsl(215, 100%, 97%)');
      gradient.addColorStop(0.7, 'hsl(238, 100%, 96%)');
      gradient.addColorStop(1, 'hsl(215, 100%, 95%)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle grid pattern
      ctx.strokeStyle = 'hsla(238, 54%, 55%, 0.02)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Update and draw particles
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Update and draw shapes
      shapes.forEach(shape => {
        shape.rotation += shape.speed;
        
        ctx.save();
        ctx.translate(shape.x, shape.y);
        ctx.rotate(shape.rotation);
        
        // Floating animation
        const floatOffset = Math.sin(Date.now() * 0.001 + shape.x * 0.01) * 4;
        ctx.translate(0, floatOffset);
        
        switch (shape.type) {
          case 'circle':
            ctx.fillStyle = 'hsla(238, 54%, 55%, 0.1)';
            ctx.beginPath();
            ctx.arc(0, 0, shape.size, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 'square':
            ctx.fillStyle = 'hsla(160, 84%, 39%, 0.1)';
            ctx.fillRect(-shape.size, -shape.size, shape.size * 2, shape.size * 2);
            break;
          case 'triangle':
            ctx.fillStyle = 'hsla(238, 64%, 70%, 0.1)';
            ctx.beginPath();
            ctx.moveTo(0, -shape.size);
            ctx.lineTo(-shape.size, shape.size);
            ctx.lineTo(shape.size, shape.size);
            ctx.closePath();
            ctx.fill();
            break;
        }
        
        ctx.restore();
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
        style={{ background: 'transparent' }}
      />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Enhanced Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-8 hover:bg-white/20 hover:text-white transition-all duration-300 backdrop-blur-sm bg-white/10 text-foreground rounded-full px-6 py-3 group"
          >
            <ArrowLeft className="h-5 w-5 mr-3 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to role selection
          </Button>

          {/* Enhanced Login Card */}
          <Card className="shadow-2xl border-0 backdrop-blur-enhanced bg-white/90 hover:bg-white/95 transition-all duration-500 transform hover:scale-[1.02]">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold gradient-text-animated">Welcome back</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Sign in to your {selectedRole?.toLowerCase().replace('_', ' ')} account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Demo Credentials */}
              {roleCredentials && (
                <div className="p-4 bg-gradient-to-r from-accent to-accent/50 rounded-xl border border-accent/20 shadow-lg">
                  <p className="text-sm font-semibold text-accent-foreground mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Demo Credentials
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Email:</span>
                      <span className="font-mono bg-white/50 px-2 py-1 rounded">{roleCredentials.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Password:</span>
                      <span className="font-mono bg-white/50 px-2 py-1 rounded">{roleCredentials.password}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 italic">
                    Note: Password must contain the role name
                  </p>
                </div>
              )}

              {/* Clear Storage Button */}
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
                className="w-full hover:bg-destructive hover:text-destructive-foreground transition-all duration-300"
              >
                Clear Storage & Retry
              </Button>

              {/* Login Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-base font-semibold">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    {...register('email')}
                    className={`h-12 text-base transition-all duration-300 focus:scale-[1.02] focus:shadow-lg ${
                      errors.email ? 'border-destructive ring-destructive/20' : 'border-muted focus:border-primary'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive animate-pulse">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="password" className="text-base font-semibold">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      {...register('password')}
                      className={`h-12 text-base pr-12 transition-all duration-300 focus:scale-[1.02] focus:shadow-lg ${
                        errors.password ? 'border-destructive ring-destructive/20' : 'border-muted focus:border-primary'
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent hover:scale-110 transition-transform duration-200"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Eye className="h-5 w-5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive animate-pulse">{errors.password.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg btn-3d-hover"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </form>

              {/* Register Link */}
              <div className="text-center pt-4">
                <p className="text-base text-muted-foreground">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="text-primary hover:text-primary/80 font-semibold hover:underline transition-all duration-300"
                  >
                    Create one
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;