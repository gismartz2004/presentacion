import { useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  FilterCategory,
  FilterOption,
  FilterCategoryFormData,
  FilterOptionFormData,
} from "../types";
import filtersService from "../api/filters-service";
import { AxiosError } from "axios";

export default function useFilters() {
  const [categories, setCategories] = useState<FilterCategory[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<FilterCategory | null>(null);
  const [options, setOptions] = useState<FilterOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FilterCategory | null>(
    null
  );
  const [editingOption, setEditingOption] = useState<FilterOption | null>(null);
  const [activeTab, setActiveTab] = useState<"categories" | "options">(
    "categories"
  );

  const [categoryFormData, setCategoryFormData] =
    useState<FilterCategoryFormData>({
      name: "",
      label: "",
      description: "",
      placeholder: "",
      type: "SELECT",
      minRange: null,
      maxRange: null,
      isActive: true,
      sortOrder: 0,
      isRequired: false,
    });

  const [optionFormData, setOptionFormData] = useState<FilterOptionFormData>({
    categoryId: "",
    value: "",
    label: "",
    isActive: true,
    sortOrder: 0,
  });

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await filtersService.getCategories();
      console.log("Fetch categories response:", response);
      if (response.status === "success" && response.data) {
        setCategories(response.data);
      } else {
        toast.error(response.message || "Error al cargar categorías");
      }
    } catch (error) {
      console.error("Fetch categories error:", error);
      toast.error("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch options for selected category
  const fetchOptionsByCategory = async (categoryId: string) => {
    try {
      const response = await filtersService.getOptionsByCategory(categoryId);

      if (response.status === "success" && response.data) {
        setOptions(response.data);
      } else {
        toast.error(response.message || "Error al cargar opciones");
      }
    } catch (error) {
      console.error("Fetch options error:", error);
      toast.error("Error de conexión");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchOptionsByCategory(selectedCategory.id);
    } else {
      setOptions([]);
    }
  }, [selectedCategory]);

  // Category handlers
  const handleNewCategory = () => {
    console.log("handleNewCategory called"); // Debug
    setCategoryFormData({
      name: "",
      label: "",
      description: "",
      placeholder: "",
      type: "SELECT",
      minRange: null,
      maxRange: null,
      isActive: true,
      sortOrder: 0,
      isRequired: false,
    });
    setEditingCategory(null);
    setShowCategoryModal(true);
    console.log("showCategoryModal set to true"); // Debug
  };

  const handleEditCategory = (category: FilterCategory) => {
    setCategoryFormData({
      name: category.name,
      label: category.label,
      description: category.description || "",
      placeholder: category.placeholder || "",
      type: category.type,
      minRange: category.minRange || null,
      maxRange: category.maxRange || null,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      isRequired: category.isRequired,
    });
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        ...categoryFormData,
        minRange: categoryFormData.minRange || null,
        maxRange: categoryFormData.maxRange || null,
      };

      let response;
      if (editingCategory) {
        response = await filtersService.updateCategory(
          editingCategory.id,
          data
        );
      } else {
        response = await filtersService.createCategory(data);
      }

      if (response.status === "success") {
        toast.success(response.message || "Categoría guardada exitosamente");
        setShowCategoryModal(false);
        setEditingCategory(null);
        await fetchCategories();
      } else {
        toast.error(response.message || "Error al guardar categoría");
      }
    } catch (error) {
      console.error("Submit category error:", error);
      toast.error("Error de conexión");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const response = await filtersService.deleteCategory(categoryId);

      if (response.status === "success") {
        toast.success(response.message || "Categoría eliminada exitosamente");
        await fetchCategories();
        if (selectedCategory?.id === categoryId) {
          setSelectedCategory(null);
        }

        await fetchCategories();
      } else {
        toast.error(response.message || "Error al eliminar categoría");
      }
    } catch (error) {
      console.error("Delete category error:", error);
      if (error instanceof AxiosError) {
        const message = error.response?.data?.error;
        toast.error(message || "Error de conexión");
      }
    }
  };

  // Option handlers
  const handleNewOption = () => {
    console.log("handleNewOption called"); // Debug
    if (!selectedCategory) {
      toast.error("Selecciona una categoría primero");
      return;
    }

    setOptionFormData({
      categoryId: selectedCategory.id,
      value: "",
      label: "",
      isActive: true,
      sortOrder: options.length,
    });
    setEditingOption(null);
    setShowOptionModal(true);
    console.log("showOptionModal set to true"); // Debug
  };

  const handleEditOption = (option: FilterOption) => {
    setOptionFormData({
      categoryId: option.categoryId,
      value: option.value,
      label: option.label,
      isActive: option.isActive,
      sortOrder: option.sortOrder,
    });
    setEditingOption(option);
    setShowOptionModal(true);
  };

  const handleSubmitOption = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let response;
      if (editingOption) {
        response = await filtersService.updateOption(
          editingOption.id,
          optionFormData
        );
      } else {
        response = await filtersService.createOption(optionFormData);
      }

      if (response.status === "success") {
        toast.success(response.message || "Opción guardada exitosamente");
        setShowOptionModal(false);
        setEditingOption(null);
        if (selectedCategory) {
          await fetchOptionsByCategory(selectedCategory.id);
        }
      } else {
        toast.error(response.message || "Error al guardar opción");
      }
    } catch (error) {
      console.error("Submit option error:", error);
      toast.error("Error de conexión");
    }
  };

  const handleDeleteOption = async (optionId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta opción?")) {
      return;
    }

    try {
      const response = await filtersService.deleteOption(optionId);

      if (response.status === "success") {
        toast.success(response.message || "Opción eliminada exitosamente");
        if (selectedCategory) {
          await fetchOptionsByCategory(selectedCategory.id);
        }
      } else {
        toast.error(response.message || "Error al eliminar opción");
      }
    } catch (error) {
      console.error("Delete option error:", error);
      toast.error("Error de conexión");
    }
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(search.toLowerCase()) ||
      category.label.toLowerCase().includes(search.toLowerCase())
  );

  return {
    // State
    categories: filteredCategories,
    selectedCategory,
    options,
    isLoading,
    search,
    showCategoryModal,
    showOptionModal,
    editingCategory,
    editingOption,
    activeTab,
    categoryFormData,
    optionFormData,

    // Setters
    setSelectedCategory,
    setSearch,
    setShowCategoryModal,
    setShowOptionModal,
    setActiveTab,
    setCategoryFormData,
    setOptionFormData,

    // Handlers
    handleNewCategory,
    handleEditCategory,
    handleSubmitCategory,
    handleDeleteCategory,
    handleNewOption,
    handleEditOption,
    handleSubmitOption,
    handleDeleteOption,
  };
}
