"use client";

interface HeaderProps {
  account: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  loading: boolean;
}

export default function Header({ account, onConnect, onDisconnect, loading }: HeaderProps) {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="border-b border-white/10 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="text-3xl">🔐</div>
            <span className="text-xl font-bold text-white">
              Private Credit Score
            </span>
          </div>

          {account ? (
            <div className="flex items-center space-x-4">
              <div className="glass-effect px-4 py-2 rounded-lg">
                <span className="text-white font-mono">
                  {formatAddress(account)}
                </span>
              </div>
              <button
                onClick={onDisconnect}
                className="bg-red-500/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={onConnect}
              disabled={loading}
              className="bg-white text-purple-600 font-semibold px-6 py-2 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50"
            >
              {loading ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

