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
import { useSelector } from "react-redux";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useTranslation } from "react-i18next";
import { getTranslatedCategories } from './getTranslatedCategories';
import { toast } from 'sonner';
import { CiLogout } from "react-icons/ci";
import { tokenStorage } from '@/shared';
import { useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import { logout } from '@/features/auth/services/auth.service';

export default function Navbar() {
    const { t, i18n } = useTranslation();
    const categories = getTranslatedCategories(t);
    const [flag, setFlag] = useState<string>(() => localStorage.getItem('flag') || 'https://flagsapi.com/GB/flat/64.png');// Default to UK flag
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]); // Explicitly type as any[] or Product[] if available
    const products = useSelector((state: any) => state.product);
    const [userLogo, setUserLogo] = useState<string>("");
    const [userName, setUserName] = useState<string>("");
    const [cartCount, setCartCount] = useState<number>(0);
    const [favouritesCount, setFavouritesCount] = useState<number>(0);

    const navigate = useNavigate();

    useEffect(() => {
        const token = tokenStorage.get();
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                setUserLogo(decoded.profilePicPreview || "");
                setUserName(decoded.name || "");
                setCartCount(Number(decoded.cart_count) || 0); // Assuming the token contains cart item count
                setFavouritesCount(Number(decoded.favourite_count) || 0); // Assuming the token contains favourites item count
            } catch (err) {
                // If token is invalid, clear storage
                tokenStorage.clear();
                setUserLogo("");
                setUserName("");
                setCartCount(0);
                setFavouritesCount(0);
            }
        }
    }, []);

    const navigateToCart = () => {
        navigate('/cart');
    };
    const navigateToFavourites = () => {
        navigate('/favourites');
    }
    const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedLanguage = event.target.value;
        let flagUrl = 'https://flagsapi.com/GB/flat/64.png';
        switch (selectedLanguage) {
            case 'en':
                flagUrl = 'https://flagsapi.com/GB/flat/64.png';
                break;
            case 'ru':
                flagUrl = 'https://flagsapi.com/RU/flat/64.png';
                break;
            case 'az':
                flagUrl = 'https://flagsapi.com/AZ/flat/64.png';
                break;
            default:
                flagUrl = 'https://flagsapi.com/GB/flat/64.png';
        }
        setFlag(flagUrl);
        localStorage.setItem('flag', flagUrl);
        i18n.changeLanguage(selectedLanguage);
    };

    const handleSearch = (e: any) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;
        const found = products.find(
            (p: any) => p.name.toLowerCase() === searchTerm.trim().toLowerCase()
        );
        if (found) {
            // Redirect to product details page
            navigate(`/product/${found.id}`);
        } else {
            toast.error(t('no_products_found'));
        }
    };

    const handleSearchChange = (e: any) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (value.trim()) {
            const results = products.filter((p: any) =>
                p.name.toLowerCase().includes(value.trim().toLowerCase())
            );
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    };

    const handleProductClick = (product: any) => {
        const categoryKey = Object.keys(categories).find(
            (key) => categories[key].id === product.categoryId
        );
        if (categoryKey) {
            if (product.subcategoryId) {
                navigate(`/category/${categoryKey}/${product.subcategoryId}`);
            } else {
                navigate(`/category/${categoryKey}`);
            }
        }
        setSearchResults([]);
        setSearchTerm(product.name);
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
                <form className="relative w-full sm:ml-6 mb-2 sm:mb-0" onSubmit={handleSearch}>
                    <Input
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder={t('Search on Shah')}
                        className='bg-white pl-10 pr-4 py-2 w-full text-gray-800 rounded-100 rounded-4xl'
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition duration-200">
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </span>
                    {searchResults.length > 0 && (
                        <div className="absolute z-10 left-0 right-0 mt-2 bg-white text-gray-800 rounded shadow-lg max-h-60 overflow-y-auto">
                            {searchResults.map((product: any) => (
                                <div
                                    key={product.id}
                                    className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                                    onClick={() => handleProductClick(product)}
                                >
                                    {product.image && (
                                        <img src={product.image} alt={t(product.name)} className="w-10 h-10 ml-2 inline-block" />
                                    )}
                                    {t(product.name)}
                                </div>
                            ))}
                        </div>
                    )}
                </form>
                <div className="flex items-center justify-center w-full sm:w-auto gap-2">
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
                                <span className='hidden lg:block'>
                                    {userName ? userName : t('Account')}
                                </span>
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

                    <Button className="relative text-white bg-inherit h-12 cursor-pointer ml-2 hover:bg-gray-700" onClick={navigateToFavourites}>
                        <div id='Favourites' className="flex items-center justify-center rounded-full p-2 relative">
                            <TfiHeart className="mr-2 w-2" />
                            {favouritesCount > 0 ? (
                                <span id="FavouritesCount" className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5 border-2 border-gray-800">
                                    {favouritesCount}
                                </span>
                            )
                                : null}
                        </div>
                        <span className='hidden lg:block'>{t('Favourites')}</span>
                    </Button>
                    <Button className="text-white bg-inherit h-12 cursor-pointer ml-2 hover:bg-gray-700" onClick={navigateToCart}>
                        <div id='Cart' className="flex items-center justify-center rounded-full p-2 relative">
                            <BsCart3 className="mr-2 w-2" />
                            {cartCount > 0 ? (
                                <span id="CartCount" className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5 border-2 border-gray-800">
                                    {cartCount}
                                </span>)
                                : null}
                        </div>
                        <span className='hidden lg:block'>{t('Cart')}</span>
                    </Button>
                </div>
            </div>
            <div>
                <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2">
                    <CategorySideBar categories={categories} />
                    <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                        <img src={flag} alt={t('flag')} className='w-8 h-8' />
                        <select className="languageDropdown bg-white text-gray-800 p-2 rounded"
                            onChange={handleLanguageChange}
                            value={i18n.language} >
                            <option value="en">{t('English')}</option>
                            <option value="ru">{t('Russian')}</option>
                            <option value="az">{t('Azerbaijani')}</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}