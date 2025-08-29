import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, QrCode, User, Building, Calendar, Clock, FileText } from 'lucide-react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useVisitStore } from '@/stores/eventStore';
import { useAuthStore } from '@/stores/authStore';

const StudentQRDisplay = () => {
  const { visitId } = useParams<{ visitId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { visits } = useVisitStore();
  const { user } = useAuthStore();
  
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [uniqueCode, setUniqueCode] = useState<string>('');
  const [visit, setVisit] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (visitId) {
      const foundVisit = visits.find(v => v.id === visitId);
      if (foundVisit) {
        setVisit(foundVisit);
        generateQRCode(foundVisit);
        setIsLoading(false);
      } else {
        // If visit not found in store, try to load from mock data
        const mockVisit = {
          id: visitId,
          studentId: user?.id || '2',
          companyName: 'Company Name',
          visitDate: new Date().toISOString().split('T')[0],
          purpose: 'Industrial Visit Purpose',
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
          qrCode: `qr-${visitId}`,
        };
        setVisit(mockVisit);
        generateQRCode(mockVisit);
        setIsLoading(false);
      }
    }
  }, [visitId, visits, user]);

  const generateQRCode = async (visitData: any) => {
    try {
      // Generate 6-digit unique code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setUniqueCode(code);
      
      // Create QR data with student information
      const qrData = {
        visitId: visitData.id,
        studentId: visitData.studentId,
        studentName: user?.firstName + ' ' + user?.lastName,
        mobileNumber: user?.mobileNumber || '1234567890',
        companyName: visitData.companyName,
        visitDate: visitData.visitDate,
        purpose: visitData.purpose,
        uniqueCode: code,
        timestamp: new Date().toISOString(),
      };

      // Generate QR code
      const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeDataUrl(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate QR code',
        variant: 'destructive',
      });
    }
  };

  const downloadAsJPEG = () => {
    if (!qrCodeDataUrl) return;
    
    const link = document.createElement('a');
    link.download = `visit-qr-${visit?.companyName}-${uniqueCode}.jpg`;
    link.href = qrCodeDataUrl;
    link.click();
    
    toast({
      title: 'Downloaded!',
      description: 'QR code saved as JPEG',
    });
  };

  const downloadAsPDF = () => {
    if (!qrCodeDataUrl || !visit) return;
    
    const pdf = new jsPDF();
    
    // Add title
    pdf.setFontSize(20);
    pdf.text('Industrial Visit QR Code', 105, 20, { align: 'center' });
    
    // Add company info
    pdf.setFontSize(12);
    pdf.text(`Company: ${visit.companyName}`, 20, 40);
    pdf.text(`Date: ${visit.visitDate}`, 20, 50);
    pdf.text(`Purpose: ${visit.purpose}`, 20, 60);
    pdf.text(`Student: ${user?.firstName} ${user?.lastName}`, 20, 70);
    pdf.text(`Unique Code: ${uniqueCode}`, 20, 80);
    
    // Add QR code image
    pdf.addImage(qrCodeDataUrl, 'JPEG', 70, 90, 70, 70);
    
    // Add unique code below QR
    pdf.setFontSize(16);
    pdf.text(`Unique Code: ${uniqueCode}`, 105, 170, { align: 'center' });
    
    pdf.save(`visit-qr-${visit.companyName}-${uniqueCode}.pdf`);
    
    toast({
      title: 'Downloaded!',
      description: 'QR code saved as PDF',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Generating QR Code...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/student')}
          className="mb-6 hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code Section */}
          <Card className="shadow-large border-0">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                <QrCode className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Your Visit QR Code</CardTitle>
              <CardDescription>
                Show this QR code to company representatives for attendance
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              {/* QR Code Display */}
              <div className="flex justify-center">
                {qrCodeDataUrl && (
                  <div className="relative">
                    <img 
                      src={qrCodeDataUrl} 
                      alt="Visit QR Code" 
                      className="border-4 border-white shadow-lg rounded-lg"
                    />
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                      <Badge variant="secondary" className="text-lg px-4 py-2">
                        {uniqueCode}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              {/* Unique Code Display */}
              <div className="bg-accent/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">Unique 6-Digit Code:</p>
                <p className="text-3xl font-mono font-bold text-primary">{uniqueCode}</p>
              </div>

              {/* Download Buttons */}
              <div className="flex gap-3 justify-center">
                <Button onClick={downloadAsJPEG} variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Save as JPEG
                </Button>
                <Button onClick={downloadAsPDF} variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Save as PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Visit Details Section */}
          <Card className="shadow-large border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Visit Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Student:</span>
                  <span>{user?.firstName} {user?.lastName}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Company:</span>
                  <span>{visit?.companyName}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Date:</span>
                  <span>{visit?.visitDate}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Time:</span>
                  <span>
                    {new Date(visit?.startTime).toLocaleTimeString()} - {new Date(visit?.endTime).toLocaleTimeString()}
                  </span>
                </div>
                
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <span className="font-medium">Purpose:</span>
                    <p className="text-sm text-muted-foreground mt-1">{visit?.purpose}</p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <h4 className="font-semibold text-blue-900 mb-2">How to use this QR code:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Show this QR code to company representatives</li>
                  <li>They will scan it to mark your attendance</li>
                  <li>Keep the unique code handy for verification</li>
                  <li>After successful attendance, you'll be redirected to feedback form</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentQRDisplay;
