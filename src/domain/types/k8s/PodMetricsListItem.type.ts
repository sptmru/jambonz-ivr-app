import { PodMetricsListItemContainer } from './PodMetricsListItemContainer.type';

export type PodMetricsListItem = {
  metadata: {
    name: string;
    namespace: string;
    creationTimestamp: string;
    labels?: Record<string, string>;
  };
  timestamp: string;
  window: string;
  containers: PodMetricsListItemContainer[];
};
