import { useState, useRef, useEffect } from 'react';
import { Camera, MapPin, Upload, Smartphone, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useVisitStore } from '@/stores/eventStore';
import { useNavigate } from 'react-router-dom';

const QRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'requesting' | 'success' | 'error'>('idle');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [manualCode, setManualCode] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const { checkIn } = useVisitStore();
  const navigate = useNavigate();

  const requestGPS = async () => {
    setGpsStatus('requesting');
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        });
      });
      
      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      setGpsStatus('success');
      
      toast({
        title: 'Location found',
        description: 'GPS coordinates acquired successfully.',
      });
    } catch (error) {
      setGpsStatus('error');
      toast({
        title: 'Location error',
        description: 'Unable to get your location. Please enable GPS and try again.',
        variant: 'destructive',
      });
    }
  };

  const startCamera = async () => {
    try {
      setScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      toast({
        title: 'Camera ready',
        description: 'Point your camera at the QR code to scan.',
      });
    } catch (error) {
      setScanning(false);
      toast({
        title: 'Camera error',
        description: 'Unable to access camera. Please check permissions.',
        variant: 'destructive',
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setScanning(false);
  };

  const handleQRDetected = async (qrCode: string) => {
    if (!location) {
      toast({
        title: 'Location required',
        description: 'Please enable GPS first to verify your location.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const success = await checkIn(qrCode, location.lat, location.lng);
      
      if (success) {
        stopCamera();
        toast({
          title: 'Check-in successful!',
          description: 'Your attendance has been recorded.',
        });
        
        // Navigate to feedback form
        // Try to extract visitId and forward to visit-specific feedback
        try {
          const parsed = JSON.parse(qrCode);
          if (parsed?.visitId) {
            setTimeout(() => navigate(`/student/feedback/${parsed.visitId}`), 1200);
            return;
          }
        } catch {}
        setTimeout(() => navigate('/student/feedback/new'), 1200);
      } else {
        toast({
          title: 'Outside allowed location or time',
          description: 'You are not within the set location radius or session is not active.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred during check-in. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleManualSubmit = () => {
    if (!manualCode.trim()) {
      toast({
        title: 'Code required',
        description: 'Please enter the session code.',
        variant: 'destructive',
      });
      return;
    }
    
    handleQRDetected(manualCode);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // In a real app, you would decode the QR from the image
    // For demo purposes, we'll simulate a successful scan
    toast({
      title: 'QR code detected',
      description: 'Processing QR code from uploaded image...',
    });
    
    setTimeout(() => {
      handleQRDetected('demo-qr-code-from-image');
    }, 2000);
  };

  // Simulate QR detection for demo
  useEffect(() => {
    if (scanning && location) {
      const timer = setTimeout(() => {
        // Simulate QR code detection
        handleQRDetected('demo-qr-code-12345');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [scanning, location]);

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Scan QR Code</h1>
          <p className="text-muted-foreground">
            Mark your attendance by scanning the event QR code
          </p>
        </div>

        {/* GPS Status */}
        <Card className="mb-6 border-0 shadow-medium">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className={`h-5 w-5 ${gpsStatus === 'success' ? 'text-secondary' : 'text-muted-foreground'}`} />
                <div>
                  <h3 className="font-semibold">Location Verification</h3>
                  <p className="text-sm text-muted-foreground">
                    {gpsStatus === 'success' ? 'Location acquired' : 'GPS required for attendance'}
                  </p>
                </div>
              </div>
              
              {gpsStatus === 'success' ? (
                <CheckCircle className="h-6 w-6 text-secondary" />
              ) : (
                <Button
                  onClick={requestGPS}
                  disabled={gpsStatus === 'requesting'}
                  variant="outline"
                  size="sm"
                >
                  {gpsStatus === 'requesting' ? 'Getting location...' : 'Enable GPS'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Scanning Interface */}
        <Tabs defaultValue="camera" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="camera">Camera</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
          </TabsList>

          <TabsContent value="camera">
            <Card className="border-0 shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Camera Scanner
                </CardTitle>
                <CardDescription>
                  Use your device camera to scan the QR code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!scanning ? (
                  <div className="text-center py-12">
                    <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Ready to scan</h3>
                    <p className="text-muted-foreground mb-6">
                      Make sure you have GPS enabled first
                    </p>
                    <Button
                      onClick={startCamera}
                      disabled={gpsStatus !== 'success'}
                      className="bg-gradient-primary hover:opacity-90"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Start Camera
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative bg-black rounded-lg overflow-hidden">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white rounded-lg"></div>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Button onClick={stopCamera} variant="outline">
                        Stop Camera
                      </Button>
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                      Position the QR code within the frame. Detection will happen automatically.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload">
            <Card className="border-0 shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload QR Image
                </CardTitle>
                <CardDescription>
                  Upload a screenshot or photo of the QR code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <Label htmlFor="qr-upload" className="cursor-pointer">
                    <span className="text-lg font-semibold text-primary">Click to upload</span>
                    <br />
                    <span className="text-sm text-muted-foreground">or drag and drop</span>
                  </Label>
                  <Input
                    id="qr-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
                {gpsStatus !== 'success' && (
                  <div className="flex items-center gap-2 text-sm text-amber-600">
                    <AlertTriangle className="h-4 w-4" />
                    Enable GPS first to verify your location
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual">
            <Card className="border-0 shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Manual Entry
                </CardTitle>
                <CardDescription>
                  Enter the 6-digit session code manually
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="manual-code">Session Code</Label>
                  <Input
                    id="manual-code"
                    placeholder="Enter 6-digit code"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    maxLength={6}
                    className="text-center text-lg font-mono"
                  />
                </div>
                <Button
                  onClick={handleManualSubmit}
                  disabled={gpsStatus !== 'success' || !manualCode.trim()}
                  className="w-full bg-gradient-primary hover:opacity-90"
                >
                  Submit Code
                </Button>
                {gpsStatus !== 'success' && (
                  <div className="flex items-center gap-2 text-sm text-amber-600">
                    <AlertTriangle className="h-4 w-4" />
                    Enable GPS first to verify your location
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default QRScanner;