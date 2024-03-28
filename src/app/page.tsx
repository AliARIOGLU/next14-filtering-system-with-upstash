"use client";

import { useState, useCallback } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Filter } from "lucide-react";
import { QueryResult } from "@upstash/vector";
import debounce from "lodash.debounce";

import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

import { Slider } from "@/components/ui/slider";

import { Product } from "@/db";
import { ProductItem } from "@/components/products/product-item";
import { ProductItemSkeleton } from "@/components/products/product-item-skeleton";

import { ProductState } from "@/lib/validators/product-validator";
import { EmptyState } from "@/components/products/empty-state";

const SORT_OPTIONS = [
  { name: "None", value: "none" },
  { name: "Price: Low to High", value: "price-asc" },
  { name: "Price: High to Low", value: "price-desc" },
] as const;

const COLOR_FILTERS = {
  id: "color",
  name: "Color",
  options: [
    { value: "white", label: "White" },
    { value: "beige", label: "Beige" },
    { value: "blue", label: "Blue" },
    { value: "green", label: "Green" },
    { value: "purple", label: "Purple" },
  ] as const,
};

const SIZE_FILTERS = {
  id: "size",
  name: "Size",
  options: [
    { value: "S", label: "Small" },
    { value: "M", label: "Medium" },
    { value: "L", label: "Large" },
  ],
} as const;

const PRICE_FILTERS = {
  id: "price",
  name: "Price",
  options: [
    { value: [0, 100], label: "Any price" },
    { value: [0, 40], label: "Under 40€" },
    { value: [0, 20], label: "Under 20€" },
    // custom option defined in JSX
  ],
} as const;

const SUBCATEGORIES = [
  { name: "T-Shirts", selected: true, href: "#" },
  { name: "Hoodies", selected: false, href: "#" },
  { name: "Sweatshirts", selected: false, href: "#" },
  { name: "Accessories", selected: false, href: "#" },
] as const;

const DEFAULT_CUSTOM_PRICE = [0, 100] as [number, number];

