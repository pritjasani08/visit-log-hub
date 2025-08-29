import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, UserPlus, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { Role } from '@/types';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['STUDENT', 'ADMIN', 'COMPANY']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser, selectedRole } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Floating particles for background
    const particles: Array<{x: number, y: number, vx: number, vy: number, size: number, opacity: number, color: string}> = [];
    for (let i = 0; i < 70; i++) {
      const colors = [
        'hsla(160, 84%, 39%, 0.4)',
        'hsla(238, 54%, 55%, 0.4)',
        'hsla(160, 74%, 50%, 0.4)',
        'hsla(238, 64%, 70%, 0.4)'
      ];
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        size: Math.random() * 4 + 1,
        opacity: Math.random() * 0.7 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    // Floating geometric shapes
    const shapes = [
      { x: 150, y: 120, size: 32, rotation: 0, speed: 0.025, type: 'diamond' },
      { x: canvas.width - 180, y: 100, size: 28, rotation: 0, speed: 0.035, type: 'hexagon' },
      { x: 250, y: canvas.height - 150, size: 38, rotation: 0, speed: 0.03, type: 'star' },
      { x: canvas.width - 250, y: canvas.height - 120, size: 30, rotation: 0, speed: 0.04, type: 'diamond' },
      { x: canvas.width / 2, y: 80, size: 25, rotation: 0, speed: 0.02, type: 'circle' },
    ];

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Enhanced gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'hsl(160, 100%, 98%)');
      gradient.addColorStop(0.25, 'hsl(215, 100%, 97%)');
      gradient.addColorStop(0.5, 'hsl(238, 100%, 96%)');
      gradient.addColorStop(0.75, 'hsl(160, 100%, 95%)');
      gradient.addColorStop(1, 'hsl(215, 100%, 94%)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle grid pattern
      ctx.strokeStyle = 'hsla(160, 84%, 39%, 0.02)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 60) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 60) {
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
        ctx.shadowBlur = 10;
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
        const floatOffset = Math.sin(Date.now() * 0.001 + shape.x * 0.01) * 5;
        ctx.translate(0, floatOffset);
        
        switch (shape.type) {
          case 'circle':
            ctx.fillStyle = 'hsla(160, 84%, 39%, 0.1)';
            ctx.beginPath();
            ctx.arc(0, 0, shape.size, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 'diamond':
            ctx.fillStyle = 'hsla(238, 54%, 55%, 0.1)';
            ctx.beginPath();
            ctx.moveTo(0, -shape.size);
            ctx.lineTo(shape.size, 0);
            ctx.lineTo(0, shape.size);
            ctx.lineTo(-shape.size, 0);
            ctx.closePath();
            ctx.fill();
            break;
          case 'hexagon':
            ctx.fillStyle = 'hsla(160, 74%, 50%, 0.1)';
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
              const angle = (i * Math.PI) / 3;
              const x = Math.cos(angle) * shape.size;
              const y = Math.sin(angle) * shape.size;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            break;
          case 'star':
            ctx.fillStyle = 'hsla(238, 64%, 70%, 0.1)';
            ctx.beginPath();
            for (let i = 0; i < 10; i++) {
              const angle = (i * Math.PI) / 5;
              const radius = i % 2 === 0 ? shape.size : shape.size * 0.5;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
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
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: selectedRole || 'STUDENT',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const success = await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: data.role,
      });

      if (success) {
        toast({
          title: 'Account created!',
          description: 'Your account has been successfully created.',
        });
        
        // Redirect based on role
        if (data.role === 'STUDENT') {
          navigate('/student');
        } else if (data.role === 'ADMIN') {
          navigate('/admin');
        } else if (data.role === 'COMPANY') {
          navigate('/company');
        }
      } else {
        toast({
          title: 'Registration failed',
          description: 'Please try again with different details.',
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

          {/* Enhanced Register Card */}
          <Card className="shadow-2xl border-0 backdrop-blur-enhanced bg-white/90 hover:bg-white/95 transition-all duration-500 transform hover:scale-[1.02]">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center mb-4 shadow-lg">
                <UserPlus className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold gradient-text-animated">Create Account</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Join InTrack and start managing attendance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="firstName" className="text-base font-semibold">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      {...register('firstName')}
                      className={`h-12 text-base transition-all duration-300 focus:scale-[1.02] focus:shadow-lg ${
                        errors.firstName ? 'border-destructive ring-destructive/20' : 'border-muted focus:border-secondary'
                      }`}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-destructive animate-pulse">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="lastName" className="text-base font-semibold">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      {...register('lastName')}
                      className={`h-12 text-base transition-all duration-300 focus:scale-[1.02] focus:shadow-lg ${
                        errors.lastName ? 'border-destructive ring-destructive/20' : 'border-muted focus:border-secondary'
                      }`}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-destructive animate-pulse">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-base font-semibold">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    {...register('email')}
                    className={`h-12 text-base transition-all duration-300 focus:scale-[1.02] focus:shadow-lg ${
                      errors.email ? 'border-destructive ring-destructive/20' : 'border-muted focus:border-secondary'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive animate-pulse">{errors.email.message}</p>
                  )}
                </div>

                {/* Role Field */}
                <div className="space-y-3">
                  <Label htmlFor="role" className="text-base font-semibold">Role</Label>
                  <Select
                    defaultValue={selectedRole || 'STUDENT'}
                    onValueChange={(value: Role) => setValue('role', value)}
                  >
                    <SelectTrigger className="h-12 text-base transition-all duration-300 focus:scale-[1.02] focus:shadow-lg">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STUDENT">Student</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="COMPANY">Company</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-destructive animate-pulse">{errors.role.message}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-base font-semibold">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      {...register('password')}
                      className={`h-12 text-base pr-12 transition-all duration-300 focus:scale-[1.02] focus:shadow-lg ${
                        errors.password ? 'border-destructive ring-destructive/20' : 'border-muted focus:border-secondary'
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
                  <div className="p-3 bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-lg border border-secondary/20">
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <Sparkles className="h-3 w-3" />
                      Password must contain your role name (e.g., "Student", "Admin", "Company")
                    </p>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive animate-pulse">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-3">
                  <Label htmlFor="confirmPassword" className="text-base font-semibold">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      {...register('confirmPassword')}
                      className={`h-12 text-base pr-12 transition-all duration-300 focus:scale-[1.02] focus:shadow-lg ${
                        errors.confirmPassword ? 'border-destructive ring-destructive/20' : 'border-muted focus:border-secondary'
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent hover:scale-110 transition-transform duration-200"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Eye className="h-5 w-5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive animate-pulse">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 text-white font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg btn-3d-hover"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating account...
                    </div>
                  ) : (
                    'Create account'
                  )}
                </Button>
              </form>

              {/* Login Link */}
              <div className="text-center pt-4">
                <p className="text-base text-muted-foreground">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-secondary hover:text-secondary/80 font-semibold hover:underline transition-all duration-300"
                  >
                    Sign in
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

export default RegisterForm;