type Props = {
  onPrev: () => void;
  onNext: () => void;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
};

export default function AdminPagination({ onPrev, onNext, prevDisabled, nextDisabled }: Props) {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <button
        className="btn btn-xs sm:btn-sm rounded-xl px-2 sm:px-3"
        type="button"
        onClick={onPrev}
        disabled={prevDisabled}
      >
        Prev
      </button>
      <button
        className="btn btn-xs sm:btn-sm rounded-xl px-2 sm:px-3"
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
      >
        Next
      </button>
    </div>
  );
}
