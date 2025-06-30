import dotenv from 'dotenv';
// Load environment variables BEFORE any other imports
dotenv.config();

import algosdk from 'algosdk';

class AlgorandService {
  private algod: algosdk.Algodv2;
  private indexer: algosdk.Indexer;

  constructor() {
    this.algod = new algosdk.Algodv2(
      '', // No token needed for Nodely
      process.env.NODELY_API_URL!,
      ''
    );
    
    this.indexer = new algosdk.Indexer(
      '',
      process.env.NODELY_INDEXER_URL!,
      ''
    );
  }

  async getNodeStatus() {
    return await this.algod.status().do();
  }

  async getAccountInfo(address: string) {
    return await this.algod.accountInformation(address).do();
  }

  async waitForConfirmation(txId: string, maxRetries: number = 100) {
    const pendingInfo = await this.algod.pendingTransactionInformation(txId).do();
    if (pendingInfo.confirmedRound && pendingInfo.confirmedRound > 0) {
      return pendingInfo;
    }

    const status = await this.algod.status().do();
    let currentRound = status.lastRound;
    let retries = 0;

    while (retries < maxRetries) {
      const pendingInfo = await this.algod.pendingTransactionInformation(txId).do();
      if (pendingInfo.confirmedRound && pendingInfo.confirmedRound > 0) {
        return pendingInfo;
      }
      
      currentRound++;
      retries++;
      await this.algod.statusAfterBlock(currentRound).do();
    }

    throw new Error(`Transaction ${txId} was not confirmed after ${maxRetries} rounds`);
  }

  async getTransactionParams(): Promise<any> {
    return await this.algod.getTransactionParams().do();
  }

  async sendRawTransaction(signedTxn: Uint8Array) {
    return await this.algod.sendRawTransaction(signedTxn).do();
  }

  async getAssetInfo(assetId: number) {
    return await this.algod.getAssetByID(assetId).do();
  }

  async getTransaction(txId: string) {
    return await this.indexer.lookupTransactionByID(txId).do();
  }

  async getAccountAssets(address: string) {
    const accountInfo = await this.getAccountInfo(address);
    return accountInfo.assets || [];
  }

  async checkAccountExists(address: string): Promise<boolean> {
    try {
      await this.getAccountInfo(address);
      return true;
    } catch (error: any) {
      if (error.message && error.message.includes('account does not exist')) {
        return false;
      }
      throw error;
    }
  }

  get algodClient() {
    return this.algod;
  }

  get indexerClient() {
    return this.indexer;
  }
}

export const algorandService = new AlgorandService();