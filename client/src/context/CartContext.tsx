import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface CartContextType {
  count: number;
  refresh: () => void;
  increment: () => void;
}

const CartContext = createContext<CartContextType>({ count: 0, refresh: () => {}, increment: () => {} });

export function CartProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) { setCount(0); return; }
    import('../lib/api').then(({ api }) =>
      api.getCart().then((items) => setCount(items.reduce((s, i) => s + i.quantity, 0))).catch(() => setCount(0))
    );
  }, []);

  const increment = () => setCount((c) => c + 1);

  return (
    <CartContext.Provider value={{ count, refresh, increment }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
