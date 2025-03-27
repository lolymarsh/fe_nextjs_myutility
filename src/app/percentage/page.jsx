// app/percentage/page.jsx
'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const PercentagePage = () => {
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
      case 'fromPercentage':
        setResult((num1 * num2) / 100)
        break
      case 'percentage':
        if (num2 !== 0) setResult((num1 / num2) * 100)
        break
      case 'originalNumber':
        if (num2 !== 0) setResult((num1 * 100) / num2)
        break
      case 'percentageChange':
        if (num1 !== 0) setResult(((num2 - num1) / num1) * 100)
        break
      case 'profit':
        if (num1 !== 0) setResult(((num2 - num1) / num1) * 100)
        break
      case 'loss':
        if (num1 !== 0) setResult(((num1 - num2) / num1) * 100 > 0 ? ((num1 - num2) / num1) * 100 : 0)
        break
      default:
        setResult(null)
    }
  }, [input1, input2, mode])

  // กำหนด placeholder ตาม mode
  const getPlaceholders = () => {
    switch (mode) {
      case 'fromPercentage':
        return ['จำนวน', 'เปอร์เซ็นต์']
      case 'percentage':
        return ['ส่วน', 'ทั้งหมด']
      case 'originalNumber':
        return ['จำนวน', 'เปอร์เซ็นต์']
      case 'percentageChange':
        return ['เลขเก่า', 'เลขใหม่']
      case 'profit':
        return ['ต้นทุน', 'ราคาขาย']
      case 'loss':
        return ['ต้นทุน', 'ราคาขาย']
      default:
        return ['เลือกโหมด', 'เลือกโหมด']
    }
  }

  // ข้อมูลคำอธิบายสำหรับแต่ละ mode
  const modeDescriptions = {
    fromPercentage: {
      title: 'เครื่องมือคำนวณหาผลลัพธ์จากเปอร์เซ็นต์',
      description: 'ใช้คำนวณหาคำตอบของ % ของตัวเลขที่เราอยากรู้ เช่น 3% ของ 10,000 คือเท่าไร คำตอบคือ 300',
      examples: [
        'กู้เงินมา 10,000 บาท จ่ายดอกเบี้ยร้อยละ 3 ต่อเดือน จะต้องจ่ายดอกเบี้ยกี่บาท (คำตอบ: 300)',
        'ซื้อสินค้าราคา 1,000 บาท พ่อค้าลดให้ 10% จะทราบว่าพ่อค้าลดให้เท่าไร',
        'เงินต้น 10,000 บาท ต้องจ่ายภาษี 15% จะทราบว่าต้องจ่ายภาษีกี่บาท'
      ]
    },
    percentage: {
      title: 'ค้นหาเปอร์เซ็นต์',
      description: 'ตัวคำนวณหา % อัตโนมัติ เช่น 30 เป็นกี่เปอร์เซ็นต์ของ 1,000 คำตอบคือ 3%',
      examples: [
        'กำไร 30 บาท จากการลงทุน 1,000 บาท เท่ากับกำไรกี่% (คำตอบ: 3%)',
        'ต้นทุนผลิตครีม 165 บาท ตั้งราคาขายปลีก 380 บาท ต้นทุนคิดเป็นกี่% ของราคาขายปลีก'
      ]
    },
    originalNumber: {
      title: 'ค้นหาเลขต้นจากเปอร์เซ็นต์',
      description: '500 เป็น 10% ของเลขอะไร คำตอบคือ 5,000',
      examples: [
        'เพื่อนได้กำไรหุ้น 30,000 บาท ซึ่งเป็น 3% ของเงินต้นที่ลงทุน เงินต้นคือเท่าไร'
      ]
    },
    percentageChange: {
      title: 'ค้นหา % ที่เพิ่มขึ้น หรือ ลดลง ระหว่าง 2 ตัวเลข',
      description: 'ใส่ 2 ตัวเลขเพื่อหาการเพิ่มขึ้นหรือลดลงเป็นกี่% เช่น ยอดขายก่อน 1,000 ยอดขายใหม่ 2,000 คำตอบ 100%',
      examples: [
        'ยอดขายเพิ่มจาก 100 เป็น 200 เพิ่มกี่% (คำตอบ: 100%)',
        'ยอดขายลดจาก 500 เหลือ 250 คิดเป็นกี่% (คำตอบ: -50%)',
        'ซื้อ 1,000 ขาย 500 คำตอบ -50%'
      ]
    },
    profit: {
      title: 'คำนวณกำไรกี่เปอร์เซ็นต์',
      description: 'คำนวณกำไรเป็นเปอร์เซ็นต์ (ยอดขายต้องมากกว่าต้นทุน)',
      examples: [
        'ซื้อกระเป๋ามา 200 บาท ขาย 300 บาท ได้กำไรกี่% (คำตอบ: 50%)',
        'ซื้อปู 500 บาท ขาย 750 บาท ได้กำไรกี่%'
      ]
    },
    loss: {
      title: 'คำนวณขาดทุนกี่เปอร์เซ็นต์',
      description: 'คำนวณการขาดทุนเป็นเปอร์เซ็นต์ (ยอดขายต้องน้อยกว่าต้นทุน)',
      examples: [
        'ซื้อไอโฟน 20,000 บาท ขาย 15,000 บาท ขาดทุนกี่% (คำตอบ: 25%)',
        'ซื้อปลา 1,000 บาท ขาย 500 บาท ขาดทุนกี่%'
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
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            เครื่องมือคำนวณเปอร์เซ็นต์
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
              onClick={() => changeMode('fromPercentage')}
              variant={mode === 'fromPercentage' ? 'default' : 'outline'}
            >
              หาผลลัพธ์จาก %
            </Button>
            <Button
              onClick={() => changeMode('percentage')}
              variant={mode === 'percentage' ? 'default' : 'outline'}
            >
              ค้นหาเปอร์เซ็นต์
            </Button>
            <Button
              onClick={() => changeMode('originalNumber')}
              variant={mode === 'originalNumber' ? 'default' : 'outline'}
            >
              หาเลขต้นจาก %
            </Button>
            <Button
              onClick={() => changeMode('percentageChange')}
              variant={mode === 'percentageChange' ? 'default' : 'outline'}
            >
              % เพิ่มขึ้น/ลดลง
            </Button>
            <Button
              onClick={() => changeMode('profit')}
              variant={mode === 'profit' ? 'success' : 'outline'}
            >
              กำไรกี่ %
            </Button>
            <Button
              onClick={() => changeMode('loss')}
              variant={mode === 'loss' ? 'destructive' : 'outline'}
            >
              ขาดทุนกี่ %
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
                {mode !== 'fromPercentage' && mode !== 'originalNumber' && ' %'}
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

export default PercentagePage