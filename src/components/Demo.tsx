import {
  useLogin,
  usePrivy,
  useSendTransaction,
  useWallets  
} from '@privy-io/react-auth';
import { useState } from 'react';

type TxStatus = { type: 'success' | 'error'; message: string } | null;

export default function Demo() {
  const { ready, authenticated, user, logout,  } = usePrivy();
  const { login } = useLogin();
  const { sendTransaction } = useSendTransaction();
  const {wallets} = useWallets();
  const wallet = wallets[1];
  console.log(wallet.address)
  const [toAddress, setToAddress] = useState('');
  const [amountEth, setAmountEth] = useState('');
  const [status, setStatus] = useState<TxStatus>(null);

  function LoginButton() {
    const disableLogin = !ready || authenticated;

    return (
      <button
        disabled={disableLogin}
        onClick={() =>
          login({
            loginMethods: ['wallet'],
            disableSignup: false,
          })
        }
        className={`px-6 py-2 rounded-2xl font-semibold shadow-md transition-colors duration-300 
          ${disableLogin
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
      >
        Log in
      </button>
    );
  }

  async function handleSend() {
    try {
      const parsed = parseFloat(amountEth);
      if (isNaN(parsed) || parsed <= 0) {
        setStatus({ type: 'error', message: 'Please enter a valid ETH amount' });
        return;
      }

      const valueInWei = BigInt(parsed * 1e18);
     
      await sendTransaction({ to: toAddress, value: valueInWei, from: wallet.address});
      setStatus({ type: 'success', message: 'Transaction sent!' });
    } catch (err) {
      if (err instanceof Error) {
        setStatus({ type: 'error', message: err.message });
      } else {
        setStatus({ type: 'error', message: 'Transaction failed' });
      }
    }
  }

  function WalletInfo() {
    if (!ready) {
      return <p className="text-gray-500 mt-4">Loading...</p>;
    }
   
    console.log()
    return (
      <div className="mt-6 p-6 border border-gray-200 rounded-xl shadow-sm bg-white w-full max-w-2xl space-y-6">
        {user && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-medium text-gray-800">User Info</h2>
              <button
                onClick={logout}
                className="text-sm bg-red-100 hover:bg-red-200 py-1 px-3 rounded-md text-red-700"
              >
                Logout
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Authenticated:{' '}
              <span className={authenticated ? 'text-green-600' : 'text-red-600'}>
                {authenticated ? 'Yes' : 'No'}
              </span>
            </p>
          </div>
        )}

        {/* Transaction Sender */}
        <div className="space-y-3">
          <h3 className="text-md font-medium text-gray-700">Send Transaction</h3>
          <input
            type="text"
            inputMode="decimal"
            pattern="^\d*\.?\d*$"
            placeholder="Recipient address (0x...)"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            className="w-full px-4 py-2 border border-gray-400 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            inputMode="decimal"
            pattern="^\d*\.?\d*$"
            placeholder="Amount in ETH (e.g. 0.001)"
            value={amountEth}
            onChange={(e) => setAmountEth(e.target.value)}
            className="w-full px-4 py-2 border border-gray-400 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleSend}
            disabled={!toAddress || !amountEth}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Send Transaction
          </button>
          {status && (
            <p
              className={`text-sm mt-1 ${
                status.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {status.message}
            </p>
          )}
        </div>

        {/* Full user object */}
        <details className="mt-4">
          <summary className="font-semibold text-sm text-gray-600">Full User Object</summary>
          <pre className="bg-gray-800 text-white text-xs p-4 rounded mt-2 overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </details>
      </div>
    );
  }

  

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-6">
      {!authenticated && <LoginButton />}
      {ready && authenticated && <WalletInfo />}
    </div>
  );
}
