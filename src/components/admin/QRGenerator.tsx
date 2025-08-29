import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RefreshCw, Download, Maximize2, Users, Clock, ArrowLeft, Copy } from 'lucide-react';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useEventStore } from '@/stores/eventStore';

const QRGenerator = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { events, qrToken, qrExpiry, generateQR, rotateQR } = useEventStore();
  const [qrImageUrl, setQrImageUrl] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [attendanceCount, setAttendanceCount] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const event = events.find(e => e.id === eventId);

  useEffect(() => {
    if (eventId && !qrToken) {
      generateQRCode();
    }
  }, [eventId]);

  useEffect(() => {
    if (qrToken) {
      generateQRImage(qrToken);
    }
  }, [qrToken]);

  useEffect(() => {
    // Update countdown timer
    const timer = setInterval(() => {
      if (qrExpiry) {
        const now = new Date();
        const expiry = new Date(qrExpiry);
        const diff = expiry.getTime() - now.getTime();
        
        if (diff <= 0) {
          setTimeLeft('Expired');
        } else {
          const minutes = Math.floor(diff / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [qrExpiry]);

  // Simulate real-time attendance updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAttendanceCount(prev => prev + Math.floor(Math.random() * 3));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const generateQRCode = async () => {
    try {
      if (eventId) {
        await generateQR(eventId);
        toast({
          title: 'QR Code generated',
          description: 'New session started successfully.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate QR code.',
        variant: 'destructive',
      });
    }
  };

  const rotateQRCode = async () => {
    try {
      if (eventId) {
        await rotateQR(eventId);
        toast({
          title: 'QR Code rotated',
          description: 'New QR code generated for security.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to rotate QR code.',
        variant: 'destructive',
      });
    }
  };

  const generateQRImage = async (token: string) => {
    try {
      const qrData = JSON.stringify({
        eventId,
        token,
        timestamp: Date.now(),
      });

      const url = await QRCode.toDataURL(qrData, {
        width: 512,
        margin: 2,
        color: {
          dark: '#1F2937',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
      });

      setQrImageUrl(url);

      // Also generate on canvas for download
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, qrData, {
          width: 512,
          margin: 2,
        });
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const downloadQR = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `qr-${event?.title || 'event'}-${Date.now()}.jpg`;
      link.href = canvasRef.current.toDataURL('image/jpeg', 0.95);
      link.click();
    }
  };

  const downloadPDF = () => {
    if (!canvasRef.current) return;
    const imgData = canvasRef.current.toDataURL('imagePNG');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 40;
    const qrSize = pageWidth - margin * 2;
    pdf.setFontSize(18);
    pdf.text(event?.title || 'Event QR', margin, 40);
    pdf.addImage(imgData, 'PNG', margin, 60, qrSize, qrSize);
    pdf.save(`qr-${event?.title || 'event'}.pdf`);
  };

  const copySessionCode = () => {
    const sessionCode = qrToken?.slice(-6) || '123456';
    navigator.clipboard.writeText(sessionCode);
    toast({
      title: 'Copied!',
      description: 'Session code copied to clipboard.',
    });
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-surface flex items-center justify-center">
        <Card className="w-96 border-0 shadow-large">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Event not found</h3>
            <p className="text-muted-foreground mb-4">The requested event does not exist.</p>
            <Button onClick={() => navigate('/admin')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
        <div className="absolute top-4 right-4">
          <Button onClick={toggleFullscreen} variant="outline" size="sm">
            Exit Fullscreen
          </Button>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
          <p className="text-xl text-muted-foreground">{event.companyName}</p>
        </div>

        {qrImageUrl && (
          <div className="bg-white p-8 rounded-2xl shadow-large">
            <img 
              src={qrImageUrl} 
              alt="QR Code" 
              className="w-96 h-96 mx-auto"
            />
          </div>
        )}

        <div className="mt-8 text-center">
          <div className="text-2xl font-bold mb-2">
            {timeLeft === 'Expired' ? (
              <span className="text-destructive">Expired</span>
            ) : (
              <span className="text-primary">{timeLeft}</span>
            )}
          </div>
          <p className="text-muted-foreground">Time remaining</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin')}
            className="hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">QR Session</h1>
            <p className="text-muted-foreground">{event.title}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* QR Code Display */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-large">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Live QR Code</CardTitle>
                    <CardDescription>Students scan this code to mark attendance</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={rotateQRCode}
                      variant="outline"
                      size="sm"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Rotate
                    </Button>
                    <Button
                      onClick={downloadQR}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download JPEG
                    </Button>
                    <Button
                      onClick={downloadPDF}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button
                      onClick={toggleFullscreen}
                      variant="outline"
                      size="sm"
                    >
                      <Maximize2 className="h-4 w-4 mr-2" />
                      Fullscreen
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                {qrImageUrl ? (
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-medium inline-block">
                      <img 
                        src={qrImageUrl} 
                        alt="QR Code" 
                        className="w-80 h-80 mx-auto"
                      />
                    </div>
                    
                    <div className="flex items-center justify-center gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {timeLeft === 'Expired' ? (
                            <span className="text-destructive">Expired</span>
                          ) : (
                            <span className="text-primary">{timeLeft}</span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">Time left</div>
                      </div>
                      
                      <div className="h-12 w-px bg-border"></div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-secondary">
                          {qrToken?.slice(-6) || '123456'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={copySessionCode}
                            className="h-auto p-1"
                          >
                            Session Code <Copy className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12">
                    <div className="w-80 h-80 bg-muted rounded-xl mx-auto flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-muted-foreground">Generating QR Code...</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Event Info & Live Stats */}
          <div className="space-y-6">
            {/* Event Details */}
            <Card className="border-0 shadow-medium">
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold">{event.title}</h4>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>
                
                <div>
                  <h5 className="font-medium text-sm">Company</h5>
                  <p className="text-sm text-muted-foreground">{event.companyName}</p>
                </div>
                
                <div>
                  <h5 className="font-medium text-sm">Time</h5>
                  <p className="text-sm text-muted-foreground">
                    {new Date(event.startTime).toLocaleString()} - {new Date(event.endTime).toLocaleTimeString()}
                  </p>
                </div>
                
                <div>
                  <h5 className="font-medium text-sm">Location Radius</h5>
                  <p className="text-sm text-muted-foreground">{event.radiusMeters}m</p>
                </div>
              </CardContent>
            </Card>

            {/* Live Stats */}
            <Card className="border-0 shadow-medium">
              <CardHeader>
                <CardTitle>Live Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Current Attendance</span>
                  </div>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {attendanceCount}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Session Status</span>
                  </div>
                  <Badge className="bg-secondary text-secondary-foreground">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="border-0 shadow-medium">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => navigate(`/admin/events/${eventId}`)}
                  variant="outline"
                  className="w-full"
                >
                  View Event Details
                </Button>
                <Button
                  onClick={() => navigate(`/admin/analytics/${eventId}`)}
                  variant="outline"
                  className="w-full"
                >
                  View Analytics
                </Button>
                <Button
                  onClick={rotateQRCode}
                  className="w-full bg-gradient-primary hover:opacity-90"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate New QR
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Hidden canvas for download */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default QRGenerator;