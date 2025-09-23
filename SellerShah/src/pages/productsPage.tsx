// Removed OrdersTable import
import Navbar from "../components/custom/Navbar/navbar";
import Footer from "../components/custom/footer";
import { AppSidebar } from "@/components/custom/sidebar";
import { AdaptiveTable } from "@/components/custom/adaptive-table";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import AddProductModal from "../components/custom/ProductModal";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { CircleX, Edit } from "lucide-react";
import { ProductDetailsModal } from "../components/custom/ProductDetailsModal";

// --- Types ---
type Review = { id: string; rating: number; comment: string };
type Image = { id: string; url: string };
type Category = { id: string; name: string; subcategories: Subcategory[] };
type Subcategory = { id: string; name: string };
export type CategoryProperty = { id: string; name: string; categoryId: string };

type ProductPropertiesValue = {
  id: string;
  productId?: string;
  categoryPropertyId: string;
  categoryProperty: CategoryProperty;
  value: string;
};

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  weight: number;
  height: number;
  width: number;
  depth: number;
  categoryId: string;
  subcategoryId: string;
  images: Image[];
  reviews: Review[];
  productPropertiesValues: ProductPropertiesValue[];
  date: string;
  isVerified: boolean;
  variants?: ProductVariant[];
};

export type ProductForm = {
  title: string;
  description: string;
  price: string;
  stock: string;
  weight: string;
  height: string;
  width: string;
  depth: string;
  categoryId: string;
  subcategoryId: string;
  images: Image[];
  productPropertiesValues: ProductPropertiesValue[];
  reviews?: Review[];
  isVerified: boolean;
};

// --- Variants ---
export type ProductVariantAttributeValue = {
  productVariantId: string;
  attributeValueId: string;
};
export type ProductVariant = {
  id: string;
  productId: string;
  stock: number;
  price: number;
  attributeValues: ProductVariantAttributeValue[];
  images?: string[];
};

// --- Demo Data ---
export const categoryProperties: { [categoryId: string]: CategoryProperty[] } = {
  "electronics-1": [
    { id: "color-1", name: "Color", categoryId: "electronics-1" },
    { id: "size-1", name: "Size", categoryId: "electronics-1" },
  ],
  "fashion-1": [
    { id: "material-1", name: "Material", categoryId: "fashion-1" },
    { id: "brand-1", name: "Brand", categoryId: "fashion-1" },
  ],
};

export const subcategoryProperties: { [subcategoryId: string]: CategoryProperty[] } = {
  "phones-1": [
    { id: "os-1", name: "Operating System", categoryId: "electronics-1" },
    { id: "screen-1", name: "Screen Size", categoryId: "electronics-1" },
  ],
  "laptops-1": [
    { id: "cpu-1", name: "CPU", categoryId: "electronics-1" },
    { id: "ram-1", name: "RAM", categoryId: "electronics-1" },
  ],
  "mens-1": [
    { id: "fit-1", name: "Fit", categoryId: "fashion-1" },
    { id: "pattern-1", name: "Pattern", categoryId: "fashion-1" },
  ],
  "womens-1": [
    { id: "style-1", name: "Style", categoryId: "fashion-1" },
    { id: "length-1", name: "Length", categoryId: "fashion-1" },
  ],
};

export const categories: Category[] = [
  {
    id: "electronics-1",
    name: "Electronics",
    subcategories: [
      { id: "phones-1", name: "Phones" },
      { id: "laptops-1", name: "Laptops" },
    ],
  },
  {
    id: "fashion-1",
    name: "Fashion",
    subcategories: [
      { id: "mens-1", name: "Men's" },
      { id: "womens-1", name: "Women's" },
    ],
  },
];

export const attributeValues = [
  { id: "av2", name: "Blue", propertyId: "color-1" },
  { id: "av3", name: "Large", propertyId: "size-1" },
  { id: "av4", name: "Small", propertyId: "size-1" },
  { id: "av5", name: "Medium", propertyId: "os-1" },
  { id: "av6", name: "Large", propertyId: "os-1" },
  { id: "av7", name: "iOS", propertyId: "os-1" },
  { id: "av8", name: "Android", propertyId: "ram-1" },
  { id: "av9", name: "Windows", propertyId: "cpu-1" },
  { id: "av10", name: "Linux", propertyId: "screen-1" },
  { id: "av11", name: "MacOS", propertyId: "os-1" },
];

