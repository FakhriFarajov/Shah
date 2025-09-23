import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { ProductVariant, ProductVariantAttributeValue } from "../../pages/products";
// Add mainImageIdx to ProductVariant type via intersection
type VariantWithMain = ProductVariant & { mainImageIdx?: number };

type CategoryProperty = { id: string; name: string; categoryId: string };

interface EditProductVariantsProps {
    variants: VariantWithMain[];
    onChange: (variants: VariantWithMain[]) => void;
    categoryId: string;
    subcategoryId: string;
    disableAdd?: boolean;
}

// Dummy data for properties and attribute values (should be passed as props or imported from a shared file in a real app)
const categoryProperties: { [categoryId: string]: CategoryProperty[] } = {
    "electronics-1": [
        { id: "color-1", name: "Color", categoryId: "electronics-1" },
        { id: "size-1", name: "Size", categoryId: "electronics-1" },
    ],
    "fashion-1": [
        { id: "material-1", name: "Material", categoryId: "fashion-1" },
        { id: "brand-1", name: "Brand", categoryId: "fashion-1" },
    ],
};
const subcategoryProperties: { [subcategoryId: string]: CategoryProperty[] } = {
    "phones-1": [
        { id: "screen-1", name: "Screen Size", categoryId: "electronics-1" },
        { id: "os-1", name: "Operating System", categoryId: "electronics-1" }
    ],
    "laptops-1": [
        { id: "ram-1", name: "RAM", categoryId: "electronics-1" },
        { id: "cpu-1", name: "CPU", categoryId: "electronics-1" }
    ],
    "mens-1": [
        { id: "pattern-1", name: "Pattern", categoryId: "fashion-1" },
    ],
    "womens-1": [
        { id: "length-1", name: "Length", categoryId: "fashion-1" },
    ],
};
const attributeValues = [
    { id: "av1", name: "Red", propertyId: "color-1" },
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

function EditProductVariants({ variants, onChange, categoryId, subcategoryId, disableAdd }: EditProductVariantsProps) {
    // Helper to update images for a variant
        // Helper to compare attributeValues arrays
    function areAttributeValuesEqual(a: ProductVariantAttributeValue[], b: ProductVariantAttributeValue[]) {
        if (a.length !== b.length) return false;
        const aSorted = [...a].map(av => av.attributeValueId).sort();
        const bSorted = [...b].map(av => av.attributeValueId).sort();
        return aSorted.every((val, idx) => val === bSorted[idx]);
    }
    function handleVariantImagesChange(idx: number, files: FileList | null) {
        if (!files) return;
        const maxImages = 5;
        const fileArr = Array.from(files).slice(0, maxImages);
        Promise.all(
            fileArr.map(
                (file) =>
                    new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    })
            )
        ).then((imgs) => {
            // Only store base64 strings in images property
            const updated = (variants || []).map((v, i) => {
                if (i !== idx) return v;
                const existingImages = v.images || [];
                // Filter out images that already exist (by base64 string)
                const uniqueImgs = imgs.filter(img => !existingImages.includes(img));
                const newImages = [...existingImages, ...uniqueImgs].slice(0, maxImages);
                return {
                    ...v,
                    images: newImages,
                    mainImageIdx: v.mainImageIdx !== undefined ? v.mainImageIdx : 0,
                };
            });
            onChange(updated);
        });
    }
    function handleRemoveVariantImage(idx: number, imgIdx: number) {
        const updated = (variants || []).map((v, i) => {
            if (i !== idx) return v;
            const newImages = (v.images || []).filter((_, j) => j !== imgIdx);
            let newMainIdx = v.mainImageIdx || 0;
            if (newMainIdx >= newImages.length) newMainIdx = 0;
            return { ...v, images: newImages, mainImageIdx: newMainIdx };
        });
        onChange(updated);
    }

    function handleSetMainImage(idx: number, imgIdx: number) {
        const updated = (variants || []).map((v, i) =>
            i === idx ? { ...v, mainImageIdx: imgIdx } : v
        );
        onChange(updated);
    }
    const catProps = categoryProperties[categoryId] || [];
    const subProps = subcategoryProperties[subcategoryId] || [];
    const allProps = [...catProps, ...subProps];


    function getAttributeValues(propertyId: string) {
        return attributeValues.filter((av) => av.propertyId === propertyId);
    }

    function handleVariantChange(idx: number, field: keyof ProductVariant, value: any) {
        const updated = (variants || []).map((v: ProductVariant, i: number) => i === idx ? { ...v, [field]: value } : v);
        onChange(updated);
    }
    function handleAttributeValueChange(idx: number, propertyId: string, value: string) {
        const updated = (variants || []).map((v: ProductVariant, i: number) => {
            if (i !== idx) return v;
            let attrValues = v.attributeValues.filter((av: ProductVariantAttributeValue) => av.productVariantId !== v.id || av.attributeValueId.split('___')[0] !== propertyId);
            attrValues = attrValues.filter(av => av.attributeValueId.split('___')[0] !== propertyId || (av.attributeValueId.split('___')[1] !== undefined && av.attributeValueId.split('___')[1] !== ""));
            return {
                ...v,
                attributeValues: [...attrValues, { productVariantId: v.id, attributeValueId: propertyId + '___' + value }],
            };
        });
        // Check for duplicate variants (excluding the one being edited)
        const newAttrValues = updated[idx].attributeValues;
        const isDuplicate = updated.some((v, i) => i !== idx && areAttributeValuesEqual(v.attributeValues, newAttrValues));
        if (isDuplicate) {
            toast.error("A variant with the same properties already exists.");
            return;
        }
        onChange(updated);
    }
    function handleAddVariant() {
        if (disableAdd) return;
        const newId = `var${Date.now()}_${Math.random()}`;
        const newVariant = {
            id: newId,
            productId: "",
            stock: 0,
            price: 0,
            attributeValues: allProps.map(() => ({ productVariantId: newId, attributeValueId: "" })),
            images: [],
        };
        // Check for duplicate
        const isDuplicate = (variants || []).some(v => areAttributeValuesEqual(v.attributeValues, newVariant.attributeValues));
        if (isDuplicate) {
            toast.error("A variant with the same properties already exists.");
            return;
        }
        onChange([...(variants || []), newVariant]);
    }
    function handleRemoveVariant(idx: number) {
        onChange((variants || []).filter((_, i: number) => i !== idx));
    }


    // Block Add Variant button if any variant is missing an image
    const anyVariantMissingImage = (variants || []).some(v => !v.images || v.images.length === 0);
    return (
        <div className="space-y-4">
            {/* Validation: show error if any variant has no image on save attempt */}
            {/* Call validateAllVariantsHaveImages() before parent save/submit if needed */}
            <div className="max-h-70 overflow-y-auto pr-2">
                {(variants || []).map((variant: ProductVariant, idx: number) => (
                    <div key={variant.id} className="border rounded-lg p-4 mb-2 bg-gray-50">
                        <div className="flex gap-4 mb-2">
                            <div className="flex-1">
                                <Label>Stock</Label>
                                <input
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    placeholder="Stock"
                                    type="text"
                                    inputMode="decimal"
                                    pattern="^[0-9]*\.?[0-9]*$"
                                    value={typeof variant.stock === "number" && !isNaN(variant.stock) ? variant.stock : (typeof variant.stock === "string" ? variant.stock : "")}
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (/^\d*\.?\d*$/.test(val) || val === "") {
                                            handleVariantChange(idx, "stock", val === "" ? "" : Number(val));
                                        }
                                    }}
                                />
                            </div>
                            <div className="flex-1">
                                <Label>Price</Label>
                                <input
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    placeholder="Price"
                                    type="text"
                                    inputMode="decimal"
                                    pattern="^[0-9]*\.?[0-9]*$"
                                    value={typeof variant.price === "number" && !isNaN(variant.price) ? variant.price : (typeof variant.price === "string" ? variant.price : "")}
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (/^\d*\.?\d*$/.test(val) || val === "") {
                                            handleVariantChange(idx, "price", val === "" ? "" : Number(val));
                                        }
                                    }}
                                />
                            </div>
                            <Button type="button" variant="destructive" className="h-8 mt-6" onClick={() => handleRemoveVariant(idx)}>-</Button>
                        </div>
                        {/* Variant Images */}
                        <div className="mb-2">
                            <Label>Variant Images</Label>
                            <div className="flex flex-wrap gap-2 mb-1">
                                {(variant.images || []).map((img, imgIdx: number) => (
                                    <div key={imgIdx} className={`relative group ${variant.mainImageIdx === imgIdx ? ' ring-indigo-500' : ''}`}>
                                        <img
                                            src={img}
                                            alt="variant preview"
                                            className={`w-12 h-12 object-cover rounded border ${variant.mainImageIdx === imgIdx ? 'border-4 border-indigo-500' : 'border-indigo-200'} shadow cursor-pointer`}
                                            onClick={() => handleSetMainImage(idx, imgIdx)}
                                            title={variant.mainImageIdx === imgIdx ? 'Main Image' : 'Set as Main'}
                                        />
                                        {variant.mainImageIdx === imgIdx && (
                                            <span className="absolute top-0 left-0 bg-indigo-500 text-white text-xs px-1 rounded-br">Main</span>
                                        )}
                                        <button
                                            className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full text-red-500 px-1 py-0.5 text-xs shadow group-hover:opacity-100 opacity-70"
                                            onClick={() => handleRemoveVariantImage(idx, imgIdx)}
                                            type="button"
                                            aria-label="Remove variant image"
                                        >×</button>
                                    </div>
                                ))}
                                <label className="w-12 h-12 flex items-center justify-center border-2 border-dashed border-indigo-300 rounded-lg text-indigo-400 hover:bg-indigo-50 focus:outline-none cursor-pointer">
                                    +
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={e => handleVariantImagesChange(idx, e.target.files)}
                                        disabled={variant.images && variant.images.length >= 5}
                                    />
                                </label>
                                {variant.images && variant.images.length > 0 && (
                                    <div className="text-xs text-gray-500 w-full">Click an image to set as main (thumbnail).</div>
                                )}
                            </div>
                            {variant.images && variant.images.length > 0 && (
                                <div className="text-xs text-gray-500">Up to 5 images per variant.</div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2">
                            {allProps.map((prop: CategoryProperty) => {
                                const attr = variant.attributeValues.find((av: ProductVariantAttributeValue) => av.attributeValueId.startsWith(prop.id + '___'));
                                const val = attr ? attr.attributeValueId.split('___')[1] : "";
                                const values = getAttributeValues(prop.id);
                                return (
                                    <div key={prop.id} className="flex flex-col">
                                        <Label>{prop.name}</Label>
                                        <select
                                            className="border rounded px-2 py-1"
                                            value={val}
                                            onChange={e => handleAttributeValueChange(idx, prop.id, e.target.value)}
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
                ))}
            </div>
            {!disableAdd && (
                <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAddVariant}
                    disabled={anyVariantMissingImage}
                    title={anyVariantMissingImage ? "Add an image to all variants before adding a new one" : undefined}
                >
                    Add Variant
                </Button>
            )}
        </div>
    );
}

export default EditProductVariants;