import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { ProductVariant, ProductVariantAttributeValue } from "../../pages/productsPage";

type CategoryProperty = { id: string; name: string; categoryId: string };

interface ProductVariantsProps {
    variants: ProductVariant[];
    onChange: (variants: ProductVariant[]) => void;
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

function ProductVariants({ variants, onChange, categoryId, subcategoryId, disableAdd }: ProductVariantsProps) {
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
        onChange(updated);
    }
    function handleAddVariant() {
        if (disableAdd) return;
        const newId = `var${Date.now()}_${Math.random()}`;
        onChange([
            ...(variants || []),
            {
                id: newId,
                productId: "",
                stock: 0,
                price: 0,
                attributeValues: allProps.map(() => ({ productVariantId: newId, attributeValueId: "" })),
            },
        ]);
    }
    function handleRemoveVariant(idx: number) {
        onChange((variants || []).filter((_, i: number) => i !== idx));
    }
    return (
        <div className="space-y-4">
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
                <Button type="button" variant="secondary" onClick={handleAddVariant}>Add Variant</Button>
            )}
        </div>
    );
}

export default ProductVariants;