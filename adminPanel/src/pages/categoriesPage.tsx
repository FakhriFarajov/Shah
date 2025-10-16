import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "../components/custom/Navbar/navbar";
import { AppSidebar } from "../components/custom/sidebar";

// Mock category data
const initialCategories = [
    { id: "1", name: "Electronics", parentId: null },
    { id: "2", name: "Phones", parentId: "1" },
    { id: "3", name: "Laptops", parentId: "1" },
    { id: "4", name: "Home", parentId: null },
];

function buildTree(categories) {
    const map = new Map();
    categories.forEach((c) => map.set(c.id, { ...c, children: [] }));
    const roots = [];
    for (const node of map.values()) {
        if (!node.parentId) {
            roots.push(node);
        } else {
            const parent = map.get(node.parentId);
            if (parent) parent.children.push(node);
            else roots.push(node); // parent not found -> treat as root
        }
    }
    return roots;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState(initialCategories);
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [parentId, setParentId] = useState<string | null>(null);

    // Attribute state
    const [attributes, setAttributes] = useState<{ name: string; values: string[] }[]>([]);
    const [attrName, setAttrName] = useState("");
    const [attrValue, setAttrValue] = useState("");
    const [attrValues, setAttrValues] = useState<string[]>([]);

    // Add editing state for modal
    const [editingCategory, setEditingCategory] = useState<{ id: string; name: string; parentId: string | null; attributes: { name: string; values: string[] }[] } | null>(null);

    function openModal(category?: typeof editingCategory) {
        if (category) {
            setName(category.name);
            setParentId(category.parentId);
            setAttributes(category.attributes || []);
            setEditingCategory(category);
        } else {
            setName("");
            setParentId(null);
            setAttributes([]);
            setEditingCategory(null);
        }
        setIsOpen(true);
    }

    function addCategory() {
        if (!name.trim()) return;
        if (editingCategory) {
            setCategories(categories.map(cat => cat.id === editingCategory.id ? { ...cat, name, parentId, attributes } : cat));
        } else {
            const newCategory = {
                id: (Math.random() * 1000000).toFixed(0),
                name: name.trim(),
                parentId: parentId || null,
                attributes,
            };
            setCategories([...categories, newCategory]);
        }
        setIsOpen(false);
    }

    function addAttribute() {
        if (!attrName.trim() || attrValues.length === 0) return;
        setAttributes([...attributes, { name: attrName.trim(), values: attrValues }]);
        setAttrName("");
        setAttrValues([]);
    }
    function addAttrValue() {
        if (!attrValue.trim()) return;
        setAttrValues([...attrValues, attrValue.trim()]);
        setAttrValue("");
    }
    function removeAttribute(idx: number) {
        setAttributes(attributes.filter((_, i) => i !== idx));
    }
    function removeAttrValue(idx: number) {
        setAttrValues(attrValues.filter((_, i) => i !== idx));
    }

    const tree = buildTree(categories);

    function renderTree(nodes: { id: string; name: string; parentId: string | null; attributes?: { name: string; values: string[] }[]; children?: any[] }[], depth = 0) {
        return nodes.map((node) => (
            <div key={node.id} style={{ marginLeft: depth * 24 }} className="mb-2">
                <div className="font-semibold cursor-pointer" onClick={() => openModal(node)}>{node.name}</div>
                {node.children && node.children.length > 0 && (
                    <div>{renderTree(node.children, depth + 1)}</div>
                )}
            </div>
        ));
    }

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
                        {tree.map((node) => (
                            <div key={node.id} style={{ marginLeft: 0 }} className="mb-2">
                                <div className="font-semibold cursor-pointer" onClick={() => openModal(node)}>{node.name}</div>
                                {node.children && node.children.length > 0 && (
                                    <div>{renderTree(node.children, 1)}</div>
                                )}
                            </div>
                        ))}
                    </div>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-2">
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
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
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
                                        {attributes.map((attr, i) => (
                                            <div key={i} className="mb-2 p-2 border rounded">
                                                <div className="font-semibold flex justify-between items-center">
                                                    {attr.name}
                                                    <button type="button" className="text-red-500" onClick={() => removeAttribute(i)}>Delete</button>
                                                </div>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {attr.values.map((v, j) => (
                                                        <span key={j} className="px-2 py-1 bg-indigo-100 rounded text-xs">{v}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button variant="ghost" onClick={() => setIsOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={addCategory}>{editingCategory ? "Save" : "Add"}</Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

        </>

    );
}