const initialProducts: Product[] = 
[
  {
    id: "p1",
    title: "Sample Product",
    description: "This is a sample product description.",
    price: 99.99,
    stock: 50,
    weight: 1.5,
    height: 10,
    width: 5,
    depth: 2,
    categoryId: "electronics-1",
    subcategoryId: "phones-1",
    images: [{ id: "img1", url: "https://via.placeholder.com/150" }],
    reviews: [
      { id: "r1", rating: 4, comment: "Great product!" },
    ],
    productPropertiesValues: [
      { productId: "p1", propertyId: "color-1", valueId: "av2" },
      { productId: "p1", propertyId: "size-1", valueId: "av3" },
    ]
  },  {
    id: "p1",
    title: "Sample Product",
    description: "This is a sample product description.",
    price: 99.99,
    stock: 50,
    weight: 1.5,
    height: 10,
    width: 5,
    depth: 2,
    categoryId: "electronics-1",
    subcategoryId: "phones-1",
    images: [{ id: "img1", url: "https://via.placeholder.com/150" }],
    reviews: [
      { id: "r1", rating: 4, comment: "Great product!" },
    ],
    productPropertiesValues: [
      { productId: "p1", propertyId: "color-1", valueId: "av2" },
      { productId: "p1", propertyId: "size-1", valueId: "av3" },
    ]
  },
  {
    id: "p1",
    title: "Sample Product",
    description: "This is a sample product description.",
    price: 99.99,
    stock: 50,
    weight: 1.5,
    height: 10,
    width: 5,
    depth: 2,
    categoryId: "electronics-1",
    subcategoryId: "phones-1",
    images: [{ id: "img1", url: "https://via.placeholder.com/150" }],
    reviews: [
      { id: "r1", rating: 4, comment: "Great product!" },
    ],
    productPropertiesValues: [
      { productId: "p1", propertyId: "color-1", valueId: "av2" },
      { productId: "p1", propertyId: "size-1", valueId: "av3" },
    ]
  },
  {
    id: "p1",
    title: "Sample Product",
    description: "This is a sample product description.",
    price: 99.99,
    stock: 50,
    weight: 1.5,
    height: 10,
    width: 5,
    depth: 2,
    categoryId: "electronics-1",
    subcategoryId: "phones-1",
    images: [{ id: "img1", url: "https://via.placeholder.com/150" }],
    reviews: [
      { id: "r1", rating: 4, comment: "Great product!" },
    ],
    productPropertiesValues: [
      { productId: "p1", propertyId: "color-1", valueId: "av2" },
      { productId: "p1", propertyId: "size-1", valueId: "av3" },
    ]
  },
  {
    id: "p1",
    title: "Sample Product",
    description: "This is a sample product description.",
    price: 99.99,
    stock: 50,
    weight: 1.5,
    height: 10,
    width: 5,
    depth: 2,
    categoryId: "electronics-1",
    subcategoryId: "phones-1",
    images: [{ id: "img1", url: "https://via.placeholder.com/150" }],
    reviews: [
      { id: "r1", rating: 4, comment: "Great product!" },
    ],
    productPropertiesValues: [
      { productId: "p1", propertyId: "color-1", valueId: "av2" },
      { productId: "p1", propertyId: "size-1", valueId: "av3" },
    ]
  },
  {
    id: "p1",
    title: "Sample Product",
    description: "This is a sample product description.",
    price: 99.99,
    stock: 50,
    weight: 1.5,
    height: 10,
    width: 5,
    depth: 2,
    categoryId: "electronics-1",
    subcategoryId: "phones-1",
    images: [{ id: "img1", url: "https://via.placeholder.com/150" }],
    reviews: [
      { id: "r1", rating: 4, comment: "Great product!" },
    ],
    productPropertiesValues: [
      { productId: "p1", propertyId: "color-1", valueId: "av2" },
      { productId: "p1", propertyId: "size-1", valueId: "av3" },
    ]
  },
  {
    id: "p1",
    title: "Sample Product",
    description: "This is a sample product description.",
    price: 99.99,
    stock: 50,
    weight: 1.5,
    height: 10,
    width: 5,
    depth: 2,
    categoryId: "electronics-1",
    subcategoryId: "phones-1",
    images: [{ id: "img1", url: "https://via.placeholder.com/150" }],
    reviews: [
      { id: "r1", rating: 4, comment: "Great product!" },
    ],
    productPropertiesValues: [
      { productId: "p1", propertyId: "color-1", valueId: "av2" },
      { productId: "p1", propertyId: "size-1", valueId: "av3" },
    ]
  },
  {
    id: "p1",
    title: "Sample Product",
    description: "This is a sample product description.",
    price: 99.99,
    stock: 50,
    weight: 1.5,
    height: 10,
    width: 5,
    depth: 2,
    categoryId: "electronics-1",
    subcategoryId: "phones-1",
    images: [{ id: "img1", url: "https://via.placeholder.com/150" }],
    reviews: [
      { id: "r1", rating: 4, comment: "Great product!" },
    ],
    productPropertiesValues: [
      { productId: "p1", propertyId: "color-1", valueId: "av2" },
      { productId: "p1", propertyId: "size-1", valueId: "av3" },
    ]
  },
  {
    id: "p1",
    title: "Sample Product",
    description: "This is a sample product description.",
    price: 99.99,
    stock: 50,
    weight: 1.5,
    height: 10,
    width: 5,
    depth: 2,
    categoryId: "electronics-1",
    subcategoryId: "phones-1",
    images: [{ id: "img1", url: "https://via.placeholder.com/150" }],
    reviews: [
      { id: "r1", rating: 4, comment: "Great product!" },
    ],
    productPropertiesValues: [
      { productId: "p1", propertyId: "color-1", valueId: "av2" },
      { productId: "p1", propertyId: "size-1", valueId: "av3" },
    ]
  },


];

