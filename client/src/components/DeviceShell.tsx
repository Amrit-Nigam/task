import type { ReactNode } from "react";
import { BallSwitcher } from "@/components/BallSwitcher";

interface DeviceShellProps {
  /** Right side of the bezel — favourites, night mode. */
  actions?: ReactNode;
  /** Line under the wordmark: species count, current filter. */
  status?: ReactNode;
  /** Everything below the hinge. The caller owns its own screens. */
  children: ReactNode;
}

/**
 * The casing the whole application is moulded into.
 *
 * Above the hinge is the bezel: the big blue lamp, the three indicator LEDs
 * beside it, the wordmark, and the ridge that closes the assembly off. What
 * sits below the hinge belongs to the caller — on desktop the device opens
 * into two halves, the specimen screen on one side and the record on the
 * other, which is why this component owns no display of its own.
 *
 * The casing is deliberately *not* a background image or a border-radius on
 * the body: it is a real plate with its own outline and offset shadow, so the
 * screen inside it is visibly recessed into something.
 */
export function DeviceShell({ actions, status, children }: DeviceShellProps) {
  return (
    <div className="mx-auto w-full max-w-[1500px] px-3 py-4 sm:px-5 sm:py-7">
      <div
        className="rounded-[20px] border-[3px] border-[var(--pd-black)] p-3 shadow-[6px_6px_0_rgb(0_0_0_/_0.32)] sm:p-5"
        style={{
          background:
            "linear-gradient(180deg, rgb(255 255 255 / 0.10) 0%, transparent 34%), var(--pd-casing)",
        }}
      >
        {/* ---- bezel ---------------------------------------------------- */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          {/* The lamp cluster. The big lamp is the scanner lens; the three
              small ones are the status lights that sit beside it on every
              model. */}
          <div className="flex shrink-0 items-center gap-3">
            <span
              className="lamp h-11 w-11 sm:h-14 sm:w-14"
              style={{ "--lamp-color": "#3ba7e8" } as React.CSSProperties}
              aria-hidden
            />
            <span className="flex gap-1.5">
              <span
                className="led h-3 w-3"
                style={{ "--lamp-color": "var(--pd-led-red)" } as React.CSSProperties}
                aria-hidden
              />
              <span
                className="led h-3 w-3"
                style={{ "--lamp-color": "var(--pd-led-yellow)" } as React.CSSProperties}
                aria-hidden
              />
              <span
                className="led h-3 w-3"
                style={{ "--lamp-color": "var(--pd-led-green)" } as React.CSSProperties}
                aria-hidden
              />
            </span>
          </div>

          {/* Wordmark, stamped into the casing rather than printed on the
              screen — it is part of the device, not part of the data. */}
          <div className="min-w-0 flex-1">
            <h1
              className="font-display text-[1.6rem] font-extrabold leading-none tracking-tight text-white sm:text-[2rem]"
              style={{ textShadow: "2px 2px 0 rgb(0 0 0 / 0.45)" }}
            >
              Pokédex
            </h1>
            {status ? (
              <div className="mt-1 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-white/75">
                {status}
              </div>
            ) : null}
          </div>

          {/* The bezel controls wrap among themselves rather than being held
              rigid: at 320px the pair of buttons and the four casing swatches
              come to more than the shell is wide, and `shrink-0` turned that
              into a document-wide horizontal scroll. */}
          <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
            {actions}
            <BallSwitcher />
          </div>
        </div>

        {/* The hinge ridge — the equator of the shell, closing the bezel off
            from the screen below it. */}
        <div className="ridge mt-3 h-2.5" aria-hidden />

        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}
