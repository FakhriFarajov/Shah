import { useParams, useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getTranslatedCategories } from '@/components/custom/Navbar/getTranslatedCategories';
import NavBar from '@/components/custom/Navbar/navbar';
import ProductCard from '@/components/custom/itemCard';
import { useTranslation } from 'react-i18next';
import CategoryFilters from '@/components/custom/CategoryFilters';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Filter } from "lucide-react"; // Optional: for filter icon

export default function CategoryPage() {
  const { t } = useTranslation();
  // Use translation keys in getTranslatedCategories!
  const categories = getTranslatedCategories((x: string) => x);
  const { category: categoryId, subcategory: subcategoryId } = useParams();
  const navigate = useNavigate();
  const allProducts = useSelector((state: any) => state.product);
  const category = categoryId ? (categories as Record<string, typeof categories[keyof typeof categories]>)[categoryId] : undefined;
  const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: string[] }>({});
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  const [pendingSelectedFilters, setPendingSelectedFilters] = useState<{ [key: string]: string[] }>({});
  const [pendingPriceRange, setPendingPriceRange] = useState({ min: '', max: '' });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name-asc' | 'name-desc'>('price-asc');
  // Add state to control Sheet open/close
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);


  const selectedSubcategory = subcategoryId ?? null;



  const filteredProducts = useMemo(() => {
    if (!category) return [];
    return allProducts.filter((product: any) => {
      if (product.categoryId !== category.id) return false;
      if (selectedSubcategory && String(product.subcategoryId) !== selectedSubcategory) return false;
      // Price filter
      const price = product.price;
      if (priceRange.min && price < Number(priceRange.min)) return false;
      if (priceRange.max && price > Number(priceRange.max)) return false;
      return Object.entries(selectedFilters).every(([filterId, values]: [string, any[]]) => {
        if (!values.length) return true;
        return values.includes(String(product[filterId]));
      });
    });
  }, [allProducts, selectedFilters, category, selectedSubcategory, priceRange]);

  const allFilters = useMemo(() => {
    if (!category) return [];
    const filtersMap: Record<string, any> = {};
    const subcats = selectedSubcategory
      ? category.subcategories.filter((subcat: any) => String(subcat.id) === selectedSubcategory)
      : category.subcategories;
    subcats.forEach((subcat: any) => {
      subcat.filters.forEach((filter: any) => {
        if (!filtersMap[filter.id]) {
          filtersMap[filter.id] = {
            id: filter.id,
            name: filter.name,
            options: new Set(filter.options),
          };
        } else {
          filter.options.forEach((opt: any) => filtersMap[filter.id].options.add(opt));
        }
      });
    });
    return Object.values(filtersMap).map((f: any) => ({
      id: f.id,
      name: f.name,
      options: Array.from(f.options),
    }));
  }, [category, selectedSubcategory]);

  useEffect(() => {
    if (!categoryId) return;
    setSelectedFilters({});
    setPriceRange({ min: '', max: '' });
  }, [categoryId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilters, priceRange, categoryId, selectedSubcategory]);

  // Sort filtered products before pagination
  const sortedProducts = useMemo(() => {
    const products = [...filteredProducts];
    switch (sortBy) {
      case 'price-asc':
        return products.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return products.sort((a, b) => b.price - a.price);
      case 'name-asc':
        return products.sort((a, b) => t(a.name).localeCompare(t(b.name)));
      case 'name-desc':
        return products.sort((a, b) => t(b.name).localeCompare(t(a.name)));
      default:
        return products;
    }
  }, [filteredProducts, sortBy, t]);

  const paginatedProducts = sortedProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(filteredProducts.length / pageSize);

  // When opening the Sheet, copy applied filters to pending
  useEffect(() => {
    if (filterSheetOpen) {
      setPendingSelectedFilters(selectedFilters);
      setPendingPriceRange(priceRange);
    }
  }, [filterSheetOpen]);

  if (!category) return <div className="p-8">{t('Category not found')}</div>;

  return (
    <>
      <NavBar />
      <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">

        <section className="col-span-12 mb-4">
          <h1 className="text-3xl font-bold mb-6 text-left">{t(category.name)}</h1>
        </section>
        <div className="lg:hidden mb-4">
          <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
            <SheetTrigger asChild>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded shadow"
                onClick={() => setFilterSheetOpen(true)}
              >
                <Filter className="w-4 h-4" />
                {t("Filters")}
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px] p-6">
              <CategoryFilters
                allFilters={allFilters.map(f => ({
                  ...f,
                  name: t(f.name),
                  options: f.options.map((opt: string) => t(opt)),
                }))}
                selectedFilters={pendingSelectedFilters}
                setSelectedFilters={setPendingSelectedFilters}
                priceRange={pendingPriceRange}
                setPriceRange={setPendingPriceRange}
                t={t}
              />
              <button
                className="mt-4 w-full bg-primary text-white rounded py-2"
                onClick={() => {
                  setSelectedFilters(pendingSelectedFilters);
                  setPriceRange(pendingPriceRange);
                  setFilterSheetOpen(false);
                }}
              >
                {t("Apply Filters")}
              </button>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop: Filters always visible */}
        <aside className="hidden lg:block col-span-3">
          <CategoryFilters
            allFilters={allFilters.map(f => ({
              ...f,
              name: t(f.name),
              options: f.options.map((opt: string) => t(opt)),
            }))}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            t={t}
          />
        </aside>

        <section className="col-span-12 lg:col-span-9">
          {/* Sorting dropdown */}
          <div className="flex items-center gap-2 mb-4">
            <label className="font-medium">{t('Sort by')}:</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="border rounded p-2"
            >
              <option value="price-asc">{t('Price: Low to High')}</option>
              <option value="price-desc">{t('Price: High to Low')}</option>
              <option value="name-asc">{t('Name: A-Z')}</option>
              <option value="name-desc">{t('Name: Z-A')}</option>
            </select>
          </div>
          {paginatedProducts.length > 0 ? (
            <>
              <div className='flex flex-wrap flex-col justify-center w-full p-6 bg-white rounded-lg shadow-md mt-6'>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {paginatedProducts.map((product: any) => (
                    <ProductCard key={product.id} product={{
                      ...product,
                      name: t(product.name),
                      description: t(product.description),
                      category: t(product.category),
                      brand: t(product.brand),
                      currency: t(product.currency)
                    }} />
                  ))}
                </div>

                <Pagination className="mt-6">
                  <PaginationContent>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    >
                      {t('Previous')}
                    </PaginationPrevious>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <PaginationItem key={i + 1} onClick={() => setCurrentPage(i + 1)} active={currentPage === i + 1}>
                        <PaginationLink>{i + 1}</PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationEllipsis />
                    <PaginationNext
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    >
                      {t('Next')}
                    </PaginationNext>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500">{t('no_products_found')}</p>
          )}
        </section>
      </div>
    </>
  );
}