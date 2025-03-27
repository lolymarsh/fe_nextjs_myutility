// app/yield/page.jsx
'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Image from 'next/image'

const YieldPage = () => {
  const [input1, setInput1] = useState('')
  const [input2, setInput2] = useState('')
  const [result, setResult] = useState(null)
  const [mode, setMode] = useState(null)

  // ฟังก์ชันแปลง input ที่มีคอมมาเป็นตัวเลข
  const parseNumber = (value) => {
    if (!value) return NaN
    return parseFloat(value.replace(/,/g, ''))
  }

  // ฟังก์ชันฟอร์แมตตัวเลขให้มี comma
  const formatNumber = (value) => {
    if (!value) return ''
    const num = value.replace(/[^0-9.]/g, '')
    const parts = num.split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return parts.join('.')
  }

  // คำนวณตาม mode แบบ realtime
  useEffect(() => {
    if (!input1 || !input2) {
      setResult(null)
      return
    }

    const num1 = parseNumber(input1)
    const num2 = parseNumber(input2)

    if (isNaN(num1) || isNaN(num2)) {
      setResult(null)
      return
    }

    switch (mode) {
      case 'yieldPerMonth':
        if (num1 !== 0) setResult((num2 / num1) * 100) // ผลตอบแทนต่อเดือนเป็น %
        break
      case 'yieldPerYear':
        if (num1 !== 0) setResult((num2 / num1) * 100) // ผลตอบแทนต่อปีเป็น %
        break
      case 'amountFromYearlyPercent':
        setResult((num1 * num2) / 100) // จำนวนบาทจาก % ต่อปี
        break
      case 'amountFromMonthlyPercent':
        setResult((num1 * num2) / 100) // จำนวนบาทจาก % ต่อเดือน
        break
      default:
        setResult(null)
    }
  }, [input1, input2, mode])

  // กำหนด placeholder ตาม mode
  const getPlaceholders = () => {
    switch (mode) {
      case 'yieldPerMonth':
        return ['เงินลงทุน', 'ผลตอบแทนต่อเดือน']
      case 'yieldPerYear':
        return ['เงินลงทุน', 'ผลตอบแทนต่อปี']
      case 'amountFromYearlyPercent':
        return ['เงินลงทุน', 'เปอร์เซ็นต์ต่อปี']
      case 'amountFromMonthlyPercent':
        return ['เงินลงทุน', 'เปอร์เซ็นต์ต่อเดือน']
      default:
        return ['เลือกโหมด', 'เลือกโหมด']
    }
  }

  // ข้อมูลคำอธิบายสำหรับแต่ละ mode
  const modeDescriptions = {
    yieldPerMonth: {
      title: 'คำนวณ Yield ต่อเดือน (ผลตอบแทนที่เราได้ต่อเดือน)',
      description: 'คำนวณผลตอบแทนเป็นเปอร์เซ็นต์ต่อเดือนจากเงินลงทุนและผลตอบแทนที่ได้รับ เช่น ลงทุน 1,000,000 บาท ได้ผลตอบแทน 20,000 บาทต่อเดือน คำตอบคือ 2%',
      examples: [
        'ลงทุนซื้อคอนโด 3,500,000 บาท ได้ค่าเช่า 30,000 บาทต่อเดือน ผลตอบแทนกี่% ต่อเดือน (คำตอบ: 0.86%)',
        'ฝากเงิน 500,000 บาท ได้ดอกเบี้ย 5,000 บาทต่อเดือน คิดเป็นผลตอบแทนกี่% ต่อเดือน'
      ]
    },
    yieldPerYear: {
      title: 'คำนวณ Yield ต่อปี (ผลตอบแทนที่เราได้ต่อปี)',
      description: 'คำนวณผลตอบแทนเป็นเปอร์เซ็นต์ต่อปีจากเงินลงทุนและผลตอบแทนที่ได้รับ เช่น ลงทุน 1,000,000 บาท ได้ผลตอบแทน 20,000 บาทต่อปี คำตอบคือ 2%',
      examples: [
        'ฝากเงิน 1,000,000 บาท ได้ดอกเบี้ย 20,000 บาทต่อปี ผลตอบแทนกี่% ต่อปี (คำตอบ: 2%)',
        'ซื้อคอนโด 3,000,000 บาท ปล่อยเช่าได้ 150,000 บาทต่อปี ผลตอบแทนกี่% ต่อปี'
      ]
    },
    amountFromYearlyPercent: {
      title: 'คำนวณผลตอบแทนจาก % ต่อปีเป็นจำนวนบาท',
      description: 'คำนวณจำนวนเงินผลตอบแทนต่อปีจากเงินลงทุนและเปอร์เซ็นต์ที่กำหนด เช่น ลงทุน 1,000,000 บาท ผลตอบแทน 2% ต่อปี คำตอบคือ 20,000 บาท',
      examples: [
        'ลงทุน 1,000,000 บาท ธนาคารให้ดอกเบี้ย 2% ต่อปี ได้เงินเท่าไร (คำตอบ: 20,000 บาท)',
        'ซื้อคอนโด 3,000,000 บาท ต้องการผลตอบแทน 5% ต่อปี ต้องปล่อยเช่าได้เท่าไร'
      ]
    },
    amountFromMonthlyPercent: {
      title: 'คำนวณผลตอบแทนจาก % ต่อเดือนเป็นจำนวนบาท',
      description: 'คำนวณจำนวนเงินผลตอบแทนต่อเดือนจากเงินลงทุนและเปอร์เซ็นต์ที่กำหนด เช่น ลงทุน 1,000,000 บาท ผลตอบแทน 2% ต่อเดือน คำตอบคือ 20,000 บาท',
      examples: [
        'ยืมเงิน 1,000,000 บาท ให้ดอกเบี้ย 2% ต่อเดือน ได้เงินเท่าไรต่อเดือน (คำตอบ: 20,000 บาท)',
        'ลงทุน 500,000 บาท ต้องการผลตอบแทน 1% ต่อเดือน จะได้เงินเท่าไร'
      ]
    }
  }

  const resetFields = () => {
    setInput1('')
    setInput2('')
    setResult(null)
    setMode(null)
  }

  const changeMode = (newMode) => {
    setMode(newMode)
    setInput1('')
    setInput2('')
    setResult(null)
  }

  const placeholders = getPlaceholders()
  const currentDescription = mode ? modeDescriptions[mode] : null

  return (
    <div className="container mx-auto py-10 min-h-screen">
      <Card className="max-w-2xl mx-auto">

    <div className="relative w-full h-60 mb-4">
              <Image
                src="/images/yield-calculator.webp"
                alt="Percentage Calculator"
                fill
                className="object-cover rounded-t-lg"
                priority
              />
            </div>

        <CardHeader>
          <CardTitle className="text-2xl text-center">
            เครื่องมือคำนวณ Yield
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Fields */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="text"
              value={input1}
              onChange={(e) => setInput1(formatNumber(e.target.value))}
              placeholder={placeholders[0]}
              disabled={mode === null}
            />
            <Input
              type="text"
              value={input2}
              onChange={(e) => setInput2(formatNumber(e.target.value))}
              placeholder={placeholders[1]}
              disabled={mode === null}
            />
          </div>

          {/* Mode Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => changeMode('yieldPerMonth')}
              variant={mode === 'yieldPerMonth' ? 'default' : 'outline'}
            >
              Yield ต่อเดือน (%)
            </Button>
            <Button
              onClick={() => changeMode('yieldPerYear')}
              variant={mode === 'yieldPerYear' ? 'default' : 'outline'}
            >
              Yield ต่อปี (%)
            </Button>
            <Button
              onClick={() => changeMode('amountFromYearlyPercent')}
              variant={mode === 'amountFromYearlyPercent' ? 'default' : 'outline'}
            >
              จำนวนจาก % ปี
            </Button>
            <Button
              onClick={() => changeMode('amountFromMonthlyPercent')}
              variant={mode === 'amountFromMonthlyPercent' ? 'default' : 'outline'}
            >
              จำนวนจาก % เดือน
            </Button>
          </div>

          {/* Reset Button */}
          <Button
            onClick={resetFields}
            variant="outline"
            className="w-full"
          >
            รีเซ็ต
          </Button>

          {/* Result */}
          {result !== null && (
            <div className="text-center p-4 bg-muted rounded-md">
              <p className="text-lg font-semibold">
                ผลลัพธ์: {result.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                {(mode === 'yieldPerMonth' || mode === 'yieldPerYear') && ' %'}
                {(mode === 'amountFromYearlyPercent' || mode === 'amountFromMonthlyPercent') && ' บาท'}
              </p>
            </div>
          )}

          {/* Description */}
          {currentDescription && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>{currentDescription.title}</CardTitle>
                <CardDescription>{currentDescription.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-semibold">ตัวอย่าง:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {currentDescription.examples.map((example, index) => (
                      <li key={index}>{example}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default YieldPage