export default function Home() {
  const [filter, setFilter] = useState<ProductState>({
    color: ["beige", "blue", "green", "purple", "white"],
    price: { isCustom: false, range: DEFAULT_CUSTOM_PRICE },
    size: ["S", "M", "L"],
    sort: "none",
  });

  const {
    data: products,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await axios.post<QueryResult<Product>[]>(
        "http://localhost:3000/api/products",
        {
          filter: {
            sort: filter.sort,
            color: filter.color,
            price: filter.price.range,
            size: filter.size,
          },
        }
      );

      return data;
    },
  });

  const onSubmit = () => refetch();

  const debouncedSubmit = debounce(onSubmit, 400);
  const _debouncedSubmit = useCallback(debouncedSubmit, []);

  const applyArrayFilter = ({
    category,
    value,
  }: {
    category: keyof Omit<typeof filter, "price" | "sort">;
    value: string;
  }) => {
    const isFilterApplied = filter[category].includes(value as never);
    if (isFilterApplied) {
      setFilter((prev) => ({
        ...prev,
        [category]: prev[category].filter((v) => v !== value),
      }));
    } else {
      setFilter((prev) => ({
        ...prev,
        [category]: [...prev[category], value],
      }));
    }

    _debouncedSubmit();
  };

  const minPrice = Math.min(filter.price.range[0], filter.price.range[1]);
  const maxPrice = Math.max(filter.price.range[0], filter.price.range[1]);

  console.log(filter);
  console.log("data", products);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex items-baseline justify-between border-b border-gray-200 pb-6 pt-20">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          High-quality cotton selection
        </h1>

        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
              Sort
              <ChevronDown className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.name}
                  onClick={() => {
                    setFilter((prev) => ({ ...prev, sort: option.value }));

                    _debouncedSubmit();
                  }}
                  className={cn(
                    "text-left text-gray-500 w-full block px-4 py-2 text-sm",
                    {
                      "text-gray-900 bg-gray-100": option.value === filter.sort,
                    }
                  )}
                >
                  {option.name}
                </button>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button className="-m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden">
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>

      <section className="pb-24 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-8 gap-y-10">
          {/* Filters */}
          <div className="hidden lg:block">
            <ul className="space-y-4 border-b border-gray-200 pb-6 text-sm font-medium text-gray-900">
              {SUBCATEGORIES.map((category) => (
                <li key={category.name}>
                  <button
                    disabled={!category.selected}
                    className="disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>

            <Accordion type="multiple" className="animate-none">
              {/* Color filter */}
              <AccordionItem value="color">
                <AccordionTrigger className="py-3 text-sm text-gray-400 hover:text-gray-500">
                  <span className="font-medium text-gray-900">Color</span>
                </AccordionTrigger>
                <AccordionContent className="pt-6 animate-none">
                  <ul className="space-y-4">
                    {COLOR_FILTERS.options.map((color, idx) => (
                      <li key={color.value} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`color-${idx}`}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={filter.color.includes(color.value)}
                          onChange={() =>
                            applyArrayFilter({
                              category: "color",
                              value: color.value,
                            })
                          }
                        />
                        <label
                          htmlFor={`color-${idx}`}
                          className="ml-3 text-sm text-gray-600"
                        >
                          {color.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* Size filter */}
              <AccordionItem value="size">
                <AccordionTrigger className="py-3 text-sm text-gray-400 hover:text-gray-500">
                  <span className="font-medium text-gray-900">Size</span>
                </AccordionTrigger>
                <AccordionContent className="pt-6 animate-none">
                  <ul className="space-y-4">
                    {SIZE_FILTERS.options.map((size, idx) => (
                      <li key={size.value} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`size-${idx}`}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={filter.size.includes(size.value)}
                          onChange={() =>
                            applyArrayFilter({
                              category: "size",
                              value: size.value,
                            })
                          }
                        />
                        <label
                          htmlFor={`size-${idx}`}
                          className="ml-3 text-sm text-gray-600"
                        >
                          {size.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* Price filter */}
              <AccordionItem value="price">
                <AccordionTrigger className="py-3 text-sm text-gray-400 hover:text-gray-500">
                  <span className="font-medium text-gray-900">Price</span>
                </AccordionTrigger>
                <AccordionContent className="pt-6 animate-none">
                  <ul className="space-y-4">
                    {PRICE_FILTERS.options.map((price, idx) => (
                      <li key={price.label} className="flex items-center">
                        <input
                          type="radio"
                          id={`price-${idx}`}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={
                            // custom price seçiliyken bunların check olmaması için
                            !filter.price.isCustom &&
                            filter.price.range[0] === price.value[0] &&
                            filter.price.range[1] === price.value[1]
                          }
                          onChange={() => {
                            setFilter((prev) => ({
                              ...prev,
                              price: {
                                isCustom: false,
                                range: [...price.value],
                              },
                            }));

                            _debouncedSubmit();
                          }}
                        />
                        <label
                          htmlFor={`price-${idx}`}
                          className="ml-3 text-sm text-gray-600"
                        >
                          {price.label}
                        </label>
                      </li>
                    ))}
                    {/* Slider for custom price filter */}
                    <li className="flex justify-center flex-col gap-2">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id={`price-${PRICE_FILTERS.options.length}`}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={filter.price.isCustom}
                          onChange={() => {
                            setFilter((prev) => ({
                              ...prev,
                              price: {
                                isCustom: true,
                                range: [0, 100],
                              },
                            }));

                            _debouncedSubmit();
                          }}
                        />
                        <label
                          htmlFor={`price-${PRICE_FILTERS.options.length}`}
                          className="ml-3 text-sm text-gray-600"
                        >
                          Custom
                        </label>
                      </div>

                      <div className="flex justify-between">
                        <p className="font-medium">Price</p>
                        <div>
                          {filter.price.isCustom
                            ? minPrice.toFixed(0)
                            : filter.price.range[0].toFixed(0)}{" "}
                          €-{" "}
                          {filter.price.isCustom
                            ? maxPrice.toFixed(0)
                            : filter.price.range[1].toFixed(0)}{" "}
                          €
                        </div>
                      </div>

                      <Slider
                        value={
                          filter.price.isCustom
                            ? filter.price.range
                            : DEFAULT_CUSTOM_PRICE
                        }
                        min={DEFAULT_CUSTOM_PRICE[0]}
                        max={DEFAULT_CUSTOM_PRICE[1]}
                        defaultValue={DEFAULT_CUSTOM_PRICE}
                        step={5}
                        onValueChange={(range) => {
                          const [newMin, newMax] = range;

                          setFilter((prev) => ({
                            ...prev,
                            price: { isCustom: true, range: [newMin, newMax] },
                          }));

                          _debouncedSubmit();
                        }}
                        className={cn({
                          "opacity-50": !filter.price.isCustom,
                        })}
                        disabled={!filter.price.isCustom}
                      />
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Products Grid */}
          <ul className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {isLoading
              ? new Array(12)
                  .fill(null)
                  .map((_, index) => <ProductItemSkeleton key={index} />)
              : products?.map((product) => (
                  <ProductItem key={product.id} product={product.metadata!} />
                ))}
            {products?.length === 0 && <EmptyState />}
          </ul>
        </div>
      </section>
    </main>
  );
}
