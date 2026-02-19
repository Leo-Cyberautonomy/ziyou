import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface Step {
  id: number
  label: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((step, idx) => {
        const isCompleted = step.id < currentStep
        const isCurrent = step.id === currentStep

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1 : 0.9,
                  backgroundColor: isCompleted
                    ? '#6366F1'
                    : isCurrent
                      ? '#6366F1'
                      : 'rgba(99, 102, 241, 0.15)',
                  borderColor: isCompleted || isCurrent
                    ? '#6366F1'
                    : 'rgba(99, 102, 241, 0.3)',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold"
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    <Check size={16} className="text-white" />
                  </motion.div>
                ) : (
                  <span className={isCurrent ? 'text-white' : 'text-gray-500'}>
                    {step.id}
                  </span>
                )}
              </motion.div>
              <span
                className={`text-[11px] font-medium whitespace-nowrap ${
                  isCurrent
                    ? 'text-gaming-accent-light'
                    : isCompleted
                      ? 'text-gray-400'
                      : 'text-gray-500'
                }`}
              >
                {step.label}
              </span>
            </div>

            {idx < steps.length - 1 && (
              <div className="mx-2 mb-5 h-px w-10 sm:w-16">
                <motion.div
                  initial={false}
                  animate={{
                    scaleX: step.id < currentStep ? 1 : 0,
                    backgroundColor: '#6366F1',
                  }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="h-full w-full origin-left"
                />
                <div className="mt-[-1px] h-px w-full bg-gaming-border" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
