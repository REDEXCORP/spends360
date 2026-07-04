const Loading = () => {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="reach-loader" />
            <style>{`
                .reach-loader {
                    width: 20px;
                    aspect-ratio: 1;
                    border-radius: 50%;
                    background: #000;
                    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.25);
                    animation: reach-ripple 1.5s infinite linear;
                    position: relative;
                }

                .reach-loader::before,
                .reach-loader::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: inherit;
                    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.25);
                    animation: reach-ripple 1.5s infinite linear;
                }

                .reach-loader::before {
                    animation-delay: -0.5s;
                }

                .reach-loader::after {
                    animation-delay: -1s;
                }

                @keyframes reach-ripple {
                    100% {
                        box-shadow: 0 0 0 40px transparent;
                    }
                }
            `}</style>
        </div>
    );
};

export default Loading;
