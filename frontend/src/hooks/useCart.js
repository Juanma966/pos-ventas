import { useCallback, useMemo, useState } from 'react';

// Maneja el carrito del POS: líneas { product, quantity }.
// El stock del producto es el tope de cantidad por línea.
export default function useCart() {
  const [items, setItems] = useState([]);

  const addProduct = useCallback((product) => {
    if (product.stock <= 0) return;
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const setQuantity = useCallback((productId, quantity) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.product.id !== productId) return i;
        const capped = Math.max(1, Math.min(Number(quantity) || 1, i.product.stock));
        return { ...i, quantity: capped };
      })
    );
  }, []);

  const removeProduct = useCallback((productId) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const subtotal = useMemo(
    () => items.reduce((acc, i) => acc + Number(i.product.price) * i.quantity, 0),
    [items]
  );

  const count = useMemo(() => items.reduce((acc, i) => acc + i.quantity, 0), [items]);

  return { items, addProduct, setQuantity, removeProduct, clear, subtotal, count };
}
