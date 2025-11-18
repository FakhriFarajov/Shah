import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import NavBar from '@/components/custom/Navbar/navbar';
import Footer from '@/components/custom/footer';
import ProductCard from '@/components/custom/itemCard';
import { useTranslation } from 'react-i18next';
import { CircleAlert } from 'lucide-react';
import { Funnel } from 'lucide-react';
import { decodeUserFromToken } from '@/shared/utils/decodeToken';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu';
import { getFilteredProducts } from '@/features/profile/product/profile.service';
import { getProfileImage } from '@/shared/utils/imagePost';
import FilterSidebar from '@/components/custom/FilterSidebar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { getCategoryAttributesAndValues } from '@/features/profile/Category/category.service';
import { Button } from '@/components/ui/button';
import { tokenStorage } from '@/shared';
import { toast } from 'sonner';
import { apiCallWithManualRefresh } from '@/shared/apiWithManualRefresh';
import { DropdownMenu } from '@radix-ui/react-dropdown-menu';
import Spinner from '@/components/custom/Spinner';

export default function CategoryPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const categoryIdUrl = searchParams.get("id");
  const categoryNameUrl = searchParams.get("name");
  const { t } = useTranslation();
  const [sortOpen, setSortOpen] = useState<boolean>(false);

  const [buyerId, setBuyerId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const tok = tokenStorage.get();
    if (tok) {
      const result = decodeUserFromToken(tok as string);
      setBuyerId(result?.buyer_profile_id ?? null);
    } else {
      toast.error("You are not logged in123");
      setBuyerId(null);
    }
    setLoading(false);
  }, []);

  const [products, setProducts] = useState<any[]>([]);
  const [sort, setSort] = useState<string | null>(null);
  const [pageSize] = useState<number>(20);
  const [totalItems, setTotalItems] = useState<number>(0);

  const [filtersOpen, setFiltersOpen] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState(1);

  const category = { name: t("Unknown Category") };

  const [filters, setFilters] = useState<any>(null);
  useEffect(() => {
    setLoading(true);
    const load = async () => {
      setLoading(true);
      try {
        const fetched = await apiCallWithManualRefresh(() => getCategoryAttributesAndValues(categoryIdUrl || ""));
        console.log("Fetched category filters:", fetched);
        setFilters(fetched);
        console.log(fetched, filters);
      } catch (e) {
        console.error('Fetch failed', e);
      } finally {
        setLoading(false);
      }
    };
    setLoading(false);
    load();
  }, [categoryIdUrl]);

  const [activeFilters, setActiveFilters] = useState<{ minPrice?: number; maxPrice?: number; filters?: string[] } | null>(null);

  const handleApply = async (payload: { minPrice?: number; maxPrice?: number; filters?: string[] }) => {
    const tok = tokenStorage.get() || '';
    const result = decodeUserFromToken(tok);
    try {
      setLoading(true);
      const request = {
        categoryId: categoryIdUrl,
        page: 1,
        pageSize,
        minPrice: payload.minPrice ?? 0,
        maxPrice: payload.maxPrice ?? 99999,
        valueIds: payload.filters ?? [],
        userId: result?.id ?? null,
      };
      setActiveFilters(payload);
      console.log("Filter products request:", request);
      const res = await apiCallWithManualRefresh(() => getFilteredProducts(request as any));
      // API may return a shaped response { data: items, total: number }
      const items = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
            ? res.data.data
            : (res?.data?.data || []);
      const total = res?.data?.total ?? res?.total ?? items.length;
      setTotalItems(total ?? items.length);


      if (Array.isArray(items) && items.length > 0) {
        await Promise.all(
          items.map(async (element: any) => {
            try {
              if (element.mainImage) {
                const url = await getProfileImage(element.mainImage);
                element.mainImage = url || "https://picsum.photos/seed/product1/400/400";
              } else if (element.mainImage) {
                element.mainImage = element.mainImage;
              } else {
                element.mainImage = "https://picsum.photos/seed/product1/400/400";
              }
            } catch (error) {
              console.warn("Error resolving product image:", error);
              element.mainImage = null;
            }
          })
        );
      }
      setProducts(sort ? sortProducts(items, sort) : items);
      setCurrentPage(1);
    } catch (e) {
      console.error('Apply filter failed', e);
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const tok = tokenStorage.get();
      const result = decodeUserFromToken(tok);
      try {
        const request: any = { categoryId: categoryIdUrl, page: currentPage, pageSize, userId: result?.id ?? null };
        console.log("CategoryPage - Fetching products with request:", request);
        const fetched = await apiCallWithManualRefresh(() => getFilteredProducts(request));

        const items = Array.isArray(fetched)
          ? fetched
          : Array.isArray(fetched?.data)
            ? fetched.data
            : Array.isArray(fetched?.data?.data)
              ? fetched.data.data
              : [];
        const total = fetched?.data?.total ?? fetched?.total ?? items.length;
        setTotalItems(total ?? items.length);
        // Resolve images in parallel and attach `mainImageUrl` (or placeholder)
        if (Array.isArray(items) && items.length > 0) {
          await Promise.all(
            items.map(async (element: any) => {
              try {
                if (element.mainImage) {
                  const url = await getProfileImage(element.mainImage);
                  element.mainImage = url || "https://picsum.photos/seed/product1/400/400";
                } else if (element.mainImage) {
                  element.mainImage = element.mainImage;
                } else {
                  element.mainImage = "https://picsum.photos/seed/product1/400/400";
                }
              } catch (error) {
                console.warn("Error resolving product image:", error);
                element.mainImage = null;
              }
            })
          );
        }
        setProducts(prev => {
          const all = currentPage > 1 ? [...prev, ...items] : items;
          return sort ? sortProducts(all, sort) : all;
        });
      } catch (e) {
        console.error('Fetch failed', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentPage, pageSize, categoryIdUrl, sort]);

  // Helper to sort products array based on selected sort key
  const sortProducts = (items: any[], key: string) => {
    const copy = [...items];
    switch (key) {
      case 'price-asc':
        return copy.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      case 'price-desc':
        return copy.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      case 'name-asc':
        return copy.sort((a, b) => (a.productTitle || '').localeCompare(b.productTitle || ''));
      case 'name-desc':
        return copy.sort((a, b) => (b.productTitle || '').localeCompare(a.productTitle || ''));
      default:
        return copy;
    }
  };


  const totalPages = Math.max(1, Math.ceil((totalItems || products.length) / pageSize));

  // price range defaults
  const initialMin = 0;
  const initialMax = 9999;

  return (
    <>
      {
        loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16">
              <Spinner />
            </div>
          </div>
        )
      }
      <NavBar />
      <div className="p-8 gap-6 flex justify-center">
        <section className="col-span-12 lg:col-span-9 w-full max-w-7xl">
          <div className="mb-6 flex flex-col lg:flex-row md:items-center md:justify-between">
            <h1 className="text-3xl font-bold mb-6 text-left">{t(categoryNameUrl)}</h1>
            <div className='flex flex-row justify-start md:items-center xl:justify-between'>
              <div className='flex justify-end mr-4 mb-4 flex xl:hidden'>
                <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline">
                      <Funnel />
                      {t('Filters')}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 max-w-[90vw] overflow-auto">
                    <SheetHeader>
                      <SheetTitle>{t('Filters')}</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4">
                      <FilterSidebar
                        initialMin={initialMin}
                        initialMax={initialMax}
                        filters={filters}
                        onApply={async (payload) => {
                          await handleApply(payload);
                          setFiltersOpen(false);
                        }}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
              <div className='flex justify-end  mb-4 ml-0 mr-4 flex xl:hidden'>
                <DropdownMenu open={sortOpen} onOpenChange={setSortOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Funnel />
                      {t('Sort by')}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <select
                      className="border rounded p-2"
                      value={sort ?? ''}
                      onChange={(e) => setSort(e.target.value || null)}
                    >
                      <option value="price-asc">{t('Price: Low to High')}</option>
                      <option value="price-desc">{t('Price: High to Low')}</option>
                      <option value="name-asc">{t('Name: A-Z')}</option>
                      <option value="name-desc">{t('Name: Z-A')}</option>
                    </select>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-2 mb-4 hidden xl:flex">
                <label className="font-medium">{t('Sort by')}:</label>
                <select
                  className="border rounded p-2"
                  value={sort ?? ''}
                  onChange={(e) => setSort(e.target.value || null)}
                >
                  <option value="price-asc">{t('Price: Low to High')}</option>
                  <option value="price-desc">{t('Price: High to Low')}</option>
                  <option value="name-asc">{t('Name: A-Z')}</option>
                  <option value="name-desc">{t('Name: Z-A')}</option>
                </select>
              </div>
            </div>
          </div>


          {products.length > 0 ? (
            <div className='flex gap-6'>
              <div className='col-span-1 sticky top-20 self-start hidden xl:flex'>
                <FilterSidebar
                  initialMin={initialMin}
                  initialMax={initialMax}
                  filters={filters}
                  onApply={handleApply}
                />
              </div>
              <div className="w-full max-w-7xl p-2 sm:p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {loading ? (
                    <div className="col-span-full text-center p-8">{t('Loading...')}</div>
                  ) : (
                    products.map((product: any) => {
                      product.buyerId = buyerId;
                      console.log("Rendering ProductCard for product in CategoryPage:", product);
                      return (
                        <ProductCard product={product} />
                      )
                    })
                  )}
                </div>
                <Pagination className="mt-6">
                  <PaginationContent>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    >
                      {t('Previous')}
                    </PaginationPrevious>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <PaginationItem key={i + 1} onClick={() => setCurrentPage(i + 1)}>
                        <PaginationLink isActive={currentPage === i + 1}>{i + 1}</PaginationLink>
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
            </div>
          ) : (
            <div className='flex gap-6 h-[550px]'>
              <div className='col-span-1 sticky top-20 self-start hidden xl:flex'>
                <FilterSidebar
                  initialMin={initialMin}
                  initialMax={initialMax}
                  filters={filters}
                  onApply={handleApply}
                />
              </div>
              <div className="w-full max-w-7xl mx-auto p-2 sm:p-4">
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                  <div className='flex justify-center  items-center flex-col w-full col-span-3'>
                    <CircleAlert className='text-red-500 mb-12' size={160} />
                    <div className='text-xl'>
                      {t('No products found!')}
                    </div>
                    <div className='mt-5'>
                      {t('To view other products go to main page')}
                    </div>
                    <Button className='mt-10'>
                      Go to main page
                    </Button>

                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
      <Footer></Footer>
    </>
  );
}