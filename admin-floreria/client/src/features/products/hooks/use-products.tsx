import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { FormData, IFilters, Product, Variant } from "../types";
import productsService from "../api/products-service";
import { useUserStore } from "@/store/use-user-store";

export default function useProducts() {
  const { user } = useUserStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    image: "",
    category: "",
    stock: 0,
    price: 0, // Precio base para productos sin variantes
    isActive: true,
    featured: false,
    hasVariants: false,
    selectedFilterCategoryId: undefined,
    selectedFilterOptionId: undefined,
    productFilters: [],
  });
  
  const [variants, setVariants] = useState<Array<Variant>>([]);

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();

      if (search) params.append("search", search);

      console.log("Fetching products with params:", params.toString());

      const response = await productsService.get(params);

      const { status, message, data } = response; // o response.data si usas Axios

      if (status === "success" && data) {
        console.log("Fetched products:", data);
        setProducts(data || []);
        // Puedes guardar la paginación si la necesitas:
        // setPagination(data.pagination);
      } else {
        toast.error(message || "Error al cargar productos");
      }
    } catch (error) {
      console.error("Fetch products error:", error);
      toast.error("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        product: {
          id: editingProduct?.id ?? "",
          name: formData.name,
          description: formData.description,
          image: formData.image,
          category: formData.category,
          stock: formData.stock,
          isActive: formData.isActive,
          featured: formData.featured,
          hasVariants: formData.hasVariants,
          createdAt: new Date().toISOString(),
          price: formData.price,
          userId: user?.id,
        },
        ...(formData.hasVariants && { variants }),
        ...(formData.productFilters && {
          productFilters: [
            {
              categoryId: formData.selectedFilterCategoryId!,
              optionId: formData.selectedFilterOptionId!,
            },
            ...formData.productFilters
          ],
        }),
      };

      if (editingProduct) {
        const response = await productsService.update(editingProduct.id, data);
        if (response.status === "success") {
          toast.success(response.message);
          setEditingProduct(null);
          setShowModal(false); // ✅ Cerrar modal
          resetForm();
          await fetchProducts(); // ✅ Recargar productos
        }
      } else {
        const response = await productsService.create(data);
        if (response.status === "success") {
          toast.success(response.message);
          setEditingProduct(null);
          setShowModal(false); // ✅ Cerrar modal
          resetForm();
          await fetchProducts(); // ✅ Recargar productos
        }
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Error de conexión");
    }
  };

  const handleNew = () => {
    setEditingProduct(null);
    resetForm();
    setShowModal(true); // ✅ Abrir modal
  };

  const handleEdit = async (product: Product) => {
    const filtersresponse = await productsService.getProductFilters(product.id);

    const main_category = filtersresponse.data.find(
      (f: IFilters) => f.categoryId === product.category
    );

    const filters = filtersresponse.data.filter(
      (f: IFilters) => f.categoryId !== product.category
    );
    
    setEditingProduct(product);
    setShowModal(true); // ✅ Abrir modal
    setFormData({
      name: product.name,
      description: product.description || "",
      image: product.image || "",
      category: product.category,
      stock: product.stock,
      price: product.price || 0,
      isActive: product.isActive,
      featured: product.featured,
      hasVariants: product.hasVariants,
      selectedFilterCategoryId: main_category?.categoryId,
      selectedFilterOptionId: main_category?.optionId,
      productFilters:
        filters?.map((pf: IFilters) => ({
          categoryId: pf.categoryId,
          optionId: pf.optionId,
        })) || [],
    });

    // Cargar variantes si existen
    if (product.variants && product.variants.length > 0) {
      setVariants(
        product.variants.map((variant, index) => ({
          id: variant.id,
          name: variant.name,
          price: variant.price,
          isDefault: variant.isDefault,
          sortOrder: variant.sortOrder || index,
        }))
      );
    } else {
      setVariants([]);
    }
  };

  const handleDelete = async (id: string) => {
    // if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) {
    //   return;
    // }

    try {
      const response = await productsService.remove(id);

      if (response.status === "success") {
        toast.success("Producto eliminado");
        fetchProducts();
      } else {
        toast.error(response.message || "Error al eliminar producto");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error de conexión");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      image: "",
      category: "",
      stock: 0,
      price: 0,
      isActive: true,
      featured: false,
      hasVariants: false,
      selectedFilterCategoryId: undefined,
      selectedFilterOptionId: undefined,
      productFilters: [],
    });
    setVariants([]);
  };

  // Funciones para manejar variantes
  const addVariant = () => {
    const newVariant = {
      name: "",
      price: 0,
      isDefault: variants.length === 0, // Primera variante es default por defecto
      sortOrder: variants.length,
    };
    setVariants([...variants, newVariant]);
  };

  const updateVariant = (
    index: number,
    field: string,
    value: string | number | boolean
  ) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };

    // Si se marca como default, desmarcar las demás
    if (field === "isDefault" && value === true) {
      newVariants.forEach((variant, i) => {
        if (i !== index) variant.isDefault = false;
      });
    }

    setVariants(newVariants);
  };

  const removeVariant = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index);

    // Si se eliminó la variante default y quedan más, marcar la primera como default
    if (variants[index].isDefault && newVariants.length > 0) {
      newVariants[0].isDefault = true;
    }

    setVariants(newVariants);
  };

  const moveVariant = (fromIndex: number, toIndex: number) => {
    const newVariants = [...variants];
    const [removed] = newVariants.splice(fromIndex, 1);
    newVariants.splice(toIndex, 0, removed);

    // Actualizar sortOrder
    newVariants.forEach((variant, index) => {
      variant.sortOrder = index;
    });

    setVariants(newVariants);
  };

  return {
    products,
    search,
    isLoading,
    formData,
    variants,
    showModal,
    editingProduct,
    setSearch,
    setShowModal,
    setFormData,
    setVariants,
    handleSubmit,
    handleNew,
    handleEdit,
    handleDelete,
    resetForm,
    addVariant,
    updateVariant,
    removeVariant,
    moveVariant,
    fetchProducts,
  };
}
