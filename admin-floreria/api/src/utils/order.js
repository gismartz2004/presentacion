// import { db } from "../lib/prisma.js";
const { db } = require("../lib/prisma");

exports.generateOrderNumber = async () => {
  const currentYear = new Date().getFullYear().toString().slice(-2); // Últimos 2 dígitos del año
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, "0"); // Mes con 2 dígitos

  const result = await db.$transaction(async (tx) => {
    let sequence = await tx.Sequence.findFirst({
      where: { type: "ORD" },
    });

    if (!sequence) {
      sequence = await tx.Sequence.create({
        data: {
          type: "ORD",
          current: 0,
        },
      });
    } else {
      sequence = await tx.Sequence.update({
        where: { id: sequence.id },
        data: { current: sequence.current + 1 },
      });
    }

    // const orderNumber: string =
    // return orderNumber;
    const data = {
      sequence: `ORD-${currentYear}${currentMonth}-${String(
        sequence.current + 1
      ).padStart(4, "0")}`,
      currentNumber: sequence.current + 1,
    };

    return data;
  });

  return result;
};
