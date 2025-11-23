import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'

type FilterValues = {
    minPrice: number
    maxPrice: number
    filters: any[]
}

export default function FilterSidebar({
    initialMin = 0,
    initialMax = 9999,
    filters = [],
    onApply,
}: {
    initialMin?: number
    initialMax?: number
    filters?: any[]
    onApply?: (filters: Partial<FilterValues>) => void
}) {
    const [value, setValue] = useState<[number, number]>([initialMin, initialMax])
    const [minInput, setMinInput] = useState<number>(initialMin)
    const [maxInput, setMaxInput] = useState<number>(initialMax)

    const [values, setValues] = useState<Record<string, boolean>>({});
    const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});

    // Use the incoming `filters` prop directly so the sidebar updates when parent changes category
    const attributesAndValues: any[] = filters ?? [];

    const apply = () => {
        const selected = Object.entries(values).filter(([_k, v]) => v).map(([key]) => key);
        const payload = { minPrice: minInput, maxPrice: maxInput, filters: selected };
        onApply?.(payload as Partial<FilterValues>);
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm" style={{ maxHeight: '57vh', overflowY: 'auto' }}>
            <div className="mb-12">
                <h3 className="text-lg font-semibold mb-3">Price</h3>
                <div className="flex gap-3 mb-3">
                    <Input value={minInput} onChange={(e: any) => setMinInput(Number(e.target.value))} className="w-1/2" />
                    <Input value={maxInput} onChange={(e: any) => setMaxInput(Number(e.target.value))} className="w-1/2" />
                </div>
                <Slider value={value} onValueChange={(v: number[]) => { setValue([v[0], v[1]]); setMinInput(v[0]); setMaxInput(v[1]); }} min={initialMin} max={initialMax} />
            </div>

            <div className="mb-6">
                {attributesAndValues.map((attr: any) => (
                    <div key={attr.id ?? attr.name} className="mb-6">
                        <h3 className="text-lg font-semibold mb-3">{attr.name ?? attr.attributeName}</h3>
                        <div className="mb-3">
                            <Input
                                placeholder="Search ..."
                                value={searchTerms[String(attr.id ?? attr.name)] ?? ''}
                                onChange={(e) => setSearchTerms(prev => ({ ...prev, [String(attr.id ?? attr.name)]: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            {(() => {
                                const allVals: any[] = attr.values ?? [];
                                const term = (searchTerms[String(attr.id ?? attr.name)] ?? '').trim().toLowerCase();
                                const filtered = term
                                    ? allVals.filter((v: any) => String(v.value ?? '').toLowerCase().includes(term))
                                    : allVals;
                                const first = filtered.slice(0, 5);
                                const rest = filtered.slice(5);

                                return (
                                    <>
                                        {filtered.length === 0 && (
                                            <div className="text-sm text-gray-500">No matches</div>
                                        )}
                                        {first.map((v: any) => (
                                            <label key={v.id ?? v.value} className="flex items-center gap-2">
                                                <Checkbox checked={!!values[v.id ?? v.value]} onCheckedChange={(checked: any) => setValues(prev => ({ ...prev, [v.id ?? v.value]: !!checked }))} />
                                                <span>{v.value} <span className="text-sm text-gray-500"></span></span>
                                            </label>
                                        ))}

                                        {rest.length > 0 && (
                                            <Accordion type="single" collapsible>
                                                <AccordionItem value={`more-${attr.id ?? attr.name}`}>
                                                    <AccordionTrigger>More</AccordionTrigger>
                                                    <AccordionContent>
                                                        <div className="space-y-2">
                                                            {rest.map((v: any) => (
                                                                <label key={v.id ?? v.value} className="flex items-center gap-2">
                                                                    <Checkbox checked={!!values[v.id ?? v.value]} onCheckedChange={(checked: any) => setValues(prev => ({ ...prev, [v.id ?? v.value]: !!checked }))} />
                                                                    <span>{v.value} <span className="text-sm text-gray-500">(1)</span></span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            </Accordion>
                                        )}
                                    </>
                                )
                            })()}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4">
                <Button onClick={apply} className="w-full">Search</Button>
            </div>
        </div>
    )

}
