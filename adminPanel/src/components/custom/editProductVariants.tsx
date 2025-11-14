import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type ProductVariant = {
  id?: string;
  sku?: string;
  price?: number;
  stock?: number;
  attributes?: { name: string; value: string }[];
};

interface Props {
  variants: ProductVariant[];
  onChange: (v: ProductVariant[]) => void;
  categoryId?: string;
  subcategoryId?: string;
  disableAdd?: boolean;
}

export default function EditProductVariants({ variants, onChange, disableAdd }: Props) {
  const handleAdd = () => {
    const next: ProductVariant = { id: undefined, sku: "", price: 0, stock: 0, attributes: [] };
    onChange([...variants, next]);
  };

  const handleRemove = (idx: number) => {
    const copy = [...variants];
    copy.splice(idx, 1);
    onChange(copy);
  };

  const handleUpdateField = (idx: number, field: keyof ProductVariant, value: any) => {
    const copy = [...variants];
    (copy[idx] as any)[field] = value;
    onChange(copy);
  };

  return (
    <div className="space-y-2">
      {variants.map((v, i) => (
        <div key={i} className="p-2 border rounded flex items-center gap-2">
          <Input
            className="w-32"
            value={v.sku || ""}
            onChange={(e) => handleUpdateField(i, "sku", e.target.value)}
            placeholder="SKU"
          />
          <Input
            className="w-24"
            type="number"
            value={v.price?.toString() || "0"}
            onChange={(e) => handleUpdateField(i, "price", Number(e.target.value))}
            placeholder="Price"
          />
          <Input
            className="w-24"
            type="number"
            value={v.stock?.toString() || "0"}
            onChange={(e) => handleUpdateField(i, "stock", Number(e.target.value))}
            placeholder="Stock"
          />
          <Button variant="destructive" onClick={() => handleRemove(i)}>Remove</Button>
        </div>
      ))}
      <div>
        <Button onClick={handleAdd} disabled={disableAdd}>Add Variant</Button>
      </div>
    </div>
  );
}
