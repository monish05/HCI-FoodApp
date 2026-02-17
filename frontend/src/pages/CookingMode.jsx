import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageContainer from '../components/PageContainer'
import { recipeSteps } from '../data/mockData'

export default function CookingMode() {
  const [step, setStep] = useState(0)
  const total = recipeSteps.length
  const isLast = step === total - 1

  return (
    <PageContainer className="flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl px-4">
        <div className="mb-6 text-center">
          <p className="text-sm font-medium text-ink-muted" aria-live="polite">
            Step {step + 1} of {total}
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-cream-200">
            <div
              className="h-full rounded-full bg-sage transition-all duration-300"
              style={{ width: `${((step + 1) / total) * 100}%` }}
              role="progressbar"
              aria-valuenow={step + 1}
              aria-valuemin={1}
              aria-valuemax={total}
            />
          </div>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-soft-lg sm:p-12">
          <p className="text-xl leading-relaxed text-ink sm:text-2xl">
            {recipeSteps[step]}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="min-h-14 rounded-2xl bg-cream-200 px-8 font-medium text-ink hover:bg-cream-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
            >
              Previous step
            </button>
          ) : (
            <Link
              to="/recipes"
              className="min-h-14 rounded-2xl bg-cream-200 px-8 font-medium text-ink hover:bg-cream-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 inline-flex items-center justify-center"
            >
              Back to recipes
            </Link>
          )}
          {isLast ? (
            <Link
              to="/recipes"
              className="min-h-14 rounded-2xl bg-sage px-8 font-medium text-white hover:bg-sage-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 inline-flex items-center justify-center"
            >
              Done
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="min-h-14 rounded-2xl bg-sage px-8 font-medium text-white hover:bg-sage-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
            >
              Next step
            </button>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
