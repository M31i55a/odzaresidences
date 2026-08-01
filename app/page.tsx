export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="line-mask">
        <p className="line-inner font-mono text-xs uppercase tracking-[0.2em] text-brass">
          Welcome
        </p>
      </div>
      <div className="line-mask">
        <h1 className="line-inner font-display font-medium leading-tight text-cream">
          <span className="block text-4xl sm:text-5xl lg:text-6xl">
            The door is open.
          </span>
        </h1>
      </div>
      <div className="line-mask">
        <p className="line-inner mx-auto max-w-[40ch] font-mono text-[15px] leading-relaxed text-cream-soft">
          Your house is{" "}
          <span className="text-brass">here</span>{" "}
          Just come and grab the <span className="text-brass">keys</span> !
        </p>
      </div>
    </main>
  );
}
