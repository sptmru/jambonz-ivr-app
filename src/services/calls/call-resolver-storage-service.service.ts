import { logger } from '../../misc/Logger';

export class CallResolverStorageService {
  private static instance: CallResolverStorageService | null = null;
  private callResolverStorage = new Map<string, () => void>();

  static getInstance(): CallResolverStorageService {
    if (!this.instance) {
      this.instance = new CallResolverStorageService();
    }
    return this.instance;
  }

  public addCallToStorage(callId: string, resolveCallback: () => void): void {
    logger.info(`CallResolverStorageService: adding call ${callId} to storage`);
    this.callResolverStorage.set(callId, resolveCallback);
  }

  public checkIfCallIsInStorage(callId: string): boolean {
    const callIsInStorage = this.callResolverStorage.has(callId);

    if (callIsInStorage) {
      logger.info(`CallResolverStorageService: call ${callId} is in storage`);
    } else {
      logger.info(`CallResolverStorageService: call ${callId} is not in storage`);
    }

    return callIsInStorage;
  }

  public resolveCallHandler(callId: string): void {
    logger.info(`CallResolverStorageService: resolving call ${callId}`);
    const resolveCallback = this.callResolverStorage.get(callId);
    if (resolveCallback) {
      resolveCallback();
      this.callResolverStorage.delete(callId);
      logger.info(`CallResolverStorageService: call ${callId} resolved and removed from storage`);
    } else {
      logger.error(`CallResolverStorageService: call ${callId} not found in storage`);
    }
  }
}
