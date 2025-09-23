import React from "react";

export default function CategoryFilters({
  allFilters,
  selectedFilters,
  setSelectedFilters,
  priceRange,
  setPriceRange,
  t,
}: {
  allFilters: any[];
  selectedFilters: { [key: string]: string[] };
  setSelectedFilters: (filters: { [key: string]: string[] }) => void;
  priceRange: { min: string; max: string };
  setPriceRange: (range: { min: string; max: string }) => void;
  t: (key: string) => string;
}) {
  return (
    <aside className="col-span-3 bg-white rounded-md shadow p-4 sticky top-4 h-fit max-h-[80vh] overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">{t('Filters')}</h2>
      <button
        className="mb-4 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
        onClick={() => {
          setSelectedFilters({});
          setPriceRange({ min: '', max: '' });
        }}
      >
        {t('Uncheck All')}
      </button>
      {/* Price filter UI */}
      <div className="mb-4">
        <h3 className="font-medium mb-2">{t('Price')}</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder={t('Min')}
            className="border rounded px-2 py-1 w-20"
            value={priceRange.min}
            min={0}
            onChange={e => setPriceRange(r => ({ ...r, min: e.target.value }))}
          />
          <span>-</span>
          <input
            type="number"
            placeholder={t('Max')}
            className="border rounded px-2 py-1 w-20"
            value={priceRange.max}
            min={0}
            onChange={e => setPriceRange(r => ({ ...r, max: e.target.value }))}
          />
        </div>
      </div>
      {allFilters.map((filter: any) => (
        <div key={filter.id} className="mb-4">
          <h3 className="font-medium mb-2">{t(filter.name)}</h3>
          <div className="space-y-1">
            {filter.options.map((option: string) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedFilters[filter.id]?.includes(option) || false}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSelectedFilters((prev: Record<string, any[]>) => {
                      const current = prev[filter.id] || [];
                      return {
                        ...prev,
                        [filter.id]: checked
                          ? [...current, option]
                          : current.filter((v: string) => v !== option),
                      };
                    });
                  }}
                  className="form-checkbox accent-blue-600"
                />
                <span>{t(option)}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
}