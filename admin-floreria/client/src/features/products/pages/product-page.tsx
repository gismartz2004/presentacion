import { Input } from "@/shared/components/ui/input";
import Loading from "@/shared/components/loading";
import { ProductCard } from "../components/product-card";
import useProducts from "../hooks/use-products";
import { ProductModal } from "../components/product-modal";

export default function ProductsPage() {
  const {
    products,
    search,
    isLoading,
    formData,
    variants,
    showModal,
    setShowModal,
    editingProduct,
    setSearch,
    setFormData,
    setVariants,
    handleSubmit,
    handleNew,
    handleEdit,
    handleDelete,
    addVariant,
    updateVariant,
    removeVariant,
    moveVariant,
  } = useProducts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loading />
      </div>
    );
  }

  return (
    <div className="gap-4 md:gap-6 py-4 md:py-6 px-4 lg:px-6">
      {/* Header */}
      <div className="flex justify-between items-center gap-2 mt-1">
        <div>
          <h2 className="text-2xl font-bold">Productos</h2>
          <p className="text-gray-600">
            Gestiona los productos de tu cafetería
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4">
        <Input
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-sm"
        />
        <div className="flex-1" />
        <ProductModal
          typeform="add"
          open={showModal && !editingProduct}
          setOpen={setShowModal}
          handleShow={() => handleNew()}
          handleSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
          variants={variants}
          setVariants={setVariants}
          editingProduct={null}
          addVariant={addVariant}
          moveVariant={moveVariant}
          updateVariant={updateVariant}
          removeVariant={removeVariant}
        />
      </div>

      {/* Divisor */}
      <hr className="my-4 border-gray-300" />

      {/* Products Grid */}
      {products.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No se encontraron productos</p>
          <p className="text-gray-400 text-sm mt-2">
            {search ? 'Intenta con otro término de búsqueda' : 'Agrega tu primer producto para comenzar'}
          </p>
        </div>
      )}

      <div className="overflow-y-auto max-h-[calc(100vh-280px)] mt-4 pt-2 pb-2 px-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              handleEdit={() => handleEdit(product)}
              handleDelete={() => handleDelete(product.id)}
              open={showModal && editingProduct?.id === product.id}
              setOpen={setShowModal}
              handleSubmit={handleSubmit}
              formData={formData}
              setFormData={setFormData}
              variants={variants}
              setVariants={setVariants}
              editingProduct={editingProduct}
              addVariant={addVariant}
              moveVariant={moveVariant}
              updateVariant={updateVariant}
              removeVariant={removeVariant}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
