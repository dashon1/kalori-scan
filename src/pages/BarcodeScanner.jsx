import React, { useState, useRef, useEffect } from "react";
import { InvokeLLM } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Scan, Search, Package, Camera, X, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function BarcodeScanner() {
  const [barcode, setBarcode] = useState("");
  const [productInfo, setProductInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      setStream(mediaStream);
      setIsCameraOpen(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Camera access denied. Please enable camera permissions and try again.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const captureAndScanBarcode = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (blob) {
        try {
          setIsLoading(true);
          setError(null);
          
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64 = reader.result;
            
            const prompt = `
              Analyze this image and detect any barcodes or QR codes.
              Look for UPC barcodes, EAN barcodes, or QR codes.
              If you find a barcode, extract the number sequence.
              If you can't find a clear barcode, suggest the user try again with better lighting or positioning.
            `;

            try {
              const result = await InvokeLLM({
                prompt,
                file_urls: [base64],
                response_json_schema: {
                  type: "object",
                  properties: {
                    barcode_detected: { type: "boolean" },
                    barcode_number: { type: "string" },
                    barcode_type: { type: "string" },
                    confidence: { type: "number" },
                    suggestion: { type: "string" }
                  }
                }
              });

              if (result.barcode_detected && result.barcode_number) {
                setBarcode(result.barcode_number);
                stopCamera();
                await handleBarcodeSearch(result.barcode_number);
              } else {
                setError(result.suggestion || "No barcode detected. Please try again with better lighting and positioning.");
              }
            } catch (aiError) {
              console.error("AI barcode detection failed:", aiError);
              setError("Failed to detect barcode. Please try entering the number manually.");
            }
          };
          reader.readAsDataURL(blob);
        } catch (error) {
          console.error("Barcode capture failed:", error);
          setError("Failed to capture barcode. Please try again.");
        }
        setIsLoading(false);
      }
    }, 'image/jpeg', 0.8);
  };

  const handleBarcodeSearch = async (barcodeNumber = barcode) => {
    if (!barcodeNumber.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const prompt = `
        Look up nutritional information for a product with barcode: ${barcodeNumber}
        
        Search for this barcode and provide:
        1. Product name and brand
        2. Serving size information
        3. Complete nutritional breakdown per serving
        4. Key vitamins and minerals
        5. Ingredients list (if available)
        6. Health score (1-10)
        7. Allergen information
        
        Format the response clearly and organized.
      `;

      const result = await InvokeLLM({ 
        prompt,
        add_context_from_internet: true 
      });

      setProductInfo(result);
    } catch (error) {
      console.error("Barcode lookup failed:", error);
      setError("Failed to look up product information. Please check your internet connection and try again.");
    }
    
    setIsLoading(false);
  };

  const resetScanner = () => {
    setBarcode("");
    setProductInfo(null);
    setError(null);
    stopCamera();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Camera View */}
      {isCameraOpen ? (
        <div className="relative h-screen flex flex-col">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={stopCamera}
              className="rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md"
            >
              <X className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">Scanner</h1>
            <div className="w-10"></div>
          </div>

          {/* Camera Feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Scanning Frame */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-32 border-4 border-white border-dashed rounded-lg bg-black/20">
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-white text-sm text-center px-4">
                  Position barcode within this frame
                </p>
              </div>
            </div>
          </div>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4 z-30">
              <Loader2 className="w-12 h-12 animate-spin text-white" />
              <p className="text-lg font-semibold">Scanning barcode...</p>
            </div>
          )}

          {/* Scan Button */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
            <Button
              onClick={captureAndScanBarcode}
              disabled={isLoading}
              className="bg-white text-black rounded-full w-20 h-20 p-0 shadow-lg hover:scale-105 transition-transform"
            >
              <Scan className="w-8 h-8" />
            </Button>
          </div>

          {/* Hidden canvas for image capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      ) : (
        // Regular Interface
        <div className="min-h-screen p-4 bg-gradient-to-br from-slate-50 to-blue-50 text-gray-900">
          <div className="max-w-md mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Link to={createPageUrl("Home")}>
                <Button variant="outline" size="icon" className="rounded-full">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Barcode Scanner</h1>
                <p className="text-gray-600 text-sm">Scan packaged foods instantly</p>
              </div>
            </div>

            {/* Scanner Interface */}
            <Card className="glass-effect border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Scan className="w-8 h-8 text-white" />
                </div>
                <CardTitle>Scan or Enter Barcode</CardTitle>
                <p className="text-sm text-gray-600">
                  Get instant nutrition info for packaged foods
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Input
                    placeholder="Enter barcode number..."
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="text-center text-lg font-mono"
                  />
                  <Button
                    onClick={() => handleBarcodeSearch()}
                    disabled={!barcode.trim() || isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Look Up Product
                      </>
                    )}
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                  </div>
                </div>

                <Button
                  onClick={startCamera}
                  variant="outline"
                  className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                  disabled={!navigator.mediaDevices || isLoading}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Open Camera Scanner
                </Button>
              </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
              <Card className="glass-effect border-0 shadow-lg border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-800 text-sm font-medium mb-2">{error}</p>
                      <Button
                        onClick={resetScanner}
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-700 hover:bg-red-100"
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Product Information */}
            {productInfo && (
              <Card className="glass-effect border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-purple-600" />
                      Product Information
                    </CardTitle>
                    <Button
                      onClick={resetScanner}
                      variant="outline"
                      size="sm"
                    >
                      Scan Another
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                      {productInfo}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}