import { Navigate } from 'react-router-dom';

/** Legacy /orders route — redirect to Account hub */
export default function OrdersPage() {
  return <Navigate to="/account?tab=orders" replace />;
}
