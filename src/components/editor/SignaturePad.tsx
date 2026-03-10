import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useCV } from '@/context/CVContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Eraser, Check, PenTool, CalendarDays } from 'lucide-react';

const SignaturePad: React.FC = () => {
  const { cvData, updatePersonalInfo, updateTheme } = useCV();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const signatureColor = cvData.theme.signatureColor || '#000000';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = signatureColor;

    // Redraw existing signature
    if (cvData.personalInfo.signatureUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.offsetWidth, canvas.offsetHeight);
        setHasDrawn(true);
      };
      img.src = cvData.personalInfo.signatureUrl;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = signatureColor;
    }
  }, [signatureColor]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    updatePersonalInfo('signatureUrl', '');
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    updatePersonalInfo('signatureUrl', dataUrl);
  };

  const { theme } = cvData;

  return (
    <div className="space-y-3 pt-4 border-t border-border">
      {/* Toggles for signature & date */}
      <div className="space-y-2 bg-muted/30 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PenTool className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm">Afficher la signature</Label>
          </div>
          <Switch
            checked={theme.showSignature || false}
            onCheckedChange={(checked) => updateTheme('showSignature', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm">Date de mise à jour</Label>
          </div>
          <Switch
            checked={theme.showLastUpdated || false}
            onCheckedChange={(checked) => updateTheme('showLastUpdated', checked)}
          />
        </div>
      </div>

      {/* Signature pad header */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
          <PenTool className="h-4 w-4" />
          Dessiner la signature
        </Label>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Couleur</Label>
          <Input
            type="color"
            value={signatureColor}
            onChange={(e) => updateTheme('signatureColor', e.target.value)}
            className="w-8 h-8 p-0.5 rounded cursor-pointer"
          />
        </div>
      </div>

      <div className="relative rounded-lg border-2 border-dashed border-border bg-muted/20 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full cursor-crosshair touch-none"
          style={{ height: '120px' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasDrawn && !cvData.personalInfo.signatureUrl && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-xs text-muted-foreground">Dessinez votre signature ici</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearCanvas}
          className="flex-1"
        >
          <Eraser className="h-3 w-3 mr-1" />
          Effacer
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={saveSignature}
          disabled={!hasDrawn}
          className="flex-1"
        >
          <Check className="h-3 w-3 mr-1" />
          Valider
        </Button>
      </div>
    </div>
  );
};

export default SignaturePad;
