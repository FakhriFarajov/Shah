import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getAllCategoriesWithAttributesAndValuesAsync } from "@/features/profile/Category/category.service";
import ImageCropper from "@/components/ui/image-crop";
import { uploadImage, getProfileImage } from "@/shared/utils/imagePost";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getDetails } from "@/features/profile/Product/Product.service";
import { toast } from "sonner";
import type { SyncCategoryItemDto } from "@/features/profile/DTOs/seller.interfaces";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/custom/Navbar/navbar";
import { AppSidebar } from "@/components/custom/sidebar";
import { apiCallWithManualRefresh } from "@/shared/apiWithManualRefresh";

import { syncProduct } from "@/features/profile/Product/Product.service";
import type { ProductSyncRequest } from "@/shared/types/productCreate.interfaces";
import { useNavigate } from "react-router-dom";

export default function ProductsEditOrAddPage() {
    const [searchParams] = useSearchParams();
    const productId = searchParams.get("productId");
    const isEdit = !!productId;
    const [categories, setCategories] = useState<SyncCategoryItemDto[]>([]);
    const navigator = useNavigate();
    function generateGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    useEffect(() => {
        async function fetchInitialData() {
            const cats = await getAllCategoriesWithAttributesAndValuesAsync();
            setCategories(cats);
            // Fetch seller profile to get storeInfoId
            if (isEdit && productId) {
                try {
                    const productResponse = await apiCallWithManualRefresh(() => getDetails(productId));
                    if (productResponse.data) {
                        const prodData = productResponse.data;
                        setProduct({
                            id: prodData.id,
                            categoryId: prodData.categoryId,
                            storeInfoId: prodData.storeInfoId
                        });
                        // Find all attributes for the product's category
                        let allAttrs: any[] = [];
                        let currentCat = cats.find((c: any) => c.id === prodData.categoryId);
                        while (currentCat) {
                            if (currentCat.attributes) {
                                allAttrs = [...currentCat.attributes, ...allAttrs];
                            }
                            if (!currentCat.parentCategoryId) break;
                            currentCat = cats.find((c: any) => c.id === currentCat.parentCategoryId);
                        }
                        // Fetch image URLs for each variant's images
                        const mappedVariants = await Promise.all((prodData.variants || []).map(async (v: any) => {
                            let images: any[] = [];
                            if (v.images && Array.isArray(v.images)) {
                                images = await Promise.all(v.images.map(async (image: any) => {
                                    const objectName = image.objectName || image.imageUrl;
                                    if (objectName) {
                                        try {
                                            const url = await getProfileImage(objectName);
                                            return { ...image, imageUrl: url };
                                        } catch (e) {
                                            return image;
                                        }
                                    }
                                    return image;
                                }));
                            }
                            // Map attributeValues for select to show correct selected value
                            const attributeValues = allAttrs.map((attr: any) => {
                                // Find the valueId for this attribute in attributeValueIds
                                let valueId = "";
                                if (Array.isArray(v.attributeValueIds)) {
                                    valueId = v.attributeValueIds.find((valId: string) => (attr.values || []).some((val: any) => val.id === valId)) || "";
                                }
                                return {
                                    productVariantId: v.id,
                                    attributeId: attr.id,
                                    attributeValueId: attr.id + "___" + valueId // for select compatibility
                                };
                            });
                            return {
                                id: v.id,
                                title: v.title,
                                description: v.description,
                                weight: v.weightInGrams,
                                stock: v.stock,
                                price: v.price,
                                discountPrice: v.discountPrice,
                                images,
                                mainImageIdx: images.findIndex((img: any) => img.isMain),
                                attributeValues
                            };
                        }));
                        setVariants(mappedVariants);
                    } else {
                        toast.error('Failed to fetch product data');
                    }
                } catch (err) {
                    toast.error('Error fetching product data');
                }
            }
        }
        fetchInitialData();
    }, []);
    // Update attribute value for a variant
    function handleAttributeValueChange(variantIdx: number, attributeId: string, valueId: string) {
        setVariants((prevVariants: any[]) => {
            return prevVariants.map((variant, idx) => {
                if (idx !== variantIdx) return variant;
                let updated = false;
                let updatedAttributeValues = (variant.attributeValues || []).map((av: any) => {
                    // Match by attributeId or prefix
                    if ((av.attributeId === attributeId) || (av.attributeValueId && av.attributeValueId.startsWith(attributeId + '___'))) {
                        updated = true;
                        return { ...av, attributeId, attributeValueId: attributeId + '___' + valueId };
                    }
                    return av;
                });
                // If not found, add new
                if (!updated) {
                    updatedAttributeValues = [
                        ...updatedAttributeValues,
                        { productVariantId: variant.id, attributeId, attributeValueId: attributeId + '___' + valueId }
                    ];
                }
                return { ...variant, attributeValues: updatedAttributeValues };
            });
        });
    }
    const [cropDialogOpen, setCropDialogOpen] = useState(false);
    const [pendingVariantIdx, setPendingVariantIdx] = useState<number | null>(null);

    function handlePlusClick(idx: number) {
        setPendingVariantIdx(idx);
        setCropDialogOpen(true);
    }
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [isImageProcessing, setIsImageProcessing] = useState(false);
    const handleCropDone = async (croppedUrl: string) => {
        if (pendingVariantIdx == null) return;
        setIsImageProcessing(true);
        try {
            const response = await fetch(croppedUrl);
            const blob = await response.blob();
            const file = new File([blob], "avatar.png", { type: blob.type });
            setVariants((prevVariants) => prevVariants.map((variant, idx) => {
                if (idx !== pendingVariantIdx) return variant;
                const newImages = [...(variant.images || []), file];
                return {
                    ...variant,
                    images: newImages,
                    mainImageIdx: newImages.length - 1, // set the new image as main
                };
            }));
            setPreviewImages((prev) => [...prev, croppedUrl]);
            setCropDialogOpen(false);
            toast.success("Avatar cropped and ready!");
        } catch (err) {
            toast.error("Failed to process cropped image.");
        } finally {
            setTimeout(() => setIsImageProcessing(false), 200); // allow state to update
        }
    };
    function handleRemoveVariantImage(variantIdx: number, imgIdx: number) {
        setVariants((prevVariants) => prevVariants.map((variant, idx) => {
            if (idx !== variantIdx) return variant;
            return {
                ...variant,
                images: (variant.images || []).filter((_: File, j: number) => j !== imgIdx),
            };
        }));
    }
    // Store the selected main image index in a variable and also save it in a separate state for files
    function handleSetMainImage(variantIdx: number, imgIdx: number) {
        setVariants((prevVariants) => prevVariants.map((variant, idx) => {
            if (idx !== variantIdx) return variant;
            return {
                ...variant,
                mainImageIdx: imgIdx,
            };
        }));
    }
    function handleVariantChange(idx: number, field: keyof any, value: any) {
        // For price, stock, weight, discountPrice: store as string for editing
        const updated = (variants || []).map((v: any, i: number) => {
            if (i !== idx) return v;
            return { ...v, [field]: value };
        });
        setVariants(updated);
    }
    function handleAddVariant() {
        if (disableAdd) return;
        const newId = `var${Date.now()}_${Math.random()}`;
        // Collect all attributes from selected category and its parent chain
        function getAllParentAttributes(catId: string, cats: any[]): any[] {
            let allAttrs: any[] = [];
            let current = cats.find(c => c.id === catId);
            while (current) {
                if (current.attributes) {
                    allAttrs = [...current.attributes, ...allAttrs];
                }
                if (!current.parentCategoryId) break;
                current = cats.find(c => c.id === current.parentCategoryId);
            }
            return allAttrs;
        }
        const allAttributes = product.categoryId ? getAllParentAttributes(product.categoryId, categories) : [];
        const newVariant = {
            id: newId,
            productId: "",
            stock: null,
            price: null,
            weight: null,
            discountPrice: null,
            attributeValues: allAttributes.map((attr: any) => ({ productVariantId: newId, attributeValueId: attr.id + "___" })),
            images: [],
        };
        setVariants([...(variants || []), newVariant]);
    }
    function handleRemoveVariant(idx: number) {
        setVariants((variants || []).filter((_, i: number) => i !== idx));
    }

    const [product, setProduct] = useState<any>([]);
    const [variants, setVariants] = useState<any[]>([]);

    // Allow adding variants regardless of images
    const disableAdd = false;

    function handleCategoryChange(categoryId: string) {
        setProduct((p: any) => ({ ...p, categoryId }));
    }
    const handleSubmit = async () => {
        try {
            // Check that all required product-level fields are filled
            if (!product.categoryId) {
                toast.error('Please select a category.');
                return;
            }
            if (!product.storeInfoId) {
                toast.error('Store info is missing.');
                return;
            }
            // Check that all variants have all attribute values selected and required fields filled
            const allAttrs = (() => {
                let attrs: any[] = [];
                let current = categories.find(c => c.id === product.categoryId);
                while (current) {
                    if (current.attributes) {
                        attrs = [...current.attributes, ...attrs];
                    }
                    if (!current.parentCategoryId) break;
                    current = categories.find(c => c.id === current.parentCategoryId);
                }
                return attrs;
            })();
            for (const [variantIdx, variant] of (variants || []).entries()) {
                // Check required fields
                if (!variant.title || typeof variant.title !== "string" || variant.title.trim() === "") {
                    toast.error(`Please enter a title for variant ${variantIdx + 1}.`);
                    return;
                }
                if (!variant.description || typeof variant.description !== "string" || variant.description.trim() === "") {
                    toast.error(`Please enter a description for variant ${variantIdx + 1}.`);
                    return;
                }
                if (!variant.price || isNaN(Number(variant.price))) {
                    toast.error(`Please enter a valid price for variant ${variantIdx + 1}.`);
                    return;
                }
                if (variant.discountPrice && (isNaN(Number(variant.discountPrice)) || Number(variant.discountPrice) > Number(variant.price))) {
                    toast.error(`Discount price for variant ${variantIdx + 1} must be a valid number and not higher than the price.`);
                    return;
                }
                if (!variant.stock || isNaN(Number(variant.stock))) {
                    toast.error(`Please enter a valid stock for variant ${variantIdx + 1}.`);
                    return;
                }
                if (!variant.weight || isNaN(Number(variant.weight))) {
                    toast.error(`Please enter a valid weight for variant ${variantIdx + 1}.`);
                    return;
                }
                if (!variant.images || variant.images.length === 0) {
                    toast.error(`Please add at least one image for variant ${variantIdx + 1}.`);
                    return;
                }
                for (const attr of allAttrs) {
                    const found = Array.isArray(variant.attributeValues)
                        ? variant.attributeValues.find((av: any) => av && (av.attributeId === attr.id || (av.attributeValueId && av.attributeValueId.startsWith(attr.id + '___'))))
                        : null;
                    let valueId = "";
                    if (found && found.attributeValueId) {
                        const parts = found.attributeValueId.split('___');
                        valueId = parts.length > 1 ? parts[1] : parts[0];
                    }
                    if (!valueId) {
                        toast.error(`Please select a value for attribute '${attr.name}' in variant ${variantIdx + 1}.`);
                        return;
                    }
                }
            }
            const variantsWithMinioImages = await Promise.all(
                variants.map(async (v: any) => {
                    const minioImages = await Promise.all(
                        (v.images || []).map(async (img: any, idx: number) => {
                            let isMain = v.mainImageIdx === idx;
                            if (img instanceof File) {
                                try {
                                    const objectName = await uploadImage(img);
                                    return { objectName, isMain };
                                } catch (err) {
                                    toast.error('Image upload failed');
                                    return null;
                                }
                            } else if (img.objectName) {
                                return { objectName: img.objectName, isMain };
                            } else if (img.imageUrl) {
                                // fallback: extract objectName from imageUrl if possible
                                const parts = img.imageUrl.split('/');
                                let fileName = parts[parts.length - 1];
                                if (fileName.includes('?')) {
                                    fileName = fileName.split('?')[0];
                                }
                                return { objectName: fileName, isMain };
                            }
                            return null;
                        })
                    );
                    return {
                        ...v,
                        images: minioImages.filter(Boolean)
                    };
                })
            );
            const syncPayload: ProductSyncRequest = {
                categoryId: product.categoryId || null,
                variants: (variantsWithMinioImages || []).map((v: any) => {
                    // Find the main image index after filtering
                    const images = (v.images || []).map((img: any) => {
                        let objectName = img.objectName || img.imageUrl || "";
                        if (typeof objectName === 'string' && objectName.includes('?')) {
                            objectName = objectName.split('?')[0];
                        }
                        // Null/undefined checks for image fields
                        return {
                            id: img.id ? String(img.id) : generateGuid(),
                            imageUrl: objectName ? String(objectName) : '',
                        };
                    }).filter(img => img.imageUrl); // Remove images with empty url
                    let mainIdx = v.mainImageIdx;
                    if (mainIdx == null || mainIdx < 0 || mainIdx >= images.length) mainIdx = 0;
                    const imagesWithMain = images.map((img, idx) => ({
                        ...img,
                        isMain: idx === mainIdx
                    }));
                    // Null/undefined checks for variant fields
                    return {
                        id: v.id ? String(v.id) : generateGuid(),
                        title: v.title ? String(v.title) : '',
                        description: v.description ? String(v.description) : '',
                        weightInGrams: v.weight ? Number(v.weight) : 0,
                        stock: v.stock ? Number(v.stock) : 0,
                        price: v.price ? Number(v.price) : 0,
                        discountPrice: v.discountPrice != null ? Number(v.discountPrice) : 0,
                        images: imagesWithMain,
                        attributeValueIds: (v.attributeValues || [])
                            .map((av: any) => {
                                if (av && av.attributeValueId) {
                                    const parts = av.attributeValueId.split("___");
                                    return parts.length > 1 ? parts[1] : parts[0];
                                }
                                return "";
                            })
                            .filter(Boolean)
                    };
                })
            };
            const response = await apiCallWithManualRefresh(() => syncProduct(productId, syncPayload));
            console.log("Sync response:", response);
            toast.success("Product synced successfully!");
        } catch (error) {
            toast.error('Failed to submit product');
        }
        finally {
            navigator('/products');
        }
    };
    return (
        <>
            <Navbar></Navbar>
            <div className="min-h-screen flex">
                <AppSidebar />
                <div className="max-w-5xl w-full min-w-0 xl:min-w-[900px] mx-auto bg-white  p-4 md:p-8 mb-8">
                    <div className="mb-4">
                        <Button onClick={() => navigator(-1)} className="bg-indigo-500 text-white">&larr; Back</Button>
                    </div>
                    <h2 className="text-2xl font-bold mb-4 text-indigo-700 ">
                        {isEdit ? "Edit Product" : "Add New Product"}
                    </h2>
                    {/* No global image preview. Previews are per-variant below. */}
                    <div className="flex flex-col gap-8">
                        {/* Category & Subcategory row */}
                        <div className="w-full flex flex-col space-y-4">
                            <Label>Category</Label>
                            <select
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                value={product.categoryId}
                                onChange={e => handleCategoryChange(e.target.value)}
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.categoryName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="w-full flex flex-col space-y-4">
                            <Label className="block font-medium mb-2 text-indigo-700">Variants</Label>
                            <div className="space-y-4">
                                <div className="max-h-150 overflow-y-auto pr-2">
                                    {(variants || []).map((variant: any, idx: number) => (
                                        <div key={variant.id} className="border rounded-lg p-4 mb-2 bg-gray-50">
                                            {/* No Edit button, always editable */}
                                            {/* Title and Description for each variant as a single row */}
                                            <div className="mb-2 grid grid-cols-1 gap-2">
                                                <div>
                                                    <Label className="mb-2">Title</Label>
                                                    <input
                                                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                                        placeholder="Variant Title"
                                                        value={variant.title || ""}
                                                        onChange={e => handleVariantChange(idx, "title", e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="mb-2">Description</Label>
                                                    <textarea
                                                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                                                        placeholder="Variant Description"
                                                        value={variant.description || ""}
                                                        onChange={e => handleVariantChange(idx, "description", e.target.value)}
                                                        rows={2}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-4 mb-2">
                                                <div className="flex-1">
                                                    <Label className="mb-2">Stock</Label>
                                                    <input
                                                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                                        placeholder="Stock"
                                                        type="text"
                                                        inputMode="numeric"
                                                        pattern="^[0-9]*$"
                                                        maxLength={4}
                                                        value={typeof variant.stock === "string" ? variant.stock : (typeof variant.stock === "number" && !isNaN(variant.stock) ? String(variant.stock) : "")}
                                                        onChange={e => {
                                                            let val = e.target.value;
                                                            // Only allow digits, no dot, and max 9999
                                                            if (/^\d*$/.test(val) || val === "") {
                                                                if (val !== "" && Number(val) > 9999) val = "9999";
                                                                handleVariantChange(idx, "stock", val);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <Label className="mb-2">Price</Label>
                                                    <input
                                                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                                        placeholder="Price"
                                                        type="text"
                                                        inputMode="decimal"
                                                        pattern="^[0-9]*\.?[0-9]*$"
                                                        maxLength={5}
                                                        value={typeof variant.price === "string" ? variant.price : (typeof variant.price === "number" && !isNaN(variant.price) ? String(variant.price) : "")}
                                                        onChange={e => {
                                                            let val = e.target.value;
                                                            // Allow digits and dot, but max 9999
                                                            if (/^\d*\.?\d*$/.test(val) || val === "") {
                                                                if (val !== "" && Number(val) > 9999) val = "9999";
                                                                handleVariantChange(idx, "price", val);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <Label className="mb-2">Discount Price</Label>
                                                    <input
                                                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                                        placeholder="Discount Price"
                                                        type="text"
                                                        inputMode="decimal"
                                                        pattern="^[0-9]*\.?[0-9]*$"
                                                        maxLength={5}
                                                        value={typeof variant.discountPrice === "string" ? variant.discountPrice : (typeof variant.discountPrice === "number" && !isNaN(variant.discountPrice) ? String(variant.discountPrice) : "")}
                                                        onChange={e => {
                                                            let val = e.target.value;
                                                            // Allow digits and dot, but max 9999
                                                            if (/^\d*\.?\d*$/.test(val) || val === "") {
                                                                if (val !== "" && Number(val) > 9999) val = "9999";
                                                                handleVariantChange(idx, "discountPrice", val);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <Label className="mb-2">Weight(In grams)</Label>
                                                    <input
                                                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                                        placeholder="Weight"
                                                        type="text"
                                                        inputMode="decimal"
                                                        pattern="^[0-9]*\.?[0-9]*$"
                                                        maxLength={5}
                                                        value={typeof variant.weight === "string" ? variant.weight : (typeof variant.weight === "number" && !isNaN(variant.weight) ? String(variant.weight) : "")}
                                                        onChange={e => {
                                                            let val = e.target.value;
                                                            // Allow digits and dot, but max 9999
                                                            if (/^\d*\.?\d*$/.test(val) || val === "") {
                                                                if (val !== "" && Number(val) > 9999) val = "9999";
                                                                handleVariantChange(idx, "weight", val);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <Button type="button" variant="destructive" className="h-8 mt-6" onClick={() => handleRemoveVariant(idx)}>-</Button>
                                            </div>
                                            {/* Variant Images */}
                                            <div className="mb-2">
                                                <Label className="">Variant Images </Label>
                                                <span className="text-xs text-gray-500">(Attention! all images on the website have square dimensions)</span>
                                                <div className="flex flex-wrap gap-2 mb-1">
                                                    {(variant.images || []).map((img: any, imgIdx: number) => {
                                                        let src: string = '';
                                                        if (typeof img === 'string') {
                                                            src = img;
                                                        } else if (img instanceof File) {
                                                            src = URL.createObjectURL(img);
                                                        }
                                                        else if (img && typeof img === 'object' && img.imageUrl) {
                                                            src = img.imageUrl;
                                                        }
                                                        return (
                                                            <div key={imgIdx} className={`relative group ${variant.mainImageIdx === imgIdx ? ' ring-indigo-500' : ''}`}>
                                                                <img
                                                                    src={src}
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
                                                        );
                                                    })}
                                                    {(variant.images?.length ?? 0) < 5 && (
                                                        <label className="w-12 h-12 flex items-center justify-center border-2 border-dashed border-indigo-300 rounded-lg text-indigo-400 hover:bg-indigo-50 focus:outline-none cursor-pointer" onClick={() => handlePlusClick(idx)}>
                                                            <span >+</span>
                                                        </label>
                                                    )}
                                                    {cropDialogOpen && pendingVariantIdx === idx && (
                                                        <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
                                                            <DialogContent className="min-w-2xl w-full">
                                                                <ImageCropper onCrop={handleCropDone} />
                                                            </DialogContent>
                                                        </Dialog>
                                                    )}
                                                    {variant.images && variant.images.length > 0 && (
                                                        <div className="text-xs text-gray-500 w-full">Click an image to set as main (thumbnail).</div>
                                                    )}
                                                </div>
                                                {variant.images && variant.images.length > 0 && (
                                                    <div className="text-xs text-gray-500">Up to 5 images per variant.</div>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2">
                                                {/* Always show selects if category is selected (add or edit mode) */}
                                                {product.categoryId
                                                    ? (() => {
                                                        function getAllParentAttributes(catId: string, cats: any[]): any[] {
                                                            let allAttrs: any[] = [];
                                                            let current = cats.find(c => c.id === catId);
                                                            while (current) {
                                                                if (current.attributes) {
                                                                    allAttrs = [...current.attributes, ...allAttrs];
                                                                }
                                                                if (!current.parentCategoryId) break;
                                                                current = cats.find(c => c.id === current.parentCategoryId);
                                                            }
                                                            return allAttrs;
                                                        }
                                                        const allAttributes = getAllParentAttributes(product.categoryId, categories);
                                                        return allAttributes.map((attr: any) => {
                                                            let selectedValue = "";
                                                            if (Array.isArray(variant.attributeValues)) {
                                                                const found = variant.attributeValues.find((av: any) => av && (av.attributeId === attr.id || (av.attributeValueId && av.attributeValueId.startsWith(attr.id + "___"))));
                                                                if (found && found.attributeValueId) {
                                                                    const parts = found.attributeValueId.split("___");
                                                                    selectedValue = parts.length > 1 ? parts[1] : "";
                                                                }
                                                            }
                                                            return (
                                                                <div key={attr?.id || Math.random()} className="flex flex-col">
                                                                    <Label className="mb-2">{attr?.name || "Attribute"}</Label>
                                                                    <select
                                                                        className="border rounded px-2 py-1"
                                                                        value={selectedValue}
                                                                        onChange={e => handleAttributeValueChange(idx, attr?.id || "", e.target.value)}
                                                                        disabled={!Array.isArray(attr?.values) || attr?.values.length === 0}
                                                                    >
                                                                        <option value="">Select {attr?.name || "Attribute"}</option>
                                                                        {Array.isArray(attr?.values) && attr.values.length > 0 && attr.values.map((val: any) => (
                                                                            <option key={val?.id || Math.random()} value={val?.id || ""}>
                                                                                {val?.value || "Value"}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            );
                                                        });
                                                    })()
                                                    : Array.isArray(variant.attributeValueIds) && variant.attributeValueIds.length > 0
                                                        ? variant.attributeValueIds.map((valueId: string) => {
                                                            let attributeName = "Attribute";
                                                            let attributeValue = valueId;
                                                            for (const cat of categories) {
                                                                for (const attr of cat.attributes || []) {
                                                                    const val = (attr.values || []).find((v: any) => v.id === valueId);
                                                                    if (val) {
                                                                        attributeName = attr.name;
                                                                        attributeValue = val.value;
                                                                    }
                                                                }
                                                            }
                                                            return (
                                                                <div key={valueId} className="flex flex-col">
                                                                    <Label className="mb-2">{attributeName}</Label>
                                                                    <div className="border rounded px-2 py-1 bg-gray-100">{attributeValue}</div>
                                                                </div>
                                                            );
                                                        })
                                                        : <div className="text-gray-400">No attributes</div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleAddVariant}
                                >
                                    Add Variant
                                </Button>
                                {/* Image Crop Dialog for variant images */}
                            </div>
                        </div>
                    </div>
                    <Button
                        className="w-full py-3 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow mt-4"
                        onClick={handleSubmit}
                        disabled={isImageProcessing}
                    >
                        {isImageProcessing ? 'Processing image...' : (isEdit ? 'Save Changes' : 'Add Product')}
                    </Button>
                </div>
            </div>
        </>

    );
}
