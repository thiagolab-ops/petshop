'use client'

type ChatButtonProps = {
    position?: 'fixed-bottom-right' | 'inline'
}

export function ChatButton({ position = 'fixed-bottom-right' }: ChatButtonProps) {
    const containerClass =
        position === 'fixed-bottom-right'
            ? 'fixed bottom-6 right-6 z-50'
            : 'relative z-50'

    return (
        <div className={containerClass}>
            <button
                aria-label="Chat com Sofia"
                onClick={() => window.dispatchEvent(new CustomEvent('openChat'))}
                className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/40 transition-transform hover:scale-110 active:scale-95"
            >
                <span className="material-symbols-outlined fill">chat_bubble</span>
                <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-green-400 border-2 border-white"></span>
            </button>
        </div>
    )
}
