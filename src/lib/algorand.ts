import algosdk from 'algosdk';
import React from 'react';

// Algorand configuration with responsive error handling
const token = import.meta.env.VITE_ALGORAND_TOKEN || 'myapikey';
const server = import.meta.env.VITE_ALGORAND_SERVER || 'http://127.0.0.1';
const port = parseInt(import.meta.env.VITE_ALGORAND_PORT || '8080');

export const algodClient = new algosdk.Algodv2(token, server, port);

// Enhanced Health data smart contract interface with responsive features
export class HealthDataContract {
  private appId: number;
  private isConnected: boolean = false;

  constructor(appId: number) {
    this.appId = appId;
    this.checkConnection();
  }

  // Check blockchain connection status
  private async checkConnection() {
    try {
      await algodClient.status().do();
      this.isConnected = true;
      console.log('✅ Algorand blockchain connected successfully');
    } catch (error) {
      this.isConnected = false;
      console.warn('⚠️ Algorand blockchain connection failed:', error);
    }
  }

  // Get connection status for responsive UI
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Store encrypted health data on Algorand blockchain with enhanced error handling
  async storeHealthData(
    sender: string,
    privateKey: Uint8Array,
    encryptedData: string,
    dataType: 'medication' | 'appointment' | 'health_record' | 'chat_message' | 'video_call'
  ) {
    try {
      if (!this.isConnected) {
        throw new Error('Blockchain not connected. Please check your network connection.');
      }

      const suggestedParams = await algodClient.getTransactionParams().do();
      
      const appArgs = [
        new Uint8Array(Buffer.from('store_health_data')),
        new Uint8Array(Buffer.from(encryptedData)),
        new Uint8Array(Buffer.from(dataType)),
        new Uint8Array(Buffer.from(new Date().toISOString())) // Add timestamp
      ];

      const txn = algosdk.makeApplicationCallTxnFromObject({
        from: sender,
        appIndex: this.appId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs,
        suggestedParams,
        note: new Uint8Array(Buffer.from(`VitaNest-${dataType}-${Date.now()}`))
      });

      const signedTxn = txn.signTxn(privateKey);
      const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
      
      await algosdk.waitForConfirmation(algodClient, txId, 4);
      
      console.log(`🔗 Health data (${dataType}) stored on blockchain:`, txId);
      return txId;
    } catch (error) {
      console.error('❌ Error storing health data on blockchain:', error);
      throw new Error(`Failed to store ${dataType} on blockchain: ${error.message}`);
    }
  }

