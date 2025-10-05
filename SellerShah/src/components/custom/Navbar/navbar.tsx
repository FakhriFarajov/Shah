import './navbar.css';
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { CiLock } from "react-icons/ci";
import { GoSignOut } from "react-icons/go";
import { VscAccount } from "react-icons/vsc";

export default function Navbar() {
    const { t, i18n } = useTranslation();
    const [flag, setFlag] = useState<string>(() => localStorage.getItem('flag') || 'https://flagsapi.com/GB/flat/64.png');// Default to UK flag
    const navigate = useNavigate();

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

    const isLoggedIn = !localStorage.getItem("userToken");
    const location = useLocation();
    // Adjust these paths as needed for your app structure
    const isLandingPage = location.pathname === "/" || location.pathname === "/landing";
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
                            isLoggedIn &&
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
                        !isLoggedIn &&
                        <Button className="text-white cursor-pointer h-12 bg-inherit hover:bg-gray-700" onClick={() => { navigate('/') }}>
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
        </div>
    );
}