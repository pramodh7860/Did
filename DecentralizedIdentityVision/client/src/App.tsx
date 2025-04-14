import { Switch, Route, useLocation } from "wouter";
import Home from "@/pages/Home";
import Register from "@/pages/Register";
import Verify from "@/pages/Verify";
import About from "@/pages/About";
import Header from "@/components/Header";
import ThreeBackground from "@/components/ThreeBackground";
import NotFound from "@/pages/not-found";
import { useState, useEffect } from "react";
import { Web3Provider } from "@/lib/web3";

function App() {
  const [location] = useLocation();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [account, setAccount] = useState<string | null>(null);

  return (
    <Web3Provider>
      <div className="min-h-screen flex flex-col relative overflow-hidden text-white bg-primary-900">
        <ThreeBackground />
        
        {/* Decorative blobs */}
        <div className="fixed top-[10%] left-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/10 blur-[70px] opacity-70 animate-blob"></div>
        <div className="fixed bottom-[10%] right-[15%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-cyan-500/30 to-emerald-500/10 blur-[70px] opacity-70 animate-blob animation-delay-2000"></div>
        
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-12 relative z-10">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/register" component={Register} />
            <Route path="/verify" component={Verify} />
            <Route path="/about" component={About} />
            <Route component={NotFound} />
          </Switch>
        </main>
        
        <footer className="py-8 px-6 backdrop-blur-xl bg-primary-900/75 border-t border-white/10 relative z-10">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <span className="text-cyan-500 text-2xl">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <polyline points="16 11 18 13 22 9" />
                  </svg>
                </span>
                <h1 className="text-2xl font-bold text-white">DID.</h1>
              </div>
              <div className="text-center md:text-right">
                <p className="text-gray-400 text-sm">© {new Date().getFullYear()} Decentralized Identity Management</p>
                <p className="text-gray-500 text-xs mt-1">Secured by Ethereum & IPFS</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Web3Provider>
  );
}

export default App;
