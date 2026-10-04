import { Loader2, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface DestinationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
}

interface DestinationSuggestion {
  label: string;
  secondary: string;
}

interface GeoapifyFeature {
  properties?: {
    formatted?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    country?: string;
  };
}

const NEXT_PUBLIC_GEOAPIFY_KEY = import.meta.env.NEXT_PUBLIC_GEOAPIFY_KEY as string | undefined;

export function DestinationAutocomplete({ value, onChange }: DestinationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<DestinationSuggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const query = value.trim();
    if (!NEXT_PUBLIC_GEOAPIFY_KEY || query.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          text: query,
          apiKey: NEXT_PUBLIC_GEOAPIFY_KEY,
          limit: "5",
        });
        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?${params.toString()}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error(`Geoapify request failed (${response.status})`);
        const data = (await response.json()) as { features?: GeoapifyFeature[] };
        const next = (data.features ?? []).flatMap((feature) => {
          const properties = feature.properties;
          const label = properties?.formatted?.trim() || properties?.address_line1?.trim();
          if (!label || !properties) return [];
          return [
            {
              label,
              secondary:
                properties.address_line2?.trim() ||
                [properties.city, properties.country].filter(Boolean).join(", "),
            },
          ];
        });
        setSuggestions(next);
        setActiveIndex(-1);
        setOpen(next.length > 0);
      } catch (reason) {
        if (!(reason instanceof DOMException && reason.name === "AbortError")) {
          console.warn("[VoyaLoom][Geoapify] destination suggestions unavailable", reason);
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 280);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [value]);

  function chooseSuggestion(suggestion: DestinationSuggestion) {
    onChange(suggestion.label);
    setOpen(false);
    setSuggestions([]);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      chooseSuggestion(suggestions[activeIndex]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <label className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-luxury text-sand/60">
        <MapPin className="size-4 text-gold" /> Destination
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          placeholder="Positano, Italy"
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onBlur={() => {
            blurTimeout.current = setTimeout(() => setOpen(false), 150);
          }}
          onKeyDown={handleKeyDown}
          className="w-full bg-midnight/50 border border-white/10 px-4 py-3 pr-10 text-sm text-sand placeholder:text-sand/30 transition-colors focus:border-gold focus:outline-none [color-scheme:dark]"
        />
        {loading && <Loader2 className="absolute right-3 top-3.5 size-4 animate-spin text-gold" />}
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden border border-white/10 bg-charcoal shadow-cinematic">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.label}-${index}`}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => chooseSuggestion(suggestion)}
              className={`flex w-full items-start gap-3 border-b border-white/5 px-4 py-3 text-left last:border-0 ${index === activeIndex ? "bg-gold/10 text-gold" : "text-sand/80 hover:bg-white/5 hover:text-gold"}`}
            >
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-gold" />
              <span className="min-w-0">
                <span className="block truncate text-sm">{suggestion.label}</span>
                {suggestion.secondary && (
                  <span className="mt-1 block truncate text-[10px] text-sand/40">
                    {suggestion.secondary}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
