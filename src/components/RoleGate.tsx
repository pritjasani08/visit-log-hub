
import { useNavigate } from 'react-router-dom';
import { Building, GraduationCap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import { useEffect, useRef } from 'react';

const RoleGate = () => {
  const navigate = useNavigate();
  const { setSelectedRole } = useAuthStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Enhanced 3D Objects data with more variety
    const objects = [
      { x: 100, y: 150, size: 60, rotation: 0, speed: 0.02, type: 'cube', color: 'hsla(238, 54%, 55%, 0.4)' },
      { x: 300, y: 80, size: 40, rotation: 0, speed: 0.03, type: 'sphere', color: 'hsla(160, 84%, 39%, 0.4)' },
      { x: 500, y: 200, size: 50, rotation: 0, speed: 0.025, type: 'pyramid', color: 'hsla(238, 54%, 55%, 0.4)' },
      { x: 700, y: 120, size: 45, rotation: 0, speed: 0.035, type: 'cube', color: 'hsla(160, 84%, 39%, 0.4)' },
      { x: 900, y: 180, size: 55, rotation: 0, speed: 0.028, type: 'sphere', color: 'hsla(238, 54%, 55%, 0.4)' },
      { x: 1100, y: 90, size: 35, rotation: 0, speed: 0.04, type: 'pyramid', color: 'hsla(160, 84%, 39%, 0.4)' },
      { x: 1300, y: 160, size: 65, rotation: 0, speed: 0.022, type: 'cube', color: 'hsla(238, 54%, 55%, 0.4)' },
      { x: 1500, y: 110, size: 42, rotation: 0, speed: 0.032, type: 'sphere', color: 'hsla(160, 84%, 39%, 0.4)' },
      { x: 200, y: 300, size: 30, rotation: 0, speed: 0.045, type: 'pyramid', color: 'hsla(160, 84%, 39%, 0.4)' },
      { x: 400, y: 350, size: 35, rotation: 0, speed: 0.038, type: 'cube', color: 'hsla(238, 54%, 55%, 0.4)' },
      { x: 600, y: 280, size: 25, rotation: 0, speed: 0.042, type: 'sphere', color: 'hsla(160, 84%, 39%, 0.4)' },
      { x: 800, y: 320, size: 40, rotation: 0, speed: 0.035, type: 'pyramid', color: 'hsla(238, 54%, 55%, 0.4)' },
    ];

    // Enhanced particles with different sizes and colors
    const particles: Array<{x: number, y: number, vx: number, vy: number, size: number, opacity: number, color: string}> = [];
    for (let i = 0; i < 80; i++) {
      const colors = [
        'hsla(238, 54%, 55%, 0.6)',
        'hsla(160, 84%, 39%, 0.6)',
        'hsla(238, 64%, 70%, 0.6)',
        'hsla(160, 74%, 50%, 0.6)'
      ];
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 4 + 1,
        opacity: Math.random() * 0.7 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    // Animation loop with enhanced effects
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Enhanced gradient background with multiple layers
      const gradient1 = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient1.addColorStop(0, 'hsl(238, 100%, 99%)');
      gradient1.addColorStop(0.25, 'hsl(215, 100%, 98%)');
      gradient1.addColorStop(0.5, 'hsl(238, 100%, 97%)');
      gradient1.addColorStop(0.75, 'hsl(215, 100%, 96%)');
      gradient1.addColorStop(1, 'hsl(238, 100%, 95%)');
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add subtle pattern overlay
      ctx.strokeStyle = 'hsla(238, 54%, 55%, 0.03)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Update and draw enhanced particles
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Add glow effect
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        
        ctx.shadowBlur = 0;
      });

      // Update and draw enhanced 3D objects
      objects.forEach(obj => {
        obj.rotation += obj.speed;
        
        ctx.save();
        ctx.translate(obj.x, obj.y);
        ctx.rotate(obj.rotation);
        
        // Add floating animation
        const floatOffset = Math.sin(Date.now() * 0.001 + obj.x * 0.01) * 3;
        ctx.translate(0, floatOffset);
        
        // Draw different 3D shapes with enhanced effects
        switch (obj.type) {
          case 'cube':
            drawEnhancedCube(ctx, obj.size, obj.color);
            break;
          case 'sphere':
            drawEnhancedSphere(ctx, obj.size, obj.color);
            break;
          case 'pyramid':
            drawEnhancedPyramid(ctx, obj.size, obj.color);
            break;
        }
        
        ctx.restore();
      });

      requestAnimationFrame(animate);
    };

    // Enhanced 3D Drawing functions
    const drawEnhancedCube = (ctx: CanvasRenderingContext2D, size: number, color: string) => {
      const half = size / 2;
      
      // Add shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;
      
      // Front face with gradient
      const frontGradient = ctx.createLinearGradient(-half, -half, half, half);
      frontGradient.addColorStop(0, color);
      frontGradient.addColorStop(1, color.replace('0.4', '0.8'));
      
      ctx.fillStyle = frontGradient;
      ctx.fillRect(-half, -half, size, size);
      
      // Back face (offset)
      ctx.fillStyle = color.replace('0.4', '0.2');
      ctx.fillRect(-half + 8, -half + 8, size, size);
      
      // Connecting lines with glow
      ctx.shadowBlur = 0;
      ctx.strokeStyle = color.replace('0.4', '0.8');
      ctx.lineWidth = 3;
      
      ctx.beginPath();
      ctx.moveTo(-half, -half);
      ctx.lineTo(-half + 8, -half + 8);
      ctx.moveTo(half, -half);
      ctx.lineTo(half + 8, -half + 8);
      ctx.moveTo(half, half);
      ctx.lineTo(half + 8, half + 8);
      ctx.moveTo(-half, half);
      ctx.lineTo(-half + 8, half + 8);
      ctx.stroke();
    };

    const drawEnhancedSphere = (ctx: CanvasRenderingContext2D, size: number, color: string) => {
      // Add shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
      gradient.addColorStop(0, color.replace('0.4', '0.8'));
      gradient.addColorStop(0.7, color);
      gradient.addColorStop(1, color.replace('0.4', '0.1'));
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Add highlight
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'hsla(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(-size/6, -size/6, size/8, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = color.replace('0.4', '0.9');
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      ctx.stroke();
    };

    const drawEnhancedPyramid = (ctx: CanvasRenderingContext2D, size: number, color: string) => {
      const half = size / 2;
      
      // Add shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 4;
      
      // Base with gradient
      const baseGradient = ctx.createLinearGradient(-half, half, half, half);
      baseGradient.addColorStop(0, color);
      baseGradient.addColorStop(1, color.replace('0.4', '0.7'));
      
      ctx.fillStyle = baseGradient;
      ctx.beginPath();
      ctx.moveTo(-half, half);
      ctx.lineTo(half, half);
      ctx.lineTo(half, half);
      ctx.lineTo(-half, half);
      ctx.closePath();
      ctx.fill();
      
      // Sides with gradient
      const sideGradient = ctx.createLinearGradient(0, -half, 0, half);
      sideGradient.addColorStop(0, color.replace('0.4', '0.9'));
      sideGradient.addColorStop(1, color);
      
      ctx.fillStyle = sideGradient;
      ctx.beginPath();
      ctx.moveTo(0, -half);
      ctx.lineTo(-half, half);
      ctx.lineTo(half, half);
      ctx.closePath();
      ctx.fill();
      
      // Add edges
      ctx.shadowBlur = 0;
      ctx.strokeStyle = color.replace('0.4', '0.9');
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    animate();

    // Handle resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleRoleSelect = (role: 'STUDENT' | 'ADMIN' | 'COMPANY') => {
    setSelectedRole(role);
    navigate('/login');
  };

  const roles = [
    {
      id: 'STUDENT',
      title: 'Student',
      description: 'Create industrial visits and manage your attendance',
      icon: GraduationCap,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      features: [
        'Create industrial visits',
        'Generate QR codes',
        'Track attendance',
        'Submit feedback'
      ]
    },
    {
      id: 'COMPANY',
      title: 'Company',
      description: 'Scan QR codes to mark student attendance',
      icon: Building,
      color: 'text-green-600',
      bg: 'bg-green-50',
      features: [
        'Scan QR codes',
        'Mark students present',
        'View visit details',
        'Track attendance'
      ]
    },
    {
      id: 'ADMIN',
      title: 'Admin',
      description: 'Monitor analytics and performance metrics',
      icon: Shield,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      features: [
        'View attendance analytics',
        'Monitor performance',
        'Sentiment analysis',
        'Generate reports'
      ]
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Enhanced 3D Background Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
        style={{ background: 'transparent' }}
      />
      
      {/* Content with enhanced styling */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          {/* Enhanced Header */}
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-8xl font-black gradient-text-animated mb-8 glow-text">
              InTrack
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed shadow-text">
              Choose your role to access the industrial visit management system
          </p>
        </div>

          {/* Enhanced Role Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {roles.map((role, index) => {
            const Icon = role.icon;
            return (
              <Card 
                  key={role.id} 
                  className="border-0 shadow-large hover:shadow-xl transition-all duration-500 cursor-pointer group backdrop-blur-enhanced bg-white/90 hover:bg-white/95 card-3d-hover"
                  onClick={() => handleRoleSelect(role.id as 'STUDENT' | 'ADMIN' | 'COMPANY')}
                  style={{
                    animationDelay: `${index * 0.2}s`
                  }}
                >
                  <CardHeader className="text-center pb-6">
                    <div className={`mx-auto w-24 h-24 ${role.bg} rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg icon-float`}>
                      <Icon className={`h-12 w-12 ${role.color}`} />
                  </div>
                    <CardTitle className="text-3xl font-bold text-gradient">{role.title}</CardTitle>
                    <CardDescription className="text-lg">
                      {role.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4 mb-8">
                      {role.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-4 text-base text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                          <div className="w-3 h-3 bg-gradient-to-r from-primary to-secondary rounded-full particle-glow"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  <Button 
                      className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-bold py-4 text-xl transition-all duration-500 transform hover:scale-105 shadow-lg btn-3d-hover"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRoleSelect(role.id as 'STUDENT' | 'ADMIN' | 'COMPANY');
                      }}
                    >
                      Continue as {role.title}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleGate;
