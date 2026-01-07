import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, Check, X } from 'lucide-react';

interface AIRewriteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalText: string;
  rewrittenText: string;
  onAccept: () => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

const AIRewriteModal: React.FC<AIRewriteModalProps> = ({
  open,
  onOpenChange,
  originalText,
  rewrittenText,
  onAccept,
  onRegenerate,
  isRegenerating,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            ✨ Texte reformulé par l'IA
          </DialogTitle>
          <DialogDescription>
            Comparez l'original avec la version améliorée et choisissez de l'accepter ou de régénérer.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Original</p>
            <ScrollArea className="h-[200px] rounded-md border p-3 bg-muted/30">
              <p className="text-sm whitespace-pre-wrap">{originalText}</p>
            </ScrollArea>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-primary">Amélioré</p>
            <ScrollArea className="h-[200px] rounded-md border border-primary/30 p-3 bg-primary/5">
              <p className="text-sm whitespace-pre-wrap">{rewrittenText}</p>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button
            variant="outline"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
            Régénérer
          </Button>
          <Button
            onClick={onAccept}
            className="w-full sm:w-auto"
          >
            <Check className="h-4 w-4 mr-2" />
            Accepter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIRewriteModal;
