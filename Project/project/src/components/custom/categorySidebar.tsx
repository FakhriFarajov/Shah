import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TbCategory } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import type { Category } from '@/features/services/DTOs/interfaces';


import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion"


export default function SideBar({ categories }: { categories: Record<string, Category> }) {
    const navigate = useNavigate();
    // Find root categories
    const rootCategories = Object.entries(categories).filter(([_key, category]) => category.parentCategoryId == null);


    // Recursive renderer using Accordions; leaves are clickable spans
    const renderSubcategories = (parentId: string, level: number = 1) => {
        const subs = Object.entries(categories).filter(([_subKey, subCat]) => subCat.parentCategoryId === parentId);
        if (subs.length === 0) return null;

        return (
            <div className={`pl-${level * 4} py-1 space-y-1`}>
                {subs.map(([subKey, subCat]) => {
                    const hasChildren = Object.values(categories).some((c: any) => c.parentCategoryId === subCat.id);
                    if (hasChildren) {
                        return (
                            <Accordion type="single" collapsible key={subKey}>
                                <AccordionItem value={subCat.id} className="text-white border-none">
                                    <AccordionTrigger className="flex items-center justify-between text-white hover:no-underline p-2 rounded-md cursor-pointer" >
                                        <span className={`text-base font-medium ${level > 1 ? 'pl-2' : ''}`} onClick={() => navigate(`/category?id=${subCat.id}&name=${subCat.categoryName}`)}>{(subCat.categoryName)}</span>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        {renderSubcategories(subCat.id, level + 1)}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        );
                    } else {
                        return (
                            <span
                                key={subKey}
                                className={`block text-base font-medium text-white p-2 rounded-md cursor-pointer hover:bg-gray-700 ${level > 1 ? 'pl-2' : ''}`}
                                onClick={() => navigate(`/category?id=${subCat.id}&name=${subCat.categoryName}`)}
                            >
                                {(subCat.categoryName)}
                            </span>
                        );
                    }
                })}
            </div>
        );
    };

    return (
        <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="relative text-white bg-gray-700 h-12 cursor-pointer ml-2 rounded-full hover:bg-gray-600  hover:text-white px-4 flex items-center gap-2">
                            <div id='Orders' className="flex items-center justify-center rounded-full p-2 relative">
                                <TbCategory className="mr-2 w-2" />
                            </div>
                            <span>{('Category')}</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="bg-gray-800 text-gray-100">
                        <SheetHeader>
                            <SheetTitle className="text-white">{('Category')}</SheetTitle>
                            <Separator />
                            <Accordion type="single" collapsible >
                                {rootCategories.map(([key, category]) => {
                                    const hasChildren = Object.values(categories).some((c: any) => c.parentCategoryId === category.id);
                                    if (hasChildren) {
                                        return (
                                            <AccordionItem value={category.categoryName} className="text-white border-none" key={key}>
                                                <AccordionTrigger className="flex items-center justify-between text-white hover:no-underline p-2 rounded-md cursor-pointer hover:bg-gray-700" >
                                                    <span className="text-lg font-semibold" onClick={() => navigate(`/category?id=${category.id}&name=${category.categoryName}`)}>{(category.categoryName)}</span>
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    {renderSubcategories(category.id)}
                                                </AccordionContent>
                                            </AccordionItem>
                                        );
                                    } else {
                                        return (
                                            <h1
                                                key={key}
                                                className="text-lg font-semibold text-white p-2 rounded-md cursor-pointer hover:bg-gray-700"
                                                onClick={() => navigate(`/category?id=${category.id}&name=${category.categoryName}`)}
                                            >
                                                {(category.categoryName)}
                                            </h1>
                                        );
                                    }
                                })}
                            </Accordion>
                        </SheetHeader>
                    </SheetContent>
                </Sheet>
                <div className="hidden xl:flex gap-2">
                    {rootCategories.map(([key, category]) => (
                        <button
                            key={key}
                            className="text-gray-300 cursor-pointer hover:text-white transition-all duration-300 bg-transparent border-none focus:outline-none"
                            type="button" 
                            onClick={() => navigate(`/category?id=${key}&name=${category.categoryName}`)}
                        >
                            {(category.categoryName)}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
