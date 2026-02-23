'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ethers } from 'ethers';

interface Contract {
  id: string;
  address: string;
  abi: any[];
  owner_functions: string[];
  is_active: boolean;
  deployed_by: string;
  deployed_at: string;
  tx_hash: string;
}

export default function AdminPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [deployStatus, setDeployStatus] = useState<{ type: string; message: string } | null>(null);
  const [abiInput, setAbiInput] = useState('');
  const [bytecodeInput, setBytecodeInput] = useState('');
  const [activeContractId, setActiveContractId] = useState<string | null>(null);

  const supabase = createClient();

  // Fetch all contracts
  const fetchContracts = async () => {
    try {
      const { data, error } = await supabase.from('contracts').select('*').order('deployed_at', { ascending: false });
      if (error) throw error;
      setContracts(data || []);
      
      const active = data?.find((c: Contract) => c.is_active);
      if (active) setActiveContractId(active.id);
    } catch (error: any) {
      setDeployStatus({ type: 'error', message: `Failed to fetch contracts: ${error.message}` });
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  // Deploy and replace contract
  const handleDeployAndReplace = async () => {
    if (!confirm('This will deploy a NEW contract and replace the current one for ALL users. Continue?')) {
      return;
    }

    try {
      setLoading(true);
      setDeployStatus(null);

      const response = await fetch('/api/deploy-and-replace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Deployment failed');
      }

      setDeployStatus({
        type: 'success',
        message: `✓ Contract deployed! New address: ${data.contractAddress}\nTx: ${data.deploymentTx}`
      });

      // Refresh contracts list
      setTimeout(() => fetchContracts(), 2000);
    } catch (error: any) {
      setDeployStatus({ type: 'error', message: `Deployment failed: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

      if (!abiInput.trim() || !bytecodeInput.trim()) {
        throw new Error('ABI and bytecode are required');
      }

      const abi = JSON.parse(abiInput);
      let bytecode = bytecodeInput.trim();
      if (!bytecode.startsWith('0x')) bytecode = '0x' + bytecode;

      // Get relayer signer from backend
      const response = await fetch('/api/contract-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deploy', bytecode, abi })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Deployment failed');
      }

      const { contractAddress, txHash } = await response.json();

      // Save to Supabase
      const { error: dbError } = await supabase.from('contracts').insert({
        address: contractAddress,
        abi: abi,
        deployed_by: 'admin',
        tx_hash: txHash,
        is_active: false
      });

      if (dbError) throw dbError;

      setDeployStatus({
        type: 'success',
        message: `Contract deployed at ${contractAddress}`
      });

      setAbiInput('');
      setBytecodeInput('');
      fetchContracts();
    } catch (error: any) {
      setDeployStatus({
        type: 'error',
        message: error.message || 'Deployment failed'
      });
    } finally {
      setLoading(false);
    }
  };

  // Activate contract
  const handleActivate = async (contractId: string) => {
    try {
      setLoading(true);

      // Deactivate all other contracts
      await supabase.from('contracts').update({ is_active: false }).eq('is_active', true);

      // Activate selected
      await supabase.from('contracts').update({ is_active: true }).eq('id', contractId);

      setActiveContractId(contractId);
      setDeployStatus({ type: 'success', message: 'Contract activated for all users' });
      fetchContracts();
    } catch (error: any) {
      setDeployStatus({ type: 'error', message: `Activation failed: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  // Call contract function
  const handleCallFunction = async (contractId: string, functionName: string) => {
    try {
      setLoading(true);

      const contract = contracts.find((c) => c.id === contractId);
      if (!contract) throw new Error('Contract not found');

      const response = await fetch('/api/contract-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'call',
          contractAddress: contract.address,
          functionName,
          abi: contract.abi
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Function call failed');
      }

      const result = await response.json();

      // Log interaction
      await supabase.from('contract_interactions').insert({
        contract_id: contractId,
        function_name: functionName,
        caller_address: 'admin',
        status: 'success',
        result: result
      });

      setDeployStatus({ type: 'success', message: `Function executed: ${JSON.stringify(result)}` });
    } catch (error: any) {
      setDeployStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#000000] via-[#0a0e1a] to-[#0d1b2a] p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">Contract Admin Dashboard</h1>

        {/* Deploy New Contract */}
        <div className="bg-[rgba(10,20,30,0.4)] backdrop-blur-3xl p-6 rounded-2xl border border-emerald-500/40 mb-8">
          <h2 className="text-2xl font-bold text-emerald-400 mb-4">Deploy New Contract & Replace</h2>

          <p className="text-gray-400 mb-4 text-sm">
            Deploy a new contract using the relayer's private key and automatically activate it for all users.
          </p>

          <button
            onClick={handleDeployAndReplace}
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-emerald-500/40 disabled:opacity-50 transition-all"
          >
            {loading ? 'Deploying...' : '🚀 Deploy & Replace Contract'}
          </button>
        </div>

        {/* Status Message */}
        {deployStatus && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              deployStatus.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                : 'bg-red-500/10 border-red-500/40 text-red-300'
            }`}
          >
            {deployStatus.message}
          </div>
        )}

        {/* Contracts List */}
        <div className="bg-[rgba(10,20,30,0.4)] backdrop-blur-3xl p-6 rounded-2xl border border-emerald-500/40">
          <h2 className="text-2xl font-bold text-emerald-400 mb-4">Deployed Contracts</h2>

          <div className="space-y-4">
            {contracts.length === 0 ? (
              <p className="text-gray-400">No contracts deployed yet</p>
            ) : (
              contracts.map((contract) => (
                <div
                  key={contract.id}
                  className="bg-black/30 border border-emerald-500/20 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-emerald-300 font-mono text-sm">{contract.address}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        Deployed: {new Date(contract.deployed_at).toLocaleString()}
                      </p>
                    </div>
                    {contract.is_active && (
                      <span className="bg-emerald-500/30 border border-emerald-500 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {!contract.is_active && (
                      <button
                        onClick={() => handleActivate(contract.id)}
                        disabled={loading}
                        className="bg-emerald-500/50 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                      >
                        Activate
                      </button>
                    )}

                    {contract.owner_functions.map((fn) => (
                      <button
                        key={fn}
                        onClick={() => handleCallFunction(contract.id, fn)}
                        disabled={loading}
                        className="bg-teal-500/50 hover:bg-teal-500 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                      >
                        {fn}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
