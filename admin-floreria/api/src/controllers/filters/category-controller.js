const { db: prisma } = require("../../lib/prisma");

exports.CreateCategory = async (req, res) => {
  const {
    name,
    description,
    placeholder,
    label,
    minRange,
    maxRange,
    type, // 'SELECT', 'MULTISELECT', 'RANGE', etc.
    isActive = true,
    sortOrder = 0,
    isRequired = false,
  } = req.body;

  try {
    // Verificar si la categoría ya existe
    // const existingCategory = await prisma.filter_categories.findUnique({
    //   where: { id:, isDeleted: false },
    // });

    // if (existingCategory) {
    //   return res.status(409).json({ error: "Category already exists" });
    // }

    // Crear solo la categoría (NO crear opciones aquí)
    const newCategory = await prisma.filter_categories.create({
      data: {
        name,
        description,
        placeholder,
        label,
        minRange,
        maxRange,
        type,
        isActive,
        sortOrder,
        isRequired,
      },
    });

    res.status(201).json({
      status: "success",
      message: "Filter category created successfully",
      data: newCategory,
    });
  } catch (error) {
    console.error("Error creating filter category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Obtener todas las categorías
exports.GetCategories = async (req, res) => {
  try {
    const categories = await prisma.filter_categories.findMany({
      where: { isDeleted: false },
      include: {
        filter_options: {
          where: { isDeleted: false },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });
    return res.status(200).json({
      status: "success",
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Obtener una categoría por ID
exports.GetCategoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await prisma.filter_categories.findUnique({
      where: { id },
      include: {
        filter_options: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Actualizar categoría
exports.UpdateCategory = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    placeholder,
    label,
    minRange,
    maxRange,
    type,
    isActive,
    sortOrder,
    isRequired,
  } = req.body;

  try {
    const updatedCategory = await prisma.filter_categories.update({
      where: { id },
      data: {
        name,
        description,
        placeholder,
        label,
        minRange,
        maxRange,
        type,
        isActive,
        sortOrder,
        isRequired,
      },
    });
    return res.status(200).json({
      status: "success",
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(500).json({ error: "Internal server error" });
  }
};

// Eliminar categoría (soft delete)
exports.DeleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await prisma.filter_categories.findUnique({
      where: { id },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const associatedOptions = await prisma.filter_options.findMany({
      where: { categoryId: id, isDeleted: false },
    });

    if (associatedOptions.length > 0) {
      return res
        .status(400)
        .json({
          error: "No puede eliminar una categoría con opciones asociadas",
        });
    }

    await prisma.filter_categories.update({
      where: { id },
      data: { isDeleted: true },
    });

    return res.json({
      status: "success",
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(500).json({ error: "Error interno del servidor" });
  }
};