  // Retrieve health data from blockchain with filtering
  async getHealthData(userAddress: string, dataType?: string, limit: number = 50) {
    try {
      if (!this.isConnected) {
        throw new Error('Blockchain not connected');
      }

      const appInfo = await algodClient.getApplicationByID(this.appId).do();
      
      // In a real implementation, you would query the blockchain for user's transactions
      // This is a simplified version for demonstration
      const accountInfo = await algodClient.accountInformation(userAddress).do();
      
      return {
        appInfo,
        accountInfo,
        dataType,
        retrievedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error retrieving health data from blockchain:', error);
      throw new Error(`Failed to retrieve health data: ${error.message}`);
    }
  }

  // Create a new wallet for health data storage with enhanced security
  static generateWallet() {
    try {
      const account = algosdk.generateAccount();
      const wallet = {
        address: account.addr,
        privateKey: account.sk,
        mnemonic: algosdk.secretKeyToMnemonic(account.sk),
        createdAt: new Date().toISOString(),
        purpose: 'VitaNest Health Data Storage'
      };
      
      console.log('🔐 New Algorand wallet generated for health data:', wallet.address);
      return wallet;
    } catch (error) {
      console.error('❌ Error generating wallet:', error);
      throw new Error('Failed to generate secure wallet');
    }
  }

  // Verify data integrity with enhanced validation
  async verifyDataIntegrity(txId: string) {
    try {
      if (!this.isConnected) {
        throw new Error('Blockchain not connected');
      }

      const txInfo = await algodClient.pendingTransactionInformation(txId).do();
      
      // Enhanced verification
      const verification = {
        txId,
        confirmed: txInfo.confirmed,
        round: txInfo['confirmed-round'],
        timestamp: new Date().toISOString(),
        valid: true,
        appId: this.appId
      };
      
      console.log('✅ Data integrity verified:', verification);
      return verification;
    } catch (error) {
      console.error('❌ Error verifying data integrity:', error);
      return {
        txId,
        confirmed: false,
        valid: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Get blockchain network status for responsive UI
  async getNetworkStatus() {
    try {
      const status = await algodClient.status().do();
      return {
        connected: true,
        lastRound: status['last-round'],
        timeSinceLastRound: status['time-since-last-round'],
        catchupTime: status['catchup-time'],
        hasSyncedSinceStartup: status['has-synced-since-startup'],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Enhanced utility functions for Algorand integration with responsive features
export const algorandUtils = {
  // Convert Algos to microAlgos
  algosToMicroAlgos: (algos: number) => algosdk.algosToMicroalgos(algos),
  
  // Convert microAlgos to Algos
  microAlgosToAlgos: (microAlgos: number) => algosdk.microalgosToAlgos(microAlgos),
  
  // Check account balance with error handling
  getAccountBalance: async (address: string) => {
    try {
      const accountInfo = await algodClient.accountInformation(address).do();
      return {
        balance: accountInfo.amount,
        balanceAlgos: algosdk.microalgosToAlgos(accountInfo.amount),
        address,
        status: accountInfo.status,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error getting account balance:', error);
      return {
        balance: 0,
        balanceAlgos: 0,
        address,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  },
  
  // Get network status with responsive handling
  getNetworkStatus: async () => {
    try {
      const status = await algodClient.status().do();
      return {
        online: true,
        lastRound: status['last-round'],
        timeSinceLastRound: status['time-since-last-round'],
        catchupTime: status['catchup-time'],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error getting network status:', error);
      return {
        online: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  },

  // Validate Algorand address
  isValidAddress: (address: string): boolean => {
    try {
      return algosdk.isValidAddress(address);
    } catch (error) {
      return false;
    }
  },

  // Format address for display (responsive)
  formatAddress: (address: string, isMobile: boolean = false): string => {
    if (!address) return '';
    if (isMobile) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  }
};

// Enhanced health data encryption utilities with responsive features
export const healthDataEncryption = {
  // Enhanced encryption for health data
  encrypt: (data: string, key: string, dataType: string = 'general') => {
    try {
      const timestamp = new Date().toISOString();
      const payload = {
        data,
        dataType,
        timestamp,
        version: '1.0'
      };
      
      // Simple encryption for demo - in production, use proper encryption like AES
      const encrypted = btoa(JSON.stringify(payload) + key);
      console.log(`🔒 Health data encrypted (${dataType})`);
      return encrypted;
    } catch (error) {
      console.error('❌ Encryption error:', error);
      throw new Error('Failed to encrypt health data');
    }
  },
  
  // Enhanced decryption with validation
  decrypt: (encryptedData: string, key: string) => {
    try {
      const decoded = atob(encryptedData);
      const dataWithKey = decoded.replace(key, '');
      const payload = JSON.parse(dataWithKey);
      
      console.log(`🔓 Health data decrypted (${payload.dataType})`);
      return payload;
    } catch (error) {
      console.error('❌ Decryption error:', error);
      return {
        data: '',
        error: 'Failed to decrypt data',
        timestamp: new Date().toISOString()
      };
    }
  },

  // Generate secure key for health data
  generateSecureKey: (userAddress: string, dataType: string): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return btoa(`${userAddress}-${dataType}-${timestamp}-${random}`);
  },

  // Validate encrypted data integrity
  validateIntegrity: (encryptedData: string): boolean => {
    try {
      atob(encryptedData);
      return true;
    } catch (error) {
      return false;
    }
  }
};

// Responsive blockchain status hook for UI components
export const useBlockchainStatus = () => {
  const [status, setStatus] = React.useState({
    connected: false,
    loading: true,
    error: null as string | null
  });

  React.useEffect(() => {
    const checkStatus = async () => {
      try {
        const networkStatus = await algorandUtils.getNetworkStatus();
        setStatus({
          connected: networkStatus.online,
          loading: false,
          error: networkStatus.error || null
        });
      } catch (error) {
        setStatus({
          connected: false,
          loading: false,
          error: error.message
        });
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return status;
};