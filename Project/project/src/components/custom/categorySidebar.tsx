import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TbCategory } from "react-icons/tb";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";


import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

interface Subcategory {
    id: number;
    name: string;
}

interface Category {
    id: number;
    name: string;
    subcategories?: Subcategory[];
}

interface SideBarProps {
    categories: Record<string, Category>;
}

export default function SideBar({ categories }: SideBarProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    return (
        <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="relative text-white bg-gray-700 h-12 cursor-pointer ml-2">
                            <div id='Orders' className="flex items-center justify-center rounded-full p-2 relative">
                                <TbCategory className="mr-2 w-2" />
                            </div>
                            <span>{t('Category')}</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="bg-gray-800 text-gray-100">
                        <SheetHeader>
                            <SheetTitle className="text-white">{t('Category')}</SheetTitle>
                            <Separator></Separator>
                            <Accordion type="single" collapsible >
                                {Object.entries(categories).map(([key, category]: [string, any]) => (
                                    <AccordionItem value={category.name} className="text-white border-none" key={key}>
                                        <AccordionTrigger className="flex items-center justify-between text-white hover:no-underline p-2 rounded-md cursor-pointer" >
                                            <span className="text-lg font-semibold" onClick={() => navigate(`/category/${key}`)}>{t(category.name)}</span>
                                        </AccordionTrigger>
                                        <AccordionContent className="text-gray-300 pl-4">
                                            {category.subcategories?.map((subcategory: any) => (
                                                <div
                                                    key={subcategory.id}
                                                    className="pl-4 cursor-pointer hover:text-blue-400"
                                                    onClick={() => navigate(`/category/${key}/${subcategory.id}`)}
                                                >
                                                    {t(subcategory.name)}
                                                </div>
                                            ))}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </SheetHeader>
                    </SheetContent>
                </Sheet>
                <div className="hidden xl:flex gap-2">
                    {Object.entries(categories).map(([key, category]: [string, any]) => (
                        <button
                            key={key}
                            className="text-gray-300 cursor-pointer hover:text-xl transition-all duration-300 bg-transparent border-none focus:outline-none"
                            type="button"
                            onClick={() => navigate(`/category/${key}`)}
                        >
                            {t(category.name)}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
