import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import Loading from "@/shared/components/loading";
import { CategoryCard } from "../components/category-card";
import { OptionCard } from "../components/option-card";
import { CategoryModalSimple } from "../components/category-modal-simple";
import { OptionModalSimple } from "../components/option-modal-simple";
import useFilters from "../hooks/use-filters";
import { IconCirclePlusFilled } from "@tabler/icons-react";

export default function FiltersPage() {
  const {
    // State
    categories,
    selectedCategory,
    options,
    isLoading,
    search,
    showCategoryModal,
    showOptionModal,
    categoryFormData,
    optionFormData,

    // Setters
    setSelectedCategory,
    setSearch,
    setShowCategoryModal,
    setShowOptionModal,
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
  } = useFilters();

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
          <h2 className="text-2xl font-bold">Filtros de Productos</h2>
          <p className="text-gray-600">
            Gestiona las categorías y opciones de filtros para tus productos
          </p>
        </div>
      </div>

      <Tabs defaultValue="categories" className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="categories">Categorías</TabsTrigger>
          <TabsTrigger value="options">Opciones</TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Input
                placeholder="Buscar categorías..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <Button onClick={handleNewCategory}>
              <IconCirclePlusFilled />
              Nueva Categoría
            </Button>
          </div>

          {/* Categories Grid */}
          {categories.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron categorías</p>
            </div>
          )}

          <div className="overflow-y-auto max-h-[530px] mt-4 p-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  isSelected={selectedCategory?.id === category.id}
                  onSelect={setSelectedCategory}
                  onEdit={handleEditCategory}
                  onDelete={handleDeleteCategory}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Options Tab */}
        <TabsContent value="options" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category Selector */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Seleccionar Categoría
                  </CardTitle>
                  <CardDescription>
                    Escoge una categoría para gestionar sus opciones
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {categories.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No hay categorías disponibles
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {categories.map((category) => (
                        <Button
                          key={category.id}
                          variant={
                            selectedCategory?.id === category.id
                              ? "default"
                              : "ghost"
                          }
                          className="w-full justify-start py-8"
                          onClick={() => setSelectedCategory(category)}
                        >
                          <div className="text-left">
                            <div className="font-medium">{category.label}</div>
                            <div className="text-xs opacity-70">
                              {category.name}
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Options Management */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {selectedCategory
                          ? `Opciones - ${selectedCategory.label}`
                          : "Opciones"}
                      </CardTitle>
                      <CardDescription>
                        {selectedCategory
                          ? `Gestiona las opciones de la categoría "${selectedCategory.label}"`
                          : "Selecciona una categoría para ver sus opciones"}
                      </CardDescription>
                    </div>

                    {selectedCategory && (
                      <Button onClick={handleNewOption}>Nueva Opción</Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  {!selectedCategory ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Selecciona una categoría de la lista para gestionar sus
                        opciones
                      </p>
                    </div>
                  ) : options.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        No hay opciones para esta categoría
                      </p>
                      <Button onClick={handleNewOption}>
                        Agregar primera opción
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {options.map((option) => (
                        <OptionCard
                          key={option.id}
                          option={option}
                          onEdit={handleEditOption}
                          onDelete={handleDeleteOption}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modales controlados por estado, sin triggers */}
      <CategoryModalSimple
        typeform="add"
        open={showCategoryModal}
        onOpenChange={setShowCategoryModal}
        handleSubmit={handleSubmitCategory}
        formData={categoryFormData}
        setFormData={setCategoryFormData}
        editingCategory={null}
      />

      <OptionModalSimple
        typeform="add"
        open={showOptionModal}
        onOpenChange={setShowOptionModal}
        handleSubmit={handleSubmitOption}
        formData={optionFormData}
        setFormData={setOptionFormData}
        selectedCategory={selectedCategory}
        editingOption={null}
      />
    </div>
  );
}
