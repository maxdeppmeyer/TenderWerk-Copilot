import { describe, expect, it } from 'vitest'
import { calculateLine, summarizeCalculation } from '../lib/calculation'
import { createDemoTender, defaultProfile } from '../lib/sampleData'

describe('Kalkulation', () => {
  it('berechnet direkte Kosten und Verkaufspreis deterministisch', () => {
    const item = createDemoTender(defaultProfile).lineItems[0]
    const result = calculateLine(item)
    expect(result.directUnitCost).toBeGreaterThan(0)
    expect(result.sellingUnitPrice).toBeGreaterThan(result.directUnitCost)
    expect(result.totalPrice).toBe(Number((result.sellingUnitPrice * item.quantity).toFixed(2)))
  })

  it('zeigt nicht bestätigte Positionen in der Summe', () => {
    const items = createDemoTender(defaultProfile).lineItems
    const total = summarizeCalculation(items, 19)
    expect(total.unconfirmed).toBe(1)
    expect(total.gross).toBe(Number((total.net + total.vat).toFixed(2)))
  })
})
