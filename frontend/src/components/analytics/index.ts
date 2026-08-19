// ¿Qué? Barrel export de los componentes específicos de analytics.
// ¿Para qué? Simplificar imports desde @components/analytics.
// ¿Impacto? Punto único de importación para componentes de analytics.

export * from './AggregationChart';
export type {
  AggregationChartProps,
  ChartItem,
} from './AggregationChart';
