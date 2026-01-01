export function HowItWorks() {
  return (
    <section className='bg-secondary/20 py-24 md:py-32'>
      <div className='container px-4 md:px-6'>
        <div className='mb-16 text-center'>
          <h2 className='text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl'>Simple by design</h2>
          <p className='mt-4 text-lg text-muted-foreground'>Three steps to clarity.</p>
        </div>

        <div className='relative grid gap-8 md:grid-cols-3'>
          {/* Connecting Line (Desktop) */}
          <div className='absolute top-12 hidden h-0.5 w-full bg-border md:block' aria-hidden='true' />

          {/* Step 1 */}
          <div className='relative flex flex-col items-center text-center'>
            <div className='mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-background bg-card shadow-lg'>
              <span className='text-3xl font-bold text-primary'>1</span>
            </div>
            <h3 className='mb-2 text-xl font-bold'>Target</h3>
            <p className='text-muted-foreground'>Paste the URL of any article, paper, or documentation site.</p>
          </div>

          {/* Step 2 */}
          <div className='relative flex flex-col items-center text-center'>
            <div className='mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-background bg-card shadow-lg'>
              <span className='text-3xl font-bold text-primary'>2</span>
            </div>
            <h3 className='mb-2 text-xl font-bold'>Direct</h3>
            <p className='text-muted-foreground'>Optional: Tell the AI what to focus on or simply let it summarize.</p>
          </div>

          {/* Step 3 */}
          <div className='relative flex flex-col items-center text-center'>
            <div className='mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-background bg-card shadow-lg'>
              <span className='text-3xl font-bold text-primary'>3</span>
            </div>
            <h3 className='mb-2 text-xl font-bold'>Receive</h3>
            <p className='text-muted-foreground'>Get a clean, structured Markdown summary instantly.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
