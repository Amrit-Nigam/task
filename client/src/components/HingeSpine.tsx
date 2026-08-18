/**
 * The spine the two halves fold about.
 *
 * On the physical device the hinge is the thickest part of the shell — a
 * barrel standing proud of both halves, catching light down one edge and
 * dropping into shadow on the other. Without it the two halves read as two
 * unrelated panels that happen to sit side by side; with it they read as one
 * object that opens.
 */
export function HingeSpine() {
  return (
    <div className="relative hidden w-6 shrink-0 self-stretch lg:block" aria-hidden>
      <span
        className="absolute inset-y-0 left-1/2 w-5 -translate-x-1/2 rounded-full border-[3px] border-[var(--pd-black)]"
        style={{
          background:
            "linear-gradient(90deg, var(--pd-ridge-b) 0%, var(--pd-ridge-a) 38%, var(--pd-ridge-a) 52%, var(--pd-ridge-b) 100%)",
        }}
      />
      {/* The barrel caps, top and bottom. */}
      <span className="absolute left-1/2 top-2 h-5 w-5 -translate-x-1/2 rounded-full border-[3px] border-[var(--pd-black)] bg-[var(--pd-ridge-b)]" />
      <span className="absolute bottom-2 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full border-[3px] border-[var(--pd-black)] bg-[var(--pd-ridge-b)]" />
    </div>
  );
}
