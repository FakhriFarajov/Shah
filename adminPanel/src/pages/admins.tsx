import Navbar from "../components/custom/Navbar/navbar";
import { AppSidebar } from "@/components/custom/sidebar";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCountries } from "@/features/profile/Country/country.service";
import { apiCallWithManualRefresh } from '@/shared/apiWithManualRefresh';
import Spinner from "@/components/custom/Spinner";
import { getPaginatedAdminProfiles, addAdminProfile as addAdminProfileApi, editAdminProfile, deleteAdminProfile } from "@/features/profile/AdminService/admin.service";
import { toast } from "sonner";
import type { Country, AddAdminProfileRequestDTO, EditAdminRequestDTO, PaginatedResult, AdminProfileResponseDTO } from "@/features/profile/DTOs/admin.interfaces";
import { tokenStorage } from "@/shared/tokenStorage";
import { jwtDecode } from "jwt-decode";




export default function AdminProfilesPage() {
    const [loading, setLoading] = useState(false);
    const [countries, setCountries] = useState<Country[]>([]);
    const [admins, setAdmins] = useState<AdminProfileResponseDTO[]>([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [isOpen, setIsOpen] = useState(false);
    const [editing, setEditing] = useState<AdminProfileResponseDTO | null>(null);
    const [form, setForm] = useState<Partial<AdminProfileResponseDTO> & { password?: string; confirmPassword?: string }>({ name: "", surname: "", email: "", phone: "", countryCitizenshipId: 0, password: "", confirmPassword: "" });
    const [isEdit, setIsEdit] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [adminToDelete, setAdminToDelete] = useState<AdminProfileResponseDTO | null>(null);


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

    async function fetchPaginatedAdmins(newPage: number = page) {
        setLoading(true);
        try {
            const result: PaginatedResult<AdminProfileResponseDTO> = await apiCallWithManualRefresh(() => getPaginatedAdminProfiles(newPage, pageSize));
            setAdmins(result.data || []);
            setPage(result.page || newPage);
            setPageSize(result.contentPerPage || pageSize);
            setTotalPages(result.totalPages || 1);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    }

    async function handleAddAdminProfile(payload: AddAdminProfileRequestDTO) {
        setLoading(true);
        try {
            const response = await apiCallWithManualRefresh(() => addAdminProfileApi(payload));
            if (response && response.isSuccess) {
                fetchPaginatedAdmins();
                toast.success("Admin profile added successfully");
            } else {
                // Show backend validation errors if present
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
                toast.error(error?.message || "Failed to add admin profile");
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleEditAdminProfile(id: string, payload: EditAdminRequestDTO) {
        setLoading(true);
        try {
            const response = await apiCallWithManualRefresh(() => editAdminProfile(String(id), payload));
            if (response && response.isSuccess) {
                fetchPaginatedAdmins();
                toast.success("Admin profile updated successfully");
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
            if (error?.response?.data?.errors) {
                Object.entries(error.response.data.errors).forEach(([field, messages]) => {
                    if (Array.isArray(messages)) {
                        messages.forEach(msg => toast.error(`${field}: ${msg}`));
                    } else {
                        toast.error(`${field}: ${messages}`);
                    }
                });
            } else {
                const errorMsg = error?.message || "Failed to add admin profile";
                toast.error(errorMsg);
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCountries();
    }, []);

    useEffect(() => {
        fetchPaginatedAdmins(page);
    }, [page, pageSize]);

    function openAdd() {
        setEditing(null);
        setForm({ name: "", surname: "", email: "", phone: "", countryCitizenshipId: 0, password: "", confirmPassword: "" });
        setIsEdit(false);
        setIsOpen(true);
    }
    function openEdit(admin: AdminProfileResponseDTO) {
        setEditing(admin);
        setForm({
            id: admin.id,
            name: admin.name ?? "",
            surname: admin.surname ?? "",
            email: admin.email ?? "",
            phone: admin.phone ?? "",
            countryCitizenshipId: admin.countryCitizenshipId ?? 0
        });
        setIsEdit(true);
        setIsOpen(true);
    }

    async function handleSave() {
        if (isEdit) {
            try {
                handleEditAdminProfile(editing!.id, form);
            } catch (error) {
                toast.error("Failed to update admin profile");
            }
            return;
        }
        try {
            const addPayload: AddAdminProfileRequestDTO = {
                ...form,
                password: form.password || "",
                confirmPassword: form.confirmPassword || ""
            };
            await handleAddAdminProfile(addPayload);
        } catch (error) {
            toast.error("Failed to add admin profile");
        }
    }

    function handleDeleteClick(admin: AdminProfileResponseDTO) {
        setAdminToDelete(admin);
        setDeleteConfirmOpen(true);
    }

    async function handleDeleteConfirmed() {
        if (!adminToDelete) return;
        let token = tokenStorage.get();
        if (!token) {
            const params = new URLSearchParams(window.location.search);
            const urlToken = params.get('access_token');
            if (urlToken) {
                localStorage.setItem('access_token', urlToken);
                token = urlToken;
            }
        }
        if (!token) return;

        let adminProfileId = "";
        try {
            const decoded: any = jwtDecode(token);
            adminProfileId = decoded.admin_profile_id || decoded.id; // Use the correct key
        } catch {
            toast.error("Invalid token");
            return;
        }
        if (!adminProfileId) {
            toast.error("Admin profile ID not found in token");
            return;
        }
        if (adminToDelete.id === adminProfileId) {
            toast.error("You cannot delete your own admin profile.");
            setDeleteConfirmOpen(false);
            setAdminToDelete(null);
            return;
        }
        setLoading(true);
        try {
            const response = await deleteAdminProfile(adminToDelete.id);
            if (response && response.isSuccess) {
                setAdmins(admins.filter(a => a.id !== adminToDelete.id));
                toast.success("Admin deleted successfully");
            } else {
                const errorMsg = response?.message || "Failed to delete admin profile";
                toast.error(errorMsg);
            }
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
                toast.error(error?.message || "Failed to delete admin profile");
            }
        } finally {
            setLoading(false);
            setDeleteConfirmOpen(false);
            setAdminToDelete(null);
        }
    }

    function handleDeleteCancel() {
        setDeleteConfirmOpen(false);
        setAdminToDelete(null);
    }

    const handlePrevPage = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };
    const handleNextPage = () => {
        if (page < totalPages) {
            setPage(page + 1);
        }
    };

    return (
        <>
            {loading && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(255,255,255,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Spinner />
                </div>
            )}
            <Navbar />
            <div className="min-h-screen flex">
                <AppSidebar />
                <div className="flex-1 py-8 px-2 md:px-8">
                    <div className="max-w-5xl mx-auto mb-8">
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Admin Profiles</h1>
                        <Button onClick={openAdd} className="mb-4">Add Admin</Button>
                        <div className="flex flex-col gap-6">
                            {admins.map(admin => (
                                <div key={admin.id} className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 flex flex-col md:flex-row items-center gap-6">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-400 to-blue-400 flex items-center justify-center shadow-lg mb-2 md:mb-0">
                                        <span className="text-2xl font-bold text-white">{admin.name[0]}</span>
                                    </div>
                                    <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between w-full">
                                        <div className="text-left md:w-1/2">
                                            <div className="font-bold text-xl text-gray-900">{admin.name} {admin.surname}</div>
                                            <div className="text-gray-500 text-sm mt-1">UserId: {admin.userId}</div>
                                            <div className="text-gray-500 text-sm mt-1">ProfileId: {admin.id}</div>
                                            <div className="text-gray-500 text-sm mt-1">{admin.email}</div>
                                            <div className="text-gray-500 text-sm mt-1">Phone: {admin.phone}</div>
                                            <div className="text-gray-500 text-sm mt-1">Citizenship: {admin.countryCitizenshipId !== null && countries[admin.countryCitizenshipId - 1] ? countries[admin.countryCitizenshipId - 1].name : "Unknown"}</div>
                                        </div>
                                        <div className="flex flex-wrap justify-center gap-3 mt-3 md:mt-0 md:w-1/4">
                                            <Button variant="outline" onClick={() => openEdit(admin)}>Edit</Button>
                                            <Button variant="destructive" onClick={() => handleDeleteClick(admin)}>Delete</Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Pagination Controls */}
                        <div className="flex justify-center items-center gap-4 mt-6">
                            <Button
                                className="rounded-xl px-6 py-2 bg-gradient-to-tr from-indigo-500 to-blue-600 text-white font-semibold shadow hover:from-indigo-600 hover:to-blue-700 transition"
                                onClick={handlePrevPage}
                                disabled={page <= 1}
                            >
                                Previous
                            </Button>
                            <span className="text-gray-700">Page {page} of {totalPages}</span>
                            <Button
                                className="rounded-xl px-6 py-2 bg-gradient-to-tr from-indigo-500 to-blue-600 text-white font-semibold shadow hover:from-indigo-600 hover:to-blue-700 transition"
                                onClick={handleNextPage}
                                disabled={page >= totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{isEdit ? "Edit Admin" : "Add Admin"}</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-2">
                                <div className="md:flex md:gap-4">
                                    <div className="flex-1">
                                        <Label className="font-semibold text-indigo-700">Name</Label>
                                        <Input className="border-2 border-indigo-200 rounded-lg shadow-sm focus:ring-indigo-400" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Name" />
                                    </div>
                                    <div className="flex-1 mt-2 md:mt-0">
                                        <Label className="font-semibold text-indigo-700">Surname</Label>
                                        <Input className="border-2 border-indigo-200 rounded-lg shadow-sm focus:ring-indigo-400" value={form.surname} onChange={e => setForm(f => ({ ...f, surname: e.target.value }))} placeholder="Surname" />
                                    </div>
                                </div>
                                <div className="md:flex md:gap-4">
                                    <div className="flex-1">
                                        <Label className="font-semibold text-indigo-700">Email</Label>
                                        <Input className="border-2 border-indigo-200 rounded-lg shadow-sm focus:ring-indigo-400" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" />
                                    </div>
                                    <div className="flex-1 mt-2 md:mt-0">
                                        <Label className="font-semibold text-indigo-700">Phone</Label>
                                        <Input className="border-2 border-indigo-200 rounded-lg shadow-sm focus:ring-indigo-400" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone" />
                                    </div>
                                </div>
                                <div className="md:flex md:gap-4">
                                    <div className="flex-1">
                                        <Label className="font-semibold text-indigo-700">Citizenship</Label>
                                        <select
                                            value={form.countryCitizenshipId ?? ""}
                                            onChange={e => {
                                                const val = Number(e.target.value);
                                                setForm(f => ({ ...f, countryCitizenshipId: val }));
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
                                </div>
                                {/* In the modal, show password fields only if !isEdit */}
                                {!isEdit && (
                                    <div className="md:flex md:gap-4">
                                        <div className="flex-1">
                                            <Label className="font-semibold text-indigo-700">Password</Label>
                                            <Input className="border-2 border-indigo-200 rounded-lg shadow-sm focus:ring-indigo-400" value={form.password ?? ""} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Password" required />
                                        </div>
                                        <div className="flex-1 mt-2 md:mt-0">
                                            <Label className="font-semibold text-indigo-700">Confirm Password</Label>
                                            <Input className="border-2 border-indigo-200 rounded-lg shadow-sm focus:ring-indigo-400" value={form.confirmPassword ?? ""} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} placeholder="Confirm Password" required />
                                        </div>
                                    </div>
                                )}
                                <div className="flex justify-end gap-2 pt-4">
                                    <Button variant="ghost" className="rounded-xl px-6 py-2 text-gray-700 border border-gray-300 hover:bg-gray-100" onClick={() => setIsOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button className="rounded-xl px-6 py-2 bg-gradient-to-tr from-indigo-500 to-blue-600 text-white font-semibold shadow hover:from-indigo-600 hover:to-blue-700 transition" onClick={handleSave}>{isEdit ? "Save" : "Add"}</Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Are you sure you want to delete this admin?</DialogTitle>
                            </DialogHeader>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="ghost" onClick={handleDeleteCancel}>Cancel</Button>
                                <Button variant="destructive" onClick={handleDeleteConfirmed}>Delete</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </>
    );
}
