import './navbar.css';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VscAccount } from "react-icons/vsc";
import { BsCart3 } from "react-icons/bs";
import { TfiHeart } from "react-icons/tfi";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from 'react';
import CategorySideBar from "@/components/custom/categorySidebar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useTranslation } from "react-i18next";
import { toast } from 'sonner';
import { CiLogout } from "react-icons/ci";
import { tokenStorage } from '@/shared';
import { useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import { logout } from '@/features/auth/services/auth.service';
import { getCountries } from "@/features/services/Country/country.service";
import { getCategories } from "@/features/services/Category/category.service";
import { getCartItems, getFavouritesByUserId, getSearched } from "@/features/services/product/products.service";
import type { Category } from '@/features/services/DTOs/interfaces';
import { getImage } from '@/shared/utils/imagePost';
import type { Country } from '@/features/services/DTOs/interfaces';
import { apiCallWithManualRefresh } from '@/shared/apiWithManualRefresh';




export default function Navbar() {
    const { t, i18n } = useTranslation();
    const [flag, setFlag] = useState<string>(() => localStorage.getItem('flag') || 'https://flagsapi.com/GB/flat/64.png');// Default to UK flag
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]); // Explicitly type as any[] or Product[] if available
    const [userLogo, setUserLogo] = useState<string>("");
    const [cartCount, setCartCount] = useState<number>(0);
    const [favouritesCount, setFavouritesCount] = useState<number>(0);
    const [countries, setCountries] = useState<Country[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const navigate = useNavigate();
    // Fallback products list (some projects inject a global products array). Use empty array if not present.

    useEffect(() => {
        const token = tokenStorage.get();
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                setUserLogo(decoded.profilePicPreview || "");
                setCartCount(Number(decoded.cart_count) || 0); // Assuming the token contains cart item count
                setFavouritesCount(Number(decoded.favourite_count) || 0); // Assuming the token contains favourites item count
            } catch (err) {
                tokenStorage.clear();
                setUserLogo("");
                setCartCount(0);
                setFavouritesCount(0);
            }
        }

        const fetchCountries = async () => {
            const fetchedCountries = await getCountries();
            const anyFetched: any = fetchedCountries;
            let arr = Array.isArray(anyFetched)
                ? anyFetched
                : (anyFetched && Array.isArray(anyFetched.data) ? anyFetched.data : []);
            setCountries(arr);
            // Always read the flag from localStorage on mount
            const storedFlag = localStorage.getItem('flag');
            if (storedFlag) {
                setFlag(storedFlag);
            } else {
                // If not in localStorage, set based on current language
                const currentLang = i18n.language;
                const selected = arr.find((c: any) => c.code === currentLang);
                const flagUrl = selected?.code
                    ? `https://flagsapi.com/${selected.code.toUpperCase()}/flat/64.png`
                    : 'https://flagsapi.com/GB/flat/64.png';
                setFlag(flagUrl);
                localStorage.setItem('flag', flagUrl);
            }
        };


        const fetchCategories = async () => {
            try {
                const result = await getCategories();
                const arr = Array.isArray(result)
                    ? result
                    : (result && Array.isArray((result as any).data) ? (result as any).data : []);
                setCategories(arr);
            } catch (err) {
                setCategories([]);
            }
        };

        fetchCountries();
        fetchCategories();
        // Initial counts fetch (token may not carry latest)
        const fetchCounts = async () => {
            try {
                const [cartRes, favRes] = await Promise.all([
                    apiCallSafe(() => getCartItems()),
                    apiCallSafe(() => getFavouritesByUserId())
                ]);
                const cartArr = normalizeList(cartRes);
                const favArr = normalizeList(favRes);
                setCartCount(cartArr.reduce((sum: number, it: any) => sum + (Number(it.quantity) || 1), 0));
                setFavouritesCount(favArr.length);
            } catch (err) {
            }
        };
        fetchCounts();
        // Listen for global favourites updates
        const onFavouritesUpdated = (e: any) => {
            try {
                const delta = e?.detail?.count ?? 0;
                setFavouritesCount((c) => Math.max(0, c + Number(delta)));
            } catch (err) {
            }
        };
        // Listen for cart updates (delta-based and full refresh)
        const onCartCountDelta = (e: any) => {
            try {
                const delta = Number(e?.detail?.delta ?? 0);
                if (!Number.isFinite(delta)) return;
                setCartCount((c) => Math.max(0, c + delta));
            } catch (err) {
            }
        };
        const onCartUpdated = async () => {
            try {
                const cartRes = await apiCallSafe(() => getCartItems());
                const cartArr = normalizeList(cartRes);
                setCartCount(cartArr.reduce((sum: number, it: any) => sum + (Number(it.quantity) || 1), 0));
            } catch { }
        };
        window.addEventListener('favourites:updated', onFavouritesUpdated as EventListener);
        window.addEventListener('cart:count-delta', onCartCountDelta as EventListener);
        window.addEventListener('cart:updated', onCartUpdated as EventListener);
        return () => {
            window.removeEventListener('favourites:updated', onFavouritesUpdated as EventListener);
            window.removeEventListener('cart:count-delta', onCartCountDelta as EventListener);
            window.removeEventListener('cart:updated', onCartUpdated as EventListener);
        };
    }, []);

    // Helpers (defined outside effect to avoid redefinition warnings)
    function normalizeList(res: any): any[] {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res?.data?.data)) return res.data.data;
        return [];
    }
    async function apiCallSafe<T>(fn: () => Promise<T>): Promise<T | null> {
        try { return await fn(); } catch { return null; }
    }

    const navigateToCart = () => {
        navigate('/cart');
    };
    const navigateToFavourites = () => {
        navigate('/favourites');
    }
    const handleLanguageChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedLanguage = event.target.value;
        // Defensive: ensure countries is always an array
        const anyCountries: any = countries;
        const arr = Array.isArray(anyCountries) ? anyCountries : (anyCountries?.data || []);
        const selected = arr.find((c: any) => c.code === selectedLanguage);
        const flagUrl = selected?.code
            ? `https://flagsapi.com/${selected.code.toUpperCase()}/flat/64.png`
            : 'https://flagsapi.com/GB/flat/64.png';
        setFlag(flagUrl);
        localStorage.setItem('flag', flagUrl);
        // Only switch to supported app locales; normalize to lowercase
        const supported = ['en', 'az', 'ru'];
        const nextLng = supported.includes(selectedLanguage.toLowerCase()) ? selectedLanguage.toLowerCase() : 'en';
        i18n.changeLanguage(nextLng);
    };

    const handleSearch = (e: any) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;
        // Redirect to search page with query
        navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
        setSearchResults([]);
        setSearchTerm("");
        window.location.reload();
    };

    const handleSearchChange = async (e: any) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (value.trim()) {
            // Make API request to search products by title
            try {
                const result = await apiCallWithManualRefresh(() => getSearched({ title: value, page: 1, pageSize: 10 }));
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
                                element.mainImage = "https://via.placeholder.com/300x200";
                            }
                        })
                    );
                }


                const results = items.filter((p: any) =>
                    p.productTitle && p.productTitle.toLowerCase().includes(value.trim().toLowerCase())
                );
                setSearchResults(results);
            } catch {
                setSearchResults([]);
            }
        } else {
            setSearchResults([]);
        }
    };
    
    const isLoggedIn = !!tokenStorage.get();
    const handleLogout = async () => {
        await logout();
        toast.success(t('Logged out successfully'));
        navigate('/');
    };
    return (
        <div className="flex flex-col bg-gray-800 w-full p-2 sm:p-4 text-white">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <img
                    src="\src\assets\images\ShahLogo2.png"
                    className="w-20 h-20 sm:w-24 sm:h-24 cursor-pointer mb-2 sm:mb-0"
                    alt="Company Logo"
                    onClick={() => { navigate("/") }}
                />
                <form className="relative w-full sm:ml-6 mb-2 sm:mb-0" onSubmit={handleSearch} autoComplete="off">
                    <Input
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder={t('Search on Shah')}
                        className='bg-white pl-10 pr-4 py-2 w-full text-gray-800 rounded-100 rounded-4xl'
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition duration-200" onClick={handleSearch}>
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </span>
                    {searchResults.length > 0 && searchTerm.trim() !== "" && (
                        <div className="absolute z-20 left-0 right-0 mt-2 bg-white text-gray-800 rounded shadow-lg max-h-60 overflow-y-auto border border-gray-200">
                            {searchResults.map((product: any) => (
                                <div
                                    key={product.id}
                                    className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 border-b"
                                    onClick={() => {
                                        navigate(`/product?id=${product.id}&productVariantId=${product.representativeVariantId}`);
                                        setSearchResults([]);
                                        setSearchTerm("");
                                        window.location.reload();
                                    }}
                                >
                                    {product.mainImage && product.mainImage !== "none" && (
                                        <img
                                            src={product.mainImage}
                                            alt={t(product.productTitle)}
                                            className="w-10 h-10 object-cover rounded mr-3"
                                            onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40x40'; }}
                                        />
                                    )}
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-base">{product.productTitle}</span>
                                        {product.categoryName && product.categoryName !== "none" && <span className="text-xs text-gray-500">{product.categoryName}</span>}
                                        {product.storeName && product.storeName !== "none" && <span className="text-xs text-gray-500">{product.storeName}</span>}
                                    </div>
                                    <span className="ml-auto text-sm font-bold text-blue-600">
                                        {product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price ? (
                                            <>
                                                <span className="text-red-600 font-bold mr-2">{product.discountPrice}₼</span>
                                                <span className="line-through text-gray-400">{product.price}₼</span>
                                            </>
                                        ) : (
                                            <span>{product.price}$</span>
                                        )}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </form>
                <div className="flex items-center justify-center w-full sm:w-auto gap-2">
                    <Button className="relative text-white bg-inherit h-12 cursor-pointer ml-2 hover:bg-gray-700" onClick={navigateToFavourites}>
                        <div id='Favourites' className="flex items-center justify-center rounded-full p-2 relative">
                            <TfiHeart className=" w-2" />
                            {favouritesCount > 0 && (
                                <span id="FavouritesCount" className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5 border-2 border-gray-800">
                                    {favouritesCount}
                                </span>
                            )}
                        </div>
                    </Button>
                    <Button className="text-white bg-inherit h-12 cursor-pointer ml-2 hover:bg-gray-700" onClick={navigateToCart}>
                        <div id='Cart' className="flex items-center justify-center rounded-full p-2 relative">
                            <BsCart3 className=" w-2" />
                            {cartCount > 0 && (
                                <span id="CartCount" className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5 border-2 border-gray-800">
                                    {cartCount}
                                </span>
                            )}
                        </div>
                    </Button>
                    <HoverCard>
                        <HoverCardTrigger>
                            <Button className="text-white cursor-pointer h-12 bg-inherit hover:bg-gray-700" >
                                <div className="flex items-center justify-center rounded-full">
                                    <Avatar>
                                        <AvatarImage id='AvatarImage' src={userLogo} alt="User Avatar" />
                                        <AvatarFallback className='text-white-500 bg-transparent'>
                                            {userLogo ? (
                                                <img src={userLogo} alt="User Avatar" className="w-9 h-9 rounded-full" />
                                            ) : (
                                                <VscAccount className="w-9 h-9" />
                                            )}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                            </Button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-40 ">
                            <div className="flex flex-col space-y-2">
                                {!isLoggedIn ? (
                                    <>
                                        <Button variant="outline" className="mt-2" onClick={() => navigate('/login')}>{t('Login')}</Button>
                                        <Button variant="outline" className="mt-2" onClick={() => navigate('/reg')}>{t('Sign Up')}</Button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant="outline" className="mt-2" onClick={() => navigate('/profile')}>{t('Profile')}</Button>
                                        <Button variant="outline" className="mt-2" onClick={handleLogout}>
                                            <CiLogout className="mr-2" />
                                            {t('Logout')}</Button>
                                    </>
                                )}
                            </div>
                        </HoverCardContent>
                    </HoverCard>
                </div>
            </div>
            <div>
                <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2">
                    <CategorySideBar categories={
                        (() => {
                            // If API returned a nested tree, flatten it into a map keyed by id
                            const tree = Array.isArray(categories) ? categories : (categories as any || []);
                            const map: Record<string, any> = {};
                            const walk = (node: any, parentId: string | null) => {
                                map[node.id] = { ...node, parentCategoryId: parentId };
                                if (Array.isArray(node.children)) {
                                    node.children.forEach((c: any) => walk(c, node.id));
                                }
                            };
                            tree.forEach((n: any) => walk(n, n.parentCategoryId ?? null));
                            return map;
                        })()
                    } />
                    <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                        <img src={flag} alt={'flag'} className='w-8 h-8' />
                        <select className="languageDropdown bg-white text-gray-800 p-2 rounded"
                            onChange={handleLanguageChange}
                            value={i18n.language} >
                            {countries.map((country) => (
                                <option key={country.code} value={country.code}>
                                    {country.code}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}