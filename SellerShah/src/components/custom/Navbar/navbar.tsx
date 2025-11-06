import './navbar.css';
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { CiLock } from "react-icons/ci";
import { GoSignOut } from "react-icons/go";
import { VscAccount } from "react-icons/vsc";
import { toast } from "sonner";
import { logout } from '@/features/auth/services/auth.service';
import { tokenStorage } from '@/shared/tokenStorage';
import {jwtDecode} from 'jwt-decode';
import { getCountries } from '@/features/profile/Country/country.service';
import type { Country } from '@/features/profile/DTOs/seller.interfaces';

export default function Navbar() {
    const { t } = useTranslation();
    const [flag, setFlag] = useState<string>(() => localStorage.getItem('flag') || 'https://flagsapi.com/GB/flat/64.png');// Default to UK flag
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [countries, setCountries] = useState<Country[]>([]);
    const [isLanguagesLoaded, setIsLanguagesLoaded] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const savedLang = localStorage.getItem('language');
        if (savedLang) {
            setSelectedCountryCode(savedLang);
        }
        
    }, []);

    const [selectedCountryCode, setSelectedCountryCode] = useState<string>(() => localStorage.getItem('language') || '');
    const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedLanguage = event.target.value;
        setSelectedCountryCode(selectedLanguage);
        localStorage.setItem('language', selectedLanguage);
        const arr = Array.isArray(countries) ? countries : [];
        const selected = arr.find((c: any) => c.code === selectedLanguage);
        const flagUrl = selected?.code
            ? `https://flagsapi.com/${selected.code.toUpperCase()}/flat/64.png`
            : 'https://flagsapi.com/GB/flat/64.png';
        setFlag(flagUrl);
        localStorage.setItem('flag', flagUrl);
    };

    // Update flag if language changes programmatically (e.g., from another part of the app)
    useEffect(() => {
        const fetchCountries = async () => {
            const fetchedCountries = await getCountries();
            let arr = Array.isArray(fetchedCountries.data)
                ? fetchedCountries.data
                : [];
            setCountries(arr);
            setIsLanguagesLoaded(true);
            const storedFlag = localStorage.getItem('flag');
            if (storedFlag) {
                setFlag(storedFlag);
            } else {
                // If not in localStorage, set based on current language
                const currentLang = localStorage.getItem('language') || 'GB';
                const selected = arr.find((c: any) => c.code === currentLang);
                const flagUrl = selected?.code
                    ? `https://flagsapi.com/${selected.code.toUpperCase()}/flat/64.png`
                    : 'https://flagsapi.com/GB/flat/64.png';
                setFlag(flagUrl);
                localStorage.setItem('flag', flagUrl);
            }
        };
        fetchCountries();
    }, []);

    useEffect(() => {
        const token = tokenStorage.get();
        if (token) {
            try {
                jwtDecode(token); // Decoded value not used, just validate token
                setIsLoggedIn(true);
            } catch (err) {
                tokenStorage.clear();
                setIsLoggedIn(false);
            }
        } else {
            setIsLoggedIn(false);
        }
    }, []);

    const handleLogout = async () => {
        await logout();
        toast.success(t('Logged out successfully'));
        setLoading(false);
    };
    return (
        <div className="flex flex-col bg-gray-800 w-full p-2 sm:p-4 text-white">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <img
                    src='src/assets/images/ShahLogo2.png'
                    className="w-20 h-20 sm:w-24 sm:h-24 cursor-pointer mb-2 sm:mb-0"
                    alt="Company Logo"
                />

                <div className="flex items-center  justify-center w-full sm:w-auto gap-2">
                    <div className="flex items-center justify-center gap-2">
                        {
                            !isLoggedIn &&
                            <>
                                <Button className="text-white cursor-pointer h-12 bg-inherit hover:bg-gray-700" onClick={() => { navigate('/login') }}>
                                    <div className="flex items-center justify-center rounded-full">
                                        <CiLock className='w-9 h-9' />
                                    </div>
                                    <span className='hidden lg:block'>
                                        Sign in
                                    </span>
                                </Button>
                                <Button className="text-white cursor-pointer h-12 bg-inherit hover:bg-gray-700" onClick={() => { navigate('/register') }}>
                                    <div className="flex items-center justify-center rounded-full">
                                        <VscAccount className='w-9 h-9' />
                                    </div>
                                    <span className='hidden lg:block'>
                                        Sign up
                                    </span>
                                </Button>
                            </>
                        }
                    </div>
                    {
                        isLoggedIn &&
                        <Button className="text-white cursor-pointer h-12 bg-inherit hover:bg-gray-700" onClick={handleLogout}>
                            <div className="flex items-center justify-center rounded-full">
                                <GoSignOut className='w-9 h-9' />
                            </div>
                            <span className='hidden lg:block'>
                                SignOut
                            </span>
                        </Button>
                    }
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                            <img src={flag} alt={t('flag')} className='w-8 h-8' />
                            {isLanguagesLoaded && (
                                <select className="languageDropdown bg-white text-gray-800 p-2 rounded"
                                    onChange={handleLanguageChange}
                                    value={selectedCountryCode} >
                                    {countries.map((country) => (
                                        <option key={country.code} value={country.code}>
                                            {country.code} - {country.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}