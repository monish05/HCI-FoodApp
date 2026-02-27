import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

export default function IngredientAutocomplete({ value, onChange, placeholder, className, onSelect }) {
    const { API_BASE } = useAuth()
    const [ingredients, setIngredients] = useState([])
    const [isOpen, setIsOpen] = useState(false)
    const wrapperRef = useRef(null)

    // Fetch unique ingredients list on mount
    useEffect(() => {
        async function loadIngredients() {
            try {
                const res = await fetch(`${API_BASE}/api/ingredients`)
                if (res.ok) {
                    const data = await res.json()
                    setIngredients(data.ingredients || [])
                }
            } catch (e) {
                console.error("Failed to load ingredients", e)
            }
        }
        loadIngredients()
    }, [API_BASE])

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [wrapperRef])

    const filtered = value.trim() === ''
        ? []
        : ingredients.filter(i => i.toLowerCase().includes(value.toLowerCase())).slice(0, 10)

    // Force selection check on blur (only allow predefined items)
    const handleBlur = (e) => {
        // Small delay to allow click event on dropdown item to fire first
        setTimeout(() => {
            if (value.trim() && !ingredients.some(i => i.toLowerCase() === value.trim().toLowerCase())) {
                onChange('') // Clear if it doesn't match predefined list
            }
        }, 200)
    }

    return (
        <div ref={wrapperRef} className={`relative ${className || ''}`}>
            <input
                type="text"
                value={value}
                onChange={(e) => {
                    onChange(e.target.value)
                    setIsOpen(true)
                }}
                onFocus={() => setIsOpen(true)}
                onBlur={handleBlur}
                placeholder={placeholder || 'Search ingredients...'}
                className="input w-full bg-cream-100 placeholder:text-ink-muted/60"
                required
            />
            {isOpen && filtered.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-cream-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {filtered.map((item, index) => (
                        <li
                            key={index}
                            onMouseDown={(e) => e.preventDefault()} // prevent blur before click
                            onClick={() => {
                                onChange(item)
                                setIsOpen(false)
                                if (onSelect) onSelect(item);
                            }}
                            className="px-4 py-2 hover:bg-sage/10 cursor-pointer text-ink font-medium transition-colors"
                        >
                            {item}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
