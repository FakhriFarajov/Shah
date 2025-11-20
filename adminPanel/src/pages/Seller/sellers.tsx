import Navbar from "../../components/custom/Navbar/navbar";
import { AppSidebar } from "@/components/custom/sidebar";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import type { SellerProfileResponseDTO } from "@/features/profile/DTOs/seller.interfaces";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiCallWithManualRefresh } from "@/shared/apiWithManualRefresh";
import type { PaginatedResult } from "@/features/profile/DTOs/admin.interfaces";
import { deleteSellerProfile, getPaginatedSellerProfiles, getSellerProfile } from "@/features/profile/SellerService/profile.service";
import { getCountries } from "@/features/profile/Country/country.service";
import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function SellersPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [countries, setCountries] = useState<Array<{ id: number; name: string }>>([]);
    const [sellers, setSellers] = useState<SellerProfileResponseDTO[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sellerToSearchId, setSellerToSearchId] = useState('');
    const pageSize = 5;
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [sellerToDelete, setSellerToDelete] = useState<SellerProfileResponseDTO | null>(null);

    function handleDeleteClick(id: string) {
        const seller = sellers.find(seller => seller.id === id) || null;
        setSellerToDelete(seller);
        setDeleteConfirmOpen(true);
    }

    async function handleDeleteConfirmed() {
        if (!sellerToDelete) return;
        setLoading(true);
        try {
            const response = await apiCallWithManualRefresh(() => deleteSellerProfile(sellerToDelete.id));
            if (response && response.isSuccess) {
                toast.success("Seller deleted successfully");
                fetchSellersPaginated(1);
            } else {
                const errorMsg = response?.message || "Failed to delete seller profile";
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
                console.error("Failed to delete admin profile:", error);
            }
        } finally {
            setLoading(false);
            setDeleteConfirmOpen(false);
            setSellerToDelete(null);
        }
    }

    function handleDeleteCancel() {
        setDeleteConfirmOpen(false);
        setSellerToDelete(null);
    }
    async function handleSearch() {
        if (!sellerToSearchId.trim()) {
            toast.error('Please enter a User ID to search.');
            return;
        }

        setLoading(true);
        try {
            const result = await apiCallWithManualRefresh(() => getSellerProfile(sellerToSearchId));
            console.log("Fetched seller profile:", result);
            setSellers(result ? [result] : []);
            setPage(1);
            setTotalPages(1);
        } catch (error) {
            console.error("Failed to fetch seller profile:", error);
            toast.error('Failed to fetch seller profile. Please check the User ID and try again.');
        } finally {
            setLoading(false);
        }
    }
    async function fetchSellersPaginated(newPage = page) {
        setLoading(true);
        try {
            const result: PaginatedResult<SellerProfileResponseDTO> = await apiCallWithManualRefresh(() => getPaginatedSellerProfiles(newPage, pageSize));
            console.log("Fetched paginated sellers:", result);
            setSellers(result.data || []);
            setPage(result.page || newPage);
            setTotalPages(result.totalPages || 1);
        } catch (error) {
            console.error("Failed to fetch paginated sellers:", error);
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
            console.error("Failed to fetch countries:", error);
        } finally {
            setLoading(false);
        }
    }

    // Fetch sellers when page changes
    useEffect(() => {
        fetchSellersPaginated(page);
    }, [page, pageSize]);


    useEffect(() => {
        fetchCountries();
    }, []);

    return (
        <>
            <Navbar />
            <div className="min-h-screen flex">
                <AppSidebar />
                <div className="flex-1 py-8 px-2 md:px-8">
                    <div className="max-w-6xl mx-auto mb-8">
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Sellers</h1>
                        <p className="text-lg text-gray-500 mb-4">View and manage all sellers here.</p>
                        <div className="mb-4 flex items-center gap-2">
                            <label htmlFor="filterId" className="font-medium text-gray-700">Filter by UserID:</label>
                            <input
                                id="filterId"
                                type="text"
                                value={sellerToSearchId}
                                className="border rounded px-3 py-2 w-32 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Enter UserID"
                                onChange={e => setSellerToSearchId(e.target.value)}
                            />
                            <Button onClick={handleSearch} variant="outline">Search</Button>
                        </div>
                    </div>
                    <div className="max-w-5xl mx-auto mt-4">
                        <div className="flex flex-row flex-wrap gap-6 justify-center items-stretch">
                            {sellers.map(seller => (
                                <div key={seller.id} className="chad-card bg-white rounded-2xl shadow-xl border border-gray-200 p-6 flex flex-col xl:flex-row items-center gap-6 transition-transform hover:scale-[1.02] hover:shadow-2xl">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-400 to-pink-400 flex items-center justify-center shadow-lg mb-2 md:mb-0">
                                        <span className="text-3xl font-bold text-white">{seller.name[0]}{seller.surname[0]}</span>
                                    </div>
                                    <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4 w-full">
                                        <div className="text-left md:w-1/3">
                                            <div className="font-bold text-xl text-gray-900">
                                                {(seller.name.length + seller.surname.length > 10)
                                                    ? (seller.name + " " + seller.surname).slice(0, 10) + "..."
                                                    : seller.name + " " + seller.surname}
                                            </div>
                                            <div className="text-gray-500 text-sm mt-1">UserID: {seller.id}</div>
                                            <div className="text-gray-500 text-sm mt-1">Company: {seller.storeName}</div>
                                        </div>
                                        <div className="flex flex-col gap-1 md:w-1/4">
                                            <div className="flex items-center gap-2 text-gray-700"><span className="font-medium">Email:</span> <span className="truncate">{seller.email.length > 10 ? seller.email.slice(0, 10) + "..." : seller.email}</span></div>
                                            <div className="flex items-center gap-2 text-gray-700"><span className="font-medium">Phone:</span> <span>{seller.phone.length > 10 ? seller.phone.slice(0, 10) + "..." : seller.phone}</span></div>
                                        </div>
                                        <div className="flex flex-wrap gap-3 mt-3 md:mt-0 md:w-2/5 justify-end">
                                            <button
                                                className="px-4 py-2 rounded-lg bg-gradient-to-tr from-green-400 to-green-600 text-white font-semibold shadow hover:from-green-500 hover:to-green-700 transition"
                                                onClick={() => navigate(`/seller-profile?sellerId=${seller.id}`)}
                                                title="Profile"
                                            >
                                                Profile
                                            </button>
                                            <button
                                                className="px-4 py-2 rounded-lg bg-gradient-to-tr from-red-400 to-red-600 text-white font-semibold shadow hover:from-red-500 hover:to-red-700 transition"
                                                onClick={() => handleDeleteClick(seller.id)}
                                                title="Delete"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-center items-center gap-4 mt-6">
                            <button
                                className="px-4 py-2 rounded-xl bg-indigo-800 text-white hover:bg-indigo-300 disabled:opacity-50"
                                onClick={() => {
                                    if (page > 1) setPage(page - 1);
                                }}
                                disabled={page === 1}
                            >
                                Previous
                            </button>
                            <span className="text-gray-700">Page {page} of {totalPages}</span>
                            <button
                                className="px-4 py-2 rounded-xl bg-indigo-800 text-white hover:bg-indigo-300 disabled:opacity-50"
                                onClick={() => {
                                    if (page < totalPages) setPage(page + 1);
                                }}
                                disabled={page === totalPages || totalPages === 0}
                            >
                                Next
                            </button>
                        </div>
                        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Are you sure you want to delete this seller?</DialogTitle>
                                </DialogHeader>
                                <div className="flex justify-end gap-2 pt-4">
                                    <Button variant="ghost" onClick={handleDeleteCancel}>Cancel</Button>
                                    <Button variant="destructive" onClick={handleDeleteConfirmed}>Delete</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>
        </>
    );
}
