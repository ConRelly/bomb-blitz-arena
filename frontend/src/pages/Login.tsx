import { SignInOrUpForm } from "app";
import { useNavigate } from "react-router-dom";
import { GameLogo } from "components/GameLogo";
import { PixelButton } from "components/PixelButton";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black overflow-hidden relative">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-8 h-8 bg-yellow-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-red-500 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-10 h-10 bg-blue-400 rounded-full animate-pulse"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'linear-gradient(#ffffff11 1px, transparent 1px), linear-gradient(90deg, #ffffff11 1px, transparent 1px)', 
          backgroundSize: '32px 32px'
        }}></div>
      </div>

      <div className="max-w-md w-full mx-auto bg-gray-800/80 p-8 rounded-lg border-2 border-gray-700 shadow-lg backdrop-blur-sm">
        <div className="mb-6">
          <GameLogo size="medium" />
        </div>
        
        <h2 className="text-xl text-center font-bold text-white mb-6">Sign In to Play</h2>
        
        <SignInOrUpForm signInOptions={{ 
          google: true,
          emailAndPassword: true 
        }} />
        
        <div className="mt-6 text-center">
          <PixelButton 
            variant="secondary" 
            size="sm" 
            onClick={() => navigate('/')}
          >
            Back to Home
          </PixelButton>
        </div>
      </div>
    </div>
  );
};