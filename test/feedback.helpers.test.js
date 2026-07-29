import {
  calculateOverallRating,
  requirePublishedRatings
} from '@src/services/feedback/feedback.helpers'

describe('feedback helpers', () => {
  test('calculates a one-decimal overall rating from the four dimensions', () => {
    expect(
      calculateOverallRating({
        deliveryRating: 5,
        qualityRating: 4,
        collaborationRating: 4,
        ownershipRating: 5
      })
    ).toBe(4.5)
  })

  test('returns null when a review has no ratings', () => {
    expect(calculateOverallRating({})).toBeNull()
  })

  test('requires every rating before a review is published', () => {
    expect(() =>
      requirePublishedRatings({
        deliveryRating: 5,
        qualityRating: 4,
        collaborationRating: null,
        ownershipRating: 5
      })
    ).toThrow('Complete all four ratings')
  })
})