// --- Component ---
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetail, setShowDetail] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editVariants, setEditVariants] = useState<ProductVariant[]>([]);
  const [categoriesState, setCategories] = useState<Category[]>(categories);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  function handleEditProduct(product: Product) {
    setEditProduct(product);
    setEditVariants(product.variants || []);
    setShowEditModal(true);
  }

  // --- Table Columns ---
  const productColumns = [
    {
      key: "id" as const,
      label: "ID",
    },
    {
      key: "images" as const,
      label: "Image",
      render: (images: Image[]) =>
        images && images.length > 0 ? (
          <img src={images[0].url} alt="product" className="w-10 h-10 rounded object-cover" />
        ) : (
          <span className="text-gray-400">No Image</span>
        ),
    },
    { key: "title" as const, label: "Name" },
    { key: "stock" as const, label: "Stock" },
    { key: "price" as const, label: "Price", render: (v: number) => `$${v}` },
    {
      key: "isVerified" as const,
      label: "Verified",
      render: (isVerified: boolean) =>
        isVerified ? (
          <Badge className="bg-green-500 text-white">Verified</Badge>
        ) : (
          <Badge className="bg-red-500 text-white">Unverified</Badge>
        ),
    },
    {
      key: "categoryId" as const,
      label: "Categories",
      render: (_: string, row: Product) => (
        <>
          <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-xs mr-1">
            {categories.find((cat) => cat.id === row.categoryId)?.name || row.categoryId}
          </span>
          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
            {categories
              .find((cat) => cat.id === row.categoryId)
              ?.subcategories.find((sub) => sub.id === row.subcategoryId)?.name || row.subcategoryId}
          </span>
        </>
      ),
    },
    { key: "date" as const, label: "Date", render: (date: string) => date || "-" },
    {
      key: "variants" as any,
      label: "Variants",
      render: (_: any, row: Product) =>
        row.variants && row.variants.length > 0 ? (
          <span className="text-xs text-gray-700">
            {row.variants.length} variant{row.variants.length > 1 ? "s" : ""}
          </span>
        ) : (
          <span className="text-xs text-gray-400">None</span>
        ),
    },
    {
      key: "action" as any,
      label: "Action",
      render: (_: any, row: Product) => (
        <div className="flex gap-2">
          <ProductDetailsModal
            row={row}
            open={showDetail?.id === row.id}
            onOpenChange={(open) => setShowDetail(open ? row : null)}
          />
          <Button
            className="bg-transparent border-none p-0 m-0 cursor-pointer hover:bg-indigo-100 rounded"
            title="Edit"
            onClick={() => handleEditProduct(row)}
          >
            <Edit className="text-indigo-600 hover:bg-indigo-100" />
          </Button>
          <Button
            className="bg-red-100 text-red-600 border-none p-0 m-0 cursor-pointer hover:bg-red-200 rounded"
            title="Delete"
            onClick={() => setDeleteConfirmId(row.id)}
          >
            <CircleX className="text-red-600 hover:bg-red-200" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex">
        <AppSidebar />
        <div className="flex-1 py-8 px-2 md:px-8 overflow-y-auto" style={{ maxHeight: "100vh" }}>
          {(showAddModal || (showEditModal && editProduct)) ? (
            <div className="max-w-6xl mx-auto mt-8 mb-8 p-6 bg-white rounded-xl shadow border">
              <div className="flex justify-start mb-4">
                <Button
                  variant="outline"
                  className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-xl shadow"
                  onClick={() => {
                    if (showAddModal) setShowAddModal(false);
                    if (showEditModal) {
                      setShowEditModal(false);
                      setEditProduct(null);
                      setEditVariants([]);
                    }
                  }}
                >
                  ← Back
                </Button>
              </div>
              <AddProductModal
                mode={showAddModal ? "add" : "edit"}
                onOpenChange={showAddModal ? setShowAddModal : setShowEditModal}
                onSubmit={(product: ProductForm, variants: ProductVariant[], mainImageIdx: number) => {
                  if (showAddModal) {
                    // Enforce: All variants must have at least one image
                    const variantMissingImage = variants.some(
                      (variant) => !variant.images || variant.images.length === 0
                    );
                    if (variantMissingImage) {
                      toast.error("Each variant must have at least one image.", {
                        description: "Please add at least one image to every variant before saving.",
                      });
                      return;
                    }

                    setProducts((prev) => [
                      ...prev,
                      {
                        ...product,
                        id: (Date.now() + Math.random()).toString(),
                        price: Number(product.price),
                        stock: product.stock.trim() === "" || isNaN(Number(product.stock)) ? 0 : Number(product.stock),
                        weight: product.weight.trim() === "" || isNaN(Number(product.weight)) ? 0 : Number(product.weight),
                        height: product.height.trim() === "" || isNaN(Number(product.height)) ? 0 : Number(product.height),
                        width: product.width.trim() === "" || isNaN(Number(product.width)) ? 0 : Number(product.width),
                        depth: product.depth.trim() === "" || isNaN(Number(product.depth)) ? 0 : Number(product.depth),
                        reviews: [],
                        date: new Date().toISOString().slice(0, 10).replace(/-/g, "/"),
                        variants,
                      } as Product,
                    ]);
                    setShowAddModal(false);
                  } else if (showEditModal && editProduct) {
                    setProducts((products) =>
                      products.map((p) =>
                        p.id === editProduct.id
                          ? {
                            ...p,
                            ...product,
                            id: p.id,
                            date: p.date,
                            price: Number(product.price),
                            stock: product.stock.trim() === "" || isNaN(Number(product.stock)) ? 0 : Number(product.stock),
                            weight: product.weight.trim() === "" || isNaN(Number(product.weight)) ? 0 : Number(product.weight),
                            height: product.height.trim() === "" || isNaN(Number(product.height)) ? 0 : Number(product.height),
                            width: product.width.trim() === "" || isNaN(Number(product.width)) ? 0 : Number(product.width),
                            depth: product.depth.trim() === "" || isNaN(Number(product.depth)) ? 0 : Number(product.depth),
                            variants,
                          }
                          : p
                      )
                    );
                    setShowEditModal(false);
                    setEditProduct(null);
                    setEditVariants([]);
                    toast.success("Product updated successfully.", {
                      description: `Product '${product.title}' has been saved.`,
                    });
                  }
                }}
                {...(showEditModal && editProduct
                  ? {
                    initialProduct: {
                      ...editProduct,
                      price: String(editProduct.price),
                      stock: String(editProduct.stock),
                      weight: String(editProduct.weight),
                      height: String(editProduct.height),
                      width: String(editProduct.width),
                      depth: String(editProduct.depth),
                    },
                    initialVariants: editVariants,
                  }
                  : {})}
                categoryProperties={categoryProperties}
                subcategoryProperties={subcategoryProperties}
                attributeValues={attributeValues}
                categories={categoriesState}
              />
            </div>
          ) : (
            <>
              {!showAddModal && !showEditModal && (
                <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-1">Products</h1>
                    <p className="text-gray-500">Manage your products here.</p>
                  </div>
                  <Button
                    className="bg-indigo-600 text-white rounded-xl shadow mr-4"
                    onClick={() => setShowAddModal(true)}
                  >
                    Add New Product
                  </Button>
                </div>
              )}
              <div className="max-w-6xl mx-auto mt-8">
                {products.length === 0 ? (
                  <div className="text-center text-gray-400 text-lg py-16">No products found.</div>
                ) : (
                  <div>
                    {/* Orders Table with scroll */}
                    < div className="max-w-6xl mx-auto mt-4">
                      <div className="overflow-x-auto rounded-lg shadow border bg-white">
                        <div className="max-h-[750px] overflow-y-auto">
                          <AdaptiveTable columns={productColumns} data={products} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {showEditModal && editProduct && (
                <div className="max-w-6xl mx-auto mt-8 mb-8 p-6 bg-white rounded-xl shadow border">
                  <div className="flex justify-start mb-4">
                    <Button
                      variant="outline"
                      className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-xl shadow"
                      onClick={() => {
                        setShowEditModal(false);
                        setEditProduct(null);
                        setEditVariants([]);
                      }}
                    >
                      ← Back
                    </Button>
                  </div>
                  <AddProductModal
                    mode="edit"
                    onOpenChange={setShowEditModal}
                    onSubmit={(product: ProductForm, variants: ProductVariant[], mainImageIdx: number) => {
                      setProducts((products) =>
                        products.map((p) =>
                          p.id === editProduct?.id
                            ? {
                              ...p,
                              ...product,
                              id: p.id,
                              date: p.date,
                              price: Number(product.price),
                              stock: product.stock.trim() === "" || isNaN(Number(product.stock)) ? 0 : Number(product.stock),
                              weight: product.weight.trim() === "" || isNaN(Number(product.weight)) ? 0 : Number(product.weight),
                              height: product.height.trim() === "" || isNaN(Number(product.height)) ? 0 : Number(product.height),
                              width: product.width.trim() === "" || isNaN(Number(product.width)) ? 0 : Number(product.width),
                              depth: product.depth.trim() === "" || isNaN(Number(product.depth)) ? 0 : Number(product.depth),
                              variants,
                            }
                            : p
                        )
                      );
                      setShowEditModal(false);
                      setEditProduct(null);
                      setEditVariants([]);
                      toast.success("Product updated successfully.", {
                        description: `Product '${product.title}' has been saved.`,
                      });
                    }}
                    initialProduct={editProduct ? {
                      ...editProduct,
                      price: String(editProduct.price),
                      stock: String(editProduct.stock),
                      weight: String(editProduct.weight),
                      height: String(editProduct.height),
                      width: String(editProduct.width),
                      depth: String(editProduct.depth),
                    } : undefined}
                    initialVariants={editVariants}
                    categoryProperties={categoryProperties}
                    subcategoryProperties={subcategoryProperties}
                    attributeValues={attributeValues}
                    categories={categoriesState}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div >
      <Footer />

      {/* Delete confirmation dialog */}
      {
        deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
              <h2 className="text-lg font-bold mb-4">Delete Product</h2>
              <p className="mb-6">Are you sure you want to delete this product?</p>
              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirmId(null)}
                  className="border-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={() => {
                    setProducts(products => products.filter(p => p.id !== deleteConfirmId));
                    setDeleteConfirmId(null);
                    toast.success("Product deleted.");
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )
      }
    </>
  );
}
