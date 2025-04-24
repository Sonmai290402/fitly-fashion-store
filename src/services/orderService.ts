import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { fireDB } from "@/firebase/firebaseConfig";
import { CartItem } from "@/types/cart.types";
import { AddressData, OrderData } from "@/types/order.types";
import { UserData } from "@/types/user.types";

export async function createOrder(
  user: UserData,
  items: CartItem[],
  shippingAddress: AddressData,
  paymentMethod: string,
  subtotal: number,
  shippingCost: number = 30000,
  discount: number = 0
): Promise<string> {
  try {
    const orderNumber = generateOrderNumber();
    const total = subtotal + shippingCost - discount;

    const orderData: Omit<OrderData, "id"> = {
      userId: user.uid,
      orderNumber,
      items,
      status: "pending",
      paymentStatus: "pending",
      shippingAddress,
      shippingCost,
      discount,
      subtotal,
      total,
      paymentMethod,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      statusHistory: [
        {
          status: "pending",
          timestamp: new Date().toISOString(),
          comment: "Order created",
        },
      ],
    };

    const orderRef = await addDoc(collection(fireDB, "orders"), orderData);
    return orderRef.id;
  } catch (error) {
    console.error("Error creating order:", error);
    throw new Error("Failed to create order");
  }
}

function generateOrderNumber(): string {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}${String(now.getDate()).padStart(2, "0")}`;
  const timePart = `${String(now.getHours()).padStart(2, "0")}${String(
    now.getMinutes()
  ).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
  const random = Math.floor(1000 + Math.random() * 9000);
  return `OD-${datePart}-${timePart}-${random}`;
}
