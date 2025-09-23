import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ListCollapse } from "lucide-react";
type Review = { id: string; rating: number; comment: string };
type Image = { id: string; url: string };
type CategoryProperty = { id: string; name: string; categoryId: string };
type ProductPropertiesValue = {
    id: string;
    productId?: string;
    categoryPropertyId: string;
    categoryProperty: CategoryProperty;
    value: string;
};
type ProductVariantAttributeValue = {
    productVariantId: string;
    attributeValueId: string;
};
type ProductVariant = {
    id: string;
    productId: string;
    stock: number;
    price: number;
    attributeValues: ProductVariantAttributeValue[];
    images?: string[];
    variantPropertiesValues?: any[];
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

interface ProductDetailsModalProps {
    row: Product;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ProductDetailsModal({ row, open, onOpenChange }: ProductDetailsModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>

            <DialogTrigger asChild>
                <Button className="bg-transparent cursor-pointer hover:bg-indigo-100" title="Details">
                    <ListCollapse className="text-indigo-600 hover:bg-indigo-100" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl min-w-[1000px] w-full">
                <DialogTitle className="text-xl font-bold mb-2 break-words">{row.title}</DialogTitle>
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left: Product details */}
                    <div className="flex-1 flex flex-col gap-2 min-w-0">
                        {row.images?.length > 0 && (
                            <div className="flex gap-2 flex-wrap mb-2">
                                {row.images.map((img: Image) => (
                                    <img key={img.id} src={img.url} alt="product" className="w-16 h-16 rounded object-cover" />
                                ))}
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                            <div className="truncate"><b>ID:</b> {row.id}</div>
                            <div className="truncate"><b>Title:</b> {row.title}</div>
                            <div className="truncate"><b>Description:</b> {row.description}</div>
                            <div className="truncate"><b>Stock:</b> {row.stock}</div>
                            <div className="truncate"><b>Price:</b> ${row.price}</div>
                            <div className="truncate"><b>Weight:</b> {row.weight} kg</div>
                            <div className="truncate"><b>Height:</b> {row.height} cm</div>
                            <div className="truncate"><b>Width:</b> {row.width} cm</div>
                            <div className="truncate"><b>Depth:</b> {row.depth} cm</div>
                            <div className="truncate"><b>Categories:</b> {row.categoryId} / {row.subcategoryId}</div>
                        </div>

                        {row.productPropertiesValues?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {row.productPropertiesValues.map((ppv: ProductPropertiesValue) => (
                                    <span
                                        key={ppv.id}
                                        className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs"
                                    >
                                        {ppv.categoryProperty?.name
                                            ? `${ppv.categoryProperty.name}: ${ppv.value}`
                                            : ppv.value}
                                    </span>
                                ))}
                            </div>
                        )}

                        {row.reviews?.length > 0 && (
                            <div className="mt-2 flex items-center gap-1 text-yellow-500 text-sm">
                                <span>★</span>
                                <span>{(
                                    row.reviews.reduce((acc: number, r: Review) => acc + r.rating, 0) / row.reviews.length
                                ).toFixed(1)}</span>
                                <span className="text-gray-400">({row.reviews.length})</span>
                            </div>
                        )}
                    </div>

                    {/* Right: Variants */}
                    {Array.isArray(row.variants) && row.variants.length > 0 && (
                        <div className="flex-1 min-w-0 mt-0">
                            <b>Variants:</b>
                            <div className="space-y-4 mt-1 max-h-64 overflow-y-auto">
                                {(row.variants ?? []).map((variant: ProductVariant) => (
                                    <div key={variant.id} className="border rounded p-3 bg-gray-50 flex flex-col gap-2">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-xs text-gray-700"><b>Stock:</b> {variant.stock}</span>
                                            <span className="text-xs text-gray-700"><b>Price:</b> ${variant.price}</span>
                                        </div>
                                        {Array.isArray(variant.images) && variant.images.length > 0 && (
                                            <div className="flex gap-2 mb-1">
                                                {variant.images.map((img: string, imgIdx: number) => (
                                                    <div
                                                        key={imgIdx}
                                                        className={`relative group ${(variant as any).mainImageIdx === imgIdx ? "ring-indigo-500" : ""}`}
                                                        style={{ position: "relative" }}
                                                    >
                                                        <img
                                                            src={img}
                                                            alt="variant"
                                                            className={`w-12 h-12 object-cover rounded border ${(variant as any).mainImageIdx === imgIdx
                                                                ? "border-4 border-indigo-500"
                                                                : "border-indigo-200"
                                                                } shadow`}
                                                        />
                                                        {(variant as any).mainImageIdx === imgIdx && (
                                                            <span className="absolute top-0 left-0 bg-indigo-500 text-white text-xs px-1 rounded-br">
                                                                Main
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {Array.isArray(variant.attributeValues) && variant.attributeValues.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {variant.attributeValues
                                                    .map((av: any, idx: number) => {
                                                        const [property, value] = av.attributeValueId.split('___');
                                                        if (!property || !value) return null;
                                                        return (
                                                            <span
                                                                key={idx}
                                                                className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-xs"
                                                            >
                                                                {property}: {value}
                                                            </span>
                                                        );
                                                    })
                                                    .filter(Boolean)
                                                }
                                            </div>
                                        )}

                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
