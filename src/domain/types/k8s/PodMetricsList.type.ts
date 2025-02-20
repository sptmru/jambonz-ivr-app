import { PodMetricsListItem } from './PodMetricsListItem.type';

export type PodMetricsList = {
  kind: 'PodMetricsList';
  apiVersion: string;
  metadata: Record<string, never>;
  items: PodMetricsListItem[];
};
