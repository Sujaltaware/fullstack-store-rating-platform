const StarRating = ({ value, onChange, readonly = false, size = 'md' }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className={`star-rating star-rating-${size}`}>
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          className={`star ${star <= value ? 'filled' : ''}`}
          onClick={() => !readonly && onChange && onChange(star)}
          disabled={readonly}
          aria-label={`${star} star`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

export default StarRating;
