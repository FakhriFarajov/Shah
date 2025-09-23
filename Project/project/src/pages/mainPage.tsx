import NavBar from "@/components/custom/Navbar/navbar";
import Carousel from "@/components/custom/carousel";
import Footer from "@/components/custom/footer"
import { Label } from "@/components/ui/label";
import ProductCard from "@/components/custom/itemCard";
import { generateSampleProducts } from "@/components/custom/generateSampleProducts";
import "../i18n"; // Import i18n configuration
import { useTranslation } from "react-i18next";
import Grid from "@/components/custom/ProductGrid";



// Type for subcategory filter

const slides = [
    "https://aimg.kwcdn.com/material-put/2079f6251c/cc20ce65-db4a-4d92-aeee-37122020bca6.png?imageView2/q/70/format/webp",
    "https://ir.ozone.ru/s3/cms/fb/ta5/wc1450/en-tur_desktop_2832x600_1.jpg",
    "https://ir.ozone.ru/s3/cms/c4/t38/wc1450/azengchina.jpg",
    "https://ir.ozone.ru/s3/cms/14/ta8/wc1450/2832x600.jpg"


]


export default function Main() {
    const { t } = useTranslation();

    // For demo, generate a grid of products (replace with real data as needed)
    const products = generateSampleProducts(20);

    return (
        <>
            <NavBar />
            <div className="min-h-screen w-full bg-gray-100">
                <div className="w-full max-w-7xl mx-auto p-2 sm:p-4">
                    <Carousel slides={slides} size={250} />
                </div>
                <div className="w-full max-w-7xl mx-auto p-2 sm:p-4">
                    <Label className="text-2xl sm:text-4xl font-semibold mb-4 block text-center">{t('Featured Products')}</Label>
                    <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
                        {products.map((product: any) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                    <div className="flex flex-col items-center justify-center w-full p-2 sm:p-6 mt-4 sm:mt-6">
                        <Label className="text-2xl sm:text-4xl text-center font-semibold mb-4">{t('Explore More')}</Label>
                    </div>

                    <div className="flex flex-col items-center justify-center w-full p-2 sm:p-6 mt-4 sm:mt-6">
                        <div className="w-full max-w-full">
                            <Grid />
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}