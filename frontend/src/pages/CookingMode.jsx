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
      <div className="page-content">
        <p className="mb-4 text-center text-sm font-medium text-ink-muted" aria-live="polite">
          Step {step + 1} of {total}
        </p>
        <div className="mb-8 h-2.5 w-full overflow-hidden rounded-full bg-cream-200">
          <div
            className="h-full rounded-full bg-sage transition-all duration-300 ease-out"
            style={{ width: `${((step + 1) / total) * 100}%` }}
            role="progressbar"
            aria-valuenow={step + 1}
            aria-valuemin={1}
            aria-valuemax={total}
          />
        </div>

        <div className="card rounded-3xl p-8 shadow-soft sm:p-12 lg:p-16">
          <p className="text-xl leading-relaxed text-ink sm:text-2xl lg:text-3xl">
            {recipeSteps[step]}
          </p>
        </div>

        <div className="mt-10 flex w-full flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="btn-secondary w-full sm:w-auto"
            >
              Previous step
            </button>
          ) : (
            <Link to="/recipes" className="btn-secondary w-full text-center sm:w-auto">
              Back to recipes
            </Link>
          )}
          {isLast ? (
            <Link to="/recipes" className="btn-primary order-first w-full text-center sm:order-none sm:w-auto">
              Done
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="btn-primary order-first w-full sm:order-none sm:w-auto"
            >
              Next step
            </button>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
