import { forwardRef, type ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'size' | 'children'> {
  variant?: Variant
  size?: Size
  loading?: boolean
  children?: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-gaming-accent text-white hover:bg-gaming-accent-light hover:shadow-[0_0_24px_rgba(99,102,241,0.35)] active:bg-gaming-accent',
  secondary:
    'bg-transparent border border-gaming-border text-gaming-accent-light hover:bg-gaming-accent/10',
  ghost:
    'bg-transparent text-gray-300 hover:bg-white/5 hover:text-white',
  danger:
    'bg-red-600 text-white hover:bg-red-500 hover:shadow-[0_0_24px_rgba(239,68,68,0.3)]',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3 text-base rounded-xl',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className = '', children, disabled, ...rest }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className={`
          inline-flex items-center justify-center gap-2 font-medium
          transition-colors duration-200 cursor-pointer
          disabled:opacity-40 disabled:pointer-events-none
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `}
        disabled={disabled || loading}
        {...rest}
      >
        {loading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </motion.button>
    )
  },
)

Button.displayName = 'Button'

export default Button
