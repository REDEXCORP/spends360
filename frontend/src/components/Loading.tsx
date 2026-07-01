import { cn } from '@/lib/utils';

const Loading = () => {
    return (
        <div className={cn('flex h-screen w-full items-center justify-center')}>
            <div className="loader"></div>

            <style jsx>{`
                .loader {
                    width: 20px;
                    aspect-ratio: 1;
                    border-radius: 50%;
                    background: #000;
                    box-shadow: 0 0 0 0 #0004;
                    animation: ripple 1.5s infinite linear;
                    position: relative;
                }

                .loader::before,
                .loader::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: inherit;
                    box-shadow: 0 0 0 0 #0004;
                    animation: ripple 1.5s infinite linear;
                }

                .loader::before {
                    animation-delay: -0.5s;
                }

                .loader::after {
                    animation-delay: -1s;
                }

                @keyframes ripple {
                    100% {
                        box-shadow: 0 0 0 40px #0000;
                    }
                }
            `}</style>
        </div>
    );
};

export default Loading;
