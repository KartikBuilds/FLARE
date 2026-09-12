import {
  CoinAsset,
  JunctionBox,
  PipeSegment,
  ProtocolCore,
  VaultModule,
} from "@flare/ui/illustrations";

/**
 * The hero scene as line art.
 *
 * This is what a visitor keeps when WebGL is unavailable, reduced motion is
 * on, the device is constrained, or the scene chunk fails — so it carries the
 * same composition and the same argument as the 3D version: an asset enters
 * from the left, passes an intake checkpoint into the vault, and leaves by one
 * of two routes, only one of which is intact.
 */
export function HeroFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden">
      <div className="flex w-full max-w-5xl items-center gap-1 px-2 sm:gap-2">
        {/* Asset approaching */}
        <CoinAsset
          className="size-14 shrink-0 -rotate-6 text-ink sm:size-20 lg:size-24"
          decorative
        />
        <PipeSegment
          className="h-7 w-6 shrink-0 text-ink-soft sm:w-10 lg:w-14"
          preserveAspectRatio="none"
          decorative
        />

        {/* Intake checkpoint */}
        <JunctionBox
          className="size-14 shrink-0 text-ink-soft sm:size-20 lg:size-24"
          decorative
        />
        <PipeSegment
          className="h-7 w-6 shrink-0 text-ink-soft sm:w-10 lg:w-14"
          preserveAspectRatio="none"
          decorative
        />

        {/* The vault */}
        <VaultModule className="size-20 shrink-0 text-ink sm:size-28 lg:size-36" decorative />

        {/* Two routes out */}
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:gap-5">
          <PipeSegment
            className="h-6 w-full min-w-0 text-success sm:h-8"
            preserveAspectRatio="none"
            decorative
          />
          <PipeSegment
            broken
            className="h-6 w-full min-w-0 text-danger sm:h-8"
            preserveAspectRatio="none"
            decorative
          />
        </div>

        {/* Protocol core */}
        <ProtocolCore
          className="size-16 shrink-0 text-ink sm:size-24 lg:size-28"
          decorative
        />
      </div>
    </div>
  );
}
