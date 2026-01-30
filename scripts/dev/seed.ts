import "dotenv/config";
import { db } from "@/lib/clients/db";

async function main() {
  console.log("Setting up demo...");
  const customers = [
    {
      name: "Confecção Estrela",
      color: "#FF5733",
      products: [
        { name: "Camiseta Básica", price: 200 },
        { name: "Calça Jeans", price: 150 },
        { name: "Jaqueta de Couro", price: 500 },
      ],
    },
    {
      name: "Moda & Cia",
      color: "#33FF57",
      products: [
        { name: "Vestido Floral", price: 300 },
        { name: "Saia Plissada", price: 250 },
        { name: "Blusa de Seda", price: 400 },
      ],
    },
    {
      name: "Vestuário Luxo",
      color: "#3357FF",
      products: [
        { name: "Terno Sob Medida", price: 1000 },
        { name: "Camisa Social", price: 350 },
        { name: "Gravata de Seda", price: 150 },
      ],
    },
  ];
  for (const { products, ...customer } of customers) {
    const { id: customerId } = await db.customer
      .findFirstOrThrow({
        where: { name: customer.name },
      })
      .then(async ({ id: customerId }) => {
        return await db.customer.update({
          where: { id: customerId },
          data: customer,
        });
      })
      .catch(async () => {
        return await db.customer.create({
          data: customer,
        });
      });

    for (const product of products) {
      await db.product
        .findFirstOrThrow({
          where: { name: product.name, customerId },
        })
        .then(async ({ id: productId }) => {
          return await db.product.update({
            where: { id: productId },
            data: product,
          });
        })
        .catch(async () => {
          return await db.product.create({
            data: {
              ...product,
              icon: "SHIRT",
              customer: { connect: { id: customerId } },
            },
          });
        });
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
