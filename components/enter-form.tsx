"use client";

import { useActionState } from "react";
import { unlockSite, type ActionState } from "@/app/actions";

const initial: ActionState = {};

export function EnterForm() {
  const [state, action, pending] = useActionState(unlockSite, initial);

  return (
    <form action={action} className="flex w-full flex-col gap-6">
      <div className="grid grid-cols-3 gap-3">
        <Field label="Day" name="day" maxLength={2} autoFocus />
        <Field label="Month" name="month" maxLength={2} />
        <Field label="Year" name="year" maxLength={4} />
      </div>

      {state.error ? (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-2xl bg-gray-1200 px-5 text-sm font-medium text-gray-100 shadow-custom transition-[transform,box-shadow,opacity] duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:shadow-custom-hover active:scale-[0.96] disabled:opacity-60"
      >
        {pending ? "Checking…" : "Enter"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  maxLength,
  autoFocus,
}: {
  label: string;
  name: string;
  maxLength: number;
  autoFocus?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-medium tracking-[0.14em] text-gray-1100 uppercase">
        {label}
      </span>
      <input
        name={name}
        inputMode="numeric"
        autoComplete="off"
        maxLength={maxLength}
        autoFocus={autoFocus}
        className="h-14 rounded-2xl bg-gray-100 px-3 text-center font-serif text-2xl text-gray-1200 shadow-border outline-none transition-[box-shadow] duration-150 ease-[cubic-bezier(0.2,0,0,1)] focus:shadow-custom tabular-nums"
      />
    </label>
  );
}
