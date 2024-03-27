"use client";

import { useState } from "react";
import { ChevronDown, Filter } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { name: "None", value: "none" },
  { name: "Price: Low to High", value: "price-asc" },
  { name: "Price: High to Low", value: "price-desc" },
] as const;

export default function Home() {
  const [filter, setFilter] = useState({
    sort: "none",
  });

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex items-baseline justify-between border-b border-gray-200 pt-24">
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
                  onClick={() =>
                    setFilter((prev) => ({ ...prev, sort: option.value }))
                  }
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
    </main>
  );
}
