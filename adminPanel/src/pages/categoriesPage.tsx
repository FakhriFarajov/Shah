import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "../components/custom/Navbar/navbar";
import { AppSidebar } from "../components/custom/sidebar";
import { getAllCategoriesWithAttributesAndValuesAsync, getCategoriesTree, syncCategories, deleteCategoryAsync } from "@/features/profile/Category/category.service";
import type { SyncCategoryItemDto, SyncAttributeItemDto } from "@/features/profile/DTOs/admin.interfaces";
import { toast } from "sonner";
import { apiCallWithManualRefresh } from "@/shared/apiWithManualRefresh";
import Spinner from "@/components/custom/Spinner";

function buildTree(categories: SyncCategoryItemDto[]): any[] {
    const map = new Map<string, any>();
    categories.forEach((c) => map.set(c.id ?? '', { ...c, children: [] }));
    const roots: any[] = [];
    for (const node of map.values()) {
        if (!node.parentCategoryId) {
            roots.push(node);
        } else {
            const parent = map.get(node.parentCategoryId);
            if (parent) parent.children.push(node);
            else roots.push(node); // parent not found -> treat as root
        }
    }
    return roots;
}

function isGuid(id: string) {
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
}

// generate GUID helper
function generateGuid() {
    if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
        return (crypto as any).randomUUID();
    }
    // fallback
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<SyncCategoryItemDto[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [parentId, setParentId] = useState<string | null>(null);

    // Attribute state
    const [attributes, setAttributes] = useState<SyncAttributeItemDto[]>([]);
    const [attrName, setAttrName] = useState("");
    const [attrValue, setAttrValue] = useState("");
    const [attrValues, setAttrValues] = useState<string[]>([]);

    // Add editing state for modal
    const [editingCategory, setEditingCategory] = useState<{ id: string; name: string; parentId: string | null; attributes: { name: string; values: string[] }[] } | null>(null);

    // Track new/updated/deleted attributes/values
    const [newAttributes, setNewAttributes] = useState<any[]>([]);
    const [deletedAttributeIds, setDeletedAttributeIds] = useState<string[]>([]);
    const [newValues, setNewValues] = useState<{ attributeId: string; value: string }[]>([]);
    const [deletedValueIds, setDeletedValueIds] = useState<string[]>([]);

    async function getAttributesWithValues() {
        const categoriesWithAttributes = await apiCallWithManualRefresh(() => getAllCategoriesWithAttributesAndValuesAsync());
        setCategories(categoriesWithAttributes);
    }

    useEffect(() => {
        async function fetchCategories() {
            setLoading(true);
            const categories:any = await apiCallWithManualRefresh(() => getCategoriesTree());
            setCategories(categories);
            setLoading(false);
        }

        fetchCategories();
    }, []);

    useEffect(() => {
        async function fetchAttrs() {
            setLoading(true);
            await getAttributesWithValues();
            setLoading(false);
        }
        fetchAttrs();
    }, []);

    // When opening the modal, use the selected category's attributes for display
    async function openModal(category?: SyncCategoryItemDto) {
        if (category) {
            setName(category.categoryName || "");
            setParentId(category.parentCategoryId || null);
            setEditingCategory(category);
            setAttributes(category.attributes || []);
        } else {
            setName("");
            setParentId(null);
            setEditingCategory(null);
            setAttributes([]);
        }
        setIsOpen(true);
    }
    // Add attribute
    function addAttribute() {
        if (!attrName.trim() || attrValues.length === 0) return;
        const newAttr: SyncAttributeItemDto = {
            id: generateGuid(),
            name: attrName.trim(),
            values: attrValues.map(v => ({ id: generateGuid(), value: v }))
        };

        setAttributes([...(Array.isArray(attributes) ? attributes : []), newAttr]);
        setNewAttributes([...newAttributes, newAttr]);
        setAttrName("");
        setAttrValues([]);
    }
    function addAttrValue() {
        if (!attrValue.trim()) return;
        setAttrValues([...attrValues, attrValue.trim()]);
        setAttrValue("");
    }
    function removeAttribute(idx: number) {
        const attr = attributes[idx];
        setAttributes(attributes.filter((_, i) => i !== idx));
        if (!newAttributes.find(a => a.id === attr.id)) {
            setDeletedAttributeIds([...deletedAttributeIds, attr.id]);
        } else {
            setNewAttributes(newAttributes.filter(a => a.id !== attr.id));
        }
    }
    function removeAttrValue(idx: number) {
        setAttrValues(attrValues.filter((_, i) => i !== idx));
    }
    function removeValue(attrIdx: number, valIdx: number) {
        const attr = attributes[attrIdx];
        const val = attr.values[valIdx];
        const newVals = attr.values.filter((_, i) => i !== valIdx);
        const newAttrs = [...attributes];
        newAttrs[attrIdx] = { ...attr, values: newVals };
        setAttributes(newAttrs);
        if (val.id && isGuid(val.id)) {
            setDeletedValueIds([...deletedValueIds, val.id]);
        } else {
            setNewValues(newValues.filter(v => v.id !== val.id));
        }
    }


    function renderTree(nodes: SyncCategoryItemDto[], depth = 0): JSX.Element[] {
        return nodes.map((node) => (
            <div key={node.id} style={{ marginLeft: depth * 24 }} className="mb-2">
                <div className="font-semibold cursor-pointer" onClick={() => openModal(node)}>
                    {node.categoryName}
                </div>
                {Array.isArray((node as any).children) && (node as any).children.length > 0 && (
                    <div>{renderTree((node as any).children, depth + 1)}</div>
                )}
            </div>
        ));
    }

    // Save handler
    async function handleSaveCategory() {
        try {
            function isGuid(id: string | undefined): boolean {
                return !!id && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
            }
            const payload: SyncCategoryItemDto[] = [
                {
                    id: editingCategory?.id,
                    categoryName: name,
                    parentCategoryId: parentId ?? undefined,
                    attributes: attributes.map(attr => {
                        const attrId = isGuid(attr.id) ? attr.id! : generateGuid();
                        return {
                            id: attrId,
                            name: attr.name,
                            values: (attr.values || []).map(val => ({
                                id: isGuid(val.id) ? val.id! : generateGuid(),
                                value: val.value
                            }))
                        };
                    })
                }
            ];
            await apiCallWithManualRefresh(() => syncCategories(payload));
            setIsOpen(false);
            toast.success("Category saved successfully");
            getAttributesWithValues();

        } catch (error) {
            toast.error("Failed to save category");

        }
    }

    async function handleDeleteCategory() {
        if (!editingCategory || !editingCategory.id) return;
        try {
            await deleteCategoryAsync(editingCategory.id);
            toast.success("Category deleted successfully");
            setIsOpen(false);
            // Refresh categories
            getAttributesWithValues();
        } catch (error) {
            toast.error("Failed to delete category");
        }
    }

    if (loading) return (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
            <Spinner />
        </div>
    );

    return (
        <>
            <Navbar />
            <div className="min-h-screen flex">
                <AppSidebar />
                <div className="flex-1 py-8 px-2 md:px-8 flex flex-col items-start">
                    <h1 className="text-2xl font-bold mb-6">Categories</h1>
                    <p className="text-sm  mb-6">This is the categories management page.</p>
                    <div className="flex flex-end justify-end mb-4 w-full">
                        <Button onClick={openModal}>Add Category</Button>
                    </div>
                    <div className="mt-8">
                        {categories.length === 0 ? (
                            <div className="text-gray-500">No categories found.</div>
                        ) : (
                            renderTree(buildTree(categories), 0)
                        )}
                    </div>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-2" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                <div>
                                    <Label>Name</Label>
                                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" />
                                </div>
                                <div>
                                    <Label>Parent category</Label>
                                    <Select onValueChange={(v) => setParentId(v === "none" ? null : v)} defaultValue={parentId ?? "none"}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="None" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {categories.map((c) => (
                                                <SelectItem key={c.id} value={c.id}>{c.categoryName || c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Attributes</Label>
                                    <div className="space-y-2">
                                        <div className="flex gap-2 mb-2">
                                            <Input value={attrName} onChange={e => setAttrName(e.target.value)} placeholder="Attribute name (e.g. Color)" />
                                        </div>
                                        <div className="flex gap-2 mb-2">
                                            <Input value={attrValue} onChange={e => setAttrValue(e.target.value)} placeholder="Attribute value (e.g. Red)" />
                                            <Button type="button" onClick={addAttrValue}>Add Value</Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {attrValues.map((v, i) => (
                                                <span key={i} className="px-2 py-1 bg-gray-200 rounded text-sm flex items-center gap-1">
                                                    {v}
                                                    <button type="button" className="ml-1 text-red-500" onClick={() => removeAttrValue(i)}>×</button>
                                                </span>
                                            ))}
                                        </div>
                                        <Button type="button" onClick={addAttribute} disabled={!attrName || attrValues.length === 0}>Add Attribute</Button>
                                    </div>
                                    <div className="mt-2">
                                        {(Array.isArray(attributes) ? attributes : []).map((attr, attrIdx) => (
                                            <div key={attr.id} className="mb-2 p-2 border rounded">
                                                <div className="font-semibold flex justify-between items-center">
                                                    <Input
                                                        value={attr.name}
                                                        onChange={e => {
                                                            const newAttrs = [...attributes];
                                                            newAttrs[attrIdx] = { ...attr, name: e.target.value };
                                                            setAttributes(newAttrs);
                                                        }}
                                                        className="w-1/2"
                                                    />
                                                    <Button type="button" className="ml-2 rounded-xl bg-indigo-500" onClick={() => removeAttribute(attrIdx)}>Delete</Button>
                                                </div>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {(Array.isArray(attr.values) ? attr.values : []).map((val, valIdx) => (
                                                        <span key={val.id} className="flex items-center gap-1">
                                                            <Input
                                                                value={val.value}
                                                                onChange={e => {
                                                                    const newAttrs = [...attributes];
                                                                    const newVals = [...(attr.values || [])];
                                                                    newVals[valIdx] = { ...val, value: e.target.value };
                                                                    newAttrs[attrIdx] = { ...attr, values: newVals };
                                                                    setAttributes(newAttrs);
                                                                }}
                                                                className="w-24 px-2 py-1 text-xs bg-indigo-100 rounded"
                                                            />
                                                            <button type="button" className="ml-1 text-red-500" onClick={() => removeValue(attrIdx, valIdx)}>×</button>
                                                        </span>
                                                    ))}
                                                    {/* Add new value input for each attribute, tracked locally */}
                                                    <span className="flex items-center gap-2 mt-1">
                                                        <Input
                                                            value={(attr as any).newValue || ""}
                                                            onChange={e => {
                                                                const newAttrs = [...attributes];
                                                                newAttrs[attrIdx] = ({ ...(attr as any), newValue: e.target.value } as any);
                                                                setAttributes(newAttrs);
                                                            }}
                                                            className="w-24 px-2 text-xs bg-indigo-100 rounded"
                                                            placeholder="New value"
                                                        />
                                                        <Button type="button" variant="outline" onClick={() => {
                                                            if (!(attr as any).newValue || !(attr as any).newValue.trim()) return;
                                                            const newAttrs = [...attributes];
                                                            const newVals = [...(attr.values || []), { id: generateGuid(), value: (attr as any).newValue.trim() }];
                                                            newAttrs[attrIdx] = ({ ...(attr as any), values: newVals, newValue: "" } as any);
                                                            setAttributes(newAttrs);
                                                        }}>+</Button>
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button variant="ghost" onClick={() => setIsOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button variant="destructive" onClick={handleDeleteCategory}>
                                        Delete Category
                                    </Button>
                                    <Button onClick={handleSaveCategory}>
                                        Save All Changes
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </>
    );
}