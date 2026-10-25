/* Placeholder shown while GET /boards/:id/details is loading */
const Block = ({ className }) => (
  <div className={`animate-pulse rounded-md bg-muted ${className}`} />
);

const BoardSkeleton = () => (
  <div
    className="flex h-[calc(100dvh-5rem)] min-h-[480px] flex-col"
    aria-busy="true"
    aria-label="Loading board"
  >
    <div className="flex items-center justify-between pb-4">
      <div className="space-y-2">
        <Block className="h-6 w-56" />
        <Block className="h-4 w-80" />
      </div>
      <div className="flex gap-2">
        <Block className="h-8 w-24" />
        <Block className="h-8 w-24" />
      </div>
    </div>

    <div className="flex flex-1 items-start gap-3 overflow-hidden">
      {[3, 2, 1, 2].map((cards, index) => (
        <div
          key={index}
          className="w-72 shrink-0 space-y-2 rounded-xl border bg-muted/50 p-3"
        >
          <Block className="h-5 w-32" />
          {Array.from({ length: cards }).map((_, cardIndex) => (
            <Block key={cardIndex} className="h-20 w-full bg-card" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export default BoardSkeleton;
