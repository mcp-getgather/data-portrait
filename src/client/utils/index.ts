import type { PurchaseHistory } from '../modules/DataTransformSchema';

export const filterUniqueOrders = (
  orders: PurchaseHistory[]
): PurchaseHistory[] => {
  const seen = new Set<string>();
  return orders.filter((order) => {
    const key = `${order.brand}__${order.order_id}_${order.product_names[0]}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
