import { usePrivy } from '@privy-io/react-auth';
import Button from './shared/Button';

interface LoginProps {
  onSuccess?: () => void;
}

export default function Login({ onSuccess }: LoginProps) {
  const { login, ready } = usePrivy();

  const handleLogin = async () => {
    await login();
    if (onSuccess) onSuccess();
  };

  return (
    <div className="login-container">
      <h2>Welcome to ETH CALI Wallet</h2>
      <p>Sign in with your email to access your wallet</p>
      <Button 
        onClick={handleLogin} 
        variant="primary" 
        size="large"
        disabled={!ready}
      >
        Sign In with Email
      </Button>

      <style jsx>{`
        .login-container {
          text-align: center;
          margin: 3rem 0;
          padding: 2.5rem;
          background: rgba(255, 255, 255, 0.98);
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        }
        
        h2 {
          margin-bottom: 1.5rem;
          color: #333;
          font-weight: 600;
        }
        
        p {
          margin-bottom: 2rem;
          color: #555;
        }
        
        @media (max-width: 480px) {
          .login-container {
            margin: 1rem 0;
            padding: 1.5rem;
          }
          
          h2 {
            font-size: 1.4rem;
            margin-bottom: 1rem;
          }
          
          p {
            margin-bottom: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
} 