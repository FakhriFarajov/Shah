import { useState, useEffect, useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'





interface ImageCarouselProps {
  slides: string[];
  size?: number;
}

export default function ImageCarousel({ slides, size = 90 }: ImageCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
  )

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const onSelect = useCallback((embla:any) => {
    setSelectedIndex(embla.selectedScrollSnap())
  }, [])

  useEffect(() => {
    if (!emblaApi) return

    setScrollSnaps(emblaApi.scrollSnapList())
    emblaApi.on('select', () => onSelect(emblaApi))
    onSelect(emblaApi)
  }, [emblaApi, onSelect])

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  )

  return (
    <div className="relative overflow-hidden w-full" ref={emblaRef}>
      <div className="flex">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`flex-shrink-0 w-full`} style={{ height: `${size}px`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            <img src={slide} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>


      <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-4">
        <button
          onClick={() => emblaApi?.scrollPrev()}
          aria-label="Scroll to previous item"
          className="bg-white/80 text-gray-700 px-3 py-2 rounded-full shadow hover:bg-white transition"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M12.293 16.293a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L8.414 10l3.879 3.879a1 1 0 010 1.414z" />
          </svg>
        </button>

        <button
          onClick={() => emblaApi?.scrollNext()}
          aria-label="Scroll to next item"
          className="bg-white/80 text-gray-700 px-3 py-2 rounded-full shadow hover:bg-white transition"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7.707 16.293a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L11.586 10l-3.879 3.879a1 1 0 000 1.414z" />
          </svg>
        </button>
      </div>



      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex space-x-2">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-3 h-3 rounded-full ${index === selectedIndex ? 'bg-white' : 'bg-white/50'
              } transition`}
          />
        ))}
      </div>
    </div>
  )
}
