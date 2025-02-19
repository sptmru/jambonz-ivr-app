import fs from 'fs';
import https from 'https';
import axios from 'axios';

import { config } from '../../infrastructure/config/config';
import { PodMetricsList } from '../../domain/types/k8s/PodMetricsList.type';
import { PodMetricsListItem } from '../../domain/types/k8s/PodMetricsListItem.type';
import { logger } from '../../misc/Logger';

export class KubernetesMetricsApiWrapper {
  private static instance: KubernetesMetricsApiWrapper | null = null;
  private baseUrl = config.thirdParty.k8s.metricsApi.baseUrl;
  private podCount: number = 0;
  private refreshInterval: number = config.thirdParty.k8s.podCountRefreshIntervalMs;

  init(): void {
    void this.refreshPodCount();
    const initialDelay = Math.random() * this.refreshInterval;

    setTimeout(() => {
      void this.refreshPodCount();
      setInterval(() => void this.refreshPodCount(), this.refreshInterval);
    }, initialDelay);
  }

  static getInstance(): KubernetesMetricsApiWrapper {
    if (!this.instance) {
      this.instance = new KubernetesMetricsApiWrapper();
      this.instance.init();
    }

    return this.instance;
  }

  async getPodMetricsList(): Promise<PodMetricsList> {
    const token = fs.readFileSync(config.thirdParty.k8s.tokenPath, 'utf8');
    const response = await axios.get(
      `${this.baseUrl}/apis/metrics.k8s.io/v1beta1/namespaces/${config.thirdParty.k8s.namespace}/pods`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        timeout: 5000,
      }
    );

    return response.data;
  }

  async getIvrAppPods(): Promise<PodMetricsListItem[]> {
    const allPodsMetricsList = await this.getPodMetricsList();
    return allPodsMetricsList.items.filter(
      (pod: PodMetricsListItem) => pod.metadata.labels && pod.metadata.labels.app === 'ivr-app'
    );
  }

  async getIvrAppPodCount(): Promise<number> {
    const ivrAppPods = await this.getIvrAppPods();
    return ivrAppPods.length;
  }

  private async refreshPodCount(): Promise<void> {
    try {
      logger.info(`KubernetesMetricsApiWrapper: refreshing IVR app pod count...`);
      const ivrAppPodCount = await this.getIvrAppPodCount();
      this.podCount = ivrAppPodCount;
      logger.info(`KubernetesMetricsApiWrapper: IVR app pod count updated to ${this.podCount}`);
    } catch (err) {
      logger.error(`KubernetesMetricsApiWrapper: failed to refresh IVR app pod count: ${err.message}`);
    }
  }

  getCachedPodCount(): number {
    if (this.podCount === 0) {
      logger.info(
        `KubernetesMetricsApiWrapper: pod count was not yet set, using default pod count ${config.thirdParty.k8s.defaultPodCount}`
      );
      return config.thirdParty.k8s.defaultPodCount;
    }
    return this.podCount;
  }
}
