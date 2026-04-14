const { db: prisma } = require("../../lib/prisma");

exports.CreateOption = async (req, res) => {
  const { categoryId, value, label, isActive = true, sortOrder = 0 } = req.body;
  try {
    const trimmedValue = (value || "").trim();
    if (!trimmedValue) {
      return res
        .status(400)
        .json({ status: "error", message: "El campo value es requerido" });
    }
    const category = await prisma.filter_categories.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      return res
        .status(404)
        .json({ status: "error", message: "Category not found" });
    }
    const existing = await prisma.filter_options.findFirst({
      where: {
        categoryId,
        value: { equals: trimmedValue, mode: "insensitive" },
        isDeleted: false,
      },
    });
    if (existing) {
      return res.status(409).json({
        status: "error",
        message: "Ya existe una opción con ese valor para esta categoría",
        data: existing,
      });
    }
    const newOption = await prisma.filter_options.create({
      data: { categoryId, value: trimmedValue, label, isActive, sortOrder },
    });
    return res
      .status(201)
      .json({
        status: "success",
        message: "Filter option created successfully",
        data: newOption,
      });
  } catch (error) {
    console.error("Error creating filter option:", error);
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({
          status: "error",
          message: "Opción duplicada (categoryId, value)",
        });
    }
    return res
      .status(500)
      .json({
        status: "error",
        message: "Internal server error",
        details: error.message,
      });
  }
};
// Listar todas las opciones (sin filtrar por categoría)
exports.GetAllOptions = async (_req, res) => {
  try {
    const options = await prisma.filter_options.findMany({
      where: { isDeleted: false },
      orderBy: [{ categoryId: "asc" }, { sortOrder: "asc" }],
    });
    return res
      .status(200)
      .json({
        status: "success",
        message: "All options fetched successfully",
        data: options,
      });
  } catch (error) {
    console.error("Error fetching all options:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
};

// Actualizar una opción
exports.UpdateOption = async (req, res) => {
  const { id } = req.params;
  const { categoryId, value, label, isActive, sortOrder } = req.body;
  try {
    const option = await prisma.filter_options.findUnique({ where: { id } });
    if (!option || option.isDeleted) {
      return res
        .status(404)
        .json({ status: "error", message: "Option not found" });
    }
    const newCategoryId = categoryId || option.categoryId;
    const trimmedValue =
      value !== undefined ? (value || "").trim() : option.value;
    if (!trimmedValue) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "El campo value no puede quedar vacío",
        });
    }
    // Verificar duplicado distinto del actual
    const duplicate = await prisma.filter_options.findFirst({
      where: {
        id: { not: id },
        categoryId: newCategoryId,
        value: { equals: trimmedValue, mode: "insensitive" },
        isDeleted: false,
      },
    });
    if (duplicate) {
      return res
        .status(409)
        .json({
          status: "error",
          message: "Ya existe otra opción con ese valor en la categoría",
        });
    }
    const updated = await prisma.filter_options.update({
      where: { id },
      data: {
        categoryId: newCategoryId,
        value: trimmedValue,
        label: label !== undefined ? label : option.label,
        isActive: isActive !== undefined ? isActive : option.isActive,
        sortOrder: sortOrder !== undefined ? sortOrder : option.sortOrder,
      },
    });
    return res
      .status(200)
      .json({
        status: "success",
        message: "Filter option updated successfully",
        data: updated,
      });
  } catch (error) {
    console.error("Error updating option:", error);
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({
          status: "error",
          message: "Opción duplicada (categoryId, value)",
        });
    }
    return res
      .status(500)
      .json({
        status: "error",
        message: "Internal server error",
        details: error.message,
      });
  }
};

// Obtener todas las opciones de una categoría
exports.GetOptionsByCategory = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const options = await prisma.filter_options.findMany({
      where: {
        categoryId: categoryId,
        // isActive: true,
        isDeleted: false,
      },
      orderBy: { sortOrder: "asc" },
    });

    res.status(200).json({
      status: "success",
      message: "Options fetched successfully",
      data: options,
    });
  } catch (error) {
    console.error("Error fetching options:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Eliminar una opción (soft delete)
exports.DeleteOption = async (req, res) => {
  const { id } = req.params;
  try {
    const option = await prisma.filter_options.findUnique({
      where: { id },
    });

    if (!option) {
      return res.status(404).json({ error: "Option not found" });
    }

    const productsUsingOption = await prisma.product_filters.findFirst({
      where: { optionId: id },
    });

    if (productsUsingOption) {
      return res.status(400).json({
        error:
          "No se puede eliminar la opción porque está en uso por productos.",
      });
    }

    await prisma.filter_options.update({
      where: { id },
      data: { isDeleted: true },
    });

    return res.status(200).json({
      status: "success",
      message: "Opcion eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error deleting option:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
