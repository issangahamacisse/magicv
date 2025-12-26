import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { FileText, User, Sparkles, Menu, LogOut } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onToggleMobilePreview?: () => void;
  showMobilePreview?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleMobilePreview, showMobilePreview }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 lg:px-6">
      {/* Logo */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
        <div className="p-2 rounded-lg bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <span className="font-semibold text-lg hidden sm:inline">CV Builder</span>
      </div>

      {/* Mobile Preview Toggle */}
      <div className="lg:hidden">
        <Button
          variant={showMobilePreview ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleMobilePreview}
        >
          {showMobilePreview ? 'Éditer' : 'Aperçu'}
        </Button>
      </div>

      {/* Desktop Actions */}
      <div className="hidden lg:flex items-center gap-3">
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          Scanner ATS
        </Button>
        
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                {user.email?.split('@')[0]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleSignOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate('/auth')}>
            <User className="h-4 w-4" />
            Connexion
          </Button>
        )}
        
        <Button size="sm" className="gap-2">
          Passer Premium
        </Button>
      </div>

      {/* Mobile Menu */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <div className="flex flex-col gap-4 mt-8">
              <Button variant="ghost" className="justify-start gap-2">
                <Sparkles className="h-4 w-4" />
                Scanner ATS
              </Button>
              
              {user ? (
                <Button variant="outline" className="justify-start gap-2" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </Button>
              ) : (
                <Button variant="outline" className="justify-start gap-2" onClick={() => navigate('/auth')}>
                  <User className="h-4 w-4" />
                  Connexion
                </Button>
              )}
              
              <Button className="justify-start">
                Passer Premium
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
