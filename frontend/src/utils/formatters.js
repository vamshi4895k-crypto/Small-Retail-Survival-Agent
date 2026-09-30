export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num) => {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
};

export const getUrgencyBadge = (urgency) => {
  switch (urgency) {
    case 'CRITICAL':
      return {
        label: 'Critical Stockout',
        bg: 'bg-red-500/20 text-red-400 border border-red-500/40',
        dot: 'bg-red-500',
      };
    case 'WARNING':
      return {
        label: 'Restock Soon',
        bg: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
        dot: 'bg-amber-400',
      };
    case 'CLEARANCE_EXPIRY':
      return {
        label: 'Perishable Spoilage Risk',
        bg: 'bg-orange-500/20 text-orange-400 border border-orange-500/40',
        dot: 'bg-orange-400',
      };
    case 'OVERSTOCK':
      return {
        label: 'Dead Stock / Excess',
        bg: 'bg-purple-500/20 text-purple-300 border border-purple-500/40',
        dot: 'bg-purple-400',
      };
    case 'HEALTHY':
    default:
      return {
        label: 'Balanced',
        bg: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
        dot: 'bg-emerald-400',
      };
  }
};
