import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import EditProductVariants from "./EditProductVariants";
import { toast } from "sonner";
import type { ProductForm, ProductVariant, CategoryProperty } from "../../pages/productsPage";


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
            price: "",
            stock: "",
            weight: "",
            height: "",
            width: "",
            depth: "",
            categoryId: "",
            subcategoryId: "",
            images: [],
            reviews: [],
            productPropertiesValues: [],
            isVerified: false,
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
        // List of fields to check: label, value, type ('number' or 'text'), required
        const fields = [
            { key: 'title', label: 'Product Title', type: 'text', required: true },
            { key: 'description', label: 'Description', type: 'text', required: true },
            { key: 'weight', label: 'Weight', type: 'number', required: true },
        ];

        // Prevent save if Add Variant button would be disabled (i.e., if any variant is missing an image)
        const anyVariantMissingImage = variants.some(v => !v.images || v.images.length === 0);
        if (anyVariantMissingImage) {
            toast.error("Add an image to all variants before saving.");
            return;
        }

        for (const field of fields) {
            let val = (product as any)[field.key];
            if (field.type === 'text') {
                if (field.required && (!val || typeof val !== 'string' || val.trim() === '')) {
                    toast.error(`Please enter a ${field.label.toLowerCase()}.`);
                    return;
                }
            } else if (field.type === 'number') {
                // Always treat as string for input fields
                if (field.required && (val === undefined || val === null || val === '')) {
                    toast.error(`Please enter ${field.label.toLowerCase()}.`);
                    return;
                }
                if (typeof val === 'string') val = val.trim();
                // Disallow empty string, non-numeric, or any non-finite value
                if (val === '' || isNaN(Number(val)) || !isFinite(Number(val))) {
                    toast.error(`${field.label} must be a valid number.`);
                    return;
                }
                // Prevent numbers that start with zero (except '0' itself)
                if (typeof val === 'string' && val.length > 1 && val.startsWith('0')) {
                    toast.error(`${field.label} cannot start with zero.`);
                    return;
                }
                if (Number(val) === 0) {
                    toast.error(`${field.label} cannot be zero.`);
                    return;
                }
                // Optionally, you can enforce integer or positive checks here if needed
            }
        }
        if (!product.categoryId || product.categoryId === "") {
            toast.error("Please select a category.");
            return;
        }
        if (!product.subcategoryId || product.subcategoryId === "") {
            toast.error("Please select a subcategory.");
            return;
        }
        if (!product.images || product.images.length === 0) {
            toast.error("Please upload at least one product image.");
            return;
        }


        const catProps = categoryProperties[product.categoryId] || [];
        const subProps = subcategoryProperties[product.subcategoryId] || [];
        const allProps = [...catProps, ...subProps];
        for (const prop of allProps) {
            const input = propertyInputs.find(p => p.propertyId === prop.id);
            if (!input || input.value === null || input.value === undefined || input.value === "") {
                toast.error(`Please select a value for: ${prop.name}`);
                return;
            }
        }
        if (variants.length > 0) {
            for (let i = 0; i < variants.length; i++) {
                const v = variants[i];
                // Price null/empty/undefined check
                const priceStr = String(v.price);
                if (priceStr === null || priceStr === undefined || priceStr === "" || isNaN(Number(priceStr))) {
                    toast.error(`Variant #${i + 1}: Price is required and must be a number.`);
                    return;
                }
                if (!Number.isInteger(Number(priceStr))) {
                    toast.error(`Variant #${i + 1}: Price must be an integer.`);
                    return;
                }
                if (Number(priceStr) < 0) {
                    toast.error(`Variant #${i + 1}: Price cannot be negative.`);
                    return;
                }
                // Prevent numbers that start with zero (except '0' itself)
                if (typeof priceStr === 'string' && priceStr.length > 1 && priceStr.startsWith('0')) {
                    toast.error(`Variant #${i + 1}: Price cannot start with zero.`);
                    return;
                }
                if (Number(priceStr) === 0) {
                    toast.error(`Variant #${i + 1}: Price cannot be zero.`);
                    return;
                }
                // Stock null/empty/undefined check
                const stockStr = String(v.stock);
                if (stockStr === null || stockStr === undefined || stockStr === "" || isNaN(Number(stockStr))) {
                    toast.error(`Variant #${i + 1}: Stock is required and must be a number.`);
                    return;
                }
                if (!Number.isInteger(Number(stockStr))) {
                    toast.error(`Variant #${i + 1}: Stock must be an integer.`);
                    return;
                }
                // Prevent numbers that start with zero (except '0' itself)
                if (typeof stockStr === 'string' && stockStr.length > 1 && stockStr.startsWith('0')) {
                    toast.error(`Variant #${i + 1}: Stock cannot start with zero.`);
                    return;
                }
                if (Number(stockStr) === 0) {
                    toast.error(`Variant #${i + 1}: Stock cannot be zero.`);
                    return;
                }
                if (Number(stockStr) < 0) {
                    toast.error(`Variant #${i + 1}: Stock cannot be negative.`);
                    return;
                }
                for (const prop of allProps) {
                    const attr = v.attributeValues.find(av => av.attributeValueId.startsWith(prop.id + '___'));
                    const val = attr ? attr.attributeValueId.split('___')[1] : undefined;
                    if (val === undefined || val === null || val === "") {
                        toast.error(`Variant #${i + 1}: Please select a value for '${prop.name}'.`);
                        return;
                    }
                }
            }
        }
        const productPropertiesValues = propertyInputs
            .filter(p => p.value)
            .map((p, i) => {
                const prop = allProps.find(cp => cp.id === p.propertyId);
                return prop ? {
                    id: `ppv${Date.now()}_${i}`,
                    categoryPropertyId: prop.id,
                    categoryProperty: prop,
                    value: p.value,
                } : null;
            })
            .filter((x): x is Exclude<typeof x, null> => x !== null);
        const images = [...(product.images || [])];
        if (images.length > 1 && mainImageIdx < images.length) {
            const [mainImg] = images.splice(mainImageIdx, 1);
            images.unshift(mainImg);
        }
        onSubmit(
            {
                ...product,
                images,
                productPropertiesValues,
            },
            variants,
            mainImageIdx
        );
        if (!isEdit) {
            setProduct({
                title: "",
                description: "",
                price: "",
                stock: "",
                weight: "",
                height: "",
                width: "",
                depth: "",
                categoryId: "",
                subcategoryId: "",
                images: [],
                reviews: [],
                productPropertiesValues: [],
                isVerified: false,
            });
            setPropertyInputs([]);
            setMainImageIdx(0);
            setVariants([]);
            toast.success("Product added successfully.");
        } else {
            onOpenChange(false);
        }
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
