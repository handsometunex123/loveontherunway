import { db } from "@/lib/db";
import { OrderStatus } from "@prisma/client";

export type Order = {
  id: string;
  status: OrderStatus;
  customerId: string;
  paymentReference: string | null;
  createdAt: Date;
  updatedAt: Date;
  customer: {
    name: string;
    email: string;
  };
  items: Array<{
    product: {
      designer: {
        brandName: string;
      };
    };
  }>;
};

export type OrderItem = Order["items"][0];
export type DesignerProfile = Awaited<ReturnType<typeof db.designerProfile.findUnique>>;
