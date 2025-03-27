import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { HomeIcon } from 'lucide-react'

 const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center mt-20 px-4 text-center">
      <div className="space-y-6 max-w-md">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-3xl font-semibold">ไม่พบหน้า</h2>
        <p className="text-muted-foreground text-lg">
          ขออภัย เราไม่สามารถค้นหาหน้าที่คุณกำลังมองหาได้
        </p>
        <div className="border-t border-border pt-6">
          <p className="text-muted-foreground mb-4">
            คุณอาจพิมพ์ URL ผิด หรือหน้านี้อาจถูกย้ายหรือลบออกไปแล้ว
          </p>
          <Button asChild>
            <Link href="/" className="flex iftems-center gap-2">
              <HomeIcon size={18} />
              <span>กลับไปยังหน้าหลัก</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NotFound