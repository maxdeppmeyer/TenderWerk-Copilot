import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RecommendationBadge, QualityBadge } from '../components/ui/Status'

describe('Statusdarstellung', () => {
  it('zeigt Entscheidung und Datenqualität verständlich an', () => {
    render(<><RecommendationBadge value="go_after_review"/><QualityBadge value="widerspruechlich"/></>)
    expect(screen.getByText('Go nach Prüfung')).toBeInTheDocument()
    expect(screen.getByText('Widersprüchliche Angaben')).toBeInTheDocument()
  })
})
