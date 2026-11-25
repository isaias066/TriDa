import { Prisma } from "@prisma/client";

export type DecimalValue = Prisma.Decimal | number | string;

const asDecimal = (value: DecimalValue) => new Prisma.Decimal(value);

export const calculateNetBalance = (
  income: DecimalValue,
  expenses: DecimalValue,
  savings: DecimalValue,
) => asDecimal(income).minus(asDecimal(expenses)).minus(asDecimal(savings));

export const calculatePercentage = (amount: DecimalValue, total: DecimalValue) => {
  const denominator = asDecimal(total);
  if (denominator.lessThanOrEqualTo(0)) {
    return new Prisma.Decimal(0);
  }
  return asDecimal(amount).dividedBy(denominator).times(100);
};

export const exceedsAverageMultiple = (
  amount: DecimalValue,
  average: DecimalValue,
  multiple: number,
) => asDecimal(amount).greaterThan(asDecimal(average).times(multiple));
