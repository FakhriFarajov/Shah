import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import EditProductVariants from "../components/custom/EditProductVariants";
import type { ProductForm, ProductVariant, CategoryProperty } from "./products";

interface ProductModalProps {
    mode: "add" | "edit";
    onOpenChange: (open: boolean) => void;
    onSubmit: (product: ProductForm, variants: ProductVariant[], mainImageIdx: number) => void;
    initialProduct?: ProductForm;
    initialVariants?: ProductVariant[];
    categoryProperties: { [categoryId: string]: CategoryProperty[] };
    subcategoryProperties: { [subcategoryId: string]: CategoryProperty[] };
    attributeValues: { id: string; name: string; propertyId: string }[];
    categories: { id: string; name: string; subcategories: { id: string; name: string }[] }[];
}

export default function ProductModal({
    mode,
    onOpenChange,
    onSubmit,
    initialProduct,
    initialVariants,
    categoryProperties,
    subcategoryProperties,
    categories,
}: ProductModalProps) {
    const isEdit = mode === "edit";
    const [product, setProduct] = useState<ProductForm>(
        initialProduct || {
            title: "",
            description: "",
            categoryId: "",
            subcategoryId: "",
            images: [],
            reviews: [],
            productPropertiesValues: [],
            isVerified: false,
            price: 0,
            stock: 0,
        }
    );
    const [variants, setVariants] = useState<ProductVariant[]>(initialVariants || []);
    const [mainImageIdx, setMainImageIdx] = useState<number>(0);
    const [propertyInputs, setPropertyInputs] = useState<{ propertyId: string; value: string }[]>(
        initialProduct?.productPropertiesValues?.map(ppv => ({
            propertyId: ppv.categoryPropertyId,
            value: ppv.value,
        })) || []
    );

    // Category and Subcategory change handlers
    // When category changes, clear subcategory and its properties
    const handleCategoryChange = (categoryId: string) => {
        setProduct((p: ProductForm) => ({ ...p, categoryId, subcategoryId: "" }));
        setPropertyInputs((inputs) =>
            (categoryProperties[categoryId] || []).map((prop) => {
                const found = inputs.find((i) => i.propertyId === prop.id);
                return { propertyId: prop.id, value: found ? found.value : "" };
            })
        );
        setVariants([]);
    };

    const handleSubcategoryChange = (subcategoryId: string) => {
        setProduct((p: ProductForm) => ({ ...p, subcategoryId }));
        const catProps = categoryProperties[product.categoryId] || [];
        const subProps = subcategoryProperties[subcategoryId] || [];
        const allProps = [...catProps, ...subProps];
        setPropertyInputs((prev) =>
            allProps.map((prop) => {
                const found = prev.find((p) => p.propertyId === prop.id);
                return { propertyId: prop.id, value: found ? found.value : "" };
            })
        );
        setVariants([]);
    };
    // Add Product handler
    const handleSubmit = () => {

        onSubmit(product, variants, mainImageIdx);
    };
    return (
        <div className="max-w-5xl w-full min-w-0 xl:min-w-[900px] mx-auto bg-white  p-4 md:p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-indigo-700">
                {isEdit ? "Edit Product" : "Add New Product"}
            </h2>
            <div className="flex flex-col xl:flex-row gap-8">
                {/* Main product fields (always on top on mobile, left on desktop) */}
                <div className="flex-1 flex flex-col space-y-4 order-1">
                    <Label>Product Title</Label>
                    <input
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="Product Title"
                        value={product.title}
                        onChange={e => setProduct((p: ProductForm) => ({ ...p, title: e.target.value }))}
                    />
                    <Label>Description</Label>
                    <textarea
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                        placeholder="Description"
                        value={product.description}
                        onChange={e => setProduct((p: ProductForm) => ({ ...p, description: e.target.value }))}
                        rows={2}
                    />
                    <Label>Category & Subcategory</Label>
                    <select
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        value={product.categoryId}
                        onChange={e => handleCategoryChange(e.target.value)}
                    >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    {/* Show subcategory dropdown only after a category is selected */}
                    {product.categoryId && (
                        <select
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            value={product.subcategoryId}
                            onChange={e => handleSubcategoryChange(e.target.value)}
                        >
                            <option value="">Select Subcategory</option>
                            {categories.find(cat => cat.id === product.categoryId)?.subcategories.map(sub => (
                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                            ))}
                        </select>
                    )}
                </div>
                <div className="flex-1 flex flex-col space-y-4 order-2">
                    <div className="mt-6">
                        <Label className="block font-medium mb-2 text-indigo-700">Variants</Label>
                        <EditProductVariants
                            variants={variants}
                            onChange={setVariants}
                            categoryId={product.categoryId}
                            subcategoryId={product.subcategoryId}
                            disableAdd={false}
                        />
                    </div>
                </div>
            </div>
            <Button
                className="w-full py-3 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow mt-4"
                onClick={handleSubmit}
            >
                {isEdit ? "Save Changes" : "Add Product"}
            </Button>
        </div>
    );
}
