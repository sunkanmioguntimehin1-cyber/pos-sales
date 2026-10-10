export const formatMoney = (value: number, fractionDigits = 2) =>
  `₦${value.toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}`;