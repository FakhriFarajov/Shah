import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "../components/custom/Navbar/navbar";
import { AppSidebar } from "@/components/custom/sidebar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiCallWithManualRefresh } from "@/shared/apiWithManualRefresh";
import { getCountries } from "@/features/profile/Country/country.service";
import type { Warehouse } from "@/features/profile/DTOs/admin.interfaces";
import { getAllPaginatedWarehouses, CreateWarehouseAsync, UpdateWarehouseAsync, DeleteWarehouseAsync } from "@/features/profile/Warehouses/Warehouses.service";
import type { PaginatedResult } from "@/features/profile/DTOs/admin.interfaces";
import type { CreateWarehouseRequestDTO, UpdateWarehouseRequestDTO } from "@/features/profile/DTOs/admin.interfaces";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";


export default function WarehousesPage() {
    const [loading, setLoading] = useState(false);
    const [countries, setCountries] = useState<Array<{ id: number; name: string }>>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editWarehouse, setEditWarehouse] = useState<Warehouse | null>(null);
    const [form, setForm] = useState<CreateWarehouseRequestDTO>({
        addressId: undefined,
        address: {
            street: "",
            city: "",
            state: "",
            postalCode: "",
            countryId: 0
        },
        capacity: 0
    });
    const navigator = useNavigate();

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        fetchPaginatedWarehouses(page);
    }, [page, pageSize]);


    useEffect(() => {
        fetchCountries();
    }, []);


    async function fetchPaginatedWarehouses(newPage: number = page) {
        setLoading(true);
        try {
            const result: PaginatedResult<Warehouse> = await apiCallWithManualRefresh(() => getAllPaginatedWarehouses(newPage, pageSize));
            setWarehouses(result.data || []);
            setPage(result.page || newPage);
            setPageSize(result.contentPerPage || pageSize);
            setTotalPages(result.totalPages || 1);
            setTotalItems(result.totalItems || 0);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    }

    async function handleAddWarehouse(payload: CreateWarehouseRequestDTO) {
        setLoading(true);
        try {
            const response = await apiCallWithManualRefresh(() => CreateWarehouseAsync(payload));
            if (response && response.isSuccess) {
                fetchPaginatedWarehouses();
                toast.success("Warehouse added successfully");
            } else {
                if (response?.errors) {
                    Object.entries(response.errors).forEach(([field, messages]) => {
                        if (Array.isArray(messages)) {
                            messages.forEach(msg => toast.error(`${field}: ${msg}`));
                        } else {
                            toast.error(`${field}: ${messages}`);
                        }
                    });
                } else {
                    const errorMsg = response?.message || "Failed to add admin profile";
                    toast.error(errorMsg);
                }
            }
        } catch (error: any) {
            // Axios error with backend validation errors
            if (error?.response?.data?.errors) {
                Object.entries(error.response.data.errors).forEach(([field, messages]) => {
                    if (Array.isArray(messages)) {
                        messages.forEach(msg => toast.error(`${field}: ${msg}`));
                    } else {
                        toast.error(`${field}: ${messages}`);
                    }
                });
            } else {
                toast.error(error?.message || "Failed to add warehouse");
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleUpdateWarehouse(id: string, payload: UpdateWarehouseRequestDTO) {
        setLoading(true);
        try {
            const response = await apiCallWithManualRefresh(() => UpdateWarehouseAsync(String(id), payload));
            if (response && response.isSuccess) {
                fetchPaginatedWarehouses();
                toast.success("Warehouse updated successfully");
            } else {
                if (response?.errors) {
                    Object.entries(response.errors).forEach(([field, messages]) => {
                        if (Array.isArray(messages)) {
                            messages.forEach(msg => toast.error(`${field}: ${msg}`));
                        } else {
                            toast.error(`${field}: ${messages}`);
                        }
                    });
                } else {
                    const errorMsg = response?.message || "Failed to update warehouse";
                    toast.error(errorMsg);
                }
            }
            setModalOpen(false);
        } catch (error: any) {
            if (error?.response?.data?.errors) {
                Object.entries(error.response.data.errors).forEach(([field, messages]) => {
                    if (Array.isArray(messages)) {
                        messages.forEach(msg => toast.error(`${field}: ${msg}`));
                    } else {
                        toast.error(`${field}: ${messages}`);
                    }
                });
            } else {
                toast.error(error?.message || "Failed to update warehouse");
            }
        } finally {
            setLoading(false);
        }
    }


    async function fetchCountries() {
        setLoading(true);
        try {
            const countriesResult = await apiCallWithManualRefresh(() => getCountries());
            setCountries(countriesResult);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    }

    const openModal = (warehouse?: Warehouse) => {
        setEditWarehouse(warehouse || null);
        if (warehouse && warehouse.address) {
            setForm({
                addressId: warehouse.addressId ?? undefined,
                address: {
                    street: warehouse.address.street ?? "",
                    city: warehouse.address.city ?? "",
                    state: warehouse.address.state ?? "",
                    postalCode: warehouse.address.postalCode ?? "",
                    countryId: warehouse.address.countryId ?? 0
                },
                capacity: warehouse.capacity
            });
        } else {
            setForm({
                addressId: undefined,
                address: {
                    street: "",
                    city: "",
                    state: "",
                    postalCode: "",
                    countryId: 0
                },
                capacity: 0
            });
        }
        setModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        setLoading(true);
        try {
            await apiCallWithManualRefresh(() => DeleteWarehouseAsync(String(id)));
            fetchPaginatedWarehouses();
            toast.success("Warehouse deleted successfully");
        } catch (error: any) {
            toast.error(error?.message || "Failed to delete warehouse");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen flex">
                <AppSidebar />
                <div className="flex-1 py-8 px-2 md:px-8">
                    <div className="max-w-4xl mx-auto mb-8">
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Warehouses</h1>
                        <Button onClick={() => openModal()} className="mb-4 text-white bg-indigo-500">Add Warehouse</Button>
                        <div className="space-y-4">
                            {warehouses.map(w => (
                                <div key={w.id} className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
                                    <div>
                                        <div className="font-bold text-lg">ID: {w.id}</div>
                                        <div className="ml-4 text-gray-600">Street: {w.address?.street}</div>
                                        <div className="ml-4 text-gray-600">City: {w.address?.city}</div>
                                        <div className="ml-4 text-gray-600">State: {w.address?.state}</div>
                                        <div className="ml-4 text-gray-600">Postal Code: {w.address?.postalCode}</div>
                                        <div className="ml-4 text-gray-600">Country: {countries.find(c => c.id === w.address?.countryId)?.name}</div>
                                        <div className="ml-4 text-gray-600">Capacity: {w.capacity} units</div>
                                        <div className="ml-4 text-gray-600">Current Capacity: {w.currentCapacity || 0}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={() => openModal(w)}>Edit</Button>
                                        <Button variant="destructive" onClick={() => handleDelete(w.id)}>Delete</Button>
                                        <Button onClick={() => navigator("/warehouse-orders?warehouseId=" + w.id)} className="text-white bg-indigo-500">Orders</Button>
                                    </div>
                                </div>
                            ))}
                            <div className="flex justify-center items-center gap-4 mt-6">
                                <Button
                                    className="rounded-xl px-6 py-2 bg-gradient-to-tr from-indigo-500 to-blue-600 text-white font-semibold shadow hover:from-indigo-600 hover:to-blue-700 transition"
                                    onClick={() => setPage(page - 1)}
                                    disabled={page <= 1 || loading}
                                >
                                    Previous
                                </Button>
                                <span className="text-gray-700">Page {page} of {totalPages} ({totalItems} warehouses)</span>
                                <Button
                                    className="rounded-xl px-6 py-2 bg-gradient-to-tr from-indigo-500 to-blue-600 text-white font-semibold shadow hover:from-indigo-600 hover:to-blue-700 transition"
                                    onClick={() => setPage(page + 1)}
                                    disabled={page >= totalPages || loading}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editWarehouse ? "Edit Warehouse" : "Add Warehouse"}</DialogTitle>
                                <div id="warehouse-dialog-desc" className="text-gray-500 text-sm mt-1">
                                    {editWarehouse ? "Edit the warehouse details below." : "Fill in the details to add a new warehouse."}
                                </div>
                            </DialogHeader>
                            <div className="grid gap-4 py-2" aria-describedby="warehouse-dialog-desc">
                                {/* Pagination Controls */}

                                <div>
                                    <Label className="font-semibold text-indigo-700">Street</Label>
                                    <Input value={form.address?.street} onChange={e => setForm(f => ({
                                        ...f,
                                        address: {
                                            street: e.target.value,
                                            city: f.address?.city ?? "",
                                            state: f.address?.state ?? "",
                                            postalCode: f.address?.postalCode ?? "",
                                            countryId: f.address?.countryId ?? 0
                                        }
                                    }))} placeholder="Street" />
                                </div>
                                <div>
                                    <Label className="font-semibold text-indigo-700">City</Label>
                                    <Input value={form.address?.city} onChange={e => setForm(f => ({
                                        ...f,
                                        address: {
                                            street: f.address?.street ?? "",
                                            city: e.target.value,
                                            state: f.address?.state ?? "",
                                            postalCode: f.address?.postalCode ?? "",
                                            countryId: f.address?.countryId ?? 0
                                        }
                                    }))} placeholder="City" />
                                </div>
                                <div>
                                    <Label className="font-semibold text-indigo-700">State</Label>
                                    <Input value={form.address?.state} onChange={e => setForm(f => ({
                                        ...f,
                                        address: {
                                            street: f.address?.street ?? "",
                                            city: f.address?.city ?? "",
                                            state: e.target.value,
                                            postalCode: f.address?.postalCode ?? "",
                                            countryId: f.address?.countryId ?? 0
                                        }
                                    }))} placeholder="State" />
                                </div>
                                <div>
                                    <Label className="font-semibold text-indigo-700">Postal Code</Label>
                                    <Input value={form.address?.postalCode} onChange={e => setForm(f => ({
                                        ...f,
                                        address: {
                                            street: f.address?.street ?? "",
                                            city: f.address?.city ?? "",
                                            state: f.address?.state ?? "",
                                            postalCode: e.target.value,
                                            countryId: f.address?.countryId ?? 0
                                        }
                                    }))} placeholder="Postal Code" />
                                </div>
                                <div>
                                    <Label className="font-semibold text-indigo-700">Capacity</Label>
                                    <Input type="number" min={0} value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))} placeholder="Capacity" />
                                </div>
                                <div>
                                    <Label className="font-semibold text-indigo-700">Country Code</Label>
                                    <select
                                        value={form.address?.countryId ?? ""}
                                        onChange={e => {
                                            const val = Number(e.target.value);
                                            setForm(f => ({
                                                ...f,
                                                address: {
                                                    street: f.address?.street ?? "",
                                                    city: f.address?.city ?? "",
                                                    state: f.address?.state ?? "",
                                                    postalCode: f.address?.postalCode ?? "",
                                                    countryId: val
                                                }
                                            }));
                                        }}
                                        required
                                        className="w-full border-2 border-indigo-200 rounded-lg px-3 py-2 focus:ring-indigo-400 bg-white"

                                    >
                                        <option value="">{"Select country"}</option>
                                        {countries.map((country) => (
                                            <option key={country.id} value={country.id}>
                                                {country.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button variant="ghost" onClick={() => setModalOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            if (editWarehouse) {
                                                handleUpdateWarehouse(String(editWarehouse.id), form as UpdateWarehouseRequestDTO);
                                            } else {
                                                handleAddWarehouse(form as CreateWarehouseRequestDTO);
                                            }
                                        }}
                                    >
                                        {editWarehouse ? "Save" : "Add"}
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
