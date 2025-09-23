import { useRef, useState } from "react";
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
    attributeValues,
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
    const [imagePreviews, setImagePreviews] = useState<string[]>(initialProduct?.images?.map((img) => img.url) || []);
    const [variants, setVariants] = useState<ProductVariant[]>(initialVariants || []);
    const [mainImageIdx, setMainImageIdx] = useState<number>(0);
    const [propertyInputs, setPropertyInputs] = useState<{ propertyId: string; value: string }[]>(
        initialProduct?.productPropertiesValues?.map(ppv => ({
            propertyId: ppv.categoryPropertyId,
            value: ppv.value,
        })) || []
    );
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Category and Subcategory change handlers
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

    // Property value change handler
    const handlePropertyValueChange = (propertyId: string, value: string) => {
        setPropertyInputs((inputs) => {
            const existing = inputs.find((i) => i.propertyId === propertyId);
            if (existing) {
                return inputs.map((i) => i.propertyId === propertyId ? { ...i, value } : i);
            } else {
                return [...inputs, { propertyId, value }];
            }
        });
    };
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        Promise.all(
            Array.from(files).map(
                (file) =>
                    new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    })
            )
        ).then((imgs) => {
            const maxImages = 5;
            // Get current previews before updating
            const prev = imagePreviews;
            const uniqueImgs = imgs.filter((img) => !prev.includes(img));
            const hadDuplicate = uniqueImgs.length < imgs.length;
            let newPreviews = [...prev, ...uniqueImgs];
            const willExceed = newPreviews.length > maxImages;
            if (willExceed) {
                newPreviews = newPreviews.slice(0, maxImages);
            }
            setImagePreviews(newPreviews);
            setProduct((prevProduct) => {
                const prevImages = prevProduct.images || [];
                const uniqueNewImgs = uniqueImgs.filter((img) => !prevImages.some((im) => im.url === img));
                let newImgs: { id: string; url: string }[] = uniqueNewImgs.map((url, i) => ({ id: `img${Date.now()}_${i}`, url }));
                let allImgs = [...prevImages, ...newImgs];
                if (allImgs.length > maxImages) {
                    allImgs = allImgs.slice(0, maxImages);
                }
                return { ...prevProduct, images: allImgs };
            });
            if (newPreviews.length > 0 && prev.length === 0) setMainImageIdx(0);
            // Show only one toast after state update
            if (willExceed) {
                toast.error(`You can only upload up to 5 images.`);
            } else if (hadDuplicate) {
                toast.error("Duplicate image(s) detected. Only unique images will be added.");
            }
            // Reset file input so the same file can be selected again
            e.target.value = "";
        });

    };

    // Remove image handler
    const handleRemoveImage = (idx: number) => {
        setImagePreviews((prev) => {
            const newPreviews = prev.filter((_, i) => i !== idx);
            setProduct((prevProduct) => {
                const newImages = (prevProduct.images || []).filter((_, i) => i !== idx);
                return { ...prevProduct, images: newImages };
            });
            setMainImageIdx((prevMainIdx) => {
                if (prevMainIdx === idx) return 0;
                if (prevMainIdx > idx) return prevMainIdx - 1;
                return prevMainIdx;
            });
            return newPreviews;
        });
    };

    // Add Product handler
    const handleSubmit = () => {
        // List of fields to check: label, value, type ('number' or 'text'), required
        const fields = [
            { key: 'title', label: 'Product Title', type: 'text', required: true },
            { key: 'description', label: 'Description', type: 'text', required: true },
            { key: 'price', label: 'Price', type: 'number', required: true },
            { key: 'stock', label: 'Stock', type: 'number', required: true },
            { key: 'weight', label: 'Weight', type: 'number', required: true },
            { key: 'height', label: 'Height', type: 'number', required: true },
            { key: 'width', label: 'Width', type: 'number', required: true },
            { key: 'depth', label: 'Depth', type: 'number', required: true },
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
            setImagePreviews([]);
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
                    <select
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        value={product.subcategoryId}
                        onChange={e => handleSubcategoryChange(e.target.value)}
                        disabled={!product.categoryId}
                    >
                        <option value="">Select Subcategory</option>
                        {categories.find(cat => cat.id === product.categoryId)?.subcategories.map(sub => (
                            <option key={sub.id} value={sub.id}>{sub.name}</option>
                        ))}
                    </select>
                    <Label>Price</Label>
                    <input
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="Price"
                        type="text"
                        inputMode="decimal"
                        pattern="^[0-9]*\.?[0-9]*$"
                        value={product.price}
                        onChange={e => {
                            // Only allow numbers and dot
                            const val = e.target.value;
                            if (/^\d*\.?\d*$/.test(val) || val === "") {
                                setProduct((p: ProductForm) => ({ ...p, price: val }));
                            }
                        }}
                    />
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Label>Weight</Label>
                            <input
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                placeholder="Weight (kg)"
                                type="text"
                                inputMode="decimal"
                                pattern="^[0-9]*\.?[0-9]*$"
                                value={product.weight}
                                onChange={e => {
                                    const val = e.target.value;
                                    if (/^\d*\.?\d*$/.test(val) || val === "") {
                                        setProduct((p: ProductForm) => ({ ...p, weight: val }));
                                    }
                                }}
                            />
                        </div>
                        <div className="flex-1">
                            <Label>Height</Label>
                            <input
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                placeholder="Height (cm)"
                                type="text"
                                inputMode="decimal"
                                pattern="^[0-9]*\.?[0-9]*$"
                                value={product.height}
                                onChange={e => {
                                    const val = e.target.value;
                                    if (/^\d*\.?\d*$/.test(val) || val === "") {
                                        setProduct((p: ProductForm) => ({ ...p, height: val }));
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Label>Width</Label>
                            <input
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                placeholder="Width (cm)"
                                type="text"
                                inputMode="decimal"
                                pattern="^[0-9]*\.?[0-9]*$"
                                value={product.width}
                                onChange={e => {
                                    const val = e.target.value;
                                    if (/^\d*\.?\d*$/.test(val) || val === "") {
                                        setProduct((p: ProductForm) => ({ ...p, width: val }));
                                    }
                                }}
                            />
                        </div>
                        <div className="flex-1">
                            <Label>Depth</Label>
                            <input
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                placeholder="Depth (cm)"
                                type="text"
                                inputMode="decimal"
                                pattern="^[0-9]*\.?[0-9]*$"
                                value={product.depth}
                                onChange={e => {
                                    const val = e.target.value;
                                    if (/^\d*\.?\d*$/.test(val) || val === "") {
                                        setProduct((p: ProductForm) => ({ ...p, depth: val }));
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <Label>In Stock</Label>
                    <input
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="In Stock"
                        type="text"
                        inputMode="decimal"
                        pattern="^[0-9]*\.?[0-9]*$"
                        value={product.stock}
                        onChange={e => {
                            const val = e.target.value;
                            if (/^\d*\.?\d*$/.test(val) || val === "") {
                                setProduct((p: ProductForm) => ({ ...p, stock: val }));
                            }
                        }}
                    />
                </div>
                {/* Properties, variants, and images (move below on mobile, right on desktop) */}
                <div className="flex-1 flex flex-col space-y-4 order-2">
                    {(product.categoryId || product.subcategoryId) && (
                        <div>
                            <label className="block font-medium mb-1 text-indigo-700">Product Properties</label>
                            <div className="space-y-2">
                                {(categoryProperties[product.categoryId] || []).map((prop) => {
                                    const values = attributeValues.filter(av => av.propertyId === prop.id);
                                    const selected = propertyInputs.find(p => p.propertyId === prop.id)?.value || "";
                                    return (
                                        <div key={prop.id} className="flex gap-2 items-center">
                                            <span className="w-32 text-gray-700 text-sm">{prop.name}</span>
                                            <select
                                                className="border rounded px-2 py-1 flex-1"
                                                value={selected}
                                                onChange={e => handlePropertyValueChange(prop.id, e.target.value)}
                                            >
                                                <option value="">Select {prop.name}</option>
                                                {values.map(av => (
                                                    <option key={av.id} value={av.name}>{av.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    );
                                })}
                                {(subcategoryProperties[product.subcategoryId] || []).map((prop) => {
                                    const values = attributeValues.filter(av => av.propertyId === prop.id);
                                    const selected = propertyInputs.find(p => p.propertyId === prop.id)?.value || "";
                                    return (
                                        <div key={prop.id} className="flex gap-2 items-center">
                                            <span className="w-32 text-gray-700 text-sm">{prop.name}</span>
                                            <select
                                                className="border rounded px-2 py-1 flex-1"
                                                value={selected}
                                                onChange={e => handlePropertyValueChange(prop.id, e.target.value)}
                                            >
                                                <option value="">Select {prop.name}</option>
                                                {values.map(av => (
                                                    <option key={av.id} value={av.name}>{av.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    {/* Product Variants */}
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
                    {/* Image upload */}
                    <div>
                        <label className="block font-medium mb-1 text-indigo-700">Product Images</label>
                        <div className="flex flex-wrap gap-3 mb-2">
                            {imagePreviews.map((img, idx) => (
                                <div key={idx} className="relative group">
                                    <img
                                        src={img}
                                        alt="preview"
                                        className={`w-16 h-16 object-cover rounded-lg border ${mainImageIdx === idx ? 'border-4 border-indigo-500' : 'border-indigo-200'} shadow cursor-pointer`}
                                        onClick={() => setMainImageIdx(idx)}
                                        title={mainImageIdx === idx ? 'Main Image' : 'Set as Main'}
                                    />
                                    {mainImageIdx === idx && (
                                        <span className="absolute top-0 left-0 bg-indigo-500 text-white text-xs px-1 rounded-br">Main</span>
                                    )}
                                    <button
                                        className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full text-red-500 px-1.5 py-0.5 text-xs shadow group-hover:opacity-100 opacity-70"
                                        onClick={() => handleRemoveImage(idx)}
                                        type="button"
                                        aria-label="Remove image"
                                    >×</button>
                                </div>
                            ))}
                            <button
                                className="w-16 h-16 flex items-center justify-center border-2 border-dashed border-indigo-300 rounded-lg text-indigo-400 hover:bg-indigo-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={imagePreviews.length >= 5}
                            >
                                +
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </div>
                        {imagePreviews.length > 0 && (
                            <div>
                                <div className="text-xs text-gray-500">Click an image to set as main (thumbnail).</div>
                                <div className="text-xs text-gray-500">You can upload only 5 images.</div>
                            </div>
                        )}
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
