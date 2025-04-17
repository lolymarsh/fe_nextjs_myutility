import React from 'react';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const PaginationComponent = ({ pagination, onPageChange, onPageSizeChange }) => {
  const { currentPage, totalPages, totalItems, pageSize } = pagination;
  const pageSizeOptions = [10, 20, 50, 100];

  // ฟังก์ชันสร้าง array ของหน้าที่จะแสดง
  const getPageNumbers = () => {
    const delta = 2; // จำนวนหน้าที่แสดงก่อนและหลังหน้าปัจจุบัน
    const range = [];
    const rangeWithDots = [];
    let start = Math.max(1, currentPage - delta);
    let end = Math.min(totalPages, currentPage + delta);

    // ปรับ start และ end เพื่อให้แสดงจำนวนหน้าคงที่ถ้าเป็นไปได้
    const pageCount = end - start + 1;
    if (pageCount < 2 * delta + 1) {
      if (currentPage < totalPages / 2) {
        end = Math.min(totalPages, end + (2 * delta + 1 - pageCount));
      } else {
        start = Math.max(1, start - (2 * delta + 1 - pageCount));
      }
    }

    // สร้าง array ของหน้าที่จะแสดง
    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    // เพิ่มหน้าแรกและจุดไข่ปลาถ้าจำเป็น
    if (start > 1) {
      rangeWithDots.push(1);
      if (start > 2) {
        rangeWithDots.push('...');
      }
    }

    // เพิ่มหน้าที่อยู่ใน range
    rangeWithDots.push(...range);

    // เพิ่มหน้าสุดท้ายและจุดไข่ปลาถ้าจำเป็น
    if (end < totalPages) {
      if (end < totalPages - 1) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();

  if (totalPages === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-4 mt-4">
      <div className="flex items-center gap-2">
        <span>ข้อมูลแสดงทั้งหมด</span>
        <span>{totalItems} รายการ</span>
      </div>

      <div className="flex justify-between items-center w-full">
        <Select
          value={pageSize?.toString()}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Page Size" />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size} ต่อหน้า
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {pageNumbers.map((page, index) =>
            page === '...' ? (
              <span key={`dots-${index}`} className="px-2">
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            )
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaginationComponent;