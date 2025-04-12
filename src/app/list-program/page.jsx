// app/list/page.jsx
'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

const ListProgram = () => {

  const programs = {
    general: {
      title: 'ค้นพบเครื่องมือสำหรับทุกวัน',
      description: 'เลือกโปรแกรมที่เหมาะกับไลฟ์สไตล์และเป้าหมายของคุณ',
      items: [
        {
          title: 'TodoList: จัดระเบียบทุกก้าวของชีวิต',
          description: 'วางแผนและจัดการทุกภารกิจอย่างง่ายดาย ด้วยเครื่องมือที่ช่วยให้คุณไม่พลาดทุกเป้าหมายสำคัญ',
          path: '/list-program/todo',
          image: '/images/todo.jpg',
        },
      ],
    },
    calculators: {
      title: 'เครื่องมือคำนวณอัจฉริยะ',
      description: 'ค้นหาโซลูชันการคำนวณที่ตอบโจทย์ทุกความต้องการของคุณ',
      items: [
        {
          title: 'เครื่องมือคำนวณเปอร์เซ็นต์',
          description: 'คำนวณเปอร์เซ็นต์ต่างๆ เช่น หาผลลัพธ์จาก %, ค้นหา %, กำไร, ขาดทุน',
          path: '/list-program/percentage',
          image: '/images/percentage-calculator.webp',
        },
        {
          title: 'เครื่องมือคำนวณ Yield',
          description: 'คำนวณผลตอบแทน (Yield) ต่อเดือน, ต่อปี และจำนวนเงินจาก %',
          path: '/list-program/yield',
          image: '/images/yield-calculator.webp',
        },
      ],
    },
  }

  const renderCard = (item, index) => (
    <Card key={index} className="flex flex-col">
      <CardHeader>
        <div className="relative w-full h-48">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover rounded-t-md"
            priority={index < 2}
          />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow">
        <CardTitle className="text-xl mb-2">{item.title}</CardTitle>
        <CardDescription className="mb-4 flex-grow">{item.description}</CardDescription>
        <Link href={item.path} passHref>
          <Button variant="default" className="w-full">ใช้งานเครื่องมือ</Button>
        </Link>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto py-10">
      {Object.entries(programs).map(([category, { title, description, items }], index) => (
        <Card key={category} className={index > 0 ? 'mt-2' : 'mb-2'}>
          <CardHeader>
            <CardTitle className="text-3xl text-center">{title}</CardTitle>
            <CardDescription className="text-center">{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {items.map(renderCard)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default ListProgram