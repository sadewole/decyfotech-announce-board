'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';

interface PostFiltersProps {
  categories: Category[] | undefined;
  filterCategory: string;
  filterStart: string;
  filterEnd: string;
  dateError: boolean;
  onCategoryChange: (v: string) => void;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
  onClear: () => void;
}

export function PostFilters({
  categories,
  filterCategory,
  filterStart,
  filterEnd,
  dateError,
  onCategoryChange,
  onStartChange,
  onEndChange,
  onClear,
}: PostFiltersProps) {
  return (
    <div className="flex items-center gap-2.5 flex-wrap p-2.5 bg-card border border-border rounded-xl mb-7">
      <Select value={filterCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-36 text-xs">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All categories</SelectItem>
          {categories?.map((cat) => (
            <SelectItem key={cat.id} value={cat.id.toString()}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="date"
        className="w-36 cursor-pointer text-xs"
        value={filterStart}
        onChange={(e) => onStartChange(e.target.value)}
      />
      <span className="text-xs text-muted-foreground">—</span>
      <Input
        type="date"
        className={`w-36 cursor-pointer ${dateError ? 'border-destructive' : ''}`}
        value={filterEnd}
        onChange={(e) => onEndChange(e.target.value)}
      />
      {dateError && (
        <span className="text-xs text-destructive whitespace-nowrap">End before start</span>
      )}
      {(filterCategory || filterStart || filterEnd) && (
        <Button variant="ghost" size="sm" className="cursor-pointer gap-1 text-xs" onClick={onClear}>
          <X className="h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  );
}
