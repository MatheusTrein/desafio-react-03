import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { api, PRODUCTS_GET, STOCK_GET } from "../services/api";
import { Product, Stock } from "../types";
import { useAxios } from "./useAxios";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

interface ProductResponse {
  id: number;
  title: string;
  price: number;
  image: string;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const { request } = useAxios();

  const prevCartRef = useRef<Product[]>();

  const cartPreviousValue = prevCartRef.current ?? cart;

  useEffect(() => {
    prevCartRef.current = cart;
  });

  useEffect(() => {
    if (cartPreviousValue !== cart) {
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(cart));
    }
  }, [cart, cartPreviousValue]);

  const addProduct = async (productId: number) => {
    try {
      const stock_get = STOCK_GET("/stock", String(productId));
      const product_get = PRODUCTS_GET("/products", String(productId));

      const { data: stockData } = await request(stock_get.path, stock_get.config);
      const { data: productData } = await request(product_get.path, product_get.config);

      if (!productData) {
        throw new Error();
      }

      const productAlreadyExistsInCart = cart.find((product) => product.id === productId);

      if (productAlreadyExistsInCart) {
        const amount = productAlreadyExistsInCart.amount + 1;

        await updateProductAmount({ productId, amount });

        return;
      }

      const amount = 1;

      if (stockData.stock && amount > stockData.stock) {
        toast.error("Quantidade solicitada fora de estoque");
        return;
      }

      if (!productData) return;

      const product: Product = {
        ...(productData as ProductResponse),
        amount: 1,
      };
      setCart([...cart, product]);
    } catch {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const newCart = [...cart];

      const product = newCart.find((product) => product.id === productId);

      if (!product) {
        throw Error();
      }

      newCart.splice(
        newCart.findIndex((product) => product.id === productId),
        1
      );

      setCart(newCart);
    } catch {
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({ productId, amount }: UpdateProductAmount) => {
    try {
      if (amount < 1) {
        return;
      }

      const newCart = [...cart];

      const product = newCart.find((product) => product.id === productId);

      if (!product) {
        throw Error();
      }

      const stock_get = STOCK_GET("/stock", String(productId));

      const { data: stockData } = await request(stock_get.path, stock_get.config);

      if (amount > stockData.amount) {
        toast.error("Quantidade solicitada fora de estoque");
        return;
      }

      product.amount = amount;

      setCart(newCart);
    } catch {
      toast.error("Erro na alteração de quantidade do produto");
    }
  };

  return (
    <CartContext.Provider value={{ cart, addProduct, removeProduct, updateProductAmount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
