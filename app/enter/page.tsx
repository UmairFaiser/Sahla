import { EnterForm } from "@/components/enter-form";

export default function EnterPage() {
  return (
    <main className="mx-auto flex min-h-full w-full min-w-0 max-w-md flex-col justify-center overflow-x-clip px-4 py-16 sm:px-6">
      <h1 className="mt-4 font-serif text-4xl leading-tight text-balance text-gray-1200 animate-[fadeInUp_220ms_cubic-bezier(0.2,0,0,1)_both] [animation-delay:90ms]">
        Enter my date of birth
      </h1>
      <p className="mt-3 mb-8 text-base leading-7 text-pretty text-gray-1100 animate-[fadeInUp_220ms_cubic-bezier(0.2,0,0,1)_both] [animation-delay:160ms]">
        Enter it to open the page.
      </p>
      <div className="animate-[fadeInUp_220ms_cubic-bezier(0.2,0,0,1)_both] [animation-delay:230ms]">
        <EnterForm />
      </div>
    </main>
  );
}
