// ¿Qué? Barrel export de los componentes específicos de transacciones.
// ¿Para qué? Simplificar imports desde @components/transactions.
// ¿Impacto? Punto único de importación para componentes de transacciones.

export { TransactionDetail } from './TransactionDetail';
export type { TransactionDetailProps } from './TransactionDetail';