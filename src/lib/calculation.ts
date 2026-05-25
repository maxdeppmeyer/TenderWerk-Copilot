import type { LineItem } from '../types/domain'

export interface CalculatedLine {
  directUnitCost: number
  sellingUnitPrice: number
  totalPrice: number
}

export const calculateLine = (item: LineItem): CalculatedLine => {
  const directUnitCost = item.workHoursPerUnit * item.hourlyRate + item.materialCostPerUnit + item.equipmentCostPerUnit + item.externalCostPerUnit
  const withOverhead = directUnitCost * (1 + item.overheadPercent / 100)
  const withRisk = withOverhead * (1 + item.riskPercent / 100)
  const sellingUnitPrice = Number((withRisk * (1 + item.marginPercent / 100)).toFixed(2))
  return { directUnitCost: Number(directUnitCost.toFixed(2)), sellingUnitPrice, totalPrice: Number((sellingUnitPrice * item.quantity).toFixed(2)) }
}

export const summarizeCalculation = (items: LineItem[], vatPercent: number) => {
  const net = Number(items.reduce((sum, item) => sum + calculateLine(item).totalPrice, 0).toFixed(2))
  const vat = Number((net * vatPercent / 100).toFixed(2))
  return { net, vat, gross: Number((net + vat).toFixed(2)), unconfirmed: items.filter((item) => !item.confirmed).length }
}
