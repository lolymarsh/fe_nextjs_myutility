// app/list/page.jsx
'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

const ListProgram = () => {
  // รายการเครื่องมือคำนวณ
  const calculators = [
    {
      title: 'เครื่องมือคำนวณเปอร์เซ็นต์',
      description: 'คำนวณเปอร์เซ็นต์ต่างๆ เช่น หาผลลัพธ์จาก %, ค้นหา %, กำไร, ขาดทุน',
      path: '/percentage',
      image: '/images/percentage-calculator.webp', // รูปภาพตัวอย่าง (ต้องใส่ใน public/images)
    },
    {
      title: 'เครื่องมือคำนวณ Yield',
      description: 'คำนวณผลตอบแทน (Yield) ต่อเดือน, ต่อปี และจำนวนเงินจาก %',
      path: '/yield',
      image: '/images/yield-calculator.webp', // รูปภาพตัวอย่าง
    },
  ]

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl text-center">
            รายการเครื่องมือคำนวณ
          </CardTitle>
          <CardDescription className="text-center">
            เลือกเครื่องมือคำนวณที่ต้องการใช้งาน
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {calculators.map((calc, index) => (
              <Card key={index} className="flex flex-col">
                <CardHeader>
                  <div className="relative w-full h-48">
                    <Image
                      src={calc.image}
                      alt={calc.title}
                      fill
                      className="object-cover rounded-t-md"
                      priority={index < 2} 
                    />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-grow">
                  <CardTitle className="text-xl mb-2">{calc.title}</CardTitle>
                  <CardDescription className="mb-4 flex-grow">
                    {calc.description}
                  </CardDescription>
                  <Link href={calc.path} passHref>
                    <Button variant="default" className="w-full">
                      ใช้งานเครื่องมือ
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ListProgram