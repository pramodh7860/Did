import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import ConnectWalletButton from '@/components/ConnectWalletButton';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Register', path: '/register' },
    { name: 'Verify', path: '/verify' },
    { name: 'About', path: '/about' },
  ];
  
  return (
    <header className="sticky top-0 z-50 py-4 px-6 backdrop-blur-xl bg-primary-900/75 border-b border-white/10">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-500">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <polyline points="16 11 18 13 22 9" />
          </svg>
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-white to-cyan-300 text-transparent bg-clip-text">
            DID.
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              className={`text-white transition-colors hover:text-cyan-400 ${location === item.path ? 'text-cyan-400' : ''}`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center space-x-4">
          <ConnectWalletButton />
          
          {/* Mobile Menu Trigger */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <button className="text-white">
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-primary-900/95 backdrop-blur-xl p-0 border-l border-white/10">
              <div className="h-full flex flex-col px-6 py-8">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-500">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <polyline points="16 11 18 13 22 9" />
                    </svg>
                    <span className="text-2xl font-bold bg-gradient-to-r from-white to-cyan-300 text-transparent bg-clip-text">
                      DID.
                    </span>
                  </div>
                  <button onClick={() => setIsOpen(false)}>
                    <X className="h-6 w-6 text-white" />
                  </button>
                </div>
                
                <nav className="flex flex-col space-y-6 mb-auto">
                  {navItems.map((item) => (
                    <Link 
                      key={item.path} 
                      href={item.path}
                      className={`text-lg hover:text-cyan-400 transition-colors ${location === item.path ? 'text-cyan-400' : 'text-white'}`}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
                
                <div className="mt-auto pt-6">
                  <p className="text-sm text-gray-400">© {new Date().getFullYear()} DID System</p>
                  <p className="text-xs text-gray-500 mt-1">Secured by Ethereum & IPFS</p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
