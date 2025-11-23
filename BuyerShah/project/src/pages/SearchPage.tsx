import NavBar from "@/components/custom/Navbar/navbar";
import Footer from "@/components/custom/footer";
import ProductCard from "@/components/custom/itemCard";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { apiCallWithManualRefresh } from "@/shared/apiWithManualRefresh";
import { getSearched } from "@/features/services/product/products.service";
import { getImage } from "@/shared/utils/imagePost";
import Spinner from "@/components/custom/spinner";
import { FaMagnifyingGlass } from "react-icons/fa6";

export default function SearchPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const query = searchParams.get('query') || '';

    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const handleSearchChange = async (searchTerm: string) => {
        setSearchTerm(searchTerm);
        if (searchTerm.trim()) {
            try {
                const result = await apiCallWithManualRefresh(() => getSearched({ title: searchTerm, page: 1, pageSize: 10 }));
                console.log("Search results:", result);
                const items = Array.isArray(result?.data)
                    ? result.data
                    : Array.isArray(result?.data?.data)
                        ? result.data.data
                        : [];

                // Resolve images in parallel and attach `mainImageUrl` (or placeholder)
                if (Array.isArray(items) && items.length > 0) {
                    await Promise.all(
                        items.map(async (element: any) => {
                            try {
                                if (element.mainImage) {
                                    const url = await getImage(element.mainImage);
                                    element.mainImage = url || element.mainImage || "https://via.placeholder.com/300x200";
                                } else {
                                    element.mainImage = "https://via.placeholder.com/300x200";
                                }
                            } catch (error) {
                                console.warn("Error resolving product image:", error);
                                element.mainImage = "https://via.placeholder.com/300x200";
                            }
                        })
                    );
                }
                console.log("Items after image resolution:", items);

                const results = items.filter((p: any) =>
                    p.productTitle && p.productTitle.toLowerCase().includes(searchTerm.trim().toLowerCase())
                );
                setSearchResults(results);
            } catch {
                setSearchResults([]);
            }
        } else {
            setSearchResults([]);
        }
    };

    useEffect(() => {
        setLoading(true);
        handleSearchChange(query);
        setLoading(false);
    }, []);

    return (
        <>
            {
                loading && (
                    <div className="fixed inset-0 bg-white bg-opacity-100 flex items-center justify-center z-50">
                        <Spinner />
                    </div>
                )
            }
            <NavBar />
            <div className="container mx-auto px-4 py-6 min-h-screen">
                <h1 className="text-2xl font-bold mb-6">{('The searched')} "{searchTerm}"</h1>
                {searchResults.length === 0 ? (
                    <div className="text-center py-12">
                        <FaMagnifyingGlass className="mx-auto mb-4" size={48} />
                        <h1 className="text-xl font-bold">{('No products found.')}</h1>
                        <Button className="py-2 px-4 mt-10 rounded-lg"  onClick={() => navigate('/main')}>
                            {('Go shopping!')}
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {searchResults.map((product: any) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
            <Footer />

        </>
    );
}